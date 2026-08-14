import { Injectable } from '@angular/core';
import { MqttService } from '@services/mqtt.service'; // Adjust import path as necessary
import MainPageData, {
    headwayTimeTable,
    nextBusInfo,
    cvIconsCount,
    fareConsole,
    services,
    cvData,
    busStopList,
    currentFmsTrip,
} from './main-page'; // Your dummy bus info data
import { MsgID, MsgSubID, ResponseStatus } from '@models';
import { versionInfoList, blsList } from './maintenance';
import { environment } from '@env/environment';
import { default as mainPageData } from './main-page';
import { timeout } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DummyInitService {
    constructor(private readonly mqttService: MqttService) {}
    // currentStartTrip = StartTripTypes?.FMS_NOT_CONNECTED;
    // Method to initialize dummy data
    initializeDummyData(topics): void {
        console.log('dummy data init');

        this.mqttService.subscribe({
            topic: topics?.mainTab?.get,
            callback: (message) => {
                const data = JSON.parse(message);
                const { header, payload } = data;
                // console.log('Received message on mainTab topic:', data);
                // if (data?.messageType === MqttTypes?.FE_REQUEST && data?.messageId === MessageId?.GET_MAIN_TAB_DATA) {
                //     // Publish the dummy data
                //     this.mqttService.publishWithFormat(topics?.mainPage?.response, {
                //         messaged: MainPageData,
                //         messageType: MqttTypes?.BE_RESPONSE,
                //         from: 'dummy-init',
                //         messageId: MessageId?.GET_MAIN_TAB_DATA,
                //     });
                // }
                switch (header?.msgID) {
                    case MsgID.LANGUAGE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.tcToAllTabs,
                            msgID: MsgID.LANGUAGE_NOTIFY,
                            msgSubID: MsgSubID.NOTIFY,
                            payload: { language: payload?.language },
                        });
                        break;

                    //start trip with no fms info
                    case MsgID.START_TRIP:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE,
                            msgSubID: MsgSubID.NOTIFY,
                            payload: { type: 'FMS_NO_INFO' },
                        });
                        break;
                    case MsgID.START_TRIP_GET_SERVICE_LIST:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.START_TRIP_GET_SERVICE_LIST,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;
                    case MsgID.START_TRIP_BUS_STOP_LIST:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.START_TRIP_BUS_STOP_LIST,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;

                    case MsgID.START_TRIP_SUBMIT_FARE_TRIP:
                    case MsgID.BREAKDOWN_PROCESS_BREAKDOWN_TICKET:
                    case MsgID.END_TRIP_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_PAGE_DATA,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                ...mainPageData,
                            },
                        });
                        break;

                    //external devices
                    case MsgID.EXTERNAL_DEVICES:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.EXTERNAL_DEVICES_NOTIFY,
                            msgSubID: MsgSubID.NOTIFY,
                            payload: {
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
                        });
                        break;
                    case MsgID.EXT_DEVICE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BUS_OPERATION_MENU,
                            msgSubID: MsgSubID.NOTIFY,
                            payload: {},
                        });
                        break;
                    case MsgID.END_TRIP:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.END_TRIP,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                msgSubID: MsgSubID?.RESPONSE,
                                status: ResponseStatus.SUCCESS,
                                timeout: 5000,
                            },
                        });
                        break;
                    case MsgID.END_TRIP_TYPE:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.END_TRIP_TYPE,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;

                    // main buttons
                    case MsgID.MAIN_BUTTON:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_BUTTON,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        if (payload?.btn === 'FREE') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.mainTab?.response,
                                msgID: MsgID.MAIN_FREE,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
                                    timeout: 10000,
                                },
                            });
                        } else if (payload?.btn === 'BREAKDOWN') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.mainTab?.response,
                                msgID: MsgID.MAIN_BREAKDOWN,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
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
                            });
                        } else if (payload?.btn === 'CASH') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.mainTab?.response,
                                msgID: MsgID.MAIN_CASH,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
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
                            });
                        } else if (payload?.btn === 'FRONT_DOOR') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.mainTab?.response,
                                msgID: MsgID.MAIN_FRONT_DOOR,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
                                    cvList: [1, 2],
                                },
                            });
                        }
                        break;

                    // free flow buttons
                    case MsgID.MAIN_FREE_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_FREE_CANCEL,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.MAIN_FREE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_FREE_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;

                    //breakdown flow buttons
                    case MsgID.BREAKDOWN_BUS_STOP_LIST:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_BUS_STOP_LIST,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;
                    case MsgID.BREAKDOWN_CHANGE_BUS_STOP:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_CHANGE_BUS_STOP,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT_REASON:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_SUBMIT_REASON,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT_COMP_TICKET:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_SUBMIT_COMP_TICKET,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.BREAKDOWN_PROCESS_COMP_TICKET:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_PROCESS_COMP_TICKET,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.BREAKDOWN_BACK_BUTTON:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_BACK_BUTTON,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.BREAKDOWN_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.BREAKDOWN_CANCEL,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;

                    //cash flow buttons
                    case MsgID.MAIN_CASH_SINGLE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_SINGLE_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.ERROR,
                                message: 'PRINTER_PAPER_JAM',
                            },
                            opts: { retain: true },
                        });
                        break;
                    case MsgID.MAIN_CASH_MULTI_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_MULTI_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                                type: 'ADULT',
                                cashIndex: 4,
                            },
                            opts: { retain: true },
                        });
                        break;
                    case MsgID.MAIN_CASH_MULTI_BACK:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_MULTI_BACK,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                            opts: { retain: true },
                        });
                        break;
                    case MsgID.MAIN_CASH_MULTI_CONFIRM:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_MULTI_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                            opts: { retain: true },
                        });
                        break;
                    case MsgID.MAIN_CASH_MULTI_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_MULTI_CANCEL,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                            opts: { retain: true },
                        });
                        break;
                    case MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                            opts: { retain: true },
                        });
                        break;
                    case MsgID.MAIN_CASH_FARE_CALCULATION_BACK:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BACK,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                            opts: { retain: true },
                        });
                        break;
                    case MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                            opts: { retain: true },
                        });
                        break;

                    //front door buttons
                    case MsgID.MAIN_FRONT_DOOR_SELECT_CV:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_FRONT_DOOR_SELECT_CV,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                cvNum: payload.cvNum || 2,
                                status: ResponseStatus.SUCCESS,
                                timeout: 10000,
                            },
                        });
                        break;
                    case MsgID.MAIN_FRONT_DOOR_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_FRONT_DOOR_CANCEL,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                    case MsgID.MAIN_FRONT_DOOR_CONFIRM:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.mainTab?.response,
                            msgID: MsgID.MAIN_FRONT_DOOR_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics?.maintenance?.get,
            callback: (message) => {
                const data = JSON.parse(message);
                const { header, payload } = data;
                switch (header?.msgID) {
                    case MsgID.MAINTENANCE_APP_UPGRADE:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_APP_UPGRADE,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { upgradeStatus: true, version: 'BTE.A.01.00.99' },
                        });
                        break;
                    case MsgID.MAINTENANCE_UPGRADE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_UPGRADE_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.MAINTENANCE_PARAMETER:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_PARAMETER,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                                parameters: Array.from({ length: 20 }, (_, idx) => ({
                                    fullName: `Cash Fare parameter ${idx * 1000 + 1}`,
                                    version: (idx * 100 + 234).toString(),
                                    date: '25/03/2025',
                                    time: '12:00:00',
                                    status: idx % 2 ? 'active' : 'inactive',
                                })),
                            },
                        });
                        break;

                    case MsgID.MAINTENANCE_FARE_CONSOLE:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;
                    case MsgID.MAINTENANCE_DECK_TYPE_LIST:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_DECK_TYPE_LIST,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                deckTypeList: [
                                    { id: 1, label: 'SINGLE' },
                                    { id: 2, label: 'DOUBLE_TWO_DOORS' },
                                    { id: 3, label: 'DOUBLE_THREE_DOORS' },
                                    { id: 4, label: 'LONG_BUS' },
                                    { id: 5, label: '1 BCV' },
                                ],
                            },
                        });
                        break;
                    case MsgID.FARE_BUS_STOP_MODE_SELECT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.FARE_BUS_STOP_MODE_SELECT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                timeout: 10000,
                                status: ResponseStatus.SUCCESS,
                                mode: 1,
                            },
                        });
                        break;
                    case MsgID.FARE_BUS_STOP_MODE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                                mode: 1,
                            },
                        });
                        break;
                    case MsgID.MAINTENANCE_DELETE_PARAMETER:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_DELETE_PARAMETER,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;

                    case MsgID.MAINTENANCE_BUS_ID:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_BUS_ID,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                busId: 'SBS4567',
                                operator: {
                                    id: 1,
                                    label: 'SBST',
                                    serviceProvider: 16,
                                },
                            },
                        });
                        break;

                    case MsgID.MAINTENANCE_VERSION_INFO:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_VERSION_INFO,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                                versionInfoList,
                            },
                        });
                        break;

                    case MsgID.MAINTENANCE_BLS_INFORMATION:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_BLS_INFORMATION,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                                blsList,
                            },
                        });
                        break;

                    case MsgID.MAINTENANCE_REDETECT_CV:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_REDETECT_CV,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;

                    case MsgID.MAINTENANCE_LOAD_PARAMETERS:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_LOAD_PARAMETERS,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;

                    case MsgID.MAINTENANCE_SAVE_TRANSACTION:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_SAVE_TRANSACTION,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;

                    case MsgID.MAINTENANCE_AUDIT_REGISTRATION:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.MAINTENANCE_AUDIT_REGISTRATION,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
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
                        });
                        break;

                    case MsgID.EXTERNAL_DEVICES:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.EXTERNAL_DEVICES_NOTIFY,
                            msgSubID: MsgSubID.NOTIFY,
                            payload: {
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
                        });
                        break;

                    case MsgID.DECOMMISSION:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.maintenance?.response,
                            msgID: MsgID.DECOMMISSION,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: {
                                status: ResponseStatus.SUCCESS,
                            },
                        });
                        break;
                }
            },
        });

        this.mqttService.subscribe({
            topic: topics?.fareTab?.get,
            callback: (message) => {
                const data = JSON.parse(message);
                const { header, payload } = data;
                switch (header?.msgID) {
                    case MsgID.FARE_MENU_BUTTON:
                        if (payload?.btn === 'CANCEL_RIDE_CV1') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CANCEL_RIDE_CV1,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { timeout: 10000 },
                            });
                        } else if (payload?.btn === 'CANCEL_RIDE_CV2') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CANCEL_RIDE_CV2,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { timeout: 10000 },
                            });
                        } else if (payload?.btn === 'CONCESSION_CV1') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CONCESSION_CV1,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { timeout: 10000 },
                            });
                        } else if (payload?.btn === 'CONCESSION_CV2') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CONCESSION_CV2,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { timeout: 10000 },
                            });
                        } else if (payload?.btn === 'TRANSACTION') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_TRANSACTION,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { cvList: [1, 2] },
                            });
                        } else if (payload?.btn === 'TOP_UP') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_TOP_UP,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { amounts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
                            });
                        } else if (payload?.btn === 'FARE_BUS_STOP_MODE') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_BUS_STOP_MODE,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {},
                            });
                        } else if (payload?.btn === 'CV_OPERATION') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CV_OPERATION,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {},
                            });
                        } else if (payload?.btn === 'PRINT_OPERATION') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_PRINTER_OPERATION,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {},
                            });
                        }
                        break;

                    case MsgID.FARE_CANCEL_RIDE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_CANCEL_RIDE_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.PROGRESS, timeout: 10000, cvNum: payload?.cvNum || 1 },
                        });
                        setTimeout(() => {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CANCEL_RIDE_SUBMIT_NOTIFY,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { status: ResponseStatus.SUCCESS, cvNum: payload?.cvNum || 1 },
                            });
                        }, 3000);
                        break;

                    case MsgID.FARE_CONCESSION_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_CONCESSION_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.PROGRESS, timeout: 10000, cvNum: payload?.cvNum || 1 },
                        });
                        setTimeout(() => {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CONCESSION_SUBMIT_NOTIFY,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { status: ResponseStatus.SUCCESS, cvNum: payload?.cvNum || 1 },
                            });
                        }, 3000);
                        break;

                    case MsgID.FARE_TRANSACTION_SELECT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_TRANSACTION_SELECT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS, timeout: 10000, cvNum: payload?.cvNum || 1 },
                        });
                        break;
                    case MsgID.FARE_TRANSACTION_CONFIRM:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_TRANSACTION_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        setTimeout(() => {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_TRANSACTION_INFORMATION_TYPE_2,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
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
                            });
                        }, 3000);
                        break;
                    case MsgID.FARE_TRANSACTION_BACK:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_TRANSACTION_BACK,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_TOP_UP_SELECT_AMT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_TOP_UP_SELECT_AMT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS, timeout: 10000, amount: payload?.amount || 20 },
                        });
                        break;
                    case MsgID.FARE_TOP_UP_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_TOP_UP_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_BUS_STOP_MODE_SELECT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_BUS_STOP_MODE_SELECT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { timeout: 10000, status: ResponseStatus.SUCCESS, mode: payload?.mode || 1 },
                        });
                        break;
                    case MsgID.FARE_BUS_STOP_MODE_SUBMIT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS, mode: payload?.mode || 1 },
                        });
                        break;

                    case MsgID.FARE_BACK_BUTTON:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_BACK_BUTTON,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_CV_OPERATION_BUTTON:
                        if (payload?.btn === 'SHOW_CV_STATUS') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CO_CV_STATUS,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
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
                            });
                        } else if (payload?.btn === 'SET_CV_ENTRY_EXIT') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CO_CV_ENTRY_EXIT,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
                                    cvType: 1,
                                },
                            });
                        } else if (payload?.btn === 'CV_MODE_CONTROL') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CO_CV_MODE_CONTROL,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {},
                            });
                        } else if (payload?.btn === 'POWER_ALL_CV_ON') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CO_POWER_ALL_CV_ON,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { timeout: 10000 },
                            });
                        } else if (payload?.btn === 'POWER_ALL_CV_OFF') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CO_POWER_ALL_CV_OFF,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { timeout: 10000 },
                            });
                        } else if (payload?.btn === 'CV_POWER_CONTROL') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CO_CV_POWER_CTRL,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
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
                            });
                        } else if (payload?.btn === 'RESET_ALL_CV') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_CO_RESET_ALL_CV,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {
                                    timeout: 10000,
                                },
                            });
                        }
                        break;

                    case MsgID.FARE_CV_OPERATION_BACK:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_CV_OPERATION_BACK,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;
                    case MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;
                    case MsgID.FARE_CO_CV_ENTRY_EXIT_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_CO_CV_ENTRY_EXIT_CANCEL,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_CO_CV_MODE_CONTROL_SELECT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_CO_CV_MODE_CONTROL_SELECT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS, timeout: 10000, cvMode: payload?.cvMode || 1 },
                        });
                        break;
                    case MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_CO_POWER_ALL_CV_CONFIRM:
                    case MsgID.FARE_CO_POWER_ALL_CV_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: header?.msgID || MsgID.FARE_CO_POWER_ALL_CV_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_CO_RESET_ALL_CV_CONFIRM:
                    case MsgID.FARE_CO_RESET_ALL_CV_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: header?.msgID || MsgID.FARE_CO_RESET_ALL_CV_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_PRINT_OPERATION_BUTTON:
                        if (payload?.btn === 'PRINT_RETENTION_TICKET') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_PO_PRINT_RETENTION_TICKET,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { cvList: [1, 2] },
                            });
                        } else if (payload?.btn === 'PRINT_ON') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_PO_PRINTER_ON,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {},
                            });
                        } else if (payload?.btn === 'PRINT_OFF') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_PO_PRINTER_ON,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: {},
                            });
                        } else if (payload?.btn === 'PRINTER_STATUS') {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_PO_PRINTER_STATUS,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { printerStatus: 1 },
                            });
                        }
                        break;

                    case MsgID.FARE_PO_PRINT_RTK_SELECT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_PO_PRINT_RTK_SELECT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { timeout: 10000, cvNum: payload?.cvNum || 1 },
                        });
                        break;
                    case MsgID.FARE_PO_PRINT_RTK_CONFIRM:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_PO_PRINT_RTK_CONFIRM,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.PROGRESS, timeout: 10000, cvNum: payload?.cvNum || 1 },
                        });
                        setTimeout(() => {
                            this.mqttService.publishWithMessageFormat({
                                topic: topics?.fareTab?.response,
                                msgID: MsgID.FARE_PO_PRINT_RTK_CONFIRM,
                                msgSubID: MsgSubID.RESPONSE,
                                payload: {
                                    status: ResponseStatus.SUCCESS,
                                    cardDetail: {
                                        id: '8002130012349305',
                                        value: 40.45,
                                    },
                                },
                            });
                        }, 3000);
                        break;

                    case MsgID.FARE_PO_PRINT_RTK_CANCEL:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_PO_PRINT_RTK_CANCEL,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;
                    case MsgID.FARE_PO_PRINT_RTK_PRINT:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_PO_PRINT_RTK_PRINT,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;

                    case MsgID.FARE_PO_PRINT_RTK_BACK:
                        this.mqttService.publishWithMessageFormat({
                            topic: topics?.fareTab?.response,
                            msgID: MsgID.FARE_PO_PRINT_RTK_BACK,
                            msgSubID: MsgSubID.RESPONSE,
                            payload: { status: ResponseStatus.SUCCESS },
                        });
                        break;
                }
            },
        });

        // this.mqttService?.subscribe({
        //     topic: topics.cvIcon?.get,
        //     callback: (mes) => {
        //         const { header, payload } = JSON.parse(mes);
        //         if (header?.msgID === MsgID.CV_ICONS && header?.msgSubID === MsgSubID.REQUEST) {
        //             this.mqttService.publishWithMessageFormat({
        //                 topic: topics.cvIcon?.response,
        //                 msgID: MsgID.CV_ICONS,
        //                 msgSubID: MsgSubID?.RESPONSE,
        //                 payload: cvData,
        //             });
        //         }
        //     },
        // });

        // this.mqttService.subscribe({
        //     topic: topics?.cvIcon?.get,
        //     callback: (message) => {
        //         const data = JSON.parse(message);
        //         if (data?.requestType === MqttTypes?.FE_REQUEST && data?.messageId === MessageId?.CV_AVAIL_STATUS) {
        //             // Publish the dummy data
        //             this.mqttService.publish(
        //                 topics?.cvIcon?.response,
        //                 JSON.stringify({
        //                     ...cvIconsCount,
        //                     requestType: MqttTypes?.BE_RESPONSE,
        //                     messageId: MessageId?.CV_AVAIL_STATUS,
        //                     from: 'dummy-init',
        //                 }),
        //             );
        //         }
        //     },
        // });
        // this.mqttService.subscribe({
        //     topic: topics?.vehicleState?.get,
        //     callback: (message) => {
        //         const data = JSON.parse(message);
        //         if (data?.requestType === MqttTypes?.FE_REQUEST) {
        //             // Publish the dummy data
        //             this.mqttService.publishWithFormat(topics?.vehicleState?.response, {
        //                 messaged: nextBusInfo,
        //                 requestType: MqttTypes?.BE_RESPONSE,
        //                 messageId: MessageId?.NEXT_BUS_INFO,
        //             });
        //         }
        //     },
        // });

        // this.mqttService.subscribe({
        //     topic: topics?.mainTab?.get,
        //     callback: (message) => {
        //         const data = JSON.parse(message);
        //         const { header, payload } = data;
        //         if (header?.msgID === -2) {
        //             this.currentStartTrip = payload?.type;
        //         }
        //         if (header?.msgID === MsgID?.LOGIN_COMMISSIONING && header?.msgSubID === MsgSubID?.REQUEST) {
        //             const isValid = payload?.value?.length === 3;
        //             this.mqttService?.publishWithMessageFormat({
        //                 topic: topics.mainTab?.response,
        //                 msgID: isValid ? MsgID?.BOOT_UP_COMMISSIONING : MsgID?.LOGIN_COMMISSIONING,
        //                 msgSubID: isValid ? MsgSubID?.NOTIFY : MsgSubID?.RESPONSE,
        //                 payload: {
        //                     ...(isValid
        //                         ? { type: CommissioningType?.CLEARING_ALL_DATA }
        //                         : { messageKey: 'COMMISSIONING_IVALID_NUMERS' }),
        //                 },
        //             });
        //         }
        //         if (header?.msgID === MsgID?.START_TRIP && header?.msgSubID === MsgSubID?.REQUEST) {
        //             this.mqttService?.publishWithMessageFormat({
        //                 topic: topics.mainTab?.response,
        //                 msgID: MsgID?.START_TRIP,
        //                 msgSubID: MsgSubID?.RESPONSE,
        //                 payload: {
        //                     type: this.currentStartTrip,
        //                 },
        //             });
        //         }
        //         if (header?.msgID === MsgID?.START_TRIP_GET_SERVICE_LIST && header?.msgSubID === MsgSubID?.REQUEST) {
        //             this.mqttService?.publishWithMessageFormat({
        //                 topic: topics.mainTab?.response,
        //                 msgID: MsgID?.START_TRIP_GET_SERVICE_LIST,
        //                 msgSubID: MsgSubID?.RESPONSE,
        //                 payload: services,
        //             });
        //         }
        //         if (header?.msgID === MsgID?.BUS_STOP_LIST && header?.msgSubID === MsgSubID?.REQUEST) {
        //             this.mqttService?.publishWithMessageFormat({
        //                 topic: topics.mainTab?.response,
        //                 msgID: MsgID?.BUS_STOP_LIST,
        //                 msgSubID: MsgSubID?.RESPONSE,
        //                 payload: busStopList,
        //             });
        //         }
        //         if (
        //             header?.msgID === MsgID?.START_TRIP_GET_FMS_TRIP_DETAILS &&
        //             header?.msgSubID === MsgSubID?.REQUEST
        //         ) {
        //             this.mqttService?.publishWithMessageFormat({
        //                 topic: topics.mainTab?.response,
        //                 msgID: MsgID?.START_TRIP_GET_FMS_TRIP_DETAILS,
        //                 msgSubID: MsgSubID?.RESPONSE,
        //                 payload: currentFmsTrip,
        //             });
        //         }
        //         if (header?.msgID === MsgID?.START_TRIP_SUBMIT_FARE_TRIP && header?.msgSubID === MsgSubID?.REQUEST) {
        //             this.mqttService?.publishWithMessageFormat({
        //                 topic: topics.mainTab?.response,
        //                 msgID: MsgID?.START_TRIP_SUBMIT_FARE_TRIP,
        //                 msgSubID: MsgSubID?.RESPONSE,
        //                 payload: {
        //                     messageKey: MessageKeys?.FARE_TRIP_DETAILS_SUCCESS,
        //                 },
        //             });
        //         }
        //         if (data?.messageId === MessageId?.AUTH) {
        //             const status = data?.messaged?.status;
        //             switch (status) {
        //                 case AuthStatus.BOOT_UP:
        //                     // Publish the dummy data
        //                     this.mqttService.publishWithFormat(topics?.mainTab?.response, {
        //                         messaged: bootUp,
        //                         messageId: MessageId?.AUTH,
        //                         messageType: MqttTypes?.BE_RESPONSE,
        //                     });
        //                     break;
        //                 case AuthStatus.FARE_CONSOLE_SETTING:
        //                     // Publish the dummy data
        //                     this.mqttService.publishWithFormat(topics?.mainTab?.response, {
        //                         messaged: fareConsole,
        //                         messageId: MessageId?.AUTH,
        //                         messageType: MqttTypes?.BE_RESPONSE,
        //                     });
        //                     break;
        //             }
        //         } else if (header?.msgID || data?.msgID) {
        //             const msgID = data?.header?.msgID || data?.msgID;
        //             switch (msgID) {
        //                 case MsgID.BOOT_UP:
        //                     // Publish the dummy data
        //                     this.mqttService.publishWithMessageFormat({
        //                         topic: topics?.mainTab?.response,
        //                         msgID: MsgID.BOOT_UP,
        //                         msgSubID: MsgSubID.NOTIFY,
        //                         payload: bootUp,
        //                     });
        //                     break;
        //                 // case MsgID.TRIGGER_DAGW_OPERATION:
        //                 //     // Publish the dummy data
        //                 //     this.mqttService.publishWithMessageFormat({
        //                 //         topic: topics?.mainTab?.response,
        //                 //         msgID: MsgID.DAGW_OPERATION,
        //                 //         msgSubID: MsgSubID.NOTIFY,
        //                 //         payload: {
        //                 //             title: dagwOperation.popMsgtitle[0],
        //                 //             message: dagwOperation.popMsgtext[0],
        //                 //         },
        //                 //     });
        //                 //     break;

        //                 // case MsgID.TRIGGER_BOLC_STATUS:
        //                 //     // Publish the dummy data
        //                 //     this.mqttService.publishWithMessageFormat({
        //                 //         topic: topics?.mainTab?.response,
        //                 //         msgID: MsgID.TRIGGER_BOLC_STATUS,
        //                 //         msgSubID: MsgSubID.NOTIFY,
        //                 //         payload: data.payload,
        //                 //     });
        //                 //     break;
        //             }
        //         }
        //     },
        // });
    }
}
