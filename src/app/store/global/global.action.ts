import { createAction, props } from '@ngrx/store';
import { IAudioVolume, IAuth, IConnectionStatus, IGlobalError, IPosnStatus } from '@models';

export const updateLoading = createAction('[Data] Update Loading', props<{ payload: boolean }>());
export const updateAuth = createAction('[Data] Update auth', props<{ payload: IAuth; msgID?: number }>());
export const updateIsOnTrip = createAction('[Data] Update On Trip status', props<{ payload: boolean }>());

export const updateConnectionStatus = createAction(
    '[Update] connection status',
    props<{ payload: IConnectionStatus }>(),
);

export const updateGlobalError = createAction('[Global] Update Global Error', props<{ payload: IGlobalError }>());

export const updateAudioVolume = createAction('[Settings] Update Audio Volume', props<{ payload: IAudioVolume }>());

export const updateLocationMode = createAction('[Settings] Update Location Mode', props<{ payload: number }>());

export const updatePosnStatus = createAction('[Settings] Update Posn Status', props<{ payload: IPosnStatus }>());
