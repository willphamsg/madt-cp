import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MqttComponent } from './mqtt.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { BehaviorSubject } from 'rxjs';
import { MsgID, MsgSubID, StartTripTypes } from '@models';

const mockTopics = {
    version: '1.0',
    tcToAllTabs: 'tc/all-tabs',
    mainTab: {
        response: 'tc/main-tab',
        cv: { response: 'tc/main-tab/cv' },
        fmsBusStop: { response: 'tc/main-tab/fms-bus-stop' },
        fareBusStop: { response: 'tc/main-tab/fare-bus-stop' },
        headWayTimeTable: { response: 'tc/main-tab/headway' },
    },
    maintenance: { response: 'tc/maintenance' },
    fareTab: { response: 'tc/fare-tab' },
    busDirInfo: { response: 'tc/bus-dir-info' },
};

class MockMqttService {
    connectionStatus$ = new BehaviorSubject<boolean | null>(null);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(true);

    mqttConfig: any = {
        topics: mockTopics,
    };

    connect = jasmine.createSpy('connect');
    initializeClient = jasmine.createSpy('initializeClient');
    publish = jasmine.createSpy('publish');
    publishWithFormat = jasmine.createSpy('publishWithFormat');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('MqttComponent', () => {
    let component: MqttComponent;
    let fixture: ComponentFixture<MqttComponent>;
    let mockMqttService: MockMqttService;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MqttComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MqttComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('initMqttConnection (ngOnInit)', () => {
        it('connects to the broker on init', () => {
            expect(mockMqttService.connect).toHaveBeenCalled();
        });

        it('sets isConnected/isLoading when connectionStatus$ emits true', () => {
            mockMqttService.connectionStatus$.next(true);
            expect(component.isConnected).toBeTrue();
            expect(component.isLoading).toBeFalse();
        });

        it('sets isConnected/isLoading when connectionStatus$ emits false', () => {
            mockMqttService.connectionStatus$.next(false);
            expect(component.isConnected).toBeFalse();
            expect(component.isLoading).toBeTrue();
        });

        it('sets topics when mqttConfigLoaded$ emits true', () => {
            expect(component.topics).toEqual(mockTopics);
        });

        it('does not touch topics when mqttConfigLoaded$ emits false', () => {
            component.topics = undefined;
            mockMqttService.mqttConfigLoaded$.next(false);
            expect(component.topics).toBeUndefined();
        });

        it('stops reacting to emissions after ngOnDestroy', () => {
            component.ngOnDestroy();
            mockMqttService.connectionStatus$.next(true);
            // isConnected retains its last value set before destroy (null from initial emission),
            // since the subscription was torn down.
            expect(component.isConnected).not.toBeTrue();
        });
    });

    it('ngOnDestroy should not throw', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });

    describe('onCheckboxChange', () => {
        it('adds the option when checked', () => {
            component.cvStatusChanger = [];
            component.onCheckboxChange({ checked: true }, 'opt1');
            expect(component.cvStatusChanger).toEqual(['opt1']);
        });

        it('removes the option when unchecked', () => {
            component.cvStatusChanger = ['opt1', 'opt2'];
            component.onCheckboxChange({ checked: false }, 'opt1');
            expect(component.cvStatusChanger).toEqual(['opt2']);
        });
    });

    describe('updateConnectionStatus', () => {
        it('publishes current connection status without resetting', () => {
            component.updateConnectionStatus();
            expect(mockMqttService.publishWithFormat).toHaveBeenCalledWith(
                mockTopics.tcToAllTabs,
                jasmine.objectContaining({ messaged: component.connectionStatus.connection }),
                { retain: true },
            );
        });

        it('publishes empty payload and resets connectionStatus when reset is truthy', () => {
            component.connectionStatus = {
                connection: {
                    statusBTS: true,
                    statusBOLC: true,
                    statusFARE: true,
                    statusFMS: true,
                    statusCRP: true,
                },
                trigger: { triggerBOLCButton: true },
            };
            component.updateConnectionStatus(true);
            expect(mockMqttService.publishWithFormat).toHaveBeenCalledWith(mockTopics.tcToAllTabs, '', {
                retain: true,
            });
            expect(component.connectionStatus).toEqual(component.connectionStatusInit);
        });
    });

    it('sendCvStatus should publish formatted cv status message', () => {
        component.cvStatusChanger = ['1', '2'];
        component.activeCvDir = ['1', '2'];
        component.sendCvStatus();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.mainTab.cv.response,
                msgID: MsgID.CV_STATUS,
                msgSubID: MsgSubID.NOTIFY,
            }),
        );
    });

    it('handleToggleStatus should publish the toggle field state', () => {
        component.handleToggleStatus('mainTab', MsgID.TRIGGER_BOLC_STATUS, true);
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith({
            topic: mockTopics.mainTab.response,
            msgID: MsgID.TRIGGER_BOLC_STATUS,
            msgSubID: MsgSubID.NOTIFY,
            payload: { mainTab: true },
            opts: { retain: true },
        });
    });

    it('updateConnectionButton should publish trigger payload', () => {
        component.connectionStatus.trigger.triggerBOLCButton = true;
        component.updateConnectionButton();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.mainTab.response,
                msgID: MsgID.TRIGGER_BOLC_STATUS,
                payload: component.connectionStatus.trigger,
            }),
        );
    });

    it('sendAuth should publish the auth data', () => {
        component.authData = { foo: 'bar' };
        component.sendAuth();
        expect(mockMqttService.publishWithFormat).toHaveBeenCalledWith(
            mockTopics.mainTab.response,
            jasmine.objectContaining({ messaged: { foo: 'bar' } }),
        );
    });

    describe('sendRedirect', () => {
        it('uses the topic/msgSubID present on authData', () => {
            component.authData = { msgID: 5, msgSubID: MsgSubID.RESPONSE, topic: 'custom/topic', foo: 'bar' };
            component.sendRedirect();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: 'custom/topic',
                    msgID: 5,
                    msgSubID: MsgSubID.RESPONSE,
                }),
            );
        });

        it('falls back to mainTab topic and NOTIFY when absent', () => {
            component.authData = { msgID: 7 };
            component.sendRedirect();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockTopics.mainTab.response,
                    msgID: 7,
                    msgSubID: MsgSubID.NOTIFY,
                }),
            );
        });
    });

    describe('sendMaintenanceRedirect', () => {
        it('resolves topic via getTopicByMsgID when msgID is known', () => {
            component.maintenanceData = { msgID: MsgID.MAINTENANCE_PARAMETER, msgSubID: MsgSubID.RESPONSE };
            component.sendMaintenanceRedirect();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockTopics.maintenance.response,
                    msgID: MsgID.MAINTENANCE_PARAMETER,
                    msgSubID: MsgSubID.RESPONSE,
                }),
            );
        });

        it('falls back to the maintenance response topic and NOTIFY when msgID is unmatched', () => {
            component.maintenanceData = { msgID: 999999 };
            component.sendMaintenanceRedirect();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockTopics.maintenance.response,
                    msgID: 999999,
                    msgSubID: MsgSubID.NOTIFY,
                }),
            );
        });

        it('resolves the tcToAllTabs topic for SHUTTING_DOWN/TC_DETECT_ERROR msgIDs', () => {
            component.maintenanceData = { msgID: MsgID.SHUTTING_DOWN };
            component.sendMaintenanceRedirect();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockTopics.tcToAllTabs,
                    msgID: MsgID.SHUTTING_DOWN,
                }),
            );
        });
    });

    describe('sendFareRedirect', () => {
        it('resolves topic via getTopicByMsgID when msgID is known', () => {
            component.fareData = { msgID: MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM, msgSubID: MsgSubID.RESPONSE };
            component.sendFareRedirect();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockTopics.fareTab.response,
                    msgID: MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM,
                    msgSubID: MsgSubID.RESPONSE,
                }),
            );
        });

        it('falls back to the fareTab response topic and NOTIFY when msgID is unmatched', () => {
            component.fareData = { msgID: 999999 };
            component.sendFareRedirect();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockTopics.fareTab.response,
                    msgID: 999999,
                    msgSubID: MsgSubID.NOTIFY,
                }),
            );
        });
    });

    describe('sendStartTripFlow', () => {
        it('fills in trip details and sends a RESPONSE for a matched flow', () => {
            component.currentStartTripFlow = StartTripTypes.FMS_VALID_INFO;
            component.startTripNotification = false;
            component.sendStartTripFlow();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.START_TRIP,
                    msgSubID: MsgSubID.RESPONSE,
                    payload: jasmine.objectContaining({
                        type: StartTripTypes.FMS_VALID_INFO,
                        serviceNumber: 20,
                    }),
                }),
            );
        });

        it('sends a NOTIFY special-case message without extra data for an unmatched flow', () => {
            component.currentStartTripFlow = StartTripTypes.FMS_NO_INFO;
            component.startTripNotification = true;
            component.sendStartTripFlow();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE,
                    msgSubID: MsgSubID.NOTIFY,
                    payload: { type: StartTripTypes.FMS_NO_INFO },
                }),
            );
        });
    });

    describe('sendMainPagePop', () => {
        it('uses the fmsBusStop response topic for FMS_NO_INFO', () => {
            component.currentMainPagePop = 'FMS_NO_INFO';
            component.sendMainPagePop();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ topic: mockTopics.mainTab.fmsBusStop.response }),
            );
        });

        it('uses the mainTab response topic otherwise', () => {
            component.currentMainPagePop = 'DRIVER_ID_CHANGES';
            component.sendMainPagePop();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ topic: mockTopics.mainTab.response }),
            );
        });
    });

    describe('sendMainPagePop2', () => {
        it('uses the fmsBusStop response topic for FMS_NO_INFO', () => {
            component.currentMainPagePop = 'FMS_NO_INFO';
            component.sendMainPagePop2();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockTopics.mainTab.fmsBusStop.response,
                    msgID: MsgID.DRIVER_STATUS,
                }),
            );
        });

        it('uses the mainTab response topic otherwise', () => {
            component.currentMainPagePop = 'DRIVER_ID_CHANGES';
            component.sendMainPagePop2();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ topic: mockTopics.mainTab.response, msgID: MsgID.DRIVER_STATUS }),
            );
        });
    });

    describe('connectToBroker', () => {
        it('initializes the client when brokerUrl is set', () => {
            component.brokerUrl = { host: 'h', protocol: 'ws', port: '1', path: '/mqtt' };
            component.connectToBroker();
            expect(component.isLoading).toBeTrue();
            expect(mockMqttService.initializeClient).toHaveBeenCalledWith(component.brokerUrl);
        });

        it('does not initialize the client when brokerUrl is falsy', () => {
            component.brokerUrl = null;
            mockMqttService.initializeClient.calls.reset();
            component.connectToBroker();
            expect(component.isLoading).toBeTrue();
            expect(mockMqttService.initializeClient).not.toHaveBeenCalled();
        });
    });

    it('sendIcon should publish the icon payload', () => {
        component.activeIcon = 3;
        component.isError = true;
        component.cvUrl = 'cv1';
        component.cvErrorMsg = 'ERR';
        component.sendIcon();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.mainTab.response,
                msgID: MsgID.CV_ICONS,
                payload: { icon: 3, error: true, cvNum: 'cv1', message: 'ERR' },
            }),
        );
    });

    describe('compareObjects', () => {
        it('compares by id when both objects are truthy', () => {
            expect(component.compareObjects({ id: 1 }, { id: 1 })).toBeTrue();
            expect(component.compareObjects({ id: 1 }, { id: 2 })).toBeFalse();
        });

        it('falls back to strict equality otherwise', () => {
            expect(component.compareObjects(null, null)).toBeTrue();
            expect(component.compareObjects(null, { id: 1 })).toBeFalse();
        });
    });

    it('sendDirRoute should publish the stringified current route', () => {
        component.currentRoute = { now: 'a', dest: 'b', fareBusStop: 'c' } as any;
        component.sendDirRoute();
        expect(mockMqttService.publish).toHaveBeenCalledWith(
            mockTopics.busDirInfo.response,
            JSON.stringify(component.currentRoute),
        );
    });

    describe('sendUpdateFmsBusStop', () => {
        it('includes the fmsBusStopList when updateBusStopList is set', () => {
            component.fmsBusStop = { ...component.fmsBusStop, updateBusStopList: true };
            component.sendUpdateFmsBusStop();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ fmsBusStopList: jasmine.any(Array) }),
                }),
            );
        });

        it('omits the fmsBusStopList when updateBusStopList is falsy', () => {
            component.fmsBusStop = { ...component.fmsBusStop, updateBusStopList: false };
            component.sendUpdateFmsBusStop();
            const callArgs = mockMqttService.publishWithMessageFormat.calls.mostRecent().args[0];
            expect(callArgs.payload.fmsBusStopList).toBeUndefined();
        });
    });

    it('sendCurrentFareBusStop should publish the fare bus stop payload', () => {
        (component.currentRoute as any).fareBusStop = 'stop1';
        component.manualBls = true;
        component.autoBls = false;
        component.misMatch = true;
        component.fareBusStopIndex = 2;
        component.sendCurrentFareBusStop();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.mainTab.fareBusStop.response,
                payload: jasmine.objectContaining({ Busid: 'stop1', index: 2 }),
            }),
        );
    });

    it('sendHeadTime should publish the head time table payload', () => {
        component.sendHeadTime();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.mainTab.headWayTimeTable.response,
                msgID: MsgID.UPDATE_HEADWAY,
            }),
        );
    });

    it('sendNextBusInfo should publish the next bus info payload', () => {
        component.nextBusInfo = { show: true, busBehindOccupancy: 1, busBehindTime: 2 };
        component.sendNextBusInfo();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.mainTab.response,
                msgID: MsgID.NEXT_BUS_INFO,
                payload: component.nextBusInfo,
            }),
        );
    });

    describe('sendDagwOperation', () => {
        it('numifies percentage when truthy', () => {
            (component.dagwOperationPublish as any).percentage = '50';
            component.sendDagwOperation();
            const callArgs = mockMqttService.publishWithMessageFormat.calls.mostRecent().args[0];
            expect(callArgs.payload.percentage).toBe(50);
        });

        it('leaves percentage undefined when falsy', () => {
            component.dagwOperationPublish.percentage = 0;
            component.sendDagwOperation();
            const callArgs = mockMqttService.publishWithMessageFormat.calls.mostRecent().args[0];
            expect(callArgs.payload.percentage).toBeUndefined();
        });
    });

    it('onRouteChange should update currentRoute for the given direction', () => {
        component.currentRoute = { now: null, dest: null, fareBusStop: null };
        component.onRouteChange('busstop-1', 'now');
        expect((component.currentRoute as any).now).toBe('busstop-1');
    });

    it('onIconTypeChange should set activeIcon', () => {
        component.onIconTypeChange('icon-5');
        expect(component.activeIcon).toBe('icon-5');
    });

    it('onCvNumberChange should set cvUrl', () => {
        component.onCvNumberChange('cv-9');
        expect(component.cvUrl).toBe('cv-9');
    });

    it('replaceUnderscore should replace all underscores with spaces', () => {
        expect(component.replaceUnderscore('HELLO_WORLD_FOO')).toBe('HELLO WORLD FOO');
    });

    it('changeFareTabScreen should publish the fare screen type', () => {
        component.fareScreen = 2;
        component.changeFareTabScreen();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.fareTab.response,
                msgID: MsgID.FARE_SCREEN,
                payload: { screenType: 2 },
            }),
        );
    });

    it('changeMaintenanceTabScreen should publish the maintenance screen type', () => {
        component.maintenanceScreen = 3;
        component.changeMaintenanceTabScreen();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockTopics.maintenance.response,
                msgID: MsgID.MAINTENANCE_SCREEN,
                payload: { screenType: 3 },
            }),
        );
    });
});
