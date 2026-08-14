import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { bootUp } from '@store/main/main.reducer';
import { IBootUp } from '@models';

@Component({
    selector: 'app-boot-up',
    imports: [TranslateModule],
    templateUrl: './boot-up.component.html',
    styleUrl: './boot-up.component.scss',
})
export class BootUpComponent implements OnDestroy, OnInit {
    private destroy$ = new Subject<void>();
    bootUp$: Observable<IBootUp>;
    bootUpdata: IBootUp = {
        softwareVersion: '',
        osVersion: '',
        releaseDate: '',
        serialNumber: '',
        busId: '',
        service: '',
    };
    constructor(
        private router: Router,
        private store: Store<AppState>,
    ) {
        this.bootUp$ = this.store.select(bootUp);
    }
    handleNavigate(page: string) {
        this.router.navigate([page]);
    }
    ngOnInit() {
        this.bootUp$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.bootUpdata = data;
        });
    }
    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }
}
