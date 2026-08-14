import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginManualComponent } from './login-manual.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { ResponseStatus, MsgID, MsgSubID } from '@models';
import { MqttService } from '@services/mqtt.service';
import { manualLogin, outOfService } from '@store/main/main.reducer';
import { BehaviorSubject, of } from 'rxjs';

// Mock MqttService following the pattern used in end-trip.component.spec.ts / login-tap-card.component.spec.ts
class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(false);

    mqttConfig = {
        topics: {
            mainTab: {
                get: '/madt/main/tab',
            },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('LoginManualComponent', () => {
    let component: LoginManualComponent;
    let fixture: ComponentFixture<LoginManualComponent>;
    let mockMqttService: MockMqttService;
    let store: MockStore;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LoginManualComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginManualComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as unknown as MockStore;
        fixture.detectChanges();
    });

    function createInputField(
        id: string,
        value: string,
        selectionStart?: number,
        selectionEnd?: number,
    ): HTMLInputElement {
        let inputField = document.getElementById(id) as HTMLInputElement;
        if (inputField) {
            inputField.remove();
        }
        inputField = document.createElement('input');
        inputField.id = id;
        document.body.appendChild(inputField);
        inputField.value = value;
        if (selectionStart !== undefined) {
            inputField.selectionStart = selectionStart;
        }
        if (selectionEnd !== undefined) {
            inputField.selectionEnd = selectionEnd;
        }
        return inputField;
    }

    afterEach(() => {
        ['inputPinField', 'inputStaffIdField', 'inputDutyField', 'inputDutyIdField'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        store.resetSelectors();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize component without errors', () => {
        expect(() => {
            if ((component as any).ngOnInit) {
                (component as any).ngOnInit();
            }
        }).not.toThrow();
    });

    it('should navigate back to login', () => {
        component.topics = { mainTab: { get: 'test-topic' } };
        component.backToLogin();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should go back to enter PIN', () => {
        component.topics = { mainTab: { get: 'test-topic' } };
        component.backToEnterPIN();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should go back to enter staff ID', () => {
        const dispatchSpy = spyOn(store, 'dispatch');

        component.backToEnterStaffId();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    describe('constructor - currentLanguage', () => {
        it('should default currentLanguage to empty string when translate.currentLang is falsy', () => {
            // The component created in the outer beforeEach never had translate.currentLang set.
            expect(component.currentLanguage).toBe('');
        });

        it('should uppercase currentLanguage when translate.currentLang is set', () => {
            const translate = TestBed.inject(TranslateService);
            translate.use('fr');

            const newFixture = TestBed.createComponent(LoginManualComponent);
            expect(newFixture.componentInstance.currentLanguage).toBe('FR');
        });
    });

    describe('ngOnInit - manualLogin$ subscription', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should reset pin/staffId values and set dutyValue from data.dutyNumber', () => {
            component.pinValue = '1234';
            component.staffIdValue = '5678';

            store.overrideSelector(manualLogin, { dutyNumber: '9999' });
            store.refreshState();

            expect(component.pinValue).toBe('');
            expect(component.staffIdValue).toBe('');
            expect(component.dutyValue).toBe('9999');
        });

        it('should default dutyValue to empty string when dutyNumber is absent', () => {
            store.overrideSelector(manualLogin, {});
            store.refreshState();

            expect(component.dutyValue).toBe('');
        });

        it('should handle null/undefined emitted data gracefully', () => {
            store.overrideSelector(manualLogin, undefined as any);
            expect(() => store.refreshState()).not.toThrow();
            expect(component.manualLoginData).toEqual({});
        });

        it('should schedule a TIMEOUT_MESSAGE with MANUAL_LOGIN_PIN when data.timeout > 0 and msgSubID is NOTIFY', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            store.overrideSelector(manualLogin, { timeout: 1000, msgSubID: MsgSubID.NOTIFY });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(1001);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.TIMEOUT_MESSAGE,
                    msgSubID: MsgSubID.NOTIFY,
                    payload: { msgID: MsgID.MANUAL_LOGIN_PIN },
                }),
            );
        });

        it('should schedule a TIMEOUT_MESSAGE with MANUAL_LOGIN_PIN2 when data.timeout > 0 and msgSubID is not NOTIFY', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            store.overrideSelector(manualLogin, { timeout: 1000, msgSubID: MsgSubID.REQUEST });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(1001);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.TIMEOUT_MESSAGE,
                    payload: { msgID: MsgID.MANUAL_LOGIN_PIN2 },
                }),
            );
        });

        it('should not schedule a timeout timer when data.timeout is 0/undefined', () => {
            store.overrideSelector(manualLogin, { timeout: 0 });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(5000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
        });

        it('should clear a previous timer when a new emission arrives before it fires', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            store.overrideSelector(manualLogin, { timeout: 5000, msgSubID: MsgSubID.NOTIFY });
            store.refreshState();

            // A second emission before the first timer fires should clear the first timeout.
            store.overrideSelector(manualLogin, { timeout: 0 });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(6000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
        });
    });

    describe('ngOnInit - outOfService$ subscription', () => {
        it('should update outOfServiceData when outOfService$ emits', () => {
            store.overrideSelector(outOfService, { title: 'OUT', noTapping: true });
            store.refreshState();
            expect(component.outOfServiceData).toEqual({ title: 'OUT', noTapping: true });
        });
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

    describe('handleChangeInput - backspaceKey', () => {
        it('should delete the character before the cursor when there is no selection', () => {
            const inputField = createInputField('inputPinField', '1234', 2, 2);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'inputPinField');
            expect(inputField.value).toBe('134');
            expect(component.pinValue).toBe('134');
        });

        it('should delete the selected text when there is a selection', () => {
            const inputField = createInputField('inputStaffIdField', '1234', 1, 3);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'inputStaffIdField');
            expect(inputField.value).toBe('14');
            expect(component.staffIdValue).toBe('14');
        });

        it('should clear pinError/dutyError and dispatch updateManualLogin via removeErrorMessage', () => {
            createInputField('inputDutyField', '1234', 2, 2);
            component.pinError = 'SOME_ERROR';
            component.dutyError = 'SOME_ERROR';
            const dispatchSpy = spyOn(store, 'dispatch');

            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'inputDutyField');

            expect(component.pinError).toBe('');
            expect(component.dutyError).toBe('');
            expect(dispatchSpy).toHaveBeenCalled();
            expect(component.dutyValue).toBe('134');
        });

        it('should clear message when manualLoginData.status is ERROR', () => {
            createInputField('inputPinField', '1234', 2, 2);
            (component as any).manualLoginData = {
                message: 'oops',
                status: ResponseStatus.ERROR,
                msgID: MsgID.MANUAL_LOGIN_PIN2,
            };
            const dispatchSpy = spyOn(store, 'dispatch');

            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'inputPinField');

            const dispatchedAction = dispatchSpy.calls.mostRecent().args[0] as any;
            expect(dispatchedAction.payload.message).toBeUndefined();
        });

        it('should keep message when manualLoginData.status is not ERROR', () => {
            createInputField('inputPinField', '1234', 2, 2);
            (component as any).manualLoginData = {
                message: 'kept',
                status: ResponseStatus.SUCCESS,
                msgID: MsgID.MANUAL_LOGIN_PIN2,
            };
            const dispatchSpy = spyOn(store, 'dispatch');

            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'inputPinField');

            const dispatchedAction = dispatchSpy.calls.mostRecent().args[0] as any;
            expect(dispatchedAction.payload.message).toBe('kept');
        });
    });

    describe('handleChangeInput - selectionStart/selectionEnd fallback', () => {
        it('should default start/end to 4 for inputDutyIdField key when selection is unset', () => {
            const inputField = createInputField('inputDutyIdField', '', 0, 0);
            expect(() =>
                component.handleChangeInput(
                    { target: { id: 'numKey', innerText: '9' } } as unknown as Event,
                    'inputDutyIdField',
                ),
            ).not.toThrow();
            // start/end fell back to 4 on an empty value, so nothing is actually inserted mid-string
            expect(inputField.value).toBe('9');
        });

        it('should default start/end to 0 for other keys when selection is unset', () => {
            const inputField = createInputField('inputPinField', '', 0, 0);
            component.handleChangeInput(
                { target: { id: 'numKey', innerText: '7' } } as unknown as Event,
                'inputPinField',
            );
            expect(inputField.value).toBe('7');
        });
    });

    describe('handleChangeInput - enterKey', () => {
        it('should return early and not publish when the input value is empty', () => {
            createInputField('inputPinField', '', 0, 0);
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'inputPinField');

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should submit the PIN for inputPinField', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('inputPinField', '1234', 4, 4);
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'inputPinField');

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.MANUAL_LOGIN_PIN2,
                    msgSubID: MsgSubID.REQUEST,
                    payload: { pin: '1234' },
                }),
            );
            expect(component.pinError).toBe('');
        });

        it('should submit the staff ID for inputStaffIdField', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('inputStaffIdField', 'ABC123', 6, 6);
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'inputStaffIdField');

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.MANUAL_LOGIN_STAFF_ID,
                    msgSubID: MsgSubID.REQUEST,
                    payload: { staffId: 'ABC123' },
                }),
            );
        });

        it('should submit the duty number for inputDutyField when length <= 4', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('inputDutyField', '9999', 4, 4);
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'inputDutyField');

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.MANUAL_LOGIN_DUTY,
                    msgSubID: MsgSubID.REQUEST,
                    payload: { dutyNumber: '9999' },
                }),
            );
            expect(component.dutyError).toBe('');
        });

        it('should set dutyError and not publish when the duty number length > 4', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('inputDutyField', '99999', 5, 5);
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'inputDutyField');

            expect(component.dutyError).toBe('DUTY_MAX_LENGTH');
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should not publish for an unrecognized field key', () => {
            const inputField = createInputField('someOtherField', 'xyz', 3, 3);
            mockMqttService.publishWithMessageFormat.calls.reset();

            expect(() =>
                component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'someOtherField'),
            ).not.toThrow();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
            inputField.remove();
        });
    });

    describe('handleChangeInput - regular key press', () => {
        it('should insert the pressed key value at the cursor position for inputPinField', () => {
            const inputField = createInputField('inputPinField', '12', 2, 2);
            component.handleChangeInput(
                { target: { id: 'numKey', innerText: '3' } } as unknown as Event,
                'inputPinField',
            );
            expect(inputField.value).toBe('123');
            expect(component.pinValue).toBe('123');
        });

        it('should replace a selection with the pressed key value for inputStaffIdField', () => {
            const inputField = createInputField('inputStaffIdField', '1234', 1, 3);
            component.handleChangeInput(
                { target: { id: 'numKey', innerText: '9' } } as unknown as Event,
                'inputStaffIdField',
            );
            expect(inputField.value).toBe('194');
            expect(component.staffIdValue).toBe('194');
        });

        it('should insert the pressed key value for inputDutyField and trim whitespace from innerText', () => {
            const inputField = createInputField('inputDutyField', '12', 2, 2);
            component.handleChangeInput(
                { target: { id: 'numKey', innerText: ' 3 ' } } as unknown as Event,
                'inputDutyField',
            );
            expect(inputField.value).toBe('123');
            expect(component.dutyValue).toBe('123');
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
        it('should clear timers, complete destroy$, and dispatch updateManualLogin', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            expect(() => component.ngOnDestroy()).not.toThrow();
            expect(dispatchSpy).toHaveBeenCalledWith(jasmine.objectContaining({ payload: {} }));
        });
    });
});
