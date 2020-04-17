import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
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
    players: string[] = [];
    public currentUser: User;
    private gameId: string;

    constructor(
        private gamesService: GamesService,
        private authService: AuthService,
        public router: Router,
        private route: ActivatedRoute
    ) {
        this.currentUser = this.authService.currentUserValue;
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.gameId = params["id"];
            this.gamesService.setSocketUserData(this.currentUser);
            this.gamesService.joinRoom(this.gameId);
            this.gamesService.getRoomGameUsers(this.gameId).subscribe(players => {
                this.players = players;
            });
            // If the API doesn't properly set user data on the socker, resend it!
            this.gamesService.refreshSocketUserData().subscribe(() => {
                this.gamesService.joinRoom(this.gameId);
            });
        });
    }

    ngOnDestroy(): void {
        this.gamesService.leaveRoom(this.gameId, this.currentUser);
    }
}
