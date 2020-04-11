import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as io from "socket.io-client";

@Injectable({
    providedIn: "root",
})
export class GamesService {
    private url = "http://localhost:3333";
    private socket;

    constructor() {
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
}
