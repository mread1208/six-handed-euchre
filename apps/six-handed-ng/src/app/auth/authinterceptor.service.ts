import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./../auth/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private authorizationTokenHeader = "Authorization";
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.authService.getAuthToken();
        // add authorization header with jwt token if available
        const currentUser = this.authService.currentUserValue;
        if (currentUser && currentUser.accessToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.accessToken}`,
                },
            });
        }

        if (!request.headers.has(this.authorizationTokenHeader) && authToken !== null) {
            request = request.clone({
                headers: request.headers.set(this.authorizationTokenHeader, `Bearer ${currentUser.accessToken}`),
            });
        }

        return next.handle(request);
    }
}
