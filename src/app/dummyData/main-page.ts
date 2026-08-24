import { AuthStatus, MsgID, MsgSubID, ResponseStatus } from '@models';
import {
    flow,
    BISHAN_BUS_STOP_LIST,
    SEMBAWANG_KM_BUS_STOP_LIST,
    EXTERNAL_DEVICES_ERROR_STATUS,
    SAMPLE_TRIP_DETAIL,
    BREAKDOWN_REASON_LIST,
    CASH_FARE_VALUES,
    SAMPLE_SERVICE_LIST,
    DECK_TYPE_LIST,
    OPERATOR_LIST,
    BUS_ID_INFO,
} from './dummy-fixtures';

export default {
    busServiceNum: '103',
    plateNum: 'SBS3327',
    spid: 'LDBO(27)',
    dir: 2,
    km: '30.5',
    variantName: 'M',
    fmsBusStopList: [
        {
            Busid: '57059',
            Name: 'Opp Sembawang Air Base',
            time: '09:39',
            flag: 'now',
            aitp: true,
        },
        {
            Busid: '57051',
            Name: 'Sembawang MRT Station Exit A',
            time: '09:42',
            flag: 'next',
        },
        {
            Busid: '57041',
            Name: 'Sembawang Way Blk 404',
            time: '09:44',
        },
        {
            Busid: '57031',
            Name: 'Sembawang Crescent Blk 115',
            time: '09:46',
        },
        {
            Busid: '57021',
            Name: 'Sembawang Road Blk 241',
            time: '09:48',
        },
        {
            Busid: '57011',
            Name: 'Opp Sembawang Park',
            time: '09:50',
        },
        {
            Busid: '57001',
            Name: 'Sembawang Park',
            time: '09:53',
        },
        {
            Busid: '56981',
            Name: 'Sembawang Road Blk 435',
            time: '09:58',
        },
        {
            Busid: '56971',
            Name: 'Opp Sembawang Hill Park',
            time: '10:00',
        },
        {
            Busid: '56961',
            Name: 'Sembawang Hill Park',
            time: '10:02',
        },
    ],
    fareBusStopList: [
        {
            Busid: '57059',
            Name: 'Opp Sembawang Air Base',
            km: '1.2',
            flag: 'disabled',
        },
        {
            Busid: '57051',
            Name: 'Sembawang MRT Station Exit A',
            km: '2.2',
            flag: 'disabled',
        },
        {
            Busid: '56991',
            Name: 'Sembawang Drive Blk 441 - FAKE',
            time: '09:55',
        },
        {
            Busid: '57041',
            Name: 'Sembawang Way Blk 404',
            km: '1',
            flag: 'disabled',
        },
        {
            Busid: '57031',
            Name: 'Sembawang Crescent Blk 115',
            km: '12.2',
            flag: 'disabled',
        },
        {
            Busid: '57021',
            Name: 'Sembawang Road Blk 241',
            km: '21.2',
            flag: 'disabled',
        },
        {
            Busid: '57011',
            Name: 'Opp Sembawang Park',
            km: '4',
            flag: 'disabled',
        },
        {
            Busid: '57001',
            Name: 'Sembawang Park',
            km: '1',
            flag: 'disabled',
        },
        {
            Busid: '56991',
            Name: 'Sembawang Drive Blk 441',
            km: '13.2',
            flag: 'active',
            misMatch: true,
            manualBls: true,
            autoBls: true,
        },
        {
            Busid: '56991',
            Name: 'Sembawang Drive Blk 441 - FAKE2',
            time: '09:55',
            autoBls: true,
            manualBls: true,
            misMatch: true,
        },
        {
            Busid: '56981',
            Name: 'Sembawang Road Blk 435',
            km: '15.2',
            flag: 'disabled',
            autoBls: true,
        },
        {
            Busid: '56971',
            Name: 'Opp Sembawang Hill Park',
            km: '13.2',
            flag: 'disabled',
        },
        {
            Busid: '56961',
            Name: 'Sembawang Hill Park',
            km: '1.2',
            flag: 'disabled',
        },
    ],
    cvList: [
        { cvNumber: 1, statuses: [1] },
        { cvNumber: 2, statuses: [1] },
        { cvNumber: 3, statuses: [1] },
        { cvNumber: 4, statuses: [1] },
        { cvNumber: 5, statuses: [1] },
        { cvNumber: 6, statuses: [1] },
    ],
};

export const headwayTimeTable = {
    currentBlock: '---/--',
    isHeadway: true,
    minSec: '00:00',
    bars: 1, // 0 to 6 0 will not show any bars
    direction: 'left', // left and right, If isHeadway is false, and the direction is left, the bar will move upwards; if the direction is right, the bar will move downwards."
    color: '0x000000', // green, blue, orange, black
};

export const nextBusInfo = {
    show: false,
    busBehindOccupancy: 1,
    busBehindTime: 260,
};

export const cvIconsCount = {
    busDoorStatus: [
        {
            doorNumber: 1,
            status: 'disconnected', // expected value connected | disconneted | no-tapping
            toggleCv: 'entry', // expected value entry | exit | entry-exit
            isFree: false, // expected value true | false
        },
        {
            doorNumber: 2,
            status: 'disconnected',
            toggleCv: 'entry', // expected value entry | exit | entry-exit
            isFree: false, // expected value true | false
        },
    ],
};

export const bootUpAndShutdown = [
    flow(1, 'Boot up', {
        msgID: MsgID?.BOOT_UP,
        softwareVersion: 'BFC.A.05.22.00',
        osVersion: '02.02.23',
        releaseDate: '10/11/2024',
        serialNumber: '3252234785',
        service: 'SMRT',
        busId: 'SG5451',
    }),
    flow(3, 'Shutting Down', {
        msgID: MsgID?.SHUTTING_DOWN,
        message: 'Shutting Down...',
        topic: 'TC/UpdateAllTCTabs',
    }),
    flow(3, 'Shutting Down For Upgrading', {
        msgID: MsgID?.SHUTTING_DOWN,
        message: 'Shutting Down for Application Upgrade',
        topic: 'TC/UpdateAllTCTabs',
    }),
    flow(3, 'Shutting Down For Upgrading From To', {
        msgID: MsgID?.SHUTTING_DOWN,
        message: 'Application upgraded \nfrom version XXX to version YYY',
        topic: 'TC/UpdateAllTCTabs',
    }),
    flow(3, 'TC Detect Error', {
        msgID: MsgID?.TC_DETECT_ERROR,
        esn: '9630003',
        code: '0x01201',
        description: 'SERVER_START_FAILURE',
        topic: 'TC/UpdateAllTCTabs',
    }),
];

export const commissioningFlows = [
    flow(19, 'Language setting', { msgID: MsgID?.LANGUAGE, language: 'EN' }),
    flow(19, 'Update Language to CH', {
        msgID: MsgID?.LANGUAGE_NOTIFY,
        language: 'CH',
        topic: 'TC/UpdateAllTCTabs',
    }),
    flow(19, 'Update Language to EN', {
        msgID: MsgID?.LANGUAGE_NOTIFY,
        language: 'EN',
        topic: 'TC/UpdateAllTCTabs',
    }),
    flow(19, 'Date and Time setting', {
        msgID: MsgID?.DATE_TIME_SETTING,
        dateTime: '2025-07-13T12:17:22+08:00',
        minDateTime: '2020-01-01T00:00:00+00:00',
    }),
    flow(19, 'Date and Time setting - Invalid Date', {
        msgID: MsgID?.DATE_TIME_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'INVALID_ENTRY',
    }),
    flow(15, 'Fare Console Configuration', {
        msgID: MsgID?.FARE_CONSOLE,
        msgSubID: MsgSubID?.NOTIFY,
        deckType: { id: 1, label: 'Single' }, // if options of this is dynamic we use the deck type Id number if not we use the string label name
        serviceProvider: 16,
        busId: 'SBS4567',
        complimentaryDays: 30,
        maximumcomplimentaryDays: 50,
    }),
    flow(15, 'Deck Type List', {
        msgID: MsgID?.DECK_TYPE_LIST,
        msgSubID: MsgSubID?.RESPONSE,
        deckTypeList: DECK_TYPE_LIST,
    }),
    flow(15, 'Delete Parameters - In Progress', {
        msgID: MsgID?.DELETE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        percentage: 50,
    }),
    flow(15, 'Delete Parameters - Success', {
        msgID: MsgID?.DELETE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(15, 'Delete Parameters - Error', {
        msgID: MsgID?.DELETE_PARAMETER,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'PLEASE_RETRY_AGAIN',
    }),
    flow(16, 'BusId information', {
        msgID: MsgID?.COMMISSION_BUS_ID,
        msgSubID: MsgSubID?.RESPONSE,
        ...BUS_ID_INFO,
    }),
    flow(16, 'Operator List', {
        msgID: MsgID?.COMMISSION_OPERATOR,
        msgSubID: MsgSubID?.RESPONSE,
        operators: OPERATOR_LIST,
    }),
];

export const fareConsole = {
    status: AuthStatus?.FARE_CONSOLE_SETTING,
    deckType: 'SINGLE',
    blsStatus: 'ENABLE',
    time: '12:00:00',
    date: '09/09/2024',
    busId: 'SBS4567',
    complimentaryDays: 30,
    maximumcomplimentaryDays: 50,
};

export const dagwOperation = {
    popMsgtitle: ['DAGW Operation'],
    popMsgtext: [
        'Attempting to connect\n to DAGW network',
        'Uploading file...',
        'Downloading file...',
        'DAGW Process Done',
        'Problem occurred while trying to \nconnect to wireless network. \nPlease retry again.',
        'DAGW Process Failed.\nPleaser retry again later.',
        'Processing Data',
    ],
    fileNames: ['', 'DF_20250113_02343_0342_BFC.DAT', 'ABT_EWLA.SYS'],
    percentage: 0,
};

export const outOfServices = [
    flow(7, 'Out of service: w/info (Upgrade CV)', {
        msgID: MsgID?.OUT_OF_SERVICE_INFO,
        title: 'Out of Service',
        message: 'TRANSFER REQUIRED',
        reason: '[KEY EXPIRED]',
        upgradeStatus: 'Pending upgrade on CV',
    }),
    flow(7, 'Out of service: w/info (Upgrade Reader)', {
        msgID: MsgID?.OUT_OF_SERVICE_INFO,
        title: 'Out of Service',
        message: 'TRANSFER REQUIRED',
        reason: '[KEY EXPIRED]',
        upgradeStatus: 'Pending upgrade on Reader',
    }),
    flow(7, 'Out of service: w/info (Upgrade CV&Reader)', {
        msgID: MsgID?.OUT_OF_SERVICE_INFO,
        title: 'Out of Service',
        message: 'TRANSFER REQUIRED',
        reason: '[KEY EXPIRED]',
        upgradeStatus: 'Pending upgrade on CV & Reader',
    }),
    flow(7, 'Out of service: No Tapping', {
        msgID: MsgID?.OUT_OF_SERVICE_INFO,
        title: 'Out of Service',
        message: 'TRANSFER REQUIRED',
        reason: '[KEY EXPIRED]',
        upgradeStatus: 'Pending upgrade on CV & Reader',
        noTapping: true,
    }),
    flow(8, 'Out of service: missing data', {
        msgID: MsgID?.OUT_OF_SERVICE_MISSING_DATA,
        title: 'Out of Service',
        message: 'Missing Data',
    }),
];

export const bcLoginFlows = [
    flow(4, 'Login Option - Tap Card', { msgID: MsgID?.TAP_CARD_NOTIFICATION, timeout: 5000 }),
    flow(4, 'Tap Card - Error', { msgID: MsgID?.BC_TAP_CARD_LOGIN, status: 3, message: 'CARD_LOGIN_FAILED' }),
    flow(4, 'Tap Card - In Progress', { msgID: MsgID?.BC_TAP_CARD_LOGIN, status: 2 }),
    flow(4, 'Tap Card - NA', { msgID: MsgID?.BC_TAP_CARD_LOGIN, status: ResponseStatus.NA }),
    flow(4, 'Tap Card need PIN', {
        msgID: MsgID?.BC_TAP_CARD_LOGIN,
        message: 'LOGIN_SUCCESS_NEED_PIN',
        timeout: 5000,
    }),
    flow(4, 'Enter PIN - In Progress', {
        msgID: MsgID?.BC_TAP_CARD_PIN,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(4, 'Tap Card Incorrect PIN', {
        msgID: MsgID?.BC_TAP_CARD_PIN,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'PIN_ERROR_INVALID',
        status: 3,
        timeout: 5000,
    }),
    flow(4, 'Tap Card Logon Terminate', {
        msgID: MsgID?.BC_TAP_CARD_PIN,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'PIN_ERROR_LOGIN_TERMINATE',
        status: 3,
    }),
    flow(4, 'Tap Card Display Duty Number Input', {
        msgID: MsgID?.BC_TAP_CARD_PIN,
        msgSubID: MsgSubID?.NOTIFY,
        dutyNumber: '9999',
    }),
    flow(4, 'Tap Card Duty Number Wrong', {
        msgID: MsgID?.BC_TAP_CARD_DUTY,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'DUTY_NUMBER_INVALID',
        status: 3,
    }),
    flow(4, 'Tap Card Sending Duty Number', {
        msgID: MsgID?.BC_TAP_CARD_DUTY,
        msgSubID: MsgSubID?.RESPONSE,
        status: 1,
    }),
    flow(5, 'Tap Card Login - Success', { msgID: MsgID?.BUS_OPERATION_MENU }),
];

export const manualLoginFlows = [
    flow(4, 'Login Option - Tap Card', { msgID: MsgID?.TAP_CARD_NOTIFICATION, timeout: 5000 }),
    flow(4, 'Manual Enter PIN', { msgID: MsgID?.MANUAL_LOGIN_PIN, msgSubID: MsgSubID?.NOTIFY, timeout: 5000 }),
    flow(4, 'Manual Incorrect PIN', {
        msgID: MsgID?.MANUAL_LOGIN_PIN2,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'PIN_ERROR_INVALID',
        status: 3,
        timeout: 5000,
    }),
    flow(4, 'Manual Enter PIN Terminate', {
        msgID: MsgID?.MANUAL_LOGIN_PIN2,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'PIN_ERROR_LOGIN_TERMINATE',
        status: 3,
    }),
    flow(4, 'Manual Enter PIN - Success', {
        msgID: MsgID?.MANUAL_LOGIN_PIN2,
        msgSubID: MsgSubID?.RESPONSE,
        timeout: 5000,
        status: 1,
    }),
    flow(4, 'Manual Enter Staff ID - Incorrect', {
        msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'STAFF_ID_ERROR_INVALID',
        status: 3,
    }),
    flow(4, 'Manual Enter Staff ID - Terminate', {
        msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'STAFF_ID_ERROR_LOGIN_TERMINATE',
        status: 3,
    }),
    flow(4, 'Manual Enter Staff ID - In Progress', {
        msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
        msgSubID: MsgSubID?.RESPONSE,
        status: 1,
    }),
    flow(4, 'Manual  Enter Staff ID - Success', {
        msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
        msgSubID: MsgSubID?.NOTIFY,
        dutyNumber: '9999',
    }),
    flow(4, 'Manual Duty Number - Incorrect', {
        msgID: MsgID?.MANUAL_LOGIN_DUTY,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'DUTY_NUMBER_INVALID',
        status: 3,
    }),
    flow(4, 'Manual Sending Duty Number', {
        msgID: MsgID?.MANUAL_LOGIN_DUTY,
        msgSubID: MsgSubID?.RESPONSE,
        status: 1,
    }),
    flow(4, 'Manual Duty Number - Success', { msgID: MsgID?.BUS_OPERATION_MENU, msgSubID: MsgSubID?.NOTIFY }),
];

export const msTapCardFlows = [
    flow(4, 'Tap Card - Error', { msgID: MsgID?.MS_TAP_CARD_LOGIN, status: 3, message: 'CARD_LOGIN_FAILED' }),
    flow(4, 'Tap Card - Success', { msgID: MsgID?.MS_TAP_CARD_LOGIN, timeout: 5000, status: 1 }),
    flow(4, 'Tap Card Enter PIN - Incorrect', {
        msgID: MsgID?.MS_TAP_CARD_PIN,
        msgSubID: MsgSubID?.RESPONSE,
        message: 'PIN_ERROR_INVALID',
        status: 3,
        timeout: 5000,
    }),
    flow(4, 'Tap Card Enter PIN - Success', {
        msgID: MsgID?.MS_TAP_CARD_PIN,
        msgSubID: MsgSubID?.RESPONSE,
        status: 1,
    }),
];

export const startTripFlows = [
    flow(20, 'Get service list', {
        msgID: MsgID?.START_TRIP_GET_SERVICE_LIST,
        msgSubID: MsgSubID?.RESPONSE,
        services: SAMPLE_SERVICE_LIST,
    }),
    flow(20, 'Get bus stop list', {
        msgID: MsgID?.START_TRIP_BUS_STOP_LIST,
        msgSubID: MsgSubID?.RESPONSE,
        busStopList: BISHAN_BUS_STOP_LIST,
    }),
    flow(20, 'Get Fare Details - For BUS STOP MISMATCH', {
        msgID: MsgID?.START_TRIP_GET_FARE_TRIP_DETAILS,
        msgSubID: MsgSubID?.RESPONSE,
        serviceNumber: 20,
        dir: 1,
        variantName: 'A LP1',
    }),
    flow(20, 'Input Service Success', {
        msgID: MsgID?.START_TRIP_SUBMIT_SERVICE,
        msgSubID: MsgSubID?.RESPONSE,
        services: [
            { serviceNumber: 11, dir: 1, variantName: 'A1' },
            { serviceNumber: 11, dir: 2, variantName: 'A' },
            { serviceNumber: 11, dir: 3, variantName: 'B DR3' },
        ],
    }),
    flow(20, 'Input Service Error', {
        msgID: MsgID?.START_TRIP_SUBMIT_SERVICE,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
    }),
    flow(20, 'Start trip - Done', {
        msgID: MsgID?.START_TRIP_SUBMIT_FARE_TRIP,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const externalDevicesFlows = [
    flow(18, 'External Devices Loading', {
        msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
        status: ResponseStatus.PROGRESS,
        isNavigationRequired: true,
    }),
    flow(18, 'External Devices Success', {
        msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
        status: ResponseStatus.SUCCESS,
    }),
    flow(18, 'External Devices Success With Some Error Field', {
        msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
        ...EXTERNAL_DEVICES_ERROR_STATUS,
    }),
    flow(18, 'Test Print Error', {
        msgID: MsgID?.MAINTENANCE_TEST_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'OUT_OF_SERVICE',
    }),
    flow(18, 'Test Print Progress', {
        msgID: MsgID?.MAINTENANCE_TEST_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
    }),
    flow(18, 'Test Print Success', {
        msgID: MsgID?.MAINTENANCE_TEST_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const freeFlows = [
    flow(21, 'Free - Accept Request', { msgID: MsgID?.MAIN_FREE, timeout: 10000 }),
    flow(21, 'Free - Success', {
        msgID: MsgID?.MAIN_FREE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(21, 'Free - Cancel', {
        msgID: MsgID?.MAIN_FREE_CANCEL,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const breakDownFlows = [
    flow(24, 'Breakdown - Information', {
        msgID: MsgID?.MAIN_BREAKDOWN,
        timeout: 10000,
        title: 'END_TRIP_BREAKDOWN_DETAIL',
        ...SAMPLE_TRIP_DETAIL,
    }),
    flow(24, 'Breakdown - Bus Stop List', {
        msgID: MsgID?.BREAKDOWN_BUS_STOP_LIST,
        msgSubID: MsgSubID?.RESPONSE,
        busStopList: BISHAN_BUS_STOP_LIST,
    }),
    flow(24, 'Breakdown - Update End Bus Stop Success', {
        msgID: MsgID?.BREAKDOWN_CHANGE_BUS_STOP,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Success', {
        msgID: MsgID?.BREAKDOWN_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        reasonList: BREAKDOWN_REASON_LIST,
    }),
    flow(24, 'Breakdown - Submit Reason', {
        msgID: MsgID?.BREAKDOWN_SUBMIT_REASON,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Submit Comp Tickets', {
        msgID: MsgID?.BREAKDOWN_SUBMIT_COMP_TICKET,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Process Comp Tickets', {
        msgID: MsgID?.BREAKDOWN_PROCESS_COMP_TICKET,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Submit Breakdown Tickets', {
        msgID: MsgID?.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Process Breakdown Tickets', {
        msgID: MsgID?.BREAKDOWN_PROCESS_BREAKDOWN_TICKET,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Back', {
        msgID: MsgID?.BREAKDOWN_BACK_BUTTON,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Cancel Breakdown', {
        msgID: MsgID?.BREAKDOWN_CANCEL,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(24, 'Breakdown - Print Error', { msgID: MsgID?.COMMON_PRINT_ERROR, message: 'PRINTER_PAPER_LOW' }),
];

export const frontDoorAndRearDoorFlows = [
    flow(21, 'Rear Doors - Accept Request', {
        msgID: MsgID?.MAIN_REAR_DOORS,
        cvList: [
            { cvNumber: 3, statuses: [4] },
            { cvNumber: 4, statuses: [4] },
            { cvNumber: 5, statuses: [4] },
            { cvNumber: 6, statuses: [4] },
        ],
    }),
    flow(21, 'Front Doors - Accept Request', { msgID: MsgID?.MAIN_FRONT_DOOR, cvList: [1, 2] }),
    flow(21, 'Front Doors - Select CV', {
        msgID: MsgID?.MAIN_FRONT_DOOR_SELECT_CV,
        msgSubID: MsgSubID?.RESPONSE,
        cvNum: 2,
        status: ResponseStatus.SUCCESS,
        timeout: 10000,
    }),
    flow(21, 'Front Doors - Cancel', {
        msgID: MsgID?.MAIN_FRONT_DOOR_CANCEL,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(21, 'Front Doors - Success', {
        msgID: MsgID?.MAIN_FRONT_DOOR_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const endTripFlows = [
    flow(14, 'End Trip Confirmation', {
        msgID: MsgID?.END_TRIP,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        timeout: 5000,
    }),
    flow(14, 'Notify End Trip ', { msgID: MsgID?.END_TRIP, timeout: 5000 }),
    flow(14, 'End Trip Information', {
        timeout: 4000,
        msgID: MsgID?.END_TRIP_TYPE,
        msgSubID: MsgSubID?.RESPONSE,
        title: 'END_TRIP_DETAILS',
        ...SAMPLE_TRIP_DETAIL,
    }),
    flow(14, 'End Trip Success', {
        msgID: MsgID?.END_TRIP_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const cashPaymentFlows = [
    flow(27, 'Cash - Amount List', {
        msgID: MsgID?.MAIN_CASH,
        status: ResponseStatus.SUCCESS,
        ...CASH_FARE_VALUES,
    }),
    flow(27, 'Cash - Print Single Error', {
        msgID: MsgID?.MAIN_CASH_SINGLE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'PRINTER_PAPER_JAM',
    }),
    flow(27, 'Cash - Multiple Submit', {
        msgID: MsgID?.MAIN_CASH_MULTI_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        type: 'ADULT',
        cashIndex: 4,
    }),
    flow(27, 'Cash - Multiple Back', {
        msgID: MsgID?.MAIN_CASH_MULTI_BACK,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(27, 'Cash - Multiple Confirm', {
        msgID: MsgID?.MAIN_CASH_MULTI_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(27, 'Cash - Print Multiple Error', {
        msgID: MsgID?.MAIN_CASH_MULTI_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'PRINTER_PAPER_JAM',
    }),
    flow(27, 'Cash - Cancel', {
        msgID: MsgID?.MAIN_CASH_MULTI_CANCEL,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(27, 'Cash - Fare Bus Stop List', {
        msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        busStopList: SEMBAWANG_KM_BUS_STOP_LIST,
    }),
    flow(27, 'Cash - Fare Calculator Back', {
        msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_BACK,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(27, 'Cash - Fare Calculator - Change Bus Stop Error', {
        msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'EXIT_BUS_STOP_AFTER_ENTRY_BUS_STOP',
    }),
    flow(27, 'Cash - Fare Calculator Result', {
        msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        adultFare: 1.7,
        seniorFare: 0.85,
        studentFare: 1.2,
        exitBusStop: { Busid: '11231', Name: 'BUSPARK' },
        entryBusStop: { Busid: '122', Name: 'BISHAN INT BOARDING 2' },
    }),
    flow(27, 'Cash - Print Receipt Error', {
        msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        message: 'PRINTER_PAPER_JAM',
    }),
];

export const services = [
    { serviceNumber: 12, dir: 1 },
    { serviceNumber: 13, dir: 2 },
    { serviceNumber: 14, dir: 3 },
    { serviceNumber: 15, dir: 4 },
    { serviceNumber: 16, dir: 2 },
    { serviceNumber: 17, dir: 2 },
    { serviceNumber: 19, dir: 3 },
    { serviceNumber: 20, dir: 1 },
    { serviceNumber: 21, dir: 5 },
];

export const busStopList = [
    { Busid: 12779, Name: ' BUSPARK', km: '10.2', flag: 'active' },
    { Busid: 12778, Name: 'BISHAN INT BOARDING 2', km: '10.2', flag: 'active' },
    { Busid: 12239, Name: 'BLK 115', km: '10.2', flag: 'active' },
    { Busid: 12789, Name: 'BLK 210', km: '10.2', flag: 'active' },
    { Busid: 15779, Name: 'BLK 155', km: '10.2', flag: 'active' },
];

export const currentFmsTrip = {
    serviceNumber: 14,
    dir: 2,
    busStop: { Busid: 13669, Name: 'Buspark', km: '10.2', flag: 'active' },
};
