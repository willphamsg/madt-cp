import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { updateActiveCVs } from '@app/store/main/main.reducer';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { frontDoor, updateFrontDoor } from '@store/main/main.reducer';
import { routerUrls } from '@app/app.routes';
import { MsgID, MsgSubID, ResponseStatus, IFrontDoor } from '@models';

import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';

@Component({
    selector: 'front-door',
    imports: [TranslateModule, CommonPopUp],
    templateUrl: './front-door.component.html',
    styleUrls: ['./front-door.component.scss'],
})
export class FrontDoorComponent implements OnDestroy, OnInit {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;
    private readonly destroy$ = new Subject<void>();
    cvNum: number = 0;
    frontDoor$: Observable<IFrontDoor> = this.store.select(frontDoor);
    frontDoor: IFrontDoor = {};
    topics;
    timeOutId;

    constructor(
        private readonly router: Router,
        private readonly store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {}

    ngOnInit(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.frontDoor$.pipe(takeUntil(this.destroy$)).subscribe((data: IFrontDoor) => {
            this.frontDoor = data;

            if (data.cvNum) {
                this.cvNum = data.cvNum;
            }

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.mainTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { msgID: data.msgID },
                    });
                    this.backToMain();
                }, data.timeout);
            }
        });
    }

    backToMain(): void {
        this.router.navigate([routerUrls?.private?.main?.busStopInformation]);
    }

    handleChangeCvMode(cv: number): void {
        this.cvNum = cv;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_FRONT_DOOR_SELECT_CV,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                cvNum: cv,
            },
        });
        this.store.dispatch(
            updateFrontDoor({
                payload: {
                    ...this.frontDoor,
                    cvNum: cv,
                },
            }),
        );
    }

    handleCancel(): void {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_FRONT_DOOR_CANCEL,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleUpdateCV(): void {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_FRONT_DOOR_CONFIRM,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                cvNum: this.cvNum,
            },
        });
    }

    handleClose(): void {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_FRONT_DOOR_TERMINATE,
            msgSubID: MsgSubID.NOTIFY,
            payload: {},
        });
        this.backToMain();
    }

    removeTimeout() {
        clearTimeout(this.timeOutId);
        this.store.dispatch(
            updateFrontDoor({
                payload: { ...this.frontDoor, timeout: undefined },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }
}
