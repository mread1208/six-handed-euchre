import * as express from "express";
import { Socket } from "socket.io";
import { GameData, Seat, Card, GameDataResponse, SeatsResponse, Turn, Turns } from "./app/models/GameData";

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

// Game Models

const games: GameData[] = [];

// Game Logic
const createNewRoom = function(roomId: string, gameName: string): GameData {
    const seat1 = new Seat(1, "", "", false, [], 0);
    const seat2 = new Seat(2, "", "", false, [], 0);
    const turns = new Turns([]);
    const createGame = new GameData(roomId, gameName, 2, [seat1, seat2], false, false, false, [turns]);

    // Push game logic to main array
    games.push(createGame);
    // Send client back massaged data
    return createGame;
};
const takeSeat = function(
    roomId: string,
    userId: string,
    userName: string,
    socketId: string,
    seatNumber: number
): GameDataResponse {
    const gameIndex = games.findIndex(game => game.gameId === roomId);
    const currGame: GameData = games[gameIndex];
    const seatIndex = currGame.seats.findIndex(seat => seat.seatNumber === seatNumber);
    // If the game hasn't started yet, it's nobody's turn
    let currentGameSeatTurn = 1;
    currGame.seats.forEach(seat => {
        if (seat.isYourTurn) {
            currentGameSeatTurn = seat.seatNumber;
        }
    });
    const isYourTurn = currentGameSeatTurn === seatNumber;
    const yourHand = currGame.seats[seatIndex].hand;

    const lastTurn = currGame.turns[currGame.turns.length - 1];

    // Check to see if user is already in a seat
    if (currGame.seats.find(seat => seat.userId === userId)) {
        console.error("User already in a seat!");
        // Throw error, "User already in seat {{i}}!"
        return new GameDataResponse(
            roomId,
            currGame.gameName,
            currGame.numberOfSeats,
            currGame.canStartGame,
            currGame.hasGameStarted,
            currGame.isDuringTurn,
            currGame.seats,
            isYourTurn,
            yourHand,
            lastTurn
        );
    }
    // Create new seat with user info, add to index.
    currGame.seats[seatIndex].userId = userId;
    currGame.seats[seatIndex].userName = userName;
    currGame.seats[seatIndex].socketId = socketId;

    // Can the game start?
    const numberOfTakenSeats = currGame.seats.filter(seat => seat.userId !== "").length;
    currGame.canStartGame = currGame.seats.length === numberOfTakenSeats;

    // Seats for Frontend
    const seatsResponse: SeatsResponse[] = [];
    currGame.seats.forEach(seat => {
        seatsResponse.push(new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score));
    });

    // Update the main game state
    games[gameIndex] = currGame;

    return new GameDataResponse(
        roomId,
        currGame.gameName,
        currGame.numberOfSeats,
        currGame.canStartGame,
        currGame.hasGameStarted,
        currGame.isDuringTurn,
        seatsResponse,
        isYourTurn,
        yourHand,
        lastTurn
    );
};
const leaveSeat = function(roomId: string, userId: string): GameDataResponse {
    const gameIndex = games.findIndex(game => game.gameId === roomId);
    const currGame: GameData = games[gameIndex];
    const seatIndex = currGame.seats.findIndex(seat => seat.userId === userId);
    // Check to see if user is in a seat
    if (seatIndex >= 0) {
        // Remove the user from the seat
        currGame.seats[seatIndex].userId = "";
        currGame.seats[seatIndex].userName = "";
    }

    const numberOfTakenSeats = currGame.seats.filter(seat => seat.userId !== "").length;
    currGame.canStartGame = currGame.seats.length === numberOfTakenSeats;

    // Seats for Frontend
    const seatsResponse: SeatsResponse[] = [];
    currGame.seats.forEach(seat => {
        seatsResponse.push(new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score));
    });

    const lastTurn = currGame.turns[currGame.turns.length - 1];

    // Update the main game state
    games[gameIndex] = currGame;

    return new GameDataResponse(
        roomId,
        currGame.gameName,
        currGame.numberOfSeats,
        currGame.canStartGame,
        currGame.hasGameStarted,
        currGame.isDuringTurn,
        seatsResponse,
        false,
        [],
        lastTurn
    );
};

const startGame = function(roomId: string, userId: string): GameData {
    const gameIndex = games.findIndex(game => game.gameId === roomId);
    const currGame: GameData = games[gameIndex];
    const newDeck = getDeck();
    const newShuffledDeck: Card[] = shuffleDeck(newDeck);

    currGame.hasGameStarted = true;
    currGame.deck = newShuffledDeck;

    // distribute the shuffled deck evenly amongst players
    let playerCount = 0;
    for (let i = 0; i < newShuffledDeck.length; i++) {
        // Reset the player count when it hits the last player to distribute the cards evenly
        if (playerCount === currGame.numberOfSeats) {
            playerCount = 0;
        }
        currGame.seats[playerCount].hand.push(newShuffledDeck[i]);
        playerCount++;
    }

    // Set the starting players turn, always player 1 at the start of a game
    for (let p = 0; p < currGame.seats.length; p++) {
        currGame.seats[p].isYourTurn = currGame.seats[p].seatNumber === 1;
    }

    // Seats for Frontend
    const seatsResponse: SeatsResponse[] = [];
    currGame.seats.forEach(seat => {
        seatsResponse.push(new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score));
    });

    // Update the main game state
    games[gameIndex] = currGame;

    return currGame;
};

const takeYourTurn = function(roomId: string, userId: string): GameData {
    const gameIndex = games.findIndex(game => game.gameId === roomId);
    const currGame: GameData = games[gameIndex];
    const currUserSeat = currGame.seats.find(seat => seat.userId === userId);

    // Verify it's actually this player's turn
    const currentSeatTurnIndex = currGame.seats.findIndex(seat => seat.seatNumber === currUserSeat.seatNumber);
    if (currGame.seats[currentSeatTurnIndex].userId !== userId) {
        // TODO: Return an error!
        console.error("It's not your time breh!");
        return currGame;
    }

    // Set game state to "isDuringTurn"
    currGame.isDuringTurn = true;

    // Add seat and card to the Turn
    const updateTurn = new Turn(currUserSeat.seatNumber, currUserSeat.hand[0]);
    currGame.turns[currGame.turns.length - 1].turn.push(updateTurn);

    // Remove the card played from the players hand
    currGame.seats[currentSeatTurnIndex].hand.shift();

    // If last seat in game, then player 1's turn.
    let nextSeatTurn = currUserSeat.seatNumber + 1 > currGame.seats.length ? 1 : currUserSeat.seatNumber + 1;

    // If turns === seats, the turn is over.
    if (currGame.turns[currGame.turns.length - 1].turn.length === currGame.seats.length) {
        const winningHand = getWinningHand(currGame.turns[currGame.turns.length - 1].turn);
        // Update game state
        currGame.isDuringTurn = false;

        const newTurns = new Turns([]);
        // Create new turn object
        currGame.turns.push(newTurns);
        // Reset nextSeat to the winning hand
        nextSeatTurn = winningHand.seatNumber;

        // Loop through seats and update player scores
        for (let p = 0; p < currGame.seats.length; p++) {
            if (currGame.seats[p].seatNumber === winningHand.seatNumber) {
                currGame.seats[p].score = currGame.seats[p].score + 1;
            }
        }
    }

    // Loop through seats and set player turns
    for (let p = 0; p < currGame.seats.length; p++) {
        currGame.seats[p].isYourTurn = currGame.seats[p].seatNumber === nextSeatTurn;
    }

    // Update the main game state
    games[gameIndex] = currGame;

    return currGame;
};

const getWinningHand = function(turns: Turn[]): Turn {
    // High card wins
    const winner = turns.reduce((accumulator, currentValue) => {
        if (currentValue.card.cardValue === accumulator.card.cardValue) {
            // For now, if cards match... first one wins
            return accumulator;
        } else if (
            currentValue.card.cardValue === "A" ||
            currentValue.card.cardValue === "K" ||
            currentValue.card.cardValue === "Q" ||
            currentValue.card.cardValue === "J"
        ) {
            // Check face cards
            if (
                accumulator.card.cardValue !== "A" &&
                accumulator.card.cardValue !== "K" &&
                accumulator.card.cardValue !== "Q" &&
                accumulator.card.cardValue !== "J"
            ) {
                // If prev card is not a face card, new card wins
                return currentValue;
            } else {
                // We already checked matching values
                // Compare the face cards
                if (currentValue.card.cardValue === "A" && accumulator.card.cardValue !== "A") {
                    // Ace always wins
                    return currentValue;
                } else if (
                    currentValue.card.cardValue === "K" &&
                    accumulator.card.cardValue !== "A" &&
                    accumulator.card.cardValue !== "K"
                ) {
                    return currentValue;
                } else if (
                    currentValue.card.cardValue === "Q" &&
                    accumulator.card.cardValue !== "A" &&
                    accumulator.card.cardValue !== "K" &&
                    accumulator.card.cardValue !== "Q"
                ) {
                    return currentValue;
                } else if (
                    currentValue.card.cardValue === "J" &&
                    accumulator.card.cardValue !== "A" &&
                    accumulator.card.cardValue !== "K" &&
                    accumulator.card.cardValue !== "Q" &&
                    accumulator.card.cardValue !== "J"
                ) {
                    // This state shouldn't happen since we checked to make sure it was a face card.
                    return currentValue;
                } else {
                    return accumulator;
                }
            }
        } else if (
            accumulator.card.cardValue === "A" ||
            accumulator.card.cardValue === "K" ||
            accumulator.card.cardValue === "Q" ||
            accumulator.card.cardValue === "J"
        ) {
            // If accumulator is a face card, and current card isn't... accumulator wins
            return accumulator;
        } else {
            // Higher number wins
            return currentValue.card.cardValue > accumulator.card.cardValue ? currentValue : accumulator;
        }
    });
    return winner;
};

// Helper functions
const suits = ["spades", "diamonds", "clubs", "hearts"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
function getDeck(): Card[] {
    const deck: Card[] = new Array();

    for (let i = 0; i < suits.length; i++) {
        for (let x = 0; x < values.length; x++) {
            const card: Card = { cardValue: values[x], suit: suits[i] };
            deck.push(card);
        }
    }

    return deck;
}
function shuffleDeck(deck): Card[] {
    // for 1000 turns
    // switch the values of two random cards
    for (let i = 0; i < 1000; i++) {
        const location1 = Math.floor(Math.random() * deck.length);
        const location2 = Math.floor(Math.random() * deck.length);
        const tmp = deck[location1];

        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }

    return deck;
}

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
        gamesNamespace.emit("getRoomNames", games);
    });
    socket.on("createRoom", gameName => {
        // Prefix all games with game_ so we can identify which sockets are games.
        const newRoomId = `game_${uuid()}`;
        createNewRoom(newRoomId, gameName);
        gamesNamespace.emit("joinNewRoom", newRoomId);
    });

    socket.on("joinRoom", roomId => {
        if (socket.username === undefined) {
            gamesNamespace.to(roomId).emit("refreshSocketUserData");
        }
        socket.join(roomId, () => {
            // Send game data on joining of room
            let gameData = games.find(game => game.gameId === roomId);
            // If game doesn't exist, let's add to the array.
            if (gameData === undefined) {
                gameData = createNewRoom(roomId, roomId);
            }
            gamesNamespace.emit("getGameData", gameData);
            // Why are we sending room names when we join?
            gamesNamespace.emit("getRoomNames", games);
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
            gamesNamespace.emit("getRoomNames", games);
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
        const gameData: GameDataResponse = leaveSeat(roomId, socket.userId);
        gamesNamespace.emit("getGameData", gameData);
    });
    socket.on("getRoomNames", () => {
        io.emit("getRoomNames", games);
    });

    socket.on("takeSeat", (roomId, seatNumber) => {
        const gameData: GameDataResponse = takeSeat(roomId, socket.userId, socket.username, socket.id, seatNumber);
        gamesNamespace.emit("getGameData", gameData);
    });
    socket.on("leaveSeat", roomId => {
        const gameData: GameDataResponse = leaveSeat(roomId, socket.userId);
        gamesNamespace.emit("getGameData", gameData);
    });
    socket.on("startGame", roomId => {
        const gameData: GameData = startGame(roomId, socket.userId);
        const gameDataResponseSeats: SeatsResponse[] = gameData.seats.map(seat => {
            return new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score);
        });
        // Send hands to each user.
        gameData.seats.forEach(seat => {
            const seatGameData = new GameDataResponse(
                roomId,
                gameData.gameName,
                gameData.numberOfSeats,
                gameData.canStartGame,
                gameData.hasGameStarted,
                gameData.isDuringTurn,
                gameDataResponseSeats,
                seat.isYourTurn,
                seat.hand,
                new Turns([])
            );
            gamesNamespace.to(seat.socketId).emit("getGameData", seatGameData);
        });
    });
    socket.on("takeYourTurn", roomId => {
        const gameData: GameData = takeYourTurn(roomId, socket.userId);
        const gameDataResponseSeats: SeatsResponse[] = gameData.seats.map(seat => {
            return new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score);
        });
        const lastTurn = gameData.turns[gameData.turns.length - 1];
        // Send hands to each user.
        gameData.seats.forEach(seat => {
            const seatGameData = new GameDataResponse(
                roomId,
                gameData.gameName,
                gameData.numberOfSeats,
                gameData.canStartGame,
                gameData.hasGameStarted,
                gameData.isDuringTurn,
                gameDataResponseSeats,
                seat.isYourTurn,
                seat.hand,
                lastTurn
            );
            gamesNamespace.to(seat.socketId).emit("getGameData", seatGameData);
        });
    });

    socket.on(`disconnecting`, function() {
        const self = this;
        const dcRooms = Object.keys(self.rooms);
        dcRooms.forEach(function(dcRoom) {
            self.to(dcRoom).emit("user left", self.id + "left");
        });
    });
});
