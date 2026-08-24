import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { routerUrls } from '@app/app.routes';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IPrinterStatus, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { printerStatus } from '@store/fare/fare.reducer';

@Component({
    selector: 'printer-on-off',
    imports: [RouterModule, CommonPopUp, TranslateModule],
    templateUrl: './printer-on-off.component.html',
    styleUrls: ['./printer-on-off.component.scss'],
})
export class PrinterOnOffComponent implements OnInit, OnDestroy {
    responseStatus = ResponseStatus;
    readonly printerOn: boolean;
    $destroy = new Subject<void>();
    printerStatus$: Observable<IPrinterStatus> = this.store.select(printerStatus);
    printerStatus: IPrinterStatus = {};

    constructor(
        private readonly router: Router,
        private readonly activeRoute: ActivatedRoute,
        protected store: Store<AppState>,
    ) {
        this.printerOn = !!this.activeRoute.snapshot.data['printerOn'];
    }

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
