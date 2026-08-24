import { MsgID, MsgSubID, ResponseStatus } from '@models';
import { flow } from './dummy-fixtures';

export const cancelRideFlows = [
    flow(27, 'Cancel Ride CV1 - Notify', { msgID: MsgID?.FARE_CANCEL_RIDE_CV1, timeout: 10000 }),
    flow(27, 'Cancel Ride CV1 - In Progress', {
        msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        timeout: 10000,
        cvNum: 1,
    }),
    flow(27, 'Cancel Ride CV1 - Success', {
        msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
        status: ResponseStatus.SUCCESS,
        cvNum: 1,
    }),
    flow(27, 'Cancel Ride CV1 - Error', {
        msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
        status: ResponseStatus.ERROR,
        message: 'CARD_EXPIRED',
        cvNum: 1,
    }),
    flow(27, 'Cancel Ride CV2 - Notify', { msgID: MsgID?.FARE_CANCEL_RIDE_CV2, timeout: 10000 }),
    flow(27, 'Cancel Ride CV2 - In Progress', {
        msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        timeout: 10000,
        cvNum: 2,
    }),
    flow(27, 'Cancel Ride CV2 - Success', {
        msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
        status: ResponseStatus.SUCCESS,
        cvNum: 2,
    }),
    flow(27, 'Cancel Ride CV2 - Error', {
        msgID: MsgID?.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
        status: ResponseStatus.ERROR,
        message: 'CARD_EXPIRED',
        cvNum: 2,
    }),
];

export const concessionFlows = [
    flow(27, 'Concession CV1 - Notify', { msgID: MsgID?.FARE_CONCESSION_CV1, timeout: 10000 }),
    flow(28, 'Concession CV1 - In Progress', {
        msgID: MsgID?.FARE_CONCESSION_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        timeout: 10000,
        cvNum: 1,
    }),
    flow(28, 'Concession CV1 - Success', {
        msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
        status: ResponseStatus.SUCCESS,
        message: 'VALID_PASS_USAGE',
        title: 'ADULT_FARE',
        cvNum: 1,
    }),
    flow(28, 'Concession CV1 - Error', {
        msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
        status: ResponseStatus.ERROR,
        message: 'BLAKCLISTED_CARD',
        cvNum: 1,
    }),
    flow(27, 'Concession CV2 - Notify', { msgID: MsgID?.FARE_CONCESSION_CV2, timeout: 10000 }),
    flow(28, 'Concession CV2 - In Progress', {
        msgID: MsgID?.FARE_CONCESSION_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        timeout: 10000,
        cvNum: 2,
    }),
    flow(28, 'Concession CV2 - Success', {
        msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
        status: ResponseStatus.SUCCESS,
        cvNum: 2,
    }),
    flow(28, 'Concession CV2 - Error', {
        msgID: MsgID?.FARE_CONCESSION_SUBMIT_NOTIFY,
        status: ResponseStatus.ERROR,
        message: 'BANK_CARD_NOT_SUPPORTED',
        cvNum: 2,
    }),
];

export const transactionFlows = [
    flow(16, 'Transaction - Notify', { msgID: MsgID?.FARE_TRANSACTION, cvList: [1, 2] }),
    flow(16, 'Transaction - Select CV', {
        msgID: MsgID?.FARE_TRANSACTION_SELECT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        timeout: 10000,
        cvNum: 1,
    }),
    flow(16, 'Transaction - Progress', {
        msgID: MsgID?.FARE_TRANSACTION_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        timeout: 10000,
    }),
    flow(16, 'Transaction - Success', {
        msgID: MsgID?.FARE_TRANSACTION_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(16, 'Transaction 1 - Error', {
        msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_2,
        status: ResponseStatus.ERROR,
        message: 'CARD_EXPIRED',
    }),
    flow(16, 'Transaction 2 - Error', {
        msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_1,
        status: ResponseStatus.ERROR,
        message: 'LOW_VALUE',
    }),
    flow(16, 'Transaction 1 - Empty Transaction', {
        msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_2,
        status: ResponseStatus.SUCCESS,
        message: 'NO_RECORD',
    }),
    flow(16, 'Transaction 2 - Empty Transaction', {
        msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_1,
        status: ResponseStatus.SUCCESS,
        message: 'NO_RECORD',
    }),
    flow(16, 'Transaction - Information 1', {
        msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_2,
        status: ResponseStatus.SUCCESS,
        timeout: 10000,
        cardValue: 433.92,
        transactions: [
            { date: '2025-05-14T16:25:38+07:00', value: 0 },
            { date: '2025-05-14T16:25:38+07:00', value: 0 },
            { date: '2025-05-14T16:25:38+07:00', value: -20.6 },
            { date: '2025-05-14T16:25:38+07:00', value: 0 },
            { date: '2025-05-14T16:25:38+07:00', value: 0 },
            { date: '2025-05-14T16:25:38+07:00', value: 20 },
            { date: '2025-05-14T16:25:38+07:00', value: 0 },
            { date: '2025-05-14T16:25:38+07:00', value: 0 },
            { date: '2025-05-14T16:25:38+07:00', value: 20 },
            // more data
        ],
    }),
    flow(16, 'Transaction - Information 2', {
        msgID: MsgID?.FARE_TRANSACTION_INFORMATION_TYPE_1,
        timeout: 10000,
        status: ResponseStatus.SUCCESS,
        transactions: [
            { date: '2025-05-14T16:25:38+07:00', value: 'ENTRY' },
            { date: '2025-05-14T16:25:38+07:00', value: 'EXIT' },
            { date: '2025-05-14T16:25:38+07:00', value: 'BREAKDOWN' },
            { date: '2025-05-14T16:25:38+07:00', value: 'ENTRY' },
            { date: '2025-05-14T16:25:38+07:00', value: 'EXIT' },
            { date: '2025-05-14T16:25:38+07:00', value: 'BREAKDOWN' },
            { date: '2025-05-14T16:25:38+07:00', value: 'ENTRY' },
            { date: '2025-05-14T16:25:38+07:00', value: 'EXIT' },
            { date: '2025-05-14T16:25:38+07:00', value: 'BREAKDOWN' },
            { date: '2025-05-14T16:25:38+07:00', value: 'ENTRY' },
            { date: '2025-05-14T16:25:38+07:00', value: 'EXIT' },
            { date: '2025-05-14T16:25:38+07:00', value: 'BREAKDOWN' },
        ],
    }),
    flow(16, 'Transaction - Back', {
        msgID: MsgID?.FARE_TRANSACTION_BACK,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const topUpFlows = [
    flow(28, 'Top Up - Nofify', { msgID: MsgID?.FARE_TOP_UP, amounts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] }),
    flow(28, 'Top Up - Select Amount', {
        msgID: MsgID?.FARE_TOP_UP_SELECT_AMT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        timeout: 10000,
        amount: 20,
    }),
    flow(29, 'Top Up - Success', {
        msgID: MsgID?.FARE_TOP_UP_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(29, 'Top Up - Error', {
        msgID: MsgID?.FARE_TOP_UP_SUBMIT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
    }),
];

export const fareBusStopModeFlows = [
    flow(29, 'Fare Bus Stop Mode - Notify', { msgID: MsgID?.FARE_BUS_STOP_MODE, mode: 1 }),
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
];

export const showCVStatusFlows = [
    flow(16, 'Show CV Status', {
        msgID: MsgID?.FARE_CO_CV_STATUS,
        cvStatus: [
            { cvNum: 1, status: 1, subStatus: 2 },
            { cvNum: 2, status: 1, subStatus: 5 },
            { cvNum: 3, status: 2 },
            { cvNum: 4, status: 1, subStatus: 6 },
            { cvNum: 5, status: 4 },
            { cvNum: 6, status: 5 },
        ],
    }),
];

export const setCVFlows = [
    flow(16, 'CV Entry Exit', { msgID: MsgID?.FARE_CO_CV_ENTRY_EXIT, cvType: 1 }),
    flow(16, 'CV Entry Exit - Confirm', {
        msgID: MsgID?.FARE_CO_CV_ENTRY_EXIT_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(16, 'CV Entry Exit - Cancel', {
        msgID: MsgID?.FARE_CO_CV_ENTRY_EXIT_CANCEL,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const cvModeControlFlows = [
    flow(16, 'CV Mode Control - Notify', { msgID: MsgID?.FARE_CO_CV_MODE_CONTROL }),
    flow(16, 'CV Mode Control - Select Mode', {
        msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_SELECT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        timeout: 10000,
        cvMode: 1,
    }),
    flow(16, 'CV Mode Control - Select Mode Error', {
        msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_SELECT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
        cvMode: 1,
    }),
    flow(16, 'CV Mode Control - Confirm', {
        msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(16, 'CV Mode Control - Error', {
        msgID: MsgID?.FARE_CO_CV_MODE_CONTROL_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.ERROR,
    }),
];

export const powerAllCVOnOffFlows = [
    flow(16, 'CV Power All Cvs On - Notify', { msgID: MsgID?.FARE_CO_POWER_ALL_CV_ON, timeout: 10000 }),
    flow(16, 'CV Power All Cvs Off - Notify', { msgID: MsgID?.FARE_CO_POWER_ALL_CV_OFF, timeout: 10000 }),
    flow(16, 'Power All CVs ON/OFF - Success', {
        msgID: MsgID?.FARE_CO_POWER_ALL_CV_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const cvPowerControlFlows = [
    flow(16, 'CV Power Control - Notify', {
        msgID: MsgID?.FARE_CO_CV_POWER_CTRL,
        groups: [
            { id: 1, cvs: ['CV1', 'CV3', 'CV5'], status: true },
            { id: 2, cvs: ['CV2', 'CV4', 'CV6'], status: false },
        ],
    }),
];

export const resetAllCVFlows = [
    flow(16, 'Reset All CV - Notify', { msgID: MsgID?.FARE_CO_RESET_ALL_CV, timeout: 10000 }),
    flow(16, 'Reset All CV - Success', {
        msgID: MsgID?.FARE_CO_RESET_ALL_CV_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const printRetentionTicketFlows = [
    flow(16, 'Print Retention Ticket - Notify', { msgID: MsgID?.FARE_PO_PRINT_RETENTION_TICKET, cvList: [1, 2] }),
    flow(16, 'Print Retention Ticket - Detect Card', {
        msgID: MsgID?.FARE_PO_PRINT_RTK_SELECT,
        msgSubID: MsgSubID?.RESPONSE,
        timeout: 10000,
        cvNum: 1,
    }),
    flow(16, 'Print Retention Ticket - Progress', {
        msgID: MsgID?.FARE_PO_PRINT_RTK_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.PROGRESS,
        timeout: 10000,
        cvNum: 1,
    }),
    flow(16, 'Print Retention Ticket - Information', {
        msgID: MsgID?.FARE_PO_PRINT_RTK_CONFIRM,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
        cardDetail: { id: '8002130012349305', value: 40.45 },
    }),
    flow(16, 'Print Retention Ticket - Cancel', {
        msgID: MsgID?.FARE_PO_PRINT_RTK_CANCEL,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(16, 'Print Retention Ticket - Print', {
        msgID: MsgID?.FARE_PO_PRINT_RTK_PRINT,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
    flow(16, 'Print Retention Ticket - Back', {
        msgID: MsgID?.FARE_PO_PRINT_RTK_BACK,
        msgSubID: MsgSubID?.RESPONSE,
        status: ResponseStatus.SUCCESS,
    }),
];

export const printStatusFlows = [
    flow(16, 'Print Status - In Service', { msgID: MsgID?.FARE_PO_PRINTER_STATUS, printerStatus: 1 }),
    flow(16, 'Print Status - Out Of Service', { msgID: MsgID?.FARE_PO_PRINTER_STATUS, printerStatus: 2 }),
    flow(16, 'Print Status - Error', { msgID: MsgID?.FARE_PO_PRINTER_STATUS, printerStatus: 3 }),
];

export const printerOnOffFlows = [
    flow(16, 'Print On - IN Progress', { msgID: MsgID?.FARE_PO_PRINTER_ON, status: ResponseStatus.PROGRESS }),
    flow(16, 'Print On - Success', { msgID: MsgID?.FARE_PO_PRINTER_ON, status: ResponseStatus.SUCCESS }),
    flow(16, 'Print Off - In Progress', { msgID: MsgID?.FARE_PO_PRINTER_OFF, status: ResponseStatus.PROGRESS }),
    flow(16, 'Print Off - Success', { msgID: MsgID?.FARE_PO_PRINTER_OFF, status: ResponseStatus.SUCCESS }),
];
