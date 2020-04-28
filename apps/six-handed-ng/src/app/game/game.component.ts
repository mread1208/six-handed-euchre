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
    styleUrls: ["./game.component.scss"],
})
export class GameComponent implements OnInit, OnDestroy {
    public currentUser: User;
    public players: string[] = [];
    public gameData: GameData;
    public hasTakenSeat = false;
    public currentPlayersTurn: string;

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
            this.gamesService.setSocketUserData(this.currentUser);
            this.gamesService.joinRoom(params["id"]);
            this.gamesService.getRoomGameUsers(params["id"]).subscribe(players => {
                this.players = players;
            });
            this.gamesService.getGameData().subscribe(gameData => {
                this.gameData = gameData;
                this.hasTakenSeat = gameData.seats.find(seat => seat.userId === this.currentUser.userId) ? true : false;
            });

            // If the API doesn't properly set user data on the socker, resend it!
            this.gamesService.refreshSocketUserData().subscribe(() => {
                this.gamesService.joinRoom(params["id"]);
            });
        });
    }

    ngOnDestroy(): void {
        this.gamesService.leaveRoom(this.gameData.gameId, this.currentUser);
    }

    public leaveSeat() {
        this.gamesService.leaveSeat(this.gameData.gameId);
    }

    public takeSeat(event, seatNumber: number) {
        event.preventDefault();
        this.gamesService.takeSeat(this.gameData.gameId, seatNumber);
    }

    public startGame(event) {
        event.preventDefault();
        this.gamesService.startGame(this.gameData.gameId);
    }

    public takeYourTurn(event, seatNumber) {
        event.preventDefault();
        this.gamesService.takeYourTurn(this.gameData.gameId, seatNumber);
    }
}
