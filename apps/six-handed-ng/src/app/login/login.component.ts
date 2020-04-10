import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "six-handed-euchre-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    constructor(private http: HttpClient, public formBuilder: FormBuilder) {
        this.fetch();
        this.loginForm = formBuilder.group({
            // firstName: ["", Validators.required],
            // lastName: ["", Validators.required],
            email: [
                "",
                Validators.compose([
                    Validators.required,
                    Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"),
                ]),
            ],
            password: ["", Validators.required],
        });
    }

    ngOnInit(): void {}

    fetch() {
        this.http.get("/api/").subscribe(data => console.log(data));
    }

    login(form: FormGroup, event: Event) {
        event.preventDefault();

        if (form.valid) {
            // const firstName = form.get("firstName").value;
            // const lastName = form.get("lastName").value;
            const email = form.get("email").value;
            const password = form.get("password").value;

            this.http.post("http://localhost:3333/auth/", { email, password }).subscribe(data => console.log(data));
        }
    }
}
