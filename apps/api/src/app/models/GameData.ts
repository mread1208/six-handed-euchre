export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    seats: Seat[];
    canStartGame: boolean;
    hasGameStarted: boolean;
    isDuringTurn: boolean;
    deck: any;
    currentTurn: number;
    turns: Turns[];

    constructor(
        gameId,
        gameName,
        numberOfSeats,
        seats,
        canStartGame,
        hasGameStarted,
        isDuringTurn,
        currentTurn,
        turns
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.canStartGame = canStartGame;
        this.hasGameStarted = hasGameStarted;
        this.isDuringTurn = isDuringTurn;
        this.currentTurn = currentTurn;
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

    constructor(seatNumber, userId, userName, isYourTurn, hand) {
        this.seatNumber = seatNumber;
        this.userId = userId;
        this.userName = userName;
        this.isYourTurn = isYourTurn;
        this.hand = hand;
    }
}

export class Card {
    cardValue: string;
    suit: string;
}

export class Turns {
    turnNumber: number;
    turn: Turn[];

    constructor(turnNumber: number, turn: Turn[]) {
        this.turnNumber = turnNumber;
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

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        canStartGame: boolean,
        hasGameStarted: boolean,
        isDuringTurn: boolean,
        seats: SeatsResponse[],
        isYourTurn: boolean,
        yourHand: Card[]
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
    }
}

export class SeatsResponse {
    seatNumber: number;
    userId: string;
    userName: string;
    isYourTurn: boolean;

    constructor(seatNumber, userId, userName, isYourTurn) {
        this.seatNumber = seatNumber;
        this.userId = userId;
        this.userName = userName;
        this.isYourTurn = isYourTurn;
    }
}
