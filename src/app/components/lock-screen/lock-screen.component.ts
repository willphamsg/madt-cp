import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';

import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { MsgID, MsgSubID, ResponseStatus, ILockScreen } from '@models';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { lockScreen, updateLockScreen } from '@store/main/main.reducer';
import { NotificationSoundDirective } from '@directives/notification-sound.directive';

@Component({
    selector: 'lock-screen',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule, NotificationSoundDirective],
    templateUrl: './lock-screen.component.html',
    styleUrls: ['./lock-screen.component.scss'],
})
export class LockScreenComponent implements OnInit {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;
    private destroy$ = new Subject<void>();

    lockScreen$: Observable<ILockScreen> = this.store.select(lockScreen);
    lockScreen: ILockScreen = {};

    pinValue: string = '';
    pinError: string = '';
    topics;

    timeOutId;

    @Input() topic: string = '';

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
        private mqttService: MqttService,
        private store: Store<AppState>,
        private soundService: SoundService,
    ) {}

    ngOnInit() {
        this.lockScreen$.pipe(takeUntil(this.destroy$)).subscribe((data: ILockScreen) => {
            this.lockScreen = data || {};
            this.pinValue = '';

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
        });

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    backToMain() {
        this.router.navigate(['/main']);
    }

    handleBack() {
        clearTimeout(this.timeOutId);
        this.store.dispatch(
            updateLockScreen({
                payload: { ...this.lockScreen, msgID: MsgID.NOTIFY_TO_LOCK, message: undefined },
            }),
        );
    }

    handleUnlock() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topic,
            msgID: MsgID.UNLOCK_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleConfirmUnlock(code: string) {
        if (!code) return;
        this.pinError = '';
        this.store.dispatch(
            updateLockScreen({
                payload: { ...this.lockScreen, message: undefined },
            }),
        );
        // if (code.length > 6) {
        //     this.pinError = 'PIN_MAX_LENGTH';
        //     return;
        // }
        this.mqttService.publishWithMessageFormat({
            topic: this.topic,
            msgID: MsgID.MANUAL_LOGIN_PIN2,
            msgSubID: MsgSubID.REQUEST,
            payload: { pin: code },
        });
    }

    handleChangeInput(event: Event): void {
        const inputField = <HTMLInputElement>document.getElementById('inputField');
        const start = inputField?.selectionStart || 0;
        const end = inputField?.selectionEnd || 0;
        const value = inputField.value;
        const target = <HTMLDivElement>event.target;
        // clearTimeout(this.timeOutId);

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
            this.removeErrorMessage();
        } else if (target.id === 'enterKey') {
            if (!value) return;
            this.handleConfirmUnlock(value);
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            this.removeErrorMessage();
        }

        this.pinValue = inputField.value || '';
        inputField.focus();
    }

    removeErrorMessage(): void {
        this.store.dispatch(
            updateLockScreen({
                payload: { ...this.lockScreen, message: undefined },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        clearTimeout(this.timeOutId);
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateLockScreen({
                payload: {
                    msgID: undefined,
                    message: undefined,
                    status: undefined,
                },
            }),
        );
    }
}
