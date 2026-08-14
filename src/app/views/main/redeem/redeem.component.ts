import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';

import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { redeem, updateRedeem } from '@store/main/main.reducer';
import { routerUrls } from '@app/app.routes';
import { MsgID, MsgSubID, ResponseStatus, IRedeem } from '@models';

@Component({
    selector: 'redeem',
    imports: [RouterModule, TranslateModule],
    templateUrl: './redeem.component.html',
    styleUrls: ['./redeem.component.scss'],
})
export class RedeemComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    redeem$: Observable<IRedeem>;
    redeem: IRedeem = {};
    topics;
    timeOutId;

    constructor(
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly store: Store<AppState>,
        private readonly soundService: SoundService,
    ) {
        this.redeem$ = this.store.select(redeem);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
        this.redeem$.pipe(takeUntil(this.destroy$)).subscribe((data: IRedeem) => {
            this.redeem = data;

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.mainTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: {
                            msgID: data.msgID,
                        },
                    });
                }, data.timeout);
            }

            if (
                data.status === ResponseStatus.SUCCESS &&
                (data.msgID === MsgID.MAIN_REDEEM_SUBMIT || data.msgID === MsgID.MAIN_REDEEM_CANCEL)
            ) {
                this.backToMain();
            }
        });
    }

    backToMain(): void {
        this.router.navigate([routerUrls?.private?.main?.busStopInformation]);
    }

    handleRedeem(isConfirm: boolean) {
        this.removeTimeout();
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.MAIN_REDEEM_SUBMIT,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        } else {
            this.backToMain();
            // this.mqttService.publishWithMessageFormat({
            //     topic: this.topics?.mainTab?.get,
            //     msgID: MsgID.MAIN_REDEEM_CANCEL,
            //     msgSubID: MsgSubID.REQUEST,
            //     payload: {},
            // });
        }
    }

    removeTimeout() {
        clearTimeout(this.timeOutId);
        this.store.dispatch(updateRedeem({ payload: { ...this.redeem, timeout: undefined } }));
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
        this.removeTimeout();
        clearTimeout(this.timeOutId);
    }
}
