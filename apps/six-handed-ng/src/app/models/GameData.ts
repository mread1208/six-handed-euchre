export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    seats: Seat[];
    startGame: boolean;
    hasGameStarted: boolean;

    constructor(
        gameId: string,
        gameName: string,
        numberOfSeats: number,
        seats: Seat[],
        startGame: boolean,
        hasGameStarted: boolean
    ) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.startGame = startGame;
        this.hasGameStarted = hasGameStarted;
    }
}

export class Seat {
    seatNumber: number;
    userId: string;
    userName: string;
    isYourTurn: boolean;
    hand: Card[];

    constructor(seatNumber, userId, userName, hand) {
        this.seatNumber = seatNumber;
        this.userId = userId;
        this.userName = userName;
        this.hand = hand;
    }
}
export class Card {
    cardValue: string;
    suit: string;
}
