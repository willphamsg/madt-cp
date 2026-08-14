export const maintenanceDataType = {
    VEW_PARAMETER: 'view_parameter',
    VERSION_INFO: 'version_info',
    BLS_INFORMATION: 'bls_information',
    DISPLAY_AUDIT: 'display_audit',
    FARE_CONSOLE: 'current_setting',
    DECK_TYPE_LIST: 'deck_type_list',
} as const;

export interface IParameter {
    fullName: string;
    version: string;
    date: string;
    time: string;
    status: string;
}

export interface IVersionInfoItem {
    device: string;
    software: string;
    readerFirmware: string;
}

export interface IVersionInfo {
    msgID?: number;
    status?: number;
    message?: string;
    versionInfoList: IVersionInfoItem[];
}

export interface IBlsInformationItem {
    name: string;
    value: string;
}

export interface IBlsInformation {
    msgID?: number;
    status?: number;
    message?: string;
    blsList: IBlsInformationItem[];
}

export interface IDisplayAudit {
    name: string;
    gcmValue: number;
    ngcmValue: number;
}

export interface IAuditRegistration {
    msgID?: number;
    status?: number;
    message?: string;
    gcmSpidName?: string;
    gcmSpidNumber?: string;
    ngcmSpidName?: string;
    ngcmSpidNumber?: string;
    auditRegisterList?: IDisplayAudit[];
}

export interface IManualCalibrateBls {
    msgID?: number;
    status?: number;
    message?: string;
    activeFactor?: number;
    parameterFactor?: number;
    newFactor?: number;
    timeout?: number;
}

export interface IBlsCalibration {
    msgID?: number;
    status?: number;
    message?: string;
    distance?: number;
    calculateFactor?: number;
    timeout?: number;
}

// export interface IFareConsole {
//     deckType: string;
//     blsStatus: string;
//     time: string;
//     date: string;
//     busId: string;
//     complimentaryDays: number;
// }

export interface IDeckTypeListItem {
    id: number;
    label: string;
}

export interface IOperator {
    id?: number;
    label?: string;
    serviceProvider: number;
}
export interface IBusID {
    msgID?: number;
    status?: number;
    message?: string;
    busId: string;
    operator?: IOperator;
    operators?: IOperator[];
}

export interface IDevice {
    status: number;
    message?: string;
}

export interface IExternalDevice {
    msgID?: number;
    status?: number;
    message?: string;
    testPrinter?: IDevice;
    printer?: IDevice;
    GNSSAntenna?: IDevice;
    busETA?: IDevice;
    cv1?: IDevice;
    cv2?: IDevice;
    cv3?: IDevice;
    cv4?: IDevice;
    cv5?: IDevice;
    cv6?: IDevice;
}

export interface IViewParameter {
    msgID?: number;
    status?: number;
    message?: string;
    parameters: IParameter[];
}

export interface ILanguage {
    language: string;
}

export interface IDateTime {
    dateTime: string;
    minDateTime?: string;
    status?: number;
    message?: string;
}

export interface IAppUpgrade {
    msgID?: number;
    status?: number;
    message?: string;
    upgradeStatus?: boolean;
    version?: string;
}

export interface IDeCommission {
    msgID?: number;
    status?: number;
    message?: string;
}

export interface IRedetectCVItem {
    cvNum: number;
    status: string;
    position: string;
}
export interface IRedetectCV {
    msgID?: number;
    status?: number;
    message?: string;
    percentage?: number;
    cvList?: IRedetectCVItem[];
}

export interface ILoadParameter {
    msgID?: number;
    status?: number;
    message?: string;
    percentage?: number;
}

export interface ISaveTransaction {
    msgID?: number;
    status?: number;
    message?: string;
    percentage?: number;
}
