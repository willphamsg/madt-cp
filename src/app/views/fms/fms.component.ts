import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-fms',
    imports: [ReactiveFormsModule],
    templateUrl: './fms.component.html',
    styleUrls: ['./fms.component.scss'],
})
export class FMSComponent implements OnInit {
    constructor() {}

    ngOnInit() {
        console.log('This Works!');
    }
}
