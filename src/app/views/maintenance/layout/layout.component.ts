import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, RouterOutlet, NavigationEnd, NavigationStart } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { routerUrls } from '@app/app.routes';
import { AppState } from '@store/app.state';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import {
    MsgSubID,
    MsgID,
    ResponseStatus,
    IAuth,
    TopicsKeys,
    IPopUpControl,
    LocalStorageKey,
    MaintenanceScreen,
} from '@models';
import {
    updateFareConsole,
    updateBusIdInformation,
    updateExternalDevices,
    updateTestPrinter,
    updateViewParameter,
    updateAppUpgrade,
    updateVersionInfo,
    updateDecommission,
    updateTCDateTime,
    updateBlsInformation,
    updateRedetectCV,
    updateLoadParameter,
    updateSaveTransaction,
    updateAuditRegistration,
    updateManualCalibrateBls,
    updateBlsCalibration,
    updateFareBusStopMode,
} from '@store/maintenance/maintenance.reducer';
import { auth, updateAuth } from '@store/global/global.reducer';
import { HeaderComponent } from '@components/layout/header/header.component';
import { IgnitionOffComponent } from '@components/ignition-off/ignition-off.component';
import { Notification } from '@components/notification/notification.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { BootUpCommissioningComponent } from '@components/boot-up-commissioning/boot-up-commissioning.component';

@Component({
    selector: 'maintenance-layout',
    imports: [
        TranslateModule,
        RouterOutlet,
        HeaderComponent,
        IgnitionOffComponent,
        CommonPopUp,
        BootUpCommissioningComponent,
        Notification,
    ],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class MaintenanceLayoutComponent implements OnInit {
    MaintenanceScreen = MaintenanceScreen;
    private destroy$ = new Subject<void>();
    private mqttSubscriptions: Array<{
        topic: string;
        topicKey: string;
    }> = []; // Track MQTT topics for cleanup

    // private auth$: <IAuth>;
    // auth: IAuth = { isLoggedIn: false };
    // auth$ = this.store.select(auth);
    topics;

    ignitionOff: IPopUpControl = { show: false };
    notification: IPopUpControl = { show: false, message: '' };
    bootUpCommissioning: IPopUpControl = { show: false };

    tcDateTime: Date | null = null;
    activeLogoutPopup: boolean = false;

    showPopUp: {
        title?: string;
        message?: string;
        type: 'success' | 'error';
    } | null = null;

    screenType: number = MaintenanceScreen.LOGIN_FROM_MAIN_TAB;

    loading: boolean = true;
    dateTimeOnly: boolean = false;

    currentRoute: string = this.router.url;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
        private translate: TranslateService,
        private localStorageService: LocalStorageService,
    ) {
        this.dateTimeOnly = [
            `/${routerUrls.private.maintenance.accessDenied}`,
            `/${routerUrls.private.maintenance.logOff}`,
        ].includes(this.router.url);
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.dateTimeOnly = [
                    `/${routerUrls.private.maintenance.accessDenied}`,
                    `/${routerUrls.private.maintenance.logOff}`,
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

        // this.localStorageService
        //     .watch(LocalStorageKey.AUTH)
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((authStr) => {
        //         const previousAuth = { ...this.auth };
        //         this.auth = JSON.parse(authStr || '{}') as IAuth;
        //         const { isLoggedIn, loggedInType } = this.auth;
        //         if (!this.auth || !isLoggedIn) {
        //             this.screenType = MaintenanceScreen.LOGIN_FROM_MAIN_TAB;
        //         } else if (isLoggedIn && loggedInType == 2) {
        //             this.screenType = MaintenanceScreen.LANDING_PAGE;
        //         } else if (isLoggedIn && loggedInType !== 2) {
        //             this.screenType = MaintenanceScreen.ACCESS_DENIED;
        //         }

        //         if (
        //             previousAuth?.isLoggedIn !== this?.auth?.isLoggedIn ||
        //             previousAuth?.loggedInType !== this?.auth?.loggedInType
        //         ) {
        //             this.navigate(routerUrls?.private?.maintenance?.url);
        //         }
        //     });
    }

    ngOnDestroy() {
        // Trigger unsubscription from all s
        this.destroy$.next();
        this.destroy$.complete();

        // Unsubscribe from all MQTT topics using the unsubscribe method from MqttService
        if (this.mqttSubscriptions?.length > 0) {
            this.mqttSubscriptions.forEach((topic) => {
                this.mqttService.unsubscribe(topic?.topic, topic?.topicKey);
            });
        }
    }

    navigate(route: string): void {
        const finalRoute = route?.startsWith('/') ? route : `/${route}`;
        if (this.currentRoute === finalRoute) return;
        this.router.navigate([finalRoute]);
    }

    messValidation(timeStamp, currentMainPAgeMess, callback) {
        let currentMess = 0;
        if (timeStamp >= 0) {
            callback();
            this.loading = false;
            currentMess = timeStamp;
        }
        return currentMess;
    }

    validatedAuth(topics) {
        let currentFareConsole = 0;
        let currentDeckType = 0;
        let currentFareBusStopMode = 0;
        let currentDeleteParameter = 0;
        let currentBusId = 0;
        let currentExternalDevices = 0;
        let currentTestPrinter = 0;
        let currentViewParameter = 0;
        let currentVersionInfo = 0;
        let currentBlsInformation = 0;
        let currentRedetectCV = 0;
        let currentLoadParameter = 0;
        let currentSaveTransaction = 0;
        let currentAuditRegistration = 0;
        let currentAppUpgrade = 0;
        let currentShuttingDownWarning = 0;
        let currentShowNotification = 0;
        let currentDecommissionMsg = 0;
        let currentCalibrateBls = 0;

        this.mqttService.subscribe({
            topic: topics.maintenance?.response,
            topicKey: TopicsKeys.MAINTENANCE,
            callback: (message, _, packet) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess;

                if (header.msgID === 0) {
                    return;
                }

                this.loading = false;
                this.bootUpCommissioning = { show: false, title: '' };
                // this.activeLogoutPopup = false;
                // console.log('MaintenanceLayoutComponent packet', packet);
                const isRetain = packet?.retain || false;
                // console.log('header?.msgID', header?.msgID);
                const dateTime = new Date(header?.dateTime);
                if (header?.msgSubID === MsgSubID?.NOTIFY) {
                    switch (header?.msgID) {
                        case MsgID.MAINTENANCE_SCREEN:
                            // if (payload.screenType) {
                            //     this.screenType = payload.screenType;
                            // } else {
                            //     this.screenType = MaintenanceScreen.LANDING_PAGE;
                            // }
                            this.activeLogoutPopup = false;
                            if (payload.screenType === MaintenanceScreen.LOGIN_FROM_MAIN_TAB) {
                                this.navigate(routerUrls.private.maintenance.logOff);
                            } else if (payload.screenType === MaintenanceScreen.ACCESS_DENIED) {
                                this.navigate(routerUrls.private.maintenance.accessDenied);
                            } else {
                                this.navigate(routerUrls.private.maintenance.url);
                            }
                            break;
                        // case MsgID.LOGIN_SUCCESS:
                        //     this.store.dispatch(updateAuth({ payload }));
                        //     this.navigate(routerUrls?.private?.maintenance?.url);
                        //     break;
                        // case MsgID.LOGOUT_SUCCESS:
                        //     this.store.dispatch(
                        //         updateAuth({ payload: { isLoggedIn: false, loggedInType: undefined } }),
                        //     );
                        //     break;

                        case MsgID.IGNITION_OFF:
                            currentShuttingDownWarning = this.messValidation(
                                dateTime,
                                currentShuttingDownWarning,
                                () => {
                                    this.closePopUpHandler();
                                    this.ignitionOff = {
                                        show: true,
                                        message: payload?.currentTime || '',
                                        delay: payload?.delay || 20,
                                    };
                                },
                            );
                            break;
                        case MsgID.MAINTENANCE_RESULT_NOTIFICATION:
                            currentShowNotification = this.messValidation(dateTime, currentShowNotification, () => {
                                this.closePopUpHandler();
                                this.notification = {
                                    show: true,
                                    message: payload?.message || '',
                                };
                            });
                            break;
                        case MsgID?.EXTERNAL_DEVICES_NOTIFY:
                            currentExternalDevices = this.messValidation(dateTime, currentExternalDevices, () => {
                                this.store.dispatch(
                                    updateExternalDevices({ payload: Object.assign({}, header, payload) }),
                                );
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.externalDevices);
                            });
                            break;
                        case MsgID?.MAINTENANCE_DELETE_PARAMETER_NOTIFY:
                            currentDeleteParameter = this.messValidation(dateTime, currentDeleteParameter, () => {
                                this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.url);
                            });
                            break;

                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL:
                            currentCalibrateBls = this.messValidation(dateTime, currentCalibrateBls, () => {
                                this.navigate(
                                    routerUrls?.private?.maintenance.fare.calibrateBLS.calibrateBlsManualInput,
                                );
                                this.store.dispatch(
                                    updateManualCalibrateBls({ payload: Object.assign({}, header, payload) }),
                                );
                            });
                            break;
                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION:
                            currentCalibrateBls = this.messValidation(dateTime, currentCalibrateBls, () => {
                                this.navigate(
                                    routerUrls?.private?.maintenance.fare.calibrateBLS.calibrateBlsCalibration,
                                );
                                this.store.dispatch(
                                    updateBlsCalibration({ payload: Object.assign({}, header, payload) }),
                                );
                            });
                            break;
                        case MsgID.FARE_TC_DATETIME:
                            if (payload.date) {
                                this.tcDateTime = new Date(payload.date);
                                this.store.dispatch(updateTCDateTime({ payload: this.tcDateTime }));
                            }
                            break;

                        // fare print error:
                        case MsgID?.COMMON_PRINT_ERROR:
                            this.closePopUpHandler();
                            this.showPopUp = {
                                title: payload.message,
                                type: 'error',
                            };
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
                        case MsgID?.MAINTENANCE_FARE_CONSOLE:
                            currentFareConsole = this.messValidation(dateTime, currentFareConsole, () => {
                                this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));

                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.url);
                            });
                            break;
                        case MsgID?.MAINTENANCE_DECK_TYPE_LIST:
                            currentDeckType = this.messValidation(dateTime, currentDeckType, () => {
                                this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));
                                if (isRetain)
                                    this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.deckType);
                            });
                            break;

                        // fare bus stop mode
                        case MsgID?.FARE_BUS_STOP_MODE_SELECT:
                        case MsgID?.FARE_BUS_STOP_MODE_SUBMIT:
                            currentFareBusStopMode = this.messValidation(dateTime, currentFareBusStopMode, () => {
                                this.store.dispatch(
                                    updateFareBusStopMode({
                                        payload: Object.assign({}, header, payload),
                                    }),
                                );
                                if (isRetain)
                                    this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.fareBusStopMode);
                            });
                            break;

                        case MsgID?.MAINTENANCE_DELETE_PARAMETER:
                            currentDeleteParameter = this.messValidation(dateTime, currentDeleteParameter, () => {
                                this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));
                                if (isRetain)
                                    this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.deleteParameter);
                            });
                            break;
                        case MsgID.MAINTENANCE_BUS_ID:
                        case MsgID.MAINTENANCE_OPERATOR:
                        case MsgID.MAINTENANCE_BUS_ID_SUBMIT:
                            currentBusId = this.messValidation(dateTime, currentBusId, () => {
                                this.store.dispatch(updateBusIdInformation({ payload, msgID: header?.msgID }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.busId);
                            });
                            break;

                        case MsgID?.EXTERNAL_DEVICES:
                            currentExternalDevices = this.messValidation(dateTime, currentExternalDevices, () => {
                                this.store.dispatch(
                                    updateExternalDevices({ payload: Object.assign({}, header, payload) }),
                                );
                            });
                            break;
                        case MsgID?.MAINTENANCE_TEST_PRINT:
                            currentTestPrinter = this.messValidation(dateTime, currentTestPrinter, () => {
                                this.store.dispatch(updateTestPrinter({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.externalDevices);
                            });
                            break;
                        case MsgID?.MAINTENANCE_PARAMETER:
                            currentViewParameter = this.messValidation(dateTime, currentViewParameter, () => {
                                this.store.dispatch(updateViewParameter({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.viewParameter);
                            });
                            break;
                        case MsgID?.MAINTENANCE_APP_UPGRADE:
                        case MsgID?.MAINTENANCE_UPGRADE_SUBMIT:
                            currentAppUpgrade = this.messValidation(dateTime, currentAppUpgrade, () => {
                                this.store.dispatch(updateAppUpgrade({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.appUpgrade);
                            });
                            break;
                        case MsgID?.MAINTENANCE_VERSION_INFO:
                            currentVersionInfo = this.messValidation(dateTime, currentVersionInfo, () => {
                                this.store.dispatch(updateVersionInfo({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.versionInfo);
                            });
                            break;
                        case MsgID?.MAINTENANCE_BLS_INFORMATION:
                            currentBlsInformation = this.messValidation(dateTime, currentBlsInformation, () => {
                                this.store.dispatch(updateBlsInformation({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.blsInformation);
                            });
                            break;
                        case MsgID?.MAINTENANCE_REDETECT_CV:
                            currentRedetectCV = this.messValidation(dateTime, currentRedetectCV, () => {
                                this.store.dispatch(updateRedetectCV({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.redetectCv);
                            });
                            break;
                        case MsgID?.MAINTENANCE_LOAD_PARAMETERS:
                            currentLoadParameter = this.messValidation(dateTime, currentLoadParameter, () => {
                                this.store.dispatch(updateLoadParameter({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.loadParameter);
                            });
                            break;
                        case MsgID?.MAINTENANCE_SAVE_TRANSACTION:
                            currentSaveTransaction = this.messValidation(dateTime, currentSaveTransaction, () => {
                                this.store.dispatch(updateSaveTransaction({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.saveTransaction);
                            });
                            break;
                        case MsgID?.MAINTENANCE_AUDIT_REGISTRATION:
                            currentAuditRegistration = this.messValidation(dateTime, currentAuditRegistration, () => {
                                this.store.dispatch(updateAuditRegistration({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.displayAudit);
                            });
                            break;
                        case MsgID.IGNITION_OFF:
                            currentShuttingDownWarning = this.messValidation(
                                dateTime,
                                currentShuttingDownWarning,
                                () => {
                                    this.ignitionOff = {
                                        show: false,
                                        message: '',
                                        disabled: false,
                                    };
                                },
                            );
                            break;

                        case MsgID.DECOMMISSION:
                            currentDecommissionMsg = this.messValidation(dateTime, currentDecommissionMsg, () => {
                                this.store.dispatch(updateDecommission({ payload }));
                                if (isRetain) this.navigate(routerUrls.private.maintenance.fare.decommission);
                            });
                            break;

                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT:
                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM:
                            currentCalibrateBls = this.messValidation(dateTime, currentCalibrateBls, () => {
                                this.store.dispatch(
                                    updateManualCalibrateBls({ payload: Object.assign({}, header, payload) }),
                                );
                            });
                            break;

                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START:
                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD:
                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE:
                        case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_RESULT:
                            currentCalibrateBls = this.messValidation(dateTime, currentCalibrateBls, () => {
                                this.store.dispatch(
                                    updateBlsCalibration({ payload: Object.assign({}, header, payload) }),
                                );
                            });
                            break;
                        case MsgID.LOGOUT:
                            this.handleLogoutSuccess();
                            break;

                        // back to landing page
                        case MsgID?.MAINTENANCE_BACK:
                            if (payload?.status === ResponseStatus.SUCCESS) {
                                this.navigate(routerUrls.private.maintenance.url);
                            }
                            break;
                        default:
                            break;
                    }
                }
            },
        });

        this.mqttSubscriptions.push({
            topic: topics.maintenance?.response,
            topicKey: TopicsKeys.MAINTENANCE,
        });
    }

    handleIgnitionOff() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics.maintenance?.get,
            msgID: MsgID.IGNITION_OFF,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });

        this.ignitionOff = {
            ...this.ignitionOff,
            disabled: true,
        };
    }

    handleClosePopup() {
        this.notification = { show: false, message: '' };
    }

    handleActiveLogoutPopup() {
        this.activeLogoutPopup = true;
    }

    handleLogout(isConfirmed: boolean) {
        if (isConfirmed) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.maintenance?.get,
                msgID: MsgID.LOGOUT,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
            // this.handleLogoutSuccess();
        } else {
            this.activeLogoutPopup = false;
        }
    }

    private handleLogoutSuccess(): void {
        this.activeLogoutPopup = false;
        this.navigate(routerUrls.private.maintenance.logOff);
    }

    closePopUpHandler() {
        this.showPopUp = null;
    }

    resetAllPopUpHandler() {
        this.showPopUp = null;
        this.ignitionOff = { show: false };
        this.notification = { show: false, message: '' };
        this.activeLogoutPopup = false;
    }
}
