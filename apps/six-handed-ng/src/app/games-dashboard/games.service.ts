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

    public getMessages = () => {
        return Observable.create(observer => {
            this.socket.on("chat_message", message => {
                observer.next(message);
            });
        });
    };
    public getGames = () => {
        return this.http.get<Game>("/api/games/");
    };
}
