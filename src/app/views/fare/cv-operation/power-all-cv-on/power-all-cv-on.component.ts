import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgID, MsgSubID, IPowerAllCvOnOff } from '@models';
import { AppState } from '@store/app.state';
import { powerCvOnOff } from '@store/fare/fare.reducer';
import { routerUrls } from '@app/app.routes';

@Component({
    selector: 'power-all-cv-on',
    imports: [MatIconModule, RouterModule, TranslateModule],
    templateUrl: './power-all-cv-on.component.html',
    styleUrls: ['./power-all-cv-on.component.scss'],
})
export class PowerAllCVOnComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly cvPowerOnOff$: Observable<IPowerAllCvOnOff>;
    topics;
    timeOutId;

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {
        this.cvPowerOnOff$ = this.store.select(powerCvOnOff);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.cvPowerOnOff$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.fareTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: {
                            msgID: data.msgID,
                        },
                    });
                    this.backToCvOperation();
                }, data.timeout);
            }
        });
    }

    backToCvOperation() {
        this.router.navigate([`${routerUrls.private.fare.cvOperation.url}`]);
    }

    handleConfirm(isConfirm: boolean) {
        clearTimeout(this.timeOutId);
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_CO_POWER_ALL_CV_CONFIRM,
                msgSubID: MsgSubID.REQUEST,
                payload: {
                    powerOn: true,
                },
            });
        } else {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_CO_POWER_ALL_CV_CANCEL,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        clearTimeout(this.timeOutId);

        this.destroy$.next();
        this.destroy$.complete();
    }
}
