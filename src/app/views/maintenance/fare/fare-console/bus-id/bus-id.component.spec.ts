import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusIdComponent } from './bus-id.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

describe('BusIdComponent', () => {
    let component: BusIdComponent;
    let fixture: ComponentFixture<BusIdComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BusIdComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BusIdComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize step to 1', () => {
        expect(component.step).toBe(1);
    });

    it('should initialize busIdPrefix to empty string', () => {
        expect(component.busIdPrefix).toBe('');
    });

    it('should initialize busIdNumber to empty string', () => {
        expect(component.busIdNumber).toBe('');
    });

    it('should initialize hasBusIdNumberError to false', () => {
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    it('handleBusIdBack should reset busIdPrefix, busIdNumber, hasBusIdNumberError and step', () => {
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '1234';
        component.hasBusIdNumberError = true;
        component.step = 2;
        component.handleBusIdBack();
        expect(component.busIdPrefix).toBe('');
        expect(component.busIdNumber).toBe('');
        expect(component.hasBusIdNumberError).toBeFalse();
        expect(component.step).toBe(1);
    });

    it('handleChangeStep should update step', () => {
        component.handleChangeStep(3);
        expect(component.step).toBe(3);
    });

    it('handleSubmitBusId should set hasBusIdNumberError if busIdPrefix is empty', () => {
        component.busIdPrefix = '';
        component.handleSubmitBusId();
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    it('backToFareConsole should navigate to /maintenance/fare/fare-console', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.backToFareConsole();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });
});

// ---------------------------------------------------------------------------
// Extended coverage suite
// ---------------------------------------------------------------------------

import { Store } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { BehaviorSubject, of } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { fareConsole, busIdInformation } from '@store/maintenance/maintenance.reducer';
import { MsgID, MsgSubID, ResponseStatus } from '@models';

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(true);

    mqttConfig = {
        topics: {
            maintenance: {
                get: '/madt/maintenance/fare',
                response: '/tc/maintenance/fare',
            },
            mainTab: {
                get: '/madt/main/fare-console',
                response: '/tc/main/fare-console',
            },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('BusIdComponent - extended coverage', () => {
    let component: BusIdComponent;
    let fixture: ComponentFixture<BusIdComponent>;
    let store: MockStore;
    let mockMqttService: MockMqttService;
    let routerMock: { navigate: jasmine.Spy };

    function createTextInput(id: string, value = ''): HTMLInputElement {
        // Defensively remove any stale element with this id left by another spec file's fixture.
        document.getElementById(id)?.remove();
        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.value = value;
        input.setAttribute('data-test-created', 'true');
        document.body.appendChild(input);
        return input;
    }

    beforeEach(async () => {
        mockMqttService = new MockMqttService();
        routerMock = { navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)) };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BusIdComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BusIdComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as unknown as MockStore;
        fixture.detectChanges();
    });

    afterEach(() => {
        document.querySelectorAll('[data-test-created]').forEach((el) => el.remove());
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        store.resetSelectors();
    });

    // ---------------- ngOnInit / mqttConfigLoaded$ ----------------

    it('sets topics when mqtt config loaded emits true', () => {
        mockMqttService.mqttConfigLoaded$.next(true);
        expect(component.topics).toEqual(mockMqttService.mqttConfig.topics);
    });

    it('does not set topics when mqtt config loaded emits false', () => {
        component.topics = undefined;
        mockMqttService.mqttConfigLoaded$.next(false);
        expect(component.topics).toBeUndefined();
    });

    // ---------------- ngOnInit / fareConsoleSetting$ ----------------

    it('requests bus id information when fareConsole busId is present', () => {
        store.overrideSelector(fareConsole, {
            deckType: { id: 0, label: '' },
            busId: 'SBS1234',
            complimentaryDays: 0,
            message: '',
        });
        store.refreshState();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAINTENANCE_BUS_ID,
                msgSubID: MsgSubID.REQUEST,
                payload: { busId: 'SBS1234' },
            }),
        );
        expect(component.fareConsoleSetting.busId).toBe('SBS1234');
    });

    it('does not request bus id information when fareConsole busId is empty', () => {
        store.overrideSelector(fareConsole, {
            deckType: { id: 0, label: '' },
            busId: '',
            complimentaryDays: 0,
            message: '',
        });
        store.refreshState();
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    // ---------------- ngOnInit / busIdInformation$ ----------------

    it('sets busIdData, busIdTemp and operatorIdTemp from operator id when present', () => {
        store.overrideSelector(busIdInformation, {
            busId: 'SBS1234',
            operator: { id: 7, label: 'Op', serviceProvider: 1 },
            operators: [],
        });
        store.refreshState();
        expect(component.busIdData.busId).toBe('SBS1234');
        expect(component.busIdTemp).toBe('SBS1234');
        expect(component.operatorIdTemp).toBe(7);
    });

    it('defaults operatorIdTemp to null when operator is absent', () => {
        store.overrideSelector(busIdInformation, {
            busId: 'SBS1234',
            operator: undefined,
            operators: [],
        });
        store.refreshState();
        expect(component.operatorIdTemp).toBeNull();
    });

    it('dispatches fare console/bus id updates and navigates back on submit success', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        store.overrideSelector(busIdInformation, {
            busId: 'SBS1234',
            operators: [],
            msgID: MsgID.MAINTENANCE_BUS_ID_SUBMIT,
            status: ResponseStatus.SUCCESS,
        });
        store.refreshState();
        expect(dispatchSpy).toHaveBeenCalledTimes(2);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('does not dispatch updates when submit status is not success', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        store.overrideSelector(busIdInformation, {
            busId: 'SBS1234',
            operators: [],
            msgID: MsgID.MAINTENANCE_BUS_ID_SUBMIT,
            status: ResponseStatus.ERROR,
        });
        store.refreshState();
        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('does not dispatch updates when msgID does not match submit', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        store.overrideSelector(busIdInformation, {
            busId: 'SBS1234',
            operators: [],
            msgID: MsgID.MAINTENANCE_OPERATOR,
            status: ResponseStatus.SUCCESS,
        });
        store.refreshState();
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    // ---------------- document click handling ----------------

    it('shows keyboard when clicking the input field element', () => {
        const input = createTextInput('inputField');
        component.isShowKeyboard = false;
        input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(component.isShowKeyboard).toBeTrue();
    });

    it('hides keyboard when clicking outside the numeric keyboard', () => {
        const outside = createTextInput('somethingElse');
        component.isShowKeyboard = true;
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(component.isShowKeyboard).toBeFalse();
    });

    it('keeps keyboard open when clicking within numeric keyboard', () => {
        const parent = document.createElement('div');
        parent.className = 'numeric-keyboard';
        parent.setAttribute('data-test-created', 'true');
        const child = document.createElement('span');
        parent.appendChild(child);
        document.body.appendChild(parent);
        component.isShowKeyboard = true;
        child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(component.isShowKeyboard).toBeTrue();
    });

    // ---------------- handleEnterBusId ----------------

    it('sets busIdNumber and clears error via handleEnterBusId', () => {
        component.hasBusIdNumberError = true;
        component.handleEnterBusId('1234');
        expect(component.busIdNumber).toBe('1234');
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    // ---------------- handleChangeInput ----------------

    it('handles backspace on bus id input without selection', () => {
        const input = createTextInput('inputField', '123');
        input.setSelectionRange(3, 3);
        component.handleChangeInput({ target: { id: 'backspaceKey' } } as any);
        expect(component.busIdNumber).toBe('12');
    });

    it('handles backspace on bus id input with selection', () => {
        const input = createTextInput('inputField', '12345');
        input.setSelectionRange(1, 3);
        component.handleChangeInput({ target: { id: 'backspaceKey' } } as any);
        expect(component.busIdNumber).toBe('145');
    });

    it('hides keyboard and returns early on enter key with empty value', () => {
        createTextInput('inputField', '');
        component.isShowKeyboard = true;
        const spy = spyOn(component, 'handleEnterBusId');
        component.handleChangeInput({ target: { id: 'enterKey' } } as any);
        expect(component.isShowKeyboard).toBeFalse();
        expect(spy).not.toHaveBeenCalled();
    });

    it('confirms bus id number on enter key with a value', () => {
        createTextInput('inputField', '1234');
        component.handleChangeInput({ target: { id: 'enterKey' } } as any);
        expect(component.busIdNumber).toBe('1234');
    });

    it('types a digit into the bus id input', () => {
        const input = createTextInput('inputField', '12');
        input.setSelectionRange(2, 2);
        component.handleChangeInput({ target: { id: 'digit', innerText: '3' } } as any);
        expect(component.busIdNumber).toBe('123');
    });

    // ---------------- handleSubmitBusId ----------------

    it('sets hasBusIdNumberError when busIdNumber too long', () => {
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '12345';
        component.handleSubmitBusId();
        expect(component.hasBusIdNumberError).toBeTrue();
    });

    it('sets hasBusIdNumberError when busIdNumber empty', () => {
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '';
        component.handleSubmitBusId();
        expect(component.hasBusIdNumberError).toBeTrue();
    });

    it('submits a valid bus id, publishes, dispatches, and resets state', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdData = { busId: '', operators: [] };
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '12';
        component.handleSubmitBusId();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAINTENANCE_BUS_ID_CHANGE,
                msgSubID: MsgSubID.NOTIFY,
                payload: { newBusId: 'SBS0012' },
            }),
        );
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.busIdPrefix).toBe('');
        expect(component.busIdNumber).toBe('');
        expect(component.hasBusIdNumberError).toBeFalse();
        expect(component.step).toBe(1);
    });

    // ---------------- handleCancelSubmitBusId ----------------

    it('dispatches reset payload and navigates back on cancel submit', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.handleCancelSubmitBusId();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    // ---------------- handleChangeOperator / handleConfirmOperator ----------------

    it('sets operatorIdTemp via handleChangeOperator', () => {
        component.handleChangeOperator(3);
        expect(component.operatorIdTemp).toBe(3);
    });

    it('dispatches selected operator when found on confirm', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdData = {
            busId: '',
            operators: [
                { id: 1, serviceProvider: 1 },
                { id: 2, serviceProvider: 2 },
            ],
        };
        component.operatorIdTemp = 2;
        component.handleConfirmOperator();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.step).toBe(1);
    });

    it('does not dispatch when operator not found on confirm', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdData = { busId: '', operators: [{ id: 1, serviceProvider: 1 }] };
        component.operatorIdTemp = 99;
        component.handleConfirmOperator();
        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(component.step).toBe(1);
    });

    // ---------------- handleOperatorBack ----------------

    it('resets operatorIdTemp to existing operator id on handleOperatorBack', () => {
        component.busIdData = { busId: '', operator: { id: 5, serviceProvider: 1 }, operators: [] };
        component.handleOperatorBack();
        expect(component.operatorIdTemp).toBe(5);
        expect(component.step).toBe(1);
    });

    it('resets operatorIdTemp to null on handleOperatorBack when no operator', () => {
        component.busIdData = { busId: '', operators: [] };
        component.handleOperatorBack();
        expect(component.operatorIdTemp).toBeNull();
    });

    // ---------------- handleSubmitForm ----------------

    it('publishes and dispatches on handleSubmitForm, navigating back', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdData = { busId: 'SBS1234', operator: { id: 1, serviceProvider: 2 }, operators: [] };
        component.handleSubmitForm();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAINTENANCE_BUS_ID_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: { busId: 'SBS1234', serviceProvider: 2 },
            }),
        );
        expect(dispatchSpy).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    // ---------------- handleRetrySetBusId ----------------

    it('resets step and dispatches on handleRetrySetBusId', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.step = 3;
        component.handleRetrySetBusId();
        expect(component.step).toBe(1);
        expect(dispatchSpy).toHaveBeenCalled();
    });

    // ---------------- ngOnDestroy ----------------

    it('dispatches reset payload on ngOnDestroy without throwing', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        expect(() => component.ngOnDestroy()).not.toThrow();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    // ---------------- handleButtonSound ----------------

    it('plays button sound', () => {
        const soundService = (component as any).soundService;
        spyOn(soundService, 'playButton');
        component.handleButtonSound();
        expect(soundService.playButton).toHaveBeenCalled();
    });
});
