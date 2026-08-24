import { Action } from '@ngrx/store';
import { AppState } from '@store/app.state';
import {
    IFmsBusStop,
    IFareBusStop,
    IDeviation,
    IEndTrip,
    IBreakDown,
    IFree,
    IRedeem,
    IFrontDoor,
    ILockScreen,
} from '@models';
import {
    mainReducer,
    initialMainState,
    MainState,
    selectMainState,
    displayFareBusStopList,
    currentFareBusStop,
    busStopList,
    selectedBusStop,
    busStopFareId,
    activeCVs,
    free,
    userInfo,
    currentDir,
    fareBusStopList,
    deviation,
    nextBusInfo,
    bootUp,
    fareConsole,
    loginOption,
    tapCardLogin,
    manualLogin,
    outOfService,
    dagwOperation,
    endTripInfo,
    breakDownInfo,
    cashPayment,
    redeem,
    frontDoor,
    cmBusIdInformation,
    externalDevices,
    language,
    dateTimeSetting,
    startTrip,
    lockScreen,
    updateDisplayFareBusStopList,
    updateCurrentFareBusStop,
    selectBusStop,
    selectBusStopForFare,
    updateActiveCVs,
    updateFreeCVs,
    updateBusStopList,
    updateUserInfo,
    updateCurrentNowDest,
    updateDeviation,
    updateNextBusInfo,
    updateBootUp,
    updateFareConsole,
    updateLoginOption,
    updateTapCardLogin,
    updateManualLogin,
    updateOutOfService,
    updateCvUpgradeStatus,
    updateDagwOperation,
    updateEndTripInfo,
    updateBreakDownInfo,
    updateCashPayment,
    updateRedeem,
    updateFrontDoor,
    updateCommissionBusIdInformation,
    updateExternalDevices,
    updateTestPrinter,
    updateLanguage,
    updateDateTimeSetting,
    updateStartTrip,
    updateLockScreen,
} from './main.reducer';

describe('mainReducer', () => {
    it('should return the initial state when called with an undefined state', () => {
        const action = { type: '@@INIT' } as Action;
        const state = mainReducer(undefined, action);
        expect(state).toEqual(initialMainState);
    });

    it('should return the same state reference for an unknown action', () => {
        const action = { type: 'SOME_UNKNOWN_ACTION' } as Action;
        const state = mainReducer(initialMainState, action);
        expect(state).toBe(initialMainState);
    });

    it('should handle updateDisplayFareBusStopList', () => {
        const state = mainReducer(initialMainState, updateDisplayFareBusStopList({ payload: true }));
        expect(state.displayFareBusStopList).toBe(true);
    });

    describe('updateBusStopList', () => {
        const fms: IFmsBusStop[] = [{ Busid: '1', Name: 'Stop 1' }];
        const fare: IFareBusStop[] = [{ Busid: '2', Name: 'Stop 2' }];

        it('should update only busStopList when only busStopList provided', () => {
            const state = mainReducer(initialMainState, updateBusStopList({ busStopList: fms }));
            expect(state.busStopList).toEqual(fms);
            expect(state.fareBusStopList).toEqual(initialMainState.fareBusStopList);
        });

        it('should update only fareBusStopList when only fareBusStopList provided', () => {
            const state = mainReducer(initialMainState, updateBusStopList({ fareBusStopList: fare }));
            expect(state.fareBusStopList).toEqual(fare);
            expect(state.busStopList).toEqual(initialMainState.busStopList);
        });

        it('should update both lists when both provided', () => {
            const state = mainReducer(initialMainState, updateBusStopList({ busStopList: fms, fareBusStopList: fare }));
            expect(state.busStopList).toEqual(fms);
            expect(state.fareBusStopList).toEqual(fare);
        });

        it('should leave both lists unchanged when neither provided', () => {
            const state = mainReducer(initialMainState, updateBusStopList({}));
            expect(state.busStopList).toEqual(initialMainState.busStopList);
            expect(state.fareBusStopList).toEqual(initialMainState.fareBusStopList);
        });
    });

    it('should handle updateOutOfService', () => {
        const state = mainReducer(initialMainState, updateOutOfService({ payload: { title: 'oos' } }));
        expect(state.outOfService).toEqual({ title: 'oos' });
    });

    it('should handle updateCvUpgradeStatus', () => {
        const stateWithOOS: MainState = {
            ...initialMainState,
            outOfService: { title: 'existing' },
        };
        const state = mainReducer(stateWithOOS, updateCvUpgradeStatus({ payload: 3 }));
        expect(state.outOfService).toEqual({ title: 'existing', cvUpgradeStatus: 3 });
    });

    it('should handle updateBootUp by merging with existing bootUp', () => {
        const state = mainReducer(initialMainState, updateBootUp({ payload: { busId: 'B1' } }));
        expect(state.bootUp.busId).toBe('B1');
        expect(state.bootUp.softwareVersion).toBe(initialMainState.bootUp.softwareVersion);
    });

    it('should handle updateFareConsole', () => {
        const state = mainReducer(
            initialMainState,
            updateFareConsole({
                payload: { deckType: { id: 1, label: 'Upper' }, busId: 'B1', complimentaryDays: 2, message: 'ok' },
                msgID: 99,
            }),
        );
        expect(state.fareConsole.busId).toBe('B1');
        expect(state.fareConsole.msgID).toBe(99);
    });

    it('should handle updateLoginOption', () => {
        const state = mainReducer(initialMainState, updateLoginOption({ payload: { msgID: 1, status: 2 } }));
        expect(state.loginOption).toEqual({ msgID: 1, status: 2 });
    });

    it('should handle updateTapCardLogin', () => {
        const state = mainReducer(
            initialMainState,
            updateTapCardLogin({ payload: { status: 1, pin: '1234' }, msgID: 5 }),
        );
        expect(state.tapCardLogin).toEqual({ status: 1, pin: '1234', msgID: 5 });
    });

    it('should handle updateManualLogin', () => {
        const state = mainReducer(initialMainState, updateManualLogin({ payload: { staffId: 'S1' }, msgID: 7 }));
        expect(state.manualLogin).toEqual({ staffId: 'S1', msgID: 7 });
    });

    it('should handle updateDagwOperation', () => {
        const state = mainReducer(
            initialMainState,
            updateDagwOperation({ payload: { msgID: 1, title: 't', message: 'm' } }),
        );
        expect(state.dagwOperation).toEqual({ msgID: 1, title: 't', message: 'm' });
    });

    it('should handle updateDeviation merging with default deviation shape', () => {
        const payload: IDeviation = {
            currentBlock: '01:00',
            isHeadway: false,
            minSec: '02:00',
            bars: 3,
            direction: 'N',
            color: 'red',
            busBehindOccupancy: 10,
        };
        const state = mainReducer(initialMainState, updateDeviation({ payload }));
        expect(state.deviation).toEqual(payload);
    });

    it('should handle updateNextBusInfo', () => {
        const state = mainReducer(
            initialMainState,
            updateNextBusInfo({ payload: { show: true, busBehindOccupancy: 1, busBehindTime: 2 } }),
        );
        expect(state.nextBusInfo).toEqual({ show: true, busBehindOccupancy: 1, busBehindTime: 2 });
    });

    describe('updateUserInfo', () => {
        it('should use payload values when provided (including falsy offRoute)', () => {
            const state = mainReducer(
                initialMainState,
                updateUserInfo({
                    userInfo: {
                        busServiceNum: '10',
                        plateNum: 'PB1',
                        spid: 'sp1',
                        dir: 1,
                        km: '5',
                        variantName: 'v1',
                        offRoute: false,
                    },
                }),
            );
            expect(state.userInfo).toEqual({
                busServiceNum: '10',
                plateNum: 'PB1',
                spid: 'sp1',
                dir: 1,
                km: '5',
                variantName: 'v1',
                offRoute: false,
            });
        });

        it('should fall back to existing state values when payload fields are missing', () => {
            const existingState: MainState = {
                ...initialMainState,
                userInfo: {
                    busServiceNum: '99',
                    plateNum: 'OLD',
                    spid: 'oldsp',
                    dir: 9,
                    km: '99',
                    variantName: 'oldv',
                    offRoute: true,
                },
            };
            const state = mainReducer(existingState, updateUserInfo({ userInfo: {} }));
            expect(state.userInfo).toEqual(existingState.userInfo);
        });

        it('should keep offRoute true when payload offRoute is a boolean true', () => {
            const state = mainReducer(initialMainState, updateUserInfo({ userInfo: { offRoute: true } }));
            expect(state.userInfo.offRoute).toBe(true);
        });
    });

    it('should handle updateCurrentNowDest by merging into currentDir', () => {
        const stateWithDir: MainState = { ...initialMainState, currentDir: { now: 'A' } };
        const state = mainReducer(stateWithDir, updateCurrentNowDest({ payload: { dest: 'B' } }));
        expect(state.currentDir).toEqual({ now: 'A', dest: 'B' });
    });

    describe('updateCurrentFareBusStop', () => {
        const fareBusStopListFixture: IFareBusStop[] = [
            { Busid: 'F1', Name: 'Fare Stop 1' },
            { Busid: 'F2', Name: 'Fare Stop 2' },
        ];
        const busStopListFixture: IFmsBusStop[] = [
            { Busid: 'B1', Name: 'Bus Stop 1' },
            { Busid: 'B2', Name: 'Bus Stop 2' },
        ];
        const stateWithLists: MainState = {
            ...initialMainState,
            fareBusStopList: fareBusStopListFixture,
            busStopList: busStopListFixture,
        };

        it('should look up by idx when idx is defined and > -1, and set boolean flags', () => {
            const state = mainReducer(
                stateWithLists,
                updateCurrentFareBusStop({
                    payload: 'ignored-when-idx-valid',
                    idx: 0,
                    autoBls: true,
                    manualBls: true,
                    misMatch: true,
                    isUpstage: true,
                }),
            );
            expect(state.currentFareBusStop?.Busid).toBe('F1');
            expect(state.currentFareBusStop?.idx).toBe(0);
            expect((state.currentFareBusStop as IFareBusStop)?.autoBls).toBe(true);
            expect((state.currentFareBusStop as IFareBusStop)?.manualBls).toBe(true);
            expect((state.currentFareBusStop as IFareBusStop)?.misMatch).toBe(true);
            expect((state.currentFareBusStop as IFareBusStop)?.isUpstage).toBe(true);
        });

        it('should look up by payload in busStopList when idx is -1 (not > -1)', () => {
            const state = mainReducer(stateWithLists, updateCurrentFareBusStop({ payload: 'B2', idx: -1 }));
            expect(state.currentFareBusStop?.Busid).toBe('B2');
            expect(state.currentFareBusStop?.idx).toBe(-1);
        });

        it('should look up by payload in busStopList when idx is undefined, and skip flags when not found', () => {
            const state = mainReducer(
                stateWithLists,
                updateCurrentFareBusStop({
                    payload: 'DOES-NOT-EXIST',
                    autoBls: true,
                    manualBls: true,
                    misMatch: true,
                    isUpstage: true,
                }),
            );
            expect(state.currentFareBusStop?.Busid).toBeUndefined();
            expect((state.currentFareBusStop as IFareBusStop)?.autoBls).toBeUndefined();
            expect((state.currentFareBusStop as IFareBusStop)?.manualBls).toBeUndefined();
            expect((state.currentFareBusStop as IFareBusStop)?.misMatch).toBeUndefined();
            expect((state.currentFareBusStop as IFareBusStop)?.isUpstage).toBeUndefined();
        });
    });

    it('should handle selectBusStop', () => {
        const payload: IFmsBusStop = { Busid: 'S1', Name: 'Selected' };
        const state = mainReducer(initialMainState, selectBusStop({ payload }));
        expect(state.selectedBusStop).toEqual(payload);
    });

    it('should handle selectBusStop with a null payload', () => {
        const state = mainReducer(initialMainState, selectBusStop({ payload: null }));
        expect(state.selectedBusStop).toBeNull();
    });

    describe('selectBusStopForFare', () => {
        const busStopListFixture: IFmsBusStop[] = [
            { Busid: 'B1', Name: 'Bus Stop 1' },
            { Busid: 'B2', Name: 'Bus Stop 2' },
        ];
        const stateWithList: MainState = { ...initialMainState, busStopList: busStopListFixture };

        it('should set busStopFareId and lineActive index when found', () => {
            const state = mainReducer(stateWithList, selectBusStopForFare({ payload: 'B2' }));
            expect(state.busStopFareId).toBe('B2');
            expect((state as unknown as { lineActive: number }).lineActive).toBe(1);
        });

        it('should set lineActive to -1 when not found', () => {
            const state = mainReducer(stateWithList, selectBusStopForFare({ payload: 'MISSING' }));
            expect(state.busStopFareId).toBe('MISSING');
            expect((state as unknown as { lineActive: number }).lineActive).toBe(-1);
        });
    });

    it('should handle updateActiveCVs', () => {
        const state = mainReducer(initialMainState, updateActiveCVs({ payload: [1, 2, 3] }));
        expect(state.activeCVs).toEqual([1, 2, 3]);
    });

    describe('updateFreeCVs', () => {
        const freeState: MainState = { ...initialMainState, free: { freeMode: false } };

        it('should keep timeout when payload.timeout is truthy', () => {
            const payload: IFree = { freeMode: true, timeout: 5000 };
            const state = mainReducer(freeState, updateFreeCVs({ payload }));
            expect(state.free).toEqual({ freeMode: true, timeout: 5000 });
        });

        it('should set timeout to undefined when payload.timeout is falsy', () => {
            const payload: IFree = { freeMode: true };
            const state = mainReducer(freeState, updateFreeCVs({ payload }));
            expect(state.free.freeMode).toBe(true);
            expect(state.free.timeout).toBeUndefined();
        });
    });

    describe('updateEndTripInfo', () => {
        it('should keep timeout when payload.timeout is truthy', () => {
            const payload: IEndTrip = {
                service: 1,
                direction: 'up',
                firstBusStop: {},
                lastBusStop: {},
                timeout: 3000,
            };
            const state = mainReducer(initialMainState, updateEndTripInfo({ payload, msgID: 11 }));
            expect(state.endTripInfo.timeout).toBe(3000);
            expect(state.endTripInfo.msgID).toBe(11);
        });

        it('should reset timeout to undefined when payload.timeout is falsy', () => {
            const payload: IEndTrip = {
                service: 1,
                direction: 'up',
                firstBusStop: {},
                lastBusStop: {},
            };
            const state = mainReducer(initialMainState, updateEndTripInfo({ payload, msgID: 12 }));
            expect(state.endTripInfo.timeout).toBeUndefined();
        });
    });

    describe('updateBreakDownInfo', () => {
        it('should keep timeout when payload.timeout is truthy', () => {
            const payload: IBreakDown = {
                service: 1,
                direction: 'down',
                firstBusStop: {},
                lastBusStop: {},
                timeout: 4000,
            };
            const state = mainReducer(initialMainState, updateBreakDownInfo({ payload }));
            expect(state.breakDownInfo.timeout).toBe(4000);
        });

        it('should set timeout to undefined when payload.timeout is falsy', () => {
            const payload: IBreakDown = {
                service: 1,
                direction: 'down',
                firstBusStop: {},
                lastBusStop: {},
            };
            const state = mainReducer(initialMainState, updateBreakDownInfo({ payload }));
            expect(state.breakDownInfo.timeout).toBeUndefined();
        });
    });

    it('should handle updateCashPayment by merging into cashPayment', () => {
        const stateWithCash: MainState = { ...initialMainState, cashPayment: { status: 1 } };
        const state = mainReducer(stateWithCash, updateCashPayment({ payload: { message: 'ok' } }));
        expect(state.cashPayment).toEqual({ status: 1, message: 'ok' });
    });

    describe('updateRedeem', () => {
        it('should keep timeout when payload.timeout is truthy', () => {
            const payload: IRedeem = { status: 1, timeout: 1000 };
            const state = mainReducer(initialMainState, updateRedeem({ payload }));
            expect(state.redeem.timeout).toBe(1000);
        });

        it('should set timeout to undefined when payload.timeout is falsy', () => {
            const payload: IRedeem = { status: 1 };
            const state = mainReducer(initialMainState, updateRedeem({ payload }));
            expect(state.redeem.timeout).toBeUndefined();
        });
    });

    describe('updateFrontDoor', () => {
        it('should keep timeout when payload.timeout is truthy', () => {
            const payload: IFrontDoor = { status: 1, timeout: 2000 };
            const state = mainReducer(initialMainState, updateFrontDoor({ payload }));
            expect(state.frontDoor.timeout).toBe(2000);
        });

        it('should set timeout to undefined when payload.timeout is falsy', () => {
            const payload: IFrontDoor = { status: 1 };
            const state = mainReducer(initialMainState, updateFrontDoor({ payload }));
            expect(state.frontDoor.timeout).toBeUndefined();
        });
    });

    it('should handle updateCommissionBusIdInformation', () => {
        const state = mainReducer(
            initialMainState,
            updateCommissionBusIdInformation({ payload: { busId: 'BUS1' }, msgID: 3 }),
        );
        expect(state.cmBusIdInformation.busId).toBe('BUS1');
        expect(state.cmBusIdInformation.msgID).toBe(3);
    });

    it('should handle updateExternalDevices by replacing externalDevices', () => {
        const state = mainReducer(
            initialMainState,
            updateExternalDevices({ payload: { printer: { status: 1, message: 'ok' } } }),
        );
        expect(state.externalDevices).toEqual({ printer: { status: 1, message: 'ok' } });
    });

    it('should handle updateTestPrinter by merging into externalDevices.testPrinter', () => {
        const state = mainReducer(
            initialMainState,
            updateTestPrinter({ payload: { status: 1, message: 'printer ok' } }),
        );
        expect(state.externalDevices.testPrinter).toEqual({ status: 1, message: 'printer ok' });
        expect(state.externalDevices.printer).toEqual(initialMainState.externalDevices.printer);
    });

    it('should handle updateLanguage', () => {
        const state = mainReducer(initialMainState, updateLanguage({ payload: { language: 'CH' } }));
        expect(state.language).toBe('CH');
    });

    it('should handle updateDateTimeSetting', () => {
        const state = mainReducer(
            initialMainState,
            updateDateTimeSetting({ payload: { dateTime: '2026-08-03T00:00:00Z' } }),
        );
        expect(state.dateTimeSetting.dateTime).toBe('2026-08-03T00:00:00Z');
    });

    it('should handle updateStartTrip', () => {
        const state = mainReducer(initialMainState, updateStartTrip({ payload: { message: 'started' }, msgID: 4 }));
        expect(state.startTrip.message).toBe('started');
        expect(state.startTrip.msgID).toBe(4);
    });

    describe('updateLockScreen', () => {
        it('should keep timeout when payload.timeout is truthy', () => {
            const payload: ILockScreen = { status: 1, timeout: 6000 };
            const state = mainReducer(initialMainState, updateLockScreen({ payload }));
            expect(state.lockScreen).toEqual({ status: 1, timeout: 6000 });
        });

        it('should set timeout to undefined when payload.timeout is falsy', () => {
            const payload: ILockScreen = { status: 1 };
            const state = mainReducer(initialMainState, updateLockScreen({ payload }));
            expect(state.lockScreen).toEqual({ status: 1, timeout: undefined });
        });
    });
});

describe('main selectors', () => {
    const populatedMainState: MainState = {
        displayFareBusStopList: true,
        activeCVs: [1, 2],
        free: { freeMode: true },
        currentFareBusStop: { Busid: 'F1', Name: 'Fare Stop' },
        busStopList: [{ Busid: 'B1', Name: 'Bus Stop 1' }],
        fareBusStopList: [{ Busid: 'F1', Name: 'Fare Stop' }],
        selectedBusStop: { Busid: 'B1', Name: 'Bus Stop 1' },
        busStopFareId: 'B1',
        userInfo: { busServiceNum: '10' },
        currentDir: { now: 'A', dest: 'B' },
        deviation: {
            currentBlock: '01:00',
            isHeadway: false,
            minSec: '00:30',
            bars: 2,
            direction: 'N',
            color: 'green',
        },
        nextBusInfo: { show: true, busBehindOccupancy: 5, busBehindTime: 10 },
        cvIconStatus: [],
        bootUp: {
            softwareVersion: '1.0',
            osVersion: '2.0',
            releaseDate: '2026-01-01',
            serialNumber: 'SN1',
            busId: 'BUS1',
            service: 'S1',
        },
        fareConsole: {
            deckType: { id: 1, label: 'Upper' },
            blsStatus: 1,
            time: '10:00',
            date: '2026-08-03',
            busId: 'BUS1',
            complimentaryDays: 1,
            message: 'ok',
        },
        outOfService: { title: 'oos' },
        dagwOperation: { msgID: 1, title: 't', message: 'm' },
        loginOption: { msgID: 1, status: 2 },
        tapCardLogin: { status: 1 },
        manualLogin: { staffId: 'S1' },
        endTripInfo: {
            title: 'End',
            direction: 'N',
            service: 1,
            firstBusStop: {},
            lastBusStop: {},
            busStopList: [],
            reasonList: [],
        },
        breakDownInfo: {
            title: 'Break',
            direction: 'S',
            service: 2,
            firstBusStop: {},
            lastBusStop: {},
            busStopList: [],
            reasonList: [],
        },
        cashPayment: { status: 1, message: 'cash' },
        redeem: { status: 2 },
        frontDoor: { status: 3 },
        cmBusIdInformation: {
            busId: 'BUS1',
            operator: { id: 1, label: 'Op1', serviceProvider: 1 },
        },
        externalDevices: {
            testPrinter: { status: 1, message: '' },
            printer: { status: 1, message: '' },
            GNSSAntenna: { status: 1, message: '' },
            busETA: { status: 1, message: '' },
            cv1: { status: 1, message: '' },
            cv2: { status: 1, message: '' },
            cv3: { status: 1, message: '' },
            cv4: { status: 1, message: '' },
            cv5: { status: 1, message: '' },
            cv6: { status: 1, message: '' },
        },
        language: 'EN',
        dateTimeSetting: { dateTime: '2026-08-03T00:00:00Z' },
        startTrip: { message: 'started' },
        lockScreen: { status: 1 },
    };

    const appState = { main: populatedMainState } as unknown as AppState;

    it('selectMainState should return the main slice', () => {
        expect(selectMainState(appState)).toBe(populatedMainState);
    });

    it('should select every derived piece of state correctly', () => {
        expect(displayFareBusStopList(appState)).toBe(populatedMainState.displayFareBusStopList);
        expect(currentFareBusStop(appState)).toEqual(populatedMainState.currentFareBusStop);
        expect(busStopList(appState)).toEqual(populatedMainState.busStopList);
        expect(selectedBusStop(appState)).toEqual(populatedMainState.selectedBusStop);
        expect(busStopFareId(appState)).toBe(populatedMainState.busStopFareId);
        expect(activeCVs(appState)).toEqual(populatedMainState.activeCVs);
        expect(free(appState)).toEqual(populatedMainState.free);
        expect(userInfo(appState)).toEqual(populatedMainState.userInfo);
        expect(currentDir(appState)).toEqual(populatedMainState.currentDir);
        expect(fareBusStopList(appState)).toEqual(populatedMainState.fareBusStopList);
        expect(deviation(appState)).toEqual(populatedMainState.deviation);
        expect(nextBusInfo(appState)).toEqual(populatedMainState.nextBusInfo);
        expect(bootUp(appState)).toEqual(populatedMainState.bootUp);
        expect(fareConsole(appState)).toEqual(populatedMainState.fareConsole);
        expect(loginOption(appState)).toEqual(populatedMainState.loginOption);
        expect(tapCardLogin(appState)).toEqual(populatedMainState.tapCardLogin);
        expect(manualLogin(appState)).toEqual(populatedMainState.manualLogin);
        expect(outOfService(appState)).toEqual(populatedMainState.outOfService);
        expect(dagwOperation(appState)).toEqual(populatedMainState.dagwOperation);
        expect(endTripInfo(appState)).toEqual(populatedMainState.endTripInfo);
        expect(breakDownInfo(appState)).toEqual(populatedMainState.breakDownInfo);
        expect(cashPayment(appState)).toEqual(populatedMainState.cashPayment);
        expect(redeem(appState)).toEqual(populatedMainState.redeem);
        expect(frontDoor(appState)).toEqual(populatedMainState.frontDoor);
        expect(cmBusIdInformation(appState)).toEqual(populatedMainState.cmBusIdInformation);
        expect(externalDevices(appState)).toEqual(populatedMainState.externalDevices);
        expect(language(appState)).toBe(populatedMainState.language);
        expect(dateTimeSetting(appState)).toEqual(populatedMainState.dateTimeSetting);
        expect(startTrip(appState)).toEqual(populatedMainState.startTrip);
        expect(lockScreen(appState)).toEqual(populatedMainState.lockScreen);
    });
});
