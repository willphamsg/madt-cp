import { model } from '@angular/core';
import { MsgID, MsgSubID, ResponseStatus } from '@models';

export const cancelRideFlows = [
    {
        id: 27,
        label: 'Cancel Ride CV1 - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_CV1,
            timeout: 10000,
        },
    },
    {
        id: 27,
        label: 'Cancel Ride CV1 - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            timeout: 10000,
            cvNum: 1,
        },
    },
    {
        id: 27,
        label: 'Cancel Ride CV1 - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
            status: ResponseStatus.SUCCESS,
            cvNum: 1,
        },
    },
    {
        id: 27,
        label: 'Cancel Ride CV1 - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
            status: ResponseStatus.ERROR,
            message: 'CARD_EXPIRED',
            cvNum: 1,
        },
    },
    {
        id: 27,
        label: 'Cancel Ride CV2 - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_CV2,
            timeout: 10000,
        },
    },
    {
        id: 27,
        label: 'Cancel Ride CV2 - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            timeout: 10000,
            cvNum: 2,
        },
    },
    {
        id: 27,
        label: 'Cancel Ride CV2 - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
            status: ResponseStatus.SUCCESS,
            cvNum: 2,
        },
    },
    {
        id: 27,
        label: 'Cancel Ride CV2 - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
            status: ResponseStatus.ERROR,
            message: 'CARD_EXPIRED',
            cvNum: 2,
        },
    },
];

export const concessionFlows = [
    {
        id: 27,
        label: 'Concession CV1 - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_CV1,
            timeout: 10000,
        },
    },
    {
        id: 28,
        label: 'Concession CV1 - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            timeout: 10000,
            cvNum: 1,
        },
    },
    {
        id: 28,
        label: 'Concession CV1 - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
            status: ResponseStatus.SUCCESS,
            message: 'VALID_PASS_USAGE',
            title: 'ADULT_FARE',
            cvNum: 1,
        },
    },
    {
        id: 28,
        label: 'Concession CV1 - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
            status: ResponseStatus.ERROR,
            message: 'BLAKCLISTED_CARD',
            cvNum: 1,
        },
    },

    {
        id: 27,
        label: 'Concession CV2 - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_CV2,
            timeout: 10000,
        },
    },
    {
        id: 28,
        label: 'Concession CV2 - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            timeout: 10000,
            cvNum: 2,
        },
    },
    {
        id: 28,
        label: 'Concession CV2 - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
            status: ResponseStatus.SUCCESS,
            cvNum: 2,
        },
    },
    {
        id: 28,
        label: 'Concession CV2 - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
            status: ResponseStatus.ERROR,
            message: 'BANK_CARD_NOT_SUPPORTED',
            cvNum: 2,
        },
    },
];

export const transactionFlows = [
    {
        id: 16,
        label: 'Transaction - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION,
            cvList: [1, 2],
        },
    },
    {
        id: 16,
        label: 'Transaction - Select CV',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_SELECT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            timeout: 10000,
            cvNum: 1,
        },
    },
    {
        id: 16,
        label: 'Transaction - Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            timeout: 10000,
        },
    },
    {
        id: 16,
        label: 'Transaction - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 16,
        label: 'Transaction 1 - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_2,
            status: ResponseStatus.ERROR,
            message: 'CARD_EXPIRED',
        },
    },
    {
        id: 16,
        label: 'Transaction 2 - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_1,
            status: ResponseStatus.ERROR,
            message: 'LOW_VALUE',
        },
    },
    {
        id: 16,
        label: 'Transaction 1 - Empty Transaction',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_2,
            status: ResponseStatus.SUCCESS,
            message: 'NO_RECORD',
        },
    },
    {
        id: 16,
        label: 'Transaction 2 - Empty Transaction',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_1,
            status: ResponseStatus.SUCCESS,
            message: 'NO_RECORD',
        },
    },
    {
        id: 16,
        label: 'Transaction - Information 1',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_2,
            status: ResponseStatus.SUCCESS,
            timeout: 10000,
            cardValue: 433.92,
            transactions: [
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 0,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 0,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: -20.6,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 0,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 0,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 20,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 0,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 0,
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 20,
                },
                // more data
            ],
        },
    },
    {
        id: 16,
        label: 'Transaction - Information 2',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_1,
            timeout: 10000,
            status: ResponseStatus.SUCCESS,
            transactions: [
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'ENTRY',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'EXIT',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'BREAKDOWN',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'ENTRY',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'EXIT',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'BREAKDOWN',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'ENTRY',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'EXIT',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'BREAKDOWN',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'ENTRY',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'EXIT',
                },
                {
                    date: '2025-05-14T16:25:38+07:00',
                    value: 'BREAKDOWN',
                },
            ],
        },
    },
    {
        id: 16,
        label: 'Transaction - Back',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TRANSACTION_BACK,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const topUpFlows = [
    {
        id: 28,
        label: 'Top Up - Nofify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TOP_UP,
            amounts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        },
    },
    {
        id: 28,
        label: 'Top Up - Select Amount',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TOP_UP_SELECT_AMT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            timeout: 10000,
            amount: 20,
        },
    },
    {
        id: 29,
        label: 'Top Up - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TOP_UP_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 29,
        label: 'Top Up - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_TOP_UP_SUBMIT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
        },
    },
];

export const fareBusStopModeFlows = [
    {
        id: 29,
        label: 'Fare Bus Stop Mode - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_BUS_STOP_MODE,
            mode: 1,
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
];

export const showCVStatusFlows = [
    {
        id: 16,
        label: 'Show CV Status',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_STATUS,
            cvStatus: [
                {
                    cvNum: 1,
                    status: 1,
                    subStatus: 2,
                },
                {
                    cvNum: 2,
                    status: 1,
                    subStatus: 5,
                },
                {
                    cvNum: 3,
                    status: 2,
                },
                {
                    cvNum: 4,
                    status: 1,
                    subStatus: 6,
                },
                {
                    cvNum: 5,
                    status: 4,
                },
                {
                    cvNum: 6,
                    status: 5,
                },
            ],
        },
    },
];

export const setCVFlows = [
    {
        id: 16,
        label: 'CV Entry Exit',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_ENTRY_EXIT,
            cvType: 1,
        },
    },
    {
        id: 16,
        label: 'CV Entry Exit - Confirm',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_ENTRY_EXIT_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 16,
        label: 'CV Entry Exit - Cancel',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_ENTRY_EXIT_CANCEL,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const cvModeControlFlows = [
    {
        id: 16,
        label: 'CV Mode Control - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_MODE_CONTROL,
        },
    },
    {
        id: 16,
        label: 'CV Mode Control - Select Mode',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_SELECT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            timeout: 10000,
            cvMode: 1,
        },
    },
    {
        id: 16,
        label: 'CV Mode Control - Select Mode Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_SELECT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
            cvMode: 1,
        },
    },
    {
        id: 16,
        label: 'CV Mode Control - Confirm',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 16,
        label: 'CV Mode Control - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.ERROR,
        },
    },
];

export const powerAllCVOnOffFlows = [
    {
        id: 16,
        label: 'CV Power All Cvs On - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_POWER_ALL_CV_ON,
            timeout: 10000,
        },
    },
    {
        id: 16,
        label: 'CV Power All Cvs Off - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_POWER_ALL_CV_OFF,
            timeout: 10000,
        },
    },

    {
        id: 16,
        label: 'Power All CVs ON/OFF - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_POWER_ALL_CV_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const cvPowerControlFlows = [
    // {
    //     id: 16,
    //     label: 'CV Power All CV - Confirm',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.FARE_CO_POWER_ALL_CV_CONFIRM,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.SUCCESS,
    //     },
    // },
    // {
    //     id: 16,
    //     label: 'CV Power All CV - Cancel',
    //     isLatest: true,
    //     data: {
    //         msgID: MsgID?.FARE_CO_POWER_ALL_CV_CANCEL,
    //         msgSubID: MsgSubID?.RESPONSE,
    //         status: ResponseStatus.SUCCESS,
    //     },
    // },

    {
        id: 16,
        label: 'CV Power Control - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_CV_POWER_CTRL,
            groups: [
                {
                    id: 1,
                    cvs: ['CV1', 'CV3', 'CV5'],
                    status: true,
                },
                {
                    id: 2,
                    cvs: ['CV2', 'CV4', 'CV6'],
                    status: false,
                },
            ],
        },
    },
];

export const resetAllCVFlows = [
    {
        id: 16,
        label: 'Reset All CV - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_RESET_ALL_CV,
            timeout: 10000,
        },
    },
    {
        id: 16,
        label: 'Reset All CV - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_CO_RESET_ALL_CV_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const printRetentionTicketFlows = [
    {
        id: 16,
        label: 'Print Retention Ticket - Notify',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINT_RETENTION_TICKET,
            cvList: [1, 2],
        },
    },
    {
        id: 16,
        label: 'Print Retention Ticket - Detect Card',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINT_RTK_SELECT,
            msgSubID: MsgSubID?.RESPONSE,
            timeout: 10000,
            cvNum: 1,
        },
    },
    {
        id: 16,
        label: 'Print Retention Ticket - Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINT_RTK_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.PROGRESS,
            timeout: 10000,
            cvNum: 1,
        },
    },
    {
        id: 16,
        label: 'Print Retention Ticket - Information',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINT_RTK_CONFIRM,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
            cardDetail: {
                id: '8002130012349305',
                value: 40.45,
            },
        },
    },
    {
        id: 16,
        label: 'Print Retention Ticket - Cancel',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINT_RTK_CANCEL,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 16,
        label: 'Print Retention Ticket - Print',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINT_RTK_PRINT,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 16,
        label: 'Print Retention Ticket - Back',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINT_RTK_BACK,
            msgSubID: MsgSubID?.RESPONSE,
            status: ResponseStatus.SUCCESS,
        },
    },
];

export const printStatusFlows = [
    {
        id: 16,
        label: 'Print Status - In Service',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINTER_STATUS,
            printerStatus: 1,
        },
    },
    {
        id: 16,
        label: 'Print Status - Out Of Service',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINTER_STATUS,
            printerStatus: 2,
        },
    },
    {
        id: 16,
        label: 'Print Status - Error',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINTER_STATUS,
            printerStatus: 3,
        },
    },
];

export const printerOnOffFlows = [
    {
        id: 16,
        label: 'Print On - IN Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINTER_ON,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 16,
        label: 'Print On - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINTER_ON,
            status: ResponseStatus.SUCCESS,
        },
    },
    {
        id: 16,
        label: 'Print Off - In Progress',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINTER_OFF,
            status: ResponseStatus.PROGRESS,
        },
    },
    {
        id: 16,
        label: 'Print Off - Success',
        isLatest: true,
        data: {
            msgID: MsgID?.FARE_PO_PRINTER_OFF,
            status: ResponseStatus.SUCCESS,
        },
    },
];
