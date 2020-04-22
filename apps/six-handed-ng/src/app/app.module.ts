import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GamesComponent } from "./games/games.component";
import { AuthInterceptor } from "./auth/authinterceptor.service";
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { appRoutingModule } from "./app.routing";

import { GamesService } from "./games/games.service";
import { GameComponent } from "./game/game.component";
import { IonicModule } from "@ionic/angular";

@NgModule({
    declarations: [AppComponent, LoginComponent, SignUpComponent, GamesComponent, GameComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        appRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
    ],
    providers: [
        GamesService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
