import { createReducer, on, createSelector } from '@ngrx/store';
import { AppState } from '@store/app.state';
import {
    IShowCVStatus,
    ICVModeControl,
    ICVPowerControl,
    ICVEntryExitControl,
    IRetentionTicket,
    IPrintStatus,
    ICancelRide,
    IConcession,
    IFareBusStopMode,
    ITopUp,
    ITransaction,
    IPowerAllCvOnOff,
    IResetAllCv,
    IExternalDevice,
    IPrinterStatus,
} from '@models';
import {
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
} from './fare.action';

export interface FareState {
    showCVStatus: IShowCVStatus;
    cvModeControl: ICVModeControl;
    powerCvOnOff: IPowerAllCvOnOff;
    cvPowerControl: ICVPowerControl;
    cvEntryExitControl: ICVEntryExitControl;
    resetAllCv: IResetAllCv;
    retentionTicket: IRetentionTicket;
    printStatus: IPrintStatus;
    cancelRide: ICancelRide;
    concession: IConcession;
    fareBusStopMode: IFareBusStopMode;
    topUp: ITopUp;
    transaction: ITransaction;
    externalDevices: IExternalDevice;
    printerStatus: IPrinterStatus;
}

export const initialFareState: FareState = {
    showCVStatus: {
        cvStatus: [],
    },
    cvModeControl: {},
    powerCvOnOff: {},
    cvPowerControl: {
        groups: [],
    },
    cvEntryExitControl: {
        cvType: 0,
    },
    resetAllCv: {},
    retentionTicket: {},
    printStatus: {},
    cancelRide: {},
    concession: {},
    fareBusStopMode: {},
    topUp: {},
    transaction: {},
    externalDevices: {
        testPrinter: {
            status: 0,
            message: '',
        },
        printer: {
            status: 4,
            message: '',
        },
        GNSSAntenna: {
            status: 4,
            message: '',
        },
        busETA: {
            status: 4,
            message: '',
        },
        cv1: {
            status: 4,
            message: '',
        },
        cv2: {
            status: 4,
            message: '',
        },
        cv3: {
            status: 4,
            message: '',
        },
        cv4: {
            status: 4,
            message: '',
        },
        cv5: {
            status: 4,
            message: '',
        },
        cv6: {
            status: 4,
            message: '',
        },
    },
    printerStatus: {},
};

export const fareReducer = createReducer(
    initialFareState,
    on(updateShowCVStatus, (state, { payload }) => {
        return {
            ...state,
            showCVStatus: {
                ...payload,
            },
        };
    }),
    on(updateCVModeControl, (state, { payload }) => {
        return {
            ...state,
            cvModeControl: {
                ...payload,
                timeout: payload.timeout || undefined,
            },
        };
    }),
    on(updateCVPowerControl, (state, { payload, msgID }) => {
        return {
            ...state,
            cvPowerControl: {
                ...payload,
                msgID,
            },
        };
    }),
    on(updatePowerCvOnOff, (state, { payload }) => {
        return {
            ...state,
            powerCvOnOff: {
                ...payload,
            },
        };
    }),
    on(updateCVEntryExit, (state, { payload, msgID }) => {
        return {
            ...state,
            cvEntryExitControl: {
                ...payload,
                msgID,
            },
        };
    }),
    on(updateResetAllCV, (state, { payload }) => {
        return {
            ...state,
            resetAllCv: {
                ...payload,
            },
        };
    }),

    on(updateRetentionTicket, (state, { payload }) => {
        return {
            ...state,
            retentionTicket: {
                ...state.retentionTicket,
                ...payload,
                timeout: payload.timeout || undefined,
            },
        };
    }),
    on(updatePrintStatus, (state, { payload, msgID }) => {
        return {
            ...state,
            printStatus: {
                ...payload,
                msgID,
            },
        };
    }),
    on(updateCancelRide, (state, { payload, msgID }) => {
        return {
            ...state,
            cancelRide: {
                ...payload,
                timeout: payload.timeout || undefined,
                msgID,
            },
        };
    }),
    on(updateConcession, (state, { payload, msgID }) => {
        return {
            ...state,
            concession: {
                ...payload,
                timeout: payload.timeout || undefined,
                msgID,
            },
        };
    }),
    on(updateFareBusStopMode, (state, { payload }) => {
        return {
            ...state,
            fareBusStopMode: {
                ...payload,
                timeout: payload.timeout || undefined,
            },
        };
    }),
    on(updateTopUp, (state, { payload }) => {
        return {
            ...state,
            topUp: {
                ...state.topUp,
                ...payload,
                timeout: payload.timeout || undefined,
            },
        };
    }),
    on(updateTransaction, (state, { payload }) => {
        return {
            ...state,
            transaction: {
                ...state.transaction,
                ...payload,
                message: payload.message || undefined,
                cardValue: payload.cardValue || undefined,
                timeout: payload.timeout || undefined,
            },
        };
    }),
    on(updateFareExternalDevices, (state, { payload }) => {
        return {
            ...state,
            externalDevices: {
                ...payload,
            },
        };
    }),
    on(updateTestPrinter, (state, { payload }) => {
        return {
            ...state,
            externalDevices: {
                ...state.externalDevices,
                testPrinter: { ...payload },
            },
        };
    }),
    on(updatePrinterStatus, (state, { payload }) => {
        return {
            ...state,
            printerStatus: {
                ...payload,
            },
        };
    }),
);

export const selectMaintenanceState = (state: AppState) => state.fare;

export const showCVStatus = createSelector(selectMaintenanceState, (state) => {
    return state.showCVStatus;
});

export const cvModeControl = createSelector(selectMaintenanceState, (state) => {
    return state.cvModeControl;
});

export const powerCvOnOff = createSelector(selectMaintenanceState, (state) => {
    return state.powerCvOnOff;
});

export const cvPowerControl = createSelector(selectMaintenanceState, (state) => {
    return state.cvPowerControl;
});

export const cvEntryExitControl = createSelector(selectMaintenanceState, (state) => {
    return state.cvEntryExitControl;
});

export const resetAllCv = createSelector(selectMaintenanceState, (state) => {
    return state.resetAllCv;
});

export const retentionTicket = createSelector(selectMaintenanceState, (state) => {
    return state.retentionTicket;
});

export const printStatus = createSelector(selectMaintenanceState, (state) => {
    return state.printStatus;
});

export const cancelRide = createSelector(selectMaintenanceState, (state) => {
    return state.cancelRide;
});

export const concession = createSelector(selectMaintenanceState, (state) => {
    return state.concession;
});

export const fareBusStopMode = createSelector(selectMaintenanceState, (state) => {
    return state.fareBusStopMode;
});

export const topUp = createSelector(selectMaintenanceState, (state) => {
    return state.topUp;
});

export const transaction = createSelector(selectMaintenanceState, (state) => {
    return state.transaction;
});

export const fareExternalDevices = createSelector(selectMaintenanceState, (state) => {
    return state.externalDevices;
});

export const printerStatus = createSelector(selectMaintenanceState, (state) => {
    return state.printerStatus;
});

export {
    updateShowCVStatus,
    updateCVModeControl,
    updatePowerCvOnOff,
    updateCVPowerControl,
    updateCVEntryExit,
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
};
