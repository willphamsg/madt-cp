import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IAppUpgrade, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { appUpgrade, updateAppUpgrade } from '@store/maintenance/maintenance.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'application-upgrade',
    imports: [MatIconModule, RouterModule, NgScrollbarModule, TranslateModule],
    templateUrl: './application-upgrade.component.html',
    styleUrls: ['./application-upgrade.component.scss'],
})
export class ApplicationUpgrade implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly appUpgrade$: Observable<IAppUpgrade>;
    appUpgrade: IAppUpgrade = {
        upgradeStatus: false,
    };

    isLoading: boolean = true;
    ResponseStatus = ResponseStatus;
    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.appUpgrade$ = this.store.select(appUpgrade);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.maintenance?.get,
                    msgID: MsgID.MAINTENANCE_APP_UPGRADE,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            }
        });

        this.appUpgrade$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.appUpgrade = data;
            // console.log('appUpgrade', data);

            if (data.upgradeStatus !== undefined) {
                this.isLoading = false;
            }
        });
    }

    backToFare() {
        this.router.navigate(['/maintenance/fare']);
    }

    handleUpgrade() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_UPGRADE_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
            opts: { retain: false },
        });
    }

    ngOnDestroy() {
        this.store.dispatch(
            updateAppUpgrade({
                payload: {
                    msgID: undefined,
                    status: undefined,
                    message: undefined,
                    upgradeStatus: undefined,
                },
            }),
        );

        // Unsubscribe from all subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
