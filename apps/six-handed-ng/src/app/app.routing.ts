import { Routes, RouterModule } from "@angular/router";

import { GameComponent } from "./game/game.component";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { GamesDashboardComponent } from "./games-dashboard/games-dashboard.component";

import { AuthGuard } from "./auth/auth.guard";

const routes: Routes = [
    { path: "login", component: LoginComponent },
    { path: "sign-up", component: SignUpComponent },
    {
        path: "games-dashboard",
        component: GamesDashboardComponent,
        canActivate: [AuthGuard],
    },
    {
        path: "games/:id",
        component: GameComponent,
        canActivate: [AuthGuard],
    },
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
];

export const appRoutingModule = RouterModule.forRoot(routes);
