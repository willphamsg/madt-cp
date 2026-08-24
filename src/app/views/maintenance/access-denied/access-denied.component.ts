import { Component } from '@angular/core';
import { PreLoginComponent } from '@components/pre-login/pre-login.component';

@Component({
    selector: 'maintenance-access-denied',
    imports: [PreLoginComponent],
    templateUrl: './access-denied.component.html',
})
export class MaintenanceAccessDeniedComponent {
    constructor() {}
}
