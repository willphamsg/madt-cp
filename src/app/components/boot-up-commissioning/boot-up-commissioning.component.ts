import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'boot-up-commissioning',
    imports: [TranslateModule, RouterModule, CommonModule],
    templateUrl: './boot-up-commissioning.component.html',
    styleUrl: './boot-up-commissioning.component.scss',
})
export class BootUpCommissioningComponent {
    @Input() type!: string;
    constructor(
        private readonly router: Router,
        private readonly activeRoute: ActivatedRoute,
    ) {}
}
