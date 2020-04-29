export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    seats: Seat[];
    canStartGame: boolean;
    hasGameStarted: boolean;
    deck: any;

    constructor(gameId, gameName, numberOfSeats, seats, canStartGame, hasGameStarted) {
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

// Response back to the client, we don't want to expose everything
export class GameDataResponse {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    canStartGame: boolean;
    hasGameStarted: boolean;
    seats: SeatsResponse[];
    isYourTurn: boolean;
    yourHand: Card[];

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        canStartGame: boolean,
        hasGameStarted: boolean,
        seats: SeatsResponse[],
        isYourTurn: boolean,
        yourHand: Card[]
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.canStartGame = canStartGame;
        this.hasGameStarted = hasGameStarted;
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
