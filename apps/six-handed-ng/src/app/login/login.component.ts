import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "./../auth/auth.service";

@Component({
    selector: "six-handed-euchre-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    message: string;

    constructor(public authService: AuthService, public formBuilder: FormBuilder, public router: Router) {
        this.loginForm = formBuilder.group({
            email: [
                "test@test.com",
                Validators.compose([
                    Validators.required,
                    Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"),
                ]),
            ],
            password: ["s3cr3tp4sswo4rd", Validators.required],
        });
    }

    ngOnInit(): void {}

    setMessage() {
        this.message = "Logged " + (this.authService.isLoggedIn ? "in" : "out");
    }

    login(form: FormGroup, event: Event) {
        event.preventDefault();

        if (form.valid) {
            const email = form.get("email").value;
            const password = form.get("password").value;

            // this.http.post("/api/auth/", { email, password }).subscribe(data => console.log(data));

            this.authService.login(email, password).subscribe(() => {
                this.setMessage();
                if (this.authService.isLoggedIn) {
                    // Usually you would use the redirect URL from the auth service.
                    // However to keep the example simple, we will always redirect to `/admin`.
                    const redirectUrl = "/games-dashboard";

                    // Redirect the user
                    this.router.navigate([redirectUrl]);
                }
            });
        }
    }

    logout() {
        this.authService.logout();
        this.setMessage();
    }
}
