import { Component, OnInit } from "@angular/core";
import { GamesService } from "./games.service";

import { Game } from "../models/Game";
@Component({
    selector: "six-handed-euchre-games-dashboard",
    templateUrl: "./games-dashboard.component.html",
    styleUrls: ["./games-dashboard.component.css"],
})
export class GamesDashboardComponent implements OnInit {
    messages: string[] = [];
    rooms: Game[] = [];

    constructor(private gamesService: GamesService) {}

    ngOnInit(): void {
        this.gamesService.joinGamesDashboard();
        this.gamesService.getRooms().subscribe(rooms => {
            this.rooms = rooms;
        });
    }

    createRoom(roomName, event) {
        event.preventDefault();
        this.gamesService.createRoom(roomName);
    }
    sendMessage(message) {
        this.gamesService.sendMessage(message);
    }
}
