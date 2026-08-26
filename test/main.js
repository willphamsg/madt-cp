const routerUrls = {
    private: {
        main: {
            url: 'main',
            login: 'main/login',
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

let autoClickInterval;
let defaultTargetSelector = 'button, a'; // replace with Angular button selector

const fallbackClickSelector = 'button, .btn, .button, .back-button';

function mergeSelectors(...selectors) {
    return [
        ...new Set(
            selectors
                .join(',')
                .split(',')
                .map((selector) => selector.trim())
                .filter(Boolean),
        ),
    ].join(', ');
}

const routeExtraSelectorRules = [
    // --- main routes ---
    {
        urls: [routerUrls.private.main.busStopInformation],
        selector: '.bus-stop-page .btn, .bus-stop-page .button, .bus-stop-page .back-button, .bus-stop-page li',
    },
    { urls: [routerUrls.private.main.free], selector: '.btn.btn-cancel, .btn.btn-confirm, .btn.btn-ok' },
    { urls: [routerUrls.private.main.frontDoor], selector: '.toggle-cv-container .button, .toggle-cv-container .btn' },
    {
        urls: [routerUrls.private.main.breakdown],
        selector:
            '.breakdown-container .button, .breakdown-container .btn, .breakdown-container .back-button, .breakdown-container .right, .breakdown-container li',
    },
    {
        urls: [routerUrls.private.main.cashPayment],
        selector:
            '.cash-payment-container .btn, .cash-payment-container .button, .cash-payment-container .back-button, .cash-payment-container .tk-button, .cash-payment-container li, .cash-payment-container .right',
    },
    { urls: [routerUrls.private.main.rearDoor], selector: '.toggle-cv-container .btn, .toggle-cv-container .button' },
    { urls: [routerUrls.private.main.endTrip], selector: '.end-trip-container .btn, .end-trip-container .button' },
    {
        urls: [routerUrls.private.main.settings],
        selector:
            '.settings-container .btn, .settings-container .button, .settings-container .right, .settings-container li',
    },
    {
        urls: [routerUrls.private.main.languageSetting],
        selector: '.wrapper .language-opt, .wrapper .btn, .wrapper .button, .wrapper .row',
    },
    {
        urls: [
            routerUrls.private.main.commissioning.inProgress,
            routerUrls.private.main.commissioning.clearingAllData,
            routerUrls.private.main.commissioning.completedClearning,
        ],
        selector: '.commissioning-container .btn, .commissioning-container .button',
    },
    {
        urls: [routerUrls.private.main.manualLogin],
        selector: '.wrapper .btn, .wrapper .button, .wrapper .back-button',
    },
    { urls: [routerUrls.private.main.tapCardLogin], selector: 'button, .btn, .button' },
    { urls: [routerUrls.private.main.login], selector: '.login-container .btn, .login-container .button' },
    {
        urls: [routerUrls.private.main.busOperation.startTripValidInfo],
        selector:
            '.start-trip-page .btn, .start-trip-page .button, .start-trip-page .back-button, .start-trip-page .right, .start-trip-page li',
    },
    {
        urls: [routerUrls.private.main.busOperation.startTripInvalidInfo],
        selector: '.wrapper .btn, .wrapper .button',
    },
    {
        urls: [routerUrls.private.main.busOperation.externalDevices],
        selector: '.external-devices-page .btn, .external-devices-page .button, .external-devices-page .back-button',
    },
    { urls: [routerUrls.private.main.busOperation.endShift], selector: '.btn, .button' },
    {
        urls: [routerUrls.private.main.dateTimeSetting],
        selector: '.date-setting .btn, .date-setting .button, .date-setting .back-button',
    },
    {
        urls: [routerUrls.private.main.fareConsoleSetting],
        selector:
            '.wrapper .btn, .wrapper .button, .wrapper .back-button, .wrapper .right, .wrapper a, .wrapper #enterKey, .wrapper #backspaceKey, .wrapper #switchKey1, .wrapper #switchKey2',
    },
    {
        urls: [routerUrls.private.main.lockScreen],
        selector: '.lock-screen-container .btn, .lock-screen-container .button',
    },
    {
        urls: [routerUrls.private.main.dagwOperation],
        selector: '.dagw-operation-container .btn, .dagw-operation-container .button',
    },
    {
        urls: [routerUrls.private.main.url],
        selector: '.main-layout-page .btn, .main-layout-page .button, .main-layout-page .nav-item',
    },

    // --- fare routes ---
    {
        urls: [routerUrls.private.fare.topUp],
        selector: '.top-up-page .btn, .top-up-page .button, .top-up-page .back-button',
    },
    {
        urls: [routerUrls.private.fare.transaction],
        selector: '.transaction-page .btn, .transaction-page .button, .transaction-page .back-button',
    },
    {
        urls: [routerUrls.private.fare.cancelRideCV1, routerUrls.private.fare.cancelRideCV2],
        selector: '.cancel-ride .btn, .cancel-ride .button',
    },
    {
        urls: [routerUrls.private.fare.concessionCV1, routerUrls.private.fare.concessionCV2],
        selector: '.concession .btn, .concession .button',
    },
    { urls: [routerUrls.private.fare.cvOperation.showCVStatus], selector: '.show-cv-status .back-button' },
    {
        urls: [routerUrls.private.fare.cvOperation.setCV],
        selector: '.select-boarding-type .back-button, .select-boarding-type .row, .select-boarding-type .btn',
    },
    {
        urls: [routerUrls.private.fare.cvOperation.cvModeControl],
        selector: '.cv-mode-control .btn, .cv-mode-control .button, .cv-mode-control .back-button',
    },
    { urls: [routerUrls.private.fare.cvOperation.powerAllCVOn], selector: '.power-all-cv-on .btn' },
    { urls: [routerUrls.private.fare.cvOperation.powerAllCVOff], selector: '.power-all-cv-on .btn' },
    { urls: [routerUrls.private.fare.cvOperation.cvPowerControl], selector: '.cv-power-control .back-button' },
    { urls: [routerUrls.private.fare.cvOperation.resetAllCV], selector: '.reset-all-cv .btn' },
    {
        urls: [routerUrls.private.fare.cvOperation.url],
        selector: '.device-operation-content .back-button, .device-operation-content .device-operation-button',
    },
    {
        urls: [routerUrls.private.fare.blsOperation.manualLocation, routerUrls.private.fare.blsOperation.autoLocation],
        selector:
            '.device-operation-content .btn, .device-operation-content .back-button, .device-operation-content .device-operation-button',
    },
    {
        urls: [routerUrls.private.fare.blsOperation.url],
        selector:
            '.device-operation-content .back-button, .device-operation-content .device-operation-button, .device-operation-content .btn',
    },
    {
        urls: [routerUrls.private.fare.printerOperation.inspectorTicket],
        selector: '.inspector-ticket .back-button, .inspector-ticket .button',
    },
    {
        urls: [routerUrls.private.fare.printerOperation.dailyTripLog],
        selector: '.daily-trip-log .back-button, .daily-trip-log .button',
    },
    {
        urls: [routerUrls.private.fare.printerOperation.testReceipt],
        selector: '.test-receipt .back-button, .test-receipt .button',
    },
    {
        urls: [routerUrls.private.fare.printerOperation.retentionTicket],
        selector: '.printer-off .btn, .printer-off .button, .printer-off .back-button',
    },
    { urls: [routerUrls.private.fare.printerOperation.status], selector: '.printer-status .button' },
    {
        urls: [routerUrls.private.fare.printerOperation.url],
        selector: '.device-operation-content .back-button, .device-operation-content .device-operation-button',
    },
    {
        urls: [routerUrls.private.fare.lockScreen],
        selector: '.lock-screen-container .btn, .lock-screen-container .button',
    },
    {
        urls: [routerUrls.private.fare.url],
        selector: '.ticketing-container .button, .ticketing-container .btn, .ticketing-container .back-button',
    },

    // --- maintenance routes ---
    { urls: [routerUrls.private.maintenance.fare.appUpgrade], selector: '.app-upgrade-page .btn' },
    {
        urls: [routerUrls.private.maintenance.fare.viewParameter],
        selector: '.view-parameter-page img, .view-parameter-page .btn, .view-parameter-page .button',
    },
    {
        urls: [routerUrls.private.maintenance.fare.blsInformation],
        selector: '.bls-information-page img, .bls-information-page .btn, .bls-information-page .button',
    },
    {
        urls: [routerUrls.private.maintenance.fare.calibrateBLS.calibrateBlsManualInput],
        selector: '.calibrate-bls-manual-input-page .back-button, .calibrate-bls-manual-input-page .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.calibrateBLS.calibrateBlsCalibration],
        selector: '.calibrate-bls-calibration-page .back-button, .calibrate-bls-calibration-page .btn',
    },
    { urls: [routerUrls.private.maintenance.fare.calibrateBLS.url], selector: '.calibrate-bls-page .button' },
    {
        urls: [routerUrls.private.maintenance.fare.checkPrinter],
        selector: '.test-print-page .button, .test-print-page .btn',
    },
    { urls: [routerUrls.private.maintenance.fare.loadParameter], selector: '.load-parameter-page .button' },
    {
        urls: [routerUrls.private.maintenance.fare.redetectBls],
        selector: '.test-print-page .button, .test-print-page .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.redetectCrp],
        selector: '.redetect-crp-page .button, .redetect-crp-page .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.redetectCv],
        selector: '.redetect-cv-page .confirm-button, .redetect-cv-page .button',
    },
    {
        urls: [routerUrls.private.maintenance.fare.redetectFms],
        selector: '.test-print-page .button, .test-print-page .btn',
    },
    { urls: [routerUrls.private.maintenance.fare.resetBls], selector: '.test-print-page .button' },
    { urls: [routerUrls.private.maintenance.fare.saveTransaction], selector: '.save-transaction-page .button' },
    { urls: [routerUrls.private.maintenance.fare.testPrint], selector: '.test-print-page .button' },
    { urls: [routerUrls.private.maintenance.fare.versionInfo], selector: '.version-info-page .btn' },
    {
        urls: [routerUrls.private.maintenance.fare.externalDevices],
        selector: '.external-devices-page .button, .external-devices-page .btn, .external-devices-page .back-button',
    },
    { urls: [routerUrls.private.maintenance.fare.decommission], selector: '.decommission .btn' },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.deckType],
        selector: '.deck-type .radio, .deck-type .button',
    },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.blsSetting],
        selector: '.bls .back-button, .bls .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.timeSetting],
        selector: '.time-setting .back-button, .time-setting .button, .time-setting .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.dateSetting],
        selector: '.date-setting .back-button, .date-setting .button, .date-setting .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.busId],
        selector: '.bus-id .btn, .bus-id .right, .bus-id .back-button, .bus-id .radio',
    },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.complimentaryDay],
        selector: '.complimentary-day .back-button, .complimentary-day .button',
    },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.deleteParameter],
        selector: '.delete-parameter .back-button, .delete-parameter .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.ticketingConsole.url],
        selector: '.fare-console .right, .fare-console .left, .fare-console .btn',
    },
    {
        urls: [routerUrls.private.maintenance.cjb.url],
        selector: '.maintenance-fare-layout .button, .maintenance-fare-layout .btn',
    },
    {
        urls: [routerUrls.private.maintenance.fare.url],
        selector:
            '.maintenance-fare-layout .button, .maintenance-fare-layout .btn, .maintenance-fare-layout .back-button, .maintenance-fare-layout .confirm-button, .maintenance-fare-layout .menu-direction, .maintenance-fare-layout .nav-item',
    },
    {
        urls: [routerUrls.private.maintenance.url],
        selector: '.maintenance-container .button, .maintenance-container .btn',
    },
];

function matchesRoute(currentURL, urls) {
    return urls.some((url) => currentURL?.indexOf(url) > -1);
}

function getRouteExtraSelector(currentURL) {
    const matchedRule = routeExtraSelectorRules.find((rule) => matchesRoute(currentURL, rule.urls));
    return matchedRule ? matchedRule.selector : fallbackClickSelector;
}

function getRandomInt(min, max) {
    min = Math.ceil(min); // round up lower bound
    max = Math.floor(max); // round down upper bound
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startAutoClicker(interval = 1000) {
    if (autoClickInterval) clearInterval(autoClickInterval);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        autoClickInterval = setInterval(() => {
            const currentURL = window.location.href;
            // if (currentURL?.indexOf(routerUrls.private.main.busStopInformation) > -1) {
            //     targetSelector = 'button';
            // } else if (currentURL?.indexOf(routerUrls.private.main.free) > -1) {
            //     targetSelector = '.btn.btn-confirm';
            //     console.log('Free - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.frontDoor) > -1) {
            //     targetSelector = '.toggle-cv-container .button, .toggle-cv-container .btn.btn-confirm';
            //     console.log('Front Door - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.breakdown) > -1) {
            //     targetSelector =
            //         '.breakdown-container .button, .row .right, .bus-stop-list li, .btn-value, .breakdown-container .btn.btn-confirm';
            //     console.log('Break down - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.cashPayment) > -1) {
            //     let input = document.querySelector('#inputField');
            //     if (input) {
            //         input.value = getRandomInt(0, 10).toString();
            //     }
            //     targetSelector =
            //         '.cash-payment-container .tk-button, .cash-btn-wrap, .cash-payment-container .btn,.cash-payment-container .btn.btn-confirm, .bus-stop-list li, .row .right, .btn-receipt';
            //     console.log('Break down - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.rearDoor) > -1) {
            //     targetSelector = '.toggle-cv-container .btn';
            //     console.log('Rear Door - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.endTrip) > -1) {
            //     targetSelector = '.end-trip-container .btn';
            //     console.log('End Trip - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.settings) > -1) {
            //     targetSelector = '.settings-container .btn, .settings-list li';
            //     console.log('Settings - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.languageSetting) > -1) {
            //     targetSelector = '.wrapper .language-opt, .wrapper .btn';
            //     console.log('Language Setting - Using selector:', targetSelector);
            // } else if (
            //     currentURL?.indexOf(routerUrls.private.main.commissioning.inProgress) > -1 ||
            //     currentURL?.indexOf(routerUrls.private.main.commissioning.clearingAllData) > -1 ||
            //     currentURL?.indexOf(routerUrls.private.main.commissioning.completedClearning) > -1
            // ) {
            //     targetSelector = '.commissioning-container .btn, .commissioning-container .button';
            //     console.log('Commissioning - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.login) > -1) {
            //     targetSelector = '.login-container .btn, .login-container .button';
            //     console.log('Login - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.manualLogin) > -1) {
            //     targetSelector = '.manual-login-container .btn, .manual-login-container .button';
            //     console.log('Manual Login - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.tapCardLogin) > -1) {
            //     targetSelector = '.tap-card-login-container .btn, .tap-card-login-container .button';
            //     console.log('Tap Card Login - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.dateTimeSetting) > -1) {
            //     targetSelector = '.date-time-setting-container .btn, .date-time-setting-container .button';
            //     console.log('Date Time Setting - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.fareConsoleSetting) > -1) {
            //     targetSelector = '.wrapper .btn, .wrapper .button';
            // } else if (currentURL?.indexOf(routerUrls.private.main.lockScreen) > -1) {
            //     targetSelector = '.lock-screen-container .btn, .lock-screen-container .button';
            //     console.log('Lock Screen - Using selector:', targetSelector);
            // } else if (currentURL?.indexOf(routerUrls.private.main.dagwOperation) > -1) {
            //     targetSelector = '.dagw-operation-container .btn, .dagw-operation-container .button';
            //     console.log('DAGW Operation - Using selector:', targetSelector);
            // } else {
            //     targetSelector = 'button, .btn';
            // }

            let targetSelector = mergeSelectors(
                getRouteExtraSelector(currentURL),
                defaultTargetSelector,
                fallbackClickSelector,
            );
            console.log('Current URL:', currentURL, 'Using selector:', targetSelector);

            const allEls = document.querySelectorAll(targetSelector);
            const els = [...allEls].filter(
                (el) =>
                    el.id !== 'settings-btn' &&
                    el.id !== 'lock-btn' &&
                    el.id !== 'log-out-btn' &&
                    !el.classList.contains('disabled') &&
                    !el.classList.contains('hidden') &&
                    !el.classList.contains('mdc-switch') &&
                    !el.disabled,
            );
            const elmIdex = getRandomInt(0, els.length - 1);
            const el = els[elmIdex];
            if (el) {
                el.click();
                console.log('Clicked:', el.textContent);
            } else {
                console.warn('Element not found:', targetSelector);
            }
        }, interval);
    }
}

function stopAutoClicker() {
    clearInterval(autoClickInterval);
    console.log('Auto clicker stopped');
}

export { startAutoClicker, stopAutoClicker };

// Example:
// startAutoClicker(2000); // click every 2s
