import { MsgID, MsgSubID, ResponseStatus } from '@models';

export const parameters = Array.from({ length: 20 }, (_, idx) => ({
    fullName: `Cash Fare parameter ${idx * 1000 + 1}`,
    version: (idx * 100 + 234).toString(),
    date: '25/03/2025',
    time: '12:00:00',
    status: idx % 2 ? 'active' : 'inactive',
}));

export const versionInfoList = [
    { device: 'BFC', software: 'BFC.A.05.22.00', readerFirmware: '' },
    { device: 'BEV1', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BEV2', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV1', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV2', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV3', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV4', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV5', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV6', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV7', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
    { device: 'BXV8', software: 'BFC.A.05.22.00', readerFirmware: 'CTR.A.06.08.01' },
];

export const blsList = [
    { name: 'BLS_VER', value: '01.79.07' },
    { name: 'LONGITUDE', value: '0000000000' },
    { name: 'LATITUDE', value: '0000000000' },
    { name: 'CALIBRATOR_FACTOR', value: '457' },
    { name: 'ODOMETER_READING', value: '11132m' },
    { name: 'GNSS_ANTENNA', value: 'FAULT' },
    { name: 'NO_OF_DOORS', value: '2' },
    { name: 'FIX', value: '2D' },
    { name: 'SIGNAL_QUALITY', value: 'Advanced GPS' },
    { name: 'NO_OF_SATELLITE', value: '8' },
];

export const auditRegistrationList = [
    { name: 'NUMBER_OF_CASH_TXN', gcmValue: 8, ngcmValue: 0 },
    { name: 'TOTAL_CASH', gcmValue: 1, ngcmValue: 0 },
    { name: 'NUMBER_OF_BUS_TRIPS', gcmValue: 0, ngcmValue: 0 },
    { name: 'NUMBER_OF_BUS_BREAKDOWN', gcmValue: 2, ngcmValue: 0 },
    { name: 'OUT_OF_SERVICES', gcmValue: 0, ngcmValue: 0 },
    { name: 'NUMBER_OF_CLOCK_DRIFT', gcmValue: 0, ngcmValue: 0 },
    { name: 'NUMBER_OF_STORAGE_FULL', gcmValue: 0, ngcmValue: 0 },
];

export const fareConsole = {
    deckType: 'SINGLE',
    fareBusStopMode: 2,
    time: '12:00:00',
    date: '09/09/2024',
    busId: 'SBS4567',
    complimentaryDays: 30,
    maximumcomplimentaryDays: 50,
    minDateTime: '2024-09-09T12:00:00+08:00',
};

export const deckTypeList = [
    { id: 1, name: 'SINGLE' },
    { id: 2, name: 'DOUBLE_TWO_DOORS' },
    { id: 3, name: 'DOUBLE_THREE_DOORS' },
    { id: 4, name: 'LONG_BUS' },
    { id: 5, name: '1 BCV' },
];

export const maintenanceAppUpgradeFlows = [
    {
        id: 17,
        label: 'Check App Upgrade - No New Version',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_APP_UPGRADE,
            msgSubID: MsgSubID?.RESPONSE,
            upgradeStatus: false,
        },
    },
    {
        id: 17,
        label: 'Check App Upgrade - New Version Available',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_APP_UPGRADE,
            msgSubID: MsgSubID?.RESPONSE,
            upgradeStatus: true,
            version: 'BTE.A.01.00.99',
        },
    },
    {
        id: 17,
        label: 'App Upgrade In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_UPGRADE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 17,
        label: 'App Upgrade In Done',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_UPGRADE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const maintenanceViewParameterFlows = [
    {
        id: 17,
        label: 'Parameter List',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            parameters,
        },
    },
    {
        id: 17,
        label: 'Parameter List Loading',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 17,
        label: 'Parameter List Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'COMMS_ERROR_FULL',
        },
    },
    {
        id: 17,
        label: 'Parameter List Empty',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            parameters: [],
        },
    },
];

export const maintenanceFareConsoleFlows = [
    {
        id: 16,
        label: 'Fare Console Configuration',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_FARE_CONSOLE,
            msgSubID: MsgSubID?.RESPONSE,
            deckType: {
                id: 1,
                label: 'Single',
            }, // if options of this is dynamic we use the deck type Id number if not we use the string label name
            fareBusStopMode: 2,
            dateTime: '2025-01-05T12:45:50+08:00',
            busId: 'SBS4567',
            serviceProvider: 16,
            complimentaryDays: 30,
            maximumcomplimentaryDays: 50,
            minDateTime: '2024-09-09T12:00:00+08:00',
        },
    },

    {
        id: 16,
        label: 'Deck Type List',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_DECK_TYPE_LIST,
            msgSubID: MsgSubID?.RESPONSE,
            deckTypeList: [
                { id: 1, label: 'SINGLE' },
                { id: 2, label: 'DOUBLE_TWO_DOORS' },
                { id: 3, label: 'DOUBLE_THREE_DOORS' },
                { id: 4, label: 'LONG_BUS' },
                { id: 5, label: '1 BCV' },
            ],
        },
    },
    {
        id: 29,
        label: 'Fare Bus Stop Mode - Select Mode Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_BUS_STOP_MODE_SELECT,
            msgSubID: MsgSubID?.RESPONSE,
            timeout: 10000,
            status: ResponseStatus.SUCCESS,
            mode: 1,
        },
    },
    {
        id: 29,
        label: 'Fare Bus Stop Mode - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_BUS_STOP_MODE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            mode: 1,
        },
    },
    {
        id: 29,
        label: 'Fare Bus Stop Mode - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_BUS_STOP_MODE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            mode: 1,
        },
    },
    {
        id: 15,
        label: 'Delete Parameter - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER_NOTIFY,
            msgSubID: MsgSubID?.NOTIFY,
        },
    },
    {
        id: 16,
        label: 'Delete Parameters - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            percentage: 50,
        },
    },
    {
        id: 16,
        label: 'Delete Parameters Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 16,
        label: 'Maintenance Delete Parameters - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'PLEASE_RETRY_AGAIN',
        },
    },
    {
        id: 16,
        label: 'BusId information',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_BUS_ID,
            msgSubID: MsgSubID?.RESPONSE,
            busId: 'SBS4567',
            operator: {
                id: 1,
                label: 'SBST',
                serviceProvider: 16,
            },
        },
    },
    {
        id: 16,
        label: 'Operator List',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_OPERATOR,
            msgSubID: MsgSubID?.RESPONSE,
            operators: [
                { id: 1, label: 'SBST', serviceProvider: 16 },
                { id: 2, label: 'SMRT', serviceProvider: 17 },
                { id: 3, label: 'LTAB', serviceProvider: 25 },
                { id: 4, label: 'BDBO', serviceProvider: 26 },
                { id: 5, label: 'LDBO', serviceProvider: 27 },
                { id: 6, label: 'MDBO', serviceProvider: 10 },
            ],
        },
    },
    // {
    //     id: 16,
    //     label: 'Submit Bus ID Success',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.MAINTENANCE_BUS_ID_SUBMIT,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.SUCCESS,
    //     },
    // },
    // {
    //     id: 16,
    //     label: 'Submit Bus ID Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.MAINTENANCE_BUS_ID_SUBMIT,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //         message: 'PLEASE_RETRY_AGAIN',
    //     },
    // },
];

export const maintenanceBlsCalibrateFlows = [
    {
        id: 17,
        label: 'Manual Calibration - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL,
            activeFactor: 350,
            parameterFactor: 360,
        },
    },
    {
        id: 17,
        label: 'Manual Calibration - Confirm Popup',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
            msgSubID: MsgSubID?.RESPONSE,
            newFactor: 12,
            timeout: 10000,
        },
    },
    {
        id: 17,
        label: 'Manual Calibration - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 17,
        label: 'Manual Calibration - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            // message: 'FAILED_TO_CALIBRATE_BLS',
        },
    },

    {
        id: 17,
        label: 'BLS Calibration - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION,
        },
    },
    {
        id: 17,
        label: 'BLS Calibration - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 17,
        label: 'BLS Calibration - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 17,
        label: 'BLS Calibration Send Command to BLS - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 17,
        label: 'BLS Calibration Submit Distance - Result',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE,
            msgSubID: MsgSubID?.RESPONSE,
            timeout: 10000,
        },
    },
    {
        id: 17,
        label: 'BLS Calibration Confirm Distance',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_RESULT,
            msgSubID: MsgSubID?.RESPONSE,
            calculateFactor: 400,
        },
    },
];

export const maintenanceVersionInfoFlows = [
    {
        id: 17,
        label: 'Version Info',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_VERSION_INFO,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            versionInfoList,
        },
    },
    {
        id: 17,
        label: 'Version Info Loading',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_VERSION_INFO,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 17,
        label: 'Version Info Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_VERSION_INFO,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
        },
    },
];

export const maintenanceBLSInfoFlows = [
    {
        id: 17,
        label: 'BLS Information',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_BLS_INFORMATION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            blsList,
        },
    },
    {
        id: 17,
        label: 'BLS Information Loading',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_BLS_INFORMATION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 17,
        label: 'BLS Information Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_BLS_INFORMATION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
        },
    },
];

export const maintenanceRedectCVFlows = [
    {
        id: 17,
        label: 'Redetect CV - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_REDETECT_CV,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            percentage: Math.random() * 100,
        },
    },
    {
        id: 17,
        label: 'Redetect CV - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_REDETECT_CV,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            cvList: [
                { cvNum: 1, status: 'INSTALLED', position: 'FRONT' },
                { cvNum: 2, status: 'NOT_INSTALLED', position: 'FRONT' },
                { cvNum: 3, status: 'NOT_INSTALLED', position: 'REAR_1' },
                { cvNum: 4, status: 'NOT_INSTALLED', position: 'REAR_1' },
                { cvNum: 5, status: 'NOT_INSTALLED', position: 'REAR_2' },
                { cvNum: 6, status: 'NOT_INSTALLED', position: 'REAR_2' },
            ],
        },
    },
];

export const maintenanceLoadParameterFlows = [
    {
        id: 17,
        label: 'Load Parameters - IN Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_LOAD_PARAMETERS,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            percentage: Math.random() * 100,
        },
    },
    {
        id: 17,
        label: 'Load Parameters  - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_LOAD_PARAMETERS,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 17,
        label: 'Load Parameters  - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_LOAD_PARAMETERS,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'SEP_PARAMETER_LOADING_FAILED',
        },
    },
];

export const maintenanceSaveTransactionFlows = [
    {
        id: 17,
        label: 'Save Transaction - IN Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_SAVE_TRANSACTION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            percentage: Math.random() * 100,
        },
    },
    {
        id: 17,
        label: 'Save Transaction  - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_SAVE_TRANSACTION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 17,
        label: 'Save Transaction  - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_SAVE_TRANSACTION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'SAVE_TRANSACTION_FAILED',
        },
    },
];

export const maintenanceAuditRegistrationFlows = [
    {
        id: 17,
        label: 'Audit Register - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_AUDIT_REGISTRATION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 17,
        label: 'Audit Register - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_AUDIT_REGISTRATION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            gcmSpidName: 'SBST',
            gcmSpidNumber: 32,
            ngcmSpidName: '',
            ngcmSpidNumber: 16,
            auditRegisterList: [
                { name: 'NUMBER_OF_CASH_TXN', gcmValue: 8, ngcmValue: 0 },
                { name: 'TOTAL_CASH', gcmValue: 1, ngcmValue: 0 },
                { name: 'NUMBER_OF_BUS_TRIPS', gcmValue: 0, ngcmValue: 0 },
                { name: 'NUMBER_OF_BUS_BREAKDOWN', gcmValue: 2, ngcmValue: 0 },
                { name: 'OUT_OF_SERVICES', gcmValue: 0, ngcmValue: 0 },
                { name: 'NUMBER_OF_CLOCK_DRIFT', gcmValue: 0, ngcmValue: 0 },
                { name: 'NUMBER_OF_STORAGE_FULL', gcmValue: 0, ngcmValue: 0 },
            ],
        },
    },
];

export const maintenanceExtDeviceFlows = [
    {
        id: 18,
        label: 'External Devices Loading',
        isLatest: true,
        data: {
            msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 18,
        label: 'External Devices Success',
        isLatest: true,
        data: {
            msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 18,
        label: 'External Devices Success With Some Error Field',
        isLatest: true,
        data: {
            msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
            status: ResponseStatus.ERROR,
            testPrinter: {
                status: ResponseStatus.ERROR,
                message: 'OUT_OF_SERVICE',
            },
            printer: {
                status: ResponseStatus.ERROR,
                message: 'DOOR_OPEN',
            },
            GNSSAntenna: {
                status: ResponseStatus.SUCCESS,
            },
            busETA: {
                status: ResponseStatus.SUCCESS,
            },
            cv1: {
                status: ResponseStatus.SUCCESS,
            },
            cv2: {
                status: ResponseStatus.ERROR,
                message: 'FAULTY',
            },
            cv3: {
                status: ResponseStatus.ERROR,
                message: 'FAULTY',
            },
            cv4: {
                status: ResponseStatus.SUCCESS,
            },
            cv5: {
                status: ResponseStatus.SUCCESS,
            },
            cv6: {
                status: ResponseStatus.SUCCESS,
            },
        },
    },
    {
        id: 17,
        label: 'Test Print Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'OUT_OF_SERVICE',
        },
    },
    {
        id: 17,
        label: 'Test Print Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 17,
        label: 'Test Print Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const maintenanceDecommissioningFlows = [
    {
        id: 17,
        label: 'Input Invalid Numbers',
        isLatest: true,
        data: {
            msgID: MsgID?.DECOMMISSION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
        },
    },
    {
        id: 17,
        label: 'Input Digit Numbers Success',
        isLatest: true,
        data: {
            msgID: MsgID?.DECOMMISSION,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];
