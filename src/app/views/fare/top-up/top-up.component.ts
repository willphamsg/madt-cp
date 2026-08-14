import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ITopUp, MsgID, MsgSubID, ResponseStatus } from '@models';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { topUp, updateTopUp } from '@store/fare/fare.reducer';
import { routerUrls } from '@app/app.routes';

@Component({
    selector: 'top-up',
    imports: [RouterModule, TranslateModule],
    templateUrl: './top-up.component.html',
    styleUrls: ['./top-up.component.scss'],
})
export class TopUpComponent implements OnInit, OnDestroy {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    private destroy$ = new Subject<void>();
    private topUp$: Observable<ITopUp>;
    topUp: ITopUp = {};
    selectedAmt: number = 0;

    topics;
    timeOutId;

    constructor(
        private router: Router,
        private mqttService: MqttService,
        protected store: Store<AppState>,
        private soundService: SoundService,
    ) {
        this.topUp$ = this.store.select(topUp);
    }

    ngOnInit() {
        this.mqttService.connectionStatus$.pipe(takeUntil(this.destroy$)).subscribe((isConnected) => {
            if (isConnected) {
                this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
                    if (configLoaded) {
                        const topics = this.mqttService.mqttConfig?.topics;
                        this.topics = topics;
                    }
                });
            }
        });

        this.topUp$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.topUp = data;
            // console.log('Top Up Data:', data);

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
                    this.handleCancel();
                }, data.timeout);
            }

            if (data.status === ResponseStatus.SUCCESS && data.msgID === MsgID.FARE_TOP_UP_SUBMIT) {
                this.backToFare();
            }

            this.handleRetainMessages();
        });
    }

    private handleRetainMessages(): void {
        if (!this.selectedAmt && this.topUp.amount) {
            this.selectedAmt = this.topUp.amount;
        }

        if (!this.topUp.amounts?.length) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_MENU_BUTTON,
                msgSubID: MsgSubID.REQUEST,
                payload: { btn: 'TOP_UP' },
            });
        }
    }

    backToFare() {
        this.router.navigate([`${routerUrls.private.fare.url}`]);
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_BACK_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleSelectAmt(amt: number) {
        this.selectedAmt = amt;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_TOP_UP_SELECT_AMT,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                amount: +amt,
            },
        });
    }

    handleCancel() {
        this.selectedAmt = 0;
        this.store.dispatch(
            updateTopUp({
                payload: { ...this.topUp, timeout: undefined, msgID: MsgID.FARE_TOP_UP },
            }),
        );
    }

    handleConfirmTopUp() {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_TOP_UP_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                amount: this.selectedAmt,
            },
        });
    }

    handleFareBox() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.MAIN_CASH_FARE_BOX,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    removeTimeout() {
        clearTimeout(this.timeOutId);
        this.store.dispatch(updateTopUp({ payload: { timeout: undefined } }));
    }

    resetTopUp() {
        this.selectedAmt = 0;
        this.store.dispatch(
            updateTopUp({
                payload: {
                    ...this.topUp,
                    message: undefined,
                    status: undefined,
                    mode: undefined,
                    amount: undefined,
                    timeout: undefined,
                    msgID: undefined,
                },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        clearTimeout(this.timeOutId);
        this.resetTopUp();
    }
}
