import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalibrateBLSCalibrationComponent } from './calibrate-bls-calibration.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { blsCalibration } from '@store/maintenance/maintenance.reducer';
import { MsgID, MsgSubID, ResponseStatus } from '@models';
import { routerUrls } from '@app/app.routes';

describe('CalibrateBLSCalibrationComponent', () => {
    let component: CalibrateBLSCalibrationComponent;
    let fixture: ComponentFixture<CalibrateBLSCalibrationComponent>;
    let router: Router;
    let mqttService: MqttService;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CalibrateBLSCalibrationComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CalibrateBLSCalibrationComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        mqttService = TestBed.inject(MqttService);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize blsCalibration to empty object', () => {
        expect(component.blsCalibration).toEqual({});
    });

    it('should initialize inputValue to empty string', () => {
        expect(component.inputValue).toBe('');
    });

    it('handleStart should call mqttService.publishWithMessageFormat', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleStart();
        expect(publishSpy).toHaveBeenCalled();
    });

    it('handleStop should call mqttService.publishWithMessageFormat and dispatch to store', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        const dispatchSpy = spyOn(store, 'dispatch');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleStop();
        expect(publishSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('handleCloseResult should clear inputValue', () => {
        component.inputValue = 'some-value';
        spyOn(router, 'navigate');
        component.handleCloseResult();
        expect(component.inputValue).toBe('');
    });

    it('handleCancelDistance should dispatch store action', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.handleCancelDistance();
        expect(dispatchSpy).toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Extended coverage suite
// ---------------------------------------------------------------------------

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(true);

    mqttConfig = {
        topics: {
            maintenance: {
                get: '/madt/maintenance/fare',
                response: '/tc/maintenance/fare',
            },
            fareTab: {
                get: '/madt/fare',
                response: '/tc/fare',
            },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('CalibrateBLSCalibrationComponent - extended coverage', () => {
    let component: CalibrateBLSCalibrationComponent;
    let fixture: ComponentFixture<CalibrateBLSCalibrationComponent>;
    let store: MockStore;
    let mockMqttService: MockMqttService;
    let router: Router;

    function createDivKey(id: string, text: string): HTMLDivElement {
        // Defensively remove any stale element with this id left by another spec file's fixture.
        document.getElementById(id)?.remove();
        const div = document.createElement('div');
        div.id = id;
        div.innerText = text;
        div.setAttribute('data-test-created', 'true');
        document.body.appendChild(div);
        return div;
    }

    function createInputField(value = ''): HTMLInputElement {
        document.getElementById('inputField')?.remove();
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'inputField';
        input.value = value;
        input.setAttribute('data-test-created', 'true');
        document.body.appendChild(input);
        return input;
    }

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CalibrateBLSCalibrationComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CalibrateBLSCalibrationComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        store = TestBed.inject(Store) as unknown as MockStore;
        fixture.detectChanges();
    });

    afterEach(() => {
        document.querySelectorAll('[data-test-created]').forEach((el) => el.remove());
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        store.resetSelectors();
        try {
            jasmine.clock().uninstall();
        } catch {
            // clock was not installed for this test - nothing to clean up
        }
    });

    // ---------------- ngOnInit / mqttConfigLoaded$ ----------------

    it('sets topics when mqtt config loaded emits true', () => {
        mockMqttService.mqttConfigLoaded$.next(true);
        expect((component as any).topics).toEqual(mockMqttService.mqttConfig.topics);
    });

    it('does not set topics when mqtt config loaded emits false', () => {
        (component as any).topics = undefined;
        mockMqttService.mqttConfigLoaded$.next(false);
        expect((component as any).topics).toBeUndefined();
    });

    // ---------------- ngOnInit / blsCalibration$ + timeout handling ----------------

    it('sets blsCalibration data and does not schedule timeout when timeout is absent', () => {
        jasmine.clock().install();
        const publishSpy = mockMqttService.publishWithMessageFormat;
        store.overrideSelector(blsCalibration, { status: ResponseStatus.SUCCESS });
        store.refreshState();
        expect(component.blsCalibration).toEqual({ status: ResponseStatus.SUCCESS });

        jasmine.clock().tick(10000);
        expect(publishSpy).not.toHaveBeenCalledWith(jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }));
    });

    it('does not schedule timeout when timeout is 0', () => {
        jasmine.clock().install();
        const publishSpy = mockMqttService.publishWithMessageFormat;
        store.overrideSelector(blsCalibration, { status: ResponseStatus.SUCCESS, timeout: 0 });
        store.refreshState();

        jasmine.clock().tick(10000);
        expect(publishSpy).not.toHaveBeenCalledWith(jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }));
    });

    it('schedules a timeout publish + cancel when timeout > 0 and fires after delay', () => {
        jasmine.clock().install();
        const dispatchSpy = spyOn(store, 'dispatch');
        (component as any).topics = mockMqttService.mqttConfig.topics;

        store.overrideSelector(blsCalibration, {
            msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE,
            timeout: 5000,
        });
        store.refreshState();

        jasmine.clock().tick(5001);

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockMqttService.mqttConfig.topics.fareTab.get,
                msgID: MsgID.TIMEOUT_MESSAGE,
                msgSubID: MsgSubID.NOTIFY,
                payload: { msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE },
            }),
        );
        // handleCancelDistance is invoked when the timer fires
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('clears the previous timeout when a new blsCalibration value arrives before it fires', () => {
        jasmine.clock().install();
        (component as any).topics = mockMqttService.mqttConfig.topics;

        store.overrideSelector(blsCalibration, { timeout: 5000 });
        store.refreshState();

        jasmine.clock().tick(1000);
        mockMqttService.publishWithMessageFormat.calls.reset();

        // New value arrives before the first timer fires - it should be cleared
        store.overrideSelector(blsCalibration, { timeout: 5000 });
        store.refreshState();

        jasmine.clock().tick(5001);
        // Only the second timer's publish should have happened, not a double-fire from the first
        const calls = mockMqttService.publishWithMessageFormat.calls
            .all()
            .filter((c: any) => c.args[0].msgID === MsgID.TIMEOUT_MESSAGE);
        expect(calls.length).toBe(1);
    });

    // ---------------- ngOnDestroy ----------------

    it('ngOnDestroy completes destroy$, dispatches reset payload, and clears timeout', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        const nextSpy = spyOn((component as any).destroy$, 'next').and.callThrough();
        const completeSpy = spyOn((component as any).destroy$, 'complete').and.callThrough();

        component.ngOnDestroy();

        expect(nextSpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    // ---------------- handleStart / handleStop / handleSendCommandToBls ----------------

    it('handleStart publishes MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START as REQUEST', () => {
        (component as any).topics = mockMqttService.mqttConfig.topics;
        component.handleStart();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockMqttService.mqttConfig.topics.maintenance.get,
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_START,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            }),
        );
    });

    it('handleStop publishes STOP as NOTIFY and dispatches reset payload', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        (component as any).topics = mockMqttService.mqttConfig.topics;
        component.handleStop();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockMqttService.mqttConfig.topics.maintenance.get,
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_STOP,
                msgSubID: MsgSubID.NOTIFY,
                payload: {},
            }),
        );
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('handleSendCommandToBls publishes SEND_CMD as REQUEST', () => {
        (component as any).topics = mockMqttService.mqttConfig.topics;
        component.handleSendCommandToBls();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockMqttService.mqttConfig.topics.maintenance.get,
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            }),
        );
    });

    // ---------------- handleChangeInput ----------------

    it('backspaceKey with no selection deletes the character before the cursor', () => {
        const input = createInputField('12345');
        input.selectionStart = 3;
        input.selectionEnd = 3;
        const backspace = createDivKey('backspaceKey', '');

        component.handleChangeInput({ target: backspace } as unknown as Event);

        expect(input.value).toBe('1245');
        expect(input.selectionStart).toBe(2);
        expect(input.selectionEnd).toBe(2);
    });

    it('backspaceKey with an active selection deletes the selected text', () => {
        const input = createInputField('12345');
        input.selectionStart = 1;
        input.selectionEnd = 3;
        const backspace = createDivKey('backspaceKey', '');

        component.handleChangeInput({ target: backspace } as unknown as Event);

        expect(input.value).toBe('145');
        expect(input.selectionStart).toBe(1);
        expect(input.selectionEnd).toBe(1);
    });

    it('backspaceKey falls back to 0 when selectionStart/selectionEnd are null', () => {
        const input = createInputField('12345');
        // Force selectionStart/selectionEnd to be null-ish to exercise the `|| 0` fallback
        Object.defineProperty(input, 'selectionStart', { value: null, configurable: true, writable: true });
        Object.defineProperty(input, 'selectionEnd', { value: null, configurable: true, writable: true });
        const backspace = createDivKey('backspaceKey', '');

        expect(() => component.handleChangeInput({ target: backspace } as unknown as Event)).not.toThrow();
    });

    it('enterKey with empty input value returns without calling submitDistance', () => {
        createInputField('');
        const enter = createDivKey('enterKey', '');

        component.handleChangeInput({ target: enter } as unknown as Event);

        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('enterKey with a non-empty input value sets inputValue and submits distance', () => {
        (component as any).topics = mockMqttService.mqttConfig.topics;
        createInputField('123');
        const enter = createDivKey('enterKey', '');

        component.handleChangeInput({ target: enter } as unknown as Event);

        expect(component.inputValue).toBe('123');
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockMqttService.mqttConfig.topics.maintenance.get,
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE,
                msgSubID: MsgSubID.REQUEST,
                payload: { distance: 123 },
            }),
        );
    });

    it('regular digit key inserts the key value at the cursor position', () => {
        const input = createInputField('12');
        input.selectionStart = 1;
        input.selectionEnd = 1;
        const digitKey = createDivKey('digitKey5', '5');

        component.handleChangeInput({ target: digitKey } as unknown as Event);

        expect(input.value).toBe('152');
        expect(input.selectionStart).toBe(2);
        expect(input.selectionEnd).toBe(2);
    });

    // ---------------- submitDistance (private, invoked via bracket access) ----------------

    it('submitDistance does nothing when inputValue is empty', () => {
        component.inputValue = '';
        (component as any).submitDistance();
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('submitDistance publishes distance request when inputValue is set', () => {
        (component as any).topics = mockMqttService.mqttConfig.topics;
        component.inputValue = '42';
        (component as any).submitDistance();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_DISTANCE,
                msgSubID: MsgSubID.REQUEST,
                payload: { distance: 42 },
            }),
        );
    });

    // ---------------- handleConfirmDistance / clearExistingTimeout ----------------

    it('handleConfirmDistance(true) clears an existing timeout and publishes the result', () => {
        (component as any).topics = mockMqttService.mqttConfig.topics;
        component.inputValue = '99';
        (component as any).timeOutId = setTimeout(() => {}, 10000);

        component.handleConfirmDistance(true);

        expect((component as any).timeOutId).toBeUndefined();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                topic: mockMqttService.mqttConfig.topics.maintenance.get,
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_RESULT,
                msgSubID: MsgSubID.REQUEST,
                payload: { distance: 99 },
            }),
        );
    });

    it('handleConfirmDistance(true) works when there is no existing timeout to clear', () => {
        (component as any).topics = mockMqttService.mqttConfig.topics;
        (component as any).timeOutId = undefined;
        component.inputValue = '7';

        expect(() => component.handleConfirmDistance(true)).not.toThrow();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('handleConfirmDistance(false) clears timeout and cancels distance instead of publishing result', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        (component as any).timeOutId = setTimeout(() => {}, 10000);

        component.handleConfirmDistance(false);

        expect((component as any).timeOutId).toBeUndefined();
        expect(dispatchSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: jasmine.objectContaining({
                    msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
                    status: ResponseStatus.SUCCESS,
                }),
            }),
        );
    });

    // ---------------- handleCancelDistance ----------------

    it('handleCancelDistance dispatches updateBlsCalibration with SEND_CMD success payload', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.handleCancelDistance();
        expect(dispatchSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: {
                    msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_CALIBRATION_SEND_CMD,
                    status: ResponseStatus.SUCCESS,
                },
            }),
        );
    });

    // ---------------- handleCloseResult / handleBackToCalibrateBls ----------------

    it('handleCloseResult resets inputValue and navigates back to calibrate BLS screen', () => {
        const navSpy = spyOn(router, 'navigate');
        component.inputValue = 'stale-value';

        component.handleCloseResult();

        expect(component.inputValue).toBe('');
        expect(navSpy).toHaveBeenCalledWith([`${routerUrls.private.maintenance.fare.calibrateBLS.url}`]);
    });

    it('handleBackToCalibrateBls navigates to the calibrate BLS route', () => {
        const navSpy = spyOn(router, 'navigate');
        component.handleBackToCalibrateBls();
        expect(navSpy).toHaveBeenCalledWith([`${routerUrls.private.maintenance.fare.calibrateBLS.url}`]);
    });

    // ---------------- handleButtonSound ----------------

    it('handleButtonSound plays the button sound via SoundService', () => {
        const soundService = TestBed.inject(SoundService) as any;
        const soundSpy = spyOn(soundService, 'playButton');
        component.handleButtonSound();
        expect(soundSpy).toHaveBeenCalled();
    });
});
