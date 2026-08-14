import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';

import { BreadcrumbComponent } from '@components/breadcrumb/breadcrumb.component';

@Component({
    selector: 'printer-operation-layout',
    imports: [BreadcrumbComponent, MatIconModule, RouterModule, RouterOutlet],
    templateUrl: './printer-operation-layout.component.html',
    styleUrls: ['./printer-operation-layout.component.scss'],
})
export class PrinterOperationLayoutComponent {
    constructor() {}
}
