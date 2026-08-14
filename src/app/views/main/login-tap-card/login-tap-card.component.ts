import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { tapCardLogin, outOfService, updateTapCardLogin } from '@store/main/main.reducer';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import {
    ITapCardLogin,
    MsgID,
    MsgSubID,
    IOutOfService,
    ResponseStatus,
    DEFAULT_TIMEOUT,
    LocalStorageKey,
} from '@models';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'app-login-tap-card',
    imports: [CommonModule, MatButton, TranslateModule, CustomKeyboardComponent, NotificationSoundDirective],
    templateUrl: './login-tap-card.component.html',
    styleUrl: './login-tap-card.component.scss',
})
export class LoginTapCardComponent implements OnInit {
    private destroy$ = new Subject<void>();
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    signInTapCard$: Observable<ITapCardLogin> = this.store.select(tapCardLogin);
    signInTapCardData: ITapCardLogin = {};

    outOfService$: Observable<IOutOfService> = this.store.select(outOfService);
    outOfServiceData: IOutOfService = {};

    inputValue: string = '';
    dutyInputValue: string = '';
    currentLanguage = '';

    pinError: string = '';
    dutyError: string = '';
    topics;
    intervalId;
    timeoutId;

    constructor(
        private soundService: SoundService,
        private translate: TranslateService,
        private store: Store<AppState>,
        private router: Router,
        private mqttService: MqttService,
        private localStorageService: LocalStorageService,
    ) {}

    ngOnInit() {
        this.signInTapCard$.pipe(takeUntil(this.destroy$)).subscribe((data: ITapCardLogin) => {
            this.signInTapCardData = data || {};
            // console.log('signInTapCardData', this.signInTapCardData);

            clearTimeout(this.intervalId);
            clearTimeout(this.timeoutId);
            if (data.timeout && data.timeout > 0) {
                this.intervalId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.mainTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { msgID: data.msgID },
                    });
                }, data.timeout);
            }

            if (
                (data.msgID === MsgID.BC_TAP_CARD_LOGIN || data.msgID === MsgID.MS_TAP_CARD_LOGIN) &&
                data.status === ResponseStatus.ERROR
            ) {
                this.timeoutId = setTimeout(() => {
                    this.router.navigate(['/main/login']);
                }, DEFAULT_TIMEOUT);
            } else {
                clearTimeout(this.timeoutId);
            }
        });

        this.localStorageService
            .watch(LocalStorageKey.LANGUAGE)
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
                if (val) {
                    const language: string = JSON.parse(val);
                    this.currentLanguage = language?.toUpperCase();
                } else {
                    this.currentLanguage = 'EN';
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
    // this.mqttService.publishWithFormat(this.topics?.mainTab?.response, {
    //     messaged: {
    //         status: AuthStatus?.SIGN_IN_TAP_CARD,
    //     },
    //     messageId: MessageId?.AUTH,
    //     messageType: MqttTypes?.BE_RESPONSE,
    // });
    // }

    handleChangeInput(event: Event, type: string, isMS?: boolean): void {
        const inputField = <HTMLInputElement>document.getElementById('inputField');
        const start = inputField?.selectionStart || 4;
        const end = inputField?.selectionEnd || 4;
        const value = inputField.value;
        const target = <HTMLDivElement>event.target;
        if (target.id === 'backspaceKey') {
            if (start === end) {
                // No selection, just delete the character before the cursor
                inputField.value = value.slice(0, start - 1) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start - 1;
                this.removeErrorMessage(type);
            } else {
                // There is a selection, delete the selected text
                inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
                this.removeErrorMessage(type);
            }
        } else if (target.id === 'enterKey') {
            if (!value) return;
            this.inputValue = value;
            if (type === 'PIN') {
                this.submitPIN(isMS);
            } else {
                this.submitDutyNumber();
            }
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            this.removeErrorMessage(type);
        }
        inputField.focus();
    }

    private removeErrorMessage(type: string): void {
        this.pinError = '';
        this.dutyError = '';
        // console.log('Removing PIN error message');
        // console.log('Dispatching updateTapCardLogin with empty payload', this.signInTapCardData);
        let message = this.signInTapCardData?.message;
        if (this.signInTapCardData.status === ResponseStatus.ERROR) {
            message = undefined; // Clear the message if it exists
        }
        this.store.dispatch(
            updateTapCardLogin({
                payload: {
                    ...this.signInTapCardData,
                    message,
                },
                msgID: this.signInTapCardData?.msgID,
            }),
        );
    }

    private submitPIN(isMS?: boolean): void {
        this.pinError = '';
        // if (this.inputValue.length > 6) {
        //     this.pinError = 'PIN_MAX_LENGTH';
        //     return;
        // }
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: isMS ? MsgID.MS_TAP_CARD_PIN : MsgID.BC_TAP_CARD_PIN,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                pin: this.inputValue,
            },
        });

        this.store.dispatch(
            updateTapCardLogin({
                payload: {
                    ...this.signInTapCardData,
                    pin: this.inputValue,
                    timeout: undefined,
                },
                msgID: this.signInTapCardData?.msgID,
            }),
        );
    }

    private submitDutyNumber(): void {
        this.dutyError = '';
        if (this.inputValue.length > 4) {
            this.dutyError = 'DUTY_MAX_LENGTH';
            return;
        }
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BC_TAP_CARD_DUTY,
            msgSubID: MsgSubID.REQUEST,
            payload: { dutyNumber: this.inputValue },
        });
    }

    backToLogin(isMS?: boolean) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.LOGIN_BACK,
            msgSubID: MsgSubID.NOTIFY,
            payload: { msgID: isMS ? MsgID.MS_TAP_CARD_PIN : MsgID.BC_TAP_CARD_PIN },
        });
        // this.router.navigate(['/main/login']);
    }

    handleChangeLanguage(lang: string): void {
        // this.currentLanguage = lang;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.LANGUAGE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language: lang },
        });

        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.tcToAllTabs,
            msgID: MsgID.LANGUAGE_SETTING,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language: lang },
            opts: { retain: false },
        });
        this.localStorageService.setItem(LocalStorageKey.LANGUAGE, JSON.stringify(lang));
    }

    ngOnDestroy() {
        clearTimeout(this.intervalId);
        clearTimeout(this.timeoutId);
        this.destroy$.next();
        this.destroy$.complete();

        this.store.dispatch(
            updateTapCardLogin({
                payload: {},
                msgID: undefined,
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
