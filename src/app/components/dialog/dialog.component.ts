import { Component, ElementRef } from '@angular/core';
import { MatButton } from '@angular/material/button';
@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    imports: [MatButton],
})
export class DialogComponent {
    constructor(private readonly ele: ElementRef) {}
}
