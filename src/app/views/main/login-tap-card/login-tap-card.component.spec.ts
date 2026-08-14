import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginTapCardComponent } from './login-tap-card.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { BehaviorSubject, of } from 'rxjs';
import { tapCardLogin, outOfService } from '@store/main/main.reducer';
import { MsgID, MsgSubID, ResponseStatus, DEFAULT_TIMEOUT } from '@models';

// Mock MqttService following the pattern used in end-trip.component.spec.ts
class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(false);

    mqttConfig = {
        topics: {
            mainTab: {
                get: '/madt/main/tab',
            },
            tcToAllTabs: '/tc/all-tabs',
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('LoginTapCardComponent', () => {
    let component: LoginTapCardComponent;
    let fixture: ComponentFixture<LoginTapCardComponent>;
    let mockMqttService: MockMqttService;
    let store: MockStore;
    let localStorageWatch$: BehaviorSubject<string | null>;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();
        localStorageWatch$ = new BehaviorSubject<string | null>(null);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LoginTapCardComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginTapCardComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as unknown as MockStore;

        const localStorageService = TestBed.inject(LocalStorageService);
        spyOn(localStorageService, 'watch').and.returnValue(localStorageWatch$.asObservable());

        fixture.detectChanges();
    });

    afterEach(() => {
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        store.resetSelectors();
    });

    function createInputField(value: string, selectionStart: number, selectionEnd: number): HTMLInputElement {
        let inputField = document.getElementById('inputField') as HTMLInputElement;
        if (inputField) {
            inputField.remove();
        }
        inputField = document.createElement('input');
        inputField.id = 'inputField';
        document.body.appendChild(inputField);
        inputField.value = value;
        inputField.selectionStart = selectionStart;
        inputField.selectionEnd = selectionEnd;
        return inputField;
    }

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

    it('should navigate back to login with isMS true', () => {
        mockMqttService.publishWithMessageFormat.calls.reset();
        component.topics = { mainTab: { get: 'test-topic' } };
        component.backToLogin(true);
        const args = mockMqttService.publishWithMessageFormat.calls.mostRecent().args[0];
        expect(args.payload.msgID).toBe(MsgID.MS_TAP_CARD_PIN);
    });

    it('should handle change language', () => {
        const localStorageService = TestBed.inject(LocalStorageService) as any;
        component.topics = { mainTab: { get: 'test' }, tcToAllTabs: 'test2' };

        spyOn(localStorageService, 'setItem');

        component.handleChangeLanguage('CH');
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(localStorageService.setItem).toHaveBeenCalled();
    });

    describe('ngOnInit - signInTapCard$ subscription', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should set a timeout timer and publish TIMEOUT_MESSAGE when data.timeout > 0', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            store.overrideSelector(tapCardLogin, { msgID: MsgID.BC_TAP_CARD_LOGIN, timeout: 1000 });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(1001);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE, msgSubID: MsgSubID.NOTIFY }),
            );
        });

        it('should not set a timeout timer when data.timeout is 0/undefined', () => {
            store.overrideSelector(tapCardLogin, { msgID: MsgID.BC_TAP_CARD_LOGIN, timeout: 0 });
            store.refreshState();

            mockMqttService.publishWithMessageFormat.calls.reset();
            jasmine.clock().tick(DEFAULT_TIMEOUT + 1000);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIMEOUT_MESSAGE }),
            );
        });

        it('should navigate to /main/login after DEFAULT_TIMEOUT when BC_TAP_CARD_LOGIN errors', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            store.overrideSelector(tapCardLogin, {
                msgID: MsgID.BC_TAP_CARD_LOGIN,
                status: ResponseStatus.ERROR,
            });
            store.refreshState();

            jasmine.clock().tick(DEFAULT_TIMEOUT + 100);

            expect(router.navigate).toHaveBeenCalledWith(['/main/login']);
        });

        it('should navigate to /main/login after DEFAULT_TIMEOUT when MS_TAP_CARD_LOGIN errors', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            store.overrideSelector(tapCardLogin, {
                msgID: MsgID.MS_TAP_CARD_LOGIN,
                status: ResponseStatus.ERROR,
            });
            store.refreshState();

            jasmine.clock().tick(DEFAULT_TIMEOUT + 100);

            expect(router.navigate).toHaveBeenCalledWith(['/main/login']);
        });

        it('should not navigate when msgID matches but status is not ERROR', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            store.overrideSelector(tapCardLogin, {
                msgID: MsgID.BC_TAP_CARD_LOGIN,
                status: ResponseStatus.SUCCESS,
            });
            store.refreshState();

            jasmine.clock().tick(DEFAULT_TIMEOUT + 100);

            expect(router.navigate).not.toHaveBeenCalled();
        });

        it('should not navigate when status is ERROR but msgID does not match', () => {
            const router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            store.overrideSelector(tapCardLogin, {
                msgID: MsgID.BC_TAP_CARD_PIN,
                status: ResponseStatus.ERROR,
            });
            store.refreshState();

            jasmine.clock().tick(DEFAULT_TIMEOUT + 100);

            expect(router.navigate).not.toHaveBeenCalled();
        });

        it('should handle null/undefined emitted data gracefully', () => {
            store.overrideSelector(tapCardLogin, undefined as any);
            expect(() => store.refreshState()).not.toThrow();
            expect(component.signInTapCardData).toEqual({});
        });
    });

    describe('ngOnInit - localStorage LANGUAGE subscription', () => {
        it('should default currentLanguage to EN when value is falsy', () => {
            localStorageWatch$.next(null);
            expect(component.currentLanguage).toBe('EN');
        });

        it('should uppercase the language from localStorage when present', () => {
            localStorageWatch$.next(JSON.stringify('ch'));
            expect(component.currentLanguage).toBe('CH');
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
            const inputField = createInputField('1234', 2, 2);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'PIN');
            expect(inputField.value).toBe('134');
        });

        it('should delete the selected text when there is a selection', () => {
            const inputField = createInputField('1234', 1, 3);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'PIN');
            expect(inputField.value).toBe('14');
        });

        it('should clear pinError/dutyError and dispatch updateTapCardLogin via removeErrorMessage', () => {
            createInputField('1234', 2, 2);
            component.pinError = 'SOME_ERROR';
            component.dutyError = 'SOME_ERROR';
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'PIN');
            expect(component.pinError).toBe('');
            expect(component.dutyError).toBe('');
            expect(dispatchSpy).toHaveBeenCalled();
        });

        it('should clear message when status is ERROR in removeErrorMessage', () => {
            createInputField('1234', 2, 2);
            (component as any).signInTapCardData = {
                message: 'oops',
                status: ResponseStatus.ERROR,
                msgID: MsgID.BC_TAP_CARD_PIN,
            };
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'PIN');
            const dispatchedAction = dispatchSpy.calls.mostRecent().args[0] as any;
            expect(dispatchedAction.payload.message).toBeUndefined();
        });

        it('should keep message when status is not ERROR in removeErrorMessage', () => {
            createInputField('1234', 2, 2);
            (component as any).signInTapCardData = {
                message: 'kept',
                status: ResponseStatus.SUCCESS,
                msgID: MsgID.BC_TAP_CARD_PIN,
            };
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as unknown as Event, 'PIN');
            const dispatchedAction = dispatchSpy.calls.mostRecent().args[0] as any;
            expect(dispatchedAction.payload.message).toBe('kept');
        });
    });

    describe('handleChangeInput - enterKey', () => {
        it('should return early when the input value is empty', () => {
            createInputField('', 0, 0);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'PIN');
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should call submitPIN with isMS=false for type PIN', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('1234', 4, 4);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'PIN');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.BC_TAP_CARD_PIN, payload: { pin: '1234' } }),
            );
        });

        it('should call submitPIN with isMS=true for type PIN', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('5678', 4, 4);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'PIN', true);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MS_TAP_CARD_PIN, payload: { pin: '5678' } }),
            );
        });

        it('should call submitDutyNumber for non-PIN types when length <= 4', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('9999', 4, 4);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'dutyNumber');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.BC_TAP_CARD_DUTY, payload: { dutyNumber: '9999' } }),
            );
            expect(component.dutyError).toBe('');
        });

        it('should set dutyError and not publish when dutyNumber length > 4', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            createInputField('99999', 5, 5);
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleChangeInput({ target: { id: 'enterKey' } } as unknown as Event, 'dutyNumber');
            expect(component.dutyError).toBe('DUTY_MAX_LENGTH');
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });
    });

    describe('handleChangeInput - regular key press', () => {
        it('should insert the pressed key value at the cursor position', () => {
            const inputField = createInputField('12', 2, 2);
            component.handleChangeInput({ target: { id: 'numKey', innerText: '3' } } as unknown as Event, 'PIN');
            expect(inputField.value).toBe('123');
        });

        it('should replace a selection with the pressed key value', () => {
            const inputField = createInputField('1234', 1, 3);
            component.handleChangeInput({ target: { id: 'numKey', innerText: '9' } } as unknown as Event, 'PIN');
            expect(inputField.value).toBe('194');
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
        it('should clear timers, complete destroy$, and dispatch updateTapCardLogin', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            expect(() => component.ngOnDestroy()).not.toThrow();
            expect(dispatchSpy).toHaveBeenCalledWith(jasmine.objectContaining({ payload: {}, msgID: undefined }));
        });
    });
});
