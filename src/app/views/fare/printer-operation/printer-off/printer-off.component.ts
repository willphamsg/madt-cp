import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { routerUrls } from '@app/app.routes';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IPrinterStatus, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { printerStatus } from '@store/fare/fare.reducer';

@Component({
    selector: 'printer-off',
    imports: [RouterModule, CommonPopUp, TranslateModule],
    templateUrl: './printer-off.component.html',
    styleUrls: ['./printer-off.component.scss'],
})
export class PrinterOffComponent implements OnInit {
    responseStatus = ResponseStatus;
    $destroy = new Subject<void>();
    printerStatus$: Observable<IPrinterStatus> = this.store.select(printerStatus);
    printerStatus: IPrinterStatus = {};

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
    ) {}

    ngOnInit() {
        this.printerStatus$.pipe(takeUntil(this.$destroy)).subscribe((data) => {
            this.printerStatus = data;
        });
    }

    backToPrinterOperation(): void {
        this.router.navigate([`${routerUrls.private.fare.printerOperation.url}`]);
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
}
