import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { GamesService } from "../games/games.service";
import { AuthService } from "./../auth/auth.service";
import { User } from "../models/User";
import { GameData } from "../models/GameData";

@Component({
    selector: "six-handed-euchre-game",
    templateUrl: "./game.component.html",
    styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit, OnDestroy {
    private currentUser: User;
    public players: string[] = [];
    public gameData: GameData;

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
            this.gameData = new GameData(params["id"], 2, [], false);
            this.gamesService.setSocketUserData(this.currentUser);
            this.gamesService.joinRoom(this.gameData.gameId);
            this.gamesService.getRoomGameUsers(this.gameData.gameId).subscribe(players => {
                this.players = players;
            });
            this.gamesService.getGameData().subscribe(gameData => {
                this.gameData = gameData;
            });

            // If the API doesn't properly set user data on the socker, resend it!
            this.gamesService.refreshSocketUserData().subscribe(() => {
                this.gamesService.joinRoom(this.gameData.gameId);
            });
        });
    }

    ngOnDestroy(): void {
        this.gamesService.leaveRoom(this.gameData.gameId, this.currentUser);
    }

    public takeSeat(event, seatNumber: number) {
        event.preventDefault();
        this.gamesService.takeSeat(this.gameData.gameId, seatNumber);
    }

    public startGame(event) {
        event.preventDefault();
        this.gamesService.startGame(this.gameData.gameId);
    }
}
