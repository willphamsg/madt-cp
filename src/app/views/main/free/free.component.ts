import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { free, updateFreeCVs } from '@app/store/main/main.reducer';
import { routerUrls } from '@app/app.routes';

import { IFree, MsgID, MsgSubID } from '@models';
import { MqttService } from '@services/mqtt.service';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'free',
    imports: [TranslateModule, CommonPopUp],
    templateUrl: './free.component.html',
    styleUrls: ['./free.component.scss'],
})
export class FreeComponent implements OnDestroy, OnInit {
    private readonly destroy$ = new Subject<void>();
    free$: Observable<IFree> = this.store.select(free);
    free: IFree = {
        freeMode: false,
    };

    topics;

    //implement timeout
    timeOutId;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly translate: TranslateService,
        private readonly store: Store<AppState>,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.free$.pipe(takeUntil(this.destroy$)).subscribe((data: IFree) => {
            this.free = data;
            // console.log('free', this.free);
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

    handleConfirmFreeRideMode(): void {
        clearTimeout(this.timeOutId);
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_FREE_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: { freeMode: !this.free.freeMode },
        });
        this.store.dispatch(updateFreeCVs({ payload: { ...this.free, timeout: undefined } }));
    }

    handleCancelFreeRideMode(): void {
        clearTimeout(this.timeOutId);
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_FREE_CANCEL,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
        this.store.dispatch(updateFreeCVs({ payload: { ...this.free, timeout: undefined } }));
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
        clearTimeout(this.timeOutId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
