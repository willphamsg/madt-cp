import { externalDevices } from '@app/store/main/main.reducer';
import { AuthStatus, CvStatusType, MsgID, MsgSubID, ResponseStatus } from '@models';

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
        {
            cvNumber: 1,
            statuses: [1],
        },
        {
            cvNumber: 2,
            statuses: [1],
        },
        {
            cvNumber: 3,
            statuses: [1],
        },
        {
            cvNumber: 4,
            statuses: [1],
        },
        {
            cvNumber: 5,
            statuses: [1],
        },
        {
            cvNumber: 6,
            statuses: [1],
        },
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
    {
        id: 1,
        label: 'Boot up',
        data: {
            msgID: MsgID?.BOOT_UP,
            softwareVersion: 'BFC.A.05.22.00',
            osVersion: '02.02.23',
            releaseDate: '10/11/2024',
            serialNumber: '3252234785',
            service: 'SMRT',
            busId: 'SG5451',
        },
    },

    {
        id: 3,
        label: 'Shutting Down',
        isLatest: true,
        data: {
            msgID: MsgID?.SHUTTING_DOWN,
            message: 'Shutting Down...',
            topic: 'TC/UpdateAllTCTabs',
        },
    },
    {
        id: 3,
        label: 'Shutting Down For Upgrading',
        isLatest: true,
        data: {
            msgID: MsgID?.SHUTTING_DOWN,
            message: 'Shutting Down for Application Upgrade',
            topic: 'TC/UpdateAllTCTabs',
        },
    },
    {
        id: 3,
        label: 'Shutting Down For Upgrading From To',
        isLatest: true,
        data: {
            msgID: MsgID?.SHUTTING_DOWN,
            message: 'Application upgraded \nfrom version XXX to version YYY',
            topic: 'TC/UpdateAllTCTabs',
        },
    },
    {
        id: 3,
        label: 'TC Detect Error',
        isLatest: true,
        data: {
            msgID: MsgID?.TC_DETECT_ERROR,
            message: 'PRM Server Start Failure',
            code: '0x01201',
            topic: 'TC/UpdateAllTCTabs',
        },
    },
];

export const commissioningFlows = [
    {
        id: 19,
        label: 'Language setting',
        isLatest: true,
        data: {
            msgID: MsgID?.LANGUAGE,
            language: 'EN',
        },
    },

    {
        id: 19,
        label: 'Update Language to CH',
        isLatest: true,
        data: {
            msgID: MsgID?.LANGUAGE_NOTIFY,
            language: 'CH',
            topic: 'TC/UpdateAllTCTabs',
        },
    },

    {
        id: 19,
        label: 'Update Language to EN',
        isLatest: true,
        data: {
            msgID: MsgID?.LANGUAGE_NOTIFY,
            language: 'EN',
            topic: 'TC/UpdateAllTCTabs',
        },
    },

    {
        id: 19,
        label: 'Date and Time setting',
        isLatest: true,
        data: {
            msgID: MsgID?.DATE_TIME_SETTING,
            dateTime: '2025-07-13T12:17:22+08:00',
            minDateTime: '2020-01-01T00:00:00+00:00',
        },
    },

    {
        id: 19,
        label: 'Date and Time setting - Invalid Date',
        isLatest: true,
        data: {
            msgID: MsgID?.DATE_TIME_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'INVALID_ENTRY',
        },
    },

    {
        id: 15,
        label: 'Fare Console Configuration',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONSOLE,
            msgSubID: MsgSubID?.NOTIFY,
            deckType: {
                id: 1,
                label: 'Single',
            }, // if options of this is dynamic we use the deck type Id number if not we use the string label name
            // dateTime: '2025-01-05T12:45:50+08:00',
            serviceProvider: 16,
            busId: 'SBS4567',
            complimentaryDays: 30,
            maximumcomplimentaryDays: 50,
            // minDateTime: '2025-01-05T12:45:50+08:00',
        },
    },

    {
        id: 15,
        label: 'Deck Type List',
        isLatest: true,
        data: {
            msgID: MsgID?.DECK_TYPE_LIST,
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
        id: 15,
        label: 'Delete Parameters - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.DELETE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            percentage: 50,
        },
    },
    {
        id: 15,
        label: 'Delete Parameters - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.DELETE_PARAMETER,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 15,
        label: 'Delete Parameters - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.DELETE_PARAMETER,
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
            msgID: MsgID?.COMMISSION_BUS_ID,
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
            msgID: MsgID?.COMMISSION_OPERATOR,
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
    //     label: 'Submit Bus ID - Success',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.COMMISSION_BUS_ID_SUBMIT,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.SUCCESS,
    //     },
    // },
    // {
    //     id: 16,
    //     label: 'Submit Bus ID - Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.COMMISSION_BUS_ID_SUBMIT,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //         message: 'PLEASE_RETRY_AGAIN',
    //     },
    // },
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
    {
        id: 7,
        label: 'Out of service: w/info (Upgrade CV)',
        isLatest: true,
        data: {
            msgID: MsgID?.OUT_OF_SERVICE_INFO,
            title: 'Out of Service',
            message: 'TRANSFER REQUIRED',
            reason: '[KEY EXPIRED]',
            upgradeStatus: 'Pending upgrade on CV',
        },
    },
    {
        id: 7,
        label: 'Out of service: w/info (Upgrade Reader)',
        isLatest: true,
        data: {
            msgID: MsgID?.OUT_OF_SERVICE_INFO,
            title: 'Out of Service',
            message: 'TRANSFER REQUIRED',
            reason: '[KEY EXPIRED]',
            upgradeStatus: 'Pending upgrade on Reader',
        },
    },

    {
        id: 7,
        label: 'Out of service: w/info (Upgrade CV&Reader)',
        isLatest: true,
        data: {
            msgID: MsgID?.OUT_OF_SERVICE_INFO,
            title: 'Out of Service',
            message: 'TRANSFER REQUIRED',
            reason: '[KEY EXPIRED]',
            upgradeStatus: 'Pending upgrade on CV & Reader',
        },
    },

    {
        id: 7,
        label: 'Out of service: No Tapping',
        isLatest: true,
        data: {
            msgID: MsgID?.OUT_OF_SERVICE_INFO,
            title: 'Out of Service',
            message: 'TRANSFER REQUIRED',
            reason: '[KEY EXPIRED]',
            upgradeStatus: 'Pending upgrade on CV & Reader',
            noTapping: true,
        },
    },
    {
        id: 8,
        label: 'Out of service: missing data',
        isLatest: true,
        data: {
            msgID: MsgID?.OUT_OF_SERVICE_MISSING_DATA,
            title: 'Out of Service',
            message: 'Missing Data',
        },
    },
];

export const bcLoginFlows = [
    {
        id: 4,
        label: 'Login Option - Tap Card',
        isLatest: true,
        data: {
            msgID: MsgID?.TAP_CARD_NOTIFICATION,
            timeout: 5000,
        },
    },
    {
        id: 4,
        label: 'Tap Card - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_LOGIN,
            status: 3,
            message: 'CARD_LOGIN_FAILED',
        },
    },
    {
        id: 4,
        label: 'Tap Card - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_LOGIN,
            status: 2,
        },
    },
    {
        id: 4,
        label: 'Tap Card - NA',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_LOGIN,
            status: ResponseStatus.NA,
        },
    },
    {
        id: 4,
        label: 'Tap Card need PIN',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_LOGIN,
            message: 'LOGIN_SUCCESS_NEED_PIN',
            timeout: 5000,
        },
    },
    {
        id: 4,
        label: 'Enter PIN - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_PIN,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 4,
        label: 'Tap Card Incorrect PIN',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_PIN,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'PIN_ERROR_INVALID',
            status: 3,
            timeout: 5000,
        },
    },
    {
        id: 4,
        label: 'Tap Card Logon Terminate',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_PIN,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'PIN_ERROR_LOGIN_TERMINATE',
            status: 3,
        },
    },
    {
        id: 4,
        label: 'Tap Card Display Duty Number Input',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_PIN,
            msgSubID: MsgSubID?.NOTIFY,
            dutyNumber: '9999',
        },
    },
    {
        id: 4,
        label: 'Tap Card Duty Number Wrong',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_DUTY,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'DUTY_NUMBER_INVALID',
            status: 3,
        },
    },
    {
        id: 4,
        label: 'Tap Card Sending Duty Number',
        isLatest: true,
        data: {
            msgID: MsgID?.BC_TAP_CARD_DUTY,
            msgSubID: MsgSubID?.RESPONSE,
            status: 1,
        },
    },
    {
        id: 5,
        label: 'Tap Card Login - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.BUS_OPERATION_MENU,
        },
    },
];

export const manualLoginFlows = [
    {
        id: 4,
        label: 'Login Option - Tap Card',
        isLatest: true,
        data: {
            msgID: MsgID?.TAP_CARD_NOTIFICATION,
            timeout: 5000,
        },
    },
    {
        id: 4,
        label: 'Manual Enter PIN',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_PIN,
            msgSubID: MsgSubID?.NOTIFY,
            timeout: 5000,
        },
    },
    {
        id: 4,
        label: 'Manual Incorrect PIN',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_PIN2,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'PIN_ERROR_INVALID',
            status: 3,
            timeout: 5000,
        },
    },
    {
        id: 4,
        label: 'Manual Enter PIN Terminate',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_PIN2,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'PIN_ERROR_LOGIN_TERMINATE',
            status: 3,
        },
    },
    {
        id: 4,
        label: 'Manual Enter PIN - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_PIN2,
            msgSubID: MsgSubID?.RESPONSE,
            timeout: 5000,
            status: 1,
        },
    },
    {
        id: 4,
        label: 'Manual Enter Staff ID - Incorrect',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'STAFF_ID_ERROR_INVALID',
            status: 3,
        },
    },
    {
        id: 4,
        label: 'Manual Enter Staff ID - Terminate',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'STAFF_ID_ERROR_LOGIN_TERMINATE',
            status: 3,
        },
    },
    {
        id: 4,
        label: 'Manual Enter Staff ID - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
            msgSubID: MsgSubID?.RESPONSE,
            status: 1,
        },
    },
    {
        id: 4,
        label: 'Manual  Enter Staff ID - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_STAFF_ID,
            msgSubID: MsgSubID?.NOTIFY,
            dutyNumber: '9999',
        },
    },
    {
        id: 4,
        label: 'Manual Duty Number - Incorrect',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_DUTY,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'DUTY_NUMBER_INVALID',
            status: 3,
        },
    },
    {
        id: 4,
        label: 'Manual Sending Duty Number',
        isLatest: true,
        data: {
            msgID: MsgID?.MANUAL_LOGIN_DUTY,
            msgSubID: MsgSubID?.RESPONSE,
            status: 1,
        },
    },
    {
        id: 4,
        label: 'Manual Duty Number - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.BUS_OPERATION_MENU,
            msgSubID: MsgSubID?.NOTIFY,
        },
    },
];

export const msTapCardFlows = [
    {
        id: 4,
        label: 'Tap Card - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MS_TAP_CARD_LOGIN,
            status: 3,
            message: 'CARD_LOGIN_FAILED',
        },
    },
    {
        id: 4,
        label: 'Tap Card - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MS_TAP_CARD_LOGIN,
            timeout: 5000,
            status: 1,
        },
    },
    {
        id: 4,
        label: 'Tap Card Enter PIN - Incorrect',
        isLatest: true,
        data: {
            msgID: MsgID?.MS_TAP_CARD_PIN,
            msgSubID: MsgSubID?.RESPONSE,
            message: 'PIN_ERROR_INVALID',
            status: 3,
            timeout: 5000,
        },
    },
    {
        id: 4,
        label: 'Tap Card Enter PIN - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MS_TAP_CARD_PIN,
            msgSubID: MsgSubID?.RESPONSE,
            status: 1,
        },
    },
];

export const startTripFlows = [
    {
        id: 20,
        label: 'Get service list',
        isLatest: true,
        data: {
            msgID: MsgID?.START_TRIP_GET_SERVICE_LIST,
            msgSubID: MsgSubID?.RESPONSE,
            services: [
                { serviceNumber: 12, dir: 1, variantName: 'A1' },
                { serviceNumber: 12, dir: 2, variantName: 'A LP2' },
                { serviceNumber: 12, dir: 3, variantName: 'C DR3' },
                { serviceNumber: 15, dir: 4, variantName: 'A DR4' },
                { serviceNumber: 16, dir: 5, variantName: 'D DR5' },
                { serviceNumber: 17, dir: 6, variantName: 'E DR5' },
                { serviceNumber: 18, dir: 7, variantName: 'A LP' },
                { serviceNumber: 19, dir: 8, variantName: 'F DR1' },
                { serviceNumber: 20, dir: 9, variantName: 'D DR3' },
            ],
        },
    },

    {
        id: 20,
        label: 'Get bus stop list',
        isLatest: true,
        data: {
            msgID: MsgID?.START_TRIP_BUS_STOP_LIST,
            msgSubID: MsgSubID?.RESPONSE,
            busStopList: [
                {
                    Busid: '1',
                    Name: 'Bishan Pk',
                },
                {
                    Busid: '2',
                    Name: 'Buspark',
                },
                {
                    Busid: '3',
                    Name: 'Bedok Interchange Boarding Berth 3 to 10 PK',
                },
                { Busid: '4', Name: 'Bendock interchange' },
                {
                    Busid: '5',
                    Name: 'Bishan Pk 2',
                },
                {
                    Busid: '6',
                    Name: 'Buspark 2',
                },
                {
                    Busid: '7',
                    Name: 'Bedok Interchange Boarding Berth 3 to 10 PK 2',
                },
                { Busid: '8', Name: 'Bendock interchange 2' },
                {
                    Busid: '9',
                    Name: 'Bishan Pk 3',
                },
                {
                    Busid: '10',
                    Name: 'Buspark 3',
                },
                {
                    Busid: '11',
                    Name: 'Bedok Interchange Boarding Berth 3 to 10 PK 3',
                },
                { Busid: '12', Name: 'Bendock interchange 3' },
            ],
        },
    },
    {
        id: 20,
        label: 'Get Fare Details - For BUS STOP MISMATCH',
        isLatest: true,
        data: {
            msgID: MsgID?.START_TRIP_GET_FARE_TRIP_DETAILS,
            msgSubID: MsgSubID?.RESPONSE,
            serviceNumber: 20,
            dir: 1,
            variantName: 'A LP1',
        },
    },
    {
        id: 20,
        label: 'Input Service Success',
        isLatest: true,
        data: {
            msgID: MsgID?.START_TRIP_SUBMIT_SERVICE,
            msgSubID: MsgSubID?.RESPONSE,
            // status: ResponseStatus.SUCCESS,
            services: [
                {
                    serviceNumber: 11,
                    dir: 1,
                    variantName: 'A1',
                },
                {
                    serviceNumber: 11,
                    dir: 2,
                    variantName: 'A',
                },
                {
                    serviceNumber: 11,
                    dir: 3,
                    variantName: 'B DR3',
                },
                // {
                //     serviceNumber: 15,
                //     dir: 4,
                //     variantName: 'A DR4',
                // },
                // {
                //     serviceNumber: 16,
                //     dir: 5,
                //     variantName: 'D DR5',
                // },
                // {
                //     serviceNumber: 17,
                //     dir: 6,
                //     variantName: 'E DR5',
                // },
            ],
        },
    },
    {
        id: 20,
        label: 'Input Service Error',
        isLatest: true,
        data: {
            msgID: MsgID?.START_TRIP_SUBMIT_SERVICE,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
        },
    },
    {
        id: 20,
        label: 'Start trip - Done',
        isLatest: true,
        data: {
            msgID: MsgID?.START_TRIP_SUBMIT_FARE_TRIP,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const externalDevicesFlows = [
    {
        id: 18,
        label: 'External Devices Loading',
        isLatest: true,
        data: {
            msgID: MsgID?.EXTERNAL_DEVICES_NOTIFY,
            status: ResponseStatus.PROGRESS,
            isNavigationRequired: true,
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
        id: 18,
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
        id: 18,
        label: 'Test Print Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 18,
        label: 'Test Print Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const freeFlows = [
    {
        id: 21,
        label: 'Free - Accept Request',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_FREE,
            timeout: 10000,
        },
    },
    {
        id: 21,
        label: 'Free - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_FREE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 21,
        label: 'Free - Cancel',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_FREE_CANCEL,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const breakDownFlows = [
    {
        id: 24,
        label: 'Breakdown - Information',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_BREAKDOWN,
            timeout: 10000,
            title: 'END_TRIP_BREAKDOWN_DETAIL',
            service: 58,
            direction: 1,
            variantName: 'M',
            firstBusStop: {
                Busid: '2',
                Name: 'Buskpark',
            },
            lastBusStop: {
                Busid: '4',
                Name: 'Bendock interchange',
            },
        },
    },
    {
        id: 24,
        label: 'Breakdown - Bus Stop List',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_BUS_STOP_LIST,
            msgSubID: MsgSubID?.RESPONSE,
            busStopList: [
                {
                    Busid: '1',
                    Name: 'Bishan Pk',
                },
                {
                    Busid: '2',
                    Name: 'Buspark',
                },
                {
                    Busid: '3',
                    Name: 'Bedok Interchange Boarding Berth 3 to 10 PK',
                },
                { Busid: '4', Name: 'Bendock interchange' },
                {
                    Busid: '5',
                    Name: 'Bishan Pk 2',
                },
                {
                    Busid: '6',
                    Name: 'Buspark 2',
                },
                {
                    Busid: '7',
                    Name: 'Bedok Interchange Boarding Berth 3 to 10 PK 2',
                },
                { Busid: '8', Name: 'Bendock interchange 2' },
                {
                    Busid: '9',
                    Name: 'Bishan Pk 3',
                },
                {
                    Busid: '10',
                    Name: 'Buspark 3',
                },
                {
                    Busid: '11',
                    Name: 'Bedok Interchange Boarding Berth 3 to 10 PK 3',
                },
                { Busid: '12', Name: 'Bendock interchange 3' },
            ],
        },
    },
    {
        id: 24,
        label: 'Breakdown - Update End Bus Stop Success',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_CHANGE_BUS_STOP,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Update End Bus Stop Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_CHANGE_BUS_STOP,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            reasonList: [
                {
                    id: 1,
                    label: 'Engine Failure',
                },
                {
                    id: 2,
                    label: 'Flat Tyre',
                },
                {
                    id: 3,
                    label: 'Transmission Failure',
                },
                {
                    id: 4,
                    label: 'Flat Battery',
                },
                {
                    id: 5,
                    label: 'Electrical Fault',
                },
                {
                    id: 6,
                    label: 'Broken Widescreen',
                },
            ],
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_SUBMIT,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Submit Reason',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_SUBMIT_REASON,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Submit Reason Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_SUBMIT_REASON,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Submit Comp Tickets',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_SUBMIT_COMP_TICKET,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Submit Comp Tickets Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_SUBMIT_COMP_TICKET,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Process Comp Tickets',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_PROCESS_COMP_TICKET,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Process Comp Tickets Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_PROCESS_COMP_TICKET,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Submit Breakdown Tickets',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Submit Breakdown Tickets Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Process Breakdown Tickets',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_PROCESS_BREAKDOWN_TICKET,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Process Breakdown Tickets Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_PROCESS_BREAKDOWN_TICKET,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Back',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_BACK_BUTTON,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Back Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_BACK_BUTTON,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Cancel Breakdown',
        isLatest: true,
        data: {
            msgID: MsgID?.BREAKDOWN_CANCEL,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    // {
    //     id: 24,
    //     label: 'Breakdown - Cancel Breakdown Error',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.BREAKDOWN_CANCEL,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.ERROR,
    //     },
    // },
    {
        id: 24,
        label: 'Breakdown - Print Error',
        isLatest: true,
        data: {
            msgID: MsgID?.COMMON_PRINT_ERROR,
            message: 'PRINTER_PAPER_LOW',
        },
    },
];

export const frontDoorAndRearDoorFlows = [
    {
        id: 21,
        label: 'Rear Doors - Accept Request',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_REAR_DOORS,
            cvList: [
                { cvNumber: 3, statuses: [4] },
                { cvNumber: 4, statuses: [4] },
                { cvNumber: 5, statuses: [4] },
                { cvNumber: 6, statuses: [4] },
            ],
        },
    },
    {
        id: 21,
        label: 'Front Doors - Accept Request',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_FRONT_DOOR,
            cvList: [1, 2],
        },
    },
    {
        id: 21,
        label: 'Front Doors - Select CV',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_FRONT_DOOR_SELECT_CV,
            msgSubID: MsgSubID?.RESPONSE,
            cvNum: 2,
            status: ResponseStatus.SUCCESS,
            timeout: 10000,
        },
    },
    {
        id: 21,
        label: 'Front Doors - Cancel',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_FRONT_DOOR_CANCEL,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 21,
        label: 'Front Doors - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_FRONT_DOOR_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            // statuses: [4],
        },
    },
];

export const endTripFlows = [
    {
        id: 14,
        label: 'End Trip Confirmation',
        isLatest: true,
        data: {
            msgID: MsgID?.END_TRIP,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            timeout: 5000,
        },
    },
    {
        id: 14,
        label: 'Notify End Trip ',
        isLatest: true,
        data: {
            msgID: MsgID?.END_TRIP,
            timeout: 5000,
        },
    },
    {
        id: 14,
        label: 'End Trip Information',
        isLatest: true,
        data: {
            timeout: 4000,
            msgID: MsgID?.END_TRIP_TYPE,
            msgSubID: MsgSubID?.RESPONSE,
            title: 'END_TRIP_DETAILS',
            service: 58,
            variantName: 'M',
            direction: 1,
            firstBusStop: {
                Busid: '2',
                Name: 'Buskpark',
            },
            lastBusStop: {
                Busid: '4',
                Name: 'Bendock interchange',
            },
        },
    },
    {
        id: 14,
        label: 'End Trip Success',
        isLatest: true,
        data: {
            msgID: MsgID?.END_TRIP_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const cashPaymentFlows = [
    {
        id: 27,
        label: 'Cash - Amount List',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH,
            status: ResponseStatus.SUCCESS,
            adultValues: [
                { index: 1, value: 120 },
                { index: 2, value: 140 },
                { index: 3, value: 160 },
                { index: 4, value: 180 },
                { index: 5, value: 200 },
                { index: 6, value: 220 },
            ],
            seniorValues: [
                { index: 1, value: 120 },
                { index: 2, value: 130 },
                { index: 3, value: 150 },
            ],
            studentValues: [
                { index: 1, value: 65 },
                { index: 2, value: 85 },
                { index: 3, value: 105 },
            ],
        },
    },
    {
        id: 27,
        label: 'Cash - Print Single Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_SINGLE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'PRINTER_PAPER_JAM',
        },
    },
    {
        id: 27,
        label: 'Cash - Multiple Submit',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_MULTI_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            type: 'ADULT',
            cashIndex: 4,
        },
    },
    {
        id: 27,
        label: 'Cash - Multiple Back',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_MULTI_BACK,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 27,
        label: 'Cash - Multiple Confirm',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_MULTI_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },

    {
        id: 27,
        label: 'Cash - Print Multiple Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_MULTI_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'PRINTER_PAPER_JAM',
        },
    },
    {
        id: 27,
        label: 'Cash - Cancel',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_MULTI_CANCEL,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 27,
        label: 'Cash - Fare Bus Stop List',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            busStopList: [
                {
                    Busid: '57059',
                    Name: 'Opp Sembawang Air Base',
                    km: '1.2',
                },
                {
                    Busid: '57051',
                    Name: 'Sembawang MRT Station Exit A',
                    km: '2.2',
                },
                {
                    Busid: '57041',
                    Name: 'Sembawang Way Blk 404',
                    km: '1',
                },
                {
                    Busid: '57031',
                    Name: 'Sembawang Crescent Blk 115',
                    km: '12.2',
                },
                {
                    Busid: '57021',
                    Name: 'Sembawang Road Blk 241',
                    km: '21.2',
                },
                {
                    Busid: '57011',
                    Name: 'Opp Sembawang Park',
                    km: '4',
                },
                {
                    Busid: '57001',
                    Name: 'Sembawang Park',
                    km: '1',
                },
                {
                    Busid: '56991',
                    Name: 'Sembawang Drive Blk 441',
                    km: '13.2',
                },
                {
                    Busid: '56981',
                    Name: 'Sembawang Road Blk 435',
                    km: '15.2',
                },
                {
                    Busid: '56971',
                    Name: 'Opp Sembawang Hill Park',
                    km: '13.2',
                },
                {
                    Busid: '56961',
                    Name: 'Sembawang Hill Park',
                    km: '1.2',
                },
            ],
        },
    },
    {
        id: 27,
        label: 'Cash - Fare Calculator Back',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_BACK,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 27,
        label: 'Cash - Fare Calculator - Change Bus Stop Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'EXIT_BUS_STOP_AFTER_ENTRY_BUS_STOP',
        },
    },
    {
        id: 27,
        label: 'Cash - Fare Calculator Result',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            adultFare: 1.7,
            seniorFare: 0.85,
            studentFare: 1.2,
            exitBusStop: {
                Busid: '11231',
                Name: 'BUSPARK',
            },
            entryBusStop: {
                Busid: '122',
                Name: 'BISHAN INT BOARDING 2',
            },
        },
    },
    {
        id: 27,
        label: 'Cash - Print Receipt Error',
        isLatest: true,
        data: {
            msgID: MsgID?.MAIN_CASH_FARE_CALCULATION_PRINT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            message: 'PRINTER_PAPER_JAM',
        },
    },
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

export const cvData = [
    {
        cvNumber: 1,
        status: CvStatusType[1],
    },
    {
        cvNumber: 2,
        status: CvStatusType[2],
    },
    {
        cvNumber: 3,
        status: CvStatusType[3],
    },
    {
        cvNumber: 4,
        status: CvStatusType[4],
    },
    {
        cvNumber: 5,
        status: CvStatusType[5],
    },
    {
        cvNumber: 6,
        status: CvStatusType[6],
    },
];

export const busStopList = [
    {
        Busid: 12779,
        Name: ' BUSPARK',
        km: '10.2',
        flag: 'active',
    },
    {
        Busid: 12778,
        Name: 'BISHAN INT BOARDING 2',
        km: '10.2',
        flag: 'active',
    },
    {
        Busid: 12239,
        Name: 'BLK 115',
        km: '10.2',
        flag: 'active',
    },
    {
        Busid: 12789,
        Name: 'BLK 210',
        km: '10.2',
        flag: 'active',
    },
    {
        Busid: 15779,
        Name: 'BLK 155',
        km: '10.2',
        flag: 'active',
    },
];

export const currentFmsTrip = {
    serviceNumber: 14,
    dir: 2,
    busStop: {
        Busid: 13669,
        Name: 'Buspark',
        km: '10.2',
        flag: 'active',
    },
};
