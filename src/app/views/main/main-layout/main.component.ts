import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    userInfo,
    displayFareBusStopList,
    updateBusStopList,
    updateCurrentFareBusStop,
    updateUserInfo,
    activeCVs,
    free,
    updateActiveCVs,
    updateFreeCVs,
    currentFareBusStop,
    updateDeviation,
    busStopList,
    fareBusStopList,
    frontDoor,
    updateBootUp,
    updateFareConsole,
    updateOutOfService,
    updateDagwOperation,
    updateLoginOption,
    updateTapCardLogin,
    updateManualLogin,
    updateEndTripInfo,
    updateCommissionBusIdInformation,
    updateExternalDevices,
    updateTestPrinter,
    updateStartTrip,
    updateCvUpgradeStatus,
    updateBreakDownInfo,
    updateCashPayment,
    updateFrontDoor,
    updateLockScreen,
    updateDateTimeSetting,
} from '@store/main/main.reducer';
import { routerUrls } from '@app/app.routes';
import { HeaderComponent } from '@components/layout/header/header.component';
import { AppState } from '@store/app.state';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { UtilsServices } from '@services/utils.service';
import { AuthService } from '@app/services/auth.service';
import {
    CvIcons,
    IUserInfoMain,
    IFmsBusStop,
    MsgSubID,
    MsgID,
    CvStatusType,
    ResponseStatus,
    CVLabels,
    MainPagePopUp,
    StartTripTypes,
    TopicsKeys,
    LocalStorageKey,
    IPopUpControl,
    IFareBusStop,
    MainButton,
    IFree,
    IFrontDoor,
    DEFAULT_TIMEOUT,
    MainScreen,
} from '@models';
import { IgnitionOffComponent } from '@components/ignition-off/ignition-off.component';
import { AutoDisableBlsComponent } from '@components/auto-disable-bls/auto-disable-bls.component';
import { FareBusStopLocationMode } from '@components/fare-bus-stop-location-mode/fare-bus-stop-location-mode.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SettingsComponent } from '@components/settings/settings.component';
import { LockConfirmPopUp } from '@components/lock-confirm/lock-confirm.component';
import { LockScreenComponent } from '@components/lock-screen/lock-screen.component';
import { BootUpCommissioningComponent } from '@components/boot-up-commissioning/boot-up-commissioning.component';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'app-main',
    imports: [
        CommonModule,
        TranslateModule,
        HeaderComponent,
        RouterOutlet,
        IgnitionOffComponent,
        AutoDisableBlsComponent,
        FareBusStopLocationMode,
        CommonPopUp,
        SettingsComponent,
        LockScreenComponent,
        BootUpCommissioningComponent,
        LockConfirmPopUp,
        NotificationSoundDirective,
    ],
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    providers: [DatePipe],
})
export class MainComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    MsgID = MsgID;
    MainButtons = MainButton;
    MainScreen = MainScreen;
    showPop: any = null;
    intervalId: any;
    activeCVs$: Observable<number[]>;
    currentFareBusStop$: Observable<IFareBusStop | null>;
    currentFareBusStop!: IFareBusStop | null;
    free$: Observable<IFree>;
    free: IFree = { freeMode: false };
    cvsActive: number[] = [];
    busStopList$: Observable<IFmsBusStop[]>;
    fareBusStopList$: Observable<IFareBusStop[]>;
    fareBusStopList: IFareBusStop[] = [];
    frontDoor$: Observable<IFrontDoor> = this.store.select(frontDoor);
    frontDoor: IFrontDoor = {};

    displayFareBusStopList$: Observable<boolean> = this.store.select(displayFareBusStopList);
    displayFareBusStop: boolean = false;

    userInfo$: Observable<IUserInfoMain> = this.store.select(userInfo);
    userInfo: IUserInfoMain = {};

    // isLoading$: Observable<boolean>;
    appLoading: boolean = true;
    localStorageLoading: boolean = true;

    topics;
    currentScreen: string = '/main';
    currentRoute: string = '';
    mainUrl = `/${routerUrls?.private?.main?.url}`;
    loginUrl = `/${routerUrls?.private?.main?.login}`;
    languageSettingUrl = `/${routerUrls?.private?.main?.languageSetting}`;
    dateTimeSettingUrl = `/${routerUrls?.private?.main?.dateTimeSetting}`;
    fareConsoleSettingUrl = `/${routerUrls?.private?.main?.fareConsoleSetting}`;
    loginOptionUrl = `/${routerUrls?.private?.main?.loginOption}`;
    tapCardLoginUrl = `/${routerUrls?.private?.main?.tapCardLogin}`;
    manualLoginUrl = `/${routerUrls?.private?.main?.manualLogin}`;
    busOperationUrl = `/${routerUrls?.private?.main?.busOperation?.url}`;
    busOperationStartTripUrl = `/${routerUrls?.private?.main?.busOperation?.startTripValidInfo}`;
    startTripInvalidInfoUrl = `/${routerUrls?.private?.main?.busOperation?.startTripInvalidInfo}`;
    externalDevicesUrl = `/${routerUrls?.private?.main?.busOperation?.externalDevices}`;
    dagwOperationUrl = `/${routerUrls?.private?.main?.dagwOperation}`;
    commissioningInProgressUrl = `/${routerUrls?.private?.main?.commissioning?.inProgress}`;
    commissioningClearingAllDataUrl = `/${routerUrls?.private?.main?.commissioning?.clearingAllData}`;
    commissioningCompletedCleaningUrl = `/${routerUrls?.private?.main?.commissioning?.completedClearning}`;
    accessDeniedUrl = `/${routerUrls?.private?.main?.accessDenied}`;
    endTripUrl = `/${routerUrls?.private?.main?.endTrip}`;

    freeRoute = `/${routerUrls?.private?.main?.free}`;
    breakDownRoute = `/${routerUrls?.private?.main?.breakdown}`;
    cashPaymentRoute = `/${routerUrls?.private?.main?.cashPayment}`;
    frontDoorRoute = `/${routerUrls?.private?.main?.frontDoor}`;
    onTripRoue = `/${routerUrls?.private?.main?.busStopInformation}`;
    rearDoorRoute = `/${routerUrls?.private?.main?.rearDoor}`;
    redeemRoute = `/${routerUrls?.private?.main?.redeem}`;

    cvStatusTypes = CvStatusType;

    // pop-ups
    ignitionOff: IPopUpControl = { show: false };
    disableBls: IPopUpControl = { show: false };
    fareBusStopMode: IPopUpControl = { show: false };
    invalidInspectorCard: IPopUpControl = { show: false };
    commonPopup: IPopUpControl = { show: false, timeout: DEFAULT_TIMEOUT };
    hidePopup: boolean = false;
    displayLockPopUp = false;
    displayLockScreen = false;
    displaySettingsPopUp = false;
    bootUpCommissioning: IPopUpControl = { show: false };

    private readonly mqttSubscriptions: Array<{
        topic: string;
        topicKey: string;
    }> = []; // Track MQTT topics for cleanup

    cvLists: CvIcons[] = [];
    screenType: number = MainScreen.MAIN_SCREEN; // Default screen type
    disableAllButtons: boolean = false;

    lastTimeStampPerTopic = {};

    constructor(
        public datePipe: DatePipe,
        protected router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly translate: TranslateService,
        private readonly localStorageService: LocalStorageService,
        private readonly utilsService: UtilsServices,
        private readonly soundService: SoundService,
        private readonly authService: AuthService,
    ) {
        this.activeCVs$ = this.store.select(activeCVs);
        this.free$ = this.store.select(free);
        this.currentFareBusStop$ = this.store.select(currentFareBusStop);
        this.busStopList$ = this.store.select(busStopList);
        this.fareBusStopList$ = this.store.select(fareBusStopList);
        // this.isLoading$ = this.store.select(isLoading);
    }

    ngOnInit() {
        this.initStore();
        // Ensure broker is connected and config is loaded before subscribing
        this.initMqttConnection();
        this.initSubscriptions();
        this.initRouterEvents();

        // //only load local storage first time
        // timer(1000)
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe(() => {
        //         this.localStorageLoading = true;
        //         this.initLocalStorageStore();
        //     });
    }

    ngOnDestroy() {
        // Clear interval to stop updating current date
        clearInterval(this.intervalId);
        // Trigger un-subscription from all observables
        this.destroy$.next();
        this.destroy$.complete();

        // Unsubscribe from all MQTT topics using the unsubscribe method from MqttService
        if (this.mqttSubscriptions?.length > 0) {
            this.mqttSubscriptions.forEach((topic) => {
                this.mqttService.unsubscribe(topic?.topic, topic?.topicKey);
            });
        }
        // Ensure to clear any timeouts in MQTT subscriptions
        this.cvLists.forEach((cv) => {
            if (cv.timer) {
                clearTimeout(cv.timer as number);
            }
        });
    }

    private initStore() {
        this.fareBusStopList$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.fareBusStopList = data;

            if (!this.currentFareBusStop) {
                const activeIndex = data?.findIndex((item) => item?.flag == 'active');
                // If there is an active fare bus stop, update the current fare bus stop
                if (activeIndex > -1) {
                    this.store.dispatch(
                        updateCurrentFareBusStop({
                            payload: data[activeIndex]?.Busid,
                            idx: activeIndex,
                        }),
                    );
                }
            }
        });

        this.currentFareBusStop$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.currentFareBusStop = data;
            // console.log('currentFareBusStop', this.currentFareBusStop);
        });

        this.activeCVs$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            if (data.length > 0) {
                this.cvsActive = data;
                setTimeout(() => {
                    this.store.dispatch(updateActiveCVs({ payload: [] }));
                    this.cvsActive = [];
                }, 3000);
            }
        });

        this.free$.pipe(takeUntil(this.destroy$)).subscribe((data: IFree) => {
            this.free = data;
            this.setCvStatus();
        });

        this.frontDoor$.pipe(takeUntil(this.destroy$)).subscribe((data: IFrontDoor) => {
            this.frontDoor = data;
        });

        this.displayFareBusStopList$.pipe(takeUntil(this.destroy$)).subscribe((_isDisplay) => {
            this.displayFareBusStop = _isDisplay;
        });
    }

    private initMqttConnection(): void {
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
    }

    private initSubscriptions(): void {
        // this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        //     this.loading = data;
        // });
        // this.isOnTrip$.pipe(takeUntil(this.destroy$)).subscribe((isOnTrip) => {
        //     this.isOnTrip = isOnTrip;
        // });
    }

    private initRouterEvents(): void {
        // Run the handler for the current route on init so its side effects (e.g.
        // hidePopup) are applied on first load / browser refresh, where the initial
        // NavigationStart has already fired before this component subscribes.
        this.handleRouteChange(this.router.url);
        this.router.events
            .pipe(
                takeUntil(this.destroy$), // Unsubscribe when destroy$ emits
            )
            .subscribe((event) => {
                if (event instanceof NavigationStart) {
                    this.handleRouteChange(event.url);
                }
            });
    }

    private handleRouteChange(url: string): void {
        this.currentRoute = url;
        this.currentScreen = this.formatMainHeader(url);

        // Apply for start trip and shutting down
        if (url?.indexOf(routerUrls?.private?.main?.busStopInformation) > -1) {
            this.hidePopup = false;
        } else {
            this.hidePopup = true;
        }
    }

    screensBeforeLoggedOn() {
        const knownRoutes: string[] = [
            this.mainUrl,
            this.loginUrl,
            this.languageSettingUrl,
            this.dateTimeSettingUrl,
            this.fareConsoleSettingUrl,
            this.loginOptionUrl,
            this.tapCardLoginUrl,
            this.manualLoginUrl,
            this.commissioningInProgressUrl,
            this.commissioningCompletedCleaningUrl,
            this.commissioningClearingAllDataUrl,
            this.dagwOperationUrl,
            this.accessDeniedUrl,
            // this.lockScreenPage,
        ];
        return knownRoutes.includes(this.currentRoute ?? '');
    }

    // on-trip layout includes cv and main buttons
    isOnTripLayout() {
        if (this.screensBeforeLoggedOn()) return false;
        const moreRoutes: string[] = [
            this.busOperationUrl,
            this.busOperationStartTripUrl,
            this.startTripInvalidInfoUrl,
            this.externalDevicesUrl,
            // this.lockScreenPage,
        ];

        return !moreRoutes.includes(this.currentRoute ?? '');
    }

    genCvBlockClass(): string {
        return `cv-block-${this.cvLists.length}`;
    }

    messValidation(timeStamp, currentMainPAgeMess, callback) {
        let currentMess = 0;
        if (timeStamp >= 0) {
            callback();
            currentMess = timeStamp;
            this.appLoading = false;
        }
        return currentMess;
    }

    validatedAuth(topics) {
        const messageCounters = this.initializeMessageCounters();
        this.setupMqttSubscription(topics, messageCounters);
        this.mqttSubscriptions.push(
            {
                topic: topics.mainTab?.response,
                topicKey: TopicsKeys.MAIN_TAB,
            },
            {
                topic: topics.mainTab?.cv?.response,
                topicKey: TopicsKeys.MAIN_TAB_CV,
            },
            {
                topic: topics.mainTab?.fareBusStop?.response,
                topicKey: TopicsKeys.MAIN_TAB_FARE_BUS_STOP,
            },
            {
                topic: topics.mainTab?.fareBusStopList?.response,
                topicKey: TopicsKeys.MAIN_TAB_FARE_BUS_STOP_LIST,
            },
            {
                topic: topics.mainTab?.fmsBusStop?.response,
                topicKey: TopicsKeys.MAIN_TAB_FMS_BUS_STOP,
            },
            {
                topic: topics.mainTab?.headWayTimeTable?.response,
                topicKey: TopicsKeys.MAIN_HEADWAY_TIME_TABLE,
            },
            {
                topic: topics.mainTab?.currentServiceInfo?.response,
                topicKey: TopicsKeys.CURRENT_SERVICE_INFO,
            },
        );
    }

    private initializeMessageCounters() {
        return {
            currentBootUpMess: 0,
            currentOutOfServiceInfo: 0,
            currentOutOfServiceMissingData: 0,
            cvUpgradeStatus: 0,
            currentBusOperationMenu: 0,
            currentDgwOperation: 0,
            currentTriggerBolcStatus: 0,
            currentChangeBolcStatus: 0,
            currentLoginTapCard: 0,
            currentTapCardPIN: 0,
            currentBCTapCardDuty: 0,
            currentEndShift: 0,
            currentManualPIN: 0,
            currentManualDuty: 0,
            currentCommissioning: 0,
            currentEndTrip: 0,
            currentBreakDown: 0,
            currentStartTripPopUp: 0,
            currentFareConsole: 0,
            currentBusId: 0,
            currentExternalDevices: 0,
            currentTestPrinter: 0,
            currentLanguage: 0,
            currentDateTimeSetting: 0,
            currentMainPageMess: 0,
            currentCVStatus: 0,
            currentCVIcons: 0,
            currentFareBusStopMess: 0,
            currentBusStopListMess: 0,
            currentHeadwayMess: 0,
            currentServiceInfoMess: 0,
            currentNextBusStop: 0,
            currentFareBusStopList: 0,
            currentStartTrip: 0,
            currentStartTripForSpecialCase: 0,
            currentLock: 0,
            currentFreeMsg: 0,
            currentFrontDoorsMsg: 0,
            currentRearDoorsMsg: 0,
            currentCashMsg: 0,
            currentLockScreen: 0,
            currentIgnitionOffMsg: 0,
            // currentBusOffRoute: 0,
            currentDisableBls: 0,
            currentCjbPlateNumber: 0,
            currentFareBusStopMode: 0,
            currentInvalidInspectorCard: 0,
            currentUpDownButton: 0,
            currentRedeemMsg: 0,
            currentPopupMsg: 0,
        };
    }

    private setupMqttSubscription(topics: any, messageCounters: any) {
        this.mqttService.subscribe({
            topic: topics.mainTab?.response,
            topicKey: TopicsKeys.MAIN_TAB,
            callback: (message, _, packet) => {
                // this.displayLockPopUp = false;
                // this.displaySettingsPopUp = false;
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess;

                if (header.msgID === 0) {
                    return;
                }

                this.appLoading = false;
                this.bootUpCommissioning = {
                    show: false,
                    title: '',
                };

                // console.log({ message, packet });
                this.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB] = header.dateTime;

                if (payload?.status === ResponseStatus.NA) {
                    return;
                }

                if (!header || Object.keys(header).length === 0) {
                    return;
                }

                // this.resetPopUpHandler();
                const dateTime = new Date(header?.dateTime);

                const parameters = { header, payload, dateTime, messageCounters, isRetainMsg: packet.retain };
                if (this.isMainPageData(header)) {
                    this.handleMainDataMessages(parameters);
                } else if (header?.msgSubID === MsgSubID?.NOTIFY) {
                    this.handleNotifyMessages(parameters);
                } else if (header?.msgSubID === MsgSubID?.RESPONSE) {
                    this.handleResponseMessages(parameters);
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics.mainTab?.cv?.response,
            topicKey: TopicsKeys.MAIN_TAB_CV,
            callback: (message) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess || {};

                if (!header || Object.keys(header).length === 0) {
                    return;
                }

                this.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB_CV] = header.dateTime;

                const dateTime = new Date(header?.dateTime);
                if (payload?.status === ResponseStatus.NA) {
                    return;
                }
                const parameters = { header, payload, dateTime, messageCounters };
                if (header?.msgID === MsgID.CV_STATUS) {
                    this.handleCVStatus(parameters);
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics.mainTab?.fareBusStopList?.response,
            topicKey: TopicsKeys.MAIN_TAB_FARE_BUS_STOP_LIST,
            callback: (message, _, packet) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess || {};
                if (!header || Object.keys(header).length === 0) {
                    return;
                }
                this.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB_FARE_BUS_STOP_LIST] = header.dateTime;

                const dateTime = new Date(header?.dateTime);
                if (payload?.status === ResponseStatus.NA) {
                    return;
                }
                const parameters = { header, payload, dateTime, messageCounters };
                const isRetainMsg = packet.retain;
                const isExistingFareBusStopList = this.fareBusStopList?.length > 0;
                const isLatestFareBusStopList =
                    dateTime.getTime() >= new Date(this.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB]).getTime();

                let needToUpdateFareBusStopList: boolean = !isRetainMsg;
                if (!needToUpdateFareBusStopList) {
                    needToUpdateFareBusStopList =
                        isLatestFareBusStopList || (!isLatestFareBusStopList && !isExistingFareBusStopList);
                }

                if (header.msgID === MsgID.UPDATE_FARE_BUS_STOP_LIST && needToUpdateFareBusStopList) {
                    this.handleUpdateFareBusStopList(parameters);
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics.mainTab?.fareBusStop?.response,
            topicKey: TopicsKeys.MAIN_TAB_FARE_BUS_STOP,
            callback: (message) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess || {};
                if (!header || Object.keys(header).length === 0) {
                    return;
                }
                this.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB_FARE_BUS_STOP] = header.dateTime;
                const dateTime = new Date(header?.dateTime);
                if (payload?.status === ResponseStatus.NA) {
                    return;
                }
                const parameters = { header, payload, dateTime, messageCounters };
                if (header.msgID === MsgID.UPDATE_FARE_BUS_STOP) {
                    this.handleUpdateFareBusStop(parameters);
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics.mainTab?.fmsBusStop?.response,
            topicKey: TopicsKeys.MAIN_TAB_FMS_BUS_STOP,
            callback: (message) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess || {};
                if (!header || Object.keys(header).length === 0) {
                    return;
                }
                this.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB_FMS_BUS_STOP] = header.dateTime;
                const dateTime = new Date(header?.dateTime);

                if (payload?.status === ResponseStatus.NA) {
                    return;
                }
                const parameters = { header, payload, dateTime, messageCounters };
                if (header.msgID === MsgID.UPDATE_FMS_BUS_STOP) {
                    this.handleUpdateFMSBusStop(parameters);
                } else if (
                    [MsgID.START_TRIP_POP_UP_MESSAGE, MsgID?.DRIVER_STATUS].includes(header.msgID) &&
                    payload?.type === 'FMS_NO_INFO'
                ) {
                    this.showPop = {
                        title: 'WAITING_FOR_FMS_INFO',
                        loading: true,
                        hideButton: true,
                    };
                    this.store.dispatch(
                        updateDeviation({
                            payload: {
                                currentBlock: '--:--',
                                isHeadway: true,
                                minSec: '--:--',
                                bars: 0,
                                direction: '',
                                color: 'black',
                            },
                        }),
                    );
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics.mainTab?.headWayTimeTable?.response,
            topicKey: TopicsKeys.MAIN_HEADWAY_TIME_TABLE,
            callback: (message) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess || {};

                if (!header || Object.keys(header).length === 0) {
                    return;
                }
                this.lastTimeStampPerTopic[TopicsKeys.MAIN_HEADWAY_TIME_TABLE] = header.dateTime;
                const dateTime = new Date(header?.dateTime);
                if (payload?.status === ResponseStatus.NA) {
                    return;
                }

                const parameters = { header, payload, dateTime, messageCounters };
                if (header.msgID === MsgID.UPDATE_HEADWAY) {
                    this.handleUpdateHeadway(parameters);
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics.mainTab?.currentServiceInfo?.response,
            topicKey: TopicsKeys.CURRENT_SERVICE_INFO,
            callback: (message) => {
                const formatMess = JSON.parse(message);
                const { header, payload } = formatMess || {};

                if (!header || Object.keys(header).length === 0) {
                    return;
                }
                this.lastTimeStampPerTopic[TopicsKeys.CURRENT_SERVICE_INFO] = header.dateTime;
                const dateTime = new Date(header?.dateTime);
                if (payload?.status === ResponseStatus.NA) {
                    return;
                }

                const parameters = { header, payload, dateTime, messageCounters };
                if (header.msgID === MsgID.CURRENT_SERVICE_INFO) {
                    this.handleUpdateServiceInfo(parameters);
                }
            },
        });
    }

    isMainPageData(header: any) {
        return [
            MsgID.MAIN_PAGE_DATA,
            MsgID.CV_STATUS,
            MsgID.CV_ICONS,
            MsgID.UPDATE_FARE_BUS_STOP,
            MsgID.UPDATE_FMS_BUS_STOP,
            MsgID.UPDATE_HEADWAY,
            MsgID.UPDATE_FARE_BUS_STOP_LIST,
            MsgID.NEXT_BUS_INFO,
        ].includes(header?.msgID);
    }

    private handleMainDataMessages(opts) {
        const { header } = opts;
        switch (header?.msgID) {
            case MsgID.MAIN_PAGE_DATA:
                this.handleMainPageData(opts);
                break;
            case MsgID.CV_STATUS:
                this.handleCVStatus(opts);
                break;
            case MsgID.CV_ICONS:
                this.handleCVIcons(opts);
                break;
            case MsgID.UPDATE_FARE_BUS_STOP:
                this.handleUpdateFareBusStop(opts);
                break;
            case MsgID.UPDATE_FMS_BUS_STOP:
                this.handleUpdateFMSBusStop(opts);
                break;
            case MsgID.UPDATE_HEADWAY:
                this.handleUpdateHeadway(opts);
                break;
            case MsgID.UPDATE_FARE_BUS_STOP_LIST:
                this.handleUpdateFareBusStopList(opts);
                break;
            // case MsgID.NEXT_BUS_INFO:
            //     this.handleNextBusInfo(header, payload, dateTime, messageCounters);
            //     break;
        }
    }

    private handleMainPageData(opts) {
        const { header, payload, dateTime, messageCounters } = opts;
        if ([MsgSubID.RESPONSE, MsgSubID.NOTIFY].includes(header.msgSubID)) {
            messageCounters.currentMainPageMess = this.messValidation(
                dateTime,
                messageCounters.currentMainPageMess,
                () => {
                    this.showPop = null;
                    this.handleUnlockSuccess();
                    // this.handleStartTripSuccess();

                    const busStop: { busStopList?: []; fareBusStopList?: [] } = {};
                    let currentFareBusStopId = '';
                    let currentFareBusStopIdx = -1;
                    busStop.busStopList = payload?.fmsBusStopList || [];
                    // if (payload?.fmsBusStopList?.length > 0) {
                    //     busStop.busStopList = payload?.fmsBusStopList;
                    //     // this.store.dispatch(
                    //     //     updateBusStopList({ busStopList: payload?.fmsBusStopList }),
                    //     // );
                    // }

                    // console.log('lastTimeStampPerTopic', this.lastTimeStampPerTopic);
                    if (payload.fareBusStopList?.length > 0) {
                        const activeIdx = payload?.fareBusStopList?.findIndex((item) => item?.flag === 'active');
                        busStop.fareBusStopList = payload?.fareBusStopList;
                        if (activeIdx > -1) {
                            currentFareBusStopId = payload?.fareBusStopList[activeIdx].Busid;
                            currentFareBusStopIdx = activeIdx;
                        }
                    } else {
                        busStop.fareBusStopList = [];
                    }

                    if (Object.keys(busStop).length > 0) {
                        this.store.dispatch(updateBusStopList(busStop));
                    }

                    this.store.dispatch(
                        updateCurrentFareBusStop({
                            payload: currentFareBusStopId,
                            idx: currentFareBusStopIdx,
                        }),
                    );

                    if (payload?.cvList?.length > 0) {
                        this.cvLists = payload?.cvList
                            ?.map((item) => ({
                                ...item,
                                id: item.cvNumber,
                                activeIcon: null,
                                timer: null,
                                label: '',
                                error: false,
                                statuses: item.statuses,
                            }))
                            .sort((a, b) => a.id - b.id);

                        this.store.dispatch(
                            updateFreeCVs({
                                payload: {
                                    freeMode: this.cvLists?.some((_cv) => _cv.statuses?.includes(CvStatusType.FREE)),
                                },
                            }),
                        );
                    }

                    this.store.dispatch(
                        updateUserInfo({
                            userInfo: {
                                busServiceNum: payload?.busServiceNum,
                                plateNum: payload?.plateNum,
                                spid: payload?.spid,
                                dir: payload?.dir,
                                km: payload?.km,
                                variantName: payload?.variantName,
                            },
                        }),
                    );
                },
            );
            this.displayTripInfoPage();
        }
    }

    private handleCVStatus(opts) {
        const { header, payload, dateTime, messageCounters } = opts;
        if ([MsgSubID.RESPONSE, MsgSubID.NOTIFY].includes(header.msgSubID)) {
            messageCounters.currentCVStatus = this.messValidation(dateTime, messageCounters.currentCVStatus, () => {
                this.cvLists = payload
                    ?.map((item) => ({
                        ...item,
                        id: item.cvNumber,
                        activeIcon: null,
                        timer: null,
                        label: '',
                        error: false,
                        statuses: item.statuses,
                    }))
                    .sort((a, b) => a.id - b.id);

                this.store.dispatch(
                    updateFreeCVs({
                        payload: {
                            freeMode: this.cvLists?.some((_cv) => _cv.statuses?.includes(CvStatusType.FREE)),
                            timeout: this.free?.timeout,
                        },
                    }),
                );
            });
        }
    }

    private handleCVIcons(opts) {
        const { header, payload, dateTime, messageCounters } = opts;
        if ([MsgSubID.RESPONSE, MsgSubID.NOTIFY].includes(header.msgSubID)) {
            messageCounters.currentCVIcons = this.messValidation(dateTime, messageCounters.currentCVIcons, () => {
                const newList = this.cvLists?.filter((item) => payload?.cvNum === item.id);
                if (newList?.length === 0) return;
                const imgPath = payload.error ? '/error/' : '/';

                let imgName = '';
                switch (payload.icon) {
                    case 1:
                        imgName = 'workfare-icon';
                        break;
                    case 2:
                        imgName = 'pwd';
                        break;
                    case 3:
                        imgName = 'soldier-icon';
                        break;
                    case 4:
                        imgName = 'student-icon';
                        break;
                    case 5:
                        imgName = 'senior-icon';
                        break;
                    case 6:
                        imgName = 'children-icon';
                        break;
                    case 7:
                        imgName = 'staff-icon';
                        break;
                    case 8:
                        imgName = 'workfare-icon';
                        break;
                    case 9:
                        break;
                    case 10:
                        imgName = 'madt-success';
                        break;
                }

                newList[0].activeIcon = `/assets/images/icons/main${imgPath}${imgName}.svg`;
                newList[0].label = CVLabels[payload?.icon];
                newList[0].error = payload.error;
                newList[0].message = payload.message;

                // Clear previous timer and reset icon if necessary
                if (newList[0].timer) {
                    clearTimeout(newList[0].timer as number);
                    newList[0].timer = null;
                }

                // Set a timeout to reset icon and error after 3 seconds (or 30 seconds if error)
                newList[0].timer = setTimeout(() => {
                    newList[0].activeIcon = null;
                    newList[0].error = false;
                    newList[0].message = undefined;
                }, DEFAULT_TIMEOUT);
            });
        }
    }

    private handleUpdateFareBusStop(opts) {
        const { header, payload, dateTime, messageCounters } = opts;

        if ([MsgSubID.NOTIFY].includes(header.msgSubID)) {
            let fareBusStop;
            let currentIdx: number = -1;
            if (payload?.index > -1 && payload?.index !== null) {
                currentIdx = payload.index;
            }

            if (payload?.index > -1) {
                fareBusStop = this?.fareBusStopList[payload?.index];
            }

            if (payload?.Busid) {
                if (!fareBusStop) {
                    currentIdx = this?.fareBusStopList.findIndex((item) => item?.Busid === payload?.Busid);
                    fareBusStop = this?.fareBusStopList[currentIdx];
                }
            }
            messageCounters.currentFareBusStopMess = this.messValidation(
                dateTime,
                messageCounters.currentFareBusStopMess,
                () => {
                    this.store.dispatch(
                        updateCurrentFareBusStop({
                            payload: fareBusStop?.Busid,
                            manualBls: payload?.manualBls,
                            autoBls: payload?.autoBls,
                            misMatch: payload?.misMatch,
                            isUpstage: payload?.isUpstage,
                            idx: currentIdx,
                        }),
                    );
                },
            );
        }
    }

    private handleUpdateFMSBusStop(opts) {
        const { header, payload, dateTime, messageCounters } = opts;

        if ([MsgSubID.NOTIFY].includes(header.msgSubID)) {
            const { fmsBusStopList, ...rest } = payload;
            messageCounters.currentBusStopListMess = this.messValidation(
                dateTime,
                messageCounters.currentBusStopListMess,
                () => {
                    this.store.dispatch(
                        updateBusStopList({
                            busStopList: fmsBusStopList || [],
                        }),
                    );
                    this.store.dispatch(
                        updateUserInfo({
                            userInfo: rest,
                        }),
                    );
                    this.showPop = null;
                },
            );
        }
    }

    private handleUpdateHeadway(opts) {
        const { header, payload, dateTime, messageCounters } = opts;

        if ([MsgSubID.NOTIFY].includes(header.msgSubID)) {
            messageCounters.currentHeadwayMess = this.messValidation(
                dateTime,
                messageCounters.currentHeadwayMess,
                () => {
                    this.store.dispatch(
                        updateDeviation({
                            payload: {
                                ...payload,
                                color: this.utilsService.hexToRgb(payload?.color),
                            },
                        }),
                    );
                },
            );
        }
    }

    private handleUpdateServiceInfo(opts) {
        const { header, payload, dateTime, messageCounters } = opts;

        if ([MsgSubID.NOTIFY].includes(header.msgSubID)) {
            messageCounters.currentServiceInfoMess = this.messValidation(
                dateTime,
                messageCounters.currentServiceInfoMess,
                () => {
                    this.store.dispatch(
                        updateUserInfo({
                            userInfo: { ...payload },
                        }),
                    );
                },
            );
        }
    }

    private handleUpdateFareBusStopList(opts) {
        const { header, payload, dateTime, messageCounters } = opts;

        if ([MsgSubID.NOTIFY].includes(header.msgSubID)) {
            messageCounters.currentFareBusStopList = this.messValidation(
                dateTime,
                messageCounters.currentFareBusStopList,
                () => {
                    const currentIdx = payload?.fareBusStopList?.findIndex((item) => item?.flag === 'active');
                    this.store.dispatch(
                        updateBusStopList({
                            fareBusStopList: payload?.fareBusStopList || [],
                        }),
                    );
                    if (currentIdx > -1) {
                        this.store.dispatch(
                            updateCurrentFareBusStop({
                                payload: payload?.fareBusStopList[currentIdx]?.Busid,
                                idx: currentIdx,
                            }),
                        );
                    }
                },
            );
            // this.displayTripInfoPage();
        }
    }

    // private handleNextBusInfo(header: any, payload: any, dateTime: Date, messageCounters: any) {
    //     if ([MsgSubID.NOTIFY].includes(header.msgSubID)) {
    //         messageCounters.currentNextBusStop = this.messValidation(
    //             dateTime,
    //             messageCounters.currentNextBusStop,
    //             () => {
    //                 this.store.dispatch(
    //                     updateNextBusInfo({
    //                         payload,
    //                     }),
    //                 );
    //             },
    //         );
    //     }
    // }

    private async handleNotifyMessages(opts) {
        const { header, payload, dateTime, messageCounters } = opts;

        switch (header?.msgID) {
            case MsgID?.BOOT_UP:
                messageCounters.currentBootUpMess = this.messValidation(
                    dateTime,
                    messageCounters.currentBootUpMess,
                    () => {
                        this.store.dispatch(updateBootUp({ payload: payload }));
                        // this.localStorageService.setItem(LocalStorageKey.LANGUAGE, JSON.stringify('EN'));
                        this.mqttService.publishWithMessageFormat({
                            topic: this.topics?.tcToAllTabs,
                            msgID: MsgID.LANGUAGE_SETTING,
                            msgSubID: MsgSubID.NOTIFY,
                            payload: { language: 'EN' },
                            opts: { retain: false },
                        });
                        this.navigate(this.mainUrl);
                    },
                );
                break;

            case MsgID?.LANGUAGE:
                messageCounters.currentLanguage = this.messValidation(dateTime, messageCounters.currentLanguage, () => {
                    // this.localStorageService.setItem(
                    //     LocalStorageKey.LANGUAGE,
                    //     JSON.stringify(payload?.language || 'EN'),
                    // );
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.tcToAllTabs,
                        msgID: MsgID.LANGUAGE_SETTING,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { language: payload?.language || 'EN' },
                        opts: { retain: false },
                    });
                    this.navigate(this.languageSettingUrl);
                });
                break;

            case MsgID?.DATE_TIME_SETTING:
                messageCounters.currentDateTimeSetting = this.messValidation(
                    dateTime,
                    messageCounters.currentDateTimeSetting,
                    () => {
                        this.store.dispatch(updateDateTimeSetting({ payload }));
                        this.navigate(this.dateTimeSettingUrl);
                    },
                );
                break;

            case MsgID?.FARE_CONSOLE:
            case MsgID?.DELETE_PARAMETER_NOTIFY:
                messageCounters.currentFareConsole = this.messValidation(
                    dateTime,
                    messageCounters.currentFareConsole,
                    () => {
                        this.store.dispatch(updateFareConsole({ payload, msgID: header?.msgID }));
                        this.navigate(this.fareConsoleSettingUrl);
                    },
                );
                break;

            case MsgID?.OUT_OF_SERVICE_INFO:
                messageCounters.currentOutOfServiceInfo = this.messValidation(
                    dateTime,
                    messageCounters.currentOutOfServiceInfo,
                    () => {
                        this.store?.dispatch(updateOutOfService({ payload }));
                        this.navigate(this.loginUrl);
                    },
                );
                break;
            case MsgID?.OUT_OF_SERVICE_MISSING_DATA:
                messageCounters.currentOutOfServiceMissingData = this.messValidation(
                    dateTime,
                    messageCounters.currentOutOfServiceMissingData,
                    () => {
                        this.store?.dispatch(updateOutOfService({ payload }));
                        this.navigate(this.loginUrl);
                    },
                );
                break;
            case MsgID?.CV_UPGRADE:
                messageCounters.cvUpgradeStatus = this.messValidation(dateTime, messageCounters.cvUpgradeStatus, () => {
                    this.store?.dispatch(
                        updateCvUpgradeStatus({
                            payload: payload?.status,
                        }),
                    );
                    this.navigate(this.loginUrl);
                });
                break;

            case MsgID?.DAGW_OPERATION:
            case MsgID?.NEW_DAGW_OPERATION:
                messageCounters.currentDgwOperation = this.messValidation(
                    dateTime,
                    messageCounters.currentDgwOperation,
                    () => {
                        this.store.dispatch(updateDagwOperation({ payload: { ...header, ...payload } }));
                        this.navigate(this.loginUrl);
                        // this.navigate(routerUrls?.private?.main?.dagwOperation);
                    },
                );
                break;
            case MsgID?.BUS_OPERATION_MENU:
                messageCounters.currentBusOperationMenu = this.messValidation(
                    dateTime,
                    messageCounters.currentBusOperationMenu,
                    () => {
                        this.navigate(this.busOperationUrl);
                        this.handleUnlockSuccess();
                    },
                );
                break;
            case MsgID?.MAIN_ACCESS_DENIED:
                this.navigate(this.accessDeniedUrl);
                break;

            case MsgID?.BC_TAP_CARD_LOGIN:
            case MsgID?.BC_TAP_CARD_PIN:
            case MsgID?.MS_TAP_CARD_LOGIN:
                messageCounters.currentLoginTapCard = this.messValidation(
                    dateTime,
                    messageCounters.currentLoginTapCard,
                    () => {
                        this.store.dispatch(
                            updateTapCardLogin({
                                payload: { ...header, ...payload },
                                msgID: header?.msgID,
                            }),
                        );
                        this.navigate(this.tapCardLoginUrl);
                    },
                );
                break;
            case MsgID?.BC_TAP_CARD_DUTY:
                messageCounters.currentBCTapCardDuty = this.messValidation(
                    dateTime,
                    messageCounters.currentBCTapCardDuty,
                    () => {
                        this.navigate(this.busOperationUrl);
                        // this.handleLoginSuccess(1);
                    },
                );
                break;
            case MsgID?.TAP_CARD_NOTIFICATION:
                this.store.dispatch(updateLoginOption({ payload: { ...header, ...payload } }));
                this.navigate(this.loginOptionUrl);
                break;
            case MsgID?.MANUAL_LOGIN_PIN:
            case MsgID?.MANUAL_LOGIN_PIN2:
            case MsgID?.MANUAL_LOGIN_STAFF_ID:
                if (this.displayLockScreen) {
                    // lock
                    messageCounters.currentLockScreen = this.messValidation(
                        dateTime,
                        messageCounters.currentLockScreen,
                        () => {
                            this.store.dispatch(
                                updateLockScreen({
                                    payload: { ...header, ...payload, timeout: payload.timeout || undefined },
                                }),
                            );
                        },
                    );
                } else {
                    // login
                    messageCounters.currentManualPIN = this.messValidation(
                        dateTime,
                        messageCounters.currentManualPIN,
                        () => {
                            this.store.dispatch(
                                updateManualLogin({
                                    msgID: header?.msgID,
                                    payload: { ...header, ...payload, timeout: payload.timeout || undefined },
                                }),
                            );
                            this.navigate(this.manualLoginUrl);
                        },
                    );
                }

                break;
            case MsgID?.MANUAL_LOGIN_DUTY:
                messageCounters.currentManualDuty = this.messValidation(
                    dateTime,
                    messageCounters.currentManualDuty,
                    () => {
                        this.navigate(this.busOperationUrl);
                        // this.handleLoginSuccess(1);
                    },
                );
                break;

            case MsgID?.START_TRIP_POP_UP_MESSAGE:
                messageCounters.currentStartTripPopUp = this.messValidation(
                    dateTime,
                    messageCounters.currentStartTripPopUp,
                    () => {
                        // console.log('payload', payload?.type);
                        // this.displayTripInfoPage();
                        if (MainPagePopUp.FMS_NO_INFO !== payload?.type) {
                            this.resetPopUpHandler();
                        }

                        switch (payload?.type) {
                            case MainPagePopUp?.BUS_STOP_MISMATCH:
                                this.commonPopup = {
                                    type: 'info',
                                    show: true,
                                    title: 'BUS_STOP_MISMATCH',
                                    message: 'BUS_STOP_MISMATCH_ALERT',
                                    disableTimeout: true,
                                };
                                // this.showPop = {
                                //     title: 'BUS_STOP_MISMATCH',
                                //     caption: 'BUS_STOP_MISMATCH_ALERT',
                                // };
                                break;
                            case MainPagePopUp?.TRIP_MISMATCH:
                                this.commonPopup = {
                                    type: 'info',
                                    show: true,
                                    title: 'TRIP_MISMATCH',
                                    message: 'TRIP_MISMATCH_CAPTION',
                                    disableTimeout: true,
                                };
                                // this.showPop = {
                                //     title: 'TRIP_MISMATCH',
                                //     caption: 'TRIP_MISMATCH_CAPTION',
                                // };
                                break;
                            case MainPagePopUp?.DRIVER_ID_CHANGES:
                                this.commonPopup = {
                                    type: 'info',
                                    show: true,
                                    title: 'DRIVER_ID_CHANGED_IN_FMS',
                                    message: 'DRIVER_ID_CHANGED_IN_FMS_CAPTION',
                                    disableTimeout: true,
                                    closeMsgID: MsgID?.ACKNOWLEDGE_DRIVER_STATUS,
                                };
                                // this.showPop = {
                                //     title: 'DRIVER_ID_CHANGED_IN_FMS',
                                //     caption: 'DRIVER_ID_CHANGED_IN_FMS_CAPTION',
                                // };
                                break;
                            case MainPagePopUp?.DRIVER_BLOCKED_LOG_OFF:
                                this.commonPopup = {
                                    type: 'info',
                                    show: true,
                                    title: 'DRIVER_BLOCK_LOGGED_OFF',
                                    message: 'DRIVER_BLOCK_LOGGED_OFF_CAPTION',
                                    disableTimeout: true,
                                    closeMsgID: MsgID?.ACKNOWLEDGE_DRIVER_STATUS,
                                };
                                // this.showPop = {
                                //     title: 'DRIVER_BLOCK_LOGGED_OFF',
                                //     caption: 'DRIVER_BLOCK_LOGGED_OFF_CAPTION',
                                // };
                                break;
                            case MainPagePopUp?.FMS_NO_INFO:
                                this.showPop = {
                                    title: 'WAITING_FOR_FMS_INFO',
                                    loading: true,
                                    hideButton: true,
                                };
                                this.store.dispatch(
                                    updateDeviation({
                                        payload: {
                                            currentBlock: '--:--',
                                            isHeadway: true,
                                            minSec: '--:--',
                                            bars: 0,
                                            direction: '',
                                            color: 'black',
                                        },
                                    }),
                                );
                                break;
                            default:
                                this.showPop = null;
                                break;
                        }
                    },
                );
                break;
            case MsgID?.DRIVER_STATUS:
                messageCounters.currentStartTripPopUp = this.messValidation(
                    dateTime,
                    messageCounters.currentStartTripPopUp,
                    () => {
                        this.resetPopUpHandler();
                        switch (payload?.type) {
                            case MainPagePopUp?.DRIVER_ID_CHANGES:
                                this.commonPopup = {
                                    type: 'info',
                                    show: true,
                                    title: 'DRIVER_ID_CHANGED_IN_FMS',
                                    message: 'FARE_SHIFT_WILL_END',
                                    disableTimeout: true,
                                    closeMsgID: MsgID?.ACKNOWLEDGE_DRIVER_STATUS,
                                    fullScreen: true,
                                };
                                break;
                            case MainPagePopUp?.DRIVER_BLOCKED_LOG_OFF:
                                this.commonPopup = {
                                    type: 'info',
                                    show: true,
                                    title: 'DRIVER_BLOCK_LOGGED_OFF',
                                    message: 'FARE_SHIFT_WILL_END',
                                    disableTimeout: true,
                                    closeMsgID: MsgID?.ACKNOWLEDGE_DRIVER_STATUS,
                                    fullScreen: true,
                                };
                                break;
                            default:
                                this.showPop = null;
                                break;
                        }
                    },
                );
                break;
            case MsgID?.BOOT_UP_COMMISSIONING:
                messageCounters.currentCommissioning = this.messValidation(
                    dateTime,
                    messageCounters.currentCommissioning,
                    () => {
                        this.handleBootUpCommissioning(header, payload);
                        // if (payload?.message === CommissioningType?.IN_PROGRESS) {
                        //     this.navigate(this.commissioningInProgressUrl);
                        // }
                        // if (payload?.message === CommissioningType?.CLEARING_ALL_DATA) {
                        //     this.navigate(this.commissioningClearingAllDataUrl);
                        // }
                        // if (payload?.message === CommissioningType?.COMPLETED_CLEANING) {
                        //     this.navigate(this.commissioningCompletedCleaningUrl);
                        // }
                    },
                );
                break;

            case MsgID.END_TRIP:
                messageCounters.currentEndTrip = this.messValidation(dateTime, messageCounters.currentEndTrip, () => {
                    this.store.dispatch(
                        updateEndTripInfo({
                            msgID: header?.msgID,
                            payload,
                        }),
                    );
                    this.navigate(this.endTripUrl);
                });
                break;

            case MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE:
                messageCounters.currentStartTripForSpecialCase = this.messValidation(
                    dateTime,
                    messageCounters.currentStartTripForSpecialCase,
                    () => {
                        if (
                            [
                                StartTripTypes?.FMS_VALID_INFO,
                                StartTripTypes?.FMS_TRIP_INFO_MISMATCH,
                                StartTripTypes?.FMS_BUS_STOP_MISMATCH,
                            ].includes(payload?.type)
                        ) {
                            this.store.dispatch(
                                updateStartTrip({
                                    payload: {
                                        fms: {
                                            serviceNumber: payload?.serviceNumber,
                                            busStop: payload?.busStop,
                                            dir: payload?.dir,
                                            variantName: payload?.variantName,
                                        },
                                        ...payload,
                                    },
                                    msgID: header?.msgID,
                                }),
                            );
                        } else if ([StartTripTypes?.FMS_NO_INFO].includes(payload?.type)) {
                            this.store.dispatch(
                                updateStartTrip({
                                    payload,
                                    msgID: header?.msgID,
                                }),
                            );
                        }
                        this.navigate(this.busOperationStartTripUrl);
                    },
                );
                break;

            // for buttons on main screen
            case MsgID.MAIN_FREE:
                messageCounters.currentFreeMsg = this.messValidation(dateTime, messageCounters.currentFreeMsg, () => {
                    this.store.dispatch(updateFreeCVs({ payload: { ...header, ...payload } }));
                    this.navigate(routerUrls?.private?.main?.free);
                });
                break;

            case MsgID.MAIN_BREAKDOWN:
                messageCounters.currentBreakDown = this.messValidation(
                    dateTime,
                    messageCounters.currentBreakDown,
                    () => {
                        this.store.dispatch(updateBreakDownInfo({ payload: { ...payload } }));
                        this.navigate(routerUrls?.private?.main?.breakdown);
                    },
                );
                break;

            case MsgID.MAIN_REAR_DOORS:
                messageCounters.currentRearDoorsMsg = this.messValidation(
                    dateTime,
                    messageCounters.currentRearDoorsMsg,
                    () => {
                        // this.navigate(routerUrls?.private?.main?.rearDoor);
                        const nextActiveCvs: number[] = [];
                        this?.cvLists?.forEach((_cv) => {
                            if (_cv.id > 2) {
                                nextActiveCvs.push(_cv.id);
                            }
                        });
                        this.store.dispatch(updateActiveCVs({ payload: nextActiveCvs }));
                        this.displayTripInfoPage();

                        // this.cvLists = this?.cvLists?.map((_cv) => {
                        //     const nextCv = { ..._cv };
                        //     const updatedCv = payload?.cvList?.find((item) => item.cvNumber === _cv.id);
                        //     if (updatedCv) {
                        //         nextCv.statuses = updatedCv.statuses;
                        //         nextActiveCvs.push(nextCv.id);
                        //     }
                        //     return nextCv;
                        // });
                        // this.store.dispatch(
                        //     updateActiveCVs({
                        //         payload: nextActiveCvs,
                        //     }),
                        // );
                    },
                );
                break;
            case MsgID.MAIN_CASH:
                messageCounters.currentCashMsg = this.messValidation(dateTime, messageCounters.currentCashMsg, () => {
                    this.store.dispatch(updateCashPayment({ payload: { ...header, ...payload } }));
                    this.navigate(routerUrls?.private?.main?.cashPayment);
                });
                break;
            case MsgID.MAIN_FRONT_DOOR:
                messageCounters.currentFrontDoorsMsg = this.messValidation(
                    dateTime,
                    messageCounters.currentFrontDoorsMsg,
                    () => {
                        this.store.dispatch(
                            updateFrontDoor({
                                payload: { ...header, ...payload },
                            }),
                        );
                        this.navigate(routerUrls?.private?.main?.frontDoor);
                    },
                );
                break;
            case MsgID.MAIN_REDEEM:
            case MsgID.COMMON_PRINT_ERROR:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    this.resetPopUpHandler();
                    this.commonPopup = {
                        type: 'error',
                        show: true,
                        title: payload?.message || '',
                        timeout: payload?.timeout || DEFAULT_TIMEOUT,
                    };
                });
                break;

            //lock screen
            case MsgID.NOTIFY_TO_LOCK:
                messageCounters.currentLockScreen = this.messValidation(
                    dateTime,
                    messageCounters.currentLockScreen,
                    () => {
                        this.handleLockScreen();
                    },
                );
                break;
            case MsgID.UNLOCK_SUCCESS:
                messageCounters.currentLockScreen = this.messValidation(
                    dateTime,
                    messageCounters.currentLockScreen,
                    () => {
                        // this.handleUnlockSuccess();
                    },
                );
                break;
            // case MsgID.LOCK_BROAD_CAST:
            //     this.store.dispatch(
            //         updateLockScreen({
            //             payload: {
            //                 msgID: MsgID.NOTIFY_TO_LOCK,
            //             },
            //         }),
            //     );
            //     this.displayLockScreen = true;
            //     // this.navigate(routerUrls?.private?.main?.lockScreen);
            //     break;
            // case MsgID.UNLOCK_BROAD_CAST:
            //     this.handleUnlockSuccess(true);
            //     break;

            // external devices
            case MsgID?.EXTERNAL_DEVICES_NOTIFY:
                messageCounters.currentExternalDevices = this.messValidation(
                    dateTime,
                    messageCounters.currentExternalDevices,
                    () => {
                        this.store.dispatch(
                            updateExternalDevices({
                                payload: { ...header, ...payload },
                            }),
                        );

                        const isNavigationRequired = payload?.isNavigationRequired || false;
                        // console.log({ status: payload?.status, isRetainMsg });
                        if (isNavigationRequired) {
                            this.navigate(this.externalDevicesUrl);
                        }
                    },
                );
                break;

            // POP-UP messages
            case MsgID.IGNITION_OFF:
                messageCounters.currentIgnitionOffMsg = this.messValidation(
                    dateTime,
                    messageCounters.currentIgnitionOffMsg,
                    () => {
                        this.resetPopUpHandler();
                        this.ignitionOff = {
                            show: true,
                            message: payload?.currentTime || '',
                            delay: payload?.delay || 20,
                        };
                        // if (isRetainMsg) this.displayTripInfoPage();
                    },
                );
                break;

            case MsgID.AUTO_DISABLE_BLS:
                messageCounters.currentDisableBls = this.messValidation(
                    dateTime,
                    messageCounters.currentDisableBls,
                    () => {
                        this.resetPopUpHandler();
                        this.disableBls = { show: true };
                        // if (isRetainMsg) this.displayTripInfoPage();
                    },
                );
                break;

            case MsgID.MAIN_FARE_BUS_STOP_MODE:
                messageCounters.currentFareBusStopMode = this.messValidation(
                    dateTime,
                    messageCounters.currentFareBusStopMode,
                    () => {
                        this.resetPopUpHandler();
                        this.fareBusStopMode = {
                            show: true,
                            message: payload?.message || '',
                        };
                        // if (isRetainMsg) this.displayTripInfoPage();
                    },
                );
                break;
            case MsgID.INVALID_INSPECTOR_CARD:
                messageCounters.currentInvalidInspectorCard = this.messValidation(
                    dateTime,
                    messageCounters.currentInvalidInspectorCard,
                    () => {
                        this.resetPopUpHandler();
                        this.invalidInspectorCard = {
                            show: true,
                            message: payload?.message || '',
                        };
                        // if (isRetainMsg) this.displayTripInfoPage();
                    },
                );
                break;

            case MsgID.BUS_OFF_ROUTE:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    // this.resetPopUpHandler();
                    this.store.dispatch(
                        updateUserInfo({
                            userInfo: {
                                ...userInfo,
                                offRoute: payload?.status,
                            },
                        }),
                    );
                    // if (isRetainMsg) this.displayTripInfoPage();
                });
                break;

            case MsgID.MAIN_CJB_PLATE_NUMBER:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    this.resetPopUpHandler();
                    this.commonPopup = {
                        type: 'info',
                        show: true,
                        title: 'CJB',
                        message: `${this.translate.instant('BUS_PLATE_NUMBER')}: ${payload?.message || ''}`,
                        timeout: payload?.timeout || DEFAULT_TIMEOUT,
                    };
                });
                break;

            case MsgID.MAIN_CHECK_POINT:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    this.resetPopUpHandler();
                    this.commonPopup = {
                        type: 'info',
                        show: true,
                        title: 'WAIT_FOR_PATRON',
                        message: 'WAIT_FOR_PATRON_DETAIL',
                        disableTimeout: true,
                        closeMsgID: MsgID.MAIN_CHECK_POINT_CLOSE,
                    };
                    this.disableAllButtons = true;
                });
                break;

            //  warning 10 bus stop bypass
            case MsgID.MAIN_BYPASS_TEN_BUS_STOP:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    this.resetPopUpHandler();
                    this.commonPopup = {
                        type: 'warning',
                        show: true,
                        message: 'BYPASS_ALERT',
                        timeout: payload?.timeout || DEFAULT_TIMEOUT,
                    };
                    // if (isRetainMsg) this.displayTripInfoPage();
                });
                break;
            // warning BLS and FMS are not working
            case MsgID.MAIN_FMS_BLS_ARE_NOT_WORKING:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    this.resetPopUpHandler();
                    this.commonPopup = {
                        show: true,
                        type: 'info',
                        title: 'FARE_UNABLE_TO_AUTO_UPDATE',
                        message: 'CHANGE_FARE_MANUALLY',
                        timeout: payload?.timeout || DEFAULT_TIMEOUT,
                    };
                    // if (isRetainMsg) this.displayTripInfoPage();
                });
                break;

            // BLS recovered
            case MsgID.MAIN_BLS_RECOVERED:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    this.resetPopUpHandler();
                    this.commonPopup = {
                        show: true,
                        type: 'info',
                        title: 'BLS_FUNCTION',
                        message: 'BLS_RECOVERED',
                        timeout: payload?.timeout || DEFAULT_TIMEOUT,
                    };
                    // if (isRetainMsg) this.displayTripInfoPage();
                });
                break;

            // Login option error
            case MsgID.LOGIN_OPTION_ERROR:
                messageCounters.currentPopupMsg = this.messValidation(dateTime, messageCounters.currentPopupMsg, () => {
                    this.resetPopUpHandler();
                    this.commonPopup = {
                        show: true,
                        type: 'error',
                        title: 'ERROR',
                        message: 'NOT_ENOUGH_PARAMETERS_START_SHIFT',
                        timeout: payload?.timeout || DEFAULT_TIMEOUT,
                    };
                    // if (isRetainMsg) this.displayTripInfoPage();
                });
                break;

            case MsgID.HASH_PASSWORD: {
                if (!payload?.password) return;
                const passwordHash = await this.authService.hashPassword(payload?.password);
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics.mainTab?.get,
                    msgID: MsgID.HASH_PASSWORD_RESULT,
                    msgSubID: MsgSubID.NOTIFY,
                    payload: { passwordHash },
                });
                break;
            }

            default:
                break;
        }
    }

    private handleResponseMessages(opts) {
        const { header, payload, dateTime, messageCounters } = opts;

        switch (header?.msgID) {
            case MsgID?.DATE_TIME_SUBMIT:
                messageCounters.currentDateTimeSetting = this.messValidation(
                    dateTime,
                    messageCounters.currentDateTimeSetting,
                    () => {
                        this.store.dispatch(updateDateTimeSetting({ payload }));
                        this.navigate(this.dateTimeSettingUrl);
                    },
                );
                break;

            case MsgID?.DECK_TYPE_LIST:
            case MsgID?.DELETE_PARAMETER:
                messageCounters.currentFareConsole = this.messValidation(
                    dateTime,
                    messageCounters.currentFareConsole,
                    () => {
                        this.store.dispatch(
                            updateFareConsole({
                                payload,
                                msgID: header?.msgID,
                            }),
                        );
                        this.navigate(this.fareConsoleSettingUrl);
                    },
                );
                break;
            case MsgID?.COMMISSION_BUS_ID:
            case MsgID?.COMMISSION_OPERATOR:
            case MsgID?.COMMISSION_BUS_ID_SUBMIT:
                messageCounters.currentBusId = this.messValidation(dateTime, messageCounters.currentBusId, () => {
                    this.store.dispatch(
                        updateCommissionBusIdInformation({
                            payload,
                            msgID: header?.msgID,
                        }),
                    );
                    this.navigate(this.fareConsoleSettingUrl);
                });
                break;

            case MsgID?.BC_TAP_CARD_PIN:
            case MsgID?.BC_TAP_CARD_DUTY:
                messageCounters.currentTapCardPIN = this.messValidation(
                    dateTime,
                    messageCounters.currentTapCardPIN,
                    () => {
                        this.store.dispatch(
                            updateTapCardLogin({
                                msgID: header?.msgID,
                                payload: { ...header, ...payload },
                            }),
                        );
                        this.navigate(this.tapCardLoginUrl);
                    },
                );
                break;
            case MsgID?.MS_TAP_CARD_PIN:
                messageCounters.currentTapCardPIN = this.messValidation(
                    dateTime,
                    messageCounters.currentTapCardPIN,
                    () => {
                        if (payload?.status === ResponseStatus.SUCCESS) {
                            console.log('access denied');
                            this.navigate(routerUrls?.private?.main?.accessDenied);
                            // this.handleLoginSuccess(2);
                            return;
                        }
                        this.store.dispatch(
                            updateTapCardLogin({
                                msgID: header?.msgID,
                                payload: { ...header, ...payload },
                            }),
                        );
                        this.navigate(this.tapCardLoginUrl);
                    },
                );
                break;

            case MsgID?.MANUAL_LOGIN_PIN:
            case MsgID?.MANUAL_LOGIN_PIN2:
            case MsgID?.MANUAL_LOGIN_STAFF_ID:
            case MsgID?.MANUAL_LOGIN_DUTY:
                if (this.displayLockScreen) {
                    // unlock success
                    if (payload.status === ResponseStatus.SUCCESS && header?.msgID === MsgID.MANUAL_LOGIN_PIN2) {
                        // this.handleUnlockSuccess();
                    } else {
                        messageCounters.currentLockScreen = this.messValidation(
                            dateTime,
                            messageCounters.currentLockScreen,
                            () => {
                                this.store.dispatch(
                                    updateLockScreen({
                                        payload: { ...header, ...payload, timeout: payload.timeout || undefined },
                                    }),
                                );
                            },
                        );
                    }
                } else {
                    // login
                    messageCounters.currentManualPIN = this.messValidation(
                        dateTime,
                        messageCounters.currentManualPIN,
                        () => {
                            this.store.dispatch(
                                updateManualLogin({
                                    msgID: header?.msgID,
                                    payload: { ...header, ...payload, timeout: payload.timeout || undefined },
                                }),
                            );
                            // this.navigate(routerUrls?.private?.main?.manualLogin);
                            this.navigate(this.manualLoginUrl);
                        },
                    );
                }
                break;

            case MsgID?.END_SHIFT:
                messageCounters.currentEndShift = this.messValidation(dateTime, messageCounters.currentEndShift, () => {
                    if (payload?.status === ResponseStatus.SUCCESS) {
                        this.navigate(this.loginUrl);
                        // this.handleEndShiftSuccess();
                    }
                });
                break;

            case MsgID.END_TRIP:
                messageCounters.currentEndTrip = this.messValidation(dateTime, messageCounters.currentEndTrip, () => {
                    if (payload?.status === ResponseStatus.SUCCESS) {
                        this.store.dispatch(
                            updateEndTripInfo({
                                msgID: header?.msgID,
                                payload,
                            }),
                        );
                        this.navigate(this.endTripUrl);
                    }
                });
                break;
            case MsgID?.END_TRIP_TYPE:
            case MsgID?.END_TRIP_SUBMIT:
                messageCounters.currentEndTrip = this.messValidation(dateTime, messageCounters.currentEndTrip, () => {
                    // if (payload?.status === ResponseStatus.SUCCESS) {
                    //     this.navigate(routerUrls?.private?.main?.busOperation?.url);
                    //     return;
                    // }
                    this.store.dispatch(
                        updateEndTripInfo({
                            msgID: header?.msgID,
                            payload,
                        }),
                    );
                    this.navigate(this.endTripUrl);
                });
                break;

            case MsgID?.EXTERNAL_DEVICES:
                messageCounters.currentExternalDevices = this.messValidation(
                    dateTime,
                    messageCounters.currentExternalDevices,
                    () => {
                        this.store.dispatch(
                            updateExternalDevices({
                                payload: { ...header, ...payload },
                            }),
                        );
                        this.navigate(this.busOperationUrl);
                    },
                );
                break;
            case MsgID?.MAINTENANCE_TEST_PRINT:
                messageCounters.currentExternalDevices = this.messValidation(
                    dateTime,
                    messageCounters.currentExternalDevices,
                    () => {
                        this.store.dispatch(
                            updateTestPrinter({
                                payload,
                            }),
                        );
                        this.navigate(this.externalDevicesUrl);
                    },
                );
                break;

            // start trip flow:
            case MsgID?.START_TRIP:
                messageCounters.currentStartTrip = this.messValidation(
                    dateTime,
                    messageCounters.currentStartTrip,
                    () => {
                        if (
                            [
                                StartTripTypes?.FMS_VALID_INFO,
                                StartTripTypes?.FMS_TRIP_INFO_MISMATCH,
                                StartTripTypes?.FMS_BUS_STOP_MISMATCH,
                            ].includes(payload?.type)
                        ) {
                            this.navigate(this.busOperationStartTripUrl);
                            this.store.dispatch(
                                updateStartTrip({
                                    payload: {
                                        fms: {
                                            serviceNumber: payload?.serviceNumber,
                                            busStop: payload?.busStop,
                                            dir: payload?.dir,
                                            variantName: payload?.variantName,
                                        },
                                        ...payload,
                                    },
                                    msgID: header?.msgID,
                                }),
                            );
                        } else if ([StartTripTypes?.FMS_NO_INFO].includes(payload?.type)) {
                            this.navigate(this.startTripInvalidInfoUrl);
                            // this.store.dispatch(
                            //     updateStartTrip({
                            //         payload,
                            //         msgID: header?.msgID,
                            //     }),
                            // );
                        }
                    },
                );
                break;
            case MsgID.START_TRIP_BUS_STOP_LIST:
            case MsgID.START_TRIP_GET_SERVICE_LIST:
            case MsgID.START_TRIP_SUBMIT_SERVICE:
                this.store.dispatch(updateStartTrip({ payload, msgID: header?.msgID }));
                this.navigate(this.busOperationStartTripUrl);
                break;
            case MsgID.START_TRIP_GET_FARE_TRIP_DETAILS:
                this.store.dispatch(updateStartTrip({ payload: { fare: { ...payload } }, msgID: header?.msgID }));
                this.navigate(this.busOperationStartTripUrl);
                break;
            case MsgID.START_TRIP_SUBMIT_FARE_TRIP:
                messageCounters.currentStartTrip = this.messValidation(
                    dateTime,
                    messageCounters.currentStartTrip,
                    () => {
                        // if (payload.status === ResponseStatus.SUCCESS) {
                        //     // this.navigate(routerUrls?.private?.main?.busStopInformation);
                        //     this.handleStartTripSuccess();
                        // }
                    },
                );
                break;

            case MsgID.MAIN_FREE_SUBMIT:
                messageCounters.currentFreeMsg = this.messValidation(dateTime, messageCounters.currentFreeMsg, () => {
                    if (payload.status === ResponseStatus.SUCCESS) {
                        // this.store.dispatch(
                        //     updateFreeCVs({
                        //         payload: {
                        //             freeMode: !this.free.freeMode,
                        //         },
                        //     }),
                        // );
                        this.blinkEffectHandler();
                    }
                    this.displayTripInfoPage();
                });
                break;
            case MsgID.MAIN_FREE_CANCEL:
                messageCounters.currentFreeMsg = this.messValidation(dateTime, messageCounters.currentFreeMsg, () => {
                    if (payload.status === ResponseStatus.SUCCESS) {
                        this.displayTripInfoPage();
                    }
                });
                break;

            case MsgID.MAIN_FRONT_DOOR_SELECT_CV:
                messageCounters.currentFrontDoorsMsg = this.messValidation(
                    dateTime,
                    messageCounters.currentFrontDoorsMsg,
                    () => {
                        this.store.dispatch(updateFrontDoor({ payload: { ...header, ...payload } }));
                        this.navigate(routerUrls?.private?.main?.frontDoor);
                    },
                );
                break;

            case MsgID.MAIN_FRONT_DOOR_CANCEL:
                messageCounters.currentFrontDoorsMsg = this.messValidation(
                    dateTime,
                    messageCounters.currentFrontDoorsMsg,
                    () => {
                        if (payload.status === ResponseStatus.SUCCESS) {
                            this.displayTripInfoPage();
                        }
                    },
                );
                break;
            case MsgID.MAIN_FRONT_DOOR_CONFIRM:
                messageCounters.currentFrontDoorsMsg = this.messValidation(
                    dateTime,
                    messageCounters.currentFrontDoorsMsg,
                    () => {
                        const nextActiveCvs: number[] = [];
                        if (this.frontDoor?.cvNum) {
                            nextActiveCvs.push(this.frontDoor.cvNum);

                            this.store.dispatch(
                                updateActiveCVs({
                                    payload: nextActiveCvs,
                                }),
                            );
                        }
                        // this.cvLists = this?.cvLists?.map((_cv) => {
                        //     const nextCv = { ..._cv };
                        //     if (nextCv.id === this.frontDoor?.cvNum) {
                        //         nextCv.statuses = payload.statuses;
                        //         nextActiveCvs.push(nextCv.id);
                        //     }

                        //     return nextCv;
                        // });
                        // this.store.dispatch(
                        //     updateActiveCVs({
                        //         payload: nextActiveCvs,
                        //     }),
                        // );
                        this.displayTripInfoPage();
                    },
                );
                break;

            case MsgID.MAIN_UP_DOWN_BTN:
                messageCounters.currentUpDownButton = this.messValidation(
                    dateTime,
                    messageCounters.currentUpDownButton,
                    () => {
                        if (payload['busStopId'] || payload['index'] > -1) {
                            this.store.dispatch(
                                updateCurrentFareBusStop({
                                    payload: payload['busStopId'],
                                    manualBls: payload?.manualBls,
                                    autoBls: payload?.autoBls,
                                    misMatch: payload?.misMatch,
                                    isUpstage: payload?.isUpstage,
                                    idx: payload?.index,
                                }),
                            );

                            // this.displayTripInfoPage();
                        }
                    },
                );
                break;
            case MsgID.IGNITION_OFF:
                messageCounters.currentIgnitionOffMsg = this.messValidation(
                    dateTime,
                    messageCounters.currentIgnitionOffMsg,
                    () => {
                        this.ignitionOff = {
                            show: false,
                            message: '',
                            disabled: false,
                        };
                        // this.displayTripInfoPage();
                    },
                );
                break;
            case MsgID.FARE_BUS_STOP_MODE_SUBMIT:
                messageCounters.currentFareBusStopMode = this.messValidation(
                    dateTime,
                    messageCounters.currentFareBusStopMode,
                    () => {
                        this.fareBusStopMode = {
                            show: false,
                            message: '',
                        };
                        // this.displayTripInfoPage();
                    },
                );
                break;
            case MsgID.AUTO_DISABLE_BLS_CONFIRM:
                messageCounters.currentDisableBls = this.messValidation(
                    dateTime,
                    messageCounters.currentDisableBls,
                    () => {
                        this.disableBls = {
                            show: false,
                        };
                        // this.displayTripInfoPage();
                    },
                );
                break;

            case MsgID?.BREAKDOWN_BUS_STOP_LIST:
            case MsgID?.BREAKDOWN_PROCESS_BREAKDOWN_TICKET:
                messageCounters.currentBreakDown = this.messValidation(
                    dateTime,
                    messageCounters.currentBreakDown,
                    () => {
                        this.store.dispatch(updateBreakDownInfo({ payload: { ...payload } }));
                        this.navigate(routerUrls?.private?.main?.breakdown);
                    },
                );
                break;

            case MsgID?.BREAKDOWN_CHANGE_BUS_STOP:
            case MsgID?.BREAKDOWN_SUBMIT:
            case MsgID?.BREAKDOWN_SUBMIT_REASON:
            case MsgID?.BREAKDOWN_SUBMIT_COMP_TICKET:
            case MsgID?.BREAKDOWN_PROCESS_COMP_TICKET:
            case MsgID?.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET:
            case MsgID?.BREAKDOWN_BACK_BUTTON:
                messageCounters.currentBreakDown = this.messValidation(
                    dateTime,
                    messageCounters.currentBreakDown,
                    () => {
                        if (payload.status === ResponseStatus.SUCCESS && header?.msgID == MsgID.BREAKDOWN_CANCEL) {
                            this.displayTripInfoPage();
                        } else {
                            this.store.dispatch(updateBreakDownInfo({ payload: { ...header, ...payload } }));
                            this.navigate(routerUrls?.private?.main?.breakdown);
                        }
                    },
                );
                break;
            case MsgID?.BREAKDOWN_CANCEL:
                messageCounters.currentBreakDown = this.messValidation(
                    dateTime,
                    messageCounters.currentBreakDown,
                    () => {
                        if (payload.status === ResponseStatus.SUCCESS) {
                            this.displayTripInfoPage();
                        }
                    },
                );
                break;

            case MsgID.MAIN_CASH_MULTI_CANCEL:
            case MsgID.MAIN_CASH_FARE_CALCULATION:
                messageCounters.currentCashMsg = this.messValidation(dateTime, messageCounters.currentCashMsg, () => {
                    if (payload?.status === ResponseStatus.SUCCESS) {
                        this.displayTripInfoPage();
                    }
                });
                break;

            case MsgID.MAIN_CASH_MULTI_SUBMIT:
            case MsgID.MAIN_CASH_MULTI_BACK:
            case MsgID.MAIN_CASH_MULTI_CONFIRM:
            case MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP:
            case MsgID.MAIN_CASH_FARE_CALCULATION_BACK:
                messageCounters.currentCashMsg = this.messValidation(dateTime, messageCounters.currentCashMsg, () => {
                    this.store.dispatch(
                        updateCashPayment({ payload: { ...header, ...payload, fareResult: undefined } }),
                    );
                    this.navigate(routerUrls?.private?.main?.cashPayment);
                });
                break;
            case MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE:
                messageCounters.currentCashMsg = this.messValidation(dateTime, messageCounters.currentCashMsg, () => {
                    if (payload?.status === ResponseStatus.ERROR) {
                        this.store.dispatch(updateCashPayment({ payload: { ...payload } }));
                    } else {
                        this.store.dispatch(updateCashPayment({ payload: { ...header, fareResult: payload } }));
                    }
                    this.navigate(routerUrls?.private?.main?.cashPayment);
                });
                break;
            case MsgID.MAIN_CASH_SINGLE_SUBMIT:
            case MsgID.MAIN_CASH_FARE_CALCULATION_PRINT:
                messageCounters.currentCashMsg = this.messValidation(dateTime, messageCounters.currentCashMsg, () => {
                    this.store.dispatch(updateCashPayment({ payload }));
                    this.navigate(routerUrls?.private?.main?.cashPayment);
                });
                break;

            default:
                break;
        }
    }

    closePopUpHandler() {
        this.showPop = null;
    }

    formatMainHeader(url) {
        return [
            this.loginUrl,
            this.loginOptionUrl,
            this.tapCardLoginUrl,
            this.busOperationUrl,
            this.busOperationStartTripUrl,
            this.startTripInvalidInfoUrl,
            this.commissioningInProgressUrl,
            this.commissioningCompletedCleaningUrl,
            this.commissioningClearingAllDataUrl,
            this.externalDevicesUrl,
            this.dagwOperationUrl,
        ]?.includes(url)
            ? url.substring(1)
            : 'main';
    }

    displayTripInfoPage() {
        this.navigate(routerUrls?.private?.main?.busStopInformation);
    }

    setCvStatus() {
        this.cvLists = this.cvLists?.map((_cv) => {
            const statuses = _cv?.statuses?.filter((_s) => _s !== CvStatusType.FREE);
            if (this.free.freeMode) {
                statuses.push(CvStatusType.FREE);
            }
            return { ..._cv, statuses };
        });
    }

    blinkEffectHandler(): void {
        this.store.dispatch(updateActiveCVs({ payload: this.cvLists?.map((_cv) => _cv.id) }));
    }

    closeErrorCv(id: number) {
        const newList = [...this.cvLists]; // Create a shallow copy to avoid mutation
        const cv = newList[id - 1];

        if (cv.timer) {
            clearTimeout(cv.timer as number);
            cv.timer = null;
        }

        cv.error = false;
        cv.activeIcon = null;
        this.cvLists = newList;
    }

    navigate(route: string): void {
        const finalRoute = route?.startsWith('/') ? route : `/${route}`;
        if (this.currentRoute === finalRoute) return;
        this.router.navigate([finalRoute]);
    }

    isRouteActive(route: string): boolean {
        return this.router.url === route;
    }

    isDisableButton(): boolean {
        if (
            [
                this.disableAllButtons,
                this.displayLockPopUp,
                this.displaySettingsPopUp,
                this.displayFareBusStop,
            ].includes(true)
        ) {
            return true;
        }

        return [
            this.freeRoute,
            this.breakDownRoute,
            this.cashPaymentRoute,
            this.frontDoorRoute,
            this.rearDoorRoute,
            this.redeemRoute,
            this.endTripUrl,
        ].includes(this.currentRoute);
    }

    isOnlyDateTimeDisplay(): boolean {
        return (
            [
                this.mainUrl,
                this.languageSettingUrl,
                this.dateTimeSettingUrl,
                this.fareConsoleSettingUrl,
                this.tapCardLoginUrl,
                this.manualLoginUrl,
                this.accessDeniedUrl,
            ].includes(this.currentRoute) ||
            this.displayLockScreen ||
            this.bootUpCommissioning.show
        );
    }

    activeHeaderButton(): string[] {
        let activeBtn: string | null = null;
        if (this.displayLockPopUp) {
            activeBtn = 'lock-btn';
        } else if (this.displaySettingsPopUp) {
            activeBtn = 'settings-btn';
        } else if (this.currentRoute === this.endTripUrl) {
            activeBtn = 'end-trip-btn';
        }
        return activeBtn ? [activeBtn] : [];
    }

    updateLineActive(isUp: boolean): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID.MAIN_UP_DOWN_BTN,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                btnControl: isUp ? 1 : -1,
            },
        });
    }

    handleClickMainButton(btn: MainButton) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID.MAIN_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: { btn },
        });
    }

    resetPopUpHandler(): void {
        // this.shuttingDown = {
        //     show: false,
        //     message: '',
        // };
        this.ignitionOff = {
            show: false,
            message: '',
        };
        // this.busOffRoute = {
        //     show: false,
        //     message: '',
        // };
        this.disableBls = {
            show: false,
            message: '',
        };
        // this.cjbPlusNumber = {
        //     show: false,
        //     message: '',
        // };
        this.fareBusStopMode = {
            show: false,
            message: '',
        };
        this.invalidInspectorCard = {
            show: false,
            message: '',
        };
        this.commonPopup = {
            show: false,
            message: '',
            title: '',
            type: undefined,
            timeout: undefined,
        };

        this.displayLockPopUp = false;
        this.displaySettingsPopUp = false;
    }

    handleIgnitionOff() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID.IGNITION_OFF,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });

        this.ignitionOff = {
            ...this.ignitionOff,
            disabled: true,
        };
    }

    handleConfirmDisableBls(isConfirm: boolean) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID.AUTO_DISABLE_BLS_CONFIRM,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                disable: isConfirm,
            },
        });
    }

    handleConfirmFareBusStopMode(isConfirm: boolean) {
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics.mainTab?.get,
                msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
                msgSubID: MsgSubID.REQUEST,
                payload: { mode: 1 },
            });
        }
    }

    handleInvalidInspectorCard() {
        this.invalidInspectorCard = {
            show: false,
            message: '',
        };
    }

    handleCloseCommonPopup(closeMsgID?: number) {
        this.commonPopup = {
            show: false,
            message: '',
            title: '',
            type: undefined,
            timeout: undefined,
        };
        this.disableAllButtons = false;

        if (closeMsgID) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics.mainTab?.get,
                msgID: closeMsgID,
                msgSubID: MsgSubID.NOTIFY,
                payload: {},
            });
        }
    }

    handleConfirmLock(isConfirm: boolean) {
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics.mainTab?.get,
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
    }

    handleUnlockSuccess() {
        this.displayLockScreen = false;
    }

    handleConfirmLanguage(language: string): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
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

    handleDisplayLockPopUp() {
        this.displayLockPopUp = true;
        this.displaySettingsPopUp = false;
    }

    handleDisplaySettingsPopUp() {
        this.displaySettingsPopUp = true;
        this.displayLockPopUp = false;
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    handleBootUpCommissioning(header, payload): void {
        this.bootUpCommissioning = {
            show: true,
            title: payload?.message || '',
        };
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.response,
            msgID: header.msgID,
            msgSubID: header.msgSubID,
            payload,
        });
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.response,
            msgID: header.msgID,
            msgSubID: header.msgSubID,
            payload,
        });
    }
}
