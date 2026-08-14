import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';

import { BreadcrumbComponent } from '@components/breadcrumb/breadcrumb.component';

@Component({
    selector: 'bls-operation-layout',
    imports: [BreadcrumbComponent, MatIconModule, RouterModule, RouterOutlet],
    templateUrl: './bls-operation-layout.component.html',
    styleUrls: ['./bls-operation-layout.component.scss'],
})
export class BLSOperationLayoutComponent {
    constructor() {}
}
