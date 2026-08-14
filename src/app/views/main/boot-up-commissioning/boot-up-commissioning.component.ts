import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommissioningType } from '@models';

@Component({
    selector: 'app-boot-up-commissioning',
    imports: [TranslateModule, RouterModule, CommonModule],
    templateUrl: './boot-up-commissioning.component.html',
    styleUrl: './boot-up-commissioning.component.scss',
})
export class BootUpCommissioningComponent implements OnInit {
    pageData!: string;
    commissioningType = CommissioningType;
    constructor(
        private readonly router: Router,
        private readonly activeRoute: ActivatedRoute,
    ) {}
    ngOnInit() {
        this.pageData = this.activeRoute.snapshot.data['pageType'] || this.commissioningType?.IN_PROGRESS;
    }
}
