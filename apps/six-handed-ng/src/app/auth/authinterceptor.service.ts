import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthService } from "./../auth/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private authorizationTokenHeader = "Authorization-Token";
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.authService.getAuthToken();
        if (!req.headers.has("Content-Type")) {
            req = req.clone({
                headers: req.headers.set("Content-Type", "application/json"),
            });
        }
        if (!req.headers.has(this.authorizationTokenHeader) && authToken !== null) {
            req = req.clone({
                headers: req.headers.set(this.authorizationTokenHeader, authToken),
            });
        }

        return next.handle(req).pipe(
            // This is the response blob
            tap(
                (evt) => {
                    if (evt instanceof HttpResponse) {
                        // If the response returned an authToken, Save it
                        if (evt.headers.has(this.authorizationTokenHeader)) {
                            this.authService.setAuthToken(
                                evt.headers.get(this.authorizationTokenHeader)
                            );
                        }
                    }
                    return next.handle(req);
                },
                (error: any) => {
                    if (error instanceof HttpErrorResponse) {
                        if (error && error.status === 401) {
                            // If the error response returned an authToken,
                            // then it came from login!  Save it
                            if (error.headers.has(this.authorizationTokenHeader)) {
                                this.authService.setAuthToken(
                                    error.headers.get(this.authorizationTokenHeader)
                                );
                            }
                            // Token probably expired, redirect to login page
                            return next.handle(req);
                        }
                    }
                    return of(error);
                }
            )
            );
    }
}
