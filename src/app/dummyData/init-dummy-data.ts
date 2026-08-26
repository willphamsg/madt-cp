import { Injectable } from '@angular/core';
import { IClientPublishOptions } from 'mqtt';
import { MqttService } from '@services/mqtt.service';
import { MsgID, MsgSubID, ResponseStatus } from '@models';
import { versionInfoList, blsList, auditRegistrationList } from './maintenance';
import mainPageData from './main-page';
import {
    BISHAN_BUS_STOP_LIST,
    SEMBAWANG_KM_BUS_STOP_LIST,
    EXTERNAL_DEVICES_ERROR_STATUS,
    SAMPLE_TRIP_DETAIL,
    BREAKDOWN_REASON_LIST,
    CASH_FARE_VALUES,
    SAMPLE_SERVICE_LIST,
    DECK_TYPE_LIST,
    BUS_ID_INFO,
    REDETECT_CV_LIST,
    FARE_CONSOLE_CONFIG,
} from './dummy-fixtures';

@Injectable({
    providedIn: 'root',
})
export class DummyInitService {
    constructor(private readonly mqttService: MqttService) {}

    private reply(
        topic: string,
        msgID: number,
        msgSubID: number,
        payload?: unknown,
        opts?: IClientPublishOptions,
    ): void {
        this.mqttService.publishWithMessageFormat({ topic, msgID, msgSubID, payload, opts });
    }

    private handleFareMenuButton(payload: any, replyFare: (msgID: number, msgSubID: number, body?: unknown) => void) {
        if (payload?.btn === 'CANCEL_RIDE_CV1') {
            replyFare(MsgID.FARE_CANCEL_RIDE_CV1, MsgSubID.NOTIFY, { timeout: 10000 });
        } else if (payload?.btn === 'CANCEL_RIDE_CV2') {
            replyFare(MsgID.FARE_CANCEL_RIDE_CV2, MsgSubID.NOTIFY, { timeout: 10000 });
        } else if (payload?.btn === 'CONCESSION_CV1') {
            replyFare(MsgID.FARE_CONCESSION_CV1, MsgSubID.NOTIFY, { timeout: 10000 });
        } else if (payload?.btn === 'CONCESSION_CV2') {
            replyFare(MsgID.FARE_CONCESSION_CV2, MsgSubID.NOTIFY, { timeout: 10000 });
        } else if (payload?.btn === 'TRANSACTION') {
            replyFare(MsgID.FARE_TRANSACTION, MsgSubID.NOTIFY, { cvList: [1, 2] });
        } else if (payload?.btn === 'TOP_UP') {
            replyFare(MsgID.FARE_TOP_UP, MsgSubID.NOTIFY, {
                amounts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            });
        } else if (payload?.btn === 'FARE_BUS_STOP_MODE') {
            replyFare(MsgID.FARE_BUS_STOP_MODE, MsgSubID.NOTIFY, {});
        } else if (payload?.btn === 'CV_OPERATION') {
            replyFare(MsgID.FARE_CV_OPERATION, MsgSubID.NOTIFY, {});
        } else if (payload?.btn === 'PRINT_OPERATION') {
            replyFare(MsgID.FARE_PRINTER_OPERATION, MsgSubID.NOTIFY, {});
        }
    }

    private handleFareCvOperationButton(
        payload: any,
        replyFare: (msgID: number, msgSubID: number, body?: unknown) => void,
    ) {
        if (payload?.btn === 'SHOW_CV_STATUS') {
            replyFare(MsgID.FARE_CO_CV_STATUS, MsgSubID.NOTIFY, {
                cvStatus: [
                    { cvNum: 1, status: 1, subStatus: 2 },
                    { cvNum: 2, status: 1, subStatus: 5 },
                    { cvNum: 3, status: 2 },
                    { cvNum: 4, status: 1, subStatus: 6 },
                    { cvNum: 5, status: 4 },
                    { cvNum: 6, status: 5 },
                ],
            });
        } else if (payload?.btn === 'SET_CV_ENTRY_EXIT') {
            replyFare(MsgID.FARE_CO_CV_ENTRY_EXIT, MsgSubID.NOTIFY, { cvType: 1 });
        } else if (payload?.btn === 'CV_MODE_CONTROL') {
            replyFare(MsgID.FARE_CO_CV_MODE_CONTROL, MsgSubID.NOTIFY, {});
        } else if (payload?.btn === 'POWER_ALL_CV_ON') {
            replyFare(MsgID.FARE_CO_POWER_ALL_CV_ON, MsgSubID.NOTIFY, { timeout: 10000 });
        } else if (payload?.btn === 'POWER_ALL_CV_OFF') {
            replyFare(MsgID.FARE_CO_POWER_ALL_CV_OFF, MsgSubID.NOTIFY, { timeout: 10000 });
        } else if (payload?.btn === 'CV_POWER_CONTROL') {
            replyFare(MsgID.FARE_CO_CV_POWER_CTRL, MsgSubID.NOTIFY, {
                groups: [
                    { id: 1, cvs: ['CV1', 'CV3', 'CV5'], status: true },
                    { id: 2, cvs: ['CV2', 'CV4', 'CV6'], status: false },
                ],
            });
        } else if (payload?.btn === 'RESET_ALL_CV') {
            replyFare(MsgID.FARE_CO_RESET_ALL_CV, MsgSubID.NOTIFY, { timeout: 10000 });
        }
    }

    private handleFarePrintOperationButton(
        payload: any,
        replyFare: (msgID: number, msgSubID: number, body?: unknown) => void,
    ) {
        if (payload?.btn === 'PRINT_RETENTION_TICKET') {
            replyFare(MsgID.FARE_PO_PRINT_RETENTION_TICKET, MsgSubID.NOTIFY, { cvList: [1, 2] });
        } else if (payload?.btn === 'PRINT_ON') {
            replyFare(MsgID.FARE_PO_PRINTER_ON, MsgSubID.NOTIFY, {});
        } else if (payload?.btn === 'PRINT_OFF') {
            replyFare(MsgID.FARE_PO_PRINTER_OFF, MsgSubID.NOTIFY, {});
        } else if (payload?.btn === 'PRINTER_STATUS') {
            replyFare(MsgID.FARE_PO_PRINTER_STATUS, MsgSubID.NOTIFY, { printerStatus: 1 });
        }
    }

    // Method to initialize dummy data
    initializeDummyData(topics): void {
        console.log('dummy data init');

        this.mqttService.subscribe({
            topic: topics?.mainTab?.get,
            callback: (message) => {
                const data = JSON.parse(message);
                const { header, payload } = data;
                const replyMain = (msgID: number, msgSubID: number, body?: unknown, opts?: IClientPublishOptions) =>
                    this.reply(topics?.mainTab?.response, msgID, msgSubID, body, opts);

                switch (header?.msgID) {
                    case MsgID.LANGUAGE_SUBMIT:
                        replyMain(MsgID.LANGUAGE_NOTIFY, MsgSubID.NOTIFY, { language: payload?.language });
                        break;

                    //start trip with no fms info
                    case MsgID.START_TRIP:
                        replyMain(MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE, MsgSubID.NOTIFY, {
                            type: 'FMS_NO_INFO',
                        });
                        break;
                    case MsgID.START_TRIP_GET_SERVICE_LIST:
                        replyMain(MsgID.START_TRIP_GET_SERVICE_LIST, MsgSubID.RESPONSE, {
                            services: SAMPLE_SERVICE_LIST,
                        });
                        break;
                    case MsgID.START_TRIP_BUS_STOP_LIST:
                        replyMain(MsgID.START_TRIP_BUS_STOP_LIST, MsgSubID.RESPONSE, {
                            busStopList: BISHAN_BUS_STOP_LIST,
                        });
                        break;

                    case MsgID.START_TRIP_SUBMIT_FARE_TRIP:
                    case MsgID.BREAKDOWN_PROCESS_BREAKDOWN_TICKET:
                    case MsgID.END_TRIP_SUBMIT:
                        replyMain(MsgID.MAIN_PAGE_DATA, MsgSubID.RESPONSE, { ...mainPageData });
                        break;

                    //external devices
                    case MsgID.EXTERNAL_DEVICES:
                        replyMain(MsgID.EXTERNAL_DEVICES_NOTIFY, MsgSubID.NOTIFY, EXTERNAL_DEVICES_ERROR_STATUS);
                        break;
                    case MsgID.EXT_DEVICE_SUBMIT:
                        replyMain(MsgID.BUS_OPERATION_MENU, MsgSubID.NOTIFY, {});
                        break;
                    case MsgID.END_TRIP:
                        replyMain(MsgID.END_TRIP, MsgSubID.RESPONSE, {
                            msgSubID: MsgSubID?.RESPONSE,
                            status: ResponseStatus.SUCCESS,
                            timeout: 5000,
                        });
                        break;
                    case MsgID.END_TRIP_TYPE:
                        replyMain(MsgID.END_TRIP_TYPE, MsgSubID.RESPONSE, {
                            timeout: 4000,
                            msgID: MsgID?.END_TRIP_TYPE,
                            msgSubID: MsgSubID?.RESPONSE,
                            title: 'END_TRIP_DETAILS',
                            ...SAMPLE_TRIP_DETAIL,
                        });
                        break;

                    // main buttons
                    case MsgID.MAIN_BUTTON:
                        replyMain(MsgID.MAIN_BUTTON, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        if (payload?.btn === 'FREE') {
                            replyMain(MsgID.MAIN_FREE, MsgSubID.NOTIFY, { timeout: 10000 });
                        } else if (payload?.btn === 'BREAKDOWN') {
                            replyMain(MsgID.MAIN_BREAKDOWN, MsgSubID.NOTIFY, {
                                timeout: 10000,
                                title: 'END_TRIP_BREAKDOWN_DETAIL',
                                ...SAMPLE_TRIP_DETAIL,
                            });
                        } else if (payload?.btn === 'CASH') {
                            replyMain(MsgID.MAIN_CASH, MsgSubID.NOTIFY, {
                                status: ResponseStatus.SUCCESS,
                                ...CASH_FARE_VALUES,
                            });
                        } else if (payload?.btn === 'FRONT_DOOR') {
                            replyMain(MsgID.MAIN_FRONT_DOOR, MsgSubID.NOTIFY, { cvList: [1, 2] });
                        }
                        break;

                    // free flow buttons
                    case MsgID.MAIN_FREE_CANCEL:
                        replyMain(MsgID.MAIN_FREE_CANCEL, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;
                    case MsgID.MAIN_FREE_SUBMIT:
                        replyMain(MsgID.MAIN_FREE_SUBMIT, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;

                    //breakdown flow buttons
                    case MsgID.BREAKDOWN_BUS_STOP_LIST:
                        replyMain(MsgID.BREAKDOWN_BUS_STOP_LIST, MsgSubID.RESPONSE, {
                            busStopList: BISHAN_BUS_STOP_LIST,
                        });
                        break;
                    case MsgID.BREAKDOWN_CHANGE_BUS_STOP:
                        replyMain(MsgID.BREAKDOWN_CHANGE_BUS_STOP, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT:
                        replyMain(MsgID.BREAKDOWN_SUBMIT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            reasonList: BREAKDOWN_REASON_LIST,
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT_REASON:
                        replyMain(MsgID.BREAKDOWN_SUBMIT_REASON, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT_COMP_TICKET:
                        replyMain(MsgID.BREAKDOWN_SUBMIT_COMP_TICKET, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                    case MsgID.BREAKDOWN_PROCESS_COMP_TICKET:
                        replyMain(MsgID.BREAKDOWN_PROCESS_COMP_TICKET, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET:
                        replyMain(MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                    case MsgID.BREAKDOWN_BACK_BUTTON:
                        replyMain(MsgID.BREAKDOWN_BACK_BUTTON, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;
                    case MsgID.BREAKDOWN_CANCEL:
                        replyMain(MsgID.BREAKDOWN_CANCEL, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;
                }

                switch (header?.msgID) {
                    //cash flow buttons
                    case MsgID.MAIN_CASH_SINGLE_SUBMIT:
                        replyMain(
                            MsgID.MAIN_CASH_SINGLE_SUBMIT,
                            MsgSubID.RESPONSE,
                            { status: ResponseStatus.ERROR, message: 'PRINTER_PAPER_JAM' },
                            { retain: true },
                        );
                        break;
                    case MsgID.MAIN_CASH_MULTI_SUBMIT:
                        replyMain(
                            MsgID.MAIN_CASH_MULTI_SUBMIT,
                            MsgSubID.RESPONSE,
                            { status: ResponseStatus.SUCCESS, type: 'ADULT', cashIndex: 4 },
                            { retain: true },
                        );
                        break;
                    case MsgID.MAIN_CASH_MULTI_BACK:
                        replyMain(
                            MsgID.MAIN_CASH_MULTI_BACK,
                            MsgSubID.RESPONSE,
                            { status: ResponseStatus.SUCCESS },
                            { retain: true },
                        );
                        break;
                    case MsgID.MAIN_CASH_MULTI_CONFIRM:
                        replyMain(
                            MsgID.MAIN_CASH_MULTI_CONFIRM,
                            MsgSubID.RESPONSE,
                            { status: ResponseStatus.SUCCESS },
                            { retain: true },
                        );
                        break;
                    case MsgID.MAIN_CASH_MULTI_CANCEL:
                        replyMain(
                            MsgID.MAIN_CASH_MULTI_CANCEL,
                            MsgSubID.RESPONSE,
                            { status: ResponseStatus.SUCCESS },
                            { retain: true },
                        );
                        break;
                    case MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP:
                        replyMain(
                            MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
                            MsgSubID.RESPONSE,
                            { status: ResponseStatus.SUCCESS, busStopList: SEMBAWANG_KM_BUS_STOP_LIST },
                            { retain: true },
                        );
                        break;
                    case MsgID.MAIN_CASH_FARE_CALCULATION_BACK:
                        replyMain(
                            MsgID.MAIN_CASH_FARE_CALCULATION_BACK,
                            MsgSubID.RESPONSE,
                            { status: ResponseStatus.SUCCESS },
                            { retain: true },
                        );
                        break;
                    case MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE:
                        replyMain(
                            MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
                            MsgSubID.RESPONSE,
                            {
                                status: ResponseStatus.SUCCESS,
                                adultFare: 1.7,
                                seniorFare: 0.85,
                                studentFare: 1.2,
                                exitBusStop: { Busid: '11231', Name: 'BUSPARK' },
                                entryBusStop: { Busid: '122', Name: 'BISHAN INT BOARDING 2' },
                            },
                            { retain: true },
                        );
                        break;

                    //front door buttons
                    case MsgID.MAIN_FRONT_DOOR_SELECT_CV:
                        replyMain(MsgID.MAIN_FRONT_DOOR_SELECT_CV, MsgSubID.RESPONSE, {
                            cvNum: payload.cvNum || 2,
                            status: ResponseStatus.SUCCESS,
                            timeout: 10000,
                        });
                        break;
                    case MsgID.MAIN_FRONT_DOOR_CANCEL:
                        replyMain(MsgID.MAIN_FRONT_DOOR_CANCEL, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;
                    case MsgID.MAIN_FRONT_DOOR_CONFIRM:
                        replyMain(MsgID.MAIN_FRONT_DOOR_CONFIRM, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics?.maintenance?.get,
            callback: (message) => {
                const data = JSON.parse(message);
                const { header } = data;
                const replyMaintenance = (
                    msgID: number,
                    msgSubID: number,
                    body?: unknown,
                    opts?: IClientPublishOptions,
                ) => this.reply(topics?.maintenance?.response, msgID, msgSubID, body, opts);

                switch (header?.msgID) {
                    case MsgID.MAINTENANCE_APP_UPGRADE:
                        replyMaintenance(MsgID.MAINTENANCE_APP_UPGRADE, MsgSubID.RESPONSE, {
                            upgradeStatus: true,
                            version: 'BTE.A.01.00.99',
                        });
                        break;
                    case MsgID.MAINTENANCE_UPGRADE_SUBMIT:
                        replyMaintenance(MsgID.MAINTENANCE_UPGRADE_SUBMIT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.MAINTENANCE_PARAMETER:
                        replyMaintenance(MsgID.MAINTENANCE_PARAMETER, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            parameters: Array.from({ length: 20 }, (_, idx) => ({
                                fullName: `Cash Fare parameter ${idx * 1000 + 1}`,
                                version: (idx * 100 + 234).toString(),
                                date: '25/03/2025',
                                time: '12:00:00',
                                status: idx % 2 ? 'active' : 'inactive',
                            })),
                        });
                        break;

                    case MsgID.MAINTENANCE_FARE_CONSOLE:
                        replyMaintenance(MsgID.MAINTENANCE_FARE_CONSOLE, MsgSubID.RESPONSE, FARE_CONSOLE_CONFIG);
                        break;
                    case MsgID.MAINTENANCE_DECK_TYPE_LIST:
                        replyMaintenance(MsgID.MAINTENANCE_DECK_TYPE_LIST, MsgSubID.RESPONSE, {
                            deckTypeList: DECK_TYPE_LIST,
                        });
                        break;
                    case MsgID.FARE_BUS_STOP_MODE_SELECT:
                        replyMaintenance(MsgID.FARE_BUS_STOP_MODE_SELECT, MsgSubID.RESPONSE, {
                            timeout: 10000,
                            status: ResponseStatus.SUCCESS,
                            mode: 1,
                        });
                        break;
                    case MsgID.FARE_BUS_STOP_MODE_SUBMIT:
                        replyMaintenance(MsgID.FARE_BUS_STOP_MODE_SUBMIT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            mode: 1,
                        });
                        break;
                    case MsgID.MAINTENANCE_DELETE_PARAMETER:
                        replyMaintenance(MsgID.MAINTENANCE_DELETE_PARAMETER, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.MAINTENANCE_BUS_ID:
                        replyMaintenance(MsgID.MAINTENANCE_BUS_ID, MsgSubID.RESPONSE, BUS_ID_INFO);
                        break;

                    case MsgID.MAINTENANCE_VERSION_INFO:
                        replyMaintenance(MsgID.MAINTENANCE_VERSION_INFO, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            versionInfoList,
                        });
                        break;

                    case MsgID.MAINTENANCE_BLS_INFORMATION:
                        replyMaintenance(MsgID.MAINTENANCE_BLS_INFORMATION, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            blsList,
                        });
                        break;

                    case MsgID.MAINTENANCE_REDETECT_CV:
                        replyMaintenance(MsgID.MAINTENANCE_REDETECT_CV, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            cvList: REDETECT_CV_LIST,
                        });
                        break;

                    case MsgID.MAINTENANCE_LOAD_PARAMETERS:
                        replyMaintenance(MsgID.MAINTENANCE_LOAD_PARAMETERS, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.MAINTENANCE_SAVE_TRANSACTION:
                        replyMaintenance(MsgID.MAINTENANCE_SAVE_TRANSACTION, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.MAINTENANCE_AUDIT_REGISTRATION:
                        replyMaintenance(MsgID.MAINTENANCE_AUDIT_REGISTRATION, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            gcmSpidName: 'SBST',
                            gcmSpidNumber: 32,
                            ngcmSpidName: '',
                            ngcmSpidNumber: 16,
                            auditRegisterList: auditRegistrationList,
                        });
                        break;

                    case MsgID.EXTERNAL_DEVICES:
                        replyMaintenance(MsgID.EXTERNAL_DEVICES_NOTIFY, MsgSubID.NOTIFY, EXTERNAL_DEVICES_ERROR_STATUS);
                        break;

                    case MsgID.DECOMMISSION:
                        replyMaintenance(MsgID.DECOMMISSION, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics?.fareTab?.get,
            callback: (message) => {
                const data = JSON.parse(message);
                const { header, payload } = data;
                const replyFare = (msgID: number, msgSubID: number, body?: unknown, opts?: IClientPublishOptions) =>
                    this.reply(topics?.fareTab?.response, msgID, msgSubID, body, opts);

                switch (header?.msgID) {
                    case MsgID.FARE_MENU_BUTTON:
                        this.handleFareMenuButton(payload, replyFare);
                        break;

                    case MsgID.FARE_CANCEL_RIDE_SUBMIT:
                        replyFare(MsgID.FARE_CANCEL_RIDE_SUBMIT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.PROGRESS,
                            timeout: 10000,
                            cvNum: payload?.cvNum || 1,
                        });
                        setTimeout(() => {
                            replyFare(MsgID.FARE_CANCEL_RIDE_SUBMIT_NOTIFY, MsgSubID.NOTIFY, {
                                status: ResponseStatus.SUCCESS,
                                cvNum: payload?.cvNum || 1,
                            });
                        }, 3000);
                        break;

                    case MsgID.FARE_CONCESSION_SUBMIT:
                        replyFare(MsgID.FARE_CONCESSION_SUBMIT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.PROGRESS,
                            timeout: 10000,
                            cvNum: payload?.cvNum || 1,
                        });
                        setTimeout(() => {
                            replyFare(MsgID.FARE_CONCESSION_SUBMIT_NOTIFY, MsgSubID.NOTIFY, {
                                status: ResponseStatus.SUCCESS,
                                cvNum: payload?.cvNum || 1,
                            });
                        }, 3000);
                        break;

                    case MsgID.FARE_TRANSACTION_SELECT:
                        replyFare(MsgID.FARE_TRANSACTION_SELECT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            timeout: 10000,
                            cvNum: payload?.cvNum || 1,
                        });
                        break;
                    case MsgID.FARE_TRANSACTION_CONFIRM:
                        replyFare(MsgID.FARE_TRANSACTION_CONFIRM, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        setTimeout(() => {
                            replyFare(MsgID.FARE_TRANSACTION_INFORMATION_TYPE_2, MsgSubID.NOTIFY, {
                                status: ResponseStatus.SUCCESS,
                                timeout: 10000,
                                cardValue: 433.92,
                                transactions: [
                                    { date: '2025-05-14T16:25:38+07:00', value: 0 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 0 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 20 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 0 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 0 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 20 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 0 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 0 },
                                    { date: '2025-05-14T16:25:38+07:00', value: 20 },
                                    // more data
                                ],
                            });
                        }, 3000);
                        break;
                    case MsgID.FARE_TRANSACTION_BACK:
                        replyFare(MsgID.FARE_TRANSACTION_BACK, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;

                    case MsgID.FARE_TOP_UP_SELECT_AMT:
                        replyFare(MsgID.FARE_TOP_UP_SELECT_AMT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            timeout: 10000,
                            amount: payload?.amount || 20,
                        });
                        break;
                    case MsgID.FARE_TOP_UP_SUBMIT:
                        replyFare(MsgID.FARE_TOP_UP_SUBMIT, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;

                    case MsgID.FARE_BUS_STOP_MODE_SELECT:
                        replyFare(MsgID.FARE_BUS_STOP_MODE_SELECT, MsgSubID.RESPONSE, {
                            timeout: 10000,
                            status: ResponseStatus.SUCCESS,
                            mode: payload?.mode || 1,
                        });
                        break;
                    case MsgID.FARE_BUS_STOP_MODE_SUBMIT:
                        replyFare(MsgID.FARE_BUS_STOP_MODE_SUBMIT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            mode: payload?.mode || 1,
                        });
                        break;

                    case MsgID.FARE_BACK_BUTTON:
                        replyFare(MsgID.FARE_BACK_BUTTON, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;

                    case MsgID.FARE_CV_OPERATION_BUTTON:
                        this.handleFareCvOperationButton(payload, replyFare);
                        break;

                    case MsgID.FARE_CV_OPERATION_BACK:
                        replyFare(MsgID.FARE_CV_OPERATION_BACK, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;
                    case MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM:
                        replyFare(MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                    case MsgID.FARE_CO_CV_ENTRY_EXIT_CANCEL:
                        replyFare(MsgID.FARE_CO_CV_ENTRY_EXIT_CANCEL, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.FARE_CO_CV_MODE_CONTROL_SELECT:
                        replyFare(MsgID.FARE_CO_CV_MODE_CONTROL_SELECT, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                            timeout: 10000,
                            cvMode: payload?.cvMode || 1,
                        });
                        break;
                    case MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM:
                        replyFare(MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.FARE_CO_POWER_ALL_CV_CONFIRM:
                    case MsgID.FARE_CO_POWER_ALL_CV_CANCEL:
                        replyFare(header?.msgID || MsgID.FARE_CO_POWER_ALL_CV_CONFIRM, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.FARE_CO_RESET_ALL_CV_CONFIRM:
                    case MsgID.FARE_CO_RESET_ALL_CV_CANCEL:
                        replyFare(header?.msgID || MsgID.FARE_CO_RESET_ALL_CV_CONFIRM, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;

                    case MsgID.FARE_PRINT_OPERATION_BUTTON:
                        this.handleFarePrintOperationButton(payload, replyFare);
                        break;

                    case MsgID.FARE_PO_PRINT_RTK_SELECT:
                        replyFare(MsgID.FARE_PO_PRINT_RTK_SELECT, MsgSubID.RESPONSE, {
                            timeout: 10000,
                            cvNum: payload?.cvNum || 1,
                        });
                        break;
                    case MsgID.FARE_PO_PRINT_RTK_CONFIRM:
                        replyFare(MsgID.FARE_PO_PRINT_RTK_CONFIRM, MsgSubID.RESPONSE, {
                            status: ResponseStatus.PROGRESS,
                            timeout: 10000,
                            cvNum: payload?.cvNum || 1,
                        });
                        setTimeout(() => {
                            replyFare(MsgID.FARE_PO_PRINT_RTK_CONFIRM, MsgSubID.RESPONSE, {
                                status: ResponseStatus.SUCCESS,
                                cardDetail: { id: '8002130012349305', value: 40.45 },
                            });
                        }, 3000);
                        break;

                    case MsgID.FARE_PO_PRINT_RTK_CANCEL:
                        replyFare(MsgID.FARE_PO_PRINT_RTK_CANCEL, MsgSubID.RESPONSE, {
                            status: ResponseStatus.SUCCESS,
                        });
                        break;
                    case MsgID.FARE_PO_PRINT_RTK_PRINT:
                        replyFare(MsgID.FARE_PO_PRINT_RTK_PRINT, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;

                    case MsgID.FARE_PO_PRINT_RTK_BACK:
                        replyFare(MsgID.FARE_PO_PRINT_RTK_BACK, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS });
                        break;
                }
            },
        });
    }
}
