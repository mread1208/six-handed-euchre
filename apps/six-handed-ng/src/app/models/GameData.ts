export class GameData {
    gameId: string;
    gameName: string;
    numberOfSeats: number;
    seats: Seat[];
    startGame: boolean;

    constructor(gameId: string, gameName: string, numberOfSeats: number, seats: Seat[], startGame: boolean) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
        this.startGame = startGame;
    }
}

export class Seat {
    seatNumber: number;
    userId: string;
    userName: string;

    constructor(seatNumber, userId, userName) {
        this.seatNumber = seatNumber;
        this.userId = userId;
        this.userName = userName;
    }
}
