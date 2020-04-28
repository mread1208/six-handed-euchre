export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    canStartGame: boolean;
    hasGameStarted: boolean;
    seats: Seat[];
    isYourTurn: boolean;
    yourHand: Card[];

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

    constructor(seatNumber, userName) {
        this.seatNumber = seatNumber;
        this.userName = userName;
    }
}
export class Card {
    cardValue: string;
    suit: string;
}
