import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalibrateBLSManualInputComponent } from './calibrate-bls-manual-input.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { manualCalibrateBls } from '@store/maintenance/maintenance.reducer';
import { MsgID, MsgSubID } from '@models';
import { routerUrls } from '@app/app.routes';

// Mock MqttService following the pattern used in end-trip.component.spec.ts / login-tap-card.component.spec.ts
class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(false);

    mqttConfig: any = {
        topics: {
            fareTab: {
                get: '/madt/fare/tab',
            },
            maintenance: {
                get: '/madt/maintenance/fare',
            },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('CalibrateBLSManualInputComponent', () => {
    let component: CalibrateBLSManualInputComponent;
    let fixture: ComponentFixture<CalibrateBLSManualInputComponent>;
    let mqttService: MqttService;
    let mockMqttService: MockMqttService;
    let store: MockStore;

    function createInputField(value: string, selectionStart: number, selectionEnd: number): HTMLInputElement {
        document.getElementById('inputField')?.remove();
        const inputField = document.createElement('input');
        inputField.id = 'inputField';
        document.body.appendChild(inputField);
        inputField.value = value;
        inputField.selectionStart = selectionStart;
        inputField.selectionEnd = selectionEnd;
        return inputField;
    }

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CalibrateBLSManualInputComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CalibrateBLSManualInputComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    afterEach(() => {
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        store.resetSelectors();
        document.getElementById('inputField')?.remove();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize manualCalibrateBls to empty object', () => {
        expect(component.manualCalibrateBls).toEqual({});
    });

    it('should initialize inputValue to empty string', () => {
        expect(component.inputValue).toBe('');
    });

    describe('ngOnInit - mqttConfigLoaded$ subscription', () => {
        it('should set topics when config is loaded', () => {
            mockMqttService.mqttConfigLoaded$.next(true);
            expect(component.topics).toBe(mockMqttService.mqttConfig.topics);
        });

        it('should not set topics when config is not loaded', () => {
            component.topics = undefined;
            mockMqttService.mqttConfigLoaded$.next(false);
            expect(component.topics).toBeUndefined();
        });
    });

    describe('ngOnInit - manualCalibrateBls$ subscription', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should update manualCalibrateBls when the selector emits', () => {
            store.overrideSelector(manualCalibrateBls, { newFactor: 42 });
            store.refreshState();
            expect(component.manualCalibrateBls).toEqual({ newFactor: 42 });
        });

        it('should set a timeout timer and publish TIMEOUT_MESSAGE + navigate back when data.timeout > 0', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');
            component.topics = mockMqttService.mqttConfig.topics;

            store.overrideSelector(manualCalibrateBls, {
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
                timeout: 1000,
            });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(1001);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockMqttService.mqttConfig.topics.fareTab.get,
                    msgID: MsgID.TIMEOUT_MESSAGE,
                    msgSubID: MsgSubID.NOTIFY,
                    payload: { msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT },
                }),
            );
            expect(router.navigate).toHaveBeenCalledWith([`${routerUrls.private.maintenance.fare.calibrateBLS.url}`]);
        });

        it('should not set a timeout timer when data.timeout is 0', () => {
            mockMqttService.publishWithMessageFormat.calls.reset();
            store.overrideSelector(manualCalibrateBls, { timeout: 0 });
            store.refreshState();

            jasmine.clock().tick(10000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
        });

        it('should not set a timeout timer when data.timeout is undefined', () => {
            mockMqttService.publishWithMessageFormat.calls.reset();
            store.overrideSelector(manualCalibrateBls, {});
            store.refreshState();

            jasmine.clock().tick(10000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
        });

        it('should clear a previously pending timeout when a new emission arrives', () => {
            store.overrideSelector(manualCalibrateBls, {
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
                timeout: 1000,
            });
            store.refreshState();

            // A second emission (without timeout) should clear the first pending timer.
            store.overrideSelector(manualCalibrateBls, {});
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(2000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
        });

        it('should handle null/undefined emitted data gracefully', () => {
            store.overrideSelector(manualCalibrateBls, undefined as any);
            expect(() => store.refreshState()).not.toThrow();
        });
    });

    describe('handleChangeInput - backspaceKey', () => {
        it('should delete the character before the cursor when there is no selection', () => {
            const inputField = createInputField('1234', 2, 2);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event);
            expect(inputField.value).toBe('134');
        });

        it('should delete the selected text when there is a selection', () => {
            const inputField = createInputField('1234', 1, 3);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event);
            expect(inputField.value).toBe('14');
        });

        it('should focus the input field afterwards', () => {
            const inputField = createInputField('1234', 2, 2);
            spyOn(inputField, 'focus');
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event);
            expect(inputField.focus).toHaveBeenCalled();
        });
    });

    describe('handleChangeInput - enterKey', () => {
        it('should return early and not publish when the input value is empty', () => {
            createInputField('', 0, 0);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event);
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
            expect(component.inputValue).toBe('');
        });

        it('should submit the numeric value and set inputValue when the input value is non-empty', () => {
            component.topics = mockMqttService.mqttConfig.topics;
            createInputField('1234', 4, 4);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event);

            expect(component.inputValue).toBe('1234');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockMqttService.mqttConfig.topics.maintenance.get,
                    msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
                    msgSubID: MsgSubID.REQUEST,
                    payload: { input: 1234 },
                }),
            );
        });

        it('should still publish when topics is undefined (optional chaining)', () => {
            component.topics = undefined;
            createInputField('99', 2, 2);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ topic: undefined, payload: { input: 99 } }),
            );
        });
    });

    describe('submitNewCalibFactor (private) - empty value guard', () => {
        it('should return early and not publish when called directly with an empty value', () => {
            mockMqttService.publishWithMessageFormat.calls.reset();
            (component as any).submitNewCalibFactor('');
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });
    });

    describe('handleChangeInput - regular key press', () => {
        it('should insert the pressed key value at the cursor position', () => {
            const inputField = createInputField('12', 2, 2);
            component.handleChangeInput({ target: { id: 'numKey', innerText: '3' } } as unknown as Event);
            expect(inputField.value).toBe('123');
        });

        it('should replace a selection with the pressed key value', () => {
            const inputField = createInputField('1234', 1, 3);
            component.handleChangeInput({ target: { id: 'numKey', innerText: '9' } } as unknown as Event);
            expect(inputField.value).toBe('194');
        });

        it('should trim the pressed key innerText before inserting', () => {
            const inputField = createInputField('12', 2, 2);
            component.handleChangeInput({ target: { id: 'numKey', innerText: '  7  ' } } as unknown as Event);
            expect(inputField.value).toBe('127');
        });
    });

    describe('handleConfirmNewFactor', () => {
        it('should publish MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM when isConfirm is true', () => {
            component.topics = mockMqttService.mqttConfig.topics;
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleConfirmNewFactor(true);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: mockMqttService.mqttConfig.topics.maintenance.get,
                    msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                }),
            );
        });

        it('should navigate back to calibrate BLS when isConfirm is false', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleConfirmNewFactor(false);

            expect(router.navigate).toHaveBeenCalledWith([`${routerUrls.private.maintenance.fare.calibrateBLS.url}`]);
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_CONFIRM }),
            );
        });

        it('should clear an existing pending timeout when confirmed', () => {
            jasmine.clock().install();
            store.overrideSelector(manualCalibrateBls, {
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
                timeout: 1000,
            });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleConfirmNewFactor(true);

            jasmine.clock().tick(2000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
            jasmine.clock().uninstall();
        });

        it('should be a no-op clearExistingTimeout branch when there is no pending timeout', () => {
            expect((component as any).timeOutId).toBeUndefined();
            expect(() => component.handleConfirmNewFactor(true)).not.toThrow();
        });
    });

    describe('handleClosePopUp', () => {
        it('should reset inputValue and navigate back to calibrate BLS', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');
            component.inputValue = '123';

            component.handleClosePopUp();

            expect(component.inputValue).toBe('');
            expect(router.navigate).toHaveBeenCalledWith([`${routerUrls.private.maintenance.fare.calibrateBLS.url}`]);
        });
    });

    describe('handleBackToCalibrateBls', () => {
        it('should navigate to the calibrate BLS route', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');
            component.handleBackToCalibrateBls();
            expect(router.navigate).toHaveBeenCalledWith([`${routerUrls.private.maintenance.fare.calibrateBLS.url}`]);
        });
    });

    describe('handleButtonSound', () => {
        it('should invoke soundService.playButton', () => {
            const soundService = (component as any).soundService;
            const spy = spyOn(soundService, 'playButton');
            component.handleButtonSound();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should complete destroy$, dispatch updateManualCalibrateBls, and clear timeout', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            expect(() => component.ngOnDestroy()).not.toThrow();
            expect(dispatchSpy).toHaveBeenCalledWith(jasmine.objectContaining({ payload: { newFactor: undefined } }));
        });

        it('should clear a pending timeout on destroy', () => {
            jasmine.clock().install();
            store.overrideSelector(manualCalibrateBls, {
                msgID: MsgID.MAINTENANCE_CALIBRATE_BLS_MANUAL_INPUT,
                timeout: 1000,
            });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            component.ngOnDestroy();

            jasmine.clock().tick(2000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
            jasmine.clock().uninstall();
        });
    });
});
