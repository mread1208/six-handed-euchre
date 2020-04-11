import { Component, OnInit } from "@angular/core";
import { GamesService } from "./games.service";

@Component({
    selector: "six-handed-euchre-games-dashboard",
    templateUrl: "./games-dashboard.component.html",
    styleUrls: ["./games-dashboard.component.css"],
})
export class GamesDashboardComponent implements OnInit {
    messages: string[] = [];

    constructor(private gamesService: GamesService) {}

    ngOnInit(): void {
        this.gamesService.getMessages().subscribe((message: string) => {
            this.messages.push(message);
        });
    }

    sendMessage(message) {
        console.log("click");
        this.gamesService.sendMessage(message);
    }
}
