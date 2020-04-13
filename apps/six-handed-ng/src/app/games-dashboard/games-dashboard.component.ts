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
        this.gamesService.getMessages().subscribe((message: string) => {
            this.messages.push(message);
        });
        this.gamesService.getGames().subscribe(game => {
            this.games.push(game);
        });
    }

    sendMessage(message) {
        console.log("click");
        this.gamesService.sendMessage(message);
    }
}
