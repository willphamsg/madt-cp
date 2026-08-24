import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { Router, RouterOutlet } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { DummyInitService } from '@dummyData/init-dummy-data';
import { environment } from '@env/environment';
import { SafeJsonService } from '@app/services/safe-json.service';
import { LocalStorageService } from '@services/local-storage.service';
import { AppState } from '@store/app.state';
import {
    updateConnectionStatus,
    globalError,
    updateGlobalError,
    updateLocationMode,
    updatePosnStatus,
} from '@store/global/global.reducer';
import { Store } from '@ngrx/store';
import {
    MsgID,
    MsgSubID,
    TopicsKeys,
    LocalStorageKey,
    IGlobalError,
    DEFAULT_TIMEOUT,
    IConnectionStatus,
} from '@models';
import { ShuttingDownComponent } from '@components/shutting-down/shutting-down.component';
import { Disconnect } from '@components/disconnect/disconnect.component';
import { HeaderComponent } from './header/header.component';
import { SoundService } from '@services/sound.service';
@Component({
    selector: 'app-layout',
    imports: [TranslateModule, ShuttingDownComponent, Disconnect, HeaderComponent, RouterOutlet],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private connectionSubscription: Subscription | null = null;
    private messageSubscription: Subscription | null = null;
    isConnecting: boolean = true;
    disconnectCount: number = 0;

    shuttingDown: { show: boolean; message?: string } = {
        show: false,
    };
    topics;

    globalError$: Observable<IGlobalError> = this.store.select(globalError);
    error: IGlobalError | null = null;
    errorTimeout;

    deviceStatus: IConnectionStatus | null = null;
    listOfMsgInQueue: number[] = [];
    tcNoResponseTimeout;

    lang: string = '';

    private readonly mqttSubscriptions: Array<{
        topic: string;
        topicKey: string;
    }> = []; // Track MQTT topics for cleanup

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly translate: TranslateService,
        private readonly dummyInit: DummyInitService,
        private readonly safeJsonService: SafeJsonService,
        private readonly store: Store<AppState>,
        private readonly localStorageService: LocalStorageService,
        private readonly cdr: ChangeDetectorRef,
    ) {
        this.translate.setDefaultLang('en');
    }

    ngOnInit() {
        this.mqttService.connect();
        this.mqttService.userDataInit({
            id: 100,
        });

        this.connectionSubscription = this.mqttService.connectionStatus$
            .pipe(takeUntil(this.destroy$))
            .subscribe((status) => {
                if (status === true) {
                    console.log('Connected to MQTT broker, subscribing to topics.', this.disconnectCount);
                    this.isConnecting = false;
                    this.subscribeToTopics();
                } else if (status === false) {
                    this.isConnecting = true;
                    // this.disconnectCount++;
                    console.log('Still trying to connect to MQTT broker.');
                }
            });

        this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
            // console.log(' this.shuttingDown :', this.shuttingDown);
            if (this.shuttingDown.show) {
                this.shuttingDown = {
                    show: false,
                    message: '',
                };
            }
        });

        this.mqttService.messageFormatError$.pipe(takeUntil(this.destroy$)).subscribe((errMsg) => {
            if (errMsg) {
                const validationTopic = this.topics?.messageValidation?.get;
                if (!validationTopic) {
                    return;
                }

                this.mqttService.publishWithMessageFormat({
                    topic: validationTopic,
                    msgID: MsgID.VALIDATE_MESSAGE_FORMAT,
                    msgSubID: MsgSubID.NOTIFY,
                    payload: { ...errMsg },
                    opts: { retain: false },
                });
            }
        });

        combineLatest({
            globalError: this.globalError$,
            tcNoResponse: this.mqttService.isTCNoResponse$,
            language: this.localStorageService.watch(LocalStorageKey.LANGUAGE),
            deviceStatus: this.localStorageService.watch(LocalStorageKey.DEVICE_STATUS),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe((state) => this.processState(state));

        // this.globalError$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
        //     if (error && (error.code || error.message)) {
        //         if (this.errorTimeout) {
        //             clearTimeout(this.errorTimeout);
        //         }
        //         this.error = error;
        //         if (error.timeout && error.timeout > 0) {
        //             this.errorTimeout = setTimeout(() => {
        //                 this.error = null;
        //                 this.store.dispatch(updateGlobalError({ payload: { code: '', message: '' } }));
        //             }, error.timeout);
        //         } else {
        //             this.store.dispatch(updateGlobalError({ payload: { code: '', message: '' } }));
        //         }
        //     }
        // });

        // this.localStorageService
        //     .watch(LocalStorageKey.DEVICE_STATUS)
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((val) => {
        //         if (val) {
        //             const status: IConnectionStatus = JSON.parse(val);
        //             this.deviceStatus = status;
        //         }
        //     });

        // this.mqttService.isTCNoResponse$.pipe(takeUntil(this.destroy$)).subscribe((responseStatus) => {
        //     this.listOfMsgInQueue = responseStatus;
        //     if (this.tcNoResponseTimeout) {
        //         clearTimeout(this.tcNoResponseTimeout);
        //     }
        //     if (this.listOfMsgInQueue) {
        //         this.tcNoResponseTimeout = setTimeout(() => {
        //             this.listOfMsgInQueue = false;
        //         }, DEFAULT_TIMEOUT);
        //     }
        // });

        // this.localStorageService
        //     .watch(LocalStorageKey.LANGUAGE)
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((val) => {
        //         if (val) {
        //             const language: string = JSON.parse(val);
        //             this.lang = language;
        //         } else {
        //             this.lang = 'EN';
        //         }
        //         this.translate.use(this.lang?.toLocaleLowerCase());
        //         this.cdr.detectChanges();
        //     });
    }

    private processState(state: any): void {
        this.handleGlobalError(state.globalError);
        this.handleTCNoResponse(state.tcNoResponse);
        this.handleLanguageChange(state.language);
        this.handleDeviceStatus(state.deviceStatus);
    }

    private handleGlobalError(error: IGlobalError): void {
        if (error && (error.esn || error.code || error.description)) {
            if (this.errorTimeout) {
                clearTimeout(this.errorTimeout);
            }
            this.error = error;
            if (error.timeout && error.timeout > 0) {
                this.errorTimeout = setTimeout(() => {
                    this.error = null;
                    this.store.dispatch(updateGlobalError({ payload: { code: '', description: '' } }));
                }, error.timeout);
            } else {
                this.store.dispatch(updateGlobalError({ payload: { code: '', description: '' } }));
            }
        }
    }

    buildErrorText(error: IGlobalError | null): string {
        if (!error) {
            return '';
        }
        const parts: string[] = [];
        if (error.esn) {
            parts.push(`${this.translate.instant('ESN')}: ${error.esn}`);
        }
        if (error.code) {
            parts.push(`${this.translate.instant('ERROR')} ${error.code}`);
        }
        if (error.description) {
            parts.push(this.translate.instant(error.description));
        }
        return parts.join(' | ');
    }

    private handleTCNoResponse(msgIDs: number[]): void {
        // console.log('TC No Response status changed:', msgIDs);
        this.listOfMsgInQueue = msgIDs;
        if (this.tcNoResponseTimeout) {
            clearTimeout(this.tcNoResponseTimeout);
        }
        if (this.listOfMsgInQueue.length > 0) {
            this.soundService.playPopUp();
            this.tcNoResponseTimeout = setTimeout(() => {
                this.resetTcNoResponse();
            }, DEFAULT_TIMEOUT);
        }
    }

    private handleLanguageChange(val: string): void {
        if (val) {
            const language: string = JSON.parse(val);
            this.lang = language;
        } else {
            this.lang = 'EN';
        }
        this.translate.use(this.lang?.toLocaleLowerCase());
        this.cdr.detectChanges();
    }

    private handleDeviceStatus(val: string): void {
        if (val) {
            const status: IConnectionStatus = JSON.parse(val);
            this.deviceStatus = status;
        }
    }

    subscribeToTopics() {
        // let currentConnectStatus = 0;
        this.messageSubscription = this.mqttService.connectionStatus$
            .pipe(takeUntil(this.destroy$))
            .subscribe((status) => {
                if (status === true) {
                    this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
                        if (configLoaded) {
                            this.topics = this.mqttService.mqttConfig?.topics;
                            if (environment.dummy) {
                                if (this.topics) {
                                    this.dummyInit.initializeDummyData(this.topics);
                                }
                            }
                            this.mqttService.subscribe({
                                topic: this.topics?.tcToAllTabs,
                                topicKey: TopicsKeys.ALL_TAB,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};

                                    if (header?.msgID) {
                                        switch (header.msgID) {
                                            case MsgID.SHUTTING_DOWN:
                                            case MsgID.SD_FOR_UPGRADING:
                                                this.shuttingDown = {
                                                    show: true,
                                                    message: payload?.message || '',
                                                };
                                                break;
                                            // case MsgID.CHANGE_BTS_STATUS:
                                            // case MsgID.CHANGE_BOLC_STATUS:
                                            // case MsgID.CHANGE_CRP_STATUS:
                                            // case MsgID.CHANGE_FMS_STATUS:
                                            //     this.localStorageService.setItem(
                                            //         LocalStorageKey.DEVICE_STATUS,
                                            //         JSON.stringify({ ...this.deviceStatus, ...payload }),
                                            //     );
                                            //     break;
                                            case MsgID.TC_DETECT_ERROR:
                                                this.store.dispatch(
                                                    updateGlobalError({
                                                        payload,
                                                    }),
                                                );
                                                break;

                                            case MsgID.LANGUAGE_SETTING:
                                                if (payload?.language) {
                                                    this.localStorageService.setItem(
                                                        LocalStorageKey.LANGUAGE,
                                                        JSON.stringify(payload.language),
                                                    );
                                                }
                                                break;

                                            case MsgID.VOLUME_SETTING:
                                                if (payload?.value !== undefined) {
                                                    this.localStorageService.setItem(
                                                        LocalStorageKey.VOLUME,
                                                        JSON.stringify(payload.value || 0),
                                                    );
                                                }
                                                break;
                                        }
                                    }
                                },
                            });
                            this.mqttService.subscribe({
                                topic: this.topics?.statusBOLC?.response,
                                topicKey: TopicsKeys.BOLC_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.CHANGE_BOLC_STATUS) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_BOLC,
                                        //     payload[LocalStorageKey.STATUS_BOLC],
                                        // );
                                        this.store.dispatch(updateConnectionStatus({ payload }));
                                    }
                                },
                            });
                            this.mqttService.subscribe({
                                topic: this.topics?.statusFMS?.response,
                                topicKey: TopicsKeys.FMS_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.CHANGE_FMS_STATUS) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_FMS,
                                        //     payload[LocalStorageKey.STATUS_FMS],
                                        // );
                                        this.store.dispatch(updateConnectionStatus({ payload }));
                                    }
                                },
                            });
                            this.mqttService.subscribe({
                                topic: this.topics?.statusCRP?.response,
                                topicKey: TopicsKeys.CRP_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.CHANGE_CRP_STATUS) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_CRP,
                                        //     payload[LocalStorageKey.STATUS_CRP],
                                        // );
                                        this.store.dispatch(updateConnectionStatus({ payload }));
                                    }
                                },
                            });
                            this.mqttService.subscribe({
                                topic: this.topics?.statusBTS?.response,
                                topicKey: TopicsKeys.BTS_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.CHANGE_BTS_STATUS) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_BTS,
                                        //     payload[LocalStorageKey.STATUS_BTS],
                                        // );
                                        this.store.dispatch(updateConnectionStatus({ payload }));
                                    }
                                },
                            });

                            this.mqttService.subscribe({
                                topic: this.topics?.posnStatus?.response,
                                topicKey: TopicsKeys.POSN_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.POSN_SOURCE) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_BTS,
                                        //     payload[LocalStorageKey.STATUS_BTS],
                                        // );
                                        this.store.dispatch(updatePosnStatus({ payload }));
                                    }
                                },
                            });

                            this.mqttService.subscribe({
                                topic: this.topics?.configStatus?.response,
                                topicKey: TopicsKeys.LOCATION_CONFIG_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.LOCATION_CONFIG_STATUS) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_BTS,
                                        //     payload[LocalStorageKey.STATUS_BTS],
                                        // );
                                        this.store.dispatch(updateLocationMode({ payload: payload.status ?? 0 }));
                                    }
                                },
                            });

                            this.mqttService.subscribe({
                                topic: this.topics?.posnStatus?.response,
                                topicKey: TopicsKeys.POSN_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.POSN_SOURCE) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_BTS,
                                        //     payload[LocalStorageKey.STATUS_BTS],
                                        // );
                                        this.store.dispatch(updatePosnStatus({ payload }));
                                    }
                                },
                            });

                            this.mqttService.subscribe({
                                topic: this.topics?.configStatus?.response,
                                topicKey: TopicsKeys.LOCATION_CONFIG_STATUS,
                                callback: (message) => {
                                    const formatMess = JSON.parse(message);
                                    const { header, payload } = formatMess || {};
                                    if (header?.msgID === MsgID.LOCATION_CONFIG_STATUS) {
                                        // this.localStorageService.setItem(
                                        //     LocalStorageKey.STATUS_BTS,
                                        //     payload[LocalStorageKey.STATUS_BTS],
                                        // );
                                        this.store.dispatch(updateLocationMode({ payload: payload.status ?? 0 }));
                                    }
                                },
                            });

                            this.mqttSubscriptions.push(
                                {
                                    topic: this.topics?.tcToAllTabs,
                                    topicKey: TopicsKeys.ALL_TAB,
                                },
                                {
                                    topic: this.topics?.bolcStatus?.response,
                                    topicKey: TopicsKeys.BOLC_STATUS,
                                },
                                {
                                    topic: this.topics?.fmsStatus?.response,
                                    topicKey: TopicsKeys.FMS_STATUS,
                                },
                                {
                                    topic: this.topics?.crpStatus?.response,
                                    topicKey: TopicsKeys.CRP_STATUS,
                                },
                                {
                                    topic: this.topics?.btsStatus?.response,
                                    topicKey: TopicsKeys.BTS_STATUS,
                                },
                                {
                                    topic: this.topics?.posnStatus?.response,
                                    topicKey: TopicsKeys.POSN_STATUS,
                                },
                                {
                                    topic: this.topics?.configStatus?.response,
                                    topicKey: TopicsKeys.LOCATION_CONFIG_STATUS,
                                },
                            );
                        }
                    });
                }
            });
    }

    ngOnDestroy() {
        if (this.connectionSubscription) {
            this.connectionSubscription.unsubscribe();
        }
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }

        // Unsubscribe from all MQTT topics using the unsubscribe method from MqttService
        if (this.mqttSubscriptions?.length > 0) {
            this.mqttSubscriptions.forEach((topic) => {
                this.mqttService.unsubscribe(topic?.topic, topic?.topicKey);
            });
        }

        // Clear the destroy subject to complete all observables
        this.destroy$.next();
        this.destroy$.complete();
        // this.mqttService.disconnect();

        clearTimeout(this.errorTimeout);
        clearTimeout(this.tcNoResponseTimeout);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    resetTcNoResponse(): void {
        this.listOfMsgInQueue = [];
        this.mqttService.resetTCNoResponse();
    }
}
