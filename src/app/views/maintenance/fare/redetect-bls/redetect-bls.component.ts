import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'redetect-bls',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './redetect-bls.component.html',
    styleUrls: ['./redetect-bls.component.scss'],
})
export class RedetectBLSComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
