import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'maintenance-check-printer',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './check-printer.component.html',
    styleUrls: ['./check-printer.component.scss'],
})
export class CheckPrinterComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
