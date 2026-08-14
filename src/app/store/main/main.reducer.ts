import { createReducer, on, createSelector } from '@ngrx/store';
import {
    updateDisplayFareBusStopList,
    updateCurrentFareBusStop,
    selectBusStop,
    selectBusStopForFare,
    updateActiveCVs,
    updateFreeCVs,
    updateUserInfo,
    updateBusStopList,
    updateCurrentNowDest,
    updateDeviation,
    updateNextBusInfo,
    updateBootUp,
    updateFareConsole,
    updateOutOfService,
    updateCvUpgradeStatus,
    updateDagwOperation,
    updateLoginOption,
    updateTapCardLogin,
    updateManualLogin,
    updateEndTripInfo,
    updateBreakDownInfo,
    updateCommissionBusIdInformation,
    updateExternalDevices,
    updateTestPrinter,
    updateLanguage,
    updateDateTimeSetting,
    updateStartTrip,
    updateLockScreen,
    updateCashPayment,
    updateRedeem,
    updateFrontDoor,
} from './main.action';
import { AppState } from '@store/app.state';
import {
    IFmsBusStop,
    ICurrenNowDest,
    IUserInfoMain,
    IDeviation,
    INextBusInfo,
    ICvsStatus,
    IBootUp,
    IFareConsole,
    IOutOfService,
    IDagwOperation,
    ILoginOption,
    ITapCardLogin,
    IManualLogin,
    IEndTrip,
    IBreakDown,
    IBusID,
    IExternalDevice,
    IStartTrip,
    ILockScreen,
    IFareBusStop,
    IFree,
    ICashPayment,
    IRedeem,
    IFrontDoor,
    IDateTime,
} from '@models';

export interface MainState {
    displayFareBusStopList: boolean;
    activeCVs: number[];
    free: IFree;
    currentFareBusStop: IFareBusStop | null;
    busStopList: IFmsBusStop[];
    fareBusStopList: IFareBusStop[];
    selectedBusStop: IFmsBusStop | null;
    busStopFareId: string;
    userInfo: IUserInfoMain;
    currentDir: ICurrenNowDest;
    deviation: IDeviation;
    nextBusInfo: INextBusInfo;
    cvIconStatus: ICvsStatus[];
    bootUp: IBootUp;
    fareConsole: IFareConsole;
    outOfService: IOutOfService;
    dagwOperation: IDagwOperation;
    loginOption: ILoginOption;
    tapCardLogin: ITapCardLogin;
    manualLogin: IManualLogin;
    endTripInfo: IEndTrip;
    breakDownInfo: IBreakDown;
    cashPayment: ICashPayment;
    redeem: IRedeem;
    frontDoor: IFrontDoor;
    cmBusIdInformation: IBusID;
    externalDevices: IExternalDevice;
    language: string;
    dateTimeSetting: IDateTime;
    startTrip: IStartTrip;
    lockScreen: ILockScreen;
}

export const initialMainState: MainState = {
    displayFareBusStopList: false,
    activeCVs: [],
    free: {
        freeMode: false,
    },
    currentFareBusStop: null,
    selectedBusStop: null,
    busStopFareId: '',
    busStopList: [],
    fareBusStopList: [],
    userInfo: {},
    currentDir: {},
    deviation: {
        currentBlock: '--:--',
        isHeadway: true,
        minSec: '--:--',
        bars: 0,
        direction: '',
        color: 'black',
    },
    nextBusInfo: {
        show: false,
        busBehindOccupancy: 0,
        busBehindTime: 0,
    },
    cvIconStatus: [],
    bootUp: {
        softwareVersion: '',
        osVersion: '',
        releaseDate: '',
        serialNumber: '',
        busId: '',
        service: '',
    },
    fareConsole: {
        deckType: {
            id: 0,
            label: '',
        },
        blsStatus: 0,
        time: '',
        date: '',
        busId: '',
        complimentaryDays: 0,
        message: '',
    },
    outOfService: {},
    dagwOperation: {
        msgID: 0,
        title: '',
        message: '',
    },
    loginOption: {},
    tapCardLogin: {},
    manualLogin: {},
    endTripInfo: {
        title: '',
        direction: '',
        service: 0,
        firstBusStop: {},
        lastBusStop: {},
        busStopList: [],
        reasonList: [],
    },
    breakDownInfo: {
        title: '',
        direction: '',
        service: 0,
        firstBusStop: {},
        lastBusStop: {},
        busStopList: [],
        reasonList: [],
    },
    cashPayment: {},
    redeem: {},
    frontDoor: {},
    cmBusIdInformation: {
        busId: '',
        operator: {
            id: 0,
            label: '',
            serviceProvider: 0,
        },
    },
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
    language: 'EN',
    dateTimeSetting: {
        dateTime: '',
    },
    startTrip: {},
    lockScreen: {},
};

export const mainReducer = createReducer(
    initialMainState,
    // Action to update the entire bus stop list
    on(updateDisplayFareBusStopList, (state, { payload }) => {
        return {
            ...state,
            displayFareBusStopList: payload,
        };
    }),

    on(updateBusStopList, (state, { busStopList, fareBusStopList }) => {
        return {
            ...state,
            ...(busStopList ? { busStopList: busStopList } : {}),
            ...(fareBusStopList ? { fareBusStopList: fareBusStopList } : {}),
        };
    }),

    on(updateOutOfService, (state, { payload }) => {
        return {
            ...state,
            outOfService: { ...payload },
        };
    }),

    on(updateCvUpgradeStatus, (state, { payload }) => {
        return {
            ...state,
            outOfService: { ...state.outOfService, cvUpgradeStatus: payload },
        };
    }),

    on(updateBootUp, (state, { payload }) => {
        return {
            ...state,
            bootUp: { ...state.bootUp, ...payload },
        };
    }),

    on(updateFareConsole, (state, { payload, msgID }) => {
        return {
            ...state,
            fareConsole: { ...state.fareConsole, ...payload, msgID },
        };
    }),

    on(updateLoginOption, (state, { payload }) => {
        return {
            ...state,
            loginOption: { ...payload },
        };
    }),

    on(updateTapCardLogin, (state, { payload, msgID }) => {
        return {
            ...state,
            tapCardLogin: { ...payload, msgID },
        };
    }),

    on(updateManualLogin, (state, { payload, msgID }) => {
        return {
            ...state,
            manualLogin: { ...payload, msgID },
        };
    }),

    on(updateDagwOperation, (state, { payload }) => {
        return {
            ...state,
            dagwOperation: { ...payload },
        };
    }),

    on(updateDeviation, (state, { payload }) => {
        const defaultDeviation: IDeviation = {
            currentBlock: '--:--',
            isHeadway: true,
            minSec: '--:--',
            bars: 0,
            direction: '',
            color: 'black',
        };
        return {
            ...state,
            deviation: {
                ...defaultDeviation,
                ...payload,
            },
        };
    }),
    on(updateNextBusInfo, (state, { payload }) => {
        return {
            ...state,
            nextBusInfo: payload,
        };
    }),

    // Action to update the uerInfo
    on(updateUserInfo, (state, { userInfo }) => {
        return {
            ...state,
            userInfo: {
                busServiceNum: userInfo?.busServiceNum || state?.userInfo?.busServiceNum,
                plateNum: userInfo?.plateNum || state?.userInfo?.plateNum,
                spid: userInfo?.spid || state?.userInfo?.spid,
                dir: userInfo?.dir || state?.userInfo?.dir,
                km: userInfo?.km || state?.userInfo?.km,
                variantName: userInfo?.variantName || state?.userInfo?.variantName,
                offRoute: typeof userInfo?.offRoute === 'boolean' ? userInfo.offRoute : state?.userInfo?.offRoute,
            },
        };
    }),
    on(updateCurrentNowDest, (state, { payload }) => {
        return {
            ...state,
            currentDir: {
                ...state.currentDir,
                ...payload,
            },
        };
    }),

    on(updateCurrentFareBusStop, (state, { payload, manualBls, autoBls, misMatch, idx }) => {
        let currentFareBusStop: IFareBusStop;
        // console.log('updateCurrentFareBusStop', payload, manualBls, misMatch, idx);
        if (idx !== undefined && idx > -1) {
            // If idx is provided, use it to find the bus stop in fareBusStopList
            currentFareBusStop = state?.fareBusStopList?.[idx] as IFareBusStop;
        } else {
            // Otherwise, find the bus stop in busStopList by payload
            currentFareBusStop = state?.busStopList?.find((bs) => bs.Busid === payload) as IFareBusStop;
        }
        const nextFareBusStop = { ...currentFareBusStop, idx };

        if (typeof autoBls === 'boolean' && currentFareBusStop) {
            nextFareBusStop['autoBls'] = autoBls;
        }
        if (typeof manualBls === 'boolean' && currentFareBusStop) {
            nextFareBusStop['manualBls'] = manualBls;
        }
        if (typeof misMatch === 'boolean' && currentFareBusStop) {
            nextFareBusStop['misMatch'] = misMatch;
        }
        return {
            ...state,
            currentFareBusStop: nextFareBusStop,
        };
    }),

    on(selectBusStop, (state, { payload }) => {
        return {
            ...state,
            selectedBusStop: payload,
        };
    }),

    on(selectBusStopForFare, (state, { payload }) => {
        const idx: number = state.busStopList.findIndex((bs) => bs.Busid === payload);
        return {
            ...state,
            lineActive: idx,
            busStopFareId: payload,
        };
    }),

    on(updateActiveCVs, (state, { payload }) => {
        return {
            ...state,
            activeCVs: payload,
        };
    }),

    on(updateFreeCVs, (state, { payload }) => {
        return {
            ...state,
            free: {
                ...state.free,
                ...payload,
                timeout: payload?.timeout || undefined,
            },
        };
    }),

    on(updateEndTripInfo, (state, { payload, msgID }) => {
        const endTripInfo = { ...state.endTripInfo, ...payload, msgID };
        if (!payload.timeout) {
            endTripInfo.timeout = undefined;
        }
        return {
            ...state,
            endTripInfo,
        };
    }),

    on(updateBreakDownInfo, (state, { payload }) => {
        const breakDownInfo = {
            ...state.breakDownInfo,
            ...payload,
            timeout: payload?.timeout ? payload.timeout : undefined,
        };

        return {
            ...state,
            breakDownInfo,
        };
    }),

    on(updateCashPayment, (state, { payload }) => {
        const cash = {
            ...state.cashPayment,
            ...payload,
        };

        return {
            ...state,
            cashPayment: cash,
        };
    }),

    on(updateRedeem, (state, { payload }) => {
        return {
            ...state,
            redeem: { ...state.redeem, ...payload, timeout: payload?.timeout ? payload.timeout : undefined },
        };
    }),

    on(updateFrontDoor, (state, { payload }) => {
        return {
            ...state,
            frontDoor: { ...state.frontDoor, ...payload, timeout: payload?.timeout ? payload.timeout : undefined },
        };
    }),

    on(updateCommissionBusIdInformation, (state, { payload, msgID }) => {
        return {
            ...state,
            cmBusIdInformation: {
                ...state.cmBusIdInformation,
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
    on(updateLanguage, (state, { payload }) => {
        return {
            ...state,
            language: payload.language,
        };
    }),
    on(updateDateTimeSetting, (state, { payload }) => {
        // console.log('Reducer - updateDateTimeSetting called with payload:', payload);
        return {
            ...state,
            dateTimeSetting: {
                ...state.dateTimeSetting,
                ...payload,
                // msgID,
            },
        };
    }),
    on(updateStartTrip, (state, { payload, msgID }) => {
        return {
            ...state,
            startTrip: { ...state.startTrip, ...payload, msgID },
        };
    }),
    on(updateLockScreen, (state, { payload }) => {
        return {
            ...state,
            lockScreen: { ...payload, timeout: payload?.timeout ? payload.timeout : undefined },
        };
    }),
);

export const selectMainState = (state: AppState) => state.main;

export const displayFareBusStopList = createSelector(selectMainState, (state) => {
    return state.displayFareBusStopList;
});

export const currentFareBusStop = createSelector(selectMainState, (state) => {
    return state.currentFareBusStop;
});

export const busStopList = createSelector(selectMainState, (state) => {
    return state.busStopList;
});

export const selectedBusStop = createSelector(selectMainState, (state) => {
    return state.selectedBusStop;
});

export const busStopFareId = createSelector(selectMainState, (state) => {
    return state.busStopFareId;
});

export const activeCVs = createSelector(selectMainState, (state) => {
    return state.activeCVs;
});

export const free = createSelector(selectMainState, (state) => {
    return state.free;
});

export const userInfo = createSelector(selectMainState, (state) => {
    return state.userInfo;
});

export const currentDir = createSelector(selectMainState, (state) => {
    return state.currentDir;
});

export const fareBusStopList = createSelector(selectMainState, (state) => {
    return state.fareBusStopList;
});
export const deviation = createSelector(selectMainState, (state) => {
    return state.deviation;
});

export const nextBusInfo = createSelector(selectMainState, (state) => {
    return state.nextBusInfo;
});

export const bootUp = createSelector(selectMainState, (state) => {
    return state.bootUp;
});

export const fareConsole = createSelector(selectMainState, (state) => {
    return state.fareConsole;
});

export const loginOption = createSelector(selectMainState, (state) => {
    return state.loginOption;
});

export const tapCardLogin = createSelector(selectMainState, (state) => {
    return state.tapCardLogin;
});

export const manualLogin = createSelector(selectMainState, (state) => {
    return state.manualLogin;
});

export const outOfService = createSelector(selectMainState, (state) => {
    return state.outOfService;
});

export const dagwOperation = createSelector(selectMainState, (state) => {
    return state.dagwOperation;
});

export const endTripInfo = createSelector(selectMainState, (state) => {
    return state.endTripInfo;
});

export const breakDownInfo = createSelector(selectMainState, (state) => {
    return state.breakDownInfo;
});

export const cashPayment = createSelector(selectMainState, (state) => {
    return state.cashPayment;
});

export const redeem = createSelector(selectMainState, (state) => {
    return state.redeem;
});

export const frontDoor = createSelector(selectMainState, (state) => {
    return state.frontDoor;
});

export const cmBusIdInformation = createSelector(selectMainState, (state) => {
    return state.cmBusIdInformation;
});

export const externalDevices = createSelector(selectMainState, (state) => {
    return state.externalDevices;
});

export const language = createSelector(selectMainState, (state) => {
    return state.language;
});

export const dateTimeSetting = createSelector(selectMainState, (state) => {
    return state.dateTimeSetting;
});

export const startTrip = createSelector(selectMainState, (state) => {
    return state.startTrip;
});

export const lockScreen = createSelector(selectMainState, (state) => {
    return state.lockScreen;
});

export {
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
};
