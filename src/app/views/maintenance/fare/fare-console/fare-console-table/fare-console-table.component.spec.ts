import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareConsoleTableComponent } from './fare-console-table.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { fareConsole } from '@store/maintenance/maintenance.reducer';
import { MqttService } from '@services/mqtt.service';
import { MsgID, MsgSubID } from '@models';

// Mock MqttService following the repo convention (see end-trip.component.spec.ts)
class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);

    mqttConfig = {
        topics: {
            maintenance: {
                get: '/madt/maintenance/fare-console',
            },
            mainTab: {
                get: '/madt/main/fare-console',
            },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

function createInputField(value: string, start: number, end: number): HTMLInputElement {
    let input = document.getElementById('inputField') as HTMLInputElement | null;
    if (!input) {
        input = document.createElement('input');
        input.id = 'inputField';
        document.body.appendChild(input);
    }
    input.value = value;
    input.selectionStart = start;
    input.selectionEnd = end;
    return input;
}

function removeInputField(): void {
    const input = document.getElementById('inputField');
    if (input) {
        input.remove();
    }
}

function createTargetElement(id: string, innerText = ''): HTMLDivElement {
    const div = document.createElement('div');
    div.id = id;
    div.innerText = innerText;
    return div;
}

describe('FareConsoleTableComponent', () => {
    let component: FareConsoleTableComponent;
    let fixture: ComponentFixture<FareConsoleTableComponent>;
    let mockMqttService: MockMqttService;
    let store: MockStore;
    let router: Router;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareConsoleTableComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FareConsoleTableComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store) as MockStore;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    afterEach(() => {
        removeInputField();
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        store.resetSelectors();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('validateFareConsoleForm should return false when all fields are empty/zero', () => {
        component.fareConsoleSetting = {
            deckType: { id: 0, label: '' },
            blsStatus: 0,
            busId: '',
            date: '',
            time: '',
            complimentaryDays: 0,
            message: '',
        };
        const result = component.validateFareConsoleForm();
        expect(result).toBeFalse();
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });

    describe('ngOnInit', () => {
        it('should set topics when mqtt config is loaded', () => {
            expect(component.topics).toEqual(mockMqttService.mqttConfig.topics);
        });

        it('should not set topics when mqtt config is not loaded', async () => {
            TestBed.resetTestingModule();
            const localMqttMock = new MockMqttService();
            localMqttMock.mqttConfigLoaded$ = of(false);
            await TestBed.configureTestingModule({
                imports: [TranslateModule.forRoot(), FareConsoleTableComponent],
                providers: [
                    provideHttpClient(),
                    provideMockStore({ initialState: mockInitialState }),
                    provideRouter([]),
                    { provide: MqttService, useValue: localMqttMock },
                ],
                schemas: [NO_ERRORS_SCHEMA],
            }).compileComponents();

            const localFixture = TestBed.createComponent(FareConsoleTableComponent);
            const localComponent = localFixture.componentInstance;
            localFixture.detectChanges();

            expect(localComponent.topics).toBeUndefined();
        });

        it('should update fareConsoleSetting and default selectedDeckTypeId to 0 when store id is absent', () => {
            const mockStore = store as MockStore;
            mockStore.overrideSelector(fareConsole, {
                deckType: { id: 0, label: '' },
                busId: 'bus-1',
                complimentaryDays: 0,
                message: '',
            } as any);
            mockStore.refreshState();
            fixture.detectChanges();

            expect(component.fareConsoleSetting.busId).toBe('bus-1');
            expect(component.selectedDeckTypeId).toBe(0);
        });

        it('should set selectedDeckTypeId from store deckType id when present', () => {
            const mockStore = store as MockStore;
            mockStore.overrideSelector(fareConsole, {
                deckType: { id: 5, label: 'Upper' },
                busId: 'bus-2',
                complimentaryDays: 1,
                message: '',
            } as any);
            mockStore.refreshState();
            fixture.detectChanges();

            expect(component.selectedDeckTypeId).toBe(5);
        });

        it('should navigate to delete-parameter when store data has DELETE_PARAMETER msgID', () => {
            const navigateSpy = spyOn(router, 'navigate');
            const mockStore = store as MockStore;
            mockStore.overrideSelector(fareConsole, {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                msgID: MsgID.DELETE_PARAMETER,
            } as any);
            mockStore.refreshState();
            fixture.detectChanges();

            expect(navigateSpy).toHaveBeenCalled();
        });
    });

    describe('handleChangeSetting', () => {
        it('should set settingType and call selectChangeDeckType for deckType', () => {
            spyOn(component, 'selectChangeDeckType');
            component.handleChangeSetting('deckType');
            expect(component.settingType).toBe('deckType');
            expect(component.selectChangeDeckType).toHaveBeenCalled();
        });

        it('should set settingType without calling selectChangeDeckType for other values', () => {
            spyOn(component, 'selectChangeDeckType');
            component.handleChangeSetting('time');
            expect(component.settingType).toBe('time');
            expect(component.selectChangeDeckType).not.toHaveBeenCalled();
        });
    });

    describe('selectChangeDeckType', () => {
        it('should publish DECK_TYPE_LIST request when deckTypeList is empty', () => {
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                deckTypeList: [],
            };
            component.selectChangeDeckType();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.DECK_TYPE_LIST, msgSubID: MsgSubID.REQUEST }),
            );
        });

        it('should not publish when deckTypeList already has items', () => {
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                deckTypeList: [{ id: 1, label: 'Upper' }],
            };
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.selectChangeDeckType();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });
    });

    it('handleChangeDeckType should set selectedDeckTypeId', () => {
        component.handleChangeDeckType(7);
        expect(component.selectedDeckTypeId).toBe(7);
    });

    describe('handleConfirmDeckType', () => {
        it('should update deckType, publish and dispatch when confirmed and match found', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.fareConsoleSetting = {
                deckType: { id: 1, label: 'Lower' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                deckTypeList: [
                    { id: 1, label: 'Lower' },
                    { id: 2, label: 'Upper' },
                ],
            };
            component.selectedDeckTypeId = 2;
            component.settingType = 'deckType';

            component.handleConfirmDeckType(true);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.DECK_TYPE_SUBMIT, msgSubID: MsgSubID.NOTIFY }),
            );
            expect(dispatchSpy).toHaveBeenCalled();
            expect(component.settingType).toBe('');
        });

        it('should publish and dispatch without changing deckType when no match found', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.fareConsoleSetting = {
                deckType: { id: 1, label: 'Lower' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                deckTypeList: [{ id: 1, label: 'Lower' }],
            };
            component.selectedDeckTypeId = 99;

            component.handleConfirmDeckType(true);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalled();
        });

        it('should reset selectedDeckTypeId to fareConsoleSetting deckType id when not confirmed', () => {
            component.fareConsoleSetting = {
                deckType: { id: 3, label: 'Lower' },
                busId: '',
                complimentaryDays: 0,
                message: '',
            };
            component.selectedDeckTypeId = 99;
            component.settingType = 'deckType';

            component.handleConfirmDeckType(false);

            expect(component.selectedDeckTypeId).toBe(3);
            expect(component.settingType).toBe('');
        });

        it('should default selectedDeckTypeId to 0 when not confirmed and no deckType id present', () => {
            component.fareConsoleSetting = {
                deckType: undefined as any,
                busId: '',
                complimentaryDays: 0,
                message: '',
            };
            component.selectedDeckTypeId = 99;

            component.handleConfirmDeckType(false);

            expect(component.selectedDeckTypeId).toBe(0);
        });
    });

    it('handleChangeBlsStatus should set selectedBlsStatus and blsStep', () => {
        component.handleChangeBlsStatus(1);
        expect(component.selectedBlsStatus).toBe(1);
        expect(component.blsStep).toBe(2);
    });

    describe('handleConfirmBlsStatus', () => {
        it('should publish true blsStatus, dispatch, reset settingType and blsStep when confirmed with status 1', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.selectedBlsStatus = 1;
            component.blsStep = 2;
            component.settingType = 'blsStatus';

            component.handleConfirmBlsStatus(true);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.BLS_STATUS_SUBMIT,
                    payload: jasmine.objectContaining({ blsStatus: true }),
                }),
            );
            expect(dispatchSpy).toHaveBeenCalled();
            expect(component.settingType).toBe('');
            expect(component.blsStep).toBe(1);
        });

        it('should publish false blsStatus when selectedBlsStatus is not 1', () => {
            component.selectedBlsStatus = 0;

            component.handleConfirmBlsStatus(true);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ blsStatus: false }),
                }),
            );
        });

        it('should only reset blsStep when not confirmed', () => {
            component.settingType = 'blsStatus';
            component.blsStep = 2;
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleConfirmBlsStatus(false);

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
            expect(component.blsStep).toBe(1);
            expect(component.settingType).toBe('blsStatus');
        });
    });

    describe('handleClickBack', () => {
        it('should dispatch when msgID is MAINTENANCE_DELETE_PARAMETER_NOTIFY', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                msgID: MsgID.MAINTENANCE_DELETE_PARAMETER_NOTIFY,
            };
            component.settingType = 'something';

            component.handleClickBack();

            expect(dispatchSpy).toHaveBeenCalled();
            expect(component.settingType).toBe('');
        });

        it('should not dispatch when msgID does not match', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                msgID: MsgID.FARE_CONSOLE,
            };

            component.handleClickBack();

            expect(dispatchSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleChangeInput - backspaceKey', () => {
        it('should delete character before cursor when there is no selection', () => {
            const input = createInputField('abcdef', 3, 3);
            const target = createTargetElement('backspaceKey');
            component.handleChangeInput({ target } as unknown as Event, 'other');
            expect(input.value).toBe('abdef');
        });

        it('should delete selected text when a selection exists', () => {
            const input = createInputField('abcdef', 1, 4);
            const target = createTargetElement('backspaceKey');
            component.handleChangeInput({ target } as unknown as Event, 'other');
            expect(input.value).toBe('aef');
        });
    });

    describe('handleChangeInput - enterKey', () => {
        it('should do nothing when input value is empty', () => {
            createInputField('', 0, 0);
            const target = createTargetElement('enterKey');
            expect(() => component.handleChangeInput({ target } as unknown as Event, 'time')).not.toThrow();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should call time confirmation for type time', () => {
            createInputField('235959', 0, 0);
            const target = createTargetElement('enterKey');
            component.handleChangeInput({ target } as unknown as Event, 'time');
            expect(component.hasInputError).toBeFalse();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.TIME_SUBMIT }),
            );
        });

        it('should call date confirmation for type date', () => {
            createInputField('01012024', 0, 0);
            const target = createTargetElement('enterKey');
            component.handleChangeInput({ target } as unknown as Event, 'date');
            expect(component.hasInputError).toBeFalse();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.DATE_SUBMIT }),
            );
        });

        it('should call complimentary days confirmation for any other type', () => {
            createInputField('5', 0, 0);
            const target = createTargetElement('enterKey');
            component.handleChangeInput({ target } as unknown as Event, 'complimentaryDays');
            expect(component.hasInputError).toBeFalse();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.COMPLIMENTARY_DAYS_SUBMIT }),
            );
        });
    });

    describe('handleChangeInput - regular key', () => {
        it('should insert the pressed key value at the cursor', () => {
            const input = createInputField('ac', 1, 1);
            const target = createTargetElement('numKey', '  b  ');
            component.handleChangeInput({ target } as unknown as Event, 'other');
            expect(input.value).toBe('abc');
        });
    });

    describe('time validation branches (via handleChangeInput)', () => {
        function submitTime(value: string) {
            createInputField(value, 0, 0);
            const target = createTargetElement('enterKey');
            component.handleChangeInput({ target } as unknown as Event, 'time');
        }

        it('should set hasInputError for non numeric value', () => {
            submitTime('abcdef');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when length is not 6', () => {
            submitTime('1234');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when hour is greater than 24', () => {
            submitTime('990000');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when minute is greater than 59', () => {
            submitTime('006000');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when second is greater than 59', () => {
            submitTime('000060');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when hour is 24 and minute greater than 0', () => {
            submitTime('240100');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when hour is 24 and second greater than 0', () => {
            submitTime('240001');
            expect(component.hasInputError).toBeTrue();
        });

        it('should accept a valid boundary time of 24:00:00', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            submitTime('240000');
            expect(component.hasInputError).toBeFalse();
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    describe('date validation branches (via handleChangeInput)', () => {
        function submitDate(value: string) {
            createInputField(value, 0, 0);
            const target = createTargetElement('enterKey');
            component.handleChangeInput({ target } as unknown as Event, 'date');
        }

        it('should set hasInputError for non numeric value', () => {
            submitDate('abcdefgh');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when length is not 8', () => {
            submitDate('0101202');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError for an invalid calendar date', () => {
            submitDate('31022024');
            expect(component.hasInputError).toBeTrue();
        });

        it('should accept a valid calendar date', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            submitDate('29022024');
            expect(component.hasInputError).toBeFalse();
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    describe('complimentary days validation branches (via handleChangeInput)', () => {
        it('should set hasInputError for non numeric value', () => {
            createInputField('abc', 0, 0);
            const target = createTargetElement('enterKey');
            component.handleChangeInput({ target } as unknown as Event, 'complimentaryDays');
            expect(component.hasInputError).toBeTrue();
        });

        it('should accept a numeric value', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            createInputField('10', 0, 0);
            const target = createTargetElement('enterKey');
            component.handleChangeInput({ target } as unknown as Event, 'complimentaryDays');
            expect(component.hasInputError).toBeFalse();
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    it('handleDeleteParameter should publish DELETE_PARAMETER request', () => {
        component.handleDeleteParameter();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.DELETE_PARAMETER, msgSubID: MsgSubID.REQUEST }),
        );
    });

    it('handleClearDeleteParameter should dispatch and reset settingType', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.settingType = 'deleteParameter';
        component.handleClearDeleteParameter();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(component.settingType).toBe('');
    });

    describe('handleDeleteParameterByNotify', () => {
        it('should navigate to delete-parameter when msgID matches DELETE_PARAMETER', () => {
            spyOn(component, 'handleNavigate');
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                msgID: MsgID.DELETE_PARAMETER,
            };
            component.handleDeleteParameterByNotify();
            expect(component.handleNavigate).toHaveBeenCalledWith('/delete-parameter');
        });

        it('should not navigate when msgID does not match', () => {
            spyOn(component, 'handleNavigate');
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                msgID: MsgID.FARE_CONSOLE,
            };
            component.handleDeleteParameterByNotify();
            expect(component.handleNavigate).not.toHaveBeenCalled();
        });
    });

    it('validateFareConsoleForm should return true when all required fields are truthy', () => {
        component.fareConsoleSetting = {
            deckType: { id: 1, label: 'Lower' },
            dateTime: '2024-01-01',
            busId: 'bus-1',
            complimentaryDays: 5,
            fareBusStopMode: 1,
            message: '',
        };
        expect(component.validateFareConsoleForm()).toBeTrue();
    });

    it('handleConfirmFareConsole should publish and dispatch with the current fare console setting', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.fareConsoleSetting = {
            deckType: { id: 1, label: 'Lower' },
            dateTime: '2024-01-01',
            busId: 'bus-1',
            complimentaryDays: 5,
            fareBusStopMode: 1,
            serviceProvider: 2,
            message: '',
        };

        component.handleConfirmFareConsole();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE_SUBMIT,
                payload: jasmine.objectContaining({ busId: 'bus-1', deckType: 1 }),
            }),
        );
        expect(dispatchSpy).toHaveBeenCalled();
    });

    describe('handleNavigate', () => {
        it('should publish, dispatch isSubmitted false and navigate when submitted and url is not delete-parameter', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const navigateSpy = spyOn(router, 'navigate');
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                isSubmitted: true,
            };

            component.handleNavigate('/edit');

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAINTENANCE_FARE_CONSOLE }),
            );
            expect(dispatchSpy).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledWith([component.urlPrefix + '/edit']);
        });

        it('should publish but skip the edit-dispatch when submitted and url contains delete-parameter', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const navigateSpy = spyOn(router, 'navigate');
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                isSubmitted: true,
            };

            component.handleNavigate('/delete-parameter');

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalled();
            expect(dispatchSpy).not.toHaveBeenCalled();
            expect(navigateSpy).toHaveBeenCalledWith([component.urlPrefix + '/delete-parameter']);
        });

        it('should dispatch isDaftMode and navigate when not submitted and url contains delete-parameter', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const navigateSpy = spyOn(router, 'navigate');
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                isSubmitted: false,
            };

            component.handleNavigate('/delete-parameter');

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledWith([component.urlPrefix + '/delete-parameter']);
        });

        it('should only navigate when not submitted and url does not contain delete-parameter', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const navigateSpy = spyOn(router, 'navigate');
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.fareConsoleSetting = {
                deckType: { id: 0, label: '' },
                busId: '',
                complimentaryDays: 0,
                message: '',
                isSubmitted: false,
            };

            component.handleNavigate('/edit');

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
            expect(dispatchSpy).not.toHaveBeenCalled();
            expect(navigateSpy).toHaveBeenCalledWith([component.urlPrefix + '/edit']);
        });
    });

    it('ngOnDestroy should not throw', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle button sound', () => {
        const soundService = (component as any).soundService;
        const soundSpy = spyOn(soundService, 'playButton');
        component.handleButtonSound();
        expect(soundSpy).toHaveBeenCalled();
    });
});
