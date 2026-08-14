export interface IFareCVStatus {
    cvNum: number;
    status: number;
    subStatus?: number;
}

export interface IShowCVStatus {
    status?: number;
    message?: string;
    cvStatus: IFareCVStatus[];
}

export interface ICVModeControl {
    status?: number;
    message?: string;
    msgID?: number;
    timeout?: number;
    cvMode?: number;
}

export interface ICVPowerControl {
    status?: number;
    message?: string;
    groups: {
        id: number;
        cvs: string[];
        status: boolean;
    }[];
}

export interface ICVEntryExitControl {
    status?: number;
    message?: string;
    cvType: number;
}

export interface IPrintStatus {
    msgID?: number;
    message?: string;
    status?: number;
    printerStatus?: number;
}

export interface ICancelRide {
    msgID?: number;
    message?: string;
    status?: number;
    timeout?: number;
}

export interface IConcession {
    msgID?: number;
    message?: string;
    status?: number;
    timeout?: number;
    title?: string;
}

export interface IFareBusStopMode {
    msgID?: number;
    message?: string;
    status?: number;
    mode?: number;
    timeout?: number;
}

export interface ITopUp {
    msgID?: number;
    message?: string;
    status?: number;
    mode?: number;
    timeout?: number;
    amounts?: number[];
    amount?: number;
}

export interface ITransaction {
    msgID?: number;
    status?: number;
    timeout?: number;
    message?: string;
    cvNum?: number;
    cvList?: number[];
    cardValue?: number;
    transactions?: { date: string; value: number | string }[];
}

export interface IRetentionTicket {
    msgID?: number;
    status?: number;
    timeout?: number;
    message?: string;
    cvList?: number[];
    cvNum?: number;
    cardDetail?: {
        id: string;
        value: number;
    };
}

export interface IPowerAllCvOnOff {
    msgID?: number;
    message?: string;
    status?: number;
    timeout?: number;
}

export interface IResetAllCv {
    msgID?: number;
    message?: string;
    status?: number;
    timeout?: number;
}
export interface IPrinterStatus {
    msgID?: number;
    message?: string;
    status?: number;
    timeout?: number;
}
