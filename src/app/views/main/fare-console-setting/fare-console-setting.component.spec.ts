import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareConsoleSettingComponent } from './fare-console-setting.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';

import { CommonModule, DatePipe } from '@angular/common';

import { BehaviorSubject, of } from 'rxjs';
import { MockStore } from '@ngrx/store/testing';
import { fareConsole, cmBusIdInformation } from '@store/main/main.reducer';
import { MsgID, ResponseStatus } from '@models';

describe('FareConsoleSettingComponent', () => {
    let component: FareConsoleSettingComponent;
    let fixture: ComponentFixture<FareConsoleSettingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CommonModule, FareConsoleSettingComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                DatePipe,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(FareConsoleSettingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    it('should handle change setting', () => {
        const spy = spyOn(component, 'selectChangeDeckType');
        component.handleChangeSetting('deckType');
        expect(component.settingType).toBe('deckType');
        expect(spy).toHaveBeenCalled();
    });

    it('should change deck type', () => {
        component.handleChangeDeckType(2);
        expect(component.selectedDeckTypeId).toBe(2);
    });

    it('should handle confirm deck type', () => {
        const store = TestBed.inject(Store);
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const storeSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };
        component.fareConsoleSetting = { deckTypeList: [{ id: 1, label: 'test' }] } as any;
        component.selectedDeckTypeId = 1;

        component.handleConfirmDeckType(true);
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
    });

    it('should handle change bls status', () => {
        component.handleChangeBlsStatus(1);
        expect(component.selectedBlsStatus).toBe(1);
        expect(component.blsStep).toBe(2);
    });

    it('should handle confirm bls status', () => {
        const store = TestBed.inject(Store);
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const storeSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };

        component.handleConfirmBlsStatus(true);
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(storeSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
        expect(component.blsStep).toBe(1);
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

describe('FareConsoleSettingComponent - extended coverage', () => {
    let component: FareConsoleSettingComponent;
    let fixture: ComponentFixture<FareConsoleSettingComponent>;
    let store: MockStore;
    let mockMqttService: MockMqttService;

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

    function createDateInput(id: string, value: string, tabIndex: number): HTMLInputElement {
        const input = createTextInput(id, value);
        input.tabIndex = tabIndex;
        return input;
    }

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CommonModule, FareConsoleSettingComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                DatePipe,
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FareConsoleSettingComponent);
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

    // ---------------- ngOnInit / fareConsole$ ----------------

    it('sets selectedDeckTypeId from deckType id, defaults to 0 when absent', () => {
        store.overrideSelector(fareConsole, {
            deckType: { id: 5, label: 'Upper' },
            busId: '',
            complimentaryDays: 0,
            message: '',
        });
        store.refreshState();
        expect(component.selectedDeckTypeId).toBe(5);

        store.overrideSelector(fareConsole, {
            deckType: undefined as any,
            busId: '',
            complimentaryDays: 0,
            message: '',
        });
        store.refreshState();
        expect(component.selectedDeckTypeId).toBe(0);
    });

    it('sets settingType to deckType when msgID is DECK_TYPE_LIST and settingType empty', () => {
        component.settingType = '';
        store.overrideSelector(fareConsole, {
            deckType: { id: 0, label: '' },
            busId: '',
            complimentaryDays: 0,
            message: '',
            msgID: MsgID.DECK_TYPE_LIST,
        });
        store.refreshState();
        expect(component.settingType).toBe('deckType');
    });

    it('does not change settingType when already set', () => {
        component.settingType = 'busId';
        store.overrideSelector(fareConsole, {
            deckType: { id: 0, label: '' },
            busId: '',
            complimentaryDays: 0,
            message: '',
            msgID: MsgID.DECK_TYPE_LIST,
        });
        store.refreshState();
        expect(component.settingType).toBe('busId');
    });

    it('does not set settingType when msgID differs from DECK_TYPE_LIST', () => {
        component.settingType = '';
        store.overrideSelector(fareConsole, {
            deckType: { id: 0, label: '' },
            busId: '',
            complimentaryDays: 0,
            message: '',
            msgID: MsgID.FARE_CONSOLE,
        });
        store.refreshState();
        expect(component.settingType).toBe('');
    });

    it('switches to deleteParameter screen when msgID matches DELETE_PARAMETER', () => {
        component.settingType = '';
        store.overrideSelector(fareConsole, {
            deckType: { id: 0, label: '' },
            busId: '',
            complimentaryDays: 0,
            message: '',
            msgID: MsgID.DELETE_PARAMETER,
        });
        store.refreshState();
        expect(component.settingType).toBe('deleteParameter');
    });

    // ---------------- ngOnInit / busIdInformation$ ----------------

    it('sets operatorIdTemp from operator id, defaults to null when absent', () => {
        store.overrideSelector(cmBusIdInformation, {
            busId: 'A1',
            operator: { id: 7, label: 'Op', serviceProvider: 1 },
            operators: [],
        });
        store.refreshState();
        expect(component.operatorIdTemp).toBe(7);

        store.overrideSelector(cmBusIdInformation, {
            busId: 'A1',
            operator: undefined,
            operators: [],
        });
        store.refreshState();
        expect(component.operatorIdTemp).toBeNull();
    });

    it('sets settingType to busId and busIdStep to 3 for COMMISSION_OPERATOR msgID', () => {
        component.settingType = '';
        component.fareConsoleSetting = { ...component.fareConsoleSetting, msgID: undefined };
        store.overrideSelector(cmBusIdInformation, {
            busId: 'A1',
            operators: [],
            msgID: MsgID.COMMISSION_OPERATOR,
        });
        store.refreshState();
        expect(component.settingType).toBe('busId');
        expect(component.busIdStep).toBe(3);
    });

    it('sets settingType to busId without changing busIdStep for other msgIDs', () => {
        component.settingType = '';
        component.busIdStep = 1;
        component.fareConsoleSetting = { ...component.fareConsoleSetting, msgID: undefined };
        store.overrideSelector(cmBusIdInformation, {
            busId: 'A1',
            operators: [],
            msgID: MsgID.COMMISSION_BUS_ID,
        });
        store.refreshState();
        expect(component.settingType).toBe('busId');
        expect(component.busIdStep).toBe(1);
    });

    it('does not change settingType when fareConsoleSetting already has a msgID', () => {
        component.settingType = '';
        component.fareConsoleSetting = { ...component.fareConsoleSetting, msgID: MsgID.FARE_CONSOLE };
        store.overrideSelector(cmBusIdInformation, {
            busId: 'A1',
            operators: [],
            msgID: MsgID.COMMISSION_OPERATOR,
        });
        store.refreshState();
        expect(component.settingType).toBe('');
    });

    it('does not change settingType when data.msgID is falsy', () => {
        component.settingType = '';
        store.overrideSelector(cmBusIdInformation, {
            busId: 'A1',
            operators: [],
        });
        store.refreshState();
        expect(component.settingType).toBe('');
    });

    it('dispatches updates and returns to fare console on commission bus id submit success', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.fareConsoleSetting = { ...component.fareConsoleSetting, busId: '' };
        store.overrideSelector(cmBusIdInformation, {
            busId: 'SBS1234',
            operators: [],
            msgID: MsgID.COMMISSION_BUS_ID_SUBMIT,
            status: ResponseStatus.SUCCESS,
        });
        store.refreshState();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('does not dispatch bus id submit updates when status is not success', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        store.overrideSelector(cmBusIdInformation, {
            busId: 'SBS1234',
            operators: [],
            msgID: MsgID.COMMISSION_BUS_ID_SUBMIT,
            status: ResponseStatus.ERROR,
        });
        store.refreshState();
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    // ---------------- handleChangeSetting ----------------

    it('handleChangeSetting is a no-op for unmatched setting types', () => {
        component.handleChangeSetting('unknownType');
        expect(component.settingType).toBe('unknownType');
    });

    // ---------------- selectChangeDeckType ----------------

    it('does not request deck type list when already loaded', () => {
        component.fareConsoleSetting = {
            ...component.fareConsoleSetting,
            deckTypeList: [{ id: 1, label: 'Upper' }],
        };
        component.selectChangeDeckType();
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    // ---------------- handleConfirmDeckType ----------------

    it('dispatches unchanged deckType when no match found on confirm', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };
        component.fareConsoleSetting = {
            ...component.fareConsoleSetting,
            deckTypeList: [{ id: 1, label: 'Upper' }],
        };
        component.selectedDeckTypeId = 99;
        component.handleConfirmDeckType(true);
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
    });

    it('resets selectedDeckTypeId on cancel using existing deckType id', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.fareConsoleSetting = { ...component.fareConsoleSetting, deckType: { id: 4, label: 'Lower' } };
        component.selectedDeckTypeId = 99;
        component.handleConfirmDeckType(false);
        expect(component.selectedDeckTypeId).toBe(4);
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
    });

    it('resets selectedDeckTypeId to 0 on cancel when no deckType id', () => {
        component.fareConsoleSetting = { ...component.fareConsoleSetting, deckType: undefined as any };
        component.selectedDeckTypeId = 99;
        component.handleConfirmDeckType(false);
        expect(component.selectedDeckTypeId).toBe(0);
    });

    // ---------------- handleConfirmBlsStatus ----------------

    it('does not publish or dispatch when bls status not confirmed', () => {
        component.blsStep = 2;
        component.handleConfirmBlsStatus(false);
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        expect(component.blsStep).toBe(1);
    });

    // ---------------- handleClickBack ----------------

    it('resets all setting state on handleClickBack', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.fareConsoleSetting = { ...component.fareConsoleSetting, deckType: { id: 2, label: 'Upper' } };
        component.selectedDeckTypeId = 99;
        component.blsStep = 2;
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '12';
        component.hasBusIdNumberError = true;
        component.busIdStep = 3;
        component.settingType = 'busId';

        component.handleClickBack();

        expect(component.selectedDeckTypeId).toBe(2);
        expect(component.blsStep).toBe(1);
        expect(component.busIdPrefix).toBe('');
        expect(component.busIdNumber).toBe('');
        expect(component.hasBusIdNumberError).toBeFalse();
        expect(component.busIdStep).toBe(1);
        expect(component.settingType).toBe('');
        expect(dispatchSpy).toHaveBeenCalled();
    });

    // ---------------- delete parameter ----------------

    it('publishes delete parameter request', () => {
        component.topics = { mainTab: { get: 'test' } };
        component.handleDeleteParameter();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('clears delete parameter state', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.settingType = 'deleteParameter';
        component.handleClearDeleteParameter();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
    });

    it('handleDeleteParameterByNotify does nothing when msgID does not match', () => {
        component.settingType = '';
        component.fareConsoleSetting = { ...component.fareConsoleSetting, msgID: MsgID.FARE_CONSOLE };
        component.handleDeleteParameterByNotify();
        expect(component.settingType).toBe('');
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

    // ---------------- selectChangeBusId ----------------

    it('publishes commission bus id request when busId present', () => {
        component.topics = { mainTab: { get: 'test' } };
        component.fareConsoleSetting = { ...component.fareConsoleSetting, busId: 'SBS1234' };
        component.selectChangeBusId();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('does not publish commission bus id request when busId empty', () => {
        component.fareConsoleSetting = { ...component.fareConsoleSetting, busId: '' };
        component.selectChangeBusId();
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    // ---------------- handleChangeStep ----------------

    it('requests operator list when moving to step 3 without operators', () => {
        component.topics = { mainTab: { get: 'test' } };
        component.busIdData = { busId: '', operators: [] };
        component.handleChangeStep(3);
        expect(component.busIdStep).toBe(3);
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('does not request operator list when operators already present', () => {
        component.busIdData = { busId: '', operators: [{ id: 1, serviceProvider: 1 }] };
        component.handleChangeStep(3);
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('does not request operator list for other steps', () => {
        component.handleChangeStep(2);
        expect(component.busIdStep).toBe(2);
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    // ---------------- bus id back / enter ----------------

    it('resets bus id step state on handleBusIdBack', () => {
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '12';
        component.hasBusIdNumberError = true;
        component.busIdStep = 3;
        component.handleBusIdBack();
        expect(component.busIdPrefix).toBe('');
        expect(component.busIdNumber).toBe('');
        expect(component.hasBusIdNumberError).toBeFalse();
        expect(component.busIdStep).toBe(1);
    });

    it('sets busIdNumber via handleEnterBusId', () => {
        component.handleEnterBusId('1234');
        expect(component.busIdNumber).toBe('1234');
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    // ---------------- handleChangeBusIdInput ----------------

    it('handles backspace on bus id input without selection', () => {
        const input = createTextInput('inputField', '123');
        input.setSelectionRange(3, 3);
        component.hasBusIdNumberError = true;
        component.handleChangeBusIdInput({ target: { id: 'backspaceKey' } } as any);
        expect(component.busIdNumber).toBe('12');
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    it('handles backspace on bus id input with selection', () => {
        const input = createTextInput('inputField', '12345');
        input.setSelectionRange(1, 3);
        component.hasBusIdNumberError = true;
        component.handleChangeBusIdInput({ target: { id: 'backspaceKey' } } as any);
        expect(component.busIdNumber).toBe('145');
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    it('hides keyboard and returns early on enter key with empty bus id value', () => {
        createTextInput('inputField', '');
        component.isShowKeyboard = true;
        const spy = spyOn(component, 'handleEnterBusId');
        component.handleChangeBusIdInput({ target: { id: 'enterKey' } } as any);
        expect(component.isShowKeyboard).toBeFalse();
        expect(spy).not.toHaveBeenCalled();
    });

    it('confirms bus id number on enter key', () => {
        createTextInput('inputField', '1234');
        component.handleChangeBusIdInput({ target: { id: 'enterKey' } } as any);
        expect(component.busIdNumber).toBe('1234');
    });

    it('types a digit into bus id input', () => {
        const input = createTextInput('inputField', '12');
        input.setSelectionRange(2, 2);
        component.hasBusIdNumberError = true;
        component.handleChangeBusIdInput({ target: { id: 'digit', innerText: '3' } } as any);
        expect(component.busIdNumber).toBe('123');
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    // ---------------- handleSubmitBusId ----------------

    it('returns early when busIdPrefix missing on submit', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdPrefix = '';
        component.handleSubmitBusId();
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('sets error when busIdNumber length invalid', () => {
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '';
        component.handleSubmitBusId();
        expect(component.hasBusIdNumberError).toBeTrue();

        component.hasBusIdNumberError = false;
        component.busIdNumber = '12345';
        component.handleSubmitBusId();
        expect(component.hasBusIdNumberError).toBeTrue();
    });

    it('submits valid bus id and resets fields', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdData = { busId: '', operators: [] };
        component.busIdPrefix = 'SBS';
        component.busIdNumber = '12';
        component.handleSubmitBusId();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.busIdStep).toBe(1);
        expect(component.busIdPrefix).toBe('');
        expect(component.busIdNumber).toBe('');
        expect(component.hasBusIdNumberError).toBeFalse();
    });

    // ---------------- operator handling ----------------

    it('sets operatorIdTemp via handleChangeOperator', () => {
        component.handleChangeOperator(3);
        expect(component.operatorIdTemp).toBe(3);
    });

    it('dispatches selected operator on confirm when found', () => {
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
        expect(component.busIdStep).toBe(1);
    });

    it('does not dispatch when operator not found on confirm', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdData = { busId: '', operators: [{ id: 1, serviceProvider: 1 }] };
        component.operatorIdTemp = 99;
        component.handleConfirmOperator();
        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(component.busIdStep).toBe(1);
    });

    it('resets operatorIdTemp on handleOperatorBack using existing operator id', () => {
        component.busIdData = { busId: '', operator: { id: 5, serviceProvider: 1 }, operators: [] };
        component.handleOperatorBack();
        expect(component.operatorIdTemp).toBe(5);
        expect(component.busIdStep).toBe(1);
    });

    it('resets operatorIdTemp to null on handleOperatorBack when no operator', () => {
        component.busIdData = { busId: '', operators: [] };
        component.handleOperatorBack();
        expect(component.operatorIdTemp).toBeNull();
    });

    it('resets busIdStep on handleSpidBack', () => {
        component.busIdStep = 3;
        component.handleSpidBack();
        expect(component.busIdStep).toBe(1);
    });

    // ---------------- handleConfirmSPID / handleChangeInput ----------------

    it('handleConfirmSPID does nothing for empty value', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        (component as any).handleConfirmSPID('');
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('handleConfirmSPID dispatches updated operator service provider', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdData = { busId: '', operator: { id: 1, serviceProvider: 1 }, operators: [] };
        (component as any).handleConfirmSPID('9');
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.busIdStep).toBe(1);
    });

    it('handles backspace on generic input when no selection', () => {
        const input = createTextInput('inputField', '123');
        input.setSelectionRange(3, 3);
        component.hasInputError = true;
        component.handleChangeInput({ target: { id: 'backspaceKey' } } as any, 'complimentaryDays');
        expect(input.value).toBe('12');
        expect(component.hasInputError).toBeFalse();
    });

    it('handles backspace on generic input with selection', () => {
        const input = createTextInput('inputField', '12345');
        input.setSelectionRange(1, 3);
        component.hasInputError = true;
        component.handleChangeInput({ target: { id: 'backspaceKey' } } as any, 'complimentaryDays');
        expect(input.value).toBe('145');
        expect(component.hasInputError).toBeFalse();
    });

    it('does nothing on enter key when generic input value is empty', () => {
        createTextInput('inputField', '');
        const spy = spyOn(component as any, 'handleConfirmComplimentaryDays');
        component.handleChangeInput({ target: { id: 'enterKey' } } as any, 'complimentaryDays');
        expect(spy).not.toHaveBeenCalled();
    });

    it('confirms spid on enter key when type is spid', () => {
        createTextInput('inputField', '5');
        const spy = spyOn(component as any, 'handleConfirmSPID');
        component.handleChangeInput({ target: { id: 'enterKey' } } as any, 'spid');
        expect(spy).toHaveBeenCalledWith('5');
    });

    it('confirms complimentary days on enter key for other types', () => {
        createTextInput('inputField', '5');
        const spy = spyOn(component as any, 'handleConfirmComplimentaryDays');
        component.handleChangeInput({ target: { id: 'enterKey' } } as any, 'complimentaryDays');
        expect(spy).toHaveBeenCalledWith('5');
    });

    it('types a character into generic input', () => {
        const input = createTextInput('inputField', '12');
        input.setSelectionRange(2, 2);
        component.hasInputError = true;
        component.handleChangeInput({ target: { id: 'digit', innerText: '3' } } as any, 'complimentaryDays');
        expect(input.value).toBe('123');
        expect(component.hasInputError).toBeFalse();
    });

    it('handleConfirmComplimentaryDays sets error for non-numeric value', () => {
        (component as any).handleConfirmComplimentaryDays('abc');
        expect(component.hasInputError).toBeTrue();
    });

    it('handleConfirmComplimentaryDays sets error when exceeding maximum', () => {
        component.fareConsoleSetting = { ...component.fareConsoleSetting, maximumcomplimentaryDays: 5 };
        (component as any).handleConfirmComplimentaryDays('10');
        expect(component.hasInputError).toBeTrue();
    });

    it('handleConfirmComplimentaryDays submits valid value', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };
        component.fareConsoleSetting = { ...component.fareConsoleSetting, maximumcomplimentaryDays: 5 };
        (component as any).handleConfirmComplimentaryDays('3');
        expect(component.hasInputError).toBeFalse();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
    });

    // ---------------- handleSubmitForm / cancel / retry ----------------

    it('publishes and dispatches on handleSubmitForm', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };
        component.busIdData = { busId: 'SBS1234', operator: { id: 1, serviceProvider: 2 }, operators: [] };
        component.handleSubmitForm();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
        expect(component.busIdStep).toBe(1);
    });

    it('clears bus id data and navigates back on cancel', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.handleCancelSubmitBusId();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
    });

    it('resets retry state on handleRetrySetBusId', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.busIdStep = 3;
        component.handleRetrySetBusId();
        expect(component.busIdStep).toBe(1);
        expect(dispatchSpy).toHaveBeenCalled();
    });

    // ---------------- validateFareConsoleForm / handleConfirmFareConsole ----------------

    it('validates fare console form as valid when all fields present', () => {
        component.fareConsoleSetting = {
            deckType: { id: 1, label: 'Upper' },
            busId: 'SBS1234',
            complimentaryDays: 2,
            serviceProvider: 1,
            message: '',
        };
        expect(component.validateFareConsoleForm()).toBeTrue();
        expect(component.missingFields.length).toBe(0);
    });

    it('validates fare console form as invalid when fields missing', () => {
        component.fareConsoleSetting = {
            deckType: { id: 0, label: '' },
            busId: '',
            complimentaryDays: 0,
            serviceProvider: undefined,
            message: '',
        };
        expect(component.validateFareConsoleForm()).toBeFalse();
        expect(component.missingFields.length).toBeGreaterThan(0);
    });

    it('does nothing when fare console confirm is false', () => {
        component.handleConfirmFareConsole(false);
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('sets hasSubmitError when form invalid on confirm', () => {
        component.fareConsoleSetting = {
            deckType: { id: 0, label: '' },
            busId: '',
            complimentaryDays: 0,
            message: '',
        };
        component.handleConfirmFareConsole(true);
        expect(component.hasSubmitError).toBeTrue();
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('publishes fare console submit when form valid', () => {
        component.topics = { mainTab: { get: 'test' } };
        component.fareConsoleSetting = {
            deckType: { id: 1, label: 'Upper' },
            busId: 'SBS1234',
            complimentaryDays: 2,
            serviceProvider: 1,
            message: '',
        };
        component.handleConfirmFareConsole(true);
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('resets submit error and highlights missing fields on back to configuration', () => {
        component.hasSubmitError = true;
        component.highlightMissingFields = false;
        component.handleBackToConfiguration();
        expect(component.hasSubmitError).toBeFalse();
        expect(component.highlightMissingFields).toBeTrue();
    });

    // ---------------- sound / destroy ----------------

    it('plays button sound', () => {
        const soundService = (component as any).soundService;
        spyOn(soundService, 'playButton');
        component.handleButtonSound();
        expect(soundService.playButton).toHaveBeenCalled();
    });

    it('completes destroy subject on ngOnDestroy', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });

    // ---------------- handleChangeDateTime ----------------

    it('handleChangeDateTime returns early when dateTimeInputType is empty', () => {
        component.dateTimeInputType = '' as any;
        expect(() => component.handleChangeDateTime({ target: { id: 'anything' } } as any)).not.toThrow();
    });

    it('handles backspace with cursor (no selection) on day field, clearing date error message', () => {
        const day = createDateInput('day', '15', 3);
        day.setSelectionRange(2, 2);
        component.dateTimeInputType = 'day';
        component.dateTimeErrorMessage = 'INVALID_ENTRY';
        component.handleChangeDateTime({ target: { id: 'backspaceKey' } } as any);
        expect(day.value).toBe('1');
        expect(component.dateTimeErrorMessage).toBe('');
    });

    it('handles backspace with selection on hour field, clearing time input error', () => {
        const hour = createDateInput('hour', '12', 4);
        // start must be > 0 for the component's selection-delete branch to run
        hour.setSelectionRange(1, 2);
        component.dateTimeInputType = 'hour';
        component.hasTimeInputError = true;
        component.handleChangeDateTime({ target: { id: 'backspaceKey' } } as any);
        expect(hour.value).toBe('1');
        expect(component.hasTimeInputError).toBeFalse();
    });

    it('skips deletion when backspace pressed at start of field, but still attempts autofocus', () => {
        const minute = createDateInput('minute', '30', 5);
        minute.setSelectionRange(0, 0);
        component.dateTimeInputType = 'minute';
        component.hasTimeInputError = true;
        component.handleChangeDateTime({ target: { id: 'backspaceKey' } } as any);
        expect(minute.value).toBe('30');
        expect(component.hasTimeInputError).toBeTrue();
    });

    it('calls handleConfirmDate on enter key', () => {
        createDateInput('day', '15', 3);
        component.dateTimeInputType = 'day';
        const spy = spyOn(component as any, 'handleConfirmDate');
        component.handleChangeDateTime({ target: { id: 'enterKey' } } as any);
        expect(spy).toHaveBeenCalled();
    });

    it('ignores extra digits and refocuses when year field is already full', () => {
        const year = createDateInput('year', '2024', 1);
        createDateInput('month', '', 2);
        component.dateTimeInputType = 'year';
        component.handleChangeDateTime({ target: { id: 'digit', innerText: '9' } } as any);
        expect(year.value).toBe('2024');
        expect(component.dateTimeInputType).toBe('month');
    });

    it('types first digit into month field without advancing focus', () => {
        const month = createDateInput('month', '', 2);
        month.setSelectionRange(0, 0);
        component.dateTimeInputType = 'month';
        component.dateTimeErrorMessage = 'INVALID_ENTRY';
        component.handleChangeDateTime({ target: { id: 'digit', innerText: '1' } } as any);
        expect(month.value).toBe('1');
        expect(component.dateTimeErrorMessage).toBe('');
        expect(component.dateTimeInputType).toBe('month');
    });

    it('clamps month value above 12 and advances to next field', () => {
        const month = createDateInput('month', '1', 2);
        createDateInput('day', '', 3);
        month.setSelectionRange(1, 1);
        component.dateTimeInputType = 'month';
        component.handleChangeDateTime({ target: { id: 'digit', innerText: '9' } } as any);
        expect(month.value).toBe('12');
        expect(component.dateValue.month).toBe('12');
        expect(component.dateTimeInputType).toBe('day');
    });

    it('sets hour value without clamping when within range and clears time error', () => {
        const hour = createDateInput('hour', '0', 4);
        hour.setSelectionRange(1, 1);
        component.dateTimeInputType = 'hour';
        component.hasTimeInputError = true;
        component.handleChangeDateTime({ target: { id: 'digit', innerText: '5' } } as any);
        expect(hour.value).toBe('05');
        expect(component.hasTimeInputError).toBeFalse();
    });

    // ---------------- setValueForDateElement (private) ----------------

    it('setValueForDateElement clamps and passes through values for each field type', () => {
        const dt = component as any;
        dt.dateTimeInputType = 'month';
        expect(dt.setValueForDateElement('13')).toBe('12');
        expect(dt.setValueForDateElement('7')).toBe('7');

        dt.dateTimeInputType = 'day';
        expect(dt.setValueForDateElement('35')).toBe('31');
        expect(dt.setValueForDateElement('20')).toBe('20');

        dt.dateTimeInputType = 'hour';
        expect(dt.setValueForDateElement('25')).toBe('23');
        expect(dt.setValueForDateElement('10')).toBe('10');

        dt.dateTimeInputType = 'minute';
        expect(dt.setValueForDateElement('65')).toBe('59');
        expect(dt.setValueForDateElement('40')).toBe('40');

        dt.dateTimeInputType = 'second';
        expect(dt.setValueForDateElement('65')).toBe('59');
        expect(dt.setValueForDateElement('40')).toBe('40');

        dt.dateTimeInputType = 'year';
        expect(dt.setValueForDateElement('2024')).toBe('2024');

        dt.dateTimeInputType = '';
        expect(dt.setValueForDateElement('123')).toBe('');
    });

    // ---------------- autoFocusOnInput (private) ----------------

    it('autoFocusOnInput does nothing when no adjacent field exists', () => {
        const lone = createDateInput('second', '55', 6);
        const before = component.dateTimeInputType;
        (component as any).autoFocusOnInput(lone, '55', false, false);
        expect(component.dateTimeInputType).toBe(before);
    });

    // ---------------- handleConfirmDate (private) ----------------

    it('sets INVALID_ENTRY when date parts missing', () => {
        component.dateValue = { year: '', month: '', day: '', hour: '10', minute: '30', second: '00' };
        (component as any).handleConfirmDate();
        expect(component.dateTimeErrorMessage).toBe('INVALID_ENTRY');
    });

    it('sets time input error when time parts missing', () => {
        component.dateValue = { year: '2025', month: '06', day: '15', hour: '', minute: '', second: '' };
        (component as any).handleConfirmDate();
        expect(component.hasTimeInputError).toBeTrue();
    });

    it('sets INVALID_ENTRY for an impossible calendar date', () => {
        component.dateValue = { year: '2023', month: '02', day: '30', hour: '10', minute: '00', second: '00' };
        (component as any).handleConfirmDate();
        expect(component.dateTimeErrorMessage).toBe('INVALID_ENTRY');
    });

    it('sets a translated min-date error when date is earlier than minDateTime', () => {
        component.fareConsoleSetting = {
            ...component.fareConsoleSetting,
            minDateTime: '2030-01-01T00:00:00+08:00',
        };
        component.dateValue = { year: '2025', month: '06', day: '15', hour: '10', minute: '00', second: '00' };
        (component as any).handleConfirmDate();
        expect(component.dateTimeErrorMessage).toBeTruthy();
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('submits date and resets state when date is valid', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };
        component.fareConsoleSetting = { ...component.fareConsoleSetting, minDateTime: undefined };
        component.dateValue = { year: '2025', month: '06', day: '15', hour: '10', minute: '00', second: '00' };
        (component as any).handleConfirmDate();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
        expect(component.dateTimeInputType).toBe('day');
    });

    it('submitDate does nothing when date is null', () => {
        (component as any).submitDate(null);
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('resetDateTimeSetting resets date state', () => {
        component.dateTimeInputType = 'hour';
        component.hasTimeInputError = true;
        component.dateTimeErrorMessage = 'err';
        component.dateValue = { year: '1', month: '2', day: '3', hour: '4', minute: '5', second: '6' };
        (component as any).resetDateTimeSetting();
        expect(component.dateTimeInputType).toBe('day');
        expect(component.hasTimeInputError).toBeFalse();
        expect(component.dateTimeErrorMessage).toBe('');
        expect(component.dateValue).toEqual({ year: '', month: '', day: '', hour: '', minute: '', second: '' });
    });
});
