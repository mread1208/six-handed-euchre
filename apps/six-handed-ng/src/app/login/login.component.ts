import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "six-handed-euchre-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
    constructor(private http: HttpClient) {
        this.fetch();
    }

    ngOnInit(): void {}

    fetch() {
        this.http.get("/api/").subscribe(data => console.log(data));
    }
}
