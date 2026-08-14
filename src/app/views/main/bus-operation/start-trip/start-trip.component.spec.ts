import { provideMockStore, MockStore as NgrxMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartTripComponent } from './start-trip.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgID, StartTripTypes, ResponseStatus } from '@models';
import { startTrip as startTripSelector } from '@store/main/main.reducer';

// Mock MqttService - follows the pattern used across the repo (see end-trip.component.spec.ts)
class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);
    mqttConfig: any = { topics: {} };

    subscribe = jasmine.createSpy('subscribe');
    unsubscribe = jasmine.createSpy('unsubscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('StartTripComponent', () => {
    let component: StartTripComponent;
    let fixture: ComponentFixture<StartTripComponent>;
    let mockMqttService: MockMqttService;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), StartTripComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mockMqttService },
                { provide: SoundService, useValue: { playButton: jasmine.createSpy('playButton') } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(StartTripComponent);
        component = fixture.componentInstance;
        spyOn(TestBed.inject(NgrxMockStore), 'dispatch').and.callThrough();
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

    it('should test fetchBusStopList', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        const spy = mqttService.publishWithMessageFormat as jasmine.Spy;
        component.topics = { mainTab: { get: 'test' } };
        component.startTripData = { fare: { serviceNumber: 123, variantName: 'A' } };
        component.fetchBusStopList();
        expect(spy).toHaveBeenCalled();
    });

    it('should test fetchServiceList', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        const spy = mqttService.publishWithMessageFormat as jasmine.Spy;
        component.topics = { mainTab: { get: 'test' } };
        component.fetchServiceList();
        expect(spy).toHaveBeenCalled();
    });

    it('should test navigateToStep', () => {
        component.navigateToStep(2);
        expect(component.step).toBe(2);
        expect(component.manualServiceIdError).toBeFalse();
        expect(component.inputValue).toBe('');
    });

    it('should navigate and publish on backToBusOperation', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');

        component.topics = { mainTab: { get: 'test' } };
        component.backToBusOperation();

        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['main/bus-operation']);
    });

    it('should navigate and publish on backToStartTripIssue', () => {
        const router = TestBed.inject(Router);
        const mqttService = TestBed.inject(MqttService) as any;
        const navigateSpy = spyOn(router, 'navigate');
        const publishSpy = mqttService.publishWithMessageFormat as jasmine.Spy;

        component.topics = { mainTab: { get: 'test' } };
        component.backToStartTripIssue();

        expect(navigateSpy).toHaveBeenCalled();
        expect(publishSpy).toHaveBeenCalled();
    });

    it('should test backToPreviousScreen', () => {
        component.step = 2;
        component.backToPreviousScreen();
        expect(component.step).toBe(1);
    });

    // ------------------------------------------------------------------
    // ngOnInit: mqttConfigLoaded$ branch
    // ------------------------------------------------------------------
    describe('ngOnInit - mqttConfigLoaded$', () => {
        it('should set topics once mqtt config is loaded', () => {
            mockMqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };

            component.ngOnInit();

            expect(component.topics).toEqual({ mainTab: { get: 'topic/get' } });
        });

        it('should not set topics when mqtt config has not loaded', async () => {
            // Fresh TestBed so mqttConfigLoaded$ is false at subscribe time.
            const notLoadedMqtt = new MockMqttService();
            notLoadedMqtt.mqttConfigLoaded$ = of(false);
            notLoadedMqtt.mqttConfig = { topics: { mainTab: { get: 'should-not-be-set' } } };

            await TestBed.resetTestingModule()
                .configureTestingModule({
                    imports: [TranslateModule.forRoot(), StartTripComponent],
                    providers: [
                        provideHttpClient(),
                        provideMockStore({ initialState: mockInitialState }),
                        provideRouter([]),
                        { provide: MqttService, useValue: notLoadedMqtt },
                        { provide: SoundService, useValue: { playButton: jasmine.createSpy('playButton') } },
                    ],
                    schemas: [NO_ERRORS_SCHEMA],
                })
                .compileComponents();

            const notLoadedFixture = TestBed.createComponent(StartTripComponent);
            const notLoadedComponent = notLoadedFixture.componentInstance;
            notLoadedFixture.detectChanges();

            expect(notLoadedComponent.topics).toBeUndefined();
        });
    });

    // ------------------------------------------------------------------
    // ngOnInit - startTrip$ subscription branches
    // ------------------------------------------------------------------
    describe('ngOnInit - startTrip$ subscription', () => {
        let store: NgrxMockStore;

        beforeEach(() => {
            store = TestBed.inject(Store) as any;
        });

        afterEach(() => {
            // Selector overrides mutate the shared selector function's memoized result;
            // without resetting, they leak into other spec files' tests.
            store.resetSelectors();
        });

        it('should default services/busStops to empty arrays when absent on the payload', () => {
            store.overrideSelector(startTripSelector, {} as any);
            store.refreshState();

            expect(component.services).toEqual([]);
            expect(component.busStops).toEqual([]);
        });

        it('should reset step/selectedService/selectedBusStop when type changes from a previous truthy type', () => {
            component.step = 5;
            component.selectedService = { serviceNumber: 1 };
            component.selectedBusStop = 'x';
            component.startTripData = { type: StartTripTypes.FMS_NO_INFO } as any;

            store.overrideSelector(startTripSelector, {
                type: StartTripTypes.FMS_VALID_INFO,
                services: [],
                busStopList: [],
            } as any);
            store.refreshState();

            // reset happened (selectedBusStop cleared), then step re-derived to 1
            // because type is FMS_VALID_INFO and step was reset to 0 first.
            expect(component.selectedBusStop).toBeUndefined();
            expect(component.step).toBe(1);
        });

        it('should NOT reset when the previous type was falsy', () => {
            component.startTripData = { type: undefined } as any;
            component.selectedBusStop = 'keep';

            store.overrideSelector(startTripSelector, { type: StartTripTypes.FMS_VALID_INFO } as any);
            store.refreshState();

            expect(component.selectedBusStop).toBe('keep');
        });

        it('should set step to 1 when type is FMS_NO_INFO and step was 0', () => {
            component.step = 0;
            component.startTripData = { type: undefined } as any;

            store.overrideSelector(startTripSelector, { type: StartTripTypes.FMS_NO_INFO } as any);
            store.refreshState();

            expect(component.step).toBe(1);
        });

        it('should NOT overwrite an already-set step for FMS_NO_INFO when the type is unchanged', () => {
            component.step = 4;
            component.startTripData = { type: StartTripTypes.FMS_NO_INFO } as any;

            store.overrideSelector(startTripSelector, { type: StartTripTypes.FMS_NO_INFO } as any);
            store.refreshState();

            expect(component.step).toBe(4);
        });

        it('should leave step untouched for mismatch types when step is falsy and msgID does not match retain cases', () => {
            component.step = 0;
            component.startTripData = { type: undefined } as any;

            store.overrideSelector(startTripSelector, { type: StartTripTypes.FMS_TRIP_INFO_MISMATCH } as any);
            store.refreshState();

            expect(component.step).toBe(0);
        });

        it('should dispatch updateStartTrip and reset input state on successful submit-service response', () => {
            component.inputValue = '5';
            component.step = 0;
            component.startTripData = { type: undefined } as any;

            store.overrideSelector(startTripSelector, {
                status: ResponseStatus.SUCCESS,
                msgID: MsgID.START_TRIP_SUBMIT_SERVICE,
                dir: 1,
                variantName: 'V1',
            } as any);
            store.refreshState();

            expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({
                        fare: jasmine.objectContaining({
                            serviceNumber: 5,
                            dir: 1,
                            variantName: 'V1',
                        }),
                    }),
                }),
            );
            expect(component.inputValue).toBe('');
            expect(component.step).toBe(1);
            expect(component.manualServiceIdError).toBeFalse();
            expect(component.currentValueChange).toBe('');
        });

        it('should select the matching service when services contains one matching the current fare', () => {
            store.overrideSelector(startTripSelector, {
                services: [{ serviceNumber: 10, dir: 1, variantName: 'A' }],
                fare: { serviceNumber: 10, variantName: 'A' },
            } as any);
            store.refreshState();

            expect(component.selectedService).toEqual({ serviceNumber: 10, dir: 1, variantName: 'A' });
        });

        it('should reset selectedService to {} when no service matches the current fare', () => {
            store.overrideSelector(startTripSelector, {
                services: [{ serviceNumber: 99, dir: 1, variantName: 'X' }],
                fare: { serviceNumber: 1, variantName: 'Y' },
            } as any);
            store.refreshState();

            expect(component.selectedService).toEqual({});
        });

        // ---------------- handleRetainMessages (invoked via subscription) ----------------

        it('retain: should dispatch FMS_BUS_STOP_MISMATCH and set step 1 for GET_FARE_TRIP_DETAILS when step is 0', () => {
            component.step = 0;
            component.startTripData = { type: undefined } as any;

            store.overrideSelector(startTripSelector, {
                msgID: MsgID.START_TRIP_GET_FARE_TRIP_DETAILS,
            } as any);
            store.refreshState();

            expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ type: StartTripTypes.FMS_BUS_STOP_MISMATCH }),
                    msgID: MsgID.START_TRIP_GET_FARE_TRIP_DETAILS,
                }),
            );
            expect(component.step).toBe(1);
        });

        it('retain: should dispatch FMS_NO_INFO, set step 2 and currentValueChange "busStop" for BUS_STOP_LIST', () => {
            component.step = 0;
            component.startTripData = { type: undefined } as any;

            store.overrideSelector(startTripSelector, {
                msgID: MsgID.START_TRIP_BUS_STOP_LIST,
            } as any);
            store.refreshState();

            expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ type: StartTripTypes.FMS_NO_INFO }),
                    msgID: MsgID.START_TRIP_BUS_STOP_LIST,
                }),
            );
            expect(component.step).toBe(2);
            expect(component.currentValueChange).toBe('busStop');
        });

        it('retain: should set currentValueChange "service" for GET_SERVICE_LIST', () => {
            component.step = 0;
            component.startTripData = { type: undefined } as any;

            store.overrideSelector(startTripSelector, {
                msgID: MsgID.START_TRIP_GET_SERVICE_LIST,
            } as any);
            store.refreshState();

            expect(component.step).toBe(2);
            expect(component.currentValueChange).toBe('service');
        });

        it('retain: should set currentValueChange "service" for SUBMIT_SERVICE without a SUCCESS status', () => {
            component.step = 0;
            component.startTripData = { type: undefined } as any;

            store.overrideSelector(startTripSelector, {
                msgID: MsgID.START_TRIP_SUBMIT_SERVICE,
                status: ResponseStatus.ERROR,
            } as any);
            store.refreshState();

            expect(component.step).toBe(2);
            expect(component.currentValueChange).toBe('service');
        });

        it('retain: should do nothing when step is already truthy', () => {
            component.step = 1;
            component.startTripData = { type: StartTripTypes.FMS_VALID_INFO } as any;
            (TestBed.inject(NgrxMockStore).dispatch as jasmine.Spy).calls.reset();

            store.overrideSelector(startTripSelector, {
                type: StartTripTypes.FMS_VALID_INFO,
                msgID: MsgID.START_TRIP_BUS_STOP_LIST,
            } as any);
            store.refreshState();

            expect(component.step).toBe(1);
        });
    });

    // ------------------------------------------------------------------
    // handleChange
    // ------------------------------------------------------------------
    describe('handleChange', () => {
        it('should return early for busStop when no serviceNumber is set', () => {
            component.topics = { mainTab: { get: 'test' } };
            component.startTripData = { fare: {} } as any;
            component.step = 1;

            component.handleChange('busStop');

            expect(component.currentValueChange).toBe('busStop');
            expect(component.step).toBe(1);
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should fetch the bus stop list when a serviceNumber is set', () => {
            component.topics = { mainTab: { get: 'test' } };
            component.startTripData = { fare: { serviceNumber: 5 } } as any;

            component.handleChange('busStop');

            expect(component.step).toBe(2);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.START_TRIP_BUS_STOP_LIST }),
            );
        });

        it('should fetch the service list for any other type', () => {
            component.topics = { mainTab: { get: 'test' } };

            component.handleChange('service');

            expect(component.step).toBe(2);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.START_TRIP_GET_SERVICE_LIST }),
            );
        });
    });

    // ------------------------------------------------------------------
    // bus stop / service selection
    // ------------------------------------------------------------------
    it('handleSelectBusStop should set selectedBusStop', () => {
        component.handleSelectBusStop('busstop-1');
        expect(component.selectedBusStop).toBe('busstop-1');
    });

    it('handleUpdateBusStop should dispatch payload and navigate to step 1', () => {
        component.services = [{ serviceNumber: 1, dir: 1, variantName: 'A' }];
        component.busStops = [{ Busid: 'b1', Name: 'Stop 1' }];
        component.selectedService = { serviceNumber: 1, dir: 1, variantName: 'A' };
        component.selectedBusStop = 'b1';
        component.startTripData = { fare: {} } as any;

        component.handleUpdateBusStop();

        expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: jasmine.objectContaining({
                    fare: jasmine.objectContaining({
                        busStop: { Busid: 'b1', Name: 'Stop 1' },
                        serviceNumber: 1,
                        dir: 1,
                        variantName: 'A',
                        serviceIndex: 0,
                    }),
                }),
            }),
        );
        expect(component.step).toBe(1);
    });

    it('handleUpdateBusStop should fall back to startTripData.fare fields when selectedService fields are falsy', () => {
        component.services = [];
        component.busStops = [{ Busid: 'b2', Name: 'Stop 2' }];
        component.selectedService = { serviceNumber: undefined, dir: undefined, variantName: undefined };
        component.selectedBusStop = 'b2';
        component.startTripData = { fare: { serviceNumber: 42, dir: 2, variantName: 'FALLBACK' } } as any;

        component.handleUpdateBusStop();

        expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: jasmine.objectContaining({
                    fare: jasmine.objectContaining({
                        serviceNumber: 42,
                        dir: 2,
                        variantName: 'FALLBACK',
                    }),
                }),
            }),
        );
    });

    it('handleSelectService should set selectedService', () => {
        const svc = { serviceNumber: 2, dir: 1, variantName: 'B' };
        component.handleSelectService(svc);
        expect(component.selectedService).toBe(svc);
    });

    describe('handleUpdateService', () => {
        it('should return early when selectedService is falsy', () => {
            component.selectedService = null as any;
            (TestBed.inject(NgrxMockStore).dispatch as jasmine.Spy).calls.reset();

            component.handleUpdateService();

            expect(TestBed.inject(NgrxMockStore).dispatch).not.toHaveBeenCalled();
        });

        it('should dispatch a reset fare payload when the selected service differs from the current fare', () => {
            component.services = [{ serviceNumber: 3, dir: 1, variantName: 'C' }];
            component.selectedService = { serviceNumber: 3, dir: 1, variantName: 'C' };
            component.startTripData = { fare: { serviceNumber: 1, variantName: 'Z' } } as any;
            component.selectedBusStop = 'previously-set';

            component.handleUpdateService();

            expect(component.selectedBusStop).toBeUndefined();
            expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({
                        busStopList: [],
                        fare: jasmine.objectContaining({
                            busStop: undefined,
                            serviceNumber: 3,
                            dir: 1,
                            variantName: 'C',
                            serviceIndex: 0,
                        }),
                    }),
                }),
            );
            expect(component.step).toBe(1);
        });

        it('should skip the reset dispatch when the selected service matches the current fare, but still navigate to step 1', () => {
            component.services = [{ serviceNumber: 3, dir: 1, variantName: 'C' }];
            component.selectedService = { serviceNumber: 3, dir: 1, variantName: 'C' };
            component.startTripData = { fare: { serviceNumber: 3, variantName: 'C' } } as any;
            component.step = 0;
            (TestBed.inject(NgrxMockStore).dispatch as jasmine.Spy).calls.reset();

            component.handleUpdateService();

            expect(component.step).toBe(1);
        });
    });

    it('handleConfirmService should not throw for true or false', () => {
        expect(() => component.handleConfirmService(true)).not.toThrow();
        expect(() => component.handleConfirmService(false)).not.toThrow();
    });

    it('handleChangeBusStop should set selectedBusStop', () => {
        component.handleChangeBusStop('new-stop');
        expect(component.selectedBusStop).toBe('new-stop');
    });

    it('handleConfirmBusStop should not throw for true or false', () => {
        expect(() => component.handleConfirmBusStop(true)).not.toThrow();
        expect(() => component.handleConfirmBusStop(false)).not.toThrow();
    });

    it('handleDisplayManuallyInputPopUp should set step to 3', () => {
        component.handleDisplayManuallyInputPopUp();
        expect(component.step).toBe(3);
    });

    // ------------------------------------------------------------------
    // handleSearchService / getDisplayServices
    // ------------------------------------------------------------------
    describe('handleSearchService', () => {
        it('should return early and reset state when value is empty', () => {
            component.isShowKeyboard = true;
            component.selectedService = { serviceNumber: 1 };

            component.handleSearchService('');

            expect(component.isShowKeyboard).toBeFalse();
            expect(component.selectedService).toEqual({});
        });

        it('should look up display services when value is provided', () => {
            component.services = [{ serviceNumber: 123, dir: 0, variantName: 'A' }];
            component.inputValue = '12';

            component.handleSearchService('12');

            const result = component.getDisplayServices();
            expect(result).toEqual([{ serviceNumber: 123, dir: 0, variantName: 'A' }]);
        });
    });

    it('getDisplayServices should filter services by the current inputValue prefix', () => {
        component.services = [
            { serviceNumber: 123, dir: 0, variantName: 'A' },
            { serviceNumber: 456, dir: 0, variantName: 'B' },
        ];
        component.inputValue = '4';

        expect(component.getDisplayServices()).toEqual([{ serviceNumber: 456, dir: 0, variantName: 'B' }]);
    });

    // ------------------------------------------------------------------
    // handleChangeInput
    // ------------------------------------------------------------------
    describe('handleChangeInput', () => {
        let inputField: HTMLInputElement;

        beforeEach(() => {
            // Defensively remove any stale #inputField left by another spec file's fixture.
            document.getElementById('inputField')?.remove();
            inputField = document.createElement('input');
            inputField.id = 'inputField';
            document.body.appendChild(inputField);
        });

        afterEach(() => {
            if (inputField.parentNode) {
                document.body.removeChild(inputField);
            }
        });

        function setSelection(value: string, start: number, end: number) {
            inputField.value = value;
            inputField.focus();
            inputField.setSelectionRange(start, end);
        }

        it('should delete the character before the cursor on backspace with no selection', () => {
            setSelection('1234', 2, 2);
            const target = document.createElement('div');
            target.id = 'backspaceKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(inputField.value).toBe('134');
        });

        it('should delete the selected text on backspace with a selection', () => {
            setSelection('1234', 1, 3);
            const target = document.createElement('div');
            target.id = 'backspaceKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(inputField.value).toBe('14');
        });

        it('should insert a digit at the cursor position for a non-special key', () => {
            setSelection('12', 1, 1);
            const target = document.createElement('div');
            target.innerText = '9';

            component.handleChangeInput({ target } as unknown as Event);

            expect(inputField.value).toBe('192');
        });

        it('should return early on enterKey when the field is empty', () => {
            setSelection('', 0, 0);
            component.isShowKeyboard = true;
            const target = document.createElement('div');
            target.id = 'enterKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(component.isShowKeyboard).toBeFalse();
            expect(component.selectedService).toEqual({});
        });

        it('should set inputValue and search on enterKey with a value', () => {
            setSelection('123', 3, 3);
            component.services = [{ serviceNumber: 123, dir: 0, variantName: 'A' }];
            const target = document.createElement('div');
            target.id = 'enterKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(component.inputValue).toBe('123');
        });
    });

    // ------------------------------------------------------------------
    // handleSettingFareDetails / handleCancelSettingFareDetails
    // ------------------------------------------------------------------
    it('handleSettingFareDetails should publish GET_FARE_TRIP_DETAILS and navigate to step 1', () => {
        component.topics = { mainTab: { get: 'test' } };
        component.step = 0;

        component.handleSettingFareDetails();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.START_TRIP_GET_FARE_TRIP_DETAILS }),
        );
        expect(component.step).toBe(1);
    });

    it('handleCancelSettingFareDetails should reset step, fare, selectedBusStop and selectedService', () => {
        component.step = 2;
        component.selectedBusStop = 'some-stop';
        component.selectedService = { serviceNumber: 1 };
        component.startTripData = { fare: { serviceNumber: 9 } } as any;

        component.handleCancelSettingFareDetails();

        expect(component.step).toBe(0);
        expect(component.selectedBusStop).toBeUndefined();
        expect(component.selectedService).toEqual({});
        expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
            jasmine.objectContaining({ payload: jasmine.objectContaining({ fare: {} }) }),
        );
    });

    // ------------------------------------------------------------------
    // handleConfirmStartTrip
    // ------------------------------------------------------------------
    describe('handleConfirmStartTrip', () => {
        it('should use fms fields for FMS_VALID_INFO', () => {
            component.topics = { mainTab: { get: 'test' } };
            component.startTripData = {
                type: StartTripTypes.FMS_VALID_INFO,
                fms: { serviceNumber: 7, dir: 1, busStop: { Busid: 'fms-1', Name: 'FMS Stop' } },
            } as any;

            component.handleConfirmStartTrip();

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.START_TRIP_SUBMIT_FARE_TRIP,
                    payload: jasmine.objectContaining({
                        type: StartTripTypes.FMS_VALID_INFO,
                        serviceNumber: 7,
                        dir: 1,
                        busStopId: 'fms-1',
                    }),
                }),
            );
        });

        it('should use fare fields for FMS_NO_INFO / mismatch types', () => {
            component.topics = { mainTab: { get: 'test' } };
            component.startTripData = {
                type: StartTripTypes.FMS_NO_INFO,
                fare: {
                    serviceNumber: 8,
                    dir: 0,
                    busStop: { Busid: 'fare-1', Name: 'Fare Stop' },
                    serviceIndex: 2,
                },
            } as any;

            component.handleConfirmStartTrip();

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({
                        type: StartTripTypes.FMS_NO_INFO,
                        serviceNumber: 8,
                        dir: 0,
                        busStopId: 'fare-1',
                        serviceIndex: 2,
                    }),
                }),
            );
        });

        it('should publish only the type when startTripData.type is undefined', () => {
            component.topics = { mainTab: { get: 'test' } };
            component.startTripData = { type: undefined } as any;

            component.handleConfirmStartTrip();

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: { type: undefined },
                }),
            );
        });
    });

    // ------------------------------------------------------------------
    // document click handling (private _handleOnDocumentClick, invoked via ngOnInit)
    // ------------------------------------------------------------------
    describe('document click handling', () => {
        it('should open the keyboard when clicking the input field', () => {
            const el = document.createElement('div');
            el.id = 'inputField';
            document.body.appendChild(el);

            el.click();

            expect(component.isShowKeyboard).toBeTrue();
            document.body.removeChild(el);
        });

        it('should close the keyboard when clicking outside the numeric keyboard', () => {
            component.isShowKeyboard = true;
            const el = document.createElement('div');
            document.body.appendChild(el);

            el.click();

            expect(component.isShowKeyboard).toBeFalse();
            document.body.removeChild(el);
        });

        it('should keep the keyboard open when clicking inside the numeric keyboard', () => {
            component.isShowKeyboard = true;
            const parent = document.createElement('div');
            parent.className = 'numeric-keyboard-container';
            const child = document.createElement('span');
            parent.appendChild(child);
            document.body.appendChild(parent);

            child.click();

            expect(component.isShowKeyboard).toBeTrue();
            document.body.removeChild(parent);
        });
    });

    // ------------------------------------------------------------------
    // handleButtonSound / ngOnDestroy
    // ------------------------------------------------------------------
    it('handleButtonSound should call soundService.playButton', () => {
        const soundService = TestBed.inject(SoundService) as any;
        component.handleButtonSound();
        expect(soundService.playButton).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe topics and dispatch a reset payload', () => {
        (component as any).mqttSubscriptions = [{ topic: 't1', topicKey: 'k1' }];

        expect(() => component.ngOnDestroy()).not.toThrow();

        expect(mockMqttService.unsubscribe).toHaveBeenCalledWith('t1', 'k1');
        expect(TestBed.inject(NgrxMockStore).dispatch).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: jasmine.objectContaining({ fare: {}, fms: {}, type: undefined }),
            }),
        );
    });
});
