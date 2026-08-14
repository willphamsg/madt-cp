import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'print-bcv-result',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './print-bcv-result.component.html',
    styleUrls: ['./print-bcv-result.component.scss'],
})
export class PrintBcvResultComponent {
    constructor() {}
}
