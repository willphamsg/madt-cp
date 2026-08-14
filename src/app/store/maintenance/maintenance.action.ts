import { createAction, props } from '@ngrx/store';
import {
    IFareConsole,
    IBusID,
    IExternalDevice,
    IViewParameter,
    IAppUpgrade,
    IVersionInfo,
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

export const updateFareConsole = createAction(
    '[Data] Update Fare Console Setting',
    props<{ payload: IFareConsole; msgID?: number }>(),
);

export const updateBusIdInformation = createAction(
    '[Data] Update Bus ID Setting',
    props<{ payload: IBusID; msgID?: number }>(),
);

export const updateExternalDevices = createAction(
    '[Data] Update Bus ID Setting',
    props<{ payload: IExternalDevice }>(),
);

export const updateTestPrinter = createAction(
    '[Data] Update updateTestPrinter ID Setting',
    props<{ payload: any; msgID?: number }>(),
);

export const updateViewParameter = createAction('[Data] Update ViewParameter', props<{ payload: IViewParameter }>());
export const updateVersionInfo = createAction('[Data] Update Version Info', props<{ payload: IVersionInfo }>());
export const updateBlsInformation = createAction(
    '[Data] Update BLS Information',
    props<{ payload: IBlsInformation }>(),
);

export const updateAppUpgrade = createAction('[Data] Update Application Upgrade', props<{ payload: IAppUpgrade }>());
export const updateDecommission = createAction('[Data] Update Decommission', props<{ payload: IDeCommission }>());

export const updateTCDateTime = createAction('[Data] Update TC Date Time', props<{ payload: Date }>());

export const updateRedetectCV = createAction('[Data] Update Redetect CV', props<{ payload: IRedetectCV }>());
export const updateLoadParameter = createAction('[Data] Update Load Parameter', props<{ payload: ILoadParameter }>());
export const updateSaveTransaction = createAction(
    '[Data] Update Save Transaction',
    props<{ payload: ISaveTransaction }>(),
);
export const updateAuditRegistration = createAction(
    '[Data] Update Audit Registration',
    props<{ payload: IAuditRegistration }>(),
);
export const updateManualCalibrateBls = createAction(
    '[Data] Update Manual Calibrate BLS',
    props<{ payload: IManualCalibrateBls }>(),
);
export const updateBlsCalibration = createAction('[Data] Update Calibrate BLS', props<{ payload: IBlsCalibration }>());

export const updateFareBusStopMode = createAction(
    '[Data] Update Fare Bus Stop Mode',
    props<{ payload: IFareBusStopMode; msgID?: number }>(),
);
