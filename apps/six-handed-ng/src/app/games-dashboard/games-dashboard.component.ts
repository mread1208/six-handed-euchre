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
    games: Game[] = [];

    constructor(private gamesService: GamesService) {}

    ngOnInit(): void {
        this.gamesService.getRooms().subscribe(room => {
            this.games.push(room);
        });
        // this.gamesService.getGames().subscribe(game => {
        //     this.games.push(game);
        // });
    }

    createRoom(roomName, event) {
        event.preventDefault();
        this.gamesService.createRoom(roomName);
    }
    sendMessage(message) {
        this.gamesService.sendMessage(message);
    }
}
