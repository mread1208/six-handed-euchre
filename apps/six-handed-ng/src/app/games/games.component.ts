import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { GamesService } from "./games.service";
import { AuthService } from "../auth/auth.service";
import { User } from "../models/User";

import { Game } from "../models/Game";
@Component({
    selector: "six-handed-euchre-games",
    templateUrl: "./games.component.html",
    styleUrls: ["./games.component.css"],
})
export class GamesComponent implements OnInit {
    messages: string[] = [];
    rooms: Game[] = [];
    createRoomForm: FormGroup;
    public currentUser: User;

    constructor(
        private gamesService: GamesService,
        private authService: AuthService,
        private formBuilder: FormBuilder,
        public router: Router,
        private route: ActivatedRoute
    ) {
        this.createRoomForm = formBuilder.group({
            gameName: ["", Validators.compose([Validators.required])],
        });
        this.currentUser = this.authService.currentUserValue;
    }

    ngOnInit(): void {
        // Set the socketUserData again just in case the user disconnects or refreshes the page
        this.gamesService.setSocketUserData(this.currentUser);
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
        this.gamesService.joinNewRoom().subscribe(newRoomId => {
            this.router.navigate([`/games/${newRoomId}`]);
        });
    }
}
