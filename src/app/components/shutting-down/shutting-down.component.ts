import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { bootUp } from '@store/main/main.reducer';
import { IBootUp } from '@models';
import { NotificationSoundDirective } from '@directives/notification-sound.directive';

@Component({
    selector: 'app-shutting-down',
    imports: [TranslateModule, NotificationSoundDirective],
    templateUrl: './shutting-down.component.html',
    styleUrl: './shutting-down.component.scss',
})
export class ShuttingDownComponent implements OnDestroy, OnInit {
    private destroy$ = new Subject<void>();
    @Input() isUpgrading: boolean = false;
    @Input() message: string = '';

    bootUp$: Observable<IBootUp>;
    bootUpdata: IBootUp = {
        softwareVersion: '',
        osVersion: '',
        releaseDate: '',
        serialNumber: '',
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
