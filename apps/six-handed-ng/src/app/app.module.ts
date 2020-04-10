import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

const appRoutes: Routes = [
    { path: "login", component: LoginComponent },
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
    declarations: [AppComponent, LoginComponent],
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
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
