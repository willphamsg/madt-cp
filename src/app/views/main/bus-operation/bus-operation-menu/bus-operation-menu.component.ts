import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgID, MsgSubID } from '@models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { updateStartTrip } from '@store/main/main.reducer';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';

@Component({
    selector: 'bus-operation-menu',
    imports: [RouterModule, TranslateModule, CommonPopUp],
    templateUrl: './bus-operation-menu.component.html',
    styleUrls: ['./bus-operation-menu.component.scss'],
})
export class BusOperationMenuComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    topics;
    private readonly mqttSubscriptions: Array<{
        topic: string;
        topicKey: string;
    }> = []; // Track MQTT topics for cleanup

    bustOperationButtons = [
        {
            id: 'start-trip-btn',
            imgSrc: '/assets/images/icons/bus-operation/start-trip.svg',
            label: 'START_TRIP',
            onClick: (evt?: Event) => {
                this.mqttService?.publishWithMessageFormat({
                    topic: this.topics.mainTab?.get,
                    msgID: MsgID?.START_TRIP,
                    msgSubID: MsgSubID?.REQUEST,
                    payload: {},
                });

                this.store.dispatch(
                    updateStartTrip({
                        payload: {
                            fare: {},
                            fms: {},
                            type: undefined,
                            busStopList: [],
                            services: [],
                            dir: undefined,
                            variantName: undefined,
                            status: undefined,
                            message: undefined,
                        },
                    }),
                );
            },
        },
        {
            id: 'end-shift-btn',
            imgSrc: '/assets/images/icons/bus-operation/end-shift.svg',
            label: 'DRIVER_LOG_OFF',
            onClick: (evt?: Event) => {
                this.mqttService?.publishWithMessageFormat({
                    topic: this.topics.mainTab?.get,
                    msgID: MsgID?.END_SHIFT,
                    msgSubID: MsgSubID?.NOTIFY,
                    payload: {},
                });
                this.displayEndShiftPopup = true;
                // this.navigateTo([routerUrls?.private?.main?.busOperation?.endShift]);
            },
        },
    ];
    displayEndShiftPopup: boolean = false;

    constructor(
        private readonly mqttService: MqttService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly soundService: SoundService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        // this.loading = true;
        // this.mqttService.connectionStatus$.pipe(takeUntil(this.destroy$)).subscribe((isConnected) => {
        //     if (isConnected) {
        //         this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
        //             if (configLoaded) {
        //                 const topics = this.mqttService.mqttConfig?.topics;
        //                 this.topics = topics;
        //                 if (topics) {
        //                     this.loading = true;
        //                     const startTripKey = `${TopicsKeys?.START_TRIP}-START_TRIP_BUS_OPERATION`;
        //                     console.log('startTripKey', startTripKey);
        //                     this.mqttService.subscribe({
        //                         topic: topics.mainTab?.response,
        //                         topicKey: startTripKey,
        //                         callback: (message) => {
        //                             const { header, payload } = JSON.parse(message);
        //                             if (
        //                                 header?.msgID === MsgID?.START_TRIP &&
        //                                 header?.msgSubID === MsgSubID?.RESPONSE
        //                             ) {
        //                                 console.log('Start Trip Response', payload);
        //                                 switch (payload?.type) {
        //                                     case StartTripTypes?.FMS_NOT_CONNECTED:
        //                                         this.navigateTo([
        //                                             routerUrls?.private?.main?.busOperation?.startTripNotConnected,
        //                                         ]);
        //                                         break;
        //                                     case StartTripTypes?.FMS_CONNECTED_PRO:
        //                                         this.navigateTo([
        //                                             routerUrls?.private?.main?.busOperation?.startTripConnectedPro,
        //                                         ]);
        //                                         break;
        //                                     case StartTripTypes?.FMS_CONNECTED_NON_PRO:
        //                                         this.navigateTo([
        //                                             routerUrls?.private?.main?.busOperation?.startTripConnectedNonPro,
        //                                         ]);
        //                                         break;
        //                                     case StartTripTypes?.FMS_CONNECTED_MISSING_TRIP_INFO:
        //                                         this.navigateTo([
        //                                             routerUrls?.private?.main?.busOperation
        //                                                 ?.startTripConnectedCannotFind,
        //                                         ]);
        //                                         break;
        //                                     case StartTripTypes?.FMS_FARE_BUS_STOP_MISMATCH:
        //                                         this.navigateTo([
        //                                             routerUrls?.private?.main?.busOperation?.fareBusStopMismatch,
        //                                         ]);
        //                                         break;
        //                                     default:
        //                                         break;
        //                                 }
        //                             }
        //                         },
        //                     });
        //                     this.mqttSubscriptions.push({
        //                         topic: topics.mainTab?.response,
        //                         topicKey: startTripKey,
        //                     });
        //                 }
        //             }
        //         });
        //     }
        // });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        // this.mqttSubscriptions.forEach((topic) => {
        //     this.mqttService.unsubscribe(topic?.topic, topic?.topicKey);
        // });
    }

    handleExternalDevices(event?: Event) {
        event?.preventDefault();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID.EXTERNAL_DEVICES,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    navigateTo(url) {
        this.router.navigate(url);
    }

    backToMain() {
        this.router.navigate(['/main']);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    handleEndShift(isConfirmed: boolean) {
        if (isConfirmed) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.END_SHIFT,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        } else {
            this.displayEndShiftPopup = false;
        }
    }
}
