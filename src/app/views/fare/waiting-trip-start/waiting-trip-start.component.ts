import { Component } from '@angular/core';
import { PreLoginComponent } from '@components/pre-login/pre-login.component';

@Component({
    selector: 'waiting-trip-start',
    imports: [PreLoginComponent],
    templateUrl: './waiting-trip-start.component.html',
})
export class WaitingTripToStart {
    constructor() {}
}
