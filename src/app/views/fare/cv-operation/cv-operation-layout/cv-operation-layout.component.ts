import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';

import { BreadcrumbComponent } from '@components/breadcrumb/breadcrumb.component';

@Component({
    selector: 'cv-operation-layout',
    imports: [BreadcrumbComponent, MatIconModule, RouterModule, RouterOutlet],
    templateUrl: './cv-operation-layout.component.html',
    styleUrls: ['./cv-operation-layout.component.scss'],
})
export class CVOperationLayoutComponent {
    constructor() {}
}
