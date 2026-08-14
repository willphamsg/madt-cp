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

function getRouteExtraSelector(currentURL) {
    // --- main routes ---

    if (currentURL?.indexOf(routerUrls.private.main.busStopInformation) > -1) {
        return '.bus-stop-page .btn, .bus-stop-page .button, .bus-stop-page .back-button, .bus-stop-page li';
    }

    if (currentURL?.indexOf(routerUrls.private.main.free) > -1) {
        return '.btn.btn-cancel, .btn.btn-confirm, .btn.btn-ok';
    }

    if (currentURL?.indexOf(routerUrls.private.main.frontDoor) > -1) {
        return '.toggle-cv-container .button, .toggle-cv-container .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.main.breakdown) > -1) {
        return '.breakdown-container .button, .breakdown-container .btn, .breakdown-container .back-button, .breakdown-container .right, .breakdown-container li';
    }

    if (currentURL?.indexOf(routerUrls.private.main.cashPayment) > -1) {
        return '.cash-payment-container .btn, .cash-payment-container .button, .cash-payment-container .back-button, .cash-payment-container .tk-button, .cash-payment-container li, .cash-payment-container .right';
    }

    if (currentURL?.indexOf(routerUrls.private.main.rearDoor) > -1) {
        return '.toggle-cv-container .btn, .toggle-cv-container .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.endTrip) > -1) {
        return '.end-trip-container .btn, .end-trip-container .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.settings) > -1) {
        return '.settings-container .btn, .settings-container .button, .settings-container .right, .settings-container li';
    }

    if (currentURL?.indexOf(routerUrls.private.main.languageSetting) > -1) {
        return '.wrapper .language-opt, .wrapper .btn, .wrapper .button, .wrapper .row';
    }

    if (
        currentURL?.indexOf(routerUrls.private.main.commissioning.inProgress) > -1 ||
        currentURL?.indexOf(routerUrls.private.main.commissioning.clearingAllData) > -1 ||
        currentURL?.indexOf(routerUrls.private.main.commissioning.completedClearning) > -1
    ) {
        return '.commissioning-container .btn, .commissioning-container .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.manualLogin) > -1) {
        return '.wrapper .btn, .wrapper .button, .wrapper .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.tapCardLogin) > -1) {
        return 'button, .btn, .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.login) > -1) {
        return '.login-container .btn, .login-container .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.busOperation.startTripValidInfo) > -1) {
        return '.start-trip-page .btn, .start-trip-page .button, .start-trip-page .back-button, .start-trip-page .right, .start-trip-page li';
    }

    if (currentURL?.indexOf(routerUrls.private.main.busOperation.startTripInvalidInfo) > -1) {
        return '.wrapper .btn, .wrapper .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.busOperation.externalDevices) > -1) {
        return '.external-devices-page .btn, .external-devices-page .button, .external-devices-page .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.busOperation.endShift) > -1) {
        return '.btn, .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.dateTimeSetting) > -1) {
        return '.date-setting .btn, .date-setting .button, .date-setting .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.fareConsoleSetting) > -1) {
        return '.wrapper .btn, .wrapper .button, .wrapper .back-button, .wrapper .right, .wrapper a, .wrapper #enterKey, .wrapper #backspaceKey, .wrapper #switchKey1, .wrapper #switchKey2';
    }

    if (currentURL?.indexOf(routerUrls.private.main.lockScreen) > -1) {
        return '.lock-screen-container .btn, .lock-screen-container .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.dagwOperation) > -1) {
        return '.dagw-operation-container .btn, .dagw-operation-container .button';
    }

    if (currentURL?.indexOf(routerUrls.private.main.url) > -1) {
        return '.main-layout-page .btn, .main-layout-page .button, .main-layout-page .nav-item';
    }

    // --- fare routes ---

    if (currentURL?.indexOf(routerUrls.private.fare.topUp) > -1) {
        return '.top-up-page .btn, .top-up-page .button, .top-up-page .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.transaction) > -1) {
        return '.transaction-page .btn, .transaction-page .button, .transaction-page .back-button';
    }

    if (
        currentURL?.indexOf(routerUrls.private.fare.cancelRideCV1) > -1 ||
        currentURL?.indexOf(routerUrls.private.fare.cancelRideCV2) > -1
    ) {
        return '.cancel-ride .btn, .cancel-ride .button';
    }

    if (
        currentURL?.indexOf(routerUrls.private.fare.concessionCV1) > -1 ||
        currentURL?.indexOf(routerUrls.private.fare.concessionCV2) > -1
    ) {
        return '.concession .btn, .concession .button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.showCVStatus) > -1) {
        return '.show-cv-status .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.setCV) > -1) {
        return '.select-boarding-type .back-button, .select-boarding-type .row, .select-boarding-type .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.cvModeControl) > -1) {
        return '.cv-mode-control .btn, .cv-mode-control .button, .cv-mode-control .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.powerAllCVOn) > -1) {
        return '.power-all-cv-on .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.powerAllCVOff) > -1) {
        return '.power-all-cv-on .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.cvPowerControl) > -1) {
        return '.cv-power-control .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.resetAllCV) > -1) {
        return '.reset-all-cv .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.cvOperation.url) > -1) {
        return '.device-operation-content .back-button, .device-operation-content .device-operation-button';
    }

    if (
        currentURL?.indexOf(routerUrls.private.fare.blsOperation.manualLocation) > -1 ||
        currentURL?.indexOf(routerUrls.private.fare.blsOperation.autoLocation) > -1
    ) {
        return '.device-operation-content .btn, .device-operation-content .back-button, .device-operation-content .device-operation-button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.blsOperation.url) > -1) {
        return '.device-operation-content .back-button, .device-operation-content .device-operation-button, .device-operation-content .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.printerOperation.inspectorTicket) > -1) {
        return '.inspector-ticket .back-button, .inspector-ticket .button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.printerOperation.dailyTripLog) > -1) {
        return '.daily-trip-log .back-button, .daily-trip-log .button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.printerOperation.testReceipt) > -1) {
        return '.test-receipt .back-button, .test-receipt .button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.printerOperation.retentionTicket) > -1) {
        return '.printer-off .btn, .printer-off .button, .printer-off .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.printerOperation.status) > -1) {
        return '.printer-status .button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.printerOperation.url) > -1) {
        return '.device-operation-content .back-button, .device-operation-content .device-operation-button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.lockScreen) > -1) {
        return '.lock-screen-container .btn, .lock-screen-container .button';
    }

    if (currentURL?.indexOf(routerUrls.private.fare.url) > -1) {
        return '.ticketing-container .button, .ticketing-container .btn, .ticketing-container .back-button';
    }

    // --- maintenance routes ---

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.appUpgrade) > -1) {
        return '.app-upgrade-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.viewParameter) > -1) {
        return '.view-parameter-page img, .view-parameter-page .btn, .view-parameter-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.blsInformation) > -1) {
        return '.bls-information-page img, .bls-information-page .btn, .bls-information-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.calibrateBLS.calibrateBlsManualInput) > -1) {
        return '.calibrate-bls-manual-input-page .back-button, .calibrate-bls-manual-input-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.calibrateBLS.calibrateBlsCalibration) > -1) {
        return '.calibrate-bls-calibration-page .back-button, .calibrate-bls-calibration-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.calibrateBLS.url) > -1) {
        return '.calibrate-bls-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.checkPrinter) > -1) {
        return '.test-print-page .button, .test-print-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.loadParameter) > -1) {
        return '.load-parameter-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.redetectBls) > -1) {
        return '.test-print-page .button, .test-print-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.redetectCrp) > -1) {
        return '.redetect-crp-page .button, .redetect-crp-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.redetectCv) > -1) {
        return '.redetect-cv-page .confirm-button, .redetect-cv-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.redetectFms) > -1) {
        return '.test-print-page .button, .test-print-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.resetBls) > -1) {
        return '.test-print-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.saveTransaction) > -1) {
        return '.save-transaction-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.testPrint) > -1) {
        return '.test-print-page .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.versionInfo) > -1) {
        return '.version-info-page .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.externalDevices) > -1) {
        return '.external-devices-page .button, .external-devices-page .btn, .external-devices-page .back-button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.decommission) > -1) {
        return '.decommission .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.deckType) > -1) {
        return '.deck-type .radio, .deck-type .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.blsSetting) > -1) {
        return '.bls .back-button, .bls .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.timeSetting) > -1) {
        return '.time-setting .back-button, .time-setting .button, .time-setting .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.dateSetting) > -1) {
        return '.date-setting .back-button, .date-setting .button, .date-setting .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.busId) > -1) {
        return '.bus-id .btn, .bus-id .right, .bus-id .back-button, .bus-id .radio';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.complimentaryDay) > -1) {
        return '.complimentary-day .back-button, .complimentary-day .button';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.deleteParameter) > -1) {
        return '.delete-parameter .back-button, .delete-parameter .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.ticketingConsole.url) > -1) {
        return '.fare-console .right, .fare-console .left, .fare-console .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.cjb.url) > -1) {
        return '.maintenance-fare-layout .button, .maintenance-fare-layout .btn';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.fare.url) > -1) {
        return '.maintenance-fare-layout .button, .maintenance-fare-layout .btn, .maintenance-fare-layout .back-button, .maintenance-fare-layout .confirm-button, .maintenance-fare-layout .menu-direction, .maintenance-fare-layout .nav-item';
    }

    if (currentURL?.indexOf(routerUrls.private.maintenance.url) > -1) {
        return '.maintenance-container .button, .maintenance-container .btn';
    }

    return fallbackClickSelector;
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
