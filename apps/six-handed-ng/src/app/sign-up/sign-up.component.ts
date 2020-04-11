import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "six-handed-euchre-sign-up",
    templateUrl: "./sign-up.component.html",
    styleUrls: ["./sign-up.component.css"],
})
export class SignUpComponent implements OnInit {
    signUpForm: FormGroup;

    constructor(private http: HttpClient, public formBuilder: FormBuilder) {
        this.signUpForm = formBuilder.group({
            firstName: ["", Validators.required],
            lastName: ["", Validators.required],
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

    signUp(form: FormGroup, event: Event) {
        event.preventDefault();

        if (form.valid) {
            const firstName = form.get("firstName").value;
            const lastName = form.get("lastName").value;
            const email = form.get("email").value;
            const password = form.get("password").value;

            this.http
                .post("/api/sign-up/", { firstName, lastName, email, password })
                .subscribe(data => console.log(data));
        }
    }
}
