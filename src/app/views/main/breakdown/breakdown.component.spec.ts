import { provideMockStore, MockStore as NgrxMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BreakdownComponent } from './breakdown.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { LocalStorageService } from '@services/local-storage.service';
import { breakDownInfo as breakDownInfoSelector } from '@store/main/main.reducer';
import { MsgID, MsgSubID, ResponseStatus } from '@models';
import { routerUrls } from '@app/app.routes';

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);
    mqttConfig = { topics: { mainTab: { get: 'test-topic' } } };
    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('BreakdownComponent', () => {
    let component: BreakdownComponent;
    let fixture: ComponentFixture<BreakdownComponent>;
    let mockMqttService: MockMqttService;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        routerMock.navigate.and.returnValue(Promise.resolve(true));

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BreakdownComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BreakdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        (TestBed.inject(Store) as NgrxMockStore).resetSelectors();
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

    it('should navigate to bus operation url when navigateToBusOperation is called', () => {
        component.navigateToBusOperation();
        expect(routerMock.navigate).toHaveBeenCalled();
    });

    // ------------------------------------------------------------------
    // ngOnInit subscription branches
    // ------------------------------------------------------------------
    describe('ngOnInit subscriptions', () => {
        it('should set topics when mqtt config is loaded', () => {
            mockMqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };
            component.ngOnInit();
            expect(component.topics).toEqual({ mainTab: { get: 'topic/get' } });
        });

        it('should not set topics when mqtt config is not loaded', () => {
            mockMqttService.mqttConfigLoaded$ = of(false);
            component.topics = undefined;
            component.ngOnInit();
            expect(component.topics).toBeUndefined();
        });

        it('should set selectedFirstBusStop/selectedLastBusStop only when not already set', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(breakDownInfoSelector, {
                service: 1,
                direction: 'in',
                firstBusStop: { Busid: 'first-1' },
                lastBusStop: { Busid: 'last-1' },
                busStopList: [],
                reasonList: [],
            } as any);

            component.selectedFirstBusStop = undefined;
            component.selectedLastBusStop = undefined;
            component.ngOnInit();

            expect(component.selectedFirstBusStop).toEqual({ Busid: 'first-1' });
            expect(component.selectedLastBusStop).toEqual({ Busid: 'last-1' });
        });

        it('should not overwrite already selected first/last bus stop', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(breakDownInfoSelector, {
                service: 1,
                direction: 'in',
                firstBusStop: { Busid: 'first-1' },
                lastBusStop: { Busid: 'last-1' },
                busStopList: [],
                reasonList: [],
            } as any);

            component.selectedFirstBusStop = { Busid: 'existing-first' };
            component.selectedLastBusStop = { Busid: 'existing-last' };
            component.ngOnInit();

            expect(component.selectedFirstBusStop).toEqual({ Busid: 'existing-first' });
            expect(component.selectedLastBusStop).toEqual({ Busid: 'existing-last' });
        });

        it('should dispatch MAIN_BREAKDOWN and reset step on successful bus stop change', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
            component.selectedLastBusStop = { Busid: 'new-last' };
            component.step = 5;

            store.overrideSelector(breakDownInfoSelector, {
                msgID: MsgID.BREAKDOWN_CHANGE_BUS_STOP,
                status: ResponseStatus.SUCCESS,
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
            } as any);

            component.ngOnInit();

            expect(component.step).toBe(0);
            expect(dispatchSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({
                        lastBusStop: { Busid: 'new-last' },
                        msgID: MsgID.MAIN_BREAKDOWN,
                    }),
                }),
            );
        });

        it('should not dispatch MAIN_BREAKDOWN update when bus stop change is not SUCCESS', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

            store.overrideSelector(breakDownInfoSelector, {
                msgID: MsgID.BREAKDOWN_CHANGE_BUS_STOP,
                status: ResponseStatus.ERROR,
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
            } as any);

            component.ngOnInit();

            expect(dispatchSpy).not.toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ msgID: MsgID.MAIN_BREAKDOWN }),
                }),
            );
        });

        it('should dispatch on back button with previousPage and SUCCESS status', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
            component.previousPage = 42;

            store.overrideSelector(breakDownInfoSelector, {
                msgID: MsgID.BREAKDOWN_BACK_BUTTON,
                status: ResponseStatus.SUCCESS,
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
            } as any);

            component.ngOnInit();

            expect(dispatchSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ msgID: 42, status: ResponseStatus.SUCCESS }),
                }),
            );
        });

        it('should not dispatch back button update when status is not SUCCESS', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

            store.overrideSelector(breakDownInfoSelector, {
                msgID: MsgID.BREAKDOWN_BACK_BUTTON,
                status: ResponseStatus.ERROR,
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
            } as any);

            component.ngOnInit();

            expect(dispatchSpy).not.toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ msgID: 42 }),
                }),
            );
        });

        it('should set a timeout and publish TIMEOUT_MESSAGE + navigate when it fires', fakeAsync(() => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            mockMqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };

            store.overrideSelector(breakDownInfoSelector, {
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
                timeout: 1000,
            } as any);

            component.ngOnInit();
            tick(1000);

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.TIMEOUT_MESSAGE,
                    msgSubID: MsgSubID.NOTIFY,
                    payload: { msgID: MsgID.MAIN_BREAKDOWN },
                }),
            );
            expect(routerMock.navigate).toHaveBeenCalledWith([routerUrls?.private?.main?.busStopInformation]);
        }));

        it('should not set a timeout when data.timeout is not > 0', fakeAsync(() => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(breakDownInfoSelector, {
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
                timeout: 0,
            } as any);

            component.ngOnInit();
            tick(5000);

            expect(routerMock.navigate).not.toHaveBeenCalledWith([routerUrls?.private?.main?.busStopInformation]);
        }));

        it('should clear disableActions when receiving BREAKDOWN_SUBMIT_COMP_TICKET response', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            component.disableActions = true;

            store.overrideSelector(breakDownInfoSelector, {
                msgID: MsgID.BREAKDOWN_SUBMIT_COMP_TICKET,
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
            } as any);

            component.ngOnInit();

            expect(component.disableActions).toBeFalse();
        });

        it('should clear disableActions when receiving BREAKDOWN_SUBMIT_BREAKDOWN_TICKET response', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            component.disableActions = true;

            store.overrideSelector(breakDownInfoSelector, {
                msgID: MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
            } as any);

            component.ngOnInit();

            expect(component.disableActions).toBeFalse();
        });

        it('should not touch disableActions for unrelated msgID', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            component.disableActions = true;

            store.overrideSelector(breakDownInfoSelector, {
                msgID: 999,
                service: 1,
                direction: 'in',
                firstBusStop: {},
                lastBusStop: {},
                busStopList: [],
                reasonList: [],
            } as any);

            component.ngOnInit();

            expect(component.disableActions).toBeTrue();
        });
    });

    // ------------------------------------------------------------------
    // handleSaveStateToLocalStorage
    // ------------------------------------------------------------------
    describe('handleSaveStateToLocalStorage', () => {
        it('should save reasons to local storage when msgID is BREAKDOWN_SUBMIT and reasonList has entries', () => {
            const localStorageService = TestBed.inject(LocalStorageService);
            const setItemSpy = spyOn(localStorageService, 'setItem');
            component.breakDownInfoData = {
                msgID: MsgID.BREAKDOWN_SUBMIT,
                reasonList: [{ id: 1, label: 'Reason 1' }],
            } as any;

            component.handleSaveStateToLocalStorage();

            expect(setItemSpy).toHaveBeenCalledWith('reasons', JSON.stringify([{ id: 1, label: 'Reason 1' }]));
        });

        it('should not save to local storage when reasonList is empty', () => {
            const localStorageService = TestBed.inject(LocalStorageService);
            const setItemSpy = spyOn(localStorageService, 'setItem');
            component.breakDownInfoData = {
                msgID: MsgID.BREAKDOWN_SUBMIT,
                reasonList: [],
            } as any;

            component.handleSaveStateToLocalStorage();

            expect(setItemSpy).not.toHaveBeenCalled();
        });

        it('should not save to local storage when msgID is not BREAKDOWN_SUBMIT', () => {
            const localStorageService = TestBed.inject(LocalStorageService);
            const setItemSpy = spyOn(localStorageService, 'setItem');
            component.breakDownInfoData = {
                msgID: 999,
                reasonList: [{ id: 1, label: 'Reason 1' }],
            } as any;

            component.handleSaveStateToLocalStorage();

            expect(setItemSpy).not.toHaveBeenCalled();
        });
    });

    // ------------------------------------------------------------------
    // setCurrentScreen
    // ------------------------------------------------------------------
    describe('setCurrentScreen', () => {
        it('should return early and keep current screen when status is ERROR', () => {
            component.screen = 'DETAIL';
            component.breakDownInfoData = { msgID: MsgID.BREAKDOWN_SUBMIT, status: ResponseStatus.ERROR } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('DETAIL');
        });

        it('should set screen to REASON for BREAKDOWN_SUBMIT', () => {
            component.breakDownInfoData = { msgID: MsgID.BREAKDOWN_SUBMIT, service: 1 } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('REASON');
        });

        it('should set screen to COMPLIMENTARY_TICKET for BREAKDOWN_SUBMIT_REASON', () => {
            component.breakDownInfoData = { msgID: MsgID.BREAKDOWN_SUBMIT_REASON, service: 1 } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('COMPLIMENTARY_TICKET');
        });

        it('should set screen to COMPLIMENTARY_TICKET for BREAKDOWN_SUBMIT_COMP_TICKET', () => {
            component.breakDownInfoData = { msgID: MsgID.BREAKDOWN_SUBMIT_COMP_TICKET, service: 1 } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('COMPLIMENTARY_TICKET');
        });

        it('should set screen to BREAKDOWN_TICKET for BREAKDOWN_PROCESS_COMP_TICKET', () => {
            component.breakDownInfoData = { msgID: MsgID.BREAKDOWN_PROCESS_COMP_TICKET, service: 1 } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('BREAKDOWN_TICKET');
        });

        it('should set screen to BREAKDOWN_TICKET for BREAKDOWN_SUBMIT_BREAKDOWN_TICKET', () => {
            component.breakDownInfoData = { msgID: MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET, service: 1 } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('BREAKDOWN_TICKET');
        });

        it('should set screen to BREAKDOWN_TICKET for BREAKDOWN_PROCESS_BREAKDOWN_TICKET', () => {
            component.breakDownInfoData = { msgID: MsgID.BREAKDOWN_PROCESS_BREAKDOWN_TICKET, service: 1 } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('BREAKDOWN_TICKET');
        });

        it('should default to DETAIL for any other msgID', () => {
            component.breakDownInfoData = { msgID: 999, service: 1 } as any;

            component.setCurrentScreen();

            expect(component.screen).toBe('DETAIL');
        });

        it('should fall back to an empty object when breakDownInfoData is undefined, defaulting screen to DETAIL', () => {
            // handleRetainMessages dereferences breakDownInfoData.service directly, so stub it out
            // to isolate and exercise the `data || {}` fallback destructuring on its own.
            spyOn(component, 'handleRetainMessages');
            component.breakDownInfoData = undefined as any;

            expect(() => component.setCurrentScreen()).not.toThrow();
            expect(component.screen).toBe('DETAIL');
        });
    });

    // ------------------------------------------------------------------
    // handleRetainMessages
    // ------------------------------------------------------------------
    describe('handleRetainMessages', () => {
        it('should publish MAIN_BUTTON BREAKDOWN when service is falsy and topics exist', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            component.breakDownInfoData = { service: 0 } as any;

            component.handleRetainMessages();

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.MAIN_BUTTON,
                    msgSubID: MsgSubID.REQUEST,
                    payload: { btn: 'BREAKDOWN' },
                }),
            );
        });

        it('should not publish MAIN_BUTTON when service is truthy', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            component.breakDownInfoData = { service: 1 } as any;
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleRetainMessages();

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_BUTTON }),
            );
        });

        it('should not publish MAIN_BUTTON when topics are not yet available', () => {
            component.topics = undefined;
            component.breakDownInfoData = { service: 0 } as any;
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleRetainMessages();

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_BUTTON }),
            );
        });

        it('should dispatch reasonList from local storage when BREAKDOWN_SUBMIT has no reasons yet', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
            const localStorageService = TestBed.inject(LocalStorageService);
            spyOn(localStorageService, 'getItem').and.returnValue(JSON.stringify([{ id: 1, label: 'r' }]));

            component.topics = undefined;
            component.breakDownInfoData = { service: 1, msgID: MsgID.BREAKDOWN_SUBMIT, reasonList: [] } as any;

            component.handleRetainMessages();

            expect(dispatchSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.BREAKDOWN_SUBMIT,
                    payload: jasmine.objectContaining({ reasonList: [{ id: 1, label: 'r' }] }),
                }),
            );
        });

        it('should not dispatch when local storage has no reasons', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
            const localStorageService = TestBed.inject(LocalStorageService);
            spyOn(localStorageService, 'getItem').and.returnValue(null);

            component.topics = undefined;
            component.breakDownInfoData = { service: 1, msgID: MsgID.BREAKDOWN_SUBMIT, reasonList: [] } as any;

            component.handleRetainMessages();

            expect(dispatchSpy).not.toHaveBeenCalled();
        });

        it('should not look up reasons when reasonList already has entries', () => {
            const localStorageService = TestBed.inject(LocalStorageService);
            const getItemSpy = spyOn(localStorageService, 'getItem');

            component.topics = undefined;
            component.breakDownInfoData = {
                service: 1,
                msgID: MsgID.BREAKDOWN_SUBMIT,
                reasonList: [{ id: 1, label: 'r' }],
            } as any;

            component.handleRetainMessages();

            expect(getItemSpy).not.toHaveBeenCalled();
        });

        it('should not look up reasons when msgID is not BREAKDOWN_SUBMIT', () => {
            const localStorageService = TestBed.inject(LocalStorageService);
            const getItemSpy = spyOn(localStorageService, 'getItem');

            component.topics = undefined;
            component.breakDownInfoData = { service: 1, msgID: 999, reasonList: [] } as any;

            component.handleRetainMessages();

            expect(getItemSpy).not.toHaveBeenCalled();
        });
    });

    // ------------------------------------------------------------------
    // goBackAndReset / removeTimeout
    // ------------------------------------------------------------------
    it('goBackAndReset should reset breakdown info and set step', () => {
        const store: NgrxMockStore = TestBed.inject(Store) as any;
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

        component.goBackAndReset(3);

        expect(component.step).toBe(3);
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('removeTimeout should dispatch timeout undefined and clear the timer', () => {
        const store: NgrxMockStore = TestBed.inject(Store) as any;
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
        component.breakDownInfoData = { service: 1, timeout: 5000 } as any;

        component.removeTimeout();

        expect(dispatchSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({ payload: jasmine.objectContaining({ timeout: undefined }) }),
        );
    });

    // ------------------------------------------------------------------
    // handleChangeEndBusStop / handleSelectBusStop / handleUpdateBusStop
    // ------------------------------------------------------------------
    it('handleChangeEndBusStop should remove timeout, set step to 1 and publish bus stop list request', () => {
        component.topics = { mainTab: { get: 'test-topic' } };
        component.step = 0;

        component.handleChangeEndBusStop();

        expect(component.step).toBe(1);
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.BREAKDOWN_BUS_STOP_LIST }),
        );
    });

    describe('handleSelectBusStop', () => {
        it('should select the matching bus stop from busStopList', () => {
            component.breakDownInfoData = {
                busStopList: [
                    { Busid: 'a', Name: 'Stop A' },
                    { Busid: 'b', Name: 'Stop B' },
                ],
            } as any;

            component.handleSelectBusStop('b');

            expect(component.selectedLastBusStop).toEqual({ Busid: 'b', Name: 'Stop B' });
        });

        it('should set undefined when no bus stop matches', () => {
            component.breakDownInfoData = {
                busStopList: [{ Busid: 'a', Name: 'Stop A' }],
            } as any;

            component.handleSelectBusStop('zzz');

            expect(component.selectedLastBusStop).toBeUndefined();
        });
    });

    it('handleUpdateBusStop should publish selected last bus stop Busid', () => {
        component.topics = { mainTab: { get: 'test-topic' } };
        component.selectedLastBusStop = { Busid: 'last-stop-id' };

        component.handleUpdateBusStop();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.BREAKDOWN_CHANGE_BUS_STOP,
                payload: { busStopId: 'last-stop-id' },
            }),
        );
    });

    it('handleCancelBreakdown should remove timeout and publish BREAKDOWN_CANCEL', () => {
        component.topics = { mainTab: { get: 'test-topic' } };

        component.handleCancelBreakdown();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.BREAKDOWN_CANCEL }),
        );
    });

    it('handleConfirmBreakdown should remove timeout and publish BREAKDOWN_SUBMIT with details', () => {
        component.topics = { mainTab: { get: 'test-topic' } };
        component.breakDownInfoData = {
            service: 7,
            direction: 'out',
            firstBusStop: { Busid: 'f1' },
            lastBusStop: { Busid: 'l1' },
            variantName: 'variant-x',
        } as any;

        component.handleConfirmBreakdown();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.BREAKDOWN_SUBMIT,
                payload: {
                    service: 7,
                    direction: 'out',
                    firstBusStop: 'f1',
                    lastBusStop: 'l1',
                    variantName: 'variant-x',
                },
            }),
        );
    });

    it('backToInformation should reset step to 0', () => {
        component.step = 5;
        component.backToInformation();
        expect(component.step).toBe(0);
    });

    it('handleSelectReason should set the reason', () => {
        component.handleSelectReason(3);
        expect(component.reason).toBe(3);
    });

    describe('handleConfirmReason', () => {
        it('should return early when reason is falsy', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            component.reason = 0;
            mockMqttService.publishWithMessageFormat.calls.reset();

            component.handleConfirmReason();

            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should publish BREAKDOWN_SUBMIT_REASON when reason is set', () => {
            component.topics = { mainTab: { get: 'test-topic' } };
            component.reason = 2;

            component.handleConfirmReason();

            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.BREAKDOWN_SUBMIT_REASON,
                    payload: { reason: 2 },
                }),
            );
        });
    });

    it('selectNumOfComplimentaryTicket should set state and publish', () => {
        component.topics = { mainTab: { get: 'test-topic' } };

        component.selectNumOfComplimentaryTicket(4);

        expect(component.numOfComplimentaryTickets).toBe(4);
        expect(component.disableActions).toBeTrue();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.BREAKDOWN_SUBMIT_COMP_TICKET,
                payload: { numOfCompTickets: 4 },
            }),
        );
    });

    it('printComplimentaryTicket should publish BREAKDOWN_PROCESS_COMP_TICKET', () => {
        component.topics = { mainTab: { get: 'test-topic' } };

        component.printComplimentaryTicket();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.BREAKDOWN_PROCESS_COMP_TICKET }),
        );
    });

    it('selectNumOfBreakdownTicket should set state and publish', () => {
        component.topics = { mainTab: { get: 'test-topic' } };

        component.selectNumOfBreakdownTicket(6);

        expect(component.numOfBreakdownTickets).toBe(6);
        expect(component.disableActions).toBeTrue();
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
                payload: { numOfBreakdownTickets: 6 },
            }),
        );
    });

    it('printBreakdownTicket should publish BREAKDOWN_PROCESS_BREAKDOWN_TICKET', () => {
        component.topics = { mainTab: { get: 'test-topic' } };

        component.printBreakdownTicket();

        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.BREAKDOWN_PROCESS_BREAKDOWN_TICKET }),
        );
    });

    it('handleBackToPreviousPage should reset ticket counters and publish destination', () => {
        component.topics = { mainTab: { get: 'test-topic' } };
        component.numOfComplimentaryTickets = 3;
        component.numOfBreakdownTickets = 5;

        component.handleBackToPreviousPage(MsgID.BREAKDOWN_SUBMIT);

        expect(component.previousPage).toBe(MsgID.BREAKDOWN_SUBMIT);
        expect(component.numOfComplimentaryTickets).toBe(0);
        expect(component.numOfBreakdownTickets).toBe(0);
        expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.BREAKDOWN_BACK_BUTTON,
                payload: { destination: MsgID.BREAKDOWN_SUBMIT },
            }),
        );
    });

    it('resetBreakdownInfo should dispatch a reset payload', () => {
        const store: NgrxMockStore = TestBed.inject(Store) as any;
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

        component.resetBreakdownInfo();

        expect(dispatchSpy).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: jasmine.objectContaining({
                    msgID: undefined,
                    status: 0,
                    direction: '',
                    service: 0,
                }),
            }),
        );
    });

    it('handleButtonSound should call soundService.playButton', () => {
        const soundService = TestBed.inject(SoundService);
        const playButtonSpy = spyOn(soundService, 'playButton');

        component.handleButtonSound();

        expect(playButtonSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should complete destroy$, reset breakdown info and clear timeout', () => {
        const store: NgrxMockStore = TestBed.inject(Store) as any;
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

        expect(() => component.ngOnDestroy()).not.toThrow();
        expect(dispatchSpy).toHaveBeenCalled();
    });
});
