import { Routes } from '@angular/router';
import { PageType, CvTypes, OutOfServiceType, StartTripTypes, CommissioningType } from '@models';

//main tab components
import { BootUpComponent } from '@views/main/boot-up/boot-up.component';
import { BusOperationMenuComponent } from '@views/main/bus-operation/bus-operation-menu/bus-operation-menu.component';
import { BootUpCommissioningComponent } from '@views/main/boot-up-commissioning/boot-up-commissioning.component';
import { StartTripComponent } from '@views/main/bus-operation/start-trip/start-trip.component';
import { StartTripDetailsIssueComponent } from '@views/main/bus-operation/start-trip-details-issue/start-trip-details-issue.component';
import { BusStopInformationComponent } from '@views/main/bus-stop/bus-stop-information.component';
import { MainAccessDeniedComponent } from '@views/main/access-denied/access-denied.component';
import { ExternalDevicesComponent } from '@views/main/bus-operation/external-devices/external-devices.component';
import { LanguageSettingComponent } from '@views/main/language-setting/language-setting.component';
import { DateTimeSettingComponent } from '@views/main/date-time-setting/date-time-setting.component';
import { FareConsoleSettingComponent } from '@views/main/fare-console-setting/fare-console-setting.component';
import { LoginComponent } from '@views/main/login/login.component';
import { LoginOptionComponent } from '@views/main/login-option/login-option.component';
import { LoginTapCardComponent } from '@views/main/login-tap-card/login-tap-card.component';
import { LoginManualComponent } from '@views/main/login-manual/login-manual.component';
import { CashPaymentComponent } from '@views/main/cash-payment/cash-payment.component';
import { FrontDoorComponent } from '@views/main/front-door/front-door.component';
import { RearDoorComponent } from '@views/main/rear-door/rear-door.component';
import { FreeComponent } from '@views/main/free/free.component';
import { RedeemComponent } from '@views/main/redeem/redeem.component';
import { BreakdownComponent } from '@views/main/breakdown/breakdown.component';
import { EndTripComponent } from '@views/main/end-trip/end-trip.component';
import { BusStopFareComponent } from '@views/main/bus-stop-fare/bus-stop-fare.component';

//fare tab components
import { TicketingMenuComponent } from '@views/fare/ticketing-menu/ticketing-menu.component';
import { TransactionComponent } from '@views/fare/transaction/transaction.component';
import { CancelRideComponent } from '@views/fare/cancel-ride/cancel-ride.component';
import { ConcessionComponent } from '@views/fare/concession/concession.component';
import { TopUpComponent } from '@views/fare/top-up/top-up.component';
import { WaitingTripToStart } from '@views/fare/waiting-trip-start/waiting-trip-start.component';
import { FareLogoffComponent } from '@views/fare/log-off/log-off.component';
import { FareAccessDeniedComponent } from '@views/fare/access-denied/access-denied.component';
import { CVOperationMenuComponent } from '@views/fare/cv-operation/cv-operation-menu/cv-operation-menu.component';
import { ShowCVStatusComponent } from '@views/fare/cv-operation/show-cv-status/show-cv-status.component';
import { SetCVEntryExitComponent } from '@views/fare/cv-operation/set-cv-entry-exit/set-cv-entry-exit.component';
import { CVModeControlComponent } from '@views/fare/cv-operation/cv-mode-control/cv-mode-control.component';
import { PowerAllCVOnComponent } from '@views/fare/cv-operation/power-all-cv-on/power-all-cv-on.component';
import { PowerAllCVOffComponent } from '@views/fare/cv-operation/power-all-cv-off/power-all-cv-off.component';
import { CVPowerControlComponent } from '@views/fare/cv-operation/cv-power-control/cv-power-control.component';
import { ResetAllCVComponent } from '@views/fare/cv-operation/reset-all-cv/reset-all-cv.component';
import { FareBusStopMode } from '@views/fare/bls-operation/fare-bus-stop-mode/fare-bus-stop-mode.component';
import { PrinterOperationMenuComponent } from '@views/fare/printer-operation/printer-operation-menu/printer-operation-menu.component';
import { PrintRetentionTicket } from '@views/fare/printer-operation/retention-ticket/retention-ticket.component';
import { PrinterStatusComponent } from '@views/fare/printer-operation/printer-status/printer-status.component';
import { PrinterOnComponent } from '@views/fare/printer-operation/printer-on/printer-on.component';
import { PrinterOffComponent } from '@views/fare/printer-operation/printer-off/printer-off.component';
import { ExternalDevicesComponent as FareExternalDevicesComponent } from '@views/fare/external-devices/external-devices.component';

//maintenance tab components
import { MaintenanceLogoffComponent } from '@views/maintenance/log-off/log-off.component';
import { MaintenanceAccessDeniedComponent } from '@views/maintenance/access-denied/access-denied.component';
import { MaintenanceMenuComponent } from '@views/maintenance/maintenance-menu/maintenance-menu.component';
import { ApplicationUpgrade } from '@views/maintenance/fare/application-upgrade/application-upgrade.component';
import { ViewParameterComponent } from '@views/maintenance/fare/view-parameter/view-parameter.component';
import { BLSInformationComponent } from '@views/maintenance/fare/bls-information/bls-information.component';
import { DisplayAuditComponent } from '@views/maintenance/fare/display-audit/display-audit.component';
import { LoadParameterComponent } from '@views/maintenance/fare/load-parameter/load-parameter.component';
import { PrintBcvResultComponent } from '@views/maintenance/fare/print-bcv-result/print-bcv-result.component';
import { RedetectCRPComponent } from '@views/maintenance/fare/redetect-crp/redetect-crp.component';
import { RedetectCVComponent } from '@views/maintenance/fare/redetect-cv/redetect-cv.component';
import { RedetectFMSComponent } from '@views/maintenance/fare/redetect-fms/redetect-fms.component';
import { SaveTransactionComponent } from '@views/maintenance/fare/save-transaction/save-transaction.component';
import { VersionInfoComponent } from '@views/maintenance/fare/version-info/version-info.component';
import { ExternalDevicesComponent as MaintenanceExternalDevicesComponent } from '@views/maintenance/fare/external-devices/external-devices.component';
import { Decommission } from '@views/maintenance/fare/decommission/decommission.component';
import { SettingsComponent } from '@views/maintenance/fare/settings/settings.component';
import { FareConsoleTableComponent } from '@views/maintenance/fare/fare-console/fare-console-table/fare-console-table.component';
import { DeckTypeComponent } from '@views/maintenance/fare/fare-console/deck-type/deck-type.component';
import { BLSStatusComponent } from '@views/maintenance/fare/fare-console/bls/bls.component';
import { FareBusStopMode as MaintenanceFareBusStopMode } from '@views/maintenance/fare/fare-console/fare-bus-stop-mode/fare-bus-stop-mode.component';
import { DateSettingComponent } from '@views/maintenance/fare/fare-console/date-setting/date-setting.component';
import { BusIdComponent } from '@views/maintenance/fare/fare-console/bus-id/bus-id.component';
import { ComplimentaryDayComponent } from '@views/maintenance/fare/fare-console/complimentary-day/complimentary-day.component';
import { DeleteParameterComponent } from '@views/maintenance/fare/fare-console/delete-parameter/delete-parameter.component';
import { externalDevices } from './store/main/main.reducer';

export const routerUrls = {
    private: {
        main: {
            url: 'main',
            login: 'main/login',
            loginOption: 'main/login-option',
            commissioning: {
                inProgress: 'main/commissioning/in-progress',
                clearingAllData: 'main/commissioning/clearing-all-data',
                completedClearning: 'main/commissioning/completed-cleaning',
            },
            tapCardLogin: 'main/tap-card-login',
            manualLogin: 'main/manual-login',
            busStopInformation: 'main/bus-stop-information',
            frontExit: 'main/front-exit',
            cashPayment: 'main/cash-payment',
            frontDoor: 'main/front-door',
            rearDoor: 'main/rear-door',
            free: 'main/free',
            redeem: 'main/redeem',
            breakdown: 'main/breakdown',
            endTrip: 'main/end-trip',
            settings: 'main/settings',
            languageSetting: 'main/language-setting',
            dateTimeSetting: 'main/date-time-setting',
            fareConsoleSetting: 'main/fare-console-setting',
            lockScreen: 'main/lock-screen',
            dagwOperation: 'main/dagw-operation',
            accessDenied: 'main/access-denied',
            busStopFare: (id?: string) => (id ? `main/bus-stop-fare/${id}` : 'main/bus-stop-fare/:busStopId'),
            busOperation: {
                url: 'main/bus-operation',
                startTripValidInfo: 'main/bus-operation/start-trip',
                // startTripConnectedPro: 'main/bus-operation/start-trip/connected-productive',
                endShift: 'main/bus-operation/end-shift',
                startTripInvalidInfo: 'main/bus-operation/start-trip-invalid-info',
                externalDevices: 'main/bus-operation/external-devices',
            },
        },
        busOperation: {
            url: 'bus-operation',
            externalDevices: 'bus-operation/external-devices',
            endShift: 'bus-operation/end-shift',
        },
        fare: {
            url: 'fare',
            topUp: 'fare/top-up',
            transaction: 'fare/transaction',
            externalDevices: 'fare/external-device',
            cancelRideCV1: 'fare/cancel-ride-cv1',
            cancelRideCV2: 'fare/cancel-ride-cv2',
            concessionCV1: 'fare/concession-cv1',
            concessionCV2: 'fare/concession-cv2',
            cvOperation: {
                url: 'fare/cv-operation',
                showCVStatus: 'fare/cv-operation/show-cv-status',
                setCV: 'fare/cv-operation/set-cv',
                cvModeControl: 'fare/cv-operation/cv-mode-control',
                powerAllCVOn: 'fare/cv-operation/power-all-cv-on',
                powerAllCVOff: 'fare/cv-operation/power-all-cv-off',
                cvPowerControl: 'fare/cv-operation/cv-power-control',
                resetAllCV: 'fare/cv-operation/reset-all-cv',
            },
            blsOperation: {
                url: 'fare/bls-operation',
                manualLocation: 'fare/bls-operation/manual-location',
                autoLocation: 'fare/bls-operation/auto-location',
            },
            printerOperation: {
                url: 'fare/printer-operation',
                inspectorTicket: 'fare/printer-operation/inspector-ticket',
                dailyTripLog: 'fare/printer-operation/daily-trip-log',
                testReceipt: 'fare/printer-operation/test-receipt',
                retentionTicket: 'fare/printer-operation/retention-ticket',
                printerOn: 'fare/printer-operation/printer-on',
                printerOff: 'fare/printer-operation/printer-off',
                status: 'fare/printer-operation/status',
            },
            lockScreen: 'fare/lock-screen',
            accessDenied: 'fare/access-denied',
            waitingTripStart: 'fare/waiting-trip-start',
            logOff: 'fare/log-off',
        },
        fms: {
            url: 'fms',
        },
        maintenance: {
            url: 'maintenance',
            accessDenied: 'maintenance/access-denied',
            logOff: 'maintenance/log-off',
            fare: {
                url: 'maintenance/fare',
                appUpgrade: 'maintenance/fare/application-upgrade',
                viewParameter: 'maintenance/fare/view-parameter',
                blsInformation: 'maintenance/fare/bls-information',
                calibrateBLS: {
                    url: 'maintenance/fare/calibrate-bls',
                    calibrateBlsManualInput: 'maintenance/fare/calibrate-bls/manual-input',
                    calibrateBlsCalibration: 'maintenance/fare/calibrate-bls/bls-calibration',
                },
                changeWlanKey: 'maintenance/fare/change-wlan-key',
                checkPrinter: 'maintenance/fare/check-printer',
                displayAudit: 'maintenance/fare/display-audit',
                gyroSwitch: 'maintenance/fare/gyro-switch',
                loadParameter: 'maintenance/fare/load-parameter',
                printBcvResult: 'maintenance/fare/print-bcv-result',
                redetectBls: 'maintenance/fare/redetect-bls',
                redetectCrp: 'maintenance/fare/redetect-crp',
                redetectCv: 'maintenance/fare/redetect-cv',
                redetectFms: 'maintenance/fare/redetect-fms',
                resetBls: 'maintenance/fare/reset-bls',
                saveTransaction: 'maintenance/fare/save-transaction',
                testPrint: 'maintenance/fare/test-print',
                versionInfo: 'maintenance/fare/version-info',
                externalDevices: 'maintenance/fare/external-devices',
                decommission: 'maintenance/fare/decommission',
                setting: 'maintenance/fare/setting',
                ticketingConsole: {
                    url: 'maintenance/fare/fare-console',
                    deckType: 'maintenance/fare/fare-console/deck-type',
                    blsSetting: 'maintenance/fare/fare-console/bls',
                    timeSetting: 'maintenance/fare/fare-console/time-setting',
                    dateSetting: 'maintenance/fare/fare-console/date-setting',
                    busId: 'maintenance/fare/fare-console/bus-id',
                    complimentaryDay: 'maintenance/fare/fare-console/complimentary-day',
                    deleteParameter: 'maintenance/fare/fare-console/delete-parameter',
                    fareBusStopMode: 'maintenance/fare/fare-console/fare-bus-stop-mode',
                },
            },
            cjb: {
                url: 'maintenance/cjb',
            },
        },
    },
    public: {
        signIn: 'sign-in',
        welcome: 'welcome',
        mqtt: 'mqtt',
    },
};

export const nestedUrlHandler = (url, textToRemove) => url?.replace(textToRemove, '');

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full',
    },
    {
        path: routerUrls?.public?.signIn,
        loadComponent: () => import('@views/sign-in/sign-in.component').then((m) => m.SignInComponent),
    },
    {
        path: routerUrls?.public?.welcome,
        loadComponent: () => import('@views/welcome/welcome.component').then((m) => m.WelcomeComponent),
    },
    {
        path: routerUrls?.public?.mqtt,
        loadComponent: () => import('@views/mqtt/mqtt.component').then((m) => m.MqttComponent),
    },
    {
        path: '',
        loadComponent: () => import('@components/layout/layout.component').then((m) => m.LayoutComponent),
        // canActivate: [AuthGuard],
        children: [
            {
                path: routerUrls?.private?.main?.url,
                loadComponent: () => import('@views/main/main-layout/main.component').then((m) => m.MainComponent),
                children: [
                    {
                        path: '',
                        component: BootUpComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.busOperation?.url,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: BusOperationMenuComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.commissioning?.inProgress,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: BootUpCommissioningComponent,
                        data: { pageType: CommissioningType?.IN_PROGRESS },
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.commissioning?.clearingAllData,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: BootUpCommissioningComponent,
                        data: { pageType: CommissioningType?.CLEARING_ALL_DATA },
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.commissioning?.completedClearning,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: BootUpCommissioningComponent,
                        data: { pageType: CommissioningType?.COMPLETED_CLEANING },
                    },
                    // {
                    //     path: nestedUrlHandler(
                    //         routerUrls?.private?.main?.busOperation?.startTripConnectedPro,
                    //         `${routerUrls?.private?.main?.url}/`,
                    //     ),
                    //     loadComponent: () =>
                    //         import('@views/main/bus-operation/start-trip/start-trip.component').then(
                    //             (m) => m.StartTripComponent,
                    //         ),
                    //     data: {
                    //         pageType: TripDetailsType?.FMS_VALID_INFO,
                    //     },
                    // },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.busOperation?.startTripValidInfo,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: StartTripComponent,
                        data: { pageType: StartTripTypes?.FMS_VALID_INFO },
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.busOperation?.startTripInvalidInfo,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: StartTripDetailsIssueComponent,
                    },

                    // {
                    //     path: nestedUrlHandler(
                    //         routerUrls?.private?.main?.busOperation?.endShift,
                    //         `${routerUrls?.private?.main?.url}/`,
                    //     ),
                    //     loadComponent: () =>
                    //         import('@views/main/bus-operation/end-shift/end-shift.component').then(
                    //             (m) => m.EndShiftComponent,
                    //         ),
                    // },

                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.busOperation?.externalDevices,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: ExternalDevicesComponent,
                    },

                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.languageSetting,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: LanguageSettingComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.dateTimeSetting,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: DateTimeSettingComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.fareConsoleSetting,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: FareConsoleSettingComponent,
                        data: { pageType: OutOfServiceType?.WITH_INFO },
                    },
                    // {
                    //     path: nestedUrlHandler(
                    //         routerUrls?.private?.main?.outOfService,
                    //         `${routerUrls?.private?.main?.url}/`,
                    //     ),
                    //     loadComponent: () =>
                    //         import('@views/main/out-of-service/out-of-service.component').then(
                    //             (m) => m.OutOfServiceComponent,
                    //         ),
                    //     data: {
                    //         pageType: OutOfServiceType?.WITH_INFO,
                    //     },
                    // },

                    {
                        path: nestedUrlHandler(routerUrls?.private?.main?.login, `${routerUrls?.private?.main?.url}/`),
                        component: LoginComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.loginOption,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: LoginOptionComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.tapCardLogin,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: LoginTapCardComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.manualLogin,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: LoginManualComponent,
                    },

                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.busStopInformation,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: BusStopInformationComponent,
                    },
                    // {
                    //     path: nestedUrlHandler(
                    //         routerUrls?.private?.main?.settings,
                    //         `${routerUrls?.private?.main?.url}/`,
                    //     ),
                    //     loadComponent: () =>
                    //         import('@views/main/settings/settings.component').then((m) => m.SettingsComponent),
                    // },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.cashPayment,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: CashPaymentComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.frontDoor,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: FrontDoorComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.rearDoor,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: RearDoorComponent,
                    },
                    {
                        path: nestedUrlHandler(routerUrls?.private?.main?.free, `${routerUrls?.private?.main?.url}/`),
                        component: FreeComponent,
                    },
                    {
                        path: nestedUrlHandler(routerUrls?.private?.main?.redeem, `${routerUrls?.private?.main?.url}/`),
                        component: RedeemComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.breakdown,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: BreakdownComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.endTrip,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: EndTripComponent,
                    },
                    // {
                    //     path: nestedUrlHandler(
                    //         routerUrls?.private?.main?.lockScreen,
                    //         `${routerUrls?.private?.main?.url}/`,
                    //     ),
                    //     loadComponent: () =>
                    //         import('@views/main/lock-screen/lock-screen.component').then((m) => m.LockScreenComponent),
                    //     data: {
                    //         topic: 'mainTab',
                    //     },
                    // },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.busStopFare(),
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: BusStopFareComponent,
                    },
                    // {
                    //     path: nestedUrlHandler(
                    //         routerUrls?.private?.main?.dagwOperation,
                    //         `${routerUrls?.private?.main?.url}/`,
                    //     ),
                    //     component: DagwOperationComponent,
                    //     // loadComponent: () =>
                    //     //     import('@views/main/dagw-operation/dagw-operation.component').then(
                    //     //         (m) => m.DagwOperationComponent,
                    //     //     ),
                    // },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.main?.accessDenied,
                            `${routerUrls?.private?.main?.url}/`,
                        ),
                        component: MainAccessDeniedComponent,
                    },
                ],
            },

            {
                path: routerUrls?.private?.fare?.url,
                // component: FareLayoutComponent,
                loadComponent: () => import('@views/fare/layout/layout.component').then((m) => m.FareLayoutComponent),
                children: [
                    {
                        path: '',
                        component: TicketingMenuComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.transaction,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: TransactionComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.externalDevices,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: FareExternalDevicesComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.cancelRideCV1,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: CancelRideComponent,
                        data: { pageType: PageType?.CANCEL, cvType: CvTypes?.CV1 },
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.cancelRideCV2,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: CancelRideComponent,
                        data: { pageType: PageType?.CANCEL, cvType: CvTypes?.CV2 },
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.concessionCV1,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: ConcessionComponent,
                        data: { cvType: CvTypes?.CV1 },
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.concessionCV2,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: ConcessionComponent,
                        data: { cvType: CvTypes?.CV2 },
                    },
                    {
                        path: nestedUrlHandler(routerUrls?.private?.fare?.topUp, `${routerUrls?.private?.fare?.url}/`),
                        component: TopUpComponent,
                    },
                    // {
                    //     path: nestedUrlHandler(
                    //         routerUrls?.private?.fare?.lockScreen,
                    //         `${routerUrls?.private?.fare?.url}/`,
                    //     ),
                    //     loadComponent: () =>
                    //         import('@views/main/lock-screen/lock-screen.component').then((m) => m.LockScreenComponent),
                    //     data: {
                    //         topic: 'fareTab',
                    //     },
                    // },
                    {
                        path: nestedUrlHandler(routerUrls?.private?.fare?.logOff, `${routerUrls?.private?.fare?.url}/`),
                        component: FareLogoffComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.waitingTripStart,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: WaitingTripToStart,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.accessDenied,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        component: FareAccessDeniedComponent,
                    },

                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.cvOperation?.url,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        loadComponent: () =>
                            import('@views/fare/cv-operation/cv-operation-layout/cv-operation-layout.component').then(
                                (m) => m.CVOperationLayoutComponent,
                            ),
                        data: { rootRoute: '/fare/cv-operation', breadcrumb: 'FARE_SYSTEM' },
                        children: [
                            {
                                path: '',
                                data: { rootRoute: '/fare', breadcrumb: 'CV_OPERATIONS' },
                                children: [
                                    {
                                        path: '',
                                        component: CVOperationMenuComponent,
                                        data: { rootRoute: '/fare', breadcrumb: '' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.cvOperation?.showCVStatus,
                                            `${routerUrls?.private?.fare?.cvOperation?.url}/`,
                                        ),
                                        component: ShowCVStatusComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'SHOW_CV_STATUS' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.cvOperation?.setCV,
                                            `${routerUrls?.private?.fare?.cvOperation?.url}/`,
                                        ),
                                        component: SetCVEntryExitComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'SET_SV_ENTRY_EXIT' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.cvOperation?.cvModeControl,
                                            `${routerUrls?.private?.fare?.cvOperation?.url}/`,
                                        ),
                                        component: CVModeControlComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'CV_MODE_CONTROL' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.cvOperation?.powerAllCVOn,
                                            `${routerUrls?.private?.fare?.cvOperation?.url}/`,
                                        ),
                                        component: PowerAllCVOnComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'POWER_ALL_CV_ON' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.cvOperation?.powerAllCVOff,
                                            `${routerUrls?.private?.fare?.cvOperation?.url}/`,
                                        ),
                                        component: PowerAllCVOffComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'POWER_ALL_CV_OFF' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.cvOperation?.cvPowerControl,
                                            `${routerUrls?.private?.fare?.cvOperation?.url}/`,
                                        ),
                                        component: CVPowerControlComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'CV_POWER_CONTROL' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.cvOperation?.resetAllCV,
                                            `${routerUrls?.private?.fare?.cvOperation?.url}/`,
                                        ),
                                        component: ResetAllCVComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'RESET_ALL_CV' },
                                    },
                                ],
                            },
                        ],
                    },

                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.blsOperation?.url,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        loadComponent: () =>
                            import(
                                '@views/fare/bls-operation/bls-operation-layout/bls-operation-layout.component'
                            ).then((m) => m.BLSOperationLayoutComponent),
                        data: { rootRoute: '/fare/bls-operation', breadcrumb: 'FARE_SYSTEM' },
                        children: [
                            {
                                path: '',
                                data: { rootRoute: '/fare', breadcrumb: 'FARE_BUS_STOP_MODE' },
                                children: [
                                    {
                                        path: '',
                                        component: FareBusStopMode,
                                        data: { rootRoute: '/fare', breadcrumb: '' },
                                    },
                                ],
                            },
                        ],
                    },

                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.fare?.printerOperation?.url,
                            `${routerUrls?.private?.fare?.url}/`,
                        ),
                        loadComponent: () =>
                            import(
                                '@views/fare/printer-operation/printer-operation-layout/printer-operation-layout.component'
                            ).then((m) => m.PrinterOperationLayoutComponent),
                        data: { rootRoute: '/fare/printer-operation', breadcrumb: 'FARE_SYSTEM' },
                        children: [
                            {
                                path: '',
                                data: { rootRoute: '/fare', breadcrumb: 'PRINTER_OPERATIONS' },
                                children: [
                                    {
                                        path: '',
                                        component: PrinterOperationMenuComponent,
                                        data: { rootRoute: '/fare', breadcrumb: '' },
                                    },
                                    // {
                                    //     path: nestedUrlHandler(
                                    //         routerUrls?.private?.fare?.printerOperation?.inspectorTicket,
                                    //         `${routerUrls?.private?.fare?.printerOperation?.url}/`,
                                    //     ),
                                    //     loadComponent: () =>
                                    //         import(
                                    //             '@views/fare/printer-operation/inspector-ticket/inspector-ticket.component'
                                    //         ).then((m) => m.InspectorTicketComponent),
                                    //     data: { rootRoute: '/fare', breadcrumb: 'MANUAL_LOCATION' },
                                    // },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.printerOperation?.retentionTicket,
                                            `${routerUrls?.private?.fare?.printerOperation?.url}/`,
                                        ),
                                        component: PrintRetentionTicket,
                                        data: { rootRoute: '/fare', breadcrumb: 'PRINT_RETENTION_TICKET' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.printerOperation?.status,
                                            `${routerUrls?.private?.fare?.printerOperation?.url}/`,
                                        ),
                                        component: PrinterStatusComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'PRINTER_STATUS' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.printerOperation?.printerOn,
                                            `${routerUrls?.private?.fare?.printerOperation?.url}/`,
                                        ),
                                        component: PrinterOnComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'PRINTER_ON' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.fare?.printerOperation?.printerOff,
                                            `${routerUrls?.private?.fare?.printerOperation?.url}/`,
                                        ),
                                        component: PrinterOffComponent,
                                        data: { rootRoute: '/fare', breadcrumb: 'PRINTER_OFF' },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },

            {
                path: routerUrls?.private?.fms?.url,
                loadComponent: () => import('@views/fms/fms.component').then((m) => m.FMSComponent),
            },
            {
                path: routerUrls?.private?.maintenance?.url,
                loadComponent: () =>
                    import('@views/maintenance/layout/layout.component').then((m) => m.MaintenanceLayoutComponent),
                children: [
                    {
                        path: '',
                        component: MaintenanceMenuComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.maintenance?.logOff,
                            `${routerUrls?.private?.maintenance?.url}/`,
                        ),
                        component: MaintenanceLogoffComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.maintenance?.accessDenied,
                            `${routerUrls?.private?.maintenance?.url}/`,
                        ),
                        component: MaintenanceAccessDeniedComponent,
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.maintenance?.fare?.url,
                            `${routerUrls?.private?.maintenance?.url}/`,
                        ),
                        loadComponent: () =>
                            import('@views/maintenance/fare/layout/layout.component').then(
                                (m) => m.MaintenanceFareLayoutComponent,
                            ),
                        data: { rootRoute: '/maintenance/fare', breadcrumb: 'MAINTENANCE' },
                        children: [
                            {
                                path: '',
                                data: { rootRoute: '/maintenance', breadcrumb: 'FARE_SYSTEM' },
                                children: [
                                    {
                                        path: '',
                                        component: ApplicationUpgrade,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'APPLICATION_UPGRADE' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.viewParameter,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: ViewParameterComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'VIEW_PARAMETER' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.appUpgrade,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: ApplicationUpgrade,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'APPLICATION_UPGRADE' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.blsInformation,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: BLSInformationComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'BLS_INFORMATION' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.calibrateBLS?.url,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        loadComponent: () =>
                                            import(
                                                '@views/maintenance/fare/calibrate-bls/calibrate-bls-layout/calibrate-bls-layout.component'
                                            ).then((m) => m.CalibrateBLSLayoutComponent),
                                        data: { rootRoute: '/maintenance', breadcrumb: 'CALIBRATE_BLS' },
                                        children: [
                                            {
                                                path: '',
                                                loadComponent: () =>
                                                    import(
                                                        '@views/maintenance/fare/calibrate-bls/calibrate-bls-menu/calibrate-bls-menu.component'
                                                    ).then((m) => m.CalibrateBLSMenuComponent),
                                                data: { rootRoute: '/maintenance', breadcrumb: '' },
                                            },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.calibrateBLS
                                                        ?.calibrateBlsManualInput,
                                                    `${routerUrls?.private?.maintenance?.fare?.calibrateBLS?.url}/`,
                                                ),
                                                loadComponent: () =>
                                                    import(
                                                        '@views/maintenance/fare/calibrate-bls/calibrate-bls-manual-input/calibrate-bls-manual-input.component'
                                                    ).then((m) => m.CalibrateBLSManualInputComponent),
                                                data: { rootRoute: '/maintenance', breadcrumb: 'MANUAL_INPUT' },
                                            },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.calibrateBLS
                                                        ?.calibrateBlsCalibration,
                                                    `${routerUrls?.private?.maintenance?.fare?.calibrateBLS?.url}/`,
                                                ),
                                                loadComponent: () =>
                                                    import(
                                                        '@views/maintenance/fare/calibrate-bls/calibrate-bls-calibration/calibrate-bls-calibration.component'
                                                    ).then((m) => m.CalibrateBLSCalibrationComponent),
                                                data: { rootRoute: '/maintenance', breadcrumb: 'BLS_CALIBRATION' },
                                            },
                                        ],
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.displayAudit,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: DisplayAuditComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'DISPLAY_AUDIT' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.loadParameter,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: LoadParameterComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'LOAD_PARAMETERS' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.printBcvResult,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: PrintBcvResultComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'PRINT_CV_RESULTS' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.redetectCrp,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: RedetectCRPComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'REDETECT_CRP' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.redetectCv,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: RedetectCVComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'REDETECT_CV' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.redetectFms,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: RedetectFMSComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'REDETECT_FMS' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.saveTransaction,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: SaveTransactionComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'SAVE_TRANSACTION' },
                                    },
                                    // {
                                    //     path: nestedUrlHandler(
                                    //         routerUrls?.private?.maintenance?.fare?.testPrint,
                                    //         `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                    //     ),
                                    //     loadComponent: () =>
                                    //         import('@views/maintenance/fare/test-print/test-print.component').then(
                                    //             (m) => m.TestPrintComponent,
                                    //         ),
                                    //     data: { rootRoute: '/maintenance', breadcrumb: 'CHECK_TEST_PRINTER' },
                                    // },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.versionInfo,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: VersionInfoComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'VERSION_INFO' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.externalDevices,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: MaintenanceExternalDevicesComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'EXTERNAL_DEVICES' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.decommission,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: Decommission,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'DECOMMISSION' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.setting,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        component: SettingsComponent,
                                        data: { rootRoute: '/maintenance', breadcrumb: 'SETTINGS' },
                                    },
                                    {
                                        path: nestedUrlHandler(
                                            routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url,
                                            `${routerUrls?.private?.maintenance?.fare?.url}/`,
                                        ),
                                        loadComponent: () =>
                                            import('@views/maintenance/fare/fare-console/layout/layout.component').then(
                                                (m) => m.FareConsoleLayoutComponent,
                                            ),
                                        data: { rootRoute: '/maintenance', breadcrumb: 'CONFIGURE_FARE_CONSOLE' },
                                        children: [
                                            {
                                                path: '',
                                                component: FareConsoleTableComponent,
                                                data: { rootRoute: '/maintenance', breadcrumb: '' },
                                            },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.ticketingConsole?.deckType,
                                                    `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                                ),
                                                component: DeckTypeComponent,
                                                data: { rootRoute: '/maintenance', breadcrumb: 'DECK_TYPE' },
                                            },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.ticketingConsole
                                                        ?.fareBusStopMode,
                                                    `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                                ),
                                                component: MaintenanceFareBusStopMode,
                                                data: { rootRoute: '/maintenance', breadcrumb: 'FARE_BUS_STOP_MODE' },
                                            },
                                            // {
                                            //     path: nestedUrlHandler(
                                            //         routerUrls?.private?.maintenance?.fare?.ticketingConsole
                                            //             ?.blsSetting,
                                            //         `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                            //     ),
                                            //     component: BLSStatusComponent,
                                            //     data: { rootRoute: '/maintenance', breadcrumb: 'SECONDARY_BLS_STATUS' },
                                            // },
                                            // {
                                            //     path: nestedUrlHandler(
                                            //         routerUrls?.private?.maintenance?.fare?.ticketingConsole
                                            //             ?.timeSetting,
                                            //         `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                            //     ),
                                            //     loadComponent: () =>
                                            //         import(
                                            //             '@views/maintenance/fare/fare-console/time-setting/time-setting.component'
                                            //         ).then((m) => m.TimeSettingComponent),
                                            //     data: { rootRoute: '/maintenance', breadcrumb: 'Time' },
                                            // },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.ticketingConsole
                                                        ?.dateSetting,
                                                    `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                                ),
                                                component: DateSettingComponent,
                                                data: { rootRoute: '/maintenance', breadcrumb: 'DATE_TIME' },
                                            },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.ticketingConsole?.busId,
                                                    `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                                ),
                                                component: BusIdComponent,
                                                data: { rootRoute: '/maintenance', breadcrumb: 'BUS_ID' },
                                            },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.ticketingConsole
                                                        ?.complimentaryDay,
                                                    `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                                ),
                                                component: ComplimentaryDayComponent,
                                                data: { rootRoute: '/maintenance', breadcrumb: 'COMPLIMENTARY_DAYS' },
                                            },
                                            {
                                                path: nestedUrlHandler(
                                                    routerUrls?.private?.maintenance?.fare?.ticketingConsole
                                                        ?.deleteParameter,
                                                    `${routerUrls?.private?.maintenance?.fare?.ticketingConsole?.url}/`,
                                                ),
                                                component: DeleteParameterComponent,
                                                data: { rootRoute: '/maintenance', breadcrumb: 'DELETE_PARAMETERS' },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        path: nestedUrlHandler(
                            routerUrls?.private?.maintenance?.cjb?.url,
                            `${routerUrls?.private?.maintenance?.url}/`,
                        ),
                        loadComponent: () => import('@views/maintenance/cjb/cjb.component').then((m) => m.CJBComponent),
                        data: { breadcrumb: 'MAINTENANCE' },
                    },
                ],
            },
        ],
    },
    { path: '**', redirectTo: '/main' },
];
