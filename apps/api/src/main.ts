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

export class Room {
    id: string;
    name: string;
    gameUsersData: GameUsersData[];
}
export class GameUsersData {
    gameUser: GameUser;
    userSocket: Socket;
}

export class GameUser {
    accessToken: string;
    userId: string;
    email: string;
    name: string;
}

const rooms: Room[] = [];

const joinRoom = (socket: Socket, room: Room, gameUser: GameUser) => {
    room.gameUsersData.push({ gameUser: gameUser, userSocket: socket });
    socket.join(room.id, () => {
        console.log(gameUser.name, "joined", room.id);
    });
};
const leaveRoom = (socket: Socket, room: Room, gameUser: GameUser) => {
    // Get the index of the room we need to update
    const roomUpdateIndex = rooms
        .map(function(currRoom) {
            return currRoom.id;
        })
        .indexOf(room.id);
    // Get the index of the user we need to remove
    const removedUserIndex = room.gameUsersData
        .map(function(currGameUser) {
            return currGameUser.gameUser.userId;
        })
        .indexOf(gameUser.userId);
    // Remove that index from the global rooms gameUsersData array
    rooms[roomUpdateIndex].gameUsersData.splice(removedUserIndex, 1);

    socket.leave(room.id, () => {
        console.log(gameUser.name, "left", room.id);
    });
};
const getRoomUserNames = (gamesUsersData: GameUsersData[]) => {
    const gameUsersNames = [];
    gamesUsersData.forEach(gameUserData => {
        gameUsersNames.push(gameUserData.gameUser.name);
    });
    return gameUsersNames;
};
const getRoomNames = () => {
    const roomNames = [];
    rooms.forEach(room => {
        roomNames.push({ id: room.id, name: room.name });
    });
    return roomNames;
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
// Socket IO stuff
io.on(`connection`, function(socket) {
    // socket.id = uuid();
    console.log("a user connected");

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

    socket.on("setSocketId", data => {
        console.log(data);
        // io.emit("getRoomNames", getRoomNames());
    });
    socket.on("joinGamesDashboard", () => {
        io.emit("getRoomNames", getRoomNames());
    });
    socket.on("createRoom", roomName => {
        const room: Room = {
            id: uuid(), // generate a unique id for the new room, that way we don't need to deal with duplicates.
            name: roomName,
            gameUsersData: [],
        };
        rooms.push(room);
        io.emit("getRoomNames", getRoomNames());
    });

    socket.on("joinRoom", (roomId, userId) => {
        const roomToJoin = rooms.find(room => room.id === roomId);
        joinRoom(socket, roomToJoin, userId);
        // Gets a list of all clients in the room
        io.in(roomId).clients((error, clients) => {
            if (error) throw error;
            console.log(clients);
        });
        io.to(roomId).emit("getRoomGameUsers", getRoomUserNames(roomToJoin.gameUsersData));
    });
    socket.on("leaveRoom", (roomId, userId) => {
        const roomToJoin = rooms.find(room => room.id === roomId);
        leaveRoom(socket, roomToJoin, userId);
        io.to(roomId).emit("getRoomGameUsers", getRoomUserNames(roomToJoin.gameUsersData));
    });
    socket.on("getRoomNames", () => {
        io.emit("getRoomNames", getRoomNames());
    });
    socket.on("getRoomGameUsers", roomId => {
        const roomToJoin = rooms.find(room => room.id === roomId);
        io.to(roomId).emit("getRoomGameUsers", getRoomUserNames(roomToJoin.gameUsersData));
    });

    socket.on(`disconnect`, function() {
        // console.log(socket.id);
    });
});
