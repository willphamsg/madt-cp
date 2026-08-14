import { Component, OnInit } from '@angular/core';
import User from '@dummyData/user.login';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Router } from '@angular/router';

@Component({
    selector: 'app-sign-in',
    imports: [MatCardModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
    loader: boolean = false;
    form!: FormGroup;
    error: boolean = false;
    constructor(
        private fb: FormBuilder,
        private router: Router,
    ) {}

    ngOnInit() {
        const keys = localStorage.getItem('keys');
        if (keys === User?.sign) {
            this.router.navigate(['/dashboard']);
        }
        this.form = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    onSubmit(): void {
        this.error = false;
        if (this.form.valid && this.form.value?.username === User?.name && this.form.value?.password === User?.value) {
            localStorage.setItem('keys', User?.sign);
            this.router.navigate(['/main']);
        } else {
            this.error = true;
        }
    }
}
