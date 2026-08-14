import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTimeSettingComponent } from './date-time-setting.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { dateTimeSetting } from '@store/main/main.reducer';

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);
    mqttConfig = {
        topics: {
            mainTab: {
                get: '/madt/main/date-time',
            },
        },
    };
    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

function getInput(id: string): HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement;
}

function setCursor(input: HTMLInputElement, start: number, end?: number) {
    input.setSelectionRange(start, end ?? start);
}

function pressKey(text: string): Event {
    const div = document.createElement('div');
    div.id = 'numKey';
    div.innerText = text;
    return { target: div } as unknown as Event;
}

function pressSpecial(id: string): Event {
    const div = document.createElement('div');
    div.id = id;
    return { target: div } as unknown as Event;
}

describe('DateTimeSettingComponent', () => {
    let component: DateTimeSettingComponent;
    let fixture: ComponentFixture<DateTimeSettingComponent>;
    let mockMqttService: MockMqttService;
    let store: MockStore;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DateTimeSettingComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
                { provide: SoundService, useValue: { playButton: jasmine.createSpy('playButton') } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        store = TestBed.inject(Store) as unknown as MockStore;
        spyOn(store, 'dispatch').and.callThrough();

        fixture = TestBed.createComponent(DateTimeSettingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        document.body.appendChild(fixture.nativeElement);
    });

    afterEach(() => {
        fixture.nativeElement.remove();
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

    it('should set topics from mqtt config when config is loaded', () => {
        expect(component.topics).toEqual(mockMqttService.mqttConfig.topics);
    });

    it('should update dateTimeSetting when store emits new data', () => {
        store.overrideSelector(dateTimeSetting, {
            dateTime: '2025-05-01T10:00:00',
            message: 'SOME_ERROR',
        });
        store.refreshState();
        fixture.detectChanges();
        expect(component.dateTimeSetting.dateTime).toBe('2025-05-01T10:00:00');
        expect(component.dateTimeSetting.message).toBe('SOME_ERROR');
    });

    it('should navigate back to fare console', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('should play button sound', () => {
        component.handleButtonSound();
        const soundService = TestBed.inject(SoundService) as any;
        expect(soundService.playButton).toHaveBeenCalled();
    });

    describe('ngOnDestroy', () => {
        it('should dispatch updateDateTimeSetting with cleared message', () => {
            component.dateTimeSetting = { dateTime: '2025-01-01T00:00:00', message: 'ERR' };
            component.ngOnDestroy();
            expect(store.dispatch).toHaveBeenCalled();
        });
    });

    describe('setDefaultDateTime (private)', () => {
        it('should not touch dateValue when dateTimeSetting.dateTime is falsy', () => {
            component.dateTimeSetting = { dateTime: '' };
            const before = { ...component.dateValue };
            (component as any).setDefaultDateTime();
            expect(component.dateValue).toEqual(before);
        });

        it('should populate dateValue from dateTimeSetting.dateTime when present', () => {
            component.dateTimeSetting = { dateTime: '2025-06-15T08:09:10' };
            (component as any).setDefaultDateTime();
            expect(component.dateValue).toEqual({
                year: '2025',
                month: '06',
                day: '15',
                hour: '08',
                minute: '09',
                second: '10',
            });
        });
    });

    describe('removeStoreError (private)', () => {
        it('should dispatch clearing message when message is present', () => {
            component.dateTimeSetting = { dateTime: '2025-01-01T00:00:00', message: 'ERR' };
            (component as any).removeStoreError();
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('should not dispatch when message is empty', () => {
            component.dateTimeSetting = { dateTime: '2025-01-01T00:00:00', message: '' };
            (store.dispatch as jasmine.Spy).calls.reset();
            (component as any).removeStoreError();
            expect(store.dispatch).not.toHaveBeenCalled();
        });
    });

    describe('setValueForDateElement (private)', () => {
        it('should return empty string when dateTimeInputType is falsy', () => {
            component.dateTimeInputType = null as any;
            expect((component as any).setValueForDateElement('5')).toBe('');
        });

        it('should clamp month above 12 to 12', () => {
            component.dateTimeInputType = 'month';
            expect((component as any).setValueForDateElement('13')).toBe('12');
            expect(component.dateValue.month).toBe('12');
        });

        it('should not clamp month at or below 12', () => {
            component.dateTimeInputType = 'month';
            expect((component as any).setValueForDateElement('9')).toBe('9');
        });

        it('should clamp day above 31 to 31', () => {
            component.dateTimeInputType = 'day';
            expect((component as any).setValueForDateElement('32')).toBe('31');
            expect(component.dateValue.day).toBe('31');
        });

        it('should not clamp day at or below 31', () => {
            component.dateTimeInputType = 'day';
            expect((component as any).setValueForDateElement('15')).toBe('15');
        });

        it('should clamp hour above 23 to 23', () => {
            component.dateTimeInputType = 'hour';
            expect((component as any).setValueForDateElement('24')).toBe('23');
            expect(component.dateValue.hour).toBe('23');
        });

        it('should not clamp hour at or below 23', () => {
            component.dateTimeInputType = 'hour';
            expect((component as any).setValueForDateElement('10')).toBe('10');
        });

        it('should clamp minute above 59 to 59', () => {
            component.dateTimeInputType = 'minute';
            expect((component as any).setValueForDateElement('60')).toBe('59');
            expect(component.dateValue.minute).toBe('59');
        });

        it('should not clamp minute at or below 59', () => {
            component.dateTimeInputType = 'minute';
            expect((component as any).setValueForDateElement('30')).toBe('30');
        });

        it('should clamp second above 59 to 59', () => {
            component.dateTimeInputType = 'second';
            expect((component as any).setValueForDateElement('61')).toBe('59');
            expect(component.dateValue.second).toBe('59');
        });

        it('should not clamp second at or below 59', () => {
            component.dateTimeInputType = 'second';
            expect((component as any).setValueForDateElement('45')).toBe('45');
        });

        it('should pass through year without clamping (no matching case)', () => {
            component.dateTimeInputType = 'year';
            expect((component as any).setValueForDateElement('2025')).toBe('2025');
            expect(component.dateValue.year).toBe('2025');
        });
    });

    describe('autoFocusOnInput (private)', () => {
        it('should return without action when no next input field exists', () => {
            const secondInput = getInput('second');
            expect(() =>
                (component as any).autoFocusOnInput(secondInput, secondInput.value, false, false),
            ).not.toThrow();
        });

        it('should move focus to next field when value length reaches limit and not backspacing (year)', () => {
            const yearInput = getInput('year');
            yearInput.value = '2025';
            (component as any).autoFocusOnInput(yearInput, '2025', false, false);
            expect(component.dateTimeInputType).toBe('hour');
        });

        it('should move focus to next field when value length reaches limit and not backspacing (non-year)', () => {
            const dayInput = getInput('day');
            dayInput.value = '15';
            (component as any).autoFocusOnInput(dayInput, '15', false, false);
            expect(component.dateTimeInputType).toBe('month');
        });

        it('should move focus to next field on backspace with first cursor', () => {
            const monthInput = getInput('month');
            monthInput.value = '5';
            (component as any).autoFocusOnInput(monthInput, '5', true, true);
            expect(component.dateTimeInputType).toBe('day');
        });

        it('should move focus to next field on backspace when value empty', () => {
            const monthInput = getInput('month');
            monthInput.value = '';
            (component as any).autoFocusOnInput(monthInput, '', true, false);
            expect(component.dateTimeInputType).toBe('day');
        });

        it('should do nothing when neither condition is satisfied', () => {
            const monthInput = getInput('month');
            monthInput.value = '1';
            component.dateTimeInputType = 'month';
            (component as any).autoFocusOnInput(monthInput, '1', false, false);
            expect(component.dateTimeInputType).toBe('month');
        });
    });

    describe('handleConfirmDate (private) via enterKey', () => {
        beforeEach(() => {
            component.dateTimeSetting = { dateTime: '' };
        });

        it('should set date error message when year/month/day missing', () => {
            component.dateValue = { year: '', month: '05', day: '10', hour: '10', minute: '10', second: '10' };
            (component as any).handleConfirmDate();
            expect(component.dateTimeErrorMessage).toBe('INVALID_ENTRY');
        });

        it('should set time input error when hour/minute/second missing', () => {
            component.dateValue = { year: '2025', month: '05', day: '10', hour: '', minute: '10', second: '10' };
            (component as any).handleConfirmDate();
            expect(component.hasTimeInputError).toBeTrue();
        });

        it('should return early and not submit when both date and time are invalid', () => {
            component.dateValue = { year: '', month: '', day: '', hour: '', minute: '', second: '' };
            (component as any).handleConfirmDate();
            expect(component.dateTimeErrorMessage).toBe('INVALID_ENTRY');
            expect(component.hasTimeInputError).toBeTrue();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should set invalid entry message when date does not exist (e.g. Feb 30)', () => {
            component.dateValue = { year: '2025', month: '02', day: '30', hour: '10', minute: '10', second: '10' };
            (component as any).handleConfirmDate();
            expect(component.dateTimeErrorMessage).toBe('INVALID_ENTRY');
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should set min date error message when date is earlier than minDateTime', () => {
            component.dateTimeSetting = { dateTime: '', minDateTime: '2999-01-01T00:00:00' };
            component.dateValue = { year: '2025', month: '05', day: '10', hour: '10', minute: '10', second: '10' };
            (component as any).handleConfirmDate();
            expect(component.dateTimeErrorMessage).toBeTruthy();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should submit date when minDateTime is not set (falsy branch)', () => {
            component.dateTimeSetting = { dateTime: '' };
            component.dateValue = { year: '2025', month: '05', day: '10', hour: '10', minute: '10', second: '10' };
            (component as any).handleConfirmDate();
            expect(component.dateTimeErrorMessage).toBe('');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        });

        it('should submit date when date is on/after minDateTime', () => {
            component.dateTimeSetting = { dateTime: '', minDateTime: '2020-01-01T00:00:00' };
            component.dateValue = { year: '2025', month: '05', day: '10', hour: '10', minute: '10', second: '10' };
            (component as any).handleConfirmDate();
            expect(component.dateTimeErrorMessage).toBe('');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        });
    });

    describe('submitDate (private)', () => {
        it('should not publish when date is null', () => {
            (component as any).submitDate(null);
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should publish with correct topic and payload when date is provided', () => {
            component.topics = mockMqttService.mqttConfig.topics as any;
            (component as any).submitDate('2025-05-10T10:10:10+00:00');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
            const args = mockMqttService.publishWithMessageFormat.calls.mostRecent().args[0];
            expect(args.topic).toBe('/madt/main/date-time');
            expect(args.payload).toEqual({ dateTime: '2025-05-10T10:10:10+00:00' });
        });
    });

    describe('handleChangeInput', () => {
        beforeEach(() => {
            component.dateTimeSetting = { dateTime: '' };
        });

        it('should return early when dateTimeInputType is falsy', () => {
            component.dateTimeInputType = null as any;
            expect(() => component.handleChangeInput(pressKey('1'))).not.toThrow();
        });

        it('should type a digit into the day field and clear the date error message', () => {
            component.dateTimeInputType = 'day';
            const dayInput = getInput('day');
            dayInput.value = '';
            setCursor(dayInput, 0, 0);
            component.dateTimeErrorMessage = 'INVALID_ENTRY';
            component.dateTimeSetting = { dateTime: '', message: 'ERR' };

            component.handleChangeInput(pressKey('3'));

            expect(dayInput.value).toBe('3');
            expect(component.dateTimeErrorMessage).toBe('');
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('should type a digit into the hour field and clear the time error flag', () => {
            component.dateTimeInputType = 'hour';
            const hourInput = getInput('hour');
            hourInput.value = '';
            setCursor(hourInput, 0, 0);
            component.hasTimeInputError = true;

            component.handleChangeInput(pressKey('5'));

            expect(hourInput.value).toBe('5');
            expect(component.hasTimeInputError).toBeFalse();
        });

        it('should auto-advance to next field once day reaches its length limit', () => {
            component.dateTimeInputType = 'day';
            const dayInput = getInput('day');
            dayInput.value = '12';
            setCursor(dayInput, 0, 0);

            component.handleChangeInput(pressKey('9'));

            expect(component.dateTimeInputType).toBe('month');
        });

        it('should auto-advance to next field once year reaches its length limit', () => {
            component.dateTimeInputType = 'year';
            const yearInput = getInput('year');
            yearInput.value = '2025';
            setCursor(yearInput, 0, 0);

            component.handleChangeInput(pressKey('9'));

            expect(component.dateTimeInputType).toBe('hour');
        });

        it('should delete char before cursor on backspace with no selection (date field)', () => {
            component.dateTimeInputType = 'day';
            const dayInput = getInput('day');
            dayInput.value = '12';
            setCursor(dayInput, 2, 2);
            component.dateTimeErrorMessage = 'INVALID_ENTRY';
            component.dateTimeSetting = { dateTime: '', message: 'ERR' };

            component.handleChangeInput(pressSpecial('backspaceKey'));

            expect(dayInput.value).toBe('1');
            expect(component.dateTimeErrorMessage).toBe('');
        });

        it('should delete selected text on backspace with a selection (time field)', () => {
            component.dateTimeInputType = 'minute';
            const minuteInput = getInput('minute');
            minuteInput.value = '30';
            setCursor(minuteInput, 1, 2);
            component.hasTimeInputError = true;

            component.handleChangeInput(pressSpecial('backspaceKey'));

            expect(minuteInput.value).toBe('3');
            expect(component.hasTimeInputError).toBeFalse();
        });

        it('should do nothing on backspace when cursor is already at start', () => {
            component.dateTimeInputType = 'day';
            const dayInput = getInput('day');
            dayInput.value = '';
            setCursor(dayInput, 0, 0);

            expect(() => component.handleChangeInput(pressSpecial('backspaceKey'))).not.toThrow();
            expect(dayInput.value).toBe('');
        });

        it('should call handleConfirmDate on enterKey and surface invalid entry', () => {
            component.dateValue = { year: '', month: '', day: '', hour: '', minute: '', second: '' };

            component.handleChangeInput(pressSpecial('enterKey'));

            expect(component.dateTimeErrorMessage).toBe('INVALID_ENTRY');
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should call handleConfirmDate on enterKey and submit when everything is valid', () => {
            component.dateValue = { year: '2025', month: '05', day: '10', hour: '10', minute: '10', second: '10' };

            component.handleChangeInput(pressSpecial('enterKey'));

            expect(component.dateTimeErrorMessage).toBe('');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        });
    });
});

describe('DateTimeSettingComponent (mqttConfigLoaded false)', () => {
    let component: DateTimeSettingComponent;
    let fixture: ComponentFixture<DateTimeSettingComponent>;

    class MockMqttServiceNotLoaded {
        connectionStatus$ = of(true);
        mqttConfigLoaded$ = of(false);
        mqttConfig = { topics: undefined };
        subscribe = jasmine.createSpy('subscribe');
        publish = jasmine.createSpy('publish');
        publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DateTimeSettingComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useClass: MockMqttServiceNotLoaded },
                { provide: SoundService, useValue: { playButton: jasmine.createSpy('playButton') } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DateTimeSettingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should not set topics when config is not loaded', () => {
        expect(component.topics).toBeUndefined();
    });
});
