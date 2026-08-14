import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { ICVModeControl, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { cvModeControl, updateCVModeControl } from '@store/fare/fare.reducer';
import { routerUrls } from '@app/app.routes';

@Component({
    selector: 'cv-mode-control',
    imports: [RouterModule, TranslateModule],
    templateUrl: './cv-mode-control.component.html',
    styleUrls: ['./cv-mode-control.component.scss'],
})
export class CVModeControlComponent implements OnInit, OnDestroy {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;
    private readonly destroy$ = new Subject<void>();
    private readonly cvModeControl$: Observable<ICVModeControl>;
    cvModeControl: ICVModeControl = {};
    cvMode: number | null = null;

    topics;
    timeOutId;

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {
        this.cvModeControl$ = this.store.select(cvModeControl);
    }
    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                // this.mqttService.publishWithMessageFormat({
                //     topic: this.topics?.fareTab?.get,
                //     msgID: MsgID.FARE_CV_MODE_CONTROL,
                //     msgSubID: MsgSubID.REQUEST,
                //     payload: {},
                // });
            }
        });

        this.cvModeControl$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.cvModeControl = data;

            if (data.status === ResponseStatus.SUCCESS && data.msgID === MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM) {
                this.backToCvOperation();
            }

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

            this.handleRetainMessages();
        });
    }

    private handleRetainMessages() {
        if (this.cvMode === null && this.cvModeControl.cvMode !== undefined) {
            this.cvMode = this.cvModeControl.cvMode;
        }
    }

    backToCvOperation() {
        this.router.navigate([`${routerUrls.private.fare.cvOperation.url}`]);
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CV_OPERATION_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleSelectStatus(cvMode: number) {
        this.cvMode = cvMode;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CO_CV_MODE_CONTROL_SELECT,
            msgSubID: MsgSubID.REQUEST,
            payload: { cvMode },
        });
    }

    handleConfirm(isConfirm: boolean) {
        clearTimeout(this.timeOutId);
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM,
                msgSubID: MsgSubID.REQUEST,
                payload: { cvMode: this.cvMode },
            });
        } else {
            this.cvMode = null;
            this.store.dispatch(
                updateCVModeControl({
                    payload: {
                        msgID: MsgID.FARE_CO_CV_MODE_CONTROL,
                        status: undefined,
                        timeout: undefined,
                    },
                }),
            );
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
