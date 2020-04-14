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

    constructor(private http: HttpClient) {
        this.socket = io(this.url);
    }

    public sendMessage(message) {
        this.socket.emit("chat_message", message);
    }

    public createRoom = roomName => {
        this.socket.emit("createRoom", roomName);
    };
    public getRooms = () => {
        return Observable.create(observer => {
            this.socket.on("getRoomNames", rooms => {
                console.log(rooms);
                observer.next(rooms);
            });
        });
    };
    public getRoomGameUsers = room => {
        return Observable.create(observer => {
            this.socket.on("getRoomGameUsers", gameUsers => {
                observer.next(gameUsers);
            });
        });
    };
    // public getGames = () => {
    //     return this.http.get<Game>("/api/games/");
    // };

    public joinRoom = (room, gameUser) => {
        this.socket.emit("joinRoom", room, gameUser);
    };
    public joinGamesDashboard = () => {
        this.socket.emit("joinGamesDashboard");
    };
    public leaveRoom = (room, gameUser) => {
        this.socket.emit("leaveRoom", room, gameUser);
    };
}
