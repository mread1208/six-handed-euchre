import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "./../models/User";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    isLoggedIn = false;
    // store the URL so we can redirect after logging in
    redirectUrl: string;

    constructor(private http: HttpClient) {}

    login(req): Observable<User> {
        return this.http.post<User>("/api/auth/", req).pipe(
            map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.accessToken) {
                    this.isLoggedIn = true;
                }
                return user;
            })
        );
    }

    logout(): void {
        this.isLoggedIn = false;
    }
}
