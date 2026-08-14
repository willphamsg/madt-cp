import { createAction, props } from '@ngrx/store';
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

export const updateShowCVStatus = createAction(
    '[Data] Update Fare CV Status Setting',
    props<{ payload: IShowCVStatus }>(),
);

export const updateCVModeControl = createAction(
    '[Data] Update CV Mode Control Setting',
    props<{ payload: ICVModeControl; msgID?: number }>(),
);

export const updateCVPowerControl = createAction(
    '[Data] Update CV Power Control Setting',
    props<{ payload: ICVPowerControl; msgID?: number }>(),
);

export const updateCVEntryExit = createAction(
    '[Data] Update CV Entry/Exit Control Setting',
    props<{ payload: ICVEntryExitControl; msgID?: number }>(),
);

export const updateRetentionTicket = createAction(
    '[Data] Update Retention ticket ',
    props<{ payload: IRetentionTicket }>(),
);

export const updatePrintStatus = createAction(
    '[Data] Update print status ticket ',
    props<{ payload: IPrintStatus; msgID?: number }>(),
);

export const updateCancelRide = createAction(
    '[Data] Update Cancel Ride',
    props<{ payload: ICancelRide; msgID?: number }>(),
);

export const updateConcession = createAction(
    '[Data] Update Concession',
    props<{ payload: IConcession; msgID?: number }>(),
);

export const updateFareBusStopMode = createAction(
    '[Data] Update Fare Bus Stop Mode',
    props<{ payload: IFareBusStopMode; msgID?: number }>(),
);

export const updateFareExternalDevices = createAction(
    '[Data] updateFareExternalDevices Setting',
    props<{ payload: IExternalDevice; msgID?: number }>(),
);

export const updateTestPrinter = createAction(
    '[Data] Update updateFareTestPrinter ID Setting',
    props<{ payload: any; msgID?: number }>(),
);

export const updateTopUp = createAction('[Data] Update Top Up', props<{ payload: ITopUp; msgID?: number }>());

export const updateTransaction = createAction('[Data] Update Transaction', props<{ payload: ITransaction }>());

export const updatePowerCvOnOff = createAction('[Data] Update Power All CV', props<{ payload: IPowerAllCvOnOff }>());

export const updateResetAllCV = createAction('[Data] Update Reset All CV', props<{ payload: IResetAllCv }>());

export const updatePrinterStatus = createAction('[Data] Update Printer Status', props<{ payload: IPrinterStatus }>());
