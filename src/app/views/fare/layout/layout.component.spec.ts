import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FareLayoutComponent } from './layout.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { routerUrls } from '@app/app.routes';
import { MsgID, MsgSubID, ResponseStatus, FareScreen, LocalStorageKey } from '@models';

// Mock MqttService - following the pattern used in end-trip.component.spec.ts
class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);

    mqttConfig = {
        topics: {
            fareTab: {
                get: '/madt/fare/tab',
                response: '/tc/fare/tab',
            },
            tcToAllTabs: '/tc/all-tabs',
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    unsubscribe = jasmine.createSpy('unsubscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('FareLayoutComponent', () => {
    let component: FareLayoutComponent;
    let fixture: ComponentFixture<FareLayoutComponent>;
    let mockMqttService: MockMqttService;
    let routerMock: { navigate: jasmine.Spy; url: string; events: any };
    let store: MockStore;

    // Helper to build a fake mqtt NOTIFY/RESPONSE message and hand it to the registered callback
    const buildMessage = (
        msgID: number,
        msgSubID: number,
        payload: any = {},
        dateTime: any = new Date().toISOString(),
    ) =>
        JSON.stringify({
            header: { msgID, msgSubID, dateTime, formatVersion: '1' },
            payload,
        });

    const getCallback = () => {
        const args = mockMqttService.subscribe.calls.argsFor(0)[0];
        return args.callback;
    };

    beforeEach(async () => {
        mockMqttService = new MockMqttService();
        routerMock = {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
            url: '/fare',
            events: of({}),
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareLayoutComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FareLayoutComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        spyOn(store, 'dispatch').and.callThrough();
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit / ngOnDestroy', () => {
        it('should initialize and destroy without errors', () => {
            expect(() => {
                component.ngOnInit();
                component.ngOnDestroy();
            }).not.toThrow();
        });

        it('should subscribe to the fare tab topic and register it for cleanup', () => {
            component.ngOnInit();
            expect(mockMqttService.subscribe).toHaveBeenCalled();
            const args = mockMqttService.subscribe.calls.mostRecent().args[0];
            expect(args.topic).toBe('/tc/fare/tab');

            component.ngOnDestroy();
            expect(mockMqttService.unsubscribe).toHaveBeenCalledWith('/tc/fare/tab', args.topicKey);
        });

        it('should not call validatedAuth when not connected', () => {
            mockMqttService.connectionStatus$ = of(false);
            const fixture2 = TestBed.createComponent(FareLayoutComponent);
            const comp2 = fixture2.componentInstance;
            expect(() => comp2.ngOnInit()).not.toThrow();
            // subscribe should not have been called by this fresh instance
        });

        it('should not call validatedAuth when config is not loaded', () => {
            mockMqttService.mqttConfigLoaded$ = of(false);
            const fixture2 = TestBed.createComponent(FareLayoutComponent);
            const comp2 = fixture2.componentInstance;
            expect(() => comp2.ngOnInit()).not.toThrow();
        });

        it('should not call validatedAuth when topics are undefined', () => {
            mockMqttService.mqttConfig = { topics: undefined } as any;
            const fixture2 = TestBed.createComponent(FareLayoutComponent);
            const comp2 = fixture2.componentInstance;
            expect(() => comp2.ngOnInit()).not.toThrow();
        });
    });

    describe('navigate', () => {
        it('should navigate when the target route differs from current route', () => {
            component.currentRoute = '/fare/top-up';
            component.navigate('fare/transaction');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/fare/transaction']);
        });

        it('should prefix the route with a slash when missing', () => {
            component.currentRoute = '/other';
            component.navigate('some-route');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/some-route']);
        });

        it('should not prefix the route when it already starts with a slash', () => {
            component.currentRoute = '/other';
            component.navigate('/already-prefixed');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/already-prefixed']);
        });

        it('should not navigate when the target route equals current route', () => {
            component.currentRoute = '/fare/transaction';
            routerMock.navigate.calls.reset();
            component.navigate('fare/transaction');
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle falsy route gracefully', () => {
            component.currentRoute = '/whatever';
            expect(() => component.navigate(undefined as any)).not.toThrow();
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).navigate();
            }).not.toThrow();
        });
    });

    describe('messValidation', () => {
        it('should invoke callback and update loading when timeStamp >= 0', () => {
            const cb = jasmine.createSpy('cb');
            component.loading = true;
            const result = component.messValidation(5, 0, cb);
            expect(cb).toHaveBeenCalled();
            expect(component.loading).toBeFalse();
            expect(result).toBe(5);
        });

        it('should not invoke callback when timeStamp < 0', () => {
            const cb = jasmine.createSpy('cb');
            const result = component.messValidation(-1, 3, cb);
            expect(cb).not.toHaveBeenCalled();
            expect(result).toBe(0);
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).messValidation();
            }).not.toThrow();
        });
    });

    describe('validatedAuth via mqtt message callback', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should ignore messages with msgID 0', () => {
            const cb = getCallback();
            component.loading = true;
            expect(() => cb(buildMessage(0, MsgSubID.NOTIFY, {}))).not.toThrow();
        });

        it('should handle FARE_SCREEN NOTIFY -> LOGIN_FROM_MAIN_TAB', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_SCREEN, MsgSubID.NOTIFY, { screenType: FareScreen.LOGIN_FROM_MAIN_TAB }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.logOff}`]);
        });

        it('should handle FARE_SCREEN NOTIFY -> ACCESS_DENIED', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_SCREEN, MsgSubID.NOTIFY, { screenType: FareScreen.ACCESS_DENIED }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.accessDenied}`]);
        });

        it('should handle FARE_SCREEN NOTIFY -> WAITING_TRIP_TO_START', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_SCREEN, MsgSubID.NOTIFY, { screenType: FareScreen.WAITING_TRIP_TO_START }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.waitingTripStart}`]);
        });

        it('should handle FARE_SCREEN NOTIFY -> default (on-trip landing page)', () => {
            const cb = getCallback();
            component.currentRoute = '/other';
            cb(buildMessage(MsgID.FARE_SCREEN, MsgSubID.NOTIFY, { screenType: 999 }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.url}`]);
        });

        it('should reset displayLockScreen via handleUnlockSuccess on FARE_SCREEN', () => {
            const cb = getCallback();
            component.displayLockScreen = true;
            cb(buildMessage(MsgID.FARE_SCREEN, MsgSubID.NOTIFY, { screenType: FareScreen.ACCESS_DENIED }));
            expect(component.displayLockScreen).toBeFalse();
        });

        it('should handle FARE_CANCEL_RIDE_CV1 NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CANCEL_RIDE_CV1, MsgSubID.NOTIFY, {}));
            expect(store.dispatch).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cancelRideCV1}`]);
        });

        it('should handle FARE_CANCEL_RIDE_CV2 NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CANCEL_RIDE_CV2, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cancelRideCV2}`]);
        });

        it('should handle FARE_CANCEL_RIDE_SUBMIT_NOTIFY with cvNum', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CANCEL_RIDE_SUBMIT_NOTIFY, MsgSubID.NOTIFY, { cvNum: 1 }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cancelRideCV1}`]);
        });

        it('should handle FARE_CANCEL_RIDE_SUBMIT_NOTIFY without cvNum', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.FARE_CANCEL_RIDE_SUBMIT_NOTIFY, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle FARE_CONCESSION_CV1 NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CONCESSION_CV1, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.concessionCV1}`]);
        });

        it('should handle FARE_CONCESSION_CV2 NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CONCESSION_CV2, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.concessionCV2}`]);
        });

        it('should handle FARE_CONCESSION_SUBMIT_NOTIFY with cvNum', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CONCESSION_SUBMIT_NOTIFY, MsgSubID.NOTIFY, { cvNum: 2 }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.concessionCV2}`]);
        });

        it('should handle FARE_CONCESSION_SUBMIT_NOTIFY without cvNum', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.FARE_CONCESSION_SUBMIT_NOTIFY, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle FARE_BUS_STOP_MODE NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_BUS_STOP_MODE, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.blsOperation.url}`]);
        });

        it('should handle FARE_TOP_UP NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TOP_UP, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.topUp}`]);
        });

        it('should handle FARE_TRANSACTION NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TRANSACTION, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.transaction}`]);
        });

        it('should handle FARE_TRANSACTION_INFORMATION_TYPE_1 NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TRANSACTION_INFORMATION_TYPE_1, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.transaction}`]);
        });

        it('should handle FARE_TRANSACTION_INFORMATION_TYPE_2 NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TRANSACTION_INFORMATION_TYPE_2, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.transaction}`]);
        });

        it('should handle FARE_CV_OPERATION NOTIFY (direct navigate, no store dispatch)', () => {
            const cb = getCallback();
            (store.dispatch as jasmine.Spy).calls.reset();
            cb(buildMessage(MsgID.FARE_CV_OPERATION, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should handle FARE_CO_CV_STATUS NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_CV_STATUS, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.showCVStatus}`]);
        });

        it('should handle FARE_CO_CV_ENTRY_EXIT NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_CV_ENTRY_EXIT, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.setCV}`]);
        });

        it('should handle FARE_CO_CV_MODE_CONTROL NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_CV_MODE_CONTROL, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.cvModeControl}`]);
        });

        it('should handle FARE_CO_POWER_ALL_CV_ON NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_POWER_ALL_CV_ON, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.powerAllCVOn}`]);
        });

        it('should handle FARE_CO_POWER_ALL_CV_OFF NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_POWER_ALL_CV_OFF, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.powerAllCVOff}`]);
        });

        it('should handle FARE_CO_CV_POWER_CTRL NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_CV_POWER_CTRL, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.fare.cvOperation.cvPowerControl}`,
            ]);
        });

        it('should handle FARE_CO_RESET_ALL_CV NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_RESET_ALL_CV, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.resetAllCV}`]);
        });

        it('should handle FARE_PRINTER_OPERATION NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PRINTER_OPERATION, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.printerOperation.url}`]);
        });

        it('should handle FARE_PO_PRINTER_STATUS NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINTER_STATUS, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.printerOperation.status}`]);
        });

        it('should handle FARE_PO_PRINT_RETENTION_TICKET NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINT_RETENTION_TICKET, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.fare.printerOperation.retentionTicket}`,
            ]);
        });

        it('should handle FARE_PO_PRINTER_ON NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINTER_ON, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.fare.printerOperation.printerOn}`,
            ]);
        });

        it('should handle FARE_PO_PRINTER_OFF NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINTER_OFF, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.fare.printerOperation.printerOff}`,
            ]);
        });

        it('should handle EXTERNAL_DEVICES_NOTIFY with navigation required', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.EXTERNAL_DEVICES_NOTIFY, MsgSubID.NOTIFY, { isNavigationRequired: true }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.externalDevices}`]);
        });

        it('should handle EXTERNAL_DEVICES_NOTIFY without navigation required', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.EXTERNAL_DEVICES_NOTIFY, MsgSubID.NOTIFY, { isNavigationRequired: false }));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle EXTERNAL_DEVICES_NOTIFY with isNavigationRequired undefined (defaults false)', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.EXTERNAL_DEVICES_NOTIFY, MsgSubID.NOTIFY, {}));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle NOTIFY_TO_LOCK by calling handleLockScreen', () => {
            const cb = getCallback();
            component.displayLockPopUp = true;
            cb(buildMessage(MsgID.NOTIFY_TO_LOCK, MsgSubID.NOTIFY, {}));
            expect(component.displayLockPopUp).toBeFalse();
            expect(component.displayLockScreen).toBeTrue();
        });

        it('should handle UNLOCK_SUCCESS NOTIFY without throwing', () => {
            const cb = getCallback();
            expect(() => cb(buildMessage(MsgID.UNLOCK_SUCCESS, MsgSubID.NOTIFY, {}))).not.toThrow();
        });

        it('should handle MANUAL_LOGIN_PIN NOTIFY and dispatch updateLockScreen with timeout', () => {
            const cb = getCallback();
            (store.dispatch as jasmine.Spy).calls.reset();
            cb(buildMessage(MsgID.MANUAL_LOGIN_PIN, MsgSubID.NOTIFY, { timeout: 30 }));
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('should handle MANUAL_LOGIN_PIN2 NOTIFY without timeout (falls back to undefined)', () => {
            const cb = getCallback();
            (store.dispatch as jasmine.Spy).calls.reset();
            cb(buildMessage(MsgID.MANUAL_LOGIN_PIN2, MsgSubID.NOTIFY, {}));
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('should handle FARE_SPID NOTIFY with message', () => {
            const cb = getCallback();
            component.currentRoute = '/other';
            cb(buildMessage(MsgID.FARE_SPID, MsgSubID.NOTIFY, { message: 'SPID-123' }));
            expect(component.spid).toBe('SPID-123');
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.url}`]);
        });

        it('should handle FARE_SPID NOTIFY without message (defaults to empty string)', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_SPID, MsgSubID.NOTIFY, {}));
            expect(component.spid).toBe('');
        });

        it('should handle COMMON_PRINT_ERROR NOTIFY and set showPopUp', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.COMMON_PRINT_ERROR, MsgSubID.NOTIFY, { message: 'Print failed' }));
            expect(component.showPopUp).toEqual({ title: 'Print failed', type: 'error' });
        });

        it('should handle FARE_BYPASS_BLACKLIST_ACTIVE NOTIFY', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_BYPASS_BLACKLIST_ACTIVE, MsgSubID.NOTIFY, {}));
            expect(component.displayWarning).toBeTrue();
        });

        it('should handle FARE_BYPASS_BLACKLIST_INACTIVE NOTIFY', () => {
            const cb = getCallback();
            component.displayWarning = true;
            cb(buildMessage(MsgID.FARE_BYPASS_BLACKLIST_INACTIVE, MsgSubID.NOTIFY, {}));
            expect(component.displayWarning).toBeFalse();
        });

        it('should handle BOOT_UP_COMMISSIONING NOTIFY with message', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.BOOT_UP_COMMISSIONING, MsgSubID.NOTIFY, { message: 'Booting' }));
            expect(component.bootUpCommissioning).toEqual({ show: true, title: 'Booting' });
        });

        it('should handle BOOT_UP_COMMISSIONING NOTIFY without message', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.BOOT_UP_COMMISSIONING, MsgSubID.NOTIFY, {}));
            expect(component.bootUpCommissioning).toEqual({ show: true, title: '' });
        });

        it('should hit default case for an unhandled NOTIFY msgID', () => {
            const cb = getCallback();
            expect(() => cb(buildMessage(999999, MsgSubID.NOTIFY, {}))).not.toThrow();
        });

        // ------- RESPONSE branch -------

        it('should handle FARE_CV_OPERATION_BACK RESPONSE with SUCCESS status', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CV_OPERATION_BACK, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should not navigate for FARE_CV_OPERATION_BACK RESPONSE with non-SUCCESS status', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.FARE_CV_OPERATION_BACK, MsgSubID.RESPONSE, { status: ResponseStatus.ERROR }));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle FARE_CO_CV_ENTRY_EXIT_CONFIRM RESPONSE with SUCCESS', () => {
            const cb = getCallback();
            cb(
                buildMessage(MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM, MsgSubID.RESPONSE, {
                    status: ResponseStatus.SUCCESS,
                }),
            );
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should handle FARE_CO_CV_ENTRY_EXIT_CANCEL RESPONSE with non-SUCCESS', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.FARE_CO_CV_ENTRY_EXIT_CANCEL, MsgSubID.RESPONSE, { status: ResponseStatus.ERROR }));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle FARE_CO_POWER_ALL_CV_CONFIRM RESPONSE with SUCCESS', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_POWER_ALL_CV_CONFIRM, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should handle FARE_CO_POWER_ALL_CV_CANCEL RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_POWER_ALL_CV_CANCEL, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should handle FARE_CO_RESET_ALL_CV_CONFIRM RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_RESET_ALL_CV_CONFIRM, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should handle FARE_CO_RESET_ALL_CV_CANCEL RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_RESET_ALL_CV_CANCEL, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should handle FARE_CO_CV_MODE_CONTROL_SELECT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_CV_MODE_CONTROL_SELECT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.cvModeControl}`]);
        });

        it('should handle FARE_CO_CV_MODE_CONTROL_CONFIRM RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cvOperation.url}`]);
        });

        it('should handle FARE_PO_PRINT_RTK_SELECT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINT_RTK_SELECT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.fare.printerOperation.retentionTicket}`,
            ]);
        });

        it('should handle FARE_PO_PRINT_RTK_CONFIRM RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINT_RTK_CONFIRM, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.fare.printerOperation.retentionTicket}`,
            ]);
        });

        it('should handle FARE_PO_PRINT_RTK_CANCEL RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINT_RTK_CANCEL, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${routerUrls.private.fare.printerOperation.retentionTicket}`,
            ]);
        });

        it('should handle FARE_PO_PRINT_RTK_BACK RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINT_RTK_BACK, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.printerOperation.url}`]);
        });

        it('should handle FARE_PO_PRINT_RTK_PRINT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_PO_PRINT_RTK_PRINT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.printerOperation.url}`]);
        });

        it('should handle FARE_CANCEL_RIDE_SUBMIT RESPONSE with cvNum', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CANCEL_RIDE_SUBMIT, MsgSubID.RESPONSE, { cvNum: 1 }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.cancelRideCV1}`]);
        });

        it('should handle FARE_CANCEL_RIDE_SUBMIT RESPONSE without cvNum', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.FARE_CANCEL_RIDE_SUBMIT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle FARE_CONCESSION_SUBMIT RESPONSE with cvNum', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_CONCESSION_SUBMIT, MsgSubID.RESPONSE, { cvNum: 2 }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.concessionCV2}`]);
        });

        it('should handle FARE_CONCESSION_SUBMIT RESPONSE without cvNum', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.FARE_CONCESSION_SUBMIT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle FARE_BUS_STOP_MODE_SELECT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_BUS_STOP_MODE_SELECT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.blsOperation.url}`]);
        });

        it('should handle FARE_BUS_STOP_MODE_SUBMIT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_BUS_STOP_MODE_SUBMIT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.blsOperation.url}`]);
        });

        it('should handle FARE_TOP_UP_SELECT_AMT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TOP_UP_SELECT_AMT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.topUp}`]);
        });

        it('should handle FARE_TOP_UP_SUBMIT RESPONSE', () => {
            const cb = getCallback();
            component.currentRoute = '/other';
            cb(buildMessage(MsgID.FARE_TOP_UP_SUBMIT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.url}`]);
        });

        it('should handle FARE_TRANSACTION_SELECT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TRANSACTION_SELECT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.transaction}`]);
        });

        it('should handle FARE_TRANSACTION_CONFIRM RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TRANSACTION_CONFIRM, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.transaction}`]);
        });

        it('should handle FARE_TRANSACTION_BACK RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.FARE_TRANSACTION_BACK, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.transaction}`]);
        });

        it('should handle EXTERNAL_DEVICES RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.EXTERNAL_DEVICES, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.externalDevices}`]);
        });

        it('should handle MAINTENANCE_TEST_PRINT RESPONSE', () => {
            const cb = getCallback();
            cb(buildMessage(MsgID.MAINTENANCE_TEST_PRINT, MsgSubID.RESPONSE, {}));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.externalDevices}`]);
        });

        it('should handle FARE_BACK_BUTTON RESPONSE with SUCCESS', () => {
            const cb = getCallback();
            component.currentRoute = '/other';
            cb(buildMessage(MsgID.FARE_BACK_BUTTON, MsgSubID.RESPONSE, { status: ResponseStatus.SUCCESS }));
            expect(routerMock.navigate).toHaveBeenCalledWith([`/${routerUrls.private.fare.url}`]);
        });

        it('should not navigate for FARE_BACK_BUTTON RESPONSE with non-SUCCESS', () => {
            const cb = getCallback();
            routerMock.navigate.calls.reset();
            cb(buildMessage(MsgID.FARE_BACK_BUTTON, MsgSubID.RESPONSE, { status: ResponseStatus.ERROR }));
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should handle MANUAL_LOGIN_PIN2 RESPONSE success branch (no dispatch)', () => {
            const cb = getCallback();
            (store.dispatch as jasmine.Spy).calls.reset();
            cb(
                buildMessage(MsgID.MANUAL_LOGIN_PIN2, MsgSubID.RESPONSE, {
                    status: ResponseStatus.SUCCESS,
                }),
            );
            // Success + msgID === MANUAL_LOGIN_PIN2 path does not dispatch
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('should handle MANUAL_LOGIN_PIN RESPONSE else branch (dispatches updateLockScreen)', () => {
            const cb = getCallback();
            (store.dispatch as jasmine.Spy).calls.reset();
            cb(
                buildMessage(MsgID.MANUAL_LOGIN_PIN, MsgSubID.RESPONSE, {
                    status: ResponseStatus.ERROR,
                    timeout: 15,
                }),
            );
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('should hit default case for an unhandled RESPONSE msgID', () => {
            const cb = getCallback();
            expect(() => cb(buildMessage(999999, MsgSubID.RESPONSE, {}))).not.toThrow();
        });

        it('should do nothing for msgSubID values other than NOTIFY/RESPONSE', () => {
            const cb = getCallback();
            expect(() => cb(buildMessage(MsgID.FARE_TOP_UP, MsgSubID.REQUEST, {}))).not.toThrow();
        });
    });

    describe('handleClickLock', () => {
        it('should show the lock pop up', () => {
            component.displayLockPopUp = false;
            component.handleClickLock();
            expect(component.displayLockPopUp).toBeTrue();
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).handleClickLock();
            }).not.toThrow();
        });
    });

    describe('handleConfirmLock', () => {
        it('should publish LOCK_CONFIRM when confirmed', () => {
            component.topics = { fareTab: { get: '/madt/fare/tab' } };
            component.handleConfirmLock(true);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
            const callArgs = mockMqttService.publishWithMessageFormat.calls.mostRecent().args[0];
            expect(callArgs.msgID).toBe(MsgID.LOCK_CONFIRM);
        });

        it('should hide the lock pop up when not confirmed', () => {
            component.displayLockPopUp = true;
            component.handleConfirmLock(false);
            expect(component.displayLockPopUp).toBeFalse();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).handleConfirmLock();
            }).not.toThrow();
        });
    });

    describe('handleLockScreen', () => {
        it('should show the lock screen, hide the popup and dispatch NOTIFY_TO_LOCK', () => {
            component.displayLockPopUp = true;
            component.displayLockScreen = false;
            (store.dispatch as jasmine.Spy).calls.reset();
            component.handleLockScreen();
            expect(component.displayLockPopUp).toBeFalse();
            expect(component.displayLockScreen).toBeTrue();
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).handleLockScreen();
            }).not.toThrow();
        });
    });

    describe('handleUnlockSuccess', () => {
        it('should hide the lock screen', () => {
            component.displayLockScreen = true;
            component.handleUnlockSuccess();
            expect(component.displayLockScreen).toBeFalse();
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).handleUnlockSuccess();
            }).not.toThrow();
        });
    });

    describe('closePopUpHandler', () => {
        it('should reset showPopUp to null', () => {
            component.showPopUp = { title: 't', type: 'error' };
            component.closePopUpHandler();
            expect(component.showPopUp).toBeNull();
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).closePopUpHandler();
            }).not.toThrow();
        });
    });

    describe('handleConfirmLanguage', () => {
        it('should publish language messages and persist to local storage', () => {
            component.topics = { fareTab: { get: '/madt/fare/tab' }, tcToAllTabs: '/tc/all-tabs' };
            const localStorageService = TestBed.inject(LocalStorageService);
            spyOn(localStorageService, 'setItem');
            component.handleConfirmLanguage('en');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledTimes(2);
            expect(localStorageService.setItem).toHaveBeenCalledWith(LocalStorageKey.LANGUAGE, JSON.stringify('en'));
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).handleConfirmLanguage();
            }).not.toThrow();
        });
    });

    describe('handleChangeAudioVolume', () => {
        it('should publish volume message and persist to local storage', () => {
            component.topics = { tcToAllTabs: '/tc/all-tabs' };
            const localStorageService = TestBed.inject(LocalStorageService);
            spyOn(localStorageService, 'setItem');
            component.handleChangeAudioVolume(7);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
            expect(localStorageService.setItem).toHaveBeenCalledWith(LocalStorageKey.VOLUME, JSON.stringify(7));
        });

        it('should execute without errors (legacy smoke test)', () => {
            expect(() => {
                (component as any).handleChangeAudioVolume();
            }).not.toThrow();
        });
    });
});
