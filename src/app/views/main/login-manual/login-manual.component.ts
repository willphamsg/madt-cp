import { Component, OnDestroy, OnInit } from '@angular/core';

import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { IManualLogin, MsgID, MsgSubID, IOutOfService, ResponseStatus } from '@models';
import { updateManualLogin, manualLogin, outOfService } from '@store/main/main.reducer';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';
import { applyKeyboardInput } from '@utils/keyboard-input.util';

@Component({
    selector: 'app-login-manual',
    imports: [TranslateModule, CustomKeyboardComponent, NotificationSoundDirective],
    templateUrl: './login-manual.component.html',
    styleUrl: './login-manual.component.scss',
})
export class LoginManualComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    manualLogin$: Observable<IManualLogin>;
    manualLoginData: IManualLogin = {};

    outOfService$: Observable<IOutOfService>;
    outOfServiceData: IOutOfService = {};

    inputValue: string = '';
    currentLanguage = '';

    pinError: string = '';
    dutyError: string = '';
    topics;
    intervalId;

    pinValue: string = '';
    staffIdValue: string = '';
    dutyValue: string = '';

    constructor(
        private readonly soundService: SoundService,
        private readonly translate: TranslateService,
        private readonly store: Store<AppState>,
        private readonly router: Router,
        private readonly mqttService: MqttService,
    ) {
        this.manualLogin$ = this.store.select(manualLogin);
        this.outOfService$ = this.store.select(outOfService);
        this.currentLanguage = this.translate.currentLang?.toUpperCase() || '';
    }

    ngOnInit() {
        this.manualLogin$.pipe(takeUntil(this.destroy$)).subscribe((data: IManualLogin) => {
            this.manualLoginData = data || {};
            // console.log('manualLoginData', this.manualLoginData);
            this.pinValue = '';
            this.staffIdValue = '';
            this.dutyValue = data['dutyNumber'] || '';

            clearTimeout(this.intervalId);
            // TODO: Need to handle timeout for staff id page.
            // Currently msg ID 28 is passed when staff id page timeout which TS will use and navigate to OOS page(expected behaviour).
            if (data.timeout && data.timeout > 0) {
                this.intervalId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.mainTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: {
                            msgID: data.msgSubID === MsgSubID.NOTIFY ? MsgID.MANUAL_LOGIN_PIN : MsgID.MANUAL_LOGIN_PIN2,
                        },
                    });
                }, data.timeout);
            }
        });

        this.outOfService$?.pipe(takeUntil(this.destroy$)).subscribe((outOfSer: IOutOfService) => {
            this.outOfServiceData = outOfSer;
        });

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    // handleRetryTapCard(): void {
    //     this.mqttService.publishWithFormat(this.topics?.mainTab?.response, {
    //         messaged: {
    //             status: AuthStatus?.SIGN_IN_TAP_CARD,
    //         },
    //         messageId: MessageId?.AUTH,
    //         messageType: MqttTypes?.BE_RESPONSE,
    //     });
    // }

    handleChangeInput(event: Event, key: string): void {
        const inputField = <HTMLInputElement>document.getElementById(key);
        const start = inputField?.selectionStart || (key === 'inputDutyIdField' ? 4 : 0);
        const end = inputField?.selectionEnd || (key === 'inputDutyIdField' ? 4 : 0);
        const target = <HTMLDivElement>event.target;
        const value = applyKeyboardInput(inputField, target, start, end);

        if (target.id === 'enterKey') {
            if (!value) return;
            this.submitValue(value, key);
        } else {
            this.removeErrorMessage(key);
        }

        if (key === 'inputPinField') {
            this.pinValue = inputField.value;
        } else if (key === 'inputStaffIdField') {
            this.staffIdValue = inputField.value;
        } else if (key === 'inputDutyField') {
            this.dutyValue = inputField.value;
        }
        inputField.focus();
    }

    private removeErrorMessage(field: string): void {
        this.pinError = '';
        this.dutyError = '';
        let message = this.manualLoginData?.message;
        if (this.manualLoginData.status === ResponseStatus.ERROR) {
            message = undefined; // Clear the message if it exists
        }
        this.store.dispatch(
            updateManualLogin({
                payload: { ...this.manualLoginData, message },
                msgID: this.manualLoginData.msgID,
            }),
        );
    }

    private submitValue(value, field: string): void {
        if (field === 'inputPinField') {
            this.pinError = '';
            // if (value.length > 6) {
            //     this.pinError = 'PIN_MAX_LENGTH';
            //     return;
            // }
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.MANUAL_LOGIN_PIN2,
                msgSubID: MsgSubID.REQUEST,
                payload: {
                    pin: value,
                },
            });
        } else if (field === 'inputStaffIdField') {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.MANUAL_LOGIN_STAFF_ID,
                msgSubID: MsgSubID.REQUEST,
                payload: {
                    staffId: value,
                },
            });
        } else if (field === 'inputDutyField') {
            this.dutyError = '';
            if (value.length > 4) {
                this.dutyError = 'DUTY_MAX_LENGTH';
                return;
            }
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.MANUAL_LOGIN_DUTY,
                msgSubID: MsgSubID.REQUEST,
                payload: {
                    dutyNumber: value,
                },
            });
        }
    }

    backToLogin() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.LOGIN_BACK,
            msgSubID: MsgSubID.NOTIFY,
            payload: { msgID: MsgID.MANUAL_LOGIN_PIN2 },
        });
        // this.router.navigate(['/main/login']);
        // this.store.dispatch(updateManualLogin({ payload: {} }));
    }

    backToEnterPIN() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.LOGIN_BACK,
            msgSubID: MsgSubID.NOTIFY,
            payload: { msgID: MsgID.MANUAL_LOGIN_STAFF_ID },
        });
        // this.store.dispatch(updateManualLogin({ payload: {} }));
    }

    backToEnterStaffId() {
        this.store.dispatch(
            updateManualLogin({ payload: { status: ResponseStatus.SUCCESS }, msgID: MsgID.MANUAL_LOGIN_PIN2 }),
        );
    }

    ngOnDestroy() {
        clearTimeout(this.intervalId);
        this.destroy$.next();
        this.destroy$.complete();

        this.store.dispatch(updateManualLogin({ payload: {} }));
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
