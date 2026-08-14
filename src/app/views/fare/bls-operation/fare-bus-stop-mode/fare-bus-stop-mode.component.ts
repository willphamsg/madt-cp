import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { IFareBusStopMode, MsgID, MsgSubID, ResponseStatus, IPosnStatus } from '@models';
import { fareBusStopMode, updateFareBusStopMode } from '@store/fare/fare.reducer';
import { posnStatus } from '@store/global/global.reducer';

@Component({
    selector: 'fare-bus-stop-mode',
    imports: [CommonModule, TranslateModule, RouterModule],
    templateUrl: './fare-bus-stop-mode.component.html',
    styleUrls: ['./fare-bus-stop-mode.component.scss'],
})
export class FareBusStopMode implements OnInit, OnDestroy {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;
    mode: number = 0; // 1 Manual, 2: Auto
    finaleMode: number = 0;

    private readonly destroy$ = new Subject<void>();
    private readonly fareBusStopMode$: Observable<IFareBusStopMode> = this.store.select(fareBusStopMode);
    public posnStatus$: Observable<IPosnStatus | undefined> = this.store.select(posnStatus);
    fareBusStopMode: IFareBusStopMode = {};
    topics;

    timeOutId;

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {}

    ngOnInit(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.fareBusStopMode$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.fareBusStopMode = data;

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.fareTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { msgID: data.msgID },
                    });
                    this.handleCancel();
                }, data.timeout);
            }

            if (
                (data.msgID === MsgID.FARE_BUS_STOP_MODE && !this.finaleMode) ||
                data.msgID === MsgID.FARE_BUS_STOP_MODE_SUBMIT
            ) {
                this.finaleMode = data.mode || 0;
            }
            this.handleRetainMessages();
        });
    }

    private handleRetainMessages(): void {
        if (!this.mode && this.fareBusStopMode.mode) {
            this.mode = this.fareBusStopMode.mode;
        }
    }

    mappingPosnStatus(num: number): string {
        switch (num) {
            case 1:
                return 'FMS';
            case 2:
                return 'FARE_SYSTEM';
            case 3:
                return 'NONE';
            default:
                return '';
        }
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_BACK_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleCancel() {
        this.store.dispatch(
            updateFareBusStopMode({
                payload: { ...this.fareBusStopMode, timeout: undefined, msgID: MsgID.FARE_BUS_STOP_MODE },
            }),
        );
    }

    handleSelectFareBusStopMode(mode: number) {
        this.mode = mode;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_BUS_STOP_MODE_SELECT,
            msgSubID: MsgSubID.REQUEST,
            payload: { mode },
        });
    }

    handleConfirmFareBusStopMode() {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: { mode: this.mode },
        });
    }

    backSelectMode() {
        this.store.dispatch(
            updateFareBusStopMode({ payload: { ...this.fareBusStopMode, msgID: MsgID.FARE_BUS_STOP_MODE } }),
        );
    }

    removeTimeout() {
        this.store.dispatch(updateFareBusStopMode({ payload: { ...this.fareBusStopMode, timeout: undefined } }));
        clearTimeout(this.timeOutId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        clearTimeout(this.timeOutId);
        this.store.dispatch(updateFareBusStopMode({ payload: { status: undefined, msgID: undefined } }));
    }
}
