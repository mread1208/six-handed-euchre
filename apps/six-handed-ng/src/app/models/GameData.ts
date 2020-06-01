export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    canStartGame: boolean;
    hasGameStarted: boolean;
    seats: Seat[];
    isYourTurn: boolean;
    yourHand: Card[];
    currentTurn: Turns;

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        canStartGame: boolean,
        hasGameStarted: boolean,
        seats: Seat[]
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.canStartGame = canStartGame;
        this.hasGameStarted = hasGameStarted;
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
