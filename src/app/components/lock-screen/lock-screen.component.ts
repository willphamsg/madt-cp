import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
import { applyKeyboardInput } from '@utils/keyboard-input.util';

@Component({
    selector: 'lock-screen',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule, NotificationSoundDirective],
    templateUrl: './lock-screen.component.html',
    styleUrls: ['./lock-screen.component.scss'],
})
export class LockScreenComponent implements OnInit, OnDestroy {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;
    private readonly destroy$ = new Subject<void>();

    lockScreen$: Observable<ILockScreen> = this.store.select(lockScreen);
    lockScreen: ILockScreen = {};

    pinValue: string = '';
    pinError: string = '';
    topics;

    timeOutId;

    @Input() topic: string = '';

    constructor(
        private readonly router: Router,
        private readonly activeRoute: ActivatedRoute,
        private readonly mqttService: MqttService,
        private readonly store: Store<AppState>,
        private readonly soundService: SoundService,
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
        const target = <HTMLDivElement>event.target;
        const value = applyKeyboardInput(inputField, target);

        if (target.id === 'enterKey') {
            if (!value) return;
            this.handleConfirmUnlock(value);
        } else {
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
