import { createAction, props } from '@ngrx/store';
import {
    IFmsBusStop,
    IFareBusStop,
    IUserInfoMain,
    ICurrenNowDest,
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
    ILanguage,
    IStartTrip,
    ILockScreen,
    IFree,
    ICashPayment,
    IRedeem,
    IFrontDoor,
    IDateTime,
} from '@models';

export const updateDisplayFareBusStopList = createAction(
    '[Data] Update Display Fare Bus Stop List',
    props<{ payload: boolean }>(),
);

export const updateCurrentFareBusStop = createAction(
    '[Data] Update Current Fare Bus Stop',
    props<{ payload: string; manualBls?: boolean; autoBls?: boolean; misMatch?: boolean; idx?: number }>(),
);
export const selectBusStop = createAction('[Data] Select Bus Stop', props<{ payload: IFmsBusStop | null }>());
export const selectBusStopForFare = createAction('[Data] Select Bus Stop For Fare', props<{ payload: string }>());
export const updateActiveCVs = createAction('[Data] Active CVs', props<{ payload: number[] }>());
export const updateFreeCVs = createAction('[Data] Update Free CVs', props<{ payload: IFree }>());
// Action to update the bus stop list
export const updateBusStopList = createAction(
    '[Data] Update Bus Stop List',
    props<{ busStopList?: IFmsBusStop[]; fareBusStopList?: IFareBusStop[] }>(),
);
// Action to update the userInfo
export const updateUserInfo = createAction('[Data] Update User Info', props<{ userInfo: IUserInfoMain }>());

export const updateCurrentNowDest = createAction(
    '[Data] Update Current now or dest',
    props<{ payload: ICurrenNowDest }>(),
);

export const updateDeviation = createAction('[Data] Update deviation', props<{ payload: IDeviation }>());
export const updateNextBusInfo = createAction('[Data] Update Next bus info', props<{ payload: INextBusInfo }>());

export const updateCvsIconsStatus = createAction('[Data] Update CVs icon status', props<{ payload: ICvsStatus[] }>());

export const updateBootUp = createAction('[Data] Update Boot up info', props<{ payload: IBootUp }>());
// export const updateFareConsole = createAction('[Data] Update Fare Console info', props<{ payload: IFareConsole }>());

export const updateOutOfService = createAction(
    '[Data] Update Out of service error message',
    props<{ payload: IOutOfService }>(),
);

export const updateCvUpgradeStatus = createAction('[Data] Update CV update status', props<{ payload: number }>());

export const updateDagwOperation = createAction(
    '[Data] Update DAGW Operation info',
    props<{ payload: IDagwOperation }>(),
);

export const updateLoginOption = createAction('[Data] Update  Login Option info', props<{ payload: ILoginOption }>());

export const updateTapCardLogin = createAction(
    '[Data] Update  Tap Card Login info',
    props<{ payload: ITapCardLogin; msgID?: number }>(),
);

export const updateManualLogin = createAction(
    '[Data] Update Manual Login info',
    props<{ payload: IManualLogin; msgID?: number }>(),
);

export const updateEndTripInfo = createAction(
    '[Data] Update End Trip info',
    props<{ payload: IEndTrip; msgID?: number }>(),
);

export const updateBreakDownInfo = createAction(
    '[Data] Update Break Down info',
    props<{ payload: IBreakDown; msgID?: number }>(),
);

export const updateCashPayment = createAction('[Data] Update cash', props<{ payload: ICashPayment }>());

export const updateRedeem = createAction('[Data] Update redeem', props<{ payload: IRedeem }>());

export const updateFrontDoor = createAction('[Data] Update front doors', props<{ payload: IFrontDoor }>());

export const updateFareConsole = createAction(
    '[Data] Update Fare Console info',
    props<{ payload: IFareConsole; msgID?: number }>(),
);

export const updateCommissionBusIdInformation = createAction(
    '[Data] Update Bus ID Setting',
    props<{ payload: IBusID; msgID?: number }>(),
);

export const updateExternalDevices = createAction(
    '[Data] updateExternalDevices Setting',
    props<{ payload: IExternalDevice; msgID?: number }>(),
);

export const updateTestPrinter = createAction(
    '[Data] Update updateTestPrinter ID Setting',
    props<{ payload: any; msgID?: number }>(),
);

export const updateLanguage = createAction(
    '[Data] Update Language Setting',
    props<{ payload: ILanguage; msgID?: number }>(),
);

export const updateStartTrip = createAction(
    '[Data] Update Start Trip info',
    props<{ payload: IStartTrip; msgID?: number }>(),
);

export const updateLockScreen = createAction('[Data] Update Lock Screen', props<{ payload: ILockScreen }>());

export const updateDateTimeSetting = createAction(
    '[Data] Update Date Time Setting',
    props<{ payload: IDateTime; msgID?: number }>(),
);
