import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GamesDashboardComponent } from "./games-dashboard/games-dashboard.component";
import { AuthInterceptor } from "./auth/authinterceptor.service";
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { appRoutingModule } from "./app.routing";

import { GamesService } from "./games-dashboard/games.service";
import { GameComponent } from "./game/game.component";

@NgModule({
    declarations: [AppComponent, LoginComponent, SignUpComponent, GamesDashboardComponent, GameComponent],
    imports: [BrowserModule, HttpClientModule, appRoutingModule, FormsModule, ReactiveFormsModule],
    providers: [
        GamesService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
