import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgID, MsgSubID, IResetAllCv } from '@models';
import { AppState } from '@store/app.state';
import { resetAllCv } from '@store/fare/fare.reducer';
import { routerUrls } from '@app/app.routes';

@Component({
    selector: 'reset-all-cv',
    imports: [MatIconModule, RouterModule, TranslateModule],
    templateUrl: './reset-all-cv.component.html',
    styleUrls: ['./reset-all-cv.component.scss'],
})
export class ResetAllCVComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly resetAllCv$: Observable<IResetAllCv>;
    topics;
    timeOutId;

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {
        this.resetAllCv$ = this.store.select(resetAllCv);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.resetAllCv$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
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
                msgID: MsgID.FARE_CO_RESET_ALL_CV_CONFIRM,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        } else {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_CO_RESET_ALL_CV_CANCEL,
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
