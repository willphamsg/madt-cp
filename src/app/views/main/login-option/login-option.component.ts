import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router } from '@angular/router';
import { AppState } from '@store/app.state';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MsgID, MsgSubID, ILoginOption } from '@models';
import { MqttService } from '@services/mqtt.service';
import { loginOption } from '@store/main/main.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'login-option',
    imports: [TranslateModule],
    templateUrl: './login-option.component.html',
    styleUrl: './login-option.component.scss',
})
export class LoginOptionComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    topics;
    loginOption$: Observable<ILoginOption> = this.store.select(loginOption);
    loginOptionData: ILoginOption = {};
    timeOutId;

    loginOptionButtons = [
        {
            id: 'driver-login-btn',
            imgSrc: '/assets/images/icons/main/bus.svg',
            label: 'DRIVER_LOGIN',
            onClick: (evt?: Event) => {
                this.mqttService?.publishWithMessageFormat({
                    topic: this.topics.mainTab?.get,
                    msgID: MsgID?.LOGIN_ROLE_SUBMIT,
                    msgSubID: MsgSubID?.NOTIFY,
                    payload: { role: 1 },
                });
            },
        },
        {
            id: 'ms-login-btn',
            imgSrc: '/assets/images/icons/main/gear.svg',
            label: 'MAINTENANCE_LOGIN',
            onClick: (evt?: Event) => {
                this.mqttService?.publishWithMessageFormat({
                    topic: this.topics.mainTab?.get,
                    msgID: MsgID?.LOGIN_ROLE_SUBMIT,
                    msgSubID: MsgSubID?.NOTIFY,
                    payload: { role: 2 },
                });
            },
        },
    ];

    constructor(
        private readonly mqttService: MqttService,
        protected store: Store<AppState>,
        private readonly soundService: SoundService,
        private readonly router: Router,
    ) {}

    ngOnInit() {
        this.loginOption$.pipe(takeUntil(this.destroy$)).subscribe((data: ILoginOption) => {
            this.loginOptionData = data || {};
            // console.log('signInTapCardData', this.signInTapCardData);
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
                    this.router.navigate(['/main/login']);
                }, data.timeout);
            }
        });

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        clearTimeout(this.timeOutId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
