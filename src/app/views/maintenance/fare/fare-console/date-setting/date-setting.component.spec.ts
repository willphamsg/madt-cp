import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateSettingComponent } from './date-setting.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

describe('DateSettingComponent', () => {
    let component: DateSettingComponent;
    let fixture: ComponentFixture<DateSettingComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DateSettingComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DateSettingComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize dateTimeErrorMessage to empty string', () => {
        expect(component.dateTimeErrorMessage).toBe('');
    });

    it('should initialize hasTimeInputError to false', () => {
        expect(component.hasTimeInputError).toBeFalse();
    });

    it('goBack should navigate to /maintenance/fare/fare-console', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });
});

// ---------------------------------------------------------------------------
// Extended coverage suite
// ---------------------------------------------------------------------------

import { CommonModule, DatePipe } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { MockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { fareConsole } from '@store/maintenance/maintenance.reducer';

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(true);

    mqttConfig = {
        topics: {
            maintenance: {
                get: '/madt/maintenance/fare',
                response: '/tc/maintenance/fare',
            },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('DateSettingComponent - extended coverage', () => {
    let component: DateSettingComponent;
    let fixture: ComponentFixture<DateSettingComponent>;
    let store: MockStore;
    let mockMqttService: MockMqttService;
    let router: Router;

    // The component template already renders real inputs with ids
    // year/month/day/hour/minute/second (see date-setting.component.html), and the
    // fixture is attached to the document, so document.getElementById(...) resolves
    // to these actual elements. Grab and reuse them instead of creating competing
    // duplicate-id elements (which would otherwise shadow/conflict with the real ones).
    function getInput(id: string): HTMLInputElement {
        return fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    }

    function setInputValue(
        id: string,
        value: string,
        selectionStart?: number,
        selectionEnd?: number,
    ): HTMLInputElement {
        const input = getInput(id);
        input.value = value;
        const start = selectionStart ?? value.length;
        const end = selectionEnd ?? start;
        input.setSelectionRange(start, end);
        return input;
    }

    beforeEach(async () => {
        mockMqttService = new MockMqttService();
        const routerMock = {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CommonModule, DateSettingComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mockMqttService },
                DatePipe,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DateSettingComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as unknown as MockStore;
        router = TestBed.inject(Router);
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

    it('updates fareConsoleSetting from the store selector', () => {
        store.overrideSelector(fareConsole, {
            deckType: { id: 1, label: 'Upper' },
            busId: 'SBS1234',
            complimentaryDays: 0,
            message: '',
        });
        store.refreshState();
        expect(component.fareConsoleSetting.busId).toBe('SBS1234');
    });

    // ---------------- handleButtonSound ----------------

    it('plays button sound', () => {
        const soundService = (component as any).soundService;
        spyOn(soundService, 'playButton');
        component.handleButtonSound();
        expect(soundService.playButton).toHaveBeenCalled();
    });

    // ---------------- ngOnDestroy ----------------

    it('completes destroy subject on ngOnDestroy', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });

    // ---------------- handleChangeInput ----------------

    it('returns early when dateTimeInputType is empty', () => {
        component.dateTimeInputType = '' as any;
        expect(() => component.handleChangeInput({ target: { id: 'anything' } } as any)).not.toThrow();
    });

    it('handles backspace with cursor (no selection) on day field, clearing date error message', () => {
        const day = setInputValue('day', '15', 2, 2);
        component.dateTimeInputType = 'day';
        component.dateTimeErrorMessage = 'INVALID_ENTRY';
        component.handleChangeInput({ target: { id: 'backspaceKey' } } as any);
        expect(day.value).toBe('1');
        expect(component.dateTimeErrorMessage).toBe('');
    });

    it('handles backspace with selection on hour field, clearing time input error', () => {
        // start must be > 0 for the component's selection-delete branch to run
        const hour = setInputValue('hour', '12', 1, 2);
        component.dateTimeInputType = 'hour';
        component.hasTimeInputError = true;
        component.handleChangeInput({ target: { id: 'backspaceKey' } } as any);
        expect(hour.value).toBe('1');
        expect(component.hasTimeInputError).toBeFalse();
    });

    it('skips deletion when backspace pressed at start of field, but still attempts autofocus', () => {
        const minute = setInputValue('minute', '30', 0, 0);
        component.dateTimeInputType = 'minute';
        component.hasTimeInputError = true;
        component.handleChangeInput({ target: { id: 'backspaceKey' } } as any);
        expect(minute.value).toBe('30');
        expect(component.hasTimeInputError).toBeTrue();
    });

    it('calls handleConfirmDate on enter key', () => {
        setInputValue('day', '15');
        component.dateTimeInputType = 'day';
        const spy = spyOn(component as any, 'handleConfirmDate');
        component.handleChangeInput({ target: { id: 'enterKey' } } as any);
        expect(spy).toHaveBeenCalled();
    });

    it('ignores extra digits and refocuses when year field is already full', () => {
        // Template tabindex order is day(1) / month(2) / year(3) / hour(4) / minute(5) / second(6),
        // so the field after year is hour.
        const year = setInputValue('year', '2024');
        setInputValue('hour', '');
        component.dateTimeInputType = 'year';
        component.handleChangeInput({ target: { id: 'digit', innerText: '9' } } as any);
        expect(year.value).toBe('2024');
        expect(component.dateTimeInputType).toBe('hour');
    });

    it('types first digit into month field without advancing focus', () => {
        const month = setInputValue('month', '', 0, 0);
        component.dateTimeInputType = 'month';
        component.dateTimeErrorMessage = 'INVALID_ENTRY';
        component.handleChangeInput({ target: { id: 'digit', innerText: '1' } } as any);
        expect(month.value).toBe('1');
        expect(component.dateTimeErrorMessage).toBe('');
        expect(component.dateTimeInputType).toBe('month');
    });

    it('clamps month value above 12 and advances to next field', () => {
        // Forward from month (tabindex=2) goes to year (tabindex=3).
        const month = setInputValue('month', '1', 1, 1);
        setInputValue('year', '');
        component.dateTimeInputType = 'month';
        component.handleChangeInput({ target: { id: 'digit', innerText: '9' } } as any);
        expect(month.value).toBe('12');
        expect(component.dateValue.month).toBe('12');
        expect(component.dateTimeInputType).toBe('year');
    });

    it('sets hour value without clamping when within range and clears time error', () => {
        const hour = setInputValue('hour', '0', 1, 1);
        component.dateTimeInputType = 'hour';
        component.hasTimeInputError = true;
        component.handleChangeInput({ target: { id: 'digit', innerText: '5' } } as any);
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
        // 'second' has tabindex=6 in the template and there is no tabindex=7 field,
        // so autoFocusOnInput should bail out via the "!nextInputField" guard.
        const lone = setInputValue('second', '55');
        const before = component.dateTimeInputType;
        (component as any).autoFocusOnInput(lone, '55', false, false);
        expect(component.dateTimeInputType).toBe(before);
    });

    it('autoFocusOnInput advances focus on backspace at start of field', () => {
        // Template tabindex order is day(1) / month(2) / year(3) / ..., so backspacing
        // out of month moves focus back to day.
        const day = setInputValue('day', '15');
        const month = setInputValue('month', '05');
        component.dateTimeInputType = 'month';
        (component as any).autoFocusOnInput(month, month.value, true, true);
        expect(component.dateTimeInputType).toBe('day');
        expect(document.activeElement).toBe(day);
    });

    it('autoFocusOnInput advances focus on backspace when value becomes empty', () => {
        const day = setInputValue('day', '15');
        const month = setInputValue('month', '');
        component.dateTimeInputType = 'month';
        (component as any).autoFocusOnInput(month, '', true, false);
        expect(component.dateTimeInputType).toBe('day');
        expect(document.activeElement).toBe(day);
    });

    it('autoFocusOnInput does not advance when backspace pressed mid-field with content remaining', () => {
        setInputValue('day', '15');
        const month = setInputValue('month', '05');
        component.dateTimeInputType = 'month';
        const before = component.dateTimeInputType;
        (component as any).autoFocusOnInput(month, '05', true, false);
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

    it('submits date and navigates back when date is valid', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { maintenance: { get: 'test' } };
        component.fareConsoleSetting = { ...component.fareConsoleSetting, minDateTime: undefined };
        component.dateValue = { year: '2025', month: '06', day: '15', hour: '10', minute: '00', second: '00' };
        (component as any).handleConfirmDate();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('submits date successfully when minDateTime is an empty string', () => {
        component.topics = { maintenance: { get: 'test' } };
        component.fareConsoleSetting = { ...component.fareConsoleSetting, minDateTime: '' };
        component.dateValue = { year: '2025', month: '06', day: '15', hour: '10', minute: '00', second: '00' };
        (component as any).handleConfirmDate();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    // ---------------- submitDate (private) ----------------

    it('submitDate does nothing when date is null', () => {
        (component as any).submitDate(null);
        expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
    });

    it('submitDate publishes, dispatches and navigates back when date is provided', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { maintenance: { get: 'test' } };
        (component as any).submitDate('2025-06-15T10:00:00+08:00');
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    // ---------------- setDefaultDateTime (private, currently unused by ngOnInit) ----------------

    it('setDefaultDateTime populates dateValue from fareConsoleSetting.dateTime', () => {
        component.fareConsoleSetting = {
            ...component.fareConsoleSetting,
            dateTime: '2025-06-15T10:20:30+08:00',
        };
        (component as any).setDefaultDateTime();
        expect(component.dateValue.year).toBe('2025');
        expect(component.dateValue.month).toBe('06');
        expect(component.dateValue.day).toBe('15');
    });

    it('setDefaultDateTime does nothing when fareConsoleSetting.dateTime is absent', () => {
        component.fareConsoleSetting = { ...component.fareConsoleSetting, dateTime: undefined };
        component.dateValue = { year: 'x', month: 'x', day: 'x', hour: 'x', minute: 'x', second: 'x' };
        (component as any).setDefaultDateTime();
        expect(component.dateValue.year).toBe('x');
    });
});
