import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "./../models/User";
import { environment } from "./../../environments/environment";

const authorizationTokenHeader = "Authorization";
@Injectable({
    providedIn: "root",
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem("currentUser")));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: "Basic " + btoa(email + ":" + password),
            }),
        };
        // Remove any existing authToken's
        this.removeAuthToken();

        return this.http.get<User>(`${environment.API_ENDPOINT}/auth/login`, httpOptions)
            .pipe(
                map(user => {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    return user;
                })
            );
    }

    logout() {
        console.log("logout");
        // remove user from local storage to log user out
        localStorage.removeItem("currentUser");
        this.removeAuthToken();
        this.currentUserSubject.next(null);
    }

    // New login flow
    public getAuthToken(): string {
        return localStorage.getItem(authorizationTokenHeader);
    }
    public removeAuthToken(): void {
        localStorage.removeItem(authorizationTokenHeader);
    }
    public setAuthToken(token): void {
        localStorage.setItem(authorizationTokenHeader, token);
    }
}
