export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    seats: Seat[];
    gameState: GameState;
    deck: any;
    turns: Turns[];

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        seats: Seat[],
        gameState: GameState,
        turns: Turns[]
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.gameState = gameState;
        this.turns = turns;
    }
}
export class Seat {
    seatNumber: number;
    userId: string;
    userName: string;
    isYourTurn: boolean;
    hand: Card[];
    socketId: string;
    score: number;

    constructor(seatNumber, userId, userName, isYourTurn, hand, score) {
        this.seatNumber = seatNumber;
        this.userId = userId;
        this.userName = userName;
        this.isYourTurn = isYourTurn;
        this.hand = hand;
        this.score = score;
    }
}

export class Card {
    cardValue: string;
    suit: string;
}
export class Turns {
    turn: Turn[];
    turnState: TurnState;

    constructor(turn: Turn[], turnState: TurnState) {
        this.turn = turn;
        this.turnState = turnState;
    }
}
export class Turn {
    seatNumber: number;
    card: Card;

    constructor(seatNumber: number, card: Card) {
        this.seatNumber = seatNumber;
        this.card = card;
    }
}

export enum GameState {
    GAME_WAITING_PLAYERS,
    GAME_WAITING_START,
    GAME_IN_PROGRESS,
    GAME_END,
}

export enum TurnState {
    TURN_WAITING_START,
    TURN_IN_PROGRESS,
    TURN_END,
}

// Response back to the client, we don't want to expose everything
export class GameDataResponse {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    gameState: GameState;
    seats: SeatsResponse[];
    isYourTurn: boolean;
    yourHand: Card[];
    currentTurn: Turns;

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        gameState: GameState,
        seats: SeatsResponse[],
        isYourTurn: boolean,
        yourHand: Card[],
        currentTurn: Turns
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.gameState = gameState;
        this.seats = seats;
        this.isYourTurn = isYourTurn;
        this.yourHand = yourHand;
        this.currentTurn = currentTurn;
    }
}

export class SeatsResponse {
    seatNumber: number;
    userId: string;
    userName: string;
    isYourTurn: boolean;
    score: number;

    constructor(seatNumber, userId, userName, isYourTurn, score) {
        this.seatNumber = seatNumber;
        this.userId = userId;
        this.userName = userName;
        this.isYourTurn = isYourTurn;
        this.score = score;
    }
}
