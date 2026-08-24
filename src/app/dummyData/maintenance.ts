import { MsgID, MsgSubID, ResponseStatus } from '@models';
import {
    flow,
    DECK_TYPE_LIST,
    OPERATOR_LIST,
    BUS_ID_INFO,
    REDETECT_CV_LIST,
    FARE_CONSOLE_CONFIG,
    EXTERNAL_DEVICES_ERROR_STATUS,
} from './dummy-fixtures';

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
    flow(17, 'Check App Upgrade - No New Version', {
        msgID: MsgID?.MAINTENANCE_APP_UPGRADE,
        msgSubID: MsgSubID?.RESPONSE,
        upgradeStatus: false,
    }),
    flow(17, 'Check App Upgrade - New Version Available', {
        msgID: MsgID?.MAINTENANCE_APP_UPGRADE,
        msgSubID: MsgSubID?.RESPONSE,
        upgradeStatus: true,
        version: 'BTE.A.01.00.99',
    }),
    flow(17, 'App Upgrade In Progress', {
        msgID: MsgID?.MAINTENANCE_UPGRADE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(17, 'App Upgrade In Done', {
        msgID: MsgID?.MAINTENANCE_UPGRADE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const maintenanceViewParameterFlows = [
    flow(17, 'Parameter List', {
        msgID: MsgID?.MAINTENANCE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        parameters,
    }),
    flow(17, 'Parameter List Loading', {
        msgID: MsgID?.MAINTENANCE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(17, 'Parameter List Error', {
        msgID: MsgID?.MAINTENANCE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'COMMS_ERROR_FULL',
    }),
    flow(17, 'Parameter List Empty', {
        msgID: MsgID?.MAINTENANCE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        parameters: [],
    }),
];

export const maintenanceFareConsoleFlows = [
    flow(16, 'Fare Console Configuration', {
        msgID: MsgID?.MAINTENANCE_FARE_CONSOLE,
        msgSubID: MsgSubID?.RESPONSE,
        ...FARE_CONSOLE_CONFIG,
    }),
    flow(16, 'Deck Type List', {
        msgID: MsgID?.MAINTENANCE_DECK_TYPE_LIST,
        msgSubID: MsgSubID?.RESPONSE,
        deckTypeList: DECK_TYPE_LIST,
    }),
    flow(29, 'Fare Bus Stop Mode - Select Mode Success', {
        msgID: MsgID?.FARE_BUS_STOP_MODE_SELECT,
        msgSubID: MsgSubID?.RESPONSE,
        timeout: 10000,
        status: ResponseStatus.SUCCESS,
        mode: 1,
    }),
    flow(29, 'Fare Bus Stop Mode - Success', {
        msgID: MsgID?.FARE_BUS_STOP_MODE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        mode: 1,
    }),
    flow(29, 'Fare Bus Stop Mode - Error', {
        msgID: MsgID?.FARE_BUS_STOP_MODE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        mode: 1,
    }),
    flow(15, 'Delete Parameter - Notify', {
        msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER_NOTIFY,
        msgSubID: MsgSubID?.NOTIFY,
    }),
    flow(16, 'Delete Parameters - In Progress', {
        msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        percentage: 50,
    }),
    flow(16, 'Delete Parameters Success', {
        msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(16, 'Maintenance Delete Parameters - Error', {
        msgID: MsgID?.MAINTENANCE_DELETE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'PLEASE_RETRY_AGAIN',
    }),
    flow(16, 'BusId information', {
        msgID: MsgID?.MAINTENANCE_BUS_ID,
        msgSubID: MsgSubID?.RESPONSE,
        ...BUS_ID_INFO,
    }),
    flow(16, 'Operator List', {
        msgID: MsgID?.MAINTENANCE_OPERATOR,
        msgSubID: MsgSubID?.RESPONSE,
        operators: OPERATOR_LIST,
    }),
];

export const maintenanceBlsCalibrateFlows = [
    flow(17, 'Manual Calibration - Notify', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL,
        activeFactor: 350,
        parameterFactor: 360,
    }),
    flow(17, 'Manual Calibration - Confirm Popup', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
        msgSubID: MsgSubID?.RESPONSE,
        newFactor: 12,
        timeout: 10000,
    }),
    flow(17, 'Manual Calibration - Success', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(17, 'Manual Calibration - Error', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
    }),
    flow(17, 'BLS Calibration - Notify', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION,
    }),
    flow(17, 'BLS Calibration - In Progress', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(17, 'BLS Calibration - Success', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(17, 'BLS Calibration Send Command to BLS - Success', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(17, 'BLS Calibration Submit Distance - Result', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE,
        msgSubID: MsgSubID?.RESPONSE,
        timeout: 10000,
    }),
    flow(17, 'BLS Calibration Confirm Distance', {
        msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_RESULT,
        msgSubID: MsgSubID?.RESPONSE,
        calculateFactor: 400,
    }),
];

export const maintenanceVersionInfoFlows = [
    flow(17, 'Version Info', {
        msgID: MsgID?.MAINTENANCE_VERSION_INFO,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        versionInfoList,
    }),
    flow(17, 'Version Info Loading', {
        msgID: MsgID?.MAINTENANCE_VERSION_INFO,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(17, 'Version Info Error', {
        msgID: MsgID?.MAINTENANCE_VERSION_INFO,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
    }),
];

export const maintenanceBLSInfoFlows = [
    flow(17, 'BLS Information', {
        msgID: MsgID?.MAINTENANCE_BLS_INFORMATION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        blsList,
    }),
    flow(17, 'BLS Information Loading', {
        msgID: MsgID?.MAINTENANCE_BLS_INFORMATION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(17, 'BLS Information Error', {
        msgID: MsgID?.MAINTENANCE_BLS_INFORMATION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
    }),
];

export const maintenanceRedectCVFlows = [
    flow(17, 'Redetect CV - In Progress', {
        msgID: MsgID?.MAINTENANCE_REDETECT_CV,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        percentage: Math.random() * 100,
    }),
    flow(17, 'Redetect CV - Success', {
        msgID: MsgID?.MAINTENANCE_REDETECT_CV,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        cvList: REDETECT_CV_LIST,
    }),
];

export const maintenanceLoadParameterFlows = [
    flow(17, 'Load Parameters - IN Progress', {
        msgID: MsgID?.MAINTENANCE_LOAD_PARAMETERS,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        percentage: Math.random() * 100,
    }),
    flow(17, 'Load Parameters  - Success', {
        msgID: MsgID?.MAINTENANCE_LOAD_PARAMETERS,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(17, 'Load Parameters  - Error', {
        msgID: MsgID?.MAINTENANCE_LOAD_PARAMETERS,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'SEP_PARAMETER_LOADING_FAILED',
    }),
];

export const maintenanceSaveTransactionFlows = [
    flow(17, 'Save Transaction - IN Progress', {
        msgID: MsgID?.MAINTENANCE_SAVE_TRANSACTION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        percentage: Math.random() * 100,
    }),
    flow(17, 'Save Transaction  - Success', {
        msgID: MsgID?.MAINTENANCE_SAVE_TRANSACTION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(17, 'Save Transaction  - Error', {
        msgID: MsgID?.MAINTENANCE_SAVE_TRANSACTION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'SAVE_TRANSACTION_FAILED',
    }),
];

export const maintenanceAuditRegistrationFlows = [
    flow(17, 'Audit Register - In Progress', {
        msgID: MsgID?.MAINTENANCE_AUDIT_REGISTRATION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(17, 'Audit Register - Success', {
        msgID: MsgID?.MAINTENANCE_AUDIT_REGISTRATION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        gcmSpidName: 'SBST',
        gcmSpidNumber: 32,
        ngcmSpidName: '',
        ngcmSpidNumber: 16,
        auditRegisterList: auditRegistrationList,
    }),
];

export const maintenanceExtDeviceFlows = [
    flow(18, 'External Devices Loading', {
        msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
        status: ResponseStatus.PROGRESS,
    }),
    flow(18, 'External Devices Success', {
        msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
        status: ResponseStatus.SUCCESS,
    }),
    flow(18, 'External Devices Success With Some Error Field', {
        msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
        ...EXTERNAL_DEVICES_ERROR_STATUS,
    }),
    flow(17, 'Test Print Error', {
        msgID: MsgID?.MAINTENANCE_TEST_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'OUT_OF_SERVICE',
    }),
    flow(17, 'Test Print Progress', {
        msgID: MsgID?.MAINTENANCE_TEST_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(17, 'Test Print Success', {
        msgID: MsgID?.MAINTENANCE_TEST_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const maintenanceDecommissioningFlows = [
    flow(17, 'Input Invalid Numbers', {
        msgID: MsgID?.DECOMMISSION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
    }),
    flow(17, 'Input Digit Numbers Success', {
        msgID: MsgID?.DECOMMISSION,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];
