import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, RouterOutlet, NavigationEnd, NavigationStart } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { routerUrls } from '@app/app.routes';
import { HeaderComponent } from '@components/layout/header/header.component';
import { AppState } from '@store/app.state';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { MsgSubID, MsgID, ResponseStatus, TopicsKeys, IPopUpControl, LocalStorageKey, FareScreen } from '@models';
import {
    updateCancelRide,
    updateConcession,
    updateCVEntryExit,
    updateCVModeControl,
    updateCVPowerControl,
    updateFareBusStopMode,
    updatePowerCvOnOff,
    updatePrintStatus,
    updateResetAllCV,
    updateRetentionTicket,
    updateShowCVStatus,
    updateTopUp,
    updateTransaction,
    updateFareExternalDevices,
    updateTestPrinter,
    updatePrinterStatus,
} from '@store/fare/fare.reducer';

import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SettingsComponent } from '@components/settings/settings.component';
import { LockScreenComponent } from '@components/lock-screen/lock-screen.component';
import { BootUpCommissioningComponent } from '@components/boot-up-commissioning/boot-up-commissioning.component';
import { updateLockScreen } from '@app/store/main/main.reducer';

@Component({
    selector: 'fare-layout',
    imports: [
        RouterOutlet,
        TranslateModule,
        HeaderComponent,
        CommonPopUp,
        SettingsComponent,
        LockScreenComponent,
        BootUpCommissioningComponent,
    ],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class FareLayoutComponent implements OnInit, OnDestroy {
    FareScreen = FareScreen;
    private readonly destroy$ = new Subject<void>();
    private readonly mqttSubscriptions: Array<{
        topic: string;
        topicKey: string;
    }> = []; // Track MQTT topics for cleanup

    // auth: IAuth = { isLoggedIn: false };
    // isOnTrip: boolean = false;

    showPopUp: {
        title?: string;
        message?: string;
        type: 'success' | 'error';
    } | null = null;
    bootUpCommissioning: IPopUpControl = { show: false };

    //lock
    displayLockPopUp: boolean = false;
    displayLockScreen: boolean = false; // Used to control the visibility of the lock screen component

    //settings
    displaySettingsPopUp = false;
    // disableBls: IPopUpControl = { show: false };
    displayWarning: boolean = false;
    isLandingPage: boolean = false;
    spid: string = '';

    screenType: number = FareScreen.LOGIN_FROM_MAIN_TAB; // Default screen type

    isPublicScreen: boolean = true;
    loading: boolean = true;
    currentRoute: string = this.router.url;
    topics;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly translate: TranslateService,
        private readonly localStorageService: LocalStorageService,
    ) {
        this.isLandingPage = this.router.url === '/fare';
        this.isPublicScreen = [
            `/${routerUrls.private.fare.accessDenied}`,
            `/${routerUrls.private.fare.logOff}`,
            `/${routerUrls.private.fare.waitingTripStart}`,
        ].includes(this.router.url);
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.isLandingPage = event.urlAfterRedirects === '/fare';
            }
            if (event instanceof NavigationStart) {
                this.isPublicScreen = [
                    `/${routerUrls.private.fare.accessDenied}`,
                    `/${routerUrls.private.fare.logOff}`,
                    `/${routerUrls.private.fare.waitingTripStart}`,
                ].includes(event.url);
                this.currentRoute = event.url;
            }
        });
    }

    ngOnInit() {
        this.mqttService.connectionStatus$.pipe(takeUntil(this.destroy$)).subscribe((isConnected) => {
            if (isConnected) {
                this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
                    if (configLoaded) {
                        const topics = this.mqttService.mqttConfig?.topics;
                        this.topics = topics;
                        if (topics) {
                            this.validatedAuth(topics);
                        }
                    }
                });
            }
        });

        // this.handleStorageChanges();
    }

    ngOnDestroy() {
        // Trigger unsubscription from all observables
        this.destroy$.next();
        this.destroy$.complete();

        // Unsubscribe from all MQTT topics using the unsubscribe method from MqttService
        if (this.mqttSubscriptions?.length > 0) {
            this.mqttSubscriptions.forEach((topic) => {
                this.mqttService.unsubscribe(topic?.topic, topic?.topicKey);
            });
        }
    }

    // navigate(route: string): void {
    //     this.router.navigate([`/${route}`]);
    // }

    navigate(route: string): void {
        const finalRoute = route?.startsWith('/') ? route : `/${route}`;
        if (this.currentRoute === finalRoute) return;
        this.router.navigate([finalRoute]);
    }

    messValidation(timeStamp, currentMainPAgeMess, callback) {
        let currentMess = 0;
        if (timeStamp >= 0) {
            callback();
            currentMess = timeStamp;
            this.loading = false;
        }
        return currentMess;
    }

    validatedAuth(topics) {
        let currentCvStatusMsg = 0;
        let currentCVPowerCtrlMsg = 0;
        let currentCVEXitEntryMsg = 0;
        let currentPowerCvOnMsg = 0;
        let currentPowerCvOffMsg = 0;
        let currentCVModeCtrlMsg = 0;
        let currentResetAllCvMsg = 0;
        let currentRetentionTicketMsg = 0;
        let currentPrinterOnMsg = 0;
        let currentPrinterOffMsg = 0;
        // let currentPrinterStatusMsg = 0;
        let currentPrintStatusMsg = 0;
        // let currentDisableBlsMsg = 0;
        let currentCancelRideMsg = 0;
        let currentConcessionMsg = 0;
        let currentFareBusStopModeMsg = 0;
        let currentTopUpMsg = 0;
        let currentTransactionMsg = 0;
        let currentLockScreen = 0;

        this.mqttService.subscribe({
            topic: topics.fareTab?.response,
            topicKey: TopicsKeys.FARE_TAB,
            callback: (message) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess;

                if (header.msgID === 0) {
                    return;
                }

                this.loading = false;
                this.bootUpCommissioning = { show: false, title: '' };

                // console.log('header?.msgID', header?.msgID);
                const dateTime = new Date(header?.dateTime);

                if (header?.msgSubID === MsgSubID?.NOTIFY) {
                    switch (header?.msgID) {
                        case MsgID.FARE_SCREEN:
                            // this.router.navigate([`${routerUrls.private.fare.url}`]);
                            if (payload.screenType === FareScreen.LOGIN_FROM_MAIN_TAB) {
                                // this.screenType = payload.screenType;
                                this.navigate(routerUrls.private.fare.logOff);
                            } else if (payload.screenType === FareScreen.ACCESS_DENIED) {
                                // this.screenType = payload.screenType;
                                this.navigate(routerUrls.private.fare.accessDenied);
                            } else if (payload.screenType === FareScreen.WAITING_TRIP_TO_START) {
                                // this.screenType = FareScreen.WAITING_TRIP_TO_START;
                                this.navigate(routerUrls.private.fare.waitingTripStart);
                            } else {
                                // this.screenType = FareScreen.ON_TRIP_LANDING_PAGE;
                                this.navigate(routerUrls.private.fare.url);
                            }
                            this.handleUnlockSuccess();
                            break;
                        // case MsgID.LOGIN_SUCCESS:
                        //     this.store.dispatch(updateAuth({ payload }));
                        //     break;
                        // case MsgID.LOGOUT_SUCCESS:
                        //     this.store.dispatch(updateIsOnTrip({ payload: false }));
                        //     this.store.dispatch(
                        //         updateAuth({ payload: { isLoggedIn: false, loggedInType: undefined } }),
                        //     );
                        //     break;
                        // case MsgID.START_TRIP_SUCCESS:
                        //     this.store.dispatch(updateIsOnTrip({ payload: true }));
                        //     this.router.navigate([`${routerUrls.private.fare.url}`]);
                        //     break;
                        // case MsgID.END_TRIP_SUCCESS:
                        //     this.store.dispatch(updateIsOnTrip({ payload: false }));

                        //fare screen button
                        case MsgID.FARE_CANCEL_RIDE_CV1:
                            currentCancelRideMsg = this.messValidation(dateTime, currentCancelRideMsg, () => {
                                this.store.dispatch(
                                    updateCancelRide({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cancelRideCV1);
                            });
                            break;
                        case MsgID.FARE_CANCEL_RIDE_CV2:
                            currentCancelRideMsg = this.messValidation(dateTime, currentCancelRideMsg, () => {
                                this.store.dispatch(
                                    updateCancelRide({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cancelRideCV2);
                            });
                            break;
                        case MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY:
                            currentCancelRideMsg = this.messValidation(dateTime, currentCancelRideMsg, () => {
                                this.store.dispatch(
                                    updateCancelRide({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );

                                if (payload.cvNum) {
                                    const endPoint = 'cancelRideCV' + payload.cvNum;
                                    const targetRoute = routerUrls?.private?.fare[endPoint];
                                    if (targetRoute) {
                                        this.navigate(targetRoute); // Navigate based on cvNum
                                    }
                                }
                            });
                            break;
                        case MsgID.FARE_CONCESSION_CV1:
                            currentConcessionMsg = this.messValidation(dateTime, currentConcessionMsg, () => {
                                this.store.dispatch(
                                    updateConcession({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.concessionCV1);
                            });
                            break;
                        case MsgID.FARE_CONCESSION_CV2:
                            currentConcessionMsg = this.messValidation(dateTime, currentConcessionMsg, () => {
                                this.store.dispatch(
                                    updateConcession({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.concessionCV2);
                            });
                            break;
                        case MsgID.FARE_CONCESSION_SUBMIT_NOTIFY:
                            currentConcessionMsg = this.messValidation(dateTime, currentConcessionMsg, () => {
                                this.store.dispatch(
                                    updateConcession({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                if (payload.cvNum) {
                                    const endPoint = 'concessionCV' + payload.cvNum;
                                    const targetRoute = routerUrls?.private?.fare[endPoint];
                                    if (targetRoute) {
                                        this.navigate(targetRoute); // Navigate based on cvNum
                                    }
                                }
                            });
                            break;
                        case MsgID.FARE_BUS_STOP_MODE:
                            currentFareBusStopModeMsg = this.messValidation(dateTime, currentFareBusStopModeMsg, () => {
                                this.store.dispatch(
                                    updateFareBusStopMode({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.blsOperation.url);
                            });
                            break;
                        case MsgID.FARE_TOP_UP:
                            currentTopUpMsg = this.messValidation(dateTime, currentTopUpMsg, () => {
                                this.store.dispatch(
                                    updateTopUp({
                                        payload: { ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.topUp);
                            });
                            break;
                        case MsgID.FARE_TRANSACTION:
                            currentTransactionMsg = this.messValidation(dateTime, currentTransactionMsg, () => {
                                this.store.dispatch(
                                    updateTransaction({
                                        payload: { ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.transaction);
                            });
                            break;
                        case MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_1:
                        case MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_2:
                            currentTransactionMsg = this.messValidation(dateTime, currentTransactionMsg, () => {
                                this.store.dispatch(
                                    updateTransaction({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.transaction);
                            });
                            break;

                        // fare CV operation
                        case MsgID.FARE_CV_OPERATION:
                            this.navigate(routerUrls.private.fare.cvOperation.url);
                            break;
                        case MsgID.FARE_CO_CV_STATUS:
                            currentCvStatusMsg = this.messValidation(dateTime, currentCvStatusMsg, () => {
                                this.store.dispatch(
                                    updateShowCVStatus({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cvOperation.showCVStatus);
                            });
                            break;
                        case MsgID.FARE_CO_CV_ENTRY_EXIT:
                            currentCVEXitEntryMsg = this.messValidation(dateTime, currentCVEXitEntryMsg, () => {
                                this.store.dispatch(
                                    updateCVEntryExit({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cvOperation.setCV);
                            });
                            break;
                        case MsgID.FARE_CO_CV_MODE_CONTROL:
                            currentCVModeCtrlMsg = this.messValidation(dateTime, currentCVModeCtrlMsg, () => {
                                this.store.dispatch(
                                    updateCVModeControl({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cvOperation.cvModeControl);
                            });
                            break;
                        case MsgID.FARE_CO_POWER_ALL_CV_ON:
                            currentPowerCvOnMsg = this.messValidation(dateTime, currentPowerCvOnMsg, () => {
                                this.store.dispatch(updatePowerCvOnOff({ payload: { ...header, ...payload } }));
                                this.navigate(routerUrls.private.fare.cvOperation.powerAllCVOn);
                            });
                            break;
                        case MsgID.FARE_CO_POWER_ALL_CV_OFF:
                            currentPowerCvOffMsg = this.messValidation(dateTime, currentPowerCvOffMsg, () => {
                                this.store.dispatch(updatePowerCvOnOff({ payload: { ...header, ...payload } }));
                                this.navigate(routerUrls.private.fare.cvOperation.powerAllCVOff);
                            });
                            break;
                        case MsgID.FARE_CO_CV_POWER_CTRL:
                            currentCVPowerCtrlMsg = this.messValidation(dateTime, currentCVPowerCtrlMsg, () => {
                                this.store.dispatch(
                                    updateCVPowerControl({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cvOperation.cvPowerControl);
                            });
                            break;
                        case MsgID.FARE_CO_RESET_ALL_CV:
                            currentResetAllCvMsg = this.messValidation(dateTime, currentResetAllCvMsg, () => {
                                this.store.dispatch(
                                    updateResetAllCV({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cvOperation.resetAllCV);
                            });
                            break;
                        //Printer operations
                        case MsgID.FARE_PRINTER_OPERATION:
                            this.navigate(routerUrls.private.fare.printerOperation.url);
                            break;
                        case MsgID?.FARE_PO_PRINTER_STATUS:
                            currentPrintStatusMsg = this.messValidation(dateTime, currentPrintStatusMsg, () => {
                                this.store.dispatch(
                                    updatePrintStatus({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.printerOperation.status);
                            });
                            break;
                        case MsgID?.FARE_PO_PRINT_RETENTION_TICKET:
                            currentRetentionTicketMsg = this.messValidation(dateTime, currentRetentionTicketMsg, () => {
                                this.store.dispatch(
                                    updateRetentionTicket({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.printerOperation.retentionTicket);
                            });
                            break;
                        case MsgID?.FARE_PO_PRINTER_ON:
                            currentPrinterOnMsg = this.messValidation(dateTime, currentPrinterOnMsg, () => {
                                this.store.dispatch(updatePrinterStatus({ payload: { ...header, ...payload } }));
                                this.navigate(routerUrls.private.fare.printerOperation.printerOn);
                            });
                            break;
                        case MsgID?.FARE_PO_PRINTER_OFF:
                            currentPrinterOffMsg = this.messValidation(dateTime, currentPrinterOffMsg, () => {
                                this.store.dispatch(updatePrinterStatus({ payload: { ...header, ...payload } }));
                                this.navigate(routerUrls.private.fare.printerOperation.printerOff);
                            });
                            break;

                        case MsgID?.EXTERNAL_DEVICES_NOTIFY:
                            this.store.dispatch(
                                updateFareExternalDevices({
                                    payload: { ...header, ...payload },
                                }),
                            );

                            // console.log({ status: payload?.status, isRetainMsg });
                            if (payload?.isNavigationRequired) {
                                this.navigate(routerUrls.private.fare.externalDevices);
                            }
                            break;

                        // fare lock screen
                        case MsgID.NOTIFY_TO_LOCK:
                            currentLockScreen = this.messValidation(dateTime, currentLockScreen, () => {
                                this.handleLockScreen();
                            });
                            break;
                        case MsgID.UNLOCK_SUCCESS:
                            currentLockScreen = this.messValidation(dateTime, currentLockScreen, () => {
                                // this.handleUnlockSuccess();
                            });
                            break;
                        // case MsgID.LOCK_BROAD_CAST:
                        //     this.store.dispatch(
                        //         updateLockScreen({
                        //             payload: {
                        //                 msgID: MsgID.NOTIFY_TO_LOCK,
                        //             },
                        //         }),
                        //     );
                        //     // this.navigate(routerUrls?.private?.fare?.lockScreen);
                        //     this.displayLockScreen = true;
                        //     break;
                        case MsgID?.MANUAL_LOGIN_PIN:
                        case MsgID?.MANUAL_LOGIN_PIN2:
                            currentLockScreen = this.messValidation(dateTime, currentLockScreen, () => {
                                this.store.dispatch(
                                    updateLockScreen({
                                        payload: { ...header, ...payload, timeout: payload.timeout || undefined },
                                    }),
                                );
                            });
                            break;
                        // case MsgID.UNLOCK_BROAD_CAST:
                        //     this.handleUnlockSuccess(true);
                        //     break;

                        case MsgID.FARE_SPID:
                            this.spid = payload?.message || '';
                            this.navigate(routerUrls.private.fare.url);
                            break;

                        // fare print error:
                        case MsgID?.COMMON_PRINT_ERROR:
                            this.showPopUp = {
                                title: payload.message,
                                type: 'error',
                            };
                            // this.navigate(routerUrls.private.fare.url);
                            break;

                        case MsgID?.FARE_BYPASS_BLACKLIST_ACTIVE:
                            this.displayWarning = true;
                            // this.navigate(routerUrls.private.fare.url);
                            break;
                        case MsgID?.FARE_BYPASS_BLACKLIST_INACTIVE:
                            this.displayWarning = false;
                            // this.navigate(routerUrls.private.fare.url);
                            break;

                        // boot up commissioning notify
                        case MsgID?.BOOT_UP_COMMISSIONING:
                            this.bootUpCommissioning = {
                                show: true,
                                title: payload?.message || '',
                            };
                            break;
                        default:
                            break;
                    }
                }

                if (header?.msgSubID === MsgSubID?.RESPONSE) {
                    switch (header?.msgID) {
                        case MsgID?.FARE_CV_OPERATION_BACK:
                            if (payload.status === ResponseStatus.SUCCESS) {
                                this.navigate(routerUrls?.private?.fare?.cvOperation.url);
                            }
                            break;
                        case MsgID?.FARE_CO_CV_ENTRY_EXIT_CONFIRM:
                        case MsgID?.FARE_CO_CV_ENTRY_EXIT_CANCEL:
                            currentCVEXitEntryMsg = this.messValidation(dateTime, currentCVEXitEntryMsg, () => {
                                if (payload.status === ResponseStatus.SUCCESS) {
                                    this.navigate(routerUrls?.private?.fare?.cvOperation?.url);
                                }
                            });
                            break;

                        case MsgID?.FARE_CO_POWER_ALL_CV_CONFIRM:
                        case MsgID?.FARE_CO_POWER_ALL_CV_CANCEL:
                            currentPowerCvOnMsg = this.messValidation(dateTime, currentPowerCvOnMsg, () => {
                                if (payload.status === ResponseStatus.SUCCESS) {
                                    this.navigate(routerUrls?.private?.fare?.cvOperation?.url);
                                }
                            });
                            break;

                        case MsgID?.FARE_CO_RESET_ALL_CV_CONFIRM:
                        case MsgID?.FARE_CO_RESET_ALL_CV_CANCEL:
                            currentResetAllCvMsg = this.messValidation(dateTime, currentResetAllCvMsg, () => {
                                if (payload.status === ResponseStatus.SUCCESS) {
                                    this.navigate(routerUrls?.private?.fare?.cvOperation?.url);
                                }
                            });
                            break;

                        case MsgID?.FARE_CO_CV_MODE_CONTROL_SELECT:
                            currentCVModeCtrlMsg = this.messValidation(dateTime, currentCVModeCtrlMsg, () => {
                                this.store.dispatch(
                                    updateCVModeControl({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.cvOperation.cvModeControl);
                            });
                            break;
                        case MsgID?.FARE_CO_CV_MODE_CONTROL_CONFIRM:
                            currentCVModeCtrlMsg = this.messValidation(dateTime, currentCVModeCtrlMsg, () => {
                                this.navigate(routerUrls.private.fare.cvOperation.url);
                            });
                            break;
                        case MsgID?.FARE_PO_PRINT_RTK_SELECT:
                        case MsgID?.FARE_PO_PRINT_RTK_CONFIRM:
                        case MsgID?.FARE_PO_PRINT_RTK_CANCEL:
                            currentRetentionTicketMsg = this.messValidation(dateTime, currentRetentionTicketMsg, () => {
                                this.store.dispatch(
                                    updateRetentionTicket({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls?.private?.fare?.printerOperation?.retentionTicket);
                            });
                            break;

                        case MsgID?.FARE_PO_PRINT_RTK_BACK:
                        case MsgID?.FARE_PO_PRINT_RTK_PRINT:
                            currentRetentionTicketMsg = this.messValidation(dateTime, currentRetentionTicketMsg, () => {
                                this.navigate(routerUrls?.private?.fare?.printerOperation?.url);
                            });
                            break;

                        case MsgID?.FARE_CANCEL_RIDE_SUBMIT:
                            currentCancelRideMsg = this.messValidation(dateTime, currentCancelRideMsg, () => {
                                this.store.dispatch(
                                    updateCancelRide({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                if (payload.cvNum) {
                                    const endPoint = 'cancelRideCV' + payload.cvNum;
                                    const targetRoute = routerUrls?.private?.fare[endPoint];
                                    if (targetRoute) {
                                        this.navigate(targetRoute); // Navigate based on cvNum
                                    }
                                }
                            });
                            break;

                        case MsgID?.FARE_CONCESSION_SUBMIT:
                            currentConcessionMsg = this.messValidation(dateTime, currentConcessionMsg, () => {
                                this.store.dispatch(
                                    updateConcession({
                                        payload,
                                        msgID: header?.msgID,
                                    }),
                                );
                                if (payload.cvNum) {
                                    const endPoint = 'concessionCV' + payload.cvNum;
                                    const targetRoute = routerUrls?.private?.fare[endPoint];
                                    if (targetRoute) {
                                        this.navigate(targetRoute); // Navigate based on cvNum
                                    }
                                }
                            });
                            break;

                        // fare bus stop mode
                        case MsgID?.FARE_BUS_STOP_MODE_SELECT:
                        case MsgID?.FARE_BUS_STOP_MODE_SUBMIT:
                            currentFareBusStopModeMsg = this.messValidation(dateTime, currentFareBusStopModeMsg, () => {
                                this.store.dispatch(
                                    updateFareBusStopMode({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.blsOperation.url);
                            });
                            break;

                        // Top Up
                        case MsgID?.FARE_TOP_UP_SELECT_AMT:
                            currentTopUpMsg = this.messValidation(dateTime, currentTopUpMsg, () => {
                                this.store.dispatch(
                                    updateTopUp({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.topUp);
                            });
                            break;

                        case MsgID?.FARE_TOP_UP_SUBMIT:
                            currentTopUpMsg = this.messValidation(dateTime, currentTopUpMsg, () => {
                                this.navigate(routerUrls.private.fare.url);
                            });
                            break;

                        case MsgID?.FARE_TRANSACTION_SELECT:
                        case MsgID?.FARE_TRANSACTION_CONFIRM:
                        case MsgID?.FARE_TRANSACTION_BACK:
                            currentTransactionMsg = this.messValidation(dateTime, currentTransactionMsg, () => {
                                this.store.dispatch(
                                    updateTransaction({
                                        payload: { ...header, ...payload },
                                    }),
                                );
                                this.navigate(routerUrls.private.fare.transaction);
                            });
                            break;

                        case MsgID?.EXTERNAL_DEVICES:
                            this.store.dispatch(
                                updateFareExternalDevices({
                                    payload: { ...header, ...payload },
                                }),
                            );
                            this.navigate(routerUrls.private.fare.externalDevices);
                            break;

                        case MsgID?.MAINTENANCE_TEST_PRINT:
                            this.store.dispatch(
                                updateTestPrinter({
                                    payload,
                                }),
                            );
                            this.navigate(routerUrls.private.fare.externalDevices);
                            break;
                        case MsgID?.FARE_BACK_BUTTON:
                            if (payload.status === ResponseStatus.SUCCESS) {
                                this.navigate(routerUrls.private.fare.url);
                            }
                            break;

                        // fare lock screen
                        case MsgID?.MANUAL_LOGIN_PIN:
                        case MsgID?.MANUAL_LOGIN_PIN2:
                            currentLockScreen = this.messValidation(dateTime, currentLockScreen, () => {
                                if (
                                    payload.status === ResponseStatus.SUCCESS &&
                                    header?.msgID === MsgID.MANUAL_LOGIN_PIN2
                                ) {
                                    // this.handleUnlockSuccess();
                                } else {
                                    this.store.dispatch(
                                        updateLockScreen({
                                            payload: { ...header, ...payload, timeout: payload.timeout || undefined },
                                        }),
                                    );
                                }
                            });
                            break;

                        default:
                            break;
                    }
                }
            },
        });
        this.mqttSubscriptions.push({
            topic: topics.fareTab?.response,
            topicKey: TopicsKeys.FARE_TAB,
        });
    }

    handleClickLock() {
        this.displayLockPopUp = true;
    }

    handleConfirmLock(isConfirm: boolean) {
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.LOCK_CONFIRM,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        } else {
            this.displayLockPopUp = false;
        }
    }
    handleLockScreen() {
        this.displayLockPopUp = false;
        this.displayLockScreen = true;
        this.store.dispatch(updateLockScreen({ payload: { msgID: MsgID.NOTIFY_TO_LOCK } }));
        // this.navigate(routerUrls?.private?.fare?.lockScreen);
    }
    handleUnlockSuccess() {
        // if (!isBroadCast) {
        //     this.mqttService.publishWithMessageFormat({
        //         topic: this.topics.mainTab?.response,
        //         msgID: MsgID.UNLOCK_BROAD_CAST,
        //         msgSubID: MsgSubID.NOTIFY,
        //     });
        // }
        // // this.navigate(routerUrls?.private?.fare?.url);
        this.displayLockScreen = false;
    }

    closePopUpHandler() {
        this.showPopUp = null;
    }

    handleConfirmLanguage(language: string): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.LANGUAGE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language },
        });
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.tcToAllTabs,
            msgID: MsgID.LANGUAGE_SETTING,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language },
            opts: { retain: false },
        });
        this.localStorageService.setItem(LocalStorageKey.LANGUAGE, JSON.stringify(language));
    }

    handleChangeAudioVolume(value: number): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.tcToAllTabs,
            msgID: MsgID.VOLUME_SETTING,
            msgSubID: MsgSubID.NOTIFY,
            payload: { value },
            opts: { retain: false },
        });
        this.localStorageService.setItem(LocalStorageKey.VOLUME, JSON.stringify(value));
    }
}
