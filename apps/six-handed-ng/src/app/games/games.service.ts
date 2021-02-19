import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { io } from "socket.io-client";

import { GameData } from "../models/GameData";

@Injectable({
    providedIn: "root",
})
export class GamesService {
    private url = "http://localhost:3333";
    private socket;
    private gameSocket;

    constructor(private http: HttpClient) {
        this.socket = io(this.url);
        this.gameSocket = io(`${this.url}/games`);
    }

    public setSocketUserData(user) {
        this.gameSocket.emit("setSocketUserData", user);
    }
    public refreshSocketUserData() {
        return Observable.create(observer => {
            this.gameSocket.on("refreshSocketUserData", () => {
                observer.next();
            });
        });
    }
    public sendMessage(message) {
        this.gameSocket.emit("chat_message", message);
    }

    public createRoom = gameName => {
        this.gameSocket.emit("createRoom", gameName);
    };
    public joinNewRoom = () => {
        return Observable.create(observer => {
            this.gameSocket.on("joinNewRoom", roomId => {
                observer.next(roomId);
            });
        });
    };
    public getGames = () => {
        return Observable.create(observer => {
            this.gameSocket.on("getRoomNames", (games: GameData) => {
                observer.next(games);
            });
        });
    };
    public getRoomGameUsers = room => {
        return Observable.create(observer => {
            this.gameSocket.on("getRoomGameUsers", gameUsers => {
                observer.next(gameUsers);
            });
        });
    };

    public joinRoom = room => {
        this.gameSocket.emit("joinRoom", room);
    };
    public joinGamesDashboard = () => {
        this.gameSocket.emit("joinGamesDashboard");
    };
    public leaveRoom = (room, gameUser) => {
        this.gameSocket.emit("leaveRoom", room, gameUser);
    };

    public takeSeat(gameId: string, seatNumber: number) {
        this.gameSocket.emit("takeSeat", gameId, seatNumber);
    }
    public leaveSeat(gameId: string) {
        this.gameSocket.emit("leaveSeat", gameId);
    }
    public startGame(gameId: string) {
        this.gameSocket.emit("startGame", gameId);
    }
    public takeYourTurn(gameId: string) {
        this.gameSocket.emit("takeYourTurn", gameId);
    }
    public getGameData = () => {
        return Observable.create(observer => {
            this.gameSocket.on("getGameData", gameData => {
                observer.next(gameData);
            });
        });
    };
}
