import * as express from "express";

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

const rooms = {};
const joinRoom = (socket, room) => {
    room.sockets.push(socket);
    socket.join(room.id, () => {
        // store the room id in the socket for future use
        socket.roomId = room.id;
        console.log(socket.id, "Joined", room.id);
    });
};
const getRoomNames = () => {
    const roomNames = [];
    for (const id in rooms) {
        const { name } = rooms[id];
        const room = { name, id };
        roomNames.push(room);
    }
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
    socket.id = uuid();
    console.log("a user connected");

    /**
     * Lets us know that players have joined a room and are waiting in the waiting room.
     */
    socket.on("ready", () => {
        console.log(socket.id, "is ready!");
        const room = rooms[socket.roomId];
        // when we have two players... START THE GAME!
        if (room.sockets.length == 2) {
            // tell each player to start the game.
            for (const client of room.sockets) {
                client.emit("initGame");
            }
        }
    });

    socket.on("joinRoom", roomId => {
        const room = rooms[roomId];
        joinRoom(socket, room);
        // callback();
    });
    socket.on("getRoomNames", () => {
        io.emit("getRoomNames", getRoomNames());
    });
    socket.on("createRoom", roomName => {
        const room = {
            id: uuid(), // generate a unique id for the new room, that way we don't need to deal with duplicates.
            name: roomName,
            sockets: [],
        };
        rooms[room.id] = room;
        io.emit("getRoomNames", getRoomNames());
        // have the socket join the room they've just created.
        joinRoom(socket, room);
        // callback();
    });

    socket.on(`disconnect`, function() {});
});
