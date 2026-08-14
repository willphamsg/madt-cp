import { Action } from '@ngrx/store';
import { AppState } from '@store/app.state';
import {
    fareReducer,
    initialFareState,
    FareState,
    selectMaintenanceState,
    showCVStatus,
    cvModeControl,
    powerCvOnOff,
    cvPowerControl,
    cvEntryExitControl,
    resetAllCv,
    retentionTicket,
    printStatus,
    cancelRide,
    concession,
    fareBusStopMode,
    topUp,
    transaction,
    fareExternalDevices,
    printerStatus,
    updateShowCVStatus,
    updateCVModeControl,
    updateCVPowerControl,
    updateCVEntryExit,
    updatePowerCvOnOff,
    updateResetAllCV,
    updateRetentionTicket,
    updatePrintStatus,
    updateCancelRide,
    updateConcession,
    updateFareBusStopMode,
    updateTopUp,
    updateTransaction,
    updateFareExternalDevices,
    updateTestPrinter,
    updatePrinterStatus,
} from './fare.reducer';

describe('fareReducer', () => {
    it('should return the initial state when called with an undefined state', () => {
        const action = { type: '@@INIT' } as Action;
        const state = fareReducer(undefined, action);
        expect(state).toEqual(initialFareState);
    });

    it('should return the same state reference for an unknown action', () => {
        const action = { type: 'SOME_UNKNOWN_ACTION' } as Action;
        const state = fareReducer(initialFareState, action);
        expect(state).toBe(initialFareState);
    });

    it('should handle updateShowCVStatus', () => {
        const payload = { status: 1, message: 'ok', cvStatus: [{ cvNum: 1, status: 1 }] };
        const state = fareReducer(initialFareState, updateShowCVStatus({ payload }));
        expect(state.showCVStatus).toEqual(payload);
    });

    describe('updateCVModeControl', () => {
        it('should keep timeout when payload.timeout is truthy', () => {
            const payload = { status: 1, message: 'm', cvMode: 2, timeout: 5000 };
            const state = fareReducer(initialFareState, updateCVModeControl({ payload }));
            expect(state.cvModeControl).toEqual({ ...payload, timeout: 5000 });
        });

        it('should set timeout to undefined when payload.timeout is falsy', () => {
            const payload = { status: 1, message: 'm', cvMode: 2 };
            const state = fareReducer(initialFareState, updateCVModeControl({ payload }));
            expect(state.cvModeControl.timeout).toBeUndefined();
            expect(state.cvModeControl.cvMode).toBe(2);
        });
    });

    it('should handle updateCVPowerControl and attach msgID', () => {
        const payload = { status: 1, message: 'ok', groups: [{ id: 1, cvs: ['1'], status: true }] };
        const state = fareReducer(initialFareState, updateCVPowerControl({ payload, msgID: 42 }));
        expect(state.cvPowerControl).toEqual({ ...payload, msgID: 42 } as unknown as typeof state.cvPowerControl);
    });

    it('should handle updatePowerCvOnOff', () => {
        const payload = { status: 1, message: 'ok', timeout: 100 };
        const state = fareReducer(initialFareState, updatePowerCvOnOff({ payload }));
        expect(state.powerCvOnOff).toEqual(payload);
    });

    it('should handle updateCVEntryExit and attach msgID', () => {
        const payload = { status: 1, message: 'm', cvType: 2 };
        const state = fareReducer(initialFareState, updateCVEntryExit({ payload, msgID: 7 }));
        expect(state.cvEntryExitControl).toEqual({
            ...payload,
            msgID: 7,
        } as unknown as typeof state.cvEntryExitControl);
    });

    it('should handle updateResetAllCV', () => {
        const payload = { msgID: 1, message: 'ok', status: 1, timeout: 10 };
        const state = fareReducer(initialFareState, updateResetAllCV({ payload }));
        expect(state.resetAllCv).toEqual(payload);
    });

    describe('updateRetentionTicket', () => {
        const stateWithRetention: FareState = {
            ...initialFareState,
            retentionTicket: { msgID: 1, status: 1, cvNum: 5 },
        };

        it('should merge with existing state and keep timeout when truthy', () => {
            const payload = { status: 2, message: 'm', timeout: 3000 };
            const state = fareReducer(stateWithRetention, updateRetentionTicket({ payload }));
            expect(state.retentionTicket).toEqual({
                msgID: 1,
                cvNum: 5,
                status: 2,
                message: 'm',
                timeout: 3000,
            });
        });

        it('should set timeout to undefined when payload.timeout is falsy', () => {
            const payload = { status: 2, message: 'm' };
            const state = fareReducer(stateWithRetention, updateRetentionTicket({ payload }));
            expect(state.retentionTicket.timeout).toBeUndefined();
            expect(state.retentionTicket.cvNum).toBe(5);
        });
    });

    it('should handle updatePrintStatus and attach msgID', () => {
        const payload = { message: 'm', status: 1, printerStatus: 2 };
        const state = fareReducer(initialFareState, updatePrintStatus({ payload, msgID: 3 }));
        expect(state.printStatus).toEqual({ ...payload, msgID: 3 });
    });

    describe('updateCancelRide', () => {
        it('should keep timeout when truthy and attach msgID', () => {
            const payload = { message: 'm', status: 1, timeout: 4000 };
            const state = fareReducer(initialFareState, updateCancelRide({ payload, msgID: 11 }));
            expect(state.cancelRide).toEqual({ ...payload, timeout: 4000, msgID: 11 });
        });

        it('should set timeout to undefined when falsy', () => {
            const payload = { message: 'm', status: 1 };
            const state = fareReducer(initialFareState, updateCancelRide({ payload, msgID: 12 }));
            expect(state.cancelRide.timeout).toBeUndefined();
            expect(state.cancelRide.msgID).toBe(12);
        });
    });

    describe('updateConcession', () => {
        it('should keep timeout when truthy and attach msgID', () => {
            const payload = { message: 'm', status: 1, title: 't', timeout: 2000 };
            const state = fareReducer(initialFareState, updateConcession({ payload, msgID: 21 }));
            expect(state.concession).toEqual({ ...payload, timeout: 2000, msgID: 21 });
        });

        it('should set timeout to undefined when falsy', () => {
            const payload = { message: 'm', status: 1, title: 't' };
            const state = fareReducer(initialFareState, updateConcession({ payload, msgID: 22 }));
            expect(state.concession.timeout).toBeUndefined();
            expect(state.concession.msgID).toBe(22);
        });
    });

    describe('updateFareBusStopMode', () => {
        it('should keep timeout when truthy', () => {
            const payload = { message: 'm', status: 1, mode: 2, timeout: 5000 };
            const state = fareReducer(initialFareState, updateFareBusStopMode({ payload }));
            expect(state.fareBusStopMode).toEqual({ ...payload, timeout: 5000 });
        });

        it('should set timeout to undefined when falsy', () => {
            const payload = { message: 'm', status: 1, mode: 2 };
            const state = fareReducer(initialFareState, updateFareBusStopMode({ payload }));
            expect(state.fareBusStopMode.timeout).toBeUndefined();
            expect(state.fareBusStopMode.mode).toBe(2);
        });
    });

    describe('updateTopUp', () => {
        const stateWithTopUp: FareState = {
            ...initialFareState,
            topUp: { msgID: 1, amounts: [10, 20] },
        };

        it('should merge with existing state and keep timeout when truthy', () => {
            const payload = { status: 1, message: 'm', amount: 10, timeout: 3000 };
            const state = fareReducer(stateWithTopUp, updateTopUp({ payload }));
            expect(state.topUp).toEqual({
                msgID: 1,
                amounts: [10, 20],
                status: 1,
                message: 'm',
                amount: 10,
                timeout: 3000,
            });
        });

        it('should set timeout to undefined when falsy', () => {
            const payload = { status: 1, message: 'm', amount: 10 };
            const state = fareReducer(stateWithTopUp, updateTopUp({ payload }));
            expect(state.topUp.timeout).toBeUndefined();
            expect(state.topUp.amounts).toEqual([10, 20]);
        });
    });

    describe('updateTransaction', () => {
        const stateWithTransaction: FareState = {
            ...initialFareState,
            transaction: { msgID: 1, cvList: [1, 2] },
        };

        it('should merge with existing state and keep message/cardValue/timeout when truthy', () => {
            const payload = {
                status: 1,
                message: 'm',
                cvNum: 3,
                cardValue: 50,
                timeout: 6000,
            };
            const state = fareReducer(stateWithTransaction, updateTransaction({ payload }));
            expect(state.transaction).toEqual({
                msgID: 1,
                cvList: [1, 2],
                status: 1,
                message: 'm',
                cvNum: 3,
                cardValue: 50,
                timeout: 6000,
            });
        });

        it('should set message/cardValue/timeout to undefined when falsy', () => {
            const payload = { status: 1, cvNum: 3, message: '', cardValue: 0, timeout: 0 };
            const state = fareReducer(stateWithTransaction, updateTransaction({ payload }));
            expect(state.transaction.message).toBeUndefined();
            expect(state.transaction.cardValue).toBeUndefined();
            expect(state.transaction.timeout).toBeUndefined();
            expect(state.transaction.cvList).toEqual([1, 2]);
        });
    });

    it('should handle updateFareExternalDevices by replacing externalDevices', () => {
        const payload = {
            testPrinter: { status: 1, message: '' },
            printer: { status: 1, message: 'ok' },
        };
        const state = fareReducer(initialFareState, updateFareExternalDevices({ payload }));
        expect(state.externalDevices).toEqual(payload);
    });

    it('should handle updateTestPrinter by merging into externalDevices.testPrinter', () => {
        const state = fareReducer(
            initialFareState,
            updateTestPrinter({ payload: { status: 1, message: 'printer ok' } }),
        );
        expect(state.externalDevices.testPrinter).toEqual({ status: 1, message: 'printer ok' });
        expect(state.externalDevices.printer).toEqual(initialFareState.externalDevices.printer);
    });

    it('should handle updatePrinterStatus', () => {
        const payload = { msgID: 1, message: 'm', status: 1, timeout: 100 };
        const state = fareReducer(initialFareState, updatePrinterStatus({ payload }));
        expect(state.printerStatus).toEqual(payload);
    });
});

describe('fare selectors', () => {
    const populatedFareState: FareState = {
        showCVStatus: { status: 1, message: 'ok', cvStatus: [{ cvNum: 1, status: 1 }] },
        cvModeControl: { status: 1, cvMode: 2 },
        powerCvOnOff: { status: 1, message: 'ok' },
        cvPowerControl: { groups: [{ id: 1, cvs: ['1'], status: true }] },
        cvEntryExitControl: { cvType: 1 },
        resetAllCv: { status: 1, message: 'ok' },
        retentionTicket: { status: 1, cvNum: 5 },
        printStatus: { status: 1, printerStatus: 2 },
        cancelRide: { status: 1, message: 'ok' },
        concession: { status: 1, title: 't' },
        fareBusStopMode: { status: 1, mode: 2 },
        topUp: { amounts: [10, 20] },
        transaction: { cvNum: 3, cardValue: 50 },
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
        printerStatus: { status: 1, message: 'm' },
    };

    const appState = { fare: populatedFareState } as unknown as AppState;

    it('selectMaintenanceState should return the fare slice', () => {
        expect(selectMaintenanceState(appState)).toBe(populatedFareState);
    });

    it('should select every derived piece of state correctly', () => {
        expect(showCVStatus(appState)).toEqual(populatedFareState.showCVStatus);
        expect(cvModeControl(appState)).toEqual(populatedFareState.cvModeControl);
        expect(powerCvOnOff(appState)).toEqual(populatedFareState.powerCvOnOff);
        expect(cvPowerControl(appState)).toEqual(populatedFareState.cvPowerControl);
        expect(cvEntryExitControl(appState)).toEqual(populatedFareState.cvEntryExitControl);
        expect(resetAllCv(appState)).toEqual(populatedFareState.resetAllCv);
        expect(retentionTicket(appState)).toEqual(populatedFareState.retentionTicket);
        expect(printStatus(appState)).toEqual(populatedFareState.printStatus);
        expect(cancelRide(appState)).toEqual(populatedFareState.cancelRide);
        expect(concession(appState)).toEqual(populatedFareState.concession);
        expect(fareBusStopMode(appState)).toEqual(populatedFareState.fareBusStopMode);
        expect(topUp(appState)).toEqual(populatedFareState.topUp);
        expect(transaction(appState)).toEqual(populatedFareState.transaction);
        expect(fareExternalDevices(appState)).toEqual(populatedFareState.externalDevices);
        expect(printerStatus(appState)).toEqual(populatedFareState.printerStatus);
    });
});
