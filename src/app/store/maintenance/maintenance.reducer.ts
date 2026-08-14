import { createReducer, on, createSelector } from '@ngrx/store';
import { AppState } from '@store/app.state';
import {
    IFareConsole,
    IBusID,
    IExternalDevice,
    IViewParameter,
    IVersionInfo,
    IAppUpgrade,
    IDeCommission,
    IBlsInformation,
    IRedetectCV,
    ILoadParameter,
    ISaveTransaction,
    IAuditRegistration,
    IManualCalibrateBls,
    IBlsCalibration,
    IFareBusStopMode,
} from '@models';
import {
    updateFareConsole,
    updateBusIdInformation,
    updateExternalDevices,
    updateTestPrinter,
    updateViewParameter,
    updateAppUpgrade,
    updateVersionInfo,
    updateBlsInformation,
    updateDecommission,
    updateTCDateTime,
    updateRedetectCV,
    updateLoadParameter,
    updateSaveTransaction,
    updateAuditRegistration,
    updateManualCalibrateBls,
    updateBlsCalibration,
    updateFareBusStopMode,
} from './maintenance.action';

export interface MaintenanceState {
    fareConsole: IFareConsole;
    busIdInformation: IBusID;
    externalDevices: IExternalDevice;
    viewParameter: IViewParameter;
    appUpgrade: IAppUpgrade;
    versionInfo: IVersionInfo;
    blsInformation: IBlsInformation;
    decommission: IDeCommission;
    tcDateTime: Date | null;
    redetectCV: IRedetectCV;
    loadParameter: ILoadParameter;
    saveTransaction: ISaveTransaction;
    auditRegistration: IAuditRegistration;
    manualCalibrateBls: IManualCalibrateBls;
    blsCalibration: IBlsCalibration;
    fareBusStopMode: IFareBusStopMode;
}

export const initialMaintenanceState: MaintenanceState = {
    fareConsole: {
        deckType: {
            id: 0,
            label: '',
        },
        busId: '',
        complimentaryDays: 0,
        message: '',
        isSubmitted: true,
    },
    busIdInformation: {
        busId: '',
        operator: {
            id: 0,
            label: '',
            serviceProvider: 0,
        },
    },
    externalDevices: {},
    viewParameter: {
        parameters: [],
    },
    appUpgrade: {},
    versionInfo: { versionInfoList: [] },
    blsInformation: { blsList: [] },
    decommission: {},
    tcDateTime: null, // Initialize tcDateTime to null
    redetectCV: {},
    loadParameter: {},
    saveTransaction: {},
    auditRegistration: {},
    manualCalibrateBls: {},
    blsCalibration: {},
    fareBusStopMode: {},
};

export const maintenanceReducer = createReducer(
    initialMaintenanceState,
    on(updateFareConsole, (state, { payload, msgID }) => {
        return {
            ...state,
            fareConsole: {
                ...state.fareConsole,
                ...payload,
                msgID,
            },
        };
    }),
    on(updateBusIdInformation, (state, { payload, msgID }) => {
        return {
            ...state,
            busIdInformation: {
                ...state.busIdInformation,
                ...payload,
                msgID,
            },
        };
    }),
    on(updateExternalDevices, (state, { payload }) => {
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
    on(updateViewParameter, (state, { payload }) => {
        // console.log('updateViewParameter', payload);
        return {
            ...state,
            viewParameter: { ...payload },
        };
    }),
    on(updateAppUpgrade, (state, { payload }) => {
        return {
            ...state,
            appUpgrade: { ...payload },
        };
    }),
    on(updateVersionInfo, (state, { payload }) => {
        return {
            ...state,
            versionInfo: { ...payload },
        };
    }),
    on(updateBlsInformation, (state, { payload }) => {
        return {
            ...state,
            blsInformation: { ...payload },
        };
    }),
    on(updateDecommission, (state, { payload }) => {
        return {
            ...state,
            decommission: { ...payload },
        };
    }),
    on(updateTCDateTime, (state, { payload }) => {
        return {
            ...state,
            tcDateTime: payload,
        };
    }),
    on(updateRedetectCV, (state, { payload }) => {
        return {
            ...state,
            redetectCV: { ...payload },
        };
    }),
    on(updateLoadParameter, (state, { payload }) => {
        return {
            ...state,
            loadParameter: { ...payload },
        };
    }),
    on(updateSaveTransaction, (state, { payload }) => {
        return {
            ...state,
            saveTransaction: { ...payload },
        };
    }),
    on(updateAuditRegistration, (state, { payload }) => {
        return {
            ...state,
            auditRegistration: { ...payload },
        };
    }),
    on(updateManualCalibrateBls, (state, { payload }) => {
        return {
            ...state,
            manualCalibrateBls: {
                ...payload,
                newFactor: payload.newFactor || state.manualCalibrateBls.newFactor,
                timeout: payload.timeout || undefined,
            },
        };
    }),
    on(updateBlsCalibration, (state, { payload }) => {
        return {
            ...state,
            blsCalibration: { ...payload },
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
);

export const selectMaintenanceState = (state: AppState) => state.maintenance;

export const fareConsole = createSelector(selectMaintenanceState, (state) => {
    return state.fareConsole;
});

export const busIdInformation = createSelector(selectMaintenanceState, (state) => {
    return state.busIdInformation;
});

export const externalDevices = createSelector(selectMaintenanceState, (state) => {
    return state.externalDevices;
});

export const viewParameter = createSelector(selectMaintenanceState, (state) => {
    return state.viewParameter;
});

export const appUpgrade = createSelector(selectMaintenanceState, (state) => {
    return state.appUpgrade;
});

export const versionInfo = createSelector(selectMaintenanceState, (state) => {
    return state.versionInfo;
});

export const blsInformation = createSelector(selectMaintenanceState, (state) => {
    return state.blsInformation;
});

export const decommission = createSelector(selectMaintenanceState, (state) => {
    return state.decommission;
});

export const tcDateTime = createSelector(selectMaintenanceState, (state) => {
    return state.tcDateTime;
});

export const redetectCV = createSelector(selectMaintenanceState, (state) => {
    return state.redetectCV;
});

export const loadParameter = createSelector(selectMaintenanceState, (state) => {
    return state.loadParameter;
});

export const saveTransaction = createSelector(selectMaintenanceState, (state) => {
    return state.saveTransaction;
});

export const auditRegistration = createSelector(selectMaintenanceState, (state) => {
    return state.auditRegistration;
});

export const manualCalibrateBls = createSelector(selectMaintenanceState, (state) => {
    return state.manualCalibrateBls;
});

export const blsCalibration = createSelector(selectMaintenanceState, (state) => {
    return state.blsCalibration;
});

export const fareBusStopMode = createSelector(selectMaintenanceState, (state) => {
    return state.fareBusStopMode;
});

export {
    updateFareConsole,
    updateBusIdInformation,
    updateExternalDevices,
    updateTestPrinter,
    updateViewParameter,
    updateAppUpgrade,
    updateVersionInfo,
    updateBlsInformation,
    updateDecommission,
    updateTCDateTime,
    updateRedetectCV,
    updateLoadParameter,
    updateSaveTransaction,
    updateAuditRegistration,
    updateManualCalibrateBls,
    updateBlsCalibration,
    updateFareBusStopMode,
};
