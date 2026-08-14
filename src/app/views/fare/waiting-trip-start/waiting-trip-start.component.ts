import { Component, OnInit } from '@angular/core';
import { PreLoginComponent } from '@components/pre-login/pre-login.component';

@Component({
    selector: 'waiting-trip-start',
    imports: [PreLoginComponent],
    templateUrl: './waiting-trip-start.component.html',
    styleUrls: ['./waiting-trip-start.component.scss'],
})
export class WaitingTripToStart implements OnInit {
    constructor() {}

    ngOnInit() {}
}
