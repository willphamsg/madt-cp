import { Component } from '@angular/core';
import { PreLoginComponent } from '@components/pre-login/pre-login.component';

@Component({
    selector: 'access-denied',
    imports: [PreLoginComponent],
    templateUrl: './access-denied.component.html',
})
export class FareAccessDeniedComponent {
    constructor() {}
}
