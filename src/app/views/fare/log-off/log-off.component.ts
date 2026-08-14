import { Component, OnInit } from '@angular/core';
import { PreLoginComponent } from '@components/pre-login/pre-login.component';

@Component({
    selector: 'log-off',
    imports: [PreLoginComponent],
    templateUrl: './log-off.component.html',
    styleUrls: ['./log-off.component.scss'],
})
export class FareLogoffComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
