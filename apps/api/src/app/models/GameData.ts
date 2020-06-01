export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    seats: Seat[];
    canStartGame: boolean;
    hasGameStarted: boolean;
    isDuringTurn: boolean;
    deck: any;
    turns: Turns[];

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        seats: Seat[],
        canStartGame: boolean,
        hasGameStarted: boolean,
        isDuringTurn: boolean,
        turns: Turns[]
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.canStartGame = canStartGame;
        this.hasGameStarted = hasGameStarted;
        this.isDuringTurn = isDuringTurn;
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

    constructor(turn: Turn[]) {
        this.turn = turn;
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

// Response back to the client, we don't want to expose everything
export class GameDataResponse {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    canStartGame: boolean;
    hasGameStarted: boolean;
    isDuringTurn: boolean;
    seats: SeatsResponse[];
    isYourTurn: boolean;
    yourHand: Card[];
    currentTurn: Turns;

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        canStartGame: boolean,
        hasGameStarted: boolean,
        isDuringTurn: boolean,
        seats: SeatsResponse[],
        isYourTurn: boolean,
        yourHand: Card[],
        currentTurn: Turns
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.canStartGame = canStartGame;
        this.hasGameStarted = hasGameStarted;
        this.isDuringTurn = isDuringTurn;
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
