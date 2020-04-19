import * as express from "express";
import { Socket } from "socket.io";

const config = require("./app/common/config/env.config.js");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid/v1");

const AuthorizationRouter = require("./app/authorization/routes.config");
const UsersRouter = require("./app/users/routes.config");
const GamesRouter = require("./app/games/routes.config");

app.get("/api", (req, res) => {
    res.send({ message: "Welcome to api!" });
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Expose-Headers", "Content-Length");
    res.header("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Requested-With, Range");
    if (req.method === "OPTIONS") {
        return res.send(200);
    } else {
        return next();
    }
});

app.use(bodyParser.json());
AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);
GamesRouter.routesConfig(app);

// route for handling 404 requests(unavailable routes)
app.use(function(req, res, next) {
    res.status(404).send(`Sorry can't find that!`);
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);

// Game logic
export class GameData {
    gameId: string;
    numberOfSeats: number;
    seats: Seat[];

    constructor(gameId, numberOfSeats, seats) {
        this.gameId = gameId;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
    }
}
export class Seat {
    seatNumber: number;
    userId: string;

    constructor(seatNumber, userId) {
        this.seatNumber = seatNumber;
        this.userId = userId;
    }
}
const games: GameData[] = [];

const takeSeat = function(roomId: string, userId: string, seatNumber: number): GameData {
    const gameIndex = games.findIndex(game => game.gameId === roomId);
    const seatIndex = games[gameIndex].seats.findIndex(seat => seat.seatNumber === seatNumber);
    // Check to see if user is already in a seat
    if (games[gameIndex].seats.find(seat => seat.userId === userId)) {
        // Throw error, "User already in seat {{i}}!"
        return games[gameIndex];
    }

    // Create new seat with user info, add to index.
    games[gameIndex].seats[seatIndex].userId = userId;
    console.log(games[gameIndex]);
    return games[gameIndex];
};

// const leaveRooms = socket => {
//     const roomsToDelete = [];
//     for (const id in rooms) {
//         const room = rooms[id];
//         // check to see if the socket is in the current room
//         if (room.sockets.includes(socket)) {
//             socket.leave(id);
//             // remove the socket from the room object
//             room.sockets = room.sockets.filter(item => item !== socket);
//         }
//         // Prepare to delete any rooms that are now empty
//         if (room.sockets.length == 0) {
//             roomsToDelete.push(room);
//         }
//     }

//     // Delete all the empty rooms that we found earlier
//     for (const room of roomsToDelete) {
//         delete rooms[room.id];
//     }
// };
// const checkScore = (room, sendMessage = false) => {
//     let winner = null;
//     for (const client of room.sockets) {
//         if (client.score >= NUM_ROUNDS) {
//             winner = client;
//             break;
//         }
//     }

//     if (winner) {
//         if (sendMessage) {
//             for (const client of room.sockets) {
//                 client.emit("gameOver", client.id === winner.id ? "You won the game!" : "You lost the game :(");
//             }
//         }

//         return true;
//     }

//     return false;
// };

const io = require(`socket.io`)(server);
const gamesNamespace = io.of("/games");
// Socket IO stuff
io.on(`connection`, function(socket) {
    console.log("a user connected to the main namespace");
    /**
     * Lets us know that players have joined a room and are waiting in the waiting room.
     */
    // socket.on("ready", () => {
    //     console.log(socket.id, "is ready!");
    //     const room = rooms[socket.roomId];
    //     // when we have two players... START THE GAME!
    //     if (room.sockets.length == 2) {
    //         // tell each player to start the game.
    //         for (const client of room.sockets) {
    //             client.emit("initGame");
    //         }
    //     }
    // });
});

gamesNamespace.on(`connection`, function(socket) {
    console.log("a user connected to the games namespace");

    socket.on("setSocketUserData", data => {
        socket.username = data.name;
        socket.userId = data.userId;
    });
    socket.on("joinGamesDashboard", () => {
        const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room => room.startsWith("game_"));
        gamesNamespace.emit("getRoomNames", currentGameRooms);
    });
    socket.on("createRoom", () => {
        // Prefix all games with game_ so we can identify which sockets are games.
        const newRoomId = `game_${uuid()}`;
        const seat1 = new Seat(1, "");
        const seat2 = new Seat(2, "");
        const createGame = new GameData(newRoomId, 2, [seat1, seat2]);
        games.push(createGame);
        gamesNamespace.emit("joinNewRoom", newRoomId);
    });

    socket.on("joinRoom", roomId => {
        if (socket.username === undefined) {
            gamesNamespace.to(roomId).emit("refreshSocketUserData");
        }
        socket.join(roomId, () => {
            console.log(socket.username, "joined", roomId);
            const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room =>
                room.startsWith("game_")
            );
            // Send game data on joining of room
            const gameData = games.find(game => game.gameId === roomId);
            gamesNamespace.emit("getGameData", gameData);
            // Why are we sending room names when we join?
            gamesNamespace.emit("getRoomNames", currentGameRooms);
        });
        // Gets a list of all clients in the room
        gamesNamespace.in(roomId).clients((error, clients) => {
            if (error) throw error;
            const gameUsersNames = [];
            clients.forEach(socketId => {
                gameUsersNames.push(gamesNamespace.sockets[socketId].username);
            });
            gamesNamespace.to(roomId).emit("getRoomGameUsers", gameUsersNames);
        });
    });
    socket.on("leaveRoom", roomId => {
        console.log(socket.username, "left", roomId);
        socket.leave(roomId, () => {
            const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room =>
                room.startsWith("game_")
            );
            gamesNamespace.emit("getRoomNames", currentGameRooms);
        });
        // Gets a list of all clients in the room
        gamesNamespace.in(roomId).clients((error, clients) => {
            if (error) throw error;
            const gameUsersNames = [];
            clients.forEach(socketId => {
                gameUsersNames.push(gamesNamespace.sockets[socketId].username);
            });
            gamesNamespace.to(roomId).emit("getRoomGameUsers", gameUsersNames);
        });
    });
    socket.on("getRoomNames", () => {
        const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room => room.startsWith("game_"));
        io.emit("getRoomNames", currentGameRooms);
    });

    socket.on("takeSeat", (roomId, seatNumber) => {
        const gameData: GameData = takeSeat(roomId, socket.userId, seatNumber);
        // const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room => room.startsWith("game_"));
        gamesNamespace.emit("getGameData", gameData);
    });
    socket.on("startGame", roomId => {
        console.log(roomId);
        console.log(socket.id);
        // const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room => room.startsWith("game_"));
        // io.emit("getRoomNames", currentGameRooms);
    });

    socket.on(`disconnecting`, function() {
        const self = this;
        const dcRooms = Object.keys(self.rooms);
        dcRooms.forEach(function(dcRoom) {
            self.to(dcRoom).emit("user left", self.id + "left");
        });
    });
});
