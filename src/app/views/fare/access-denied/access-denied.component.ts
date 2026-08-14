import { Component, OnInit } from '@angular/core';
import { PreLoginComponent } from '@components/pre-login/pre-login.component';

@Component({
    selector: 'access-denied',
    imports: [PreLoginComponent],
    templateUrl: './access-denied.component.html',
    styleUrls: ['./access-denied.component.scss'],
})
export class FareAccessDeniedComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
