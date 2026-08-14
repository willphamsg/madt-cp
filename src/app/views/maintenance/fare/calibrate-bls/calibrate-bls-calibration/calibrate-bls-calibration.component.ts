import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IBlsCalibration, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { blsCalibration, updateBlsCalibration } from '@store/maintenance/maintenance.reducer';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { routerUrls } from '@app/app.routes';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'maintenance-calibrate-bls-calibration',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule, CommonPopUp],
    templateUrl: './calibrate-bls-calibration.component.html',
    styleUrls: ['./calibrate-bls-calibration.component.scss'],
})
export class CalibrateBLSCalibrationComponent implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;
    MsgID = MsgID;

    private destroy$ = new Subject<void>();
    private blsCalibration$: Observable<IBlsCalibration>;
    blsCalibration: IBlsCalibration = {};
    inputValue: string = '';
    topics;

    timeOutId;

    constructor(
        private soundService: SoundService,
        private router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
    ) {
        this.blsCalibration$ = this.store.select(blsCalibration);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.blsCalibration$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.blsCalibration = data;

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.fareTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { msgID: data.msgID },
                    });
                    this.handleCancelDistance();
                }, data.timeout);
            }
            // console.log('manualCalibrateBls', this.manualCalibrateBls);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(updateBlsCalibration({ payload: {} }));
        clearTimeout(this.timeOutId);
    }

    handleStart(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleStop(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_STOP,
            msgSubID: MsgSubID.NOTIFY,
            payload: {},
        });
        this.store.dispatch(updateBlsCalibration({ payload: {} }));
    }

    handleSendCommandToBls(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleChangeInput(event: Event): void {
        const inputField = <HTMLInputElement>document.getElementById('inputField');
        const start = inputField?.selectionStart || 0;
        const end = inputField?.selectionEnd || 0;
        const value = inputField.value;
        const target = <HTMLDivElement>event.target;

        if (target.id === 'backspaceKey') {
            if (start === end) {
                // No selection, just delete the character before the cursor
                inputField.value = value.slice(0, start - 1) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start - 1;
            } else {
                // There is a selection, delete the selected text
                inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
            }
        } else if (target.id === 'enterKey') {
            if (!value) return;
            this.inputValue = value;
            this.submitDistance();
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
        }

        inputField.focus();
    }

    private submitDistance() {
        if (!this.inputValue) return;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE,
            msgSubID: MsgSubID.REQUEST,
            payload: { distance: Number(this.inputValue) },
        });
    }

    handleConfirmDistance(isConfirm: boolean) {
        this.clearExistingTimeout();
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.maintenance?.get,
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_RESULT,
                msgSubID: MsgSubID.REQUEST,
                payload: { distance: Number(this.inputValue) },
            });
        } else {
            this.handleCancelDistance();
        }
    }

    handleCancelDistance() {
        this.store.dispatch(
            updateBlsCalibration({
                payload: {
                    msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
                    status: ResponseStatus.SUCCESS,
                },
            }),
        );
    }

    private clearExistingTimeout(): void {
        if (this.timeOutId) {
            clearTimeout(this.timeOutId);
            this.timeOutId = undefined;
        }
    }

    handleCloseResult() {
        this.inputValue = '';
        this.handleBackToCalibrateBls();
    }

    handleBackToCalibrateBls() {
        this.router.navigate([`${routerUrls.private.maintenance.fare.calibrateBLS.url}`]);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
