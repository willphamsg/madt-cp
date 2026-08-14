import { Component, OnInit } from '@angular/core';
import { PreLoginComponent } from '@components/pre-login/pre-login.component';

@Component({
    selector: 'main-access-denied',
    imports: [PreLoginComponent],
    templateUrl: './access-denied.component.html',
    styleUrls: ['./access-denied.component.scss'],
})
export class MainAccessDeniedComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
