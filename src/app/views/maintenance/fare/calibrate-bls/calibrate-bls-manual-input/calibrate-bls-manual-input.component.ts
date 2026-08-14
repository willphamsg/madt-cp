import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IManualCalibrateBls, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { manualCalibrateBls, updateManualCalibrateBls } from '@store/maintenance/maintenance.reducer';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { routerUrls } from '@app/app.routes';
import { SoundService } from '@services/sound.service';
@Component({
    selector: 'maintenance-calibrate-bls-manual-input',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule, CommonPopUp],
    templateUrl: './calibrate-bls-manual-input.component.html',
    styleUrls: ['./calibrate-bls-manual-input.component.scss'],
})
export class CalibrateBLSManualInputComponent implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;
    MsgID = MsgID;

    private destroy$ = new Subject<void>();
    private manualCalibrateBls$: Observable<IManualCalibrateBls>;
    manualCalibrateBls: IManualCalibrateBls = {};
    inputValue: string = '';
    topics;

    timeOutId;

    constructor(
        private soundService: SoundService,
        private router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
    ) {
        this.manualCalibrateBls$ = this.store.select(manualCalibrateBls);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.manualCalibrateBls$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.manualCalibrateBls = data;

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.fareTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { msgID: data.msgID },
                    });
                    this.handleBackToCalibrateBls();
                }, data.timeout);
            }
            // console.log('manualCalibrateBls', this.manualCalibrateBls);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateManualCalibrateBls({
                payload: { newFactor: undefined },
            }),
        );
        clearTimeout(this.timeOutId);
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
            this.submitNewCalibFactor(value);
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
        }

        inputField.focus();
    }

    private submitNewCalibFactor(value: string) {
        if (!value) return;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
            msgSubID: MsgSubID.REQUEST,
            payload: { input: Number(value) },
        });
    }

    handleConfirmNewFactor(isConfirm: boolean) {
        this.clearExistingTimeout();
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.maintenance?.get,
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        } else {
            this.handleBackToCalibrateBls();
        }
    }

    private clearExistingTimeout(): void {
        if (this.timeOutId) {
            clearTimeout(this.timeOutId);
            this.timeOutId = undefined;
        }
    }

    handleClosePopUp() {
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
