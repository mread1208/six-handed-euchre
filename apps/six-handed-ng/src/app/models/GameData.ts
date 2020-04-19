export class GameData {
    gameId: string;
    numberOfSeats: number;
    seats: Seat[];

    constructor(gameId, numberOfSeats, seats) {
        this.gameId = gameId;
        this.numberOfSeats = numberOfSeats;
        this.seats = seats;
    }
}

export class Seat {
    seatNumber: number;
    userId: string;

    constructor(seatNumber, userId) {
        this.seatNumber = seatNumber;
        this.userId = userId;
    }
}
