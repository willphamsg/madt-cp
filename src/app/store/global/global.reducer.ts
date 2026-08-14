import { createReducer, on, createSelector } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { IAuth, IConnectionStatus, IGlobalError, IAudioVolume, IPosnStatus } from '@models';
import {
    updateAuth,
    updateLoading,
    updateIsOnTrip,
    updateConnectionStatus,
    updateGlobalError,
    updateAudioVolume,
    updateLocationMode,
    updatePosnStatus,
} from './global.action';

export interface GlobalState {
    isLoading: boolean;
    auth: IAuth;
    isOnTrip: boolean;
    connection: IConnectionStatus;
    globalError: IGlobalError;
    audioVolume: IAudioVolume;
    locationMode: number;
    posnStatus?: IPosnStatus;
}

export const initialGlobalState: GlobalState = {
    isLoading: true,
    auth: {
        isLoggedIn: false,
    },
    isOnTrip: false,
    connection: {
        statusBTS: false,
        statusBOLC: false,
        statusFARE: true,
        statusFMS: false,
        statusCRP: false,
    },
    globalError: {
        code: '',
        message: '',
    },
    audioVolume: { value: 100 },
    locationMode: 0,
    posnStatus: undefined,
};

export const globalReducer = createReducer(
    initialGlobalState,

    on(updateLoading, (state, { payload }) => {
        return {
            ...state,
            isLoading: payload,
        };
    }),
    on(updateAuth, (state, { payload }) => {
        return {
            ...state,
            auth: {
                ...payload,
            },
        };
    }),
    on(updateIsOnTrip, (state, { payload }) => {
        return {
            ...state,
            isOnTrip: payload,
        };
    }),
    on(updateConnectionStatus, (state, { payload }) => {
        return {
            ...state,
            connection: { ...state.connection, ...payload },
        };
    }),
    on(updateGlobalError, (state, { payload }) => {
        return {
            ...state,
            globalError: {
                ...payload,
            },
        };
    }),
    on(updateAudioVolume, (state, { payload }) => {
        return {
            ...state,
            audioVolume: {
                value: payload.value,
            },
        };
    }),
    on(updateLocationMode, (state, { payload }) => {
        return {
            ...state,
            locationMode: payload,
        };
    }),
    on(updatePosnStatus, (state, { payload }) => {
        return {
            ...state,
            posnStatus: {
                ...payload,
            },
        };
    }),
);

export const selectGlobalState = (state: AppState) => state.global;

export const isLoading = createSelector(selectGlobalState, (state) => {
    return state.isLoading;
});

export const auth = createSelector(selectGlobalState, (state) => {
    return state.auth;
});

export const isOnTrip = createSelector(selectGlobalState, (state) => {
    return state.isOnTrip;
});

export const allConnectionStatus = createSelector(selectGlobalState, (state) => {
    return state.connection;
});

export const globalError = createSelector(selectGlobalState, (state) => {
    return state.globalError;
});

export const audioVolume = createSelector(selectGlobalState, (state) => {
    return state.audioVolume;
});

export const locationMode = createSelector(selectGlobalState, (state) => {
    return state.locationMode;
});

export const posnStatus = createSelector(selectGlobalState, (state) => {
    return state.posnStatus;
});

export {
    updateAuth,
    updateLoading,
    updateIsOnTrip,
    updateConnectionStatus,
    updateGlobalError,
    updateAudioVolume,
    updateLocationMode,
    updatePosnStatus,
} from './global.action';
