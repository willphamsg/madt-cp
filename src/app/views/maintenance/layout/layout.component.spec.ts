import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceLayoutComponent } from './layout.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, of, BehaviorSubject } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { MsgID, MsgSubID, TopicsKeys, ResponseStatus, MaintenanceScreen } from '@models';
import { routerUrls } from '@app/app.routes';

describe('MaintenanceLayoutComponent', () => {
    let component: MaintenanceLayoutComponent;
    let fixture: ComponentFixture<MaintenanceLayoutComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceLayoutComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MaintenanceLayoutComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize loading to true', () => {
        expect(component.loading).toBeTrue();
    });

    it('should initialize ignitionOff with show: false', () => {
        expect(component.ignitionOff.show).toBeFalse();
    });

    it('should initialize notification with show: false', () => {
        expect(component.notification.show).toBeFalse();
    });

    it('should initialize activeLogoutPopup to false', () => {
        expect(component.activeLogoutPopup).toBeFalse();
    });

    it('should initialize showPopUp to null', () => {
        expect(component.showPopUp).toBeNull();
    });

    it('handleClosePopup should close the notification', () => {
        component.notification = { show: true, message: 'test' };
        component.handleClosePopup();
        expect(component.notification).toEqual({ show: false, message: '' });
    });

    it('handleActiveLogoutPopup should set activeLogoutPopup to true', () => {
        component.handleActiveLogoutPopup();
        expect(component.activeLogoutPopup).toBeTrue();
    });

    it('handleCancelLogout should set activeLogoutPopup to false', () => {
        component.activeLogoutPopup = true;
        component.handleCancelLogout();
        expect(component.activeLogoutPopup).toBeFalse();
    });

    it('closePopUpHandler should set showPopUp to null', () => {
        component.showPopUp = { title: 'Test', type: 'error' };
        component.closePopUpHandler();
        expect(component.showPopUp).toBeNull();
    });

    it('resetAllPopUpHandler should reset all popup states', () => {
        component.showPopUp = { title: 'Test', type: 'error' };
        component.ignitionOff = { show: true };
        component.notification = { show: true, message: 'msg' };
        component.activeLogoutPopup = true;
        component.resetAllPopUpHandler();
        expect(component.showPopUp).toBeNull();
        expect(component.ignitionOff.show).toBeFalse();
        expect(component.notification.show).toBeFalse();
        expect(component.activeLogoutPopup).toBeFalse();
    });

    it('messValidation should invoke callback when timestamp >= currentMainPageMess', () => {
        const callback = jasmine.createSpy('callback');
        const now = new Date().getTime();
        const result = component.messValidation(now, 0, callback);
        expect(callback).toHaveBeenCalled();
        expect(result).toBe(now);
    });

    it('messValidation should NOT invoke callback when timestamp < currentMainPageMess', () => {
        const callback = jasmine.createSpy('callback');
        const negative = -1;
        const future = new Date().getTime();
        const result = component.messValidation(negative, future, callback);
        expect(callback).not.toHaveBeenCalled();
        expect(result).toBe(0);
    });

    it('navigate should not navigate if current route is the same', () => {
        const navigateSpy = spyOn(router, 'navigate');
        (component as any).currentRoute = '/maintenance';
        component.navigate('/maintenance');
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('navigate should navigate if route differs', () => {
        const navigateSpy = spyOn(router, 'navigate');
        (component as any).currentRoute = '/maintenance/fare';
        component.navigate('/maintenance/log-off');
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/log-off']);
    });

    it('navigate should prefix a route with a leading slash when missing', () => {
        const navigateSpy = spyOn(router, 'navigate');
        (component as any).currentRoute = '/something-else';
        component.navigate('maintenance/log-off');
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/log-off']);
    });
});

// ---------------------------------------------------------------------------
// Mock MqttService that allows controlling connectionStatus$ / mqttConfigLoaded$
// ---------------------------------------------------------------------------
class MockMqttService {
    connectionStatus$ = new BehaviorSubject<boolean>(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(true);

    mqttConfig: any = {
        topics: {
            maintenance: {
                get: '/madt/maintenance/get',
                response: '/tc/maintenance/response',
            },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    unsubscribe = jasmine.createSpy('unsubscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

function buildMockRouter(initialUrl: string) {
    return {
        url: initialUrl,
        events: new Subject<any>(),
        navigate: jasmine.createSpy('navigate'),
    };
}

function buildMessage(msgID: number, msgSubID: number, payload: any = {}, dateTime?: string) {
    return JSON.stringify({
        header: { msgID, msgSubID, dateTime: dateTime || new Date().toISOString() },
        payload,
    });
}

describe('MaintenanceLayoutComponent - constructor / routing behavior', () => {
    let component: MaintenanceLayoutComponent;
    let routerMock: ReturnType<typeof buildMockRouter>;

    function createComponent(initialUrl: string) {
        routerMock = buildMockRouter(initialUrl);
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceLayoutComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: new MockMqttService() },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        const fixture = TestBed.createComponent(MaintenanceLayoutComponent);
        component = fixture.componentInstance;
        return fixture;
    }

    it('sets dateTimeOnly true when constructed on the access-denied route', () => {
        createComponent(`/${routerUrls.private.maintenance.accessDenied}`);
        expect((component as any).dateTimeOnly).toBeTrue();
    });

    it('sets dateTimeOnly true when constructed on the log-off route', () => {
        createComponent(`/${routerUrls.private.maintenance.logOff}`);
        expect((component as any).dateTimeOnly).toBeTrue();
    });

    it('sets dateTimeOnly false when constructed on any other route', () => {
        createComponent('/maintenance');
        expect((component as any).dateTimeOnly).toBeFalse();
    });

    it('updates dateTimeOnly and currentRoute on NavigationStart to the access-denied route', () => {
        createComponent('/maintenance');
        routerMock.events.next(new NavigationStart(1, `/${routerUrls.private.maintenance.accessDenied}`));
        expect((component as any).dateTimeOnly).toBeTrue();
        expect((component as any).currentRoute).toBe(`/${routerUrls.private.maintenance.accessDenied}`);
    });

    it('updates dateTimeOnly to false on NavigationStart to a non listed route', () => {
        createComponent(`/${routerUrls.private.maintenance.logOff}`);
        routerMock.events.next(new NavigationStart(1, '/maintenance/fare'));
        expect((component as any).dateTimeOnly).toBeFalse();
        expect((component as any).currentRoute).toBe('/maintenance/fare');
    });

    it('ignores non-NavigationStart router events', () => {
        createComponent('/maintenance');
        (component as any).currentRoute = '/maintenance';
        routerMock.events.next(new NavigationEnd(1, '/maintenance/fare', '/maintenance/fare'));
        expect((component as any).currentRoute).toBe('/maintenance');
    });
});

describe('MaintenanceLayoutComponent - ngOnInit MQTT bootstrapping', () => {
    let mqttService: MockMqttService;
    let routerMock: ReturnType<typeof buildMockRouter>;

    function createComponent() {
        routerMock = buildMockRouter('/maintenance');
        mqttService = new MockMqttService();
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceLayoutComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        const fixture = TestBed.createComponent(MaintenanceLayoutComponent);
        return fixture;
    }

    it('does not call validatedAuth when connectionStatus$ emits false', () => {
        const fixture = createComponent();
        const component = fixture.componentInstance;
        const validatedAuthSpy = spyOn(component, 'validatedAuth');
        mqttService.connectionStatus$.next(false);
        fixture.detectChanges();
        expect(validatedAuthSpy).not.toHaveBeenCalled();
    });

    it('does not call validatedAuth when mqttConfigLoaded$ emits false', () => {
        const fixture = createComponent();
        const component = fixture.componentInstance;
        const validatedAuthSpy = spyOn(component, 'validatedAuth');
        mqttService.connectionStatus$.next(true);
        mqttService.mqttConfigLoaded$.next(false);
        fixture.detectChanges();
        expect(validatedAuthSpy).not.toHaveBeenCalled();
    });

    it('does not call validatedAuth when mqttConfig has no topics', () => {
        const fixture = createComponent();
        const component = fixture.componentInstance;
        mqttService.mqttConfig = {};
        const validatedAuthSpy = spyOn(component, 'validatedAuth');
        mqttService.connectionStatus$.next(true);
        mqttService.mqttConfigLoaded$.next(true);
        fixture.detectChanges();
        expect(validatedAuthSpy).not.toHaveBeenCalled();
        expect(component.topics).toBeUndefined();
    });

    it('calls validatedAuth with topics when connected, config loaded, and topics present', () => {
        const fixture = createComponent();
        const component = fixture.componentInstance;
        const validatedAuthSpy = spyOn(component, 'validatedAuth');
        mqttService.connectionStatus$.next(true);
        mqttService.mqttConfigLoaded$.next(true);
        fixture.detectChanges();
        expect(validatedAuthSpy).toHaveBeenCalledWith(mqttService.mqttConfig.topics);
        expect(component.topics).toBe(mqttService.mqttConfig.topics);
    });
});

describe('MaintenanceLayoutComponent - handleIgnitionOff / handleLogout with topics', () => {
    let component: MaintenanceLayoutComponent;
    let mqttService: MockMqttService;

    beforeEach(() => {
        const routerMock = buildMockRouter('/maintenance');
        mqttService = new MockMqttService();
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceLayoutComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        const fixture = TestBed.createComponent(MaintenanceLayoutComponent);
        component = fixture.componentInstance;
        component.topics = mqttService.mqttConfig.topics;
    });

    it('handleIgnitionOff publishes IGNITION_OFF request and disables the popup', () => {
        component.handleIgnitionOff();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mqttService.mqttConfig.topics.maintenance.get,
                msgID: MsgID.IGNITION_OFF,
                msgSubID: MsgSubID.REQUEST,
            }),
        );
        expect(component.ignitionOff.disabled).toBeTrue();
    });

    it('handleLogout() publishes LOGOUT request', () => {
        component.handleLogout();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mqttService.mqttConfig.topics.maintenance.get,
                msgID: MsgID.LOGOUT,
                msgSubID: MsgSubID.REQUEST,
            }),
        );
    });
});

describe('MaintenanceLayoutComponent - validatedAuth MQTT message handling', () => {
    let component: MaintenanceLayoutComponent;
    let mqttService: MockMqttService;
    let routerMock: ReturnType<typeof buildMockRouter>;
    let store: Store<any>;
    let dispatchSpy: jasmine.Spy;
    let callback: (message: string, _clientId?: any, packet?: any) => void;
    const topics = {
        maintenance: {
            get: '/madt/maintenance/get',
            response: '/tc/maintenance/response',
        },
    };

    beforeEach(() => {
        routerMock = buildMockRouter('/maintenance/initial-route');
        mqttService = new MockMqttService();
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceLayoutComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        const fixture = TestBed.createComponent(MaintenanceLayoutComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        dispatchSpy = spyOn(store, 'dispatch');

        component.validatedAuth(topics);
        expect(mqttService.subscribe).toHaveBeenCalledTimes(1);
        callback = mqttService.subscribe.calls.argsFor(0)[0].callback;
    });

    it('registers the maintenance response subscription for later cleanup', () => {
        expect((component as any).mqttSubscriptions).toContain(
            jasmine.objectContaining({ topic: topics.maintenance.response, topicKey: TopicsKeys.MAINTENANCE }),
        );
    });

    it('ignores messages whose header.msgID is 0', () => {
        component.loading = true;
        callback(buildMessage(0, MsgSubID.NOTIFY, {}));
        expect(component.loading).toBeTrue();
    });

    it('sets loading false and resets bootUpCommissioning for any other message', () => {
        component.loading = true;
        component.bootUpCommissioning = { show: true, title: 'x' };
        callback(buildMessage(999999, MsgSubID.NOTIFY, {}));
        expect(component.loading).toBeFalse();
        expect(component.bootUpCommissioning).toEqual({ show: false, title: '' });
    });

    it('does nothing extra when msgSubID is neither NOTIFY nor RESPONSE', () => {
        expect(() => callback(buildMessage(999999, MsgSubID.REQUEST, {}))).not.toThrow();
    });

    it('falls through the default case for an unmatched NOTIFY msgID', () => {
        expect(() => callback(buildMessage(999999, MsgSubID.NOTIFY, {}))).not.toThrow();
    });

    it('falls through the default case for an unmatched RESPONSE msgID', () => {
        expect(() => callback(buildMessage(999999, MsgSubID.RESPONSE, {}))).not.toThrow();
    });

    describe('MAINTENANCE_SCREEN (NOTIFY)', () => {
        it('navigates to log-off when screenType is LOGIN_FROM_MAIN_TAB', () => {
            component.activeLogoutPopup = true;
            callback(
                buildMessage(MsgID.MAINTENANCE_SCREEN, MsgSubID.NOTIFY, {
                    screenType: MaintenanceScreen.LOGIN_FROM_MAIN_TAB,
                }),
            );
            expect(component.activeLogoutPopup).toBeFalse();
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.maintenance.logOff}`]);
        });

        it('navigates to access-denied when screenType is ACCESS_DENIED', () => {
            callback(
                buildMessage(MsgID.MAINTENANCE_SCREEN, MsgSubID.NOTIFY, {
                    screenType: MaintenanceScreen.ACCESS_DENIED,
                }),
            );
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.maintenance.accessDenied}`]);
        });

        it('navigates to the maintenance landing url for any other screenType', () => {
            callback(
                buildMessage(MsgID.MAINTENANCE_SCREEN, MsgSubID.NOTIFY, {
                    screenType: MaintenanceScreen.LANDING_PAGE,
                }),
            );
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.maintenance.url}`]);
        });
    });

    describe('IGNITION_OFF (NOTIFY)', () => {
        it('shows the ignition-off popup with payload values', () => {
            component.showPopUp = { title: 'prior', type: 'error' };
            callback(
                buildMessage(MsgID.IGNITION_OFF, MsgSubID.NOTIFY, {
                    currentTime: '10:00',
                    delay: 5,
                }),
            );
            expect(component.showPopUp).toBeNull();
            expect(component.ignitionOff).toEqual({ show: true, message: '10:00', delay: 5 });
        });

        it('falls back to default message/delay when payload fields are absent', () => {
            callback(buildMessage(MsgID.IGNITION_OFF, MsgSubID.NOTIFY, {}));
            expect(component.ignitionOff).toEqual({ show: true, message: '', delay: 20 });
        });
    });

    describe('MAINTENANCE_RESULT_NOTIFICATION (NOTIFY)', () => {
        it('shows the notification with the payload message', () => {
            callback(buildMessage(MsgID.MAINTENANCE_RESULT_NOTIFICATION, MsgSubID.NOTIFY, { message: 'done' }));
            expect(component.notification).toEqual({ show: true, message: 'done' });
        });

        it('falls back to an empty message when absent', () => {
            callback(buildMessage(MsgID.MAINTENANCE_RESULT_NOTIFICATION, MsgSubID.NOTIFY, {}));
            expect(component.notification).toEqual({ show: true, message: '' });
        });
    });

    describe('EXTERNAL_DEVICES_NOTIFY (NOTIFY)', () => {
        it('dispatches but does not navigate when message is not retained', () => {
            callback(buildMessage(MsgID.EXTERNAL_DEVICES_NOTIFY, MsgSubID.NOTIFY, {}), undefined, { retain: false });
            expect(dispatchSpy).toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('dispatches and navigates when message is retained', () => {
            callback(buildMessage(MsgID.EXTERNAL_DEVICES_NOTIFY, MsgSubID.NOTIFY, {}), undefined, { retain: true });
            expect(dispatchSpy).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.maintenance.fare.externalDevices}`,
            ]);
        });
    });

    describe('MAINTENANCE_DELETE_PARAMETER_NOTIFY (NOTIFY)', () => {
        it('dispatches but does not navigate when not retained', () => {
            callback(buildMessage(MsgID.MAINTENANCE_DELETE_PARAMETER_NOTIFY, MsgSubID.NOTIFY, {}), undefined, {
                retain: false,
            });
            expect(dispatchSpy).toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('dispatches and navigates when retained', () => {
            callback(buildMessage(MsgID.MAINTENANCE_DELETE_PARAMETER_NOTIFY, MsgSubID.NOTIFY, {}), undefined, {
                retain: true,
            });
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.maintenance.fare.ticketingConsole.url}`,
            ]);
        });
    });

    it('MAINTENANCE_CALIBRATE_BLS_MANUAL (NOTIFY) navigates unconditionally and dispatches', () => {
        callback(buildMessage(MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL, MsgSubID.NOTIFY, {}));
        expect(dispatchSpy).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith([
            `/${routerUrls.private.maintenance.fare.calibrateBLS.calibrateBlsManualInput}`,
        ]);
    });

    it('MAINTENANCE_CALIBRATE_BLS_CALIBRATION (NOTIFY) navigates unconditionally and dispatches', () => {
        callback(buildMessage(MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION, MsgSubID.NOTIFY, {}));
        expect(dispatchSpy).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith([
            `/${routerUrls.private.maintenance.fare.calibrateBLS.calibrateBlsCalibration}`,
        ]);
    });

    describe('FARE_TC_DATETIME (NOTIFY)', () => {
        it('sets tcDateTime and dispatches when payload.date is present', () => {
            callback(buildMessage(MsgID.FARE_TC_DATETIME, MsgSubID.NOTIFY, { date: '2024-01-01T00:00:00.000Z' }));
            expect(component.tcDateTime).toEqual(new Date('2024-01-01T00:00:00.000Z'));
            expect(dispatchSpy).toHaveBeenCalled();
        });

        it('does nothing when payload.date is absent', () => {
            component.tcDateTime = null;
            dispatchSpy.calls.reset();
            callback(buildMessage(MsgID.FARE_TC_DATETIME, MsgSubID.NOTIFY, {}));
            expect(component.tcDateTime).toBeNull();
            expect(dispatchSpy).not.toHaveBeenCalled();
        });
    });

    it('COMMON_PRINT_ERROR (NOTIFY) shows an error popup with the payload message', () => {
        callback(buildMessage(MsgID.COMMON_PRINT_ERROR, MsgSubID.NOTIFY, { message: 'Print failed' }));
        expect(component.showPopUp).toEqual({ title: 'Print failed', type: 'error' });
    });

    describe('BOOT_UP_COMMISSIONING (NOTIFY)', () => {
        it('shows the boot up commissioning popup with the payload message', () => {
            callback(buildMessage(MsgID.BOOT_UP_COMMISSIONING, MsgSubID.NOTIFY, { message: 'Booting' }));
            expect(component.bootUpCommissioning).toEqual({ show: true, title: 'Booting' });
        });

        it('falls back to an empty title when payload.message is absent', () => {
            callback(buildMessage(MsgID.BOOT_UP_COMMISSIONING, MsgSubID.NOTIFY, {}));
            expect(component.bootUpCommissioning).toEqual({ show: true, title: '' });
        });
    });

    // -----------------------------------------------------------------------
    // RESPONSE branch: cases that dispatch and conditionally navigate only
    // when the incoming MQTT packet is retained.
    // -----------------------------------------------------------------------
    const gatedResponseCases: Array<{ name: string; msgID: number; navigatePath: string }> = [
        {
            name: 'MAINTENANCE_FARE_CONSOLE',
            msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.url,
        },
        {
            name: 'MAINTENANCE_DECK_TYPE_LIST',
            msgID: MsgID.MAINTENANCE_DECK_TYPE_LIST,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.deckType,
        },
        {
            name: 'FARE_BUS_STOP_MODE_SELECT',
            msgID: MsgID.FARE_BUS_STOP_MODE_SELECT,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.fareBusStopMode,
        },
        {
            name: 'FARE_BUS_STOP_MODE_SUBMIT',
            msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.fareBusStopMode,
        },
        {
            name: 'MAINTENANCE_DELETE_PARAMETER',
            msgID: MsgID.MAINTENANCE_DELETE_PARAMETER,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.deleteParameter,
        },
        {
            name: 'MAINTENANCE_BUS_ID',
            msgID: MsgID.MAINTENANCE_BUS_ID,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.busId,
        },
        {
            name: 'MAINTENANCE_OPERATOR',
            msgID: MsgID.MAINTENANCE_OPERATOR,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.busId,
        },
        {
            name: 'MAINTENANCE_BUS_ID_SUBMIT',
            msgID: MsgID.MAINTENANCE_BUS_ID_SUBMIT,
            navigatePath: routerUrls.private.maintenance.fare.ticketingConsole.busId,
        },
        {
            name: 'MAINTENANCE_TEST_PRINT',
            msgID: MsgID.MAINTENANCE_TEST_PRINT,
            navigatePath: routerUrls.private.maintenance.fare.externalDevices,
        },
        {
            name: 'MAINTENANCE_PARAMETER',
            msgID: MsgID.MAINTENANCE_PARAMETER,
            navigatePath: routerUrls.private.maintenance.fare.viewParameter,
        },
        {
            name: 'MAINTENANCE_APP_UPGRADE',
            msgID: MsgID.MAINTENANCE_APP_UPGRADE,
            navigatePath: routerUrls.private.maintenance.fare.appUpgrade,
        },
        {
            name: 'MAINTENANCE_UPGRADE_SUBMIT',
            msgID: MsgID.MAINTENANCE_UPGRADE_SUBMIT,
            navigatePath: routerUrls.private.maintenance.fare.appUpgrade,
        },
        {
            name: 'MAINTENANCE_VERSION_INFO',
            msgID: MsgID.MAINTENANCE_VERSION_INFO,
            navigatePath: routerUrls.private.maintenance.fare.versionInfo,
        },
        {
            name: 'MAINTENANCE_BLS_INFORMATION',
            msgID: MsgID.MAINTENANCE_BLS_INFORMATION,
            navigatePath: routerUrls.private.maintenance.fare.blsInformation,
        },
        {
            name: 'MAINTENANCE_REDETECT_CV',
            msgID: MsgID.MAINTENANCE_REDETECT_CV,
            navigatePath: routerUrls.private.maintenance.fare.redetectCv,
        },
        {
            name: 'MAINTENANCE_LOAD_PARAMETERS',
            msgID: MsgID.MAINTENANCE_LOAD_PARAMETERS,
            navigatePath: routerUrls.private.maintenance.fare.loadParameter,
        },
        {
            name: 'MAINTENANCE_SAVE_TRANSACTION',
            msgID: MsgID.MAINTENANCE_SAVE_TRANSACTION,
            navigatePath: routerUrls.private.maintenance.fare.saveTransaction,
        },
        {
            name: 'MAINTENANCE_AUDIT_REGISTRATION',
            msgID: MsgID.MAINTENANCE_AUDIT_REGISTRATION,
            navigatePath: routerUrls.private.maintenance.fare.displayAudit,
        },
        {
            name: 'DECOMMISSION',
            msgID: MsgID.DECOMMISSION,
            navigatePath: routerUrls.private.maintenance.fare.decommission,
        },
    ];

    gatedResponseCases.forEach(({ name, msgID, navigatePath }) => {
        it(`RESPONSE ${name}: dispatches always, navigates only when retained`, () => {
            callback(buildMessage(msgID, MsgSubID.RESPONSE, {}), undefined, { retain: false });
            expect(dispatchSpy).toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();

            dispatchSpy.calls.reset();
            routerMock.navigate.calls.reset();

            callback(buildMessage(msgID, MsgSubID.RESPONSE, {}), undefined, { retain: true });
            expect(dispatchSpy).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${navigatePath}`]);
        });
    });

    it('RESPONSE EXTERNAL_DEVICES dispatches without any navigate gate', () => {
        callback(buildMessage(MsgID.EXTERNAL_DEVICES, MsgSubID.RESPONSE, {}), undefined, { retain: true });
        expect(dispatchSpy).toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('RESPONSE IGNITION_OFF resets the ignition-off popup', () => {
        component.ignitionOff = { show: true, message: 'x', disabled: true };
        callback(buildMessage(MsgID.IGNITION_OFF, MsgSubID.RESPONSE, {}));
        expect(component.ignitionOff).toEqual({ show: false, message: '', disabled: false });
    });

    [MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT, MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM].forEach((msgID) => {
        it(`RESPONSE msgID ${msgID} (manual calibrate bls) dispatches updateManualCalibrateBls`, () => {
            callback(buildMessage(msgID, MsgSubID.RESPONSE, {}));
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    [
        MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START,
        MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
        MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE,
        MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_RESULT,
    ].forEach((msgID) => {
        it(`RESPONSE msgID ${msgID} (bls calibration) dispatches updateBlsCalibration`, () => {
            callback(buildMessage(msgID, MsgSubID.RESPONSE, {}));
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    it('RESPONSE LOGOUT logs the user out and navigates to log-off', () => {
        component.activeLogoutPopup = true;
        callback(buildMessage(MsgID.LOGOUT, MsgSubID.RESPONSE, {}));
        expect(component.activeLogoutPopup).toBeFalse();
        expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.maintenance.logOff}`]);
    });

    describe('RESPONSE MAINTENANCE_BACK', () => {
        it('navigates to the maintenance url when status is SUCCESS', () => {
            callback(buildMessage(MsgID.MAINTENANCE_BACK, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.maintenance.url}`]);
        });

        it('does not navigate when status is not SUCCESS', () => {
            callback(buildMessage(MsgID.MAINTENANCE_BACK, MsgSubID.RESPONSE, { status: ResponseStatus.ERROR }));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });
    });
});
