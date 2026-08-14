import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

export interface Breadcrumb {
    label: string;
    link: string;
}

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    imports: [CommonModule, MatIconModule, RouterModule, TranslateModule],
})
export class BreadcrumbComponent implements OnInit {
    breadcrumbs: Breadcrumb[] = [];
    @Input() id?: string;
    @Input() dateTime?: Date | null;

    constructor(
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
    ) {
        this.router.events.subscribe((ev) => {
            if (ev instanceof NavigationEnd) {
                this.breadcrumbs = [];
                this.buildBreadcrumb(this.activatedRoute);
            }
        });
    }

    ngOnInit(): void {
        if (!this.breadcrumbs.length) {
            this.buildBreadcrumb(this.activatedRoute);
        }
    }

    buildBreadcrumb(currentAR: ActivatedRoute): void {
        if (currentAR.snapshot.data['breadcrumb']) {
            const lastBCLink = this.breadcrumbs.length !== 0 ? this.breadcrumbs[this.breadcrumbs.length - 1].link : '';

            let currentBCLink = '';
            if (currentAR?.routeConfig?.path?.startsWith(':')) {
                currentBCLink = currentAR.snapshot.data['breadcrumb'].link;
            } else {
                currentBCLink = currentAR?.routeConfig?.path || '';
            }
            // console.log('currentBCLink', currentBCLink);
            // console.log('currentAR', currentAR);
            // console.log('lastBCLink', lastBCLink);
            this.breadcrumbs.push({
                label: currentAR.snapshot.data['breadcrumb'],
                link: lastBCLink + '/' + currentBCLink,
            } as Breadcrumb);

            // console.log('this.breadcrumbs', this.breadcrumbs);

            if (currentAR.snapshot.data['rootRoute'] && this.breadcrumbs.length >= 0) {
                this.breadcrumbs[0].link = currentAR.snapshot.data['rootRoute'];
            }
        }

        if (currentAR.firstChild !== null) {
            this.buildBreadcrumb(currentAR.firstChild);
        }
    }
}
