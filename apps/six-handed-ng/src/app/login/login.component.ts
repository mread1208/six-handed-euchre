import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { first } from "rxjs/operators";
import { AuthService } from "./../auth/auth.service";

@Component({
    selector: "six-handed-euchre-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = "";

    constructor(
        public authService: AuthService,
        public formBuilder: FormBuilder,
        private route: ActivatedRoute,
        public router: Router
    ) {
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

    ngOnInit(): void {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/games";
    }

    login() {
        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        const email = this.loginForm.get("email").value;
        const password = this.loginForm.get("password").value;
        this.loading = true;
        this.authService
            .login(email, password)
            .pipe(first())
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.error = error;
                    this.loading = false;
                }
            );
    }
}
