import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, RouterOutlet, NavigationStart } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { routerUrls } from '@app/app.routes';
import { AppState } from '@store/app.state';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { MsgSubID, MsgID, ResponseStatus, TopicsKeys, IPopUpControl, MaintenanceScreen } from '@models';
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
export class MaintenanceLayoutComponent implements OnInit, OnDestroy {
    MaintenanceScreen = MaintenanceScreen;
    private readonly destroy$ = new Subject<void>();
    private readonly mqttSubscriptions: Array<{
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

    // message de-dup trackers for validatedAuth's MQTT callback
    private currentFareConsole = 0;
    private currentDeckType = 0;
    private currentFareBusStopMode = 0;
    private currentDeleteParameter = 0;
    private currentBusId = 0;
    private currentExternalDevices = 0;
    private currentTestPrinter = 0;
    private currentViewParameter = 0;
    private currentVersionInfo = 0;
    private currentBlsInformation = 0;
    private currentRedetectCV = 0;
    private currentLoadParameter = 0;
    private currentSaveTransaction = 0;
    private currentAuditRegistration = 0;
    private currentAppUpgrade = 0;
    private currentShuttingDownWarning = 0;
    private currentShowNotification = 0;
    private currentDecommissionMsg = 0;
    private currentCalibrateBls = 0;

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly translate: TranslateService,
        private readonly localStorageService: LocalStorageService,
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
                    this.handleMaintenanceNotify(header, payload, dateTime, isRetain);
                }

                if (header?.msgSubID === MsgSubID?.RESPONSE) {
                    this.handleMaintenanceResponse(header, payload, dateTime, isRetain);
                }
            },
        });

        this.mqttSubscriptions.push({
            topic: topics.maintenance?.response,
            topicKey: TopicsKeys.MAINTENANCE,
        });
    }

    private navigateMaintenanceScreen(payload): void {
        this.activeLogoutPopup = false;
        if (payload.screenType === MaintenanceScreen.LOGIN_FROM_MAIN_TAB) {
            this.navigate(routerUrls.private.maintenance.logOff);
        } else if (payload.screenType === MaintenanceScreen.ACCESS_DENIED) {
            this.navigate(routerUrls.private.maintenance.accessDenied);
        } else {
            this.navigate(routerUrls.private.maintenance.url);
        }
    }

    private handleMaintenanceNotify(header, payload, dateTime: Date, isRetain: boolean): void {
        switch (header?.msgID) {
            case MsgID.MAINTENANCE_SCREEN:
                // if (payload.screenType) {
                //     this.screenType = payload.screenType;
                // } else {
                //     this.screenType = MaintenanceScreen.LANDING_PAGE;
                // }
                this.navigateMaintenanceScreen(payload);
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
                this.currentShuttingDownWarning = this.messValidation(dateTime, this.currentShuttingDownWarning, () => {
                    this.closePopUpHandler();
                    this.ignitionOff = {
                        show: true,
                        message: payload?.currentTime || '',
                        delay: payload?.delay || 20,
                    };
                });
                break;
            case MsgID.MAINTENANCE_RESULT_NOTIFICATION:
                this.currentShowNotification = this.messValidation(dateTime, this.currentShowNotification, () => {
                    this.closePopUpHandler();
                    this.notification = {
                        show: true,
                        message: payload?.message || '',
                    };
                });
                break;
            case MsgID?.EXTERNAL_DEVICES_NOTIFY:
                this.currentExternalDevices = this.messValidation(dateTime, this.currentExternalDevices, () => {
                    this.store.dispatch(updateExternalDevices({ payload: { ...header, ...payload } }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.externalDevices);
                });
                break;
            case MsgID?.MAINTENANCE_DELETE_PARAMETER_NOTIFY:
                this.currentDeleteParameter = this.messValidation(dateTime, this.currentDeleteParameter, () => {
                    this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.url);
                });
                break;

            case MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL:
                this.currentCalibrateBls = this.messValidation(dateTime, this.currentCalibrateBls, () => {
                    this.navigate(routerUrls?.private?.maintenance.fare.calibrateBLS.calibrateBlsManualInput);
                    this.store.dispatch(updateManualCalibrateBls({ payload: { ...header, ...payload } }));
                });
                break;
            case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION:
                this.currentCalibrateBls = this.messValidation(dateTime, this.currentCalibrateBls, () => {
                    this.navigate(routerUrls?.private?.maintenance.fare.calibrateBLS.calibrateBlsCalibration);
                    this.store.dispatch(updateBlsCalibration({ payload: { ...header, ...payload } }));
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

    private handleMaintenanceResponse(header, payload, dateTime: Date, isRetain: boolean): void {
        switch (header?.msgID) {
            case MsgID?.MAINTENANCE_FARE_CONSOLE:
                this.currentFareConsole = this.messValidation(dateTime, this.currentFareConsole, () => {
                    this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));

                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.url);
                });
                break;
            case MsgID?.MAINTENANCE_DECK_TYPE_LIST:
                this.currentDeckType = this.messValidation(dateTime, this.currentDeckType, () => {
                    this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.deckType);
                });
                break;

            // fare bus stop mode
            case MsgID?.FARE_BUS_STOP_MODE_SELECT:
            case MsgID?.FARE_BUS_STOP_MODE_SUBMIT:
                this.currentFareBusStopMode = this.messValidation(dateTime, this.currentFareBusStopMode, () => {
                    this.store.dispatch(
                        updateFareBusStopMode({
                            payload: { ...header, ...payload },
                        }),
                    );
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.fareBusStopMode);
                });
                break;

            case MsgID?.MAINTENANCE_DELETE_PARAMETER:
                this.currentDeleteParameter = this.messValidation(dateTime, this.currentDeleteParameter, () => {
                    this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.deleteParameter);
                });
                break;
            case MsgID.MAINTENANCE_BUS_ID:
            case MsgID.MAINTENANCE_OPERATOR:
            case MsgID.MAINTENANCE_BUS_ID_SUBMIT:
                this.currentBusId = this.messValidation(dateTime, this.currentBusId, () => {
                    this.store.dispatch(updateBusIdInformation({ payload, msgID: header?.msgID }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.ticketingConsole.busId);
                });
                break;

            case MsgID?.EXTERNAL_DEVICES:
                this.currentExternalDevices = this.messValidation(dateTime, this.currentExternalDevices, () => {
                    this.store.dispatch(updateExternalDevices({ payload: { ...header, ...payload } }));
                });
                break;
            case MsgID?.MAINTENANCE_TEST_PRINT:
                this.currentTestPrinter = this.messValidation(dateTime, this.currentTestPrinter, () => {
                    this.store.dispatch(updateTestPrinter({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.externalDevices);
                });
                break;
            case MsgID?.MAINTENANCE_PARAMETER:
                this.currentViewParameter = this.messValidation(dateTime, this.currentViewParameter, () => {
                    this.store.dispatch(updateViewParameter({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.viewParameter);
                });
                break;
            case MsgID?.MAINTENANCE_APP_UPGRADE:
            case MsgID?.MAINTENANCE_UPGRADE_SUBMIT:
                this.currentAppUpgrade = this.messValidation(dateTime, this.currentAppUpgrade, () => {
                    this.store.dispatch(updateAppUpgrade({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.appUpgrade);
                });
                break;
            case MsgID?.MAINTENANCE_VERSION_INFO:
                this.currentVersionInfo = this.messValidation(dateTime, this.currentVersionInfo, () => {
                    this.store.dispatch(updateVersionInfo({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.versionInfo);
                });
                break;
            case MsgID?.MAINTENANCE_BLS_INFORMATION:
                this.currentBlsInformation = this.messValidation(dateTime, this.currentBlsInformation, () => {
                    this.store.dispatch(updateBlsInformation({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.blsInformation);
                });
                break;
            case MsgID?.MAINTENANCE_REDETECT_CV:
                this.currentRedetectCV = this.messValidation(dateTime, this.currentRedetectCV, () => {
                    this.store.dispatch(updateRedetectCV({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.redetectCv);
                });
                break;
            case MsgID?.MAINTENANCE_LOAD_PARAMETERS:
                this.currentLoadParameter = this.messValidation(dateTime, this.currentLoadParameter, () => {
                    this.store.dispatch(updateLoadParameter({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.loadParameter);
                });
                break;
            case MsgID?.MAINTENANCE_SAVE_TRANSACTION:
                this.currentSaveTransaction = this.messValidation(dateTime, this.currentSaveTransaction, () => {
                    this.store.dispatch(updateSaveTransaction({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.saveTransaction);
                });
                break;
            case MsgID?.MAINTENANCE_AUDIT_REGISTRATION:
                this.currentAuditRegistration = this.messValidation(dateTime, this.currentAuditRegistration, () => {
                    this.store.dispatch(updateAuditRegistration({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.displayAudit);
                });
                break;
            case MsgID.IGNITION_OFF:
                this.currentShuttingDownWarning = this.messValidation(dateTime, this.currentShuttingDownWarning, () => {
                    this.ignitionOff = {
                        show: false,
                        message: '',
                        disabled: false,
                    };
                });
                break;

            case MsgID.DECOMMISSION:
                this.currentDecommissionMsg = this.messValidation(dateTime, this.currentDecommissionMsg, () => {
                    this.store.dispatch(updateDecommission({ payload }));
                    if (isRetain) this.navigate(routerUrls.private.maintenance.fare.decommission);
                });
                break;

            case MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT:
            case MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM:
                this.currentCalibrateBls = this.messValidation(dateTime, this.currentCalibrateBls, () => {
                    this.store.dispatch(updateManualCalibrateBls({ payload: { ...header, ...payload } }));
                });
                break;

            case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START:
            case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD:
            case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE:
            case MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_RESULT:
                this.currentCalibrateBls = this.messValidation(dateTime, this.currentCalibrateBls, () => {
                    this.store.dispatch(updateBlsCalibration({ payload: { ...header, ...payload } }));
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

    handleLogout() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.LOGOUT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
        // this.handleLogoutSuccess();
    }

    handleCancelLogout() {
        this.activeLogoutPopup = false;
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
