import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { GamesService } from "./../games-dashboard/games.service";
import { AuthService } from "./../auth/auth.service";
import { User } from "../models/User";

@Component({
    selector: "six-handed-euchre-game",
    templateUrl: "./game.component.html",
    styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit, OnDestroy {
    messages: string[] = [];
    public currentUser: User;
    private gameSub: Subscription;

    constructor(private gamesService: GamesService, private authService: AuthService, public router: Router) {
        this.currentUser = this.authService.currentUserValue;
    }

    ngOnInit(): void {
        this.gamesService.joinRoom("room1", this.currentUser.name);
        // this.gamesService.getMessages().subscribe((message: string) => {
        //     this.messages.push(message);
        // });
    }

    ngOnDestroy(): void {
        // this.gameSub.unsubscribe();
    }

    backToDashboard(event) {
        event.preventDefault();
        this.gamesService.leaveRoom("room1", this.currentUser.name);
        this.router.navigate(["/games-dashboard"]);
    }
}
