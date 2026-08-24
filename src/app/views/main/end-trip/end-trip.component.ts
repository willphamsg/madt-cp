import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { routerUrls } from '@app/app.routes';

import { MqttService } from '@services/mqtt.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { IEndTrip, MsgID, MsgSubID, ResponseStatus } from '@models';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { endTripInfo, updateEndTripInfo } from '@store/main/main.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'end-trip',
    imports: [RouterModule, TranslateModule],
    templateUrl: './end-trip.component.html',
    styleUrls: ['./end-trip.component.scss'],
})
export class EndTripComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    endTripInfo$: Observable<IEndTrip> = this.store.select(endTripInfo);
    endTripInfoData: IEndTrip = {
        service: 0,
        direction: '',
        busStopList: [],
        firstBusStop: {},
        lastBusStop: {},
        reasonList: [],
    };

    topics;

    //implement timeout
    timeOutId;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly store: Store<AppState>,
    ) {}

    ngOnInit() {
        this.endTripInfo$.pipe(takeUntil(this.destroy$)).subscribe((data: IEndTrip) => {
            this.endTripInfoData = data || {};
            console.log('endTripInfoData', this.endTripInfoData);

            // if (
            //     this.endTripInfoData?.msgID === MsgID.END_TRIP_SUBMIT &&
            //     this.endTripInfoData?.status === ResponseStatus.SUCCESS
            // ) {
            //     this.navigateToBusOperation();
            //     // this.store.dispatch(updateIsOnTrip({ payload: false }));
            //     // this.mqttService.publishWithMessageFormat({
            //     //     topic: this.topics.fareTab?.response,
            //     //     msgID: MsgID.END_TRIP_SUCCESS,
            //     //     msgSubID: MsgSubID.NOTIFY,
            //     // });
            // }

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.mainTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { msgID: data.msgID },
                    });
                    if (data.msgID === MsgID.END_TRIP) {
                        this.handleConfirm(false);
                    } else if (data.msgID === MsgID.END_TRIP_TYPE) {
                        this.handleCancelEndTrip();
                    }
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
        this.resetEndTripInfo();
        this.router.navigate([routerUrls?.private?.main?.busStopInformation]);
    }

    navigateToBusOperation() {
        this.router.navigate([routerUrls?.private?.main?.busOperation?.url]);
    }

    handleConfirm(isConfirm: boolean) {
        if (isConfirm) {
            clearTimeout(this.timeOutId);
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.END_TRIP_TYPE,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        } else {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.END_TRIP_CANCEL,
                msgSubID: MsgSubID.NOTIFY,
                payload: {},
            });
            this.backToMain();
        }
    }

    handleCancelEndTrip() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.END_TRIP_SUBMIT_CANCEL,
            msgSubID: MsgSubID.NOTIFY,
            payload: {},
        });
        this.backToMain();
    }

    handleConfirmValue() {
        clearTimeout(this.timeOutId);
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.END_TRIP_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                // ...this.endTripInfoData,
                service: this.endTripInfoData.service,
                direction: this.endTripInfoData.direction,
                // endTripType: this.endTripType.toUpperCase(),
                firstBusStop: this.endTripInfoData.firstBusStop.Busid,
                lastBusStop: this.endTripInfoData.lastBusStop.Busid,
                variantName: this.endTripInfoData.variantName,
            },
        });
        // this.step = 0;
    }

    resetEndTripInfo() {
        this.store.dispatch(
            updateEndTripInfo({
                payload: {
                    status: 0,
                    title: '',
                    direction: '',
                    variantName: '',
                    service: 0,
                    firstBusStop: {},
                    lastBusStop: {},
                    busStopList: [],
                    reasonList: [],
                },
                msgID: undefined,
            }),
        );
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.resetEndTripInfo();
        clearTimeout(this.timeOutId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
