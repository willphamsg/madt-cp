import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'redetect-fms',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './redetect-fms.component.html',
    styleUrls: ['./redetect-fms.component.scss'],
})
export class RedetectFMSComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
