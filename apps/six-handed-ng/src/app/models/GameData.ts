export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    gameState: GameState;
    seats: Seat[];
    isYourTurn: boolean;
    yourHand: Card[];
    currentTurn: Turns;

    constructor(gameId: string, gameName: string, numberOfSeats: number, gameState: GameState, seats: Seat[]) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.gameState = gameState;
    }
}

export class Seat {
    seatNumber: number;
    userName: string;
    score: number;

    constructor(seatNumber, userName, score) {
        this.seatNumber = seatNumber;
        this.userName = userName;
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
