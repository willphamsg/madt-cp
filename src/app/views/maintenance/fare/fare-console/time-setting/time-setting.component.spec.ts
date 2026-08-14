import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeSettingComponent } from './time-setting.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

describe('TimeSettingComponent', () => {
    let component: TimeSettingComponent;
    let fixture: ComponentFixture<TimeSettingComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), TimeSettingComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeSettingComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize hasInputError to false', () => {
        expect(component.hasInputError).toBeFalse();
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

import { BehaviorSubject, of } from 'rxjs';
import { MockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { fareConsole } from '@store/maintenance/maintenance.reducer';
import { MsgID, MsgSubID } from '@models';

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

describe('TimeSettingComponent - extended coverage', () => {
    let component: TimeSettingComponent;
    let fixture: ComponentFixture<TimeSettingComponent>;
    let store: MockStore;
    let mockMqttService: MockMqttService;
    let router: Router;

    // The component template already renders a real input with id "inputField"
    // (see time-setting.component.html), and the fixture is attached to the
    // document, so document.getElementById(...) resolves to this actual element.
    // Defensively remove any stale element with the same id left over from other
    // spec files before each test, then grab the real one via the fixture.
    function getInput(): HTMLInputElement {
        return fixture.nativeElement.querySelector('#inputField') as HTMLInputElement;
    }

    function setInputValue(value: string, selectionStart?: number, selectionEnd?: number): HTMLInputElement {
        const input = getInput();
        input.value = value;
        const start = selectionStart ?? value.length;
        const end = selectionEnd ?? start;
        input.setSelectionRange(start, end);
        return input;
    }

    beforeEach(async () => {
        document.getElementById('inputField')?.remove();
        mockMqttService = new MockMqttService();
        const routerMock = {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), TimeSettingComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeSettingComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as unknown as MockStore;
        router = TestBed.inject(Router);
        fixture.detectChanges();
        document.body.appendChild(fixture.nativeElement);
    });

    afterEach(() => {
        fixture.nativeElement.remove();
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
            date: '',
            time: '10:20:30',
            complimentaryDays: 0,
            message: '',
        } as any);
        store.refreshState();
        expect(component.fareConsoleSetting.time).toBe('10:20:30');
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

    // ---------------- handleConfirmTime (private) ----------------

    describe('handleConfirmTime (private)', () => {
        it('sets hasInputError when value is non-numeric', () => {
            (component as any).handleConfirmTime('abcdef');
            expect(component.hasInputError).toBeTrue();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('sets hasInputError when value length is not 6 (too short)', () => {
            (component as any).handleConfirmTime('12345');
            expect(component.hasInputError).toBeTrue();
        });

        it('sets hasInputError when value length is not 6 (too long)', () => {
            (component as any).handleConfirmTime('1234567');
            expect(component.hasInputError).toBeTrue();
        });

        it('sets hasInputError when hour exceeds 24', () => {
            (component as any).handleConfirmTime('990000');
            expect(component.hasInputError).toBeTrue();
        });

        it('sets hasInputError when minute exceeds 59', () => {
            (component as any).handleConfirmTime('006000');
            expect(component.hasInputError).toBeTrue();
        });

        it('sets hasInputError when second exceeds 59', () => {
            (component as any).handleConfirmTime('000060');
            expect(component.hasInputError).toBeTrue();
        });

        it('sets hasInputError when hour is 24 and minute > 0', () => {
            (component as any).handleConfirmTime('240100');
            expect(component.hasInputError).toBeTrue();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('sets hasInputError when hour is 24 and second > 0', () => {
            (component as any).handleConfirmTime('240001');
            expect(component.hasInputError).toBeTrue();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('accepts 24:00:00 as a valid boundary time and submits', () => {
            component.topics = { maintenance: { get: 'test' } } as any;
            const dispatchSpy = spyOn(store, 'dispatch');
            (component as any).handleConfirmTime('240000');
            expect(component.hasInputError).toBeFalse();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
        });

        it('accepts a normal valid time, clears hasInputError and submits', () => {
            component.hasInputError = true;
            component.topics = { maintenance: { get: 'test' } } as any;
            (component as any).handleConfirmTime('123045');
            expect(component.hasInputError).toBeFalse();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
        });
    });

    // ---------------- submitTime ----------------

    describe('submitTime', () => {
        it('publishes with the maintenance.get topic, dispatches, and navigates back', () => {
            component.topics = { maintenance: { get: '/madt/maintenance/fare' } } as any;
            const dispatchSpy = spyOn(store, 'dispatch');
            component.submitTime('10:20:30');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    topic: '/madt/maintenance/fare',
                    msgID: MsgID.MAINTENANCE_TIME_SUBMIT,
                    msgSubID: MsgSubID.NOTIFY,
                    payload: { time: '10:20:30' },
                }),
            );
            expect(dispatchSpy).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
        });

        it('publishes with an undefined topic when topics has not been set', () => {
            component.topics = undefined;
            component.submitTime('01:02:03');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ topic: undefined }),
            );
        });
    });

    // ---------------- handleChangeInput ----------------

    describe('handleChangeInput', () => {
        it('deletes the character before the cursor on backspace with no selection', () => {
            const input = setInputValue('123456', 3, 3);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as any);
            expect(input.value).toBe('12456');
            expect(input.selectionStart).toBe(2);
            expect(input.selectionEnd).toBe(2);
        });

        it('deletes the selected text on backspace with a selection', () => {
            const input = setInputValue('123456', 1, 4);
            component.handleChangeInput({ target: { id: 'backspaceKey' } } as any);
            expect(input.value).toBe('156');
            expect(input.selectionStart).toBe(1);
            expect(input.selectionEnd).toBe(1);
        });

        it('does nothing on enterKey when the input value is empty', () => {
            setInputValue('');
            const spy = spyOn(component as any, 'handleConfirmTime');
            component.handleChangeInput({ target: { id: 'enterKey' } } as any);
            expect(spy).not.toHaveBeenCalled();
        });

        it('calls handleConfirmTime with the current value on enterKey', () => {
            setInputValue('123045');
            const spy = spyOn(component as any, 'handleConfirmTime');
            component.handleChangeInput({ target: { id: 'enterKey' } } as any);
            expect(spy).toHaveBeenCalledWith('123045');
        });

        it('inserts the pressed digit at the cursor position', () => {
            const input = setInputValue('125', 2, 2);
            component.handleChangeInput({ target: { innerText: '3' } } as any);
            expect(input.value).toBe('1235');
            expect(input.selectionStart).toBe(3);
            expect(input.selectionEnd).toBe(3);
        });

        it('trims whitespace from the pressed key label before inserting', () => {
            const input = setInputValue('', 0, 0);
            component.handleChangeInput({ target: { innerText: ' 7 ' } } as any);
            expect(input.value).toBe('7');
        });

        it('focuses the input field after a key press', () => {
            const input = setInputValue('1', 1, 1);
            component.handleChangeInput({ target: { innerText: '2' } } as any);
            expect(document.activeElement).toBe(input);
        });
    });
});
