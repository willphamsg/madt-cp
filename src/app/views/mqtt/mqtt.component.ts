import { Component, OnInit, OnDestroy } from '@angular/core';
import { MqttService } from '@services/mqtt.service';
import { MatButtonModule } from '@angular/material/button';

import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms'; // Import FormsModule to use ngModel
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import MainPageDummy, {
    dagwOperation,
    bootUpAndShutdown,
    commissioningFlows,
    outOfServices,
    bcLoginFlows,
    manualLoginFlows,
    msTapCardFlows,
    startTripFlows,
    externalDevicesFlows,
    freeFlows,
    breakDownFlows,
    frontDoorAndRearDoorFlows,
    endTripFlows,
    cashPaymentFlows,
} from '@dummyData/main-page';
import {
    maintenanceAppUpgradeFlows,
    maintenanceViewParameterFlows,
    maintenanceFareConsoleFlows,
    maintenanceBlsCalibrateFlows,
    maintenanceVersionInfoFlows,
    maintenanceBLSInfoFlows,
    maintenanceRedectCVFlows,
    maintenanceLoadParameterFlows,
    maintenanceSaveTransactionFlows,
    maintenanceAuditRegistrationFlows,
    maintenanceExtDeviceFlows,
    maintenanceDecommissioningFlows,
} from '@dummyData/maintenance';
import { randomFraction, randomIndex } from '@dummyData/dummy-fixtures';
import * as fareDummy from '@dummyData/fare';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, takeUntil } from 'rxjs';
import {
    MessageId,
    MqttTypes,
    HTTimeColor,
    MsgID,
    MsgSubID,
    CvDirTypeArray,
    ResponseStatus,
    CommissioningType,
    MainPagePopUp,
    StartTripTypes,
} from '@models';

@Component({
    selector: 'app-mqtt',
    imports: [MatButtonModule, FormsModule, MatSelectModule, MatSlideToggleModule, MatInputModule, MatCheckboxModule],
    templateUrl: './mqtt.component.html',
    styleUrls: ['./mqtt.component.scss'],
})
export class MqttComponent implements OnInit, OnDestroy {
    MsgID = MsgID;
    [x: string]: any;

    private readonly destroy$ = new Subject<void>();
    brokerUrl: any = {
        host: 'broker.hivemq.com',
        protocol: 'ws',
        port: '8000',
        path: '/mqtt',
    }; // 'ws://broker.hivemq.com:8000/mqtt'; // Property to bind the input field
    timeHeadColor = HTTimeColor;
    isConnected: boolean | null = null;
    isLoading: boolean | null = true;
    topics: any; // Define topics variable
    cvUrl: any;
    cvErrorMsg: string = '';
    isError: boolean = false;
    activeIcon: any;

    cvDirOptions = CvDirTypeArray;
    routeInit = {
        now: null,
        dest: null,
        fareBusStop: null,
    };
    currentMainPagePop: string = MainPagePopUp?.BUS_STOP_MISMATCH;
    currentRoute = this.routeInit;
    busRouteList = MainPageDummy?.fareBusStopList;
    headTimeTTable = {
        currentBlock: 'RWS8-09',
        isHeadway: true,
        minSec: '0:40',
        bars: 1,
        direction: 'left',
        color: 'blue',
    };
    dirTypes = [
        {
            label: 'Now',
            val: 'now',
        },
        {
            label: 'Destination',
            val: 'dest',
        },
        {
            label: 'Next',
            val: 'next',
        },
        {
            label: 'Current Bus Stop',
            val: 'CURRENT_BUS_STOP',
        },
    ];

    nextBusInfo = {
        show: false,
        busBehindOccupancy: 0,
        busBehindTime: 0,
    };

    iconNames: any = [
        {
            value: 1,
            url: '/assets/images/icons/main/workfare-icon.svg',
        },
        {
            value: 2,
            url: '/assets/images/icons/main/pwd.svg',
        },
        {
            value: 3,
            url: '/assets/images/icons/main/soldier-icon.svg',
        },
        {
            value: 4,
            url: '/assets/images/icons/main/student-icon.svg',
        },
        {
            value: 5,
            url: '/assets/images/icons/main/senior-icon.svg',
        },
        {
            value: 6,
            url: '/assets/images/icons/main/children-icon.svg',
        },
        {
            value: 7,
            url: '/assets/images/icons/main/staff-icon.svg',
        },
        {
            value: 8,
            url: '/assets/images/icons/main/workfare-icon.svg',
        },
        {
            value: 10,
            url: '/assets/images/icons/main/madt-success.svg',
        },
        {
            value: 9,
            url: '',
        },
    ];
    autoBls: undefined | boolean;
    manualBls: undefined | boolean;
    misMatch: undefined | boolean;
    isUpstage: undefined | boolean;
    fareBusStopIndex = -1;
    fmsBusStop: any = {
        busServiceNum: '105m',
        plateNum: 'SBS34567',
        spid: 'AAA(27)',
        dir: 8,
        km: '50.5',
    };

    bootUpData = bootUpAndShutdown;
    commissioningFlows = commissioningFlows;
    outOfServices = outOfServices;
    bcLoginFlows = bcLoginFlows;
    manualLoginFlows = manualLoginFlows;
    msTapCardFlows = msTapCardFlows;
    startTripFlows = startTripFlows;
    externalDevicesFlows = externalDevicesFlows;
    freeFlows = freeFlows;
    breakDownFlows = breakDownFlows;
    frontDoorAndRearDoorFlows = frontDoorAndRearDoorFlows;
    endTripFlows = endTripFlows;
    cashPaymentFlows = cashPaymentFlows;

    maintenanceAppUpgradeFlows = maintenanceAppUpgradeFlows;
    maintenanceViewParameterFlows = maintenanceViewParameterFlows;
    maintenanceFareConsoleFlows = maintenanceFareConsoleFlows;
    maintenanceBlsCalibrateFlows = maintenanceBlsCalibrateFlows;
    maintenanceVersionInfoFlows = maintenanceVersionInfoFlows;
    maintenanceBLSInfoFlows = maintenanceBLSInfoFlows;
    maintenanceRedectCVFlows = maintenanceRedectCVFlows;
    maintenanceLoadParameterFlows = maintenanceLoadParameterFlows;
    maintenanceSaveTransactionFlows = maintenanceSaveTransactionFlows;
    maintenanceAuditRegistrationFlows = maintenanceAuditRegistrationFlows;
    maintenanceExtDeviceFlows = maintenanceExtDeviceFlows;
    maintenanceDecommissioningFlows = maintenanceDecommissioningFlows;

    cancelRideFlows = fareDummy.cancelRideFlows;
    concessionFlows = fareDummy.concessionFlows;
    transactionFlows = fareDummy.transactionFlows;
    topUpFlows = fareDummy.topUpFlows;
    fareBusStopModeFlows = fareDummy.fareBusStopModeFlows;
    showCVStatusFlows = fareDummy.showCVStatusFlows;
    setCVFlows = fareDummy.setCVFlows;
    cvModeControlFlows = fareDummy.cvModeControlFlows;
    powerAllCVOnOffFlows = fareDummy.powerAllCVOnOffFlows;
    cvPowerControlFlows = fareDummy.cvPowerControlFlows;
    resetAllCVFlows = fareDummy.resetAllCVFlows;
    printRetentionTicketFlows = fareDummy.printRetentionTicketFlows;
    printStatusFlows = fareDummy.printStatusFlows;
    printerOnOffFlows = fareDummy.printerOnOffFlows;

    authList = [
        {
            id: 17,
            label: 'Main Page Data',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_PAGE_DATA,
                msgSubID: MsgSubID?.NOTIFY,
                ...MainPageDummy,
            },
        },
        {
            id: 5,
            label: 'Bus Operation menu (Start trip | End shift)',
            isLatest: true,
            data: {
                msgID: MsgID?.BUS_OPERATION_MENU,
            },
        },

        {
            id: 21,
            label: 'Redeem - Error',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_REDEEM,
                message: 'PRINTER_PAPER_JAM',
            },
        },
        {
            id: 22,
            label: 'Lock - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.NOTIFY_TO_LOCK,
            },
        },
        {
            id: 22,
            label: 'Unlock - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.UNLOCK_SUCCESS,
            },
        },
        {
            id: 22,
            label: 'Display Access Denied',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_ACCESS_DENIED,
            },
        },
        // {
        //     id: 22,
        //     label: 'Unlock - Success',
        //     isLatest: true,
        //     data: {
        //         msgID: MsgID?.UNLOCK_SUBMIT,
        //         msgSubID: MsgSubID?.RESPONSE,
        //         status: ResponseStatus.SUCCESS,
        //     },
        // },
        // {
        //     id: 22,
        //     label: 'Unlock - Failure',
        //     isLatest: true,
        //     data: {
        //         msgID: MsgID?.UNLOCK_SUBMIT,
        //         msgSubID: MsgSubID?.RESPONSE,
        //         status: ResponseStatus.ERROR,
        //         message: 'INVALID_CODE',
        //     },
        // },

        {
            id: 17,
            label: 'Update Service Info',
            isLatest: true,
            data: {
                msgID: MsgID?.CURRENT_SERVICE_INFO,
                msgSubID: MsgSubID?.NOTIFY,
                busServiceNum: '20',
                plateNum: 'SBS1234',
                dir: 2,
                variantName: 'M',
                topic: 'TC/UpdateMainTab/CurrentServiceInfo',
            },
        },
        {
            id: 17,
            label: 'Update FMS Bus stop',
            isLatest: true,
            data: {
                msgID: MsgID?.UPDATE_FMS_BUS_STOP,
                msgSubID: MsgSubID?.NOTIFY,
                busServiceNum: '20',
                plateNum: 'SBS1234',
                dir: 2,
                km: '30.5',
                variantName: 'M',
                fmsBusStopList: [
                    {
                        Busid: '57059',
                        Name: 'Opp Sembawang Air Base',
                        time: '09:39',
                        aitp: true,
                    },
                    {
                        Busid: '57051',
                        Name: 'Sembawang MRT Station Exit A',
                        time: '09:42',
                        aitp: true,
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
                        aitp: true,
                    },
                    {
                        Busid: '57021',
                        Name: 'Sembawang Road Blk 241',
                        time: '09:48',
                        aitp: true,
                    },
                    {
                        Busid: '57011',
                        Name: 'Opp Sembawang Park',
                        time: '09:50',
                        aitp: true,
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
                ],
                topic: 'TC/UpdateMainTab/FMSBusStop',
            },
        },
        {
            id: 17,
            label: 'Update Fare Bus stop',
            isLatest: true,
            data: {
                msgID: MsgID?.UPDATE_FARE_BUS_STOP_LIST,
                msgSubID: MsgSubID?.NOTIFY,
                fareBusStopList: [
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
                        flag: 'active',
                        misMatch: true,
                        manualBls: true,
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
                        flag: 'disabled',
                    },
                    {
                        Busid: '56981',
                        Name: 'Sembawang Road Blk 435',
                        km: '15.2',
                        flag: 'disabled',
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
                topic: 'TC/UpdateMainTab/FareBusStopList',
            },
        },

        {
            id: 14,
            label: 'End Shift',
            isLatest: true,
            data: {
                msgID: MsgID?.END_SHIFT,
                msgSubID: MsgSubID?.RESPONSE,
                status: ResponseStatus?.SUCCESS,
            },
        },

        {
            id: 17,
            label: 'Commissioning In-progress',
            isLatest: true,
            data: {
                msgID: MsgID?.BOOT_UP_COMMISSIONING,
                msgSubID: MsgSubID?.NOTIFY,
                message: CommissioningType?.IN_PROGRESS,
            },
        },

        {
            id: 17,
            label: 'Commissioning Clearing All Data',
            isLatest: true,
            data: {
                msgID: MsgID?.BOOT_UP_COMMISSIONING,
                msgSubID: MsgSubID?.NOTIFY,
                message: CommissioningType?.CLEARING_ALL_DATA,
            },
        },

        {
            id: 17,
            label: 'Commissioning Completed Clear Data',
            isLatest: true,
            data: {
                msgID: MsgID?.BOOT_UP_COMMISSIONING,
                msgSubID: MsgSubID?.NOTIFY,
                message: CommissioningType?.COMPLETED_CLEANING,
            },
        },

        {
            id: 23,
            label: 'CV - Upgrade Pending',
            isLatest: true,
            data: {
                msgID: MsgID?.CV_UPGRADE,
                status: ResponseStatus?.PROGRESS,
            },
        },
        {
            id: 23,
            label: 'CV - Upgrade Success',
            isLatest: true,
            data: {
                msgID: MsgID?.CV_UPGRADE,
                status: ResponseStatus?.SUCCESS,
            },
        },

        {
            id: 23,
            label: 'Ignition Off - Warning',
            isLatest: true,
            data: {
                msgID: MsgID?.IGNITION_OFF,
                currentTime: '2025-04-15T23:02:08+08:00',
                delay: 10,
            },
        },
        {
            id: 23,
            label: 'Ignition Off - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.IGNITION_OFF,
                msgSubID: MsgSubID?.RESPONSE,
            },
        },

        {
            id: 25,
            label: 'Bus Off Route On - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.BUS_OFF_ROUTE,
                status: true,
            },
        },
        {
            id: 25,
            label: 'Bus Off Route Off - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.BUS_OFF_ROUTE,
                status: false,
            },
        },
        {
            id: 25,
            label: 'Checkpoint - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_CHECK_POINT,
            },
        },
        // {
        //     id: 26,
        //     label: 'Disable BLS - Notify',
        //     isLatest: true,
        //     data: {
        //         msgID: MsgID?.AUTO_DISABLE_BLS,
        //     },
        // },
        {
            id: 25,
            label: 'CJB Plate NUmber - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_CJB_PLATE_NUMBER,
                message: '12345',
            },
        },
        {
            id: 25,
            label: 'FARE BUS STOP MODE - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_FARE_BUS_STOP_MODE,
            },
        },
        {
            id: 25,
            label: 'Inspector Card - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.INVALID_INSPECTOR_CARD,
                message: 'NO_IPD_CONNECTION',
            },
        },
        {
            id: 25,
            label: 'FARE BUS STOP MODE - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_BUS_STOP_MODE_SUBMIT,
                msgSubID: MsgSubID?.RESPONSE,
                status: ResponseStatus.SUCCESS,
            },
        },
        {
            id: 25,
            label: 'Automatically Disable BLS - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.AUTO_DISABLE_BLS_CONFIRM,
                msgSubID: MsgSubID?.RESPONSE,
                status: ResponseStatus.SUCCESS,
            },
        },
        {
            id: 25,
            label: 'Bypass 10 bus stops - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_BYPASS_TEN_BUS_STOP,
            },
        },
        {
            id: 25,
            label: 'FMS and BLS are not working - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_FMS_BLS_ARE_NOT_WORKING,
            },
        },
        {
            id: 25,
            label: 'BLS Recovered - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_BLS_RECOVERED,
            },
        },
        {
            id: 26,
            label: 'Up/Down - Response',
            isLatest: true,
            data: {
                msgID: MsgID?.MAIN_UP_DOWN_BTN,
                msgSubID: MsgSubID?.RESPONSE,
                busStopId: MainPageDummy.fareBusStopList[randomIndex(MainPageDummy.fareBusStopList.length)]?.Busid,
                index: randomIndex(MainPageDummy.fareBusStopList.length),
            },
        },

        {
            id: 25,
            label: 'Update Audio Volume',
            isLatest: true,
            data: {
                msgID: MsgID?.AUDIO_VOLUME_NOTIFY,
                value: randomFraction() * 100,
                topic: 'TC/UpdateAllTCTabs',
            },
        },
    ];

    maintenanceList = [
        {
            id: 23,
            label: 'Ignition Off - Warning',
            isLatest: true,
            data: {
                msgID: MsgID?.IGNITION_OFF,
                currentTime: '2025-04-15T23:02:08+08:00',
            },
        },
        {
            id: 23,
            label: 'Ignition Off - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.IGNITION_OFF,
                msgSubID: MsgSubID?.RESPONSE,
            },
        },
        {
            id: 24,
            label: 'Notification - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.MAINTENANCE_RESULT_NOTIFICATION,
                status: ResponseStatus.SUCCESS,
                message: 'INFORMATION_IS_UPDATED',
            },
        },
        {
            id: 30,
            label: 'TC Date Time - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_TC_DATETIME,
                date: '2025-04-22T20:24:23+08:00',
            },
        },
        {
            id: 24,
            label: ' Print Error',
            isLatest: true,
            data: {
                msgID: MsgID?.COMMON_PRINT_ERROR,
                message: 'COMMS_ERROR',
            },
        },
        {
            id: 25,
            label: 'Back to Landing Page',
            isLatest: true,
            data: {
                msgID: MsgID?.MAINTENANCE_BACK,
                msgSubID: MsgSubID?.RESPONSE,
                status: 1,
            },
        },
    ];

    fareList = [
        {
            id: 29,
            label: 'CV Operation - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_CV_OPERATION,
            },
        },
        {
            id: 29,
            label: 'Print Operation - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_PRINTER_OPERATION,
            },
        },
        {
            id: 30,
            label: 'Back to Fare',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_BACK_BUTTON,
                msgSubID: MsgSubID?.RESPONSE,
                status: ResponseStatus.SUCCESS,
            },
        },
        {
            id: 30,
            label: 'BACK to CV Operation',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_CV_OPERATION_BACK,
                msgSubID: MsgSubID?.RESPONSE,
                status: ResponseStatus.SUCCESS,
            },
        },
        {
            id: 25,
            label: 'Bus Off Route - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.BUS_OFF_ROUTE,
            },
        },
        // {
        //     id: 26,
        //     label: 'Disable BLS - Notify',
        //     isLatest: true,
        //     data: {
        //         msgID: MsgID?.AUTO_DISABLE_BLS,
        //     },
        // },
        {
            id: 30,
            label: 'Print Error',
            isLatest: true,
            data: {
                msgID: MsgID?.COMMON_PRINT_ERROR,
                status: ResponseStatus.ERROR,
                message: 'PRINTER_PAPER_JAM',
            },
        },

        {
            id: 22,
            label: 'Lock - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.NOTIFY_TO_LOCK,
            },
        },
        {
            id: 22,
            label: 'Unlock - Success',
            isLatest: true,
            data: {
                msgID: MsgID?.UNLOCK_SUCCESS,
            },
        },
        {
            id: 4,
            label: 'Manual PIN Timer Timeout',
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
            label: 'Manual Enter PIN Successfully',
            isLatest: true,
            data: {
                msgID: MsgID?.MANUAL_LOGIN_PIN2,
                msgSubID: MsgSubID?.RESPONSE,
                timeout: 5000,
                status: 1,
            },
        },

        // {
        //     id: 30,
        //     label: 'Fare - Screen',
        //     isLatest: true,
        //     data: {
        //         msgID: MsgID?.FARE_SCREEN,
        //     },
        // },
        {
            id: 30,
            label: 'BYPASS BLACKLIST - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_BYPASS_BLACKLIST_ACTIVE,
            },
        },
        {
            id: 30,
            label: 'BYPASS BLACKLIST OFF - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_BYPASS_BLACKLIST_INACTIVE,
            },
        },
        {
            id: 30,
            label: 'SPID - Notify',
            isLatest: true,
            data: {
                msgID: MsgID?.FARE_SPID,
                message: 'LDBO(27)',
            },
        },
    ];

    mainPagePopUpList = Object.values(MainPagePopUp);
    startTripList = Object.values(StartTripTypes);
    currentStartTripFlow = this.startTripList[0];
    startTripNotification = false;
    connectionStatusInit = {
        connection: {
            statusBTS: false,
            statusBOLC: false,
            statusFARE: false,
            statusFMS: false,
            statusCRP: false,
        },
        trigger: {
            triggerBOLCButton: false,
        },
    };
    connectionStatus = this.connectionStatusInit;

    authData: any = {};
    maintenanceData: any = {};
    fareData: any = {};

    dagwOperation = dagwOperation;
    dagwOperationPublish = {
        title: '',
        message: '',
        percentage: 0,
        tickButton: '',
        fileName: '',
        status: null,
    };
    cvStatusChanger: any = [];
    activeCvDir: any;

    maintenanceScreen: number = 1;
    fareScreen: number = 1;

    constructor(private readonly mqttService: MqttService) {}

    onCheckboxChange(event: any, option: any) {
        if (event.checked) {
            this.cvStatusChanger.push(option);
        } else {
            this.cvStatusChanger = this.cvStatusChanger.filter((item) => item !== option);
        }
    }

    updateConnectionStatus(reset?) {
        this.mqttService?.publishWithFormat(
            this.topics?.tcToAllTabs,
            reset
                ? ''
                : {
                      messaged: this.connectionStatus.connection,
                      messageId: MessageId?.CONNECTION_STATUS,
                      messageType: MqttTypes?.BE_RESPONSE,
                  },
            { retain: true },
        );
        if (reset) {
            this.connectionStatus = this.connectionStatusInit;
        }
    }
    sendCvStatus() {
        const formatMess = this.cvStatusChanger.map((item) => ({
            cvNumber: item,
            statuses: this.activeCvDir?.map(Number),
        }));

        this.mqttService.publishWithMessageFormat({
            topic: this.topics.mainTab?.cv?.response,
            msgID: MsgID.CV_STATUS,
            msgSubID: MsgSubID?.NOTIFY,
            payload: formatMess,
            opts: { retain: true },
        });
    }

    handleToggleStatus(field: string, msgID: number, status: boolean) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.[field]?.response,
            msgID,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                [field]: status,
            },
            opts: { retain: true },
        });
    }

    updateConnectionButton() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.response,
            msgID: MsgID.TRIGGER_BOLC_STATUS,
            msgSubID: MsgSubID.NOTIFY,
            payload: this.connectionStatus.trigger,
            opts: { retain: true },
        });
    }

    sendAuth() {
        console.log({ authData: this.authData });
        this.mqttService.publishWithFormat(this.topics?.mainTab?.response, {
            messaged: this.authData,
            messageId: MessageId?.AUTH,
            messageType: MqttTypes?.BE_RESPONSE,
        });
    }
    sendRedirect() {
        // console.log(this.authData);
        const { msgID, msgSubID, ...payload } = this.authData;
        // console.log({ payload, msgID, msgSubID });
        this.mqttService.publishWithMessageFormat({
            topic: payload.topic || this.topics?.mainTab?.response,
            msgID: msgID,
            msgSubID: msgSubID || MsgSubID?.NOTIFY,
            payload: payload || this.authData,
            opts: { retain: true },
        });
    }

    sendMaintenanceRedirect() {
        // console.log(this.authData);
        const { msgID, msgSubID, ...payload } = this.maintenanceData;

        this.mqttService.publishWithMessageFormat({
            topic: this.getTopicByMsgID(msgID) || this.topics?.maintenance?.response,
            msgID: msgID,
            msgSubID: msgSubID || MsgSubID?.NOTIFY,
            payload,
            opts: { retain: true },
        });
    }

    sendFareRedirect() {
        const { msgID, msgSubID, ...payload } = this.fareData;

        this.mqttService.publishWithMessageFormat({
            topic: this.getTopicByMsgID(msgID) || this.topics?.fareTab?.response,
            msgID: msgID,
            msgSubID: msgSubID || MsgSubID?.NOTIFY,
            payload,
            opts: { retain: true },
        });
    }

    sendStartTripFlow() {
        const data = {};
        if (
            this.currentStartTripFlow === StartTripTypes.FMS_VALID_INFO ||
            StartTripTypes.FMS_TRIP_INFO_MISMATCH === this.currentStartTripFlow ||
            StartTripTypes.FMS_BUS_STOP_MISMATCH === this.currentStartTripFlow
        ) {
            data['serviceNumber'] = 20;
            data['variantName'] = 'A LP';
            data['dir'] = 1;
            data['busStop'] = {
                Busid: '1',
                Name: 'Bus Stop 1',
            };
        }

        this.mqttService.publishWithMessageFormat({
            topic: this.getTopicByMsgID(MsgID.START_TRIP),
            msgID: this.startTripNotification ? MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE : MsgID.START_TRIP,
            msgSubID: this.startTripNotification ? MsgSubID.NOTIFY : MsgSubID?.RESPONSE,
            payload: {
                type: this.currentStartTripFlow,
                ...data,
            },
            opts: { retain: true },
        });
    }

    sendMainPagePop() {
        this.mqttService.publishWithMessageFormat({
            topic:
                this.currentMainPagePop === 'FMS_NO_INFO'
                    ? this.topics?.mainTab?.fmsBusStop?.response
                    : this.topics?.mainTab?.response,
            msgID: MsgID?.START_TRIP_POP_UP_MESSAGE,
            msgSubID: MsgSubID?.NOTIFY,
            payload: {
                type: this.currentMainPagePop,
            },
            opts: { retain: true },
        });
    }

    sendMainPagePop2() {
        this.mqttService.publishWithMessageFormat({
            topic:
                this.currentMainPagePop === 'FMS_NO_INFO'
                    ? this.topics?.mainTab?.fmsBusStop?.response
                    : this.topics?.mainTab?.response,
            msgID: MsgID?.DRIVER_STATUS,
            msgSubID: MsgSubID?.NOTIFY,
            payload: {
                type: this.currentMainPagePop,
            },
            opts: { retain: true },
        });
    }

    private getTopicByMsgID(msgID: number) {
        let topic = '';
        switch (msgID) {
            case MsgID?.BOOT_UP:
            case MsgID.OUT_OF_SERVICE_INFO:
            case MsgID.OUT_OF_SERVICE_MISSING_DATA:
            case MsgID.TRIGGER_DAGW_OPERATION:
            case MsgID.TRIGGER_BOLC_STATUS:
            case MsgID.SD_FOR_UPGRADING_FROM_TO:
            case MsgID?.BUS_OPERATION_MENU:
            case MsgID.BC_TAP_CARD_LOGIN:
            case MsgID.BC_TAP_CARD_PIN:
            case MsgID.BC_TAP_CARD_DUTY:
            case MsgID.MS_TAP_CARD_LOGIN:
            case MsgID.MS_TAP_CARD_PIN:
            case MsgID.END_SHIFT:
            case MsgID?.MANUAL_LOGIN_STAFF_ID:
            case MsgID?.MANUAL_LOGIN_DUTY:
            case MsgID?.END_TRIP:
            case MsgID?.END_TRIP_TYPE:
            case MsgID?.END_TRIP_SUBMIT:
            case MsgID?.MAIN_PAGE_DATA:
            case MsgID.UPDATE_FARE_BUS_STOP:
            case MsgID.UPDATE_FMS_BUS_STOP:
            case MsgID.BOOT_UP_COMMISSIONING:
            case MsgID?.LANGUAGE:
            case MsgID.START_TRIP:
            case MsgID.START_TRIP_BUS_STOP_LIST:
            case MsgID.START_TRIP_GET_SERVICE_LIST:
            case MsgID?.START_TRIP_GET_FARE_TRIP_DETAILS:
            case MsgID?.START_TRIP_SUBMIT_FARE_TRIP:
            case MsgID?.MAIN_FREE_SUBMIT:
            case MsgID?.MAIN_REAR_DOORS_SUBMIT:
            case MsgID?.UNLOCK_SUBMIT:
            case MsgID?.CV_UPGRADE:
                topic = this.topics?.mainTab?.response;
                break;
            case MsgID?.MAINTENANCE_PARAMETER:
            case MsgID?.MAINTENANCE_APP_UPGRADE:
            case MsgID?.MAINTENANCE_UPGRADE_SUBMIT:
            case MsgID?.MAINTENANCE_VERSION_INFO:
                // case MsgID?.IGNITION_OFF:
                topic = this.topics?.maintenance?.response;
                break;
            case MsgID?.FARE_CO_CV_ENTRY_EXIT_CONFIRM:
                topic = this.topics?.fareTab?.response;
                break;
            case MsgID.SHUTTING_DOWN:
            case MsgID.TC_DETECT_ERROR:
                topic = this.topics?.tcToAllTabs;
                break;
            default:
                break;
        }
        return topic;
    }

    ngOnInit() {
        this.initMqttConnection();
    }

    private initMqttConnection(): void {
        // Connect to the broker
        this.mqttService.connect();

        // Handle connection status updates
        this.mqttService.connectionStatus$.pipe(takeUntil(this.destroy$)).subscribe((status) => {
            this.isConnected = status;
            if (status === true) {
                console.log('Successfully connected to the broker.');
                this.isLoading = false;
            } else if (status === false) {
                console.log('Still trying to connect...');
                this.isLoading = true;
            }
        });

        // Ensure the configuration is loaded before using topics
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                console.log('MQTT config is loaded:', this.topics);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    connectToBroker() {
        this.isLoading = true;
        if (this.brokerUrl) {
            this.mqttService.initializeClient(this.brokerUrl);
        }
    }

    sendIcon() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics.mainTab?.response,
            msgID: MsgID.CV_ICONS,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                icon: this.activeIcon,
                error: this.isError,
                cvNum: this.cvUrl,
                message: this.cvErrorMsg,
            },
            opts: { retain: true },
        });
    }
    compareObjects(o1: any, o2: any): boolean {
        return o1 && o2 ? o1.id === o2.id : o1 === o2;
    }
    sendDirRoute() {
        const mess = JSON.stringify(this.currentRoute);
        this.mqttService.publish(this.topics.busDirInfo?.response, mess);
    }

    sendUpdateFmsBusStop() {
        const payload = {
            ...this.fmsBusStop,
        };
        if (this.fmsBusStop.updateBusStopList) {
            payload['fmsBusStopList'] = [
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
            ];
        }
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.response,
            msgID: MsgID.UPDATE_FMS_BUS_STOP,
            msgSubID: MsgSubID.NOTIFY,
            payload,
            opts: { retain: true },
        });
    }

    sendCurrentFareBusStop() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.fareBusStop?.response,
            msgID: MsgID.UPDATE_FARE_BUS_STOP,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                Busid: this.currentRoute.fareBusStop,
                manualBls: this.manualBls,
                autoBls: this.autoBls,
                misMatch: this.misMatch,
                isUpstage: this.isUpstage,
                index: Number(this.fareBusStopIndex),
            },
            opts: { retain: true },
        });
    }
    sendHeadTime() {
        // console.log('send', this.headTimeTTable);

        // this.mqttService.publishWithFormat(this.topics?.currentVehicleJourney?.response, {
        //     messaged: { ...this.headTimeTTable, color: this.timeHeadColor[this.headTimeTTable?.color] },
        //     requestType: MqttTypes?.BE_RESPONSE,
        //     messageId: MessageId?.VEHICLE_JOURNEY,
        // });

        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.headWayTimeTable?.response,
            msgID: MsgID.UPDATE_HEADWAY,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                ...this.headTimeTTable,
                ...this.nextBusInfo,
                color: this.timeHeadColor[this.headTimeTTable?.color],
            },
            opts: { retain: true },
        });
    }
    sendNextBusInfo() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.response,
            msgID: MsgID.NEXT_BUS_INFO,
            msgSubID: MsgSubID.NOTIFY,
            payload: this.nextBusInfo,
            opts: { retain: true },
        });
    }

    sendDagwOperation() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.response,
            msgID: MsgID.DAGW_OPERATION,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                ...this.dagwOperationPublish,
                percentage: this.dagwOperationPublish?.percentage
                    ? Number(this.dagwOperationPublish?.percentage)
                    : undefined,
                timeout: 10000,
            },
            opts: { retain: true },
        });
    }

    onRouteChange(data: any, dir: string) {
        console.log('routchange', data, dir);
        this.currentRoute = {
            ...this.currentRoute,
            [dir]: data,
        };
    }

    onIconTypeChange(icon: string) {
        this.activeIcon = icon;
    }

    onCvNumberChange(cvUrl: string) {
        this.cvUrl = cvUrl;
    }

    replaceUnderscore(e: string) {
        return e.replaceAll('_', ' ');
    }

    changeFareTabScreen() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.response,
            msgID: MsgID.FARE_SCREEN,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                screenType: this.fareScreen,
            },
            opts: { retain: true },
        });
    }

    changeMaintenanceTabScreen() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.response,
            msgID: MsgID.MAINTENANCE_SCREEN,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                screenType: this.maintenanceScreen,
            },
            opts: { retain: true },
        });
    }
}
