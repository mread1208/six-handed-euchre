import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, tap } from "rxjs/operators";
import { User } from "./../models/User";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    isLoggedIn = false;
    // store the URL so we can redirect after logging in
    redirectUrl: string;

    constructor(private http: HttpClient) {}

    // login(req): Observable<User> {
    //     return this.http.post<User>("/api/auth/", req).pipe(
    //         map(user => {
    //             // login successful if there's a jwt token in the response
    //             if (user && user.accessToken) {
    //                 console.log(user);
    //                 window.localStorage.setItem("usertoken", user.accessToken);
    //                 this.isLoggedIn = true;
    //             }
    //             return user;
    //         })
    //     );
    // }

    login(email: string, password: string) {
        return this.http
            .post<User>("/api/auth/", { email, password })
            .pipe(
                tap(res => {
                    this.isLoggedIn = true;
                    localStorage.setItem("access_token", res.accessToken);
                })
            );
    }

    logout(): void {
        this.isLoggedIn = false;
    }
}
