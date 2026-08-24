import { StrNum, ConnectionStatus, ToggleCvStatus } from './types';
import { StartTripTypes } from './constants';

export interface IBusStop {
    Busid: string;
    Name: string;
}
export interface IFmsBusStop {
    Busid: string;
    Name: string;
    km?: number;
    aitp?: boolean;
    flag?: string;
    time?: string;
}

// use this for all bus stop
export interface IFareBusStop {
    Busid: string;
    Name: string;
    km?: string;
    flag?: string;
    misMatch?: boolean;
    manualBls?: boolean;
    autoBls?: boolean;
    isUpstage?: boolean;
    idx?: number; // Optional index for tracking position in lists
}

export interface CvIcons {
    id: number;
    activeIcon: string | null;
    timer: ReturnType<typeof setTimeout> | number | null;
    label: string | null;
    error: boolean;
    statuses: number[];
    message?: string;
}

export interface IUserInfoMain {
    busServiceNum?: string;
    plateNum?: string;
    spid?: string;
    dir?: StrNum;
    km?: string;
    variantName?: string;
    offRoute?: boolean;
}

export interface ICurrenNowDest {
    now?: string;
    dest?: string;
}

export interface ICurrentFareBusStop {
    current?: StrNum;
    prev?: StrNum;
    next?: StrNum;
}

export interface IDeviation {
    messageId?: string;
    currentBlock: string;
    isHeadway: boolean;
    minSec: string;
    bars: number;
    direction: string;
    color: string;
    busBehindOccupancy?: number;
    busBehindTime?: number;
}

export interface INextBusInfo {
    show: boolean;
    busBehindOccupancy: number;
    busBehindTime: number;
}

export interface ICvsStatus {
    doorNumber: number;
    status?: ConnectionStatus; // expected value connected | disconneted | no-tapping
    toggleCv?: ToggleCvStatus; // expected value entry | exit | entry-exit
    isFree?: boolean; // expected value true | false
}

export interface IBootUpError {
    criticalError?: string;
    error?: string;
}

// export interface IFareConsole {
//     deckType: string;
//     blsStatus: string;
//     time: string;
//     date: string;
//     busId: string;
//     complimentaryDays: number;
// }

export interface IBootUp {
    error?: IBootUpError;
    softwareVersion?: string;
    osVersion?: string;
    releaseDate?: string;
    serialNumber?: StrNum;
    busId?: string;
    service?: string;
}

export interface IOutOfService {
    title?: string;
    message?: string;
    action?: string;
    reason?: string;
    upgradeStatus?: string;
    cvUpgradeStatus?: number;
    noTapping?: boolean;
}

export interface IDagwOperation {
    msgID: number;
    title: string;
    message: string;
    fileName?: string;
    percentage?: number;
    status?: number;
    timeout?: number;
}

export interface IConnectionStatus {
    statusBTS?: boolean;
    statusBOLC?: boolean;
    statusFARE?: boolean;
    statusFMS?: boolean;
    statusCRP?: boolean;
}

export interface IStatusIndicators {
    label: string;
    connected: boolean | undefined;
    hidden: boolean;
}

export interface IServiceData {
    serviceNumber?: number;
    dir?: number;
    variantName?: string;
}

export interface ILoginOption {
    msgID?: number;
    status?: number;
    timeout?: number;
}

export interface ITapCardLogin {
    msgID?: number;
    msgSubID?: number;
    status?: number;
    message?: string;
    pin?: string;
    dutyNumber?: string;
    timeout?: number;
}

export interface IManualLogin extends ITapCardLogin {
    staffId?: string;
    timeout?: number;
}

export interface IEndTrip {
    msgID?: number;
    status?: number;
    title?: string;
    service: number;
    direction: number | string;
    variantName?: string;
    timeout?: number;
    firstBusStop: {
        Busid?: number;
        Name?: string;
    };
    lastBusStop: {
        Busid?: number;
        Name?: string;
    };
    busStopList?: {
        Busid: string;
        Name: string;
    }[];
    reasonList?: IEndTripReason[];
}

export interface IBreakDown {
    msgID?: number;
    status?: number;
    title?: string;
    message?: string;
    service: number;
    direction: number | string;
    timeout?: number;
    variantName?: string;
    firstBusStop: {
        Busid?: string;
        Name?: string;
    };
    lastBusStop: {
        Busid?: string;
        Name?: string;
    };
    busStopList?: {
        Busid: string;
        Name: string;
    }[];
    reasonList?: IEndTripReason[];
    hasError?: boolean;
}
export interface IEndTripReason {
    id: number;
    label: string;
}

export interface IDeckTypeList {
    id: number;
    label: string;
}

export interface IFareConsole {
    msgID?: number;
    status?: number;
    deckType: {
        id: number;
        label: string;
    };
    blsStatus?: number;
    fareBusStopMode?: number;
    time?: string;
    date?: string;
    dateTime?: string;
    busId: string;
    serviceProvider?: number;
    complimentaryDays: number;
    maximumcomplimentaryDays?: number;
    minDateTime?: string;
    deckTypeList?: IDeckTypeList[];
    percentage?: number;
    message: string;
    isSubmitted?: boolean;
    isDaftMode?: boolean;
}

export interface IStartTrip {
    msgID?: number;
    status?: number;
    type?: StartTripTypes;
    message?: string;
    dir?: number;
    variantName?: string;
    fms?: {
        serviceNumber?: number;
        dir?: number;
        variantName?: string;
        busStop?: IBusStop;
    };
    fare?: {
        serviceNumber?: number;
        dir?: number;
        variantName?: string;
        busStop?: IBusStop;
        serviceIndex?: number; // index of selected service in the services array
    };
    busStopList?: IBusStop[];
    services?: {
        serviceNumber: number;
        dir: number;
        variantName: string;
    }[];
}

export interface ILockScreen {
    msgID?: number;
    status?: number;
    message?: string;
    timeout?: number;
}

export interface IPopUpControl {
    show: boolean;
    message?: string;
    title?: string;
    disabled?: boolean;
    type?: 'success' | 'error' | 'warning' | 'info';
    delay?: number; // Optional delay in seconds
    timeout?: number; // Optional timeout in milliseconds
    disableTimeout?: boolean;
    closeMsgID?: number;
    fullScreen?: boolean;
}

export interface IFree {
    msgID?: number;
    status?: number;
    timeout?: number;
    freeMode: boolean;
}

export interface ICashValue {
    index: number;
    value: number;
}
export interface ICashPayment {
    msgID?: number;
    status?: number;
    message?: string;
    timeout?: number;
    adultValues?: ICashValue[];
    seniorValues?: ICashValue[];
    studentValues?: ICashValue[];
    type?: ECashType;
    cashIndex?: number;
    busStopList?: {
        Busid: string;
        Name: string;
        km: number;
    }[];
    fareResult?: {
        adultFare: number;
        seniorFare: number;
        studentFare: number;
        exitBusStop: {
            Busid: string;
            Name: string;
        };
        entryBusStop: {
            Busid: string;
            Name: string;
        };
    };
}

export enum ECashType {
    ADULT = 'ADULT',
    SENIOR = 'SENIOR',
    STUDENT = 'STUDENT',
}

export enum ECashMode {
    SINGLE = 'SINGLE',
    MULTIPLE = 'MULTIPLE',
    CALCULATOR = 'CALCULATOR',
}

export interface IRedeem {
    msgID?: number;
    status?: number;
    timeout?: number;
}

export interface IFrontDoor {
    msgID?: number;
    status?: number;
    timeout?: number;
    message?: string;
    cvList?: number[];
    cvNum?: number;
}

export enum MainButton {
    FREE = 'FREE',
    BREAKDOWN = 'BREAKDOWN',
    CASH = 'CASH',
    REDEEM = 'REDEEM',
    FRONT_DOOR = 'FRONT_DOOR',
    REAR_DOOR = 'REAR_DOOR',
}
