import { Socket } from "dgram";
import { Server as HttpServer } from "http";
import { Namespace, Server } from "socket.io";
import { v1 as uuid } from 'uuid';

import {
    GameData,
    Seat,
    Card,
    GameDataResponse,
    SeatsResponse,
    Turn,
    Turns,
    GameState,
    TurnState,
} from "./app/models/GameData";

class Game {
    private server: HttpServer;
    private games: GameData[];

    constructor(server: HttpServer) {
        this.server = server;
        this.games = [];
    }

    public init() {
        const _this = this;
        const io = new Server(this.server, {
            cors: {
                origin: "http://localhost:4200",
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        const gamesNamespace: Namespace = io.of("/games");
        // Socket IO stuff
        io.on(`connection`, function(socket) {
            console.log("a user connected to the main namespace");
        });

        gamesNamespace.on(`connection`, function(socket: any) {
            console.log("a user connected to the games namespace");

            // Replace with io.use!
            socket.on("setSocketUserData", data => {
                socket.username = data.email;
                socket.userId = data._id;
            });
            socket.on("joinGamesDashboard", () => {
                gamesNamespace.emit("getRoomNames", _this.games);
            });
            socket.on("createRoom", gameName => {
                // Prefix all games with game_ so we can identify which sockets are games.
                const newRoomId = `game_${uuid()}`;
                console.log(newRoomId);
                _this.createNewRoom(newRoomId, gameName);
                gamesNamespace.emit("joinNewRoom", newRoomId);
            });

            socket.on("joinRoom", roomId => {
                if (socket.username === undefined) {
                    gamesNamespace.to(roomId).emit("refreshSocketUserData");
                }
                socket.join(roomId, () => {
                    // Send game data on joining of room
                    let gameData = _this.games.find(game => game.gameId === roomId);
                    // If game doesn't exist, let's add to the array.
                    if (gameData === undefined) {
                        gameData = _this.createNewRoom(roomId, roomId);
                    }
                    gamesNamespace.emit("getGameData", gameData);
                    // Why are we sending room names when we join?
                    gamesNamespace.emit("getRoomNames", _this.games);
                });
                // Gets a list of all clients in the room
                gamesNamespace.in(roomId).allSockets().then((clients) => {
                    const gameUsersNames = [];
                    console.log(gamesNamespace.sockets);
                    clients.forEach(socketId => {
                        console.log(socketId);
                        gameUsersNames.push(gamesNamespace.sockets[socketId].user.username);
                    });
                    gamesNamespace.to(roomId).emit("getRoomGameUsers", gameUsersNames);
                });
            });
            socket.on("leaveRoom", roomId => {
                console.log(socket.username, "left", roomId);
                socket.leave(roomId, () => {
                    gamesNamespace.emit("getRoomNames", _this.games);
                });
                // Gets a list of all clients in the room
                gamesNamespace.in(roomId).allSockets().then((clients) => {
                    const gameUsersNames = [];
                    clients.forEach(socketId => {
                        gameUsersNames.push(gamesNamespace.sockets[socketId].username);
                    });
                    gamesNamespace.to(roomId).emit("getRoomGameUsers", gameUsersNames);
                });
                // Leave your seat if you're in one.
                const gameData: GameDataResponse = _this.leaveSeat(roomId, socket.userId);
                gamesNamespace.emit("getGameData", gameData);
            });
            socket.on("getRoomNames", () => {
                io.emit("getRoomNames", _this.games);
            });

            socket.on("takeSeat", (roomId, seatNumber) => {
                const gameData: GameDataResponse = _this.takeSeat(roomId, socket.userId, socket.username, socket.id, seatNumber);
                gamesNamespace.emit("getGameData", gameData);
            });
            socket.on("leaveSeat", roomId => {
                const gameData: GameDataResponse = _this.leaveSeat(roomId, socket.userId);
                gamesNamespace.emit("getGameData", gameData);
            });
            socket.on("startGame", roomId => {
                const gameData: GameData = _this.startGame(roomId, socket.userId);
                const gameDataResponseSeats: SeatsResponse[] = gameData.seats.map(seat => {
                    return new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score);
                });
                // Send hands to each user.
                gameData.seats.forEach(seat => {
                    const seatGameData = new GameDataResponse(
                        roomId,
                        gameData.gameName,
                        gameData.numberOfSeats,
                        gameData.gameState,
                        gameDataResponseSeats,
                        seat.isYourTurn,
                        seat.hand,
                        new Turns([], TurnState.TURN_WAITING_START)
                    );
                    gamesNamespace.to(seat.socketId).emit("getGameData", seatGameData);
                });
            });
            socket.on("takeYourTurn", roomId => {
                const gameData: GameData = _this.takeYourTurn(roomId, socket.userId);
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
                        gameData.gameState,
                        gameDataResponseSeats,
                        seat.isYourTurn,
                        seat.hand,
                        lastTurn
                    );
                    gamesNamespace.to(seat.socketId).emit("getGameData", seatGameData);
                });
                // If turn is over... wait and start the next turn
                // so that we can see the cards played before cleaning the hand
                if (lastTurn.turnState === TurnState.TURN_END) {
                    setTimeout(() => {
                        const nextTurnGameData = _this.endTurn(roomId);
                        const endTurnGameDataResponseSeats: SeatsResponse[] = gameData.seats.map(seat => {
                            return new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score);
                        });
                        // Send hands to each user.
                        gameData.seats.forEach(seat => {
                            const seatGameData = new GameDataResponse(
                                roomId,
                                nextTurnGameData.gameName,
                                nextTurnGameData.numberOfSeats,
                                nextTurnGameData.gameState,
                                endTurnGameDataResponseSeats,
                                seat.isYourTurn,
                                seat.hand,
                                nextTurnGameData.turns[gameData.turns.length - 1]
                            );
                            gamesNamespace.to(seat.socketId).emit("getGameData", seatGameData);
                        });
                    }, 2000);
                }
            });

            socket.on(`disconnecting`, function() {
                const self = this;
                const dcRooms = Object.keys(self.rooms);
                dcRooms.forEach(function(dcRoom) {
                    self.to(dcRoom).emit("user left", self.id + "left");
                });
            });
        });
    }

    // Helper functions
    public getDeck = (): Card[] => {
        const suits = ["spades", "diamonds", "clubs", "hearts"];
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        const deck: Card[] = new Array();

        for (let i = 0; i < suits.length; i++) {
            for (let x = 0; x < values.length; x++) {
                const card: Card = { cardValue: values[x], suit: suits[i] };
                deck.push(card);
            }
        }

        return deck;
    }
    public shuffleDeck = (deck): Card[] => {
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

    // Game Logic
    private createNewRoom(roomId: string, gameName: string): GameData {
        const seat1 = new Seat(1, "", "", false, [], 0);
        const seat2 = new Seat(2, "", "", false, [], 0);
        const turns = new Turns([], TurnState.TURN_WAITING_START);
        const createGame = new GameData(roomId, gameName, 2, [seat1, seat2], GameState.GAME_WAITING_PLAYERS, [turns]);

        // Push game logic to main array
        this.games.push(createGame);
        // Send client back massaged data
        return createGame;
    };
    private takeSeat = (
        roomId: string,
        userId: string,
        userName: string,
        socketId: string,
        seatNumber: number
    ): GameDataResponse => {
        const gameIndex = this.games.findIndex(game => game.gameId === roomId);
        const currGame: GameData = this.games[gameIndex];
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
                currGame.gameState,
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
        currGame.gameState =
            currGame.seats.length === numberOfTakenSeats ? GameState.GAME_WAITING_START : GameState.GAME_WAITING_PLAYERS;

        // Seats for Frontend
        const seatsResponse: SeatsResponse[] = [];
        currGame.seats.forEach(seat => {
            seatsResponse.push(new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score));
        });

        // Update the main game state
        this.games[gameIndex] = currGame;

        return new GameDataResponse(
            roomId,
            currGame.gameName,
            currGame.numberOfSeats,
            currGame.gameState,
            seatsResponse,
            isYourTurn,
            yourHand,
            lastTurn
        );
    };
    private leaveSeat = (roomId: string, userId: string): GameDataResponse => {
        const gameIndex = this.games.findIndex(game => game.gameId === roomId);
        const currGame: GameData = this.games[gameIndex];
        const seatIndex = currGame.seats.findIndex(seat => seat.userId === userId);
        // Check to see if user is in a seat
        if (seatIndex >= 0) {
            // Remove the user from the seat
            currGame.seats[seatIndex].userId = "";
            currGame.seats[seatIndex].userName = "";
        }

        // Can the game start?
        const numberOfTakenSeats = currGame.seats.filter(seat => seat.userId !== "").length;
        currGame.gameState =
            currGame.seats.length === numberOfTakenSeats ? GameState.GAME_WAITING_START : GameState.GAME_WAITING_PLAYERS;

        // Seats for Frontend
        const seatsResponse: SeatsResponse[] = [];
        currGame.seats.forEach(seat => {
            seatsResponse.push(new SeatsResponse(seat.seatNumber, seat.userId, seat.userName, seat.isYourTurn, seat.score));
        });

        const lastTurn = currGame.turns[currGame.turns.length - 1];

        // Update the main game state
        this.games[gameIndex] = currGame;

        return new GameDataResponse(
            roomId,
            currGame.gameName,
            currGame.numberOfSeats,
            currGame.gameState,
            seatsResponse,
            false,
            [],
            lastTurn
        );
    };

    private startGame = (roomId: string, userId: string): GameData => {
        const gameIndex = this.games.findIndex(game => game.gameId === roomId);
        const currGame: GameData = this.games[gameIndex];
        const newDeck = this.getDeck();
        const newShuffledDeck: Card[] = this.shuffleDeck(newDeck);

        currGame.gameState = GameState.GAME_IN_PROGRESS;
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
        this.games[gameIndex] = currGame;

        return currGame;
    };

    private takeYourTurn = (roomId: string, userId: string): GameData => {
        const gameIndex = this.games.findIndex(game => game.gameId === roomId);
        const currGame: GameData = this.games[gameIndex];
        const currUserSeat = currGame.seats.find(seat => seat.userId === userId);
        const currTurn = currGame.turns[currGame.turns.length - 1];

        // Verify it's actually this player's turn
        const currentSeatTurnIndex = currGame.seats.findIndex(seat => seat.seatNumber === currUserSeat.seatNumber);
        if (currGame.seats[currentSeatTurnIndex].userId !== userId) {
            // TODO: Return an error!
            console.error("It's not your time breh!");
            return currGame;
        }

        // Add seat and card to the Turn
        const updateTurn = new Turn(currUserSeat.seatNumber, currUserSeat.hand[0]);
        currTurn.turnState = TurnState.TURN_IN_PROGRESS;
        currTurn.turn.push(updateTurn);

        // Remove the card played from the players hand
        currGame.seats[currentSeatTurnIndex].hand.shift();

        // If turns === seats, the turn is over.
        if (currTurn.turn.length === currGame.seats.length) {
            currTurn.turnState = TurnState.TURN_END;
            // Loop through seats and set player turns to false
            for (let p = 0; p < currGame.seats.length; p++) {
                currGame.seats[p].isYourTurn = false;
            }
        } else {
            // If last seat in game, then player 1's turn.
            const nextSeatTurn = currUserSeat.seatNumber + 1 > currGame.seats.length ? 1 : currUserSeat.seatNumber + 1;
            // Loop through seats and set player turns
            for (let j = 0; j < currGame.seats.length; j++) {
                currGame.seats[j].isYourTurn = currGame.seats[j].seatNumber === nextSeatTurn;
            }
        }

        // Update the main game state
        this.games[gameIndex] = currGame;

        return currGame;
    };

    private getWinningHand = (turns: Turn[]): Turn => {
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

    private endTurn = (roomId: string): GameData => {
        const gameIndex = this.games.findIndex(game => game.gameId === roomId);
        const currGame: GameData = this.games[gameIndex];
        const currentTurn = currGame.turns[currGame.turns.length - 1];
        const winningHand = this.getWinningHand(currentTurn.turn);

        // Should be set already... but meh.
        currentTurn.turnState = TurnState.TURN_END;

        // Loop through seats and set player turns and score
        for (let p = 0; p < currGame.seats.length; p++) {
            if (currGame.seats[p].seatNumber === winningHand.seatNumber) {
                currGame.seats[p].score = currGame.seats[p].score + 1;
                currGame.seats[p].isYourTurn = true;
                // Add turn cards to the winning hand
                currentTurn.turn.forEach(turn => {
                    currGame.seats[p].hand.push(turn.card);
                });
            } else {
                currGame.seats[p].isYourTurn = false;
                currGame.gameState = currGame.seats[p].hand.length > 0 ? GameState.GAME_IN_PROGRESS : GameState.GAME_END;
            }
        }

        // Create new turn object
        const newTurns = new Turns([], TurnState.TURN_WAITING_START);
        currGame.turns.push(newTurns);

        // Update the main game state
        this.games[gameIndex] = currGame;

        return currGame;
    };
    
}

export default Game;