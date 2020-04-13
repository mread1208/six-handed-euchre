import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GamesDashboardComponent } from "./games-dashboard/games-dashboard.component";
import { AuthGuard } from "./auth/auth.guard";
import { AuthInterceptor } from "./auth/authinterceptor.service";

import { GamesService } from "./games-dashboard/games.service";
import { GameComponent } from "./game/game.component";

const appRoutes: Routes = [
    { path: "login", component: LoginComponent },
    { path: "sign-up", component: SignUpComponent },
    {
        path: "games-dashboard",
        component: GamesDashboardComponent,
        canActivate: [AuthGuard],
    },
    {
        path: "game/:id",
        component: GameComponent,
        canActivate: [AuthGuard],
    },
    // { path: 'games/:id',      component: GameComponent },
    // {
    //   path: 'games',
    //   component: GamesComponent,
    //   data: { title: 'Heroes List' }
    // },
    { path: "", redirectTo: "/login", pathMatch: "full" },
    // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    declarations: [AppComponent, LoginComponent, SignUpComponent, GamesDashboardComponent, GameComponent],
    imports: [
        RouterModule.forRoot(
            appRoutes
            // { enableTracing: true } // <-- debugging purposes only
        ),
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [GamesService, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {}
