import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { GamesService } from "./games.service";
import { AuthService } from "./../auth/auth.service";
import { User } from "../models/User";

import { Game } from "../models/Game";
@Component({
    selector: "six-handed-euchre-games-dashboard",
    templateUrl: "./games-dashboard.component.html",
    styleUrls: ["./games-dashboard.component.css"],
})
export class GamesDashboardComponent implements OnInit {
    messages: string[] = [];
    rooms: Game[] = [];
    createRoomForm: FormGroup;
    public currentUser: User;

    constructor(
        private gamesService: GamesService,
        private authService: AuthService,
        private formBuilder: FormBuilder
    ) {
        this.createRoomForm = formBuilder.group({
            gameName: ["", Validators.compose([Validators.required])],
        });
        this.currentUser = this.authService.currentUserValue;
    }

    ngOnInit(): void {
        this.gamesService.setSocketId(this.currentUser);
        this.gamesService.joinGamesDashboard();
        this.gamesService.getRooms().subscribe(rooms => {
            this.rooms = rooms;
        });
    }
    sendMessage(message) {
        this.gamesService.sendMessage(message);
    }

    createGame() {
        if (this.createRoomForm.invalid) {
            return;
        }

        const gameName = this.createRoomForm.get("gameName").value;
        this.gamesService.createRoom(gameName);
        this.createRoomForm.get("gameName").setValue("");
    }
}
