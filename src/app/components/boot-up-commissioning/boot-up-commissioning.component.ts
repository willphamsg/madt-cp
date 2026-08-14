import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommissioningType } from '@models';

@Component({
    selector: 'boot-up-commissioning',
    imports: [TranslateModule, RouterModule, CommonModule],
    templateUrl: './boot-up-commissioning.component.html',
    styleUrl: './boot-up-commissioning.component.scss',
})
export class BootUpCommissioningComponent {
    @Input() type!: string;
    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
    ) {}
    ngOnInit() {
        // console.log('BootUpCommissioningComponent initialized with type:', this.type);
    }
}
