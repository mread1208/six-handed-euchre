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
    startGame: boolean;

    constructor(gameId, numberOfSeats, seats, startGame) {
        this.gameId = gameId;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.startGame = startGame;
    }
}
export class Seat {
    seatNumber: number;
    userId: string;
    userName: string;

    constructor(seatNumber, userId, userName) {
        this.seatNumber = seatNumber;
        this.userId = userId;
        this.userName = userName;
    }
}
const games: GameData[] = [];

const createNewRoom = function(roomId: string): GameData {
    const seat1 = new Seat(1, "", "");
    const seat2 = new Seat(2, "", "");
    const createGame = new GameData(roomId, 2, [seat1, seat2], false);
    games.push(createGame);

    return createGame;
};
const takeSeat = function(roomId: string, userId: string, userName: string, seatNumber: number): GameData {
    const gameIndex = games.findIndex(game => game.gameId === roomId);
    const seatIndex = games[gameIndex].seats.findIndex(seat => seat.seatNumber === seatNumber);
    // Check to see if user is already in a seat
    if (games[gameIndex].seats.find(seat => seat.userId === userId)) {
        console.error("User already in a seat!");
        // Throw error, "User already in seat {{i}}!"
        return games[gameIndex];
    }
    // Create new seat with user info, add to index.
    games[gameIndex].seats[seatIndex].userId = userId;
    games[gameIndex].seats[seatIndex].userName = userName;
    // Can the game start?
    const numberOfTakenSeats = games[gameIndex].seats.filter(seat => seat.userId !== "").length;
    games[gameIndex].startGame = games[gameIndex].seats.length === numberOfTakenSeats;

    return games[gameIndex];
};
const leaveSeat = function(roomId: string, userId: string): GameData {
    const gameIndex = games.findIndex(game => game.gameId === roomId);
    const seatIndex = games[gameIndex].seats.findIndex(seat => seat.userId === userId);
    // Check to see if user is in a seat
    if (seatIndex >= 0) {
        // Remove the user from the seat
        games[gameIndex].seats[seatIndex].userId = "";
        games[gameIndex].seats[seatIndex].userName = "";
    }
    return games[gameIndex];
};

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
        createNewRoom(newRoomId);
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
            let gameData = games.find(game => game.gameId === roomId);
            // If game doesn't exist, let's add to the array.
            if (gameData === undefined) {
                gameData = createNewRoom(roomId);
            }
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
        // Leave your seat if you're in one.
        const gameData: GameData = leaveSeat(roomId, socket.userId);
        // const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room => room.startsWith("game_"));
        gamesNamespace.emit("getGameData", gameData);
    });
    socket.on("getRoomNames", () => {
        const currentGameRooms = Object.keys(io.of("/games").adapter.rooms).filter(room => room.startsWith("game_"));
        io.emit("getRoomNames", currentGameRooms);
    });

    socket.on("takeSeat", (roomId, seatNumber) => {
        const gameData: GameData = takeSeat(roomId, socket.userId, socket.username, seatNumber);
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
