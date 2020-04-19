import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import * as io from "socket.io-client";

import { Game } from "../models/Game";

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

    public createRoom = roomName => {
        this.gameSocket.emit("createRoom", roomName);
    };
    public joinNewRoom = () => {
        return Observable.create(observer => {
            this.gameSocket.on("joinNewRoom", roomId => {
                observer.next(roomId);
            });
        });
    };
    public getRooms = () => {
        return Observable.create(observer => {
            this.gameSocket.on("getRoomNames", rooms => {
                observer.next(rooms);
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
    public startGame(gameId: string) {
        this.gameSocket.emit("startGame", gameId);
    }
    public getGameData = () => {
        return Observable.create(observer => {
            this.gameSocket.on("getGameData", gameData => {
                observer.next(gameData);
            });
        });
    };
}
