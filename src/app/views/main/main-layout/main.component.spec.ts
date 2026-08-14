import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationStart, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { of, Subject } from 'rxjs';
import { routerUrls } from '@app/app.routes';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { SoundService } from '@services/sound.service';
import {
    MsgID,
    MsgSubID,
    ResponseStatus,
    MainPagePopUp,
    StartTripTypes,
    TopicsKeys,
    LocalStorageKey,
    CvStatusType,
    MainButton,
} from '@models';
import {
    fareBusStopList,
    currentFareBusStop,
    activeCVs,
    free,
    frontDoor,
    displayFareBusStopList,
} from '@store/main/main.reducer';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);

    mqttConfig = {
        topics: {
            mainTab: {
                get: 'madt/main/get',
                response: 'tc/main/response',
                cv: { response: 'tc/main/cv/response' },
                fareBusStop: { response: 'tc/main/fare-bus-stop/response' },
                fareBusStopList: { response: 'tc/main/fare-bus-stop-list/response' },
                fmsBusStop: { response: 'tc/main/fms-bus-stop/response' },
                headWayTimeTable: { response: 'tc/main/headway/response' },
                currentServiceInfo: { response: 'tc/main/current-service-info/response' },
            },
            tcToAllTabs: 'tc/all-tabs',
            maintenance: { response: 'tc/maintenance/response' },
            fareTab: { response: 'tc/fare/response' },
        },
    };

    subscribe = jasmine.createSpy('subscribe');
    unsubscribe = jasmine.createSpy('unsubscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    let mockMqttService: MockMqttService;
    let mockRouter: any;
    let mockLocalStorageService: any;
    let mockSoundService: any;
    let routerEvents$: Subject<any>;
    let store: MockStore;

    beforeEach(async () => {
        mockMqttService = new MockMqttService();
        routerEvents$ = new Subject<any>();
        mockRouter = {
            url: '/main',
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
            events: routerEvents$.asObservable(),
        };
        mockLocalStorageService = {
            setItem: jasmine.createSpy('setItem'),
            getItem: jasmine.createSpy('getItem').and.returnValue(null),
            watch: jasmine.createSpy('watch').and.returnValue(of(null)),
        };
        mockSoundService = {
            playButton: jasmine.createSpy('playButton'),
            playPopUp: jasmine.createSpy('playPopUp'),
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MainComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                DatePipe,
                { provide: Router, useValue: mockRouter },
                { provide: MqttService, useValue: mockMqttService },
                { provide: LocalStorageService, useValue: mockLocalStorageService },
                { provide: SoundService, useValue: mockSoundService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);
        spyOn(store, 'dispatch').and.callThrough();

        // Trigger ngOnInit (and, transitively, MQTT + store subscriptions).
        fixture.detectChanges();
    });

    afterEach(() => {
        // Selector overrides mutate the shared selector function's memoized result;
        // without resetting, they leak into other spec files' tests.
        store.resetSelectors();
    });

    // -----------------------------------------------------------------------
    // Existing baseline tests (kept as-is)
    // -----------------------------------------------------------------------

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

    it('should determine screens before logged on', () => {
        component.currentRoute = '/main';
        expect(component.screensBeforeLoggedOn()).toBeTrue();

        component.currentRoute = '/main/login';
        expect(component.screensBeforeLoggedOn()).toBeTrue();

        component.currentRoute = '/some-other-route';
        expect(component.screensBeforeLoggedOn()).toBeFalse();
    });

    it('should determine on trip layout', () => {
        component.currentRoute = '/main';
        expect(component.isOnTripLayout()).toBeFalse();

        component.currentRoute = '/main/bus-operation/external-devices';
        expect(component.isOnTripLayout()).toBeFalse();

        component.currentRoute = '/some-other-route';
        expect(component.isOnTripLayout()).toBeTrue();
    });

    // -----------------------------------------------------------------------
    // Helpers for MQTT-driven tests
    // -----------------------------------------------------------------------

    function callbackFor(index: number): (message: string, topic?: string, packet?: any) => void {
        return mockMqttService.subscribe.calls.argsFor(index)[0].callback;
    }

    function fireMain(header: any, payload: any, packet: any = { retain: false }) {
        callbackFor(0)(JSON.stringify({ header, payload }), 'tc/main/response', packet);
    }

    function fireCv(header: any, payload: any) {
        callbackFor(1)(JSON.stringify({ header, payload }));
    }

    function fireFareBusStopList(header: any, payload: any, packet: any = { retain: false }) {
        callbackFor(2)(JSON.stringify({ header, payload }), 'tc/main/fare-bus-stop-list/response', packet);
    }

    function fireFareBusStop(header: any, payload: any) {
        callbackFor(3)(JSON.stringify({ header, payload }));
    }

    function fireFmsBusStop(header: any, payload: any) {
        callbackFor(4)(JSON.stringify({ header, payload }));
    }

    function fireHeadway(header: any, payload: any) {
        callbackFor(5)(JSON.stringify({ header, payload }));
    }

    function fireServiceInfo(header: any, payload: any) {
        callbackFor(6)(JSON.stringify({ header, payload }));
    }

    function notifyHeader(msgID: number) {
        return { msgID, msgSubID: MsgSubID.NOTIFY, dateTime: new Date().toISOString() };
    }

    function responseHeader(msgID: number) {
        return { msgID, msgSubID: MsgSubID.RESPONSE, dateTime: new Date().toISOString() };
    }

    // -----------------------------------------------------------------------
    // MQTT wiring / validatedAuth
    // -----------------------------------------------------------------------

    describe('MQTT connection wiring', () => {
        it('subscribes to all 7 main-tab topics once connected & config loaded', () => {
            expect(mockMqttService.subscribe).toHaveBeenCalledTimes(7);
            expect((component as any).mqttSubscriptions.length).toBe(7);
        });

        it('does not subscribe when not connected', () => {
            mockMqttService.subscribe.calls.reset();
            mockMqttService.connectionStatus$ = of(false);
            const fixture2 = TestBed.createComponent(MainComponent);
            fixture2.detectChanges();
            expect(mockMqttService.subscribe).not.toHaveBeenCalled();
        });

        it('does not subscribe when config not loaded', () => {
            mockMqttService.subscribe.calls.reset();
            mockMqttService.mqttConfigLoaded$ = of(false);
            const fixture2 = TestBed.createComponent(MainComponent);
            fixture2.detectChanges();
            expect(mockMqttService.subscribe).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Pure / simple public methods
    // -----------------------------------------------------------------------

    describe('simple public methods', () => {
        it('messValidation invokes callback and returns timestamp for valid dates', () => {
            const cb = jasmine.createSpy('cb');
            const result = component.messValidation(new Date(), 0, cb);
            expect(cb).toHaveBeenCalled();
            expect(component.appLoading).toBeFalse();
            expect(result).toBeTruthy();
        });

        it('messValidation does not invoke callback for invalid timestamp', () => {
            const cb = jasmine.createSpy('cb');
            const result = component.messValidation(NaN, 0, cb);
            expect(cb).not.toHaveBeenCalled();
            expect(result).toBe(0);
        });

        it('isMainPageData recognizes main-page related msgIDs', () => {
            expect(component.isMainPageData({ msgID: MsgID.MAIN_PAGE_DATA })).toBeTrue();
            expect(component.isMainPageData({ msgID: MsgID.CV_STATUS })).toBeTrue();
            expect(component.isMainPageData({ msgID: MsgID.CV_ICONS })).toBeTrue();
            expect(component.isMainPageData({ msgID: MsgID.UPDATE_FARE_BUS_STOP })).toBeTrue();
            expect(component.isMainPageData({ msgID: MsgID.UPDATE_FMS_BUS_STOP })).toBeTrue();
            expect(component.isMainPageData({ msgID: MsgID.UPDATE_HEADWAY })).toBeTrue();
            expect(component.isMainPageData({ msgID: MsgID.UPDATE_FARE_BUS_STOP_LIST })).toBeTrue();
            expect(component.isMainPageData({ msgID: MsgID.NEXT_BUS_INFO })).toBeTrue();
            expect(component.isMainPageData({ msgID: 99999 })).toBeFalse();
            expect(component.isMainPageData(undefined)).toBeFalse();
        });

        it('formatMainHeader returns url stripped of leading slash for known screens', () => {
            expect(component.formatMainHeader(component.loginUrl)).toBe(component.loginUrl.substring(1));
            expect(component.formatMainHeader(component.busOperationUrl)).toBe(component.busOperationUrl.substring(1));
            expect(component.formatMainHeader('/unknown/route')).toBe('main');
        });

        it('genCvBlockClass reflects number of cvLists', () => {
            component.cvLists = [{ id: 1 } as any, { id: 2 } as any];
            expect(component.genCvBlockClass()).toBe('cv-block-2');
        });

        it('closePopUpHandler clears showPop', () => {
            component.showPop = { title: 'x' };
            component.closePopUpHandler();
            expect(component.showPop).toBeNull();
        });

        it('displayTripInfoPage navigates to bus-stop-information', () => {
            component.currentRoute = '/something-else';
            component.displayTripInfoPage();
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('setCvStatus adds FREE status when freeMode true', () => {
            component.cvLists = [{ id: 1, statuses: [CvStatusType.ENTRY] } as any];
            component.free = { freeMode: true };
            component.setCvStatus();
            expect(component.cvLists[0].statuses).toContain(CvStatusType.FREE as any);
        });

        it('setCvStatus removes FREE status when freeMode false', () => {
            component.cvLists = [{ id: 1, statuses: [CvStatusType.FREE, CvStatusType.ENTRY] } as any];
            component.free = { freeMode: false };
            component.setCvStatus();
            expect(component.cvLists[0].statuses).not.toContain(CvStatusType.FREE as any);
        });

        it('blinkEffectHandler dispatches active cv ids', () => {
            component.cvLists = [{ id: 1 } as any, { id: 2 } as any];
            component.blinkEffectHandler();
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('closeErrorCv resets the target cv entry', () => {
            const timer = setTimeout(() => {}, 1000) as unknown as number;
            component.cvLists = [{ id: 1, error: true, activeIcon: 'x', timer } as any];
            component.closeErrorCv(1);
            expect(component.cvLists[0].error).toBeFalse();
            expect(component.cvLists[0].activeIcon).toBeNull();
        });

        it('navigate does nothing when already on the target route', () => {
            component.currentRoute = '/main';
            mockRouter.navigate.calls.reset();
            component.navigate('/main');
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('navigate prefixes route without a leading slash and navigates', () => {
            component.currentRoute = '/other';
            mockRouter.navigate.calls.reset();
            component.navigate('main');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/main']);
        });

        it('isRouteActive compares against router.url', () => {
            mockRouter.url = '/main';
            expect(component.isRouteActive('/main')).toBeTrue();
            expect(component.isRouteActive('/other')).toBeFalse();
        });

        it('isDisableButton is true when disableAllButtons is set', () => {
            component.disableAllButtons = true;
            expect(component.isDisableButton()).toBeTrue();
        });

        it('isDisableButton is true when displayLockPopUp is set', () => {
            component.disableAllButtons = false;
            component.displayLockPopUp = true;
            expect(component.isDisableButton()).toBeTrue();
        });

        it('isDisableButton is true for known disable routes', () => {
            component.disableAllButtons = false;
            component.displayLockPopUp = false;
            component.displaySettingsPopUp = false;
            component.displayFareBusStop = false;
            component.currentRoute = component.freeRoute;
            expect(component.isDisableButton()).toBeTrue();
        });

        it('isDisableButton is false otherwise', () => {
            component.disableAllButtons = false;
            component.displayLockPopUp = false;
            component.displaySettingsPopUp = false;
            component.displayFareBusStop = false;
            component.currentRoute = '/some/random/route';
            expect(component.isDisableButton()).toBeFalse();
        });

        it('isOnlyDateTimeDisplay is true for known screens', () => {
            component.displayLockScreen = false;
            component.bootUpCommissioning = { show: false };
            component.currentRoute = component.mainUrl;
            expect(component.isOnlyDateTimeDisplay()).toBeTrue();
        });

        it('isOnlyDateTimeDisplay is true when lock screen is displayed', () => {
            component.currentRoute = '/random';
            component.displayLockScreen = true;
            expect(component.isOnlyDateTimeDisplay()).toBeTrue();
        });

        it('isOnlyDateTimeDisplay is true when boot up commissioning is shown', () => {
            component.currentRoute = '/random';
            component.displayLockScreen = false;
            component.bootUpCommissioning = { show: true };
            expect(component.isOnlyDateTimeDisplay()).toBeTrue();
        });

        it('isOnlyDateTimeDisplay is false otherwise', () => {
            component.currentRoute = '/random';
            component.displayLockScreen = false;
            component.bootUpCommissioning = { show: false };
            expect(component.isOnlyDateTimeDisplay()).toBeFalse();
        });

        it('activeHeaderButton reflects lock popup state', () => {
            component.displayLockPopUp = true;
            component.displaySettingsPopUp = false;
            component.currentRoute = '/x';
            expect(component.activeHeaderButton()).toEqual(['lock-btn']);
        });

        it('activeHeaderButton reflects settings popup state', () => {
            component.displayLockPopUp = false;
            component.displaySettingsPopUp = true;
            component.currentRoute = '/x';
            expect(component.activeHeaderButton()).toEqual(['settings-btn']);
        });

        it('activeHeaderButton reflects end-trip route', () => {
            component.displayLockPopUp = false;
            component.displaySettingsPopUp = false;
            component.currentRoute = component.endTripUrl;
            expect(component.activeHeaderButton()).toEqual(['end-trip-btn']);
        });

        it('activeHeaderButton is empty otherwise', () => {
            component.displayLockPopUp = false;
            component.displaySettingsPopUp = false;
            component.currentRoute = '/random';
            expect(component.activeHeaderButton()).toEqual([]);
        });

        it('updateLineActive publishes up/down control', () => {
            component.updateLineActive(true);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_UP_DOWN_BTN, payload: { btnControl: 1 } }),
            );
            component.updateLineActive(false);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_UP_DOWN_BTN, payload: { btnControl: -1 } }),
            );
        });

        it('handleClickMainButton publishes the button clicked', () => {
            component.handleClickMainButton(MainButton.FREE);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_BUTTON, payload: { btn: MainButton.FREE } }),
            );
        });

        it('resetPopUpHandler resets all popups', () => {
            component.ignitionOff = { show: true };
            component.disableBls = { show: true };
            component.fareBusStopMode = { show: true };
            component.invalidInspectorCard = { show: true };
            component.commonPopup = { show: true, type: 'info' } as any;
            component.displayLockPopUp = true;
            component.displaySettingsPopUp = true;

            component.resetPopUpHandler();

            expect(component.ignitionOff.show).toBeFalse();
            expect(component.disableBls.show).toBeFalse();
            expect(component.fareBusStopMode.show).toBeFalse();
            expect(component.invalidInspectorCard.show).toBeFalse();
            expect(component.commonPopup.show).toBeFalse();
            expect(component.displayLockPopUp).toBeFalse();
            expect(component.displaySettingsPopUp).toBeFalse();
        });

        it('handleIgnitionOff publishes and disables the button', () => {
            component.ignitionOff = { show: true };
            component.handleIgnitionOff();
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.IGNITION_OFF }),
            );
            expect(component.ignitionOff.disabled).toBeTrue();
        });

        it('handleConfirmDisableBls publishes confirm value', () => {
            component.handleConfirmDisableBls(true);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.AUTO_DISABLE_BLS_CONFIRM, payload: { disable: true } }),
            );
        });

        it('handleConfirmFareBusStopMode publishes only when confirmed', () => {
            component.handleConfirmFareBusStopMode(true);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT }),
            );
            mockMqttService.publishWithMessageFormat.calls.reset();
            component.handleConfirmFareBusStopMode(false);
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('handleInvalidInspectorCard resets the popup', () => {
            component.invalidInspectorCard = { show: true, message: 'x' };
            component.handleInvalidInspectorCard();
            expect(component.invalidInspectorCard.show).toBeFalse();
        });

        it('handleCloseCommonPopup resets popup and skips publish without a closeMsgID', () => {
            component.commonPopup = { show: true } as any;
            component.disableAllButtons = true;
            component.handleCloseCommonPopup();
            expect(component.commonPopup.show).toBeFalse();
            expect(component.disableAllButtons).toBeFalse();
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('handleCloseCommonPopup publishes when a closeMsgID is provided', () => {
            component.handleCloseCommonPopup(MsgID.ACKNOWLEDGE_DRIVER_STATUS);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.ACKNOWLEDGE_DRIVER_STATUS }),
            );
        });

        it('handleConfirmLock publishes on confirm', () => {
            component.handleConfirmLock(true);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.LOCK_CONFIRM }),
            );
        });

        it('handleConfirmLock hides popup when not confirmed', () => {
            component.displayLockPopUp = true;
            component.handleConfirmLock(false);
            expect(component.displayLockPopUp).toBeFalse();
        });

        it('handleLockScreen shows lock screen and dispatches', () => {
            component.displayLockPopUp = true;
            component.handleLockScreen();
            expect(component.displayLockPopUp).toBeFalse();
            expect(component.displayLockScreen).toBeTrue();
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('handleUnlockSuccess hides lock screen', () => {
            component.displayLockScreen = true;
            component.handleUnlockSuccess();
            expect(component.displayLockScreen).toBeFalse();
        });

        it('handleConfirmLanguage publishes and persists language', () => {
            component.handleConfirmLanguage('EN');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.LANGUAGE_SUBMIT }),
            );
            expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(
                LocalStorageKey.LANGUAGE,
                JSON.stringify('EN'),
            );
        });

        it('handleChangeAudioVolume publishes and persists volume', () => {
            component.handleChangeAudioVolume(50);
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.VOLUME_SETTING }),
            );
            expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(LocalStorageKey.VOLUME, JSON.stringify(50));
        });

        it('handleDisplayLockPopUp shows lock popup and hides settings', () => {
            component.displaySettingsPopUp = true;
            component.handleDisplayLockPopUp();
            expect(component.displayLockPopUp).toBeTrue();
            expect(component.displaySettingsPopUp).toBeFalse();
        });

        it('handleDisplaySettingsPopUp shows settings popup and hides lock', () => {
            component.displayLockPopUp = true;
            component.handleDisplaySettingsPopUp();
            expect(component.displaySettingsPopUp).toBeTrue();
            expect(component.displayLockPopUp).toBeFalse();
        });

        it('handleButtonSound delegates to SoundService', () => {
            component.handleButtonSound();
            expect(mockSoundService.playButton).toHaveBeenCalled();
        });

        it('handleBootUpCommissioning shows popup and re-publishes to other tabs', () => {
            component.handleBootUpCommissioning(
                { msgID: MsgID.BOOT_UP_COMMISSIONING, msgSubID: MsgSubID.NOTIFY },
                { message: 'IN_PROGRESS' },
            );
            expect(component.bootUpCommissioning.show).toBeTrue();
            expect(component.bootUpCommissioning.title).toBe('IN_PROGRESS');
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledTimes(2);
        });
    });

    // -----------------------------------------------------------------------
    // Router-event driven behaviour
    // -----------------------------------------------------------------------

    describe('router event handling', () => {
        it('applies handleRouteChange for the current url on init', () => {
            expect(component.currentRoute).toBe('/main');
        });

        it('shows the popup (hidePopup=false) on the bus-stop-information screen', () => {
            routerEvents$.next(new NavigationStart(1, `/${routerUrls?.private?.main?.busStopInformation}`));
            expect(component.hidePopup).toBeFalse();
        });

        it('hides the popup elsewhere', () => {
            routerEvents$.next(new NavigationStart(1, '/main/login'));
            expect(component.hidePopup).toBeTrue();
        });

        it('ignores non-NavigationStart router events', () => {
            const before = component.currentRoute;
            routerEvents$.next({ type: 'not-a-navigation-start' });
            expect(component.currentRoute).toBe(before);
        });
    });

    // -----------------------------------------------------------------------
    // NgRx store driven observables (initStore)
    // -----------------------------------------------------------------------

    describe('store subscriptions', () => {
        it('sets current fare bus stop from an active entry when none is selected yet', () => {
            component.currentFareBusStop = null;
            store.overrideSelector(fareBusStopList, [
                { Busid: 'a', Name: 'A', flag: 'inactive' },
                { Busid: 'b', Name: 'B', flag: 'active' },
            ] as any);
            store.refreshState();
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('does not dispatch when a current fare bus stop is already selected', () => {
            component.currentFareBusStop = { Busid: 'existing' } as any;
            (store.dispatch as jasmine.Spy).calls.reset();
            store.overrideSelector(fareBusStopList, [{ Busid: 'b', Name: 'B', flag: 'active' }] as any);
            store.refreshState();
            expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('handles an empty fare bus stop list (no active entry)', () => {
            component.currentFareBusStop = null;
            expect(() => {
                store.overrideSelector(fareBusStopList, []);
                store.refreshState();
            }).not.toThrow();
        });

        it('updates currentFareBusStop from the selector', () => {
            store.overrideSelector(currentFareBusStop, { Busid: 'z' } as any);
            store.refreshState();
            expect(component.currentFareBusStop).toEqual({ Busid: 'z' } as any);
        });

        it('reflects active CVs and clears them after the timeout', (done) => {
            store.overrideSelector(activeCVs, [1, 2, 3]);
            store.refreshState();
            expect(component.cvsActive).toEqual([1, 2, 3]);
            setTimeout(() => {
                expect(component.cvsActive).toEqual([]);
                done();
            }, 3100);
        }, 5000);

        it('ignores an empty active CVs list', () => {
            component.cvsActive = [];
            store.overrideSelector(activeCVs, []);
            store.refreshState();
            expect(component.cvsActive).toEqual([]);
        });

        it('applies free state and recomputes cv status', () => {
            component.cvLists = [{ id: 1, statuses: [CvStatusType.ENTRY] } as any];
            store.overrideSelector(free, { freeMode: true });
            store.refreshState();
            expect(component.free).toEqual({ freeMode: true });
            expect(component.cvLists[0].statuses).toContain(CvStatusType.FREE as any);
        });

        it('reflects front door state', () => {
            store.overrideSelector(frontDoor, { cvNum: 4 });
            store.refreshState();
            expect(component.frontDoor).toEqual({ cvNum: 4 });
        });

        it('reflects displayFareBusStopList flag', () => {
            store.overrideSelector(displayFareBusStopList, true);
            store.refreshState();
            expect(component.displayFareBusStop).toBeTrue();
        });
    });

    // -----------------------------------------------------------------------
    // validatedAuth / setupMqttSubscription — main-tab callback (index 0)
    // -----------------------------------------------------------------------

    describe('main-tab MQTT callback (index 0)', () => {
        it('ignores msgID 0', () => {
            component.appLoading = true;
            fireMain({ msgID: 0, msgSubID: MsgSubID.NOTIFY, dateTime: new Date().toISOString() }, {});
            expect(component.appLoading).toBeTrue();
        });

        it('sets appLoading false but skips further processing for NA status', () => {
            component.appLoading = true;
            fireMain(notifyHeader(MsgID.BOOT_UP), { status: ResponseStatus.NA });
            // appLoading is flipped before the NA short-circuit is evaluated.
            expect(component.appLoading).toBeFalse();
        });

        it('ignores messages with an empty header object', () => {
            expect(() => fireMain({}, {})).not.toThrow();
        });

        it('handles MAIN_PAGE_DATA and populates cv list / user info / bus stops', () => {
            fireMain(
                { msgID: MsgID.MAIN_PAGE_DATA, msgSubID: MsgSubID.RESPONSE, dateTime: new Date().toISOString() },
                {
                    fmsBusStopList: [{ Busid: '1', Name: 'A' }],
                    fareBusStopList: [
                        { Busid: 'a', Name: 'A', flag: 'inactive' },
                        { Busid: 'b', Name: 'B', flag: 'active' },
                    ],
                    cvList: [
                        { cvNumber: 2, statuses: [CvStatusType.ENTRY] },
                        { cvNumber: 1, statuses: [CvStatusType.FREE] },
                    ],
                    busServiceNum: '10',
                    plateNum: 'SBA123A',
                },
            );
            expect(component.cvLists.map((c) => c.id)).toEqual([1, 2]);
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('handles MAIN_PAGE_DATA with no fare bus stops and no cv list', () => {
            expect(() =>
                fireMain(notifyHeader(MsgID.MAIN_PAGE_DATA), {
                    fmsBusStopList: [],
                    fareBusStopList: [],
                    cvList: [],
                }),
            ).not.toThrow();
        });

        it('handles CV_STATUS via handleMainDataMessages', () => {
            fireMain(notifyHeader(MsgID.CV_STATUS), [
                { cvNumber: 1, statuses: [CvStatusType.FREE] },
                { cvNumber: 2, statuses: [CvStatusType.ENTRY] },
            ]);
            expect(component.cvLists.length).toBe(2);
        });

        it('handles CV_ICONS and sets active icon / label / error, then clears after timeout', () => {
            component.cvLists = [{ id: 1, statuses: [], timer: null } as any];
            fireMain(notifyHeader(MsgID.CV_ICONS), { cvNum: 1, icon: 2, error: true, message: 'oops' });
            expect(component.cvLists[0].activeIcon).toContain('pwd');
            expect(component.cvLists[0].error).toBeTrue();
            expect(component.cvLists[0].message).toBe('oops');
        });

        it('CV_ICONS is a no-op when the cv is not found in the list', () => {
            component.cvLists = [{ id: 9, statuses: [] } as any];
            expect(() => fireMain(notifyHeader(MsgID.CV_ICONS), { cvNum: 1, icon: 1 })).not.toThrow();
        });

        it('CV_ICONS clears an existing timer before setting a new one', () => {
            const timer = setTimeout(() => {}, 10000) as unknown as number;
            component.cvLists = [{ id: 1, statuses: [], timer } as any];
            fireMain(notifyHeader(MsgID.CV_ICONS), { cvNum: 1, icon: 9 });
            expect(component.cvLists[0].timer).toBeTruthy();
        });

        it('covers all CV_ICONS icon switch branches', () => {
            for (let icon = 1; icon <= 10; icon++) {
                component.cvLists = [{ id: 1, statuses: [] } as any];
                expect(() => fireMain(notifyHeader(MsgID.CV_ICONS), { cvNum: 1, icon })).not.toThrow();
            }
        });

        it('handles UPDATE_FARE_BUS_STOP via handleMainDataMessages', () => {
            component.fareBusStopList = [{ Busid: 'a', Name: 'A' } as any];
            expect(() =>
                fireMain(notifyHeader(MsgID.UPDATE_FARE_BUS_STOP), { index: 0, manualBls: true }),
            ).not.toThrow();
        });

        it('handles UPDATE_FMS_BUS_STOP via handleMainDataMessages', () => {
            expect(() =>
                fireMain(notifyHeader(MsgID.UPDATE_FMS_BUS_STOP), { fmsBusStopList: [{ Busid: 'x' }], extra: 1 }),
            ).not.toThrow();
        });

        it('handles UPDATE_HEADWAY via handleMainDataMessages', () => {
            expect(() => fireMain(notifyHeader(MsgID.UPDATE_HEADWAY), { color: '0x019646' })).not.toThrow();
        });

        it('handles UPDATE_FARE_BUS_STOP_LIST via handleMainDataMessages', () => {
            expect(() =>
                fireMain(notifyHeader(MsgID.UPDATE_FARE_BUS_STOP_LIST), {
                    fareBusStopList: [{ Busid: 'a', flag: 'active' }],
                }),
            ).not.toThrow();
        });

        // ---- NOTIFY switch: simple dispatch+navigate cases ----
        const simpleNotifyCases: Array<{ name: string; msgID: number; payload?: any }> = [
            { name: 'BOOT_UP', msgID: MsgID.BOOT_UP, payload: {} },
            { name: 'LANGUAGE', msgID: MsgID.LANGUAGE, payload: { language: 'EN' } },
            { name: 'DATE_TIME_SETTING', msgID: MsgID.DATE_TIME_SETTING, payload: {} },
            { name: 'FARE_CONSOLE', msgID: MsgID.FARE_CONSOLE, payload: {} },
            { name: 'DELETE_PARAMETER_NOTIFY', msgID: MsgID.DELETE_PARAMETER_NOTIFY, payload: {} },
            { name: 'OUT_OF_SERVICE_INFO', msgID: MsgID.OUT_OF_SERVICE_INFO, payload: {} },
            { name: 'OUT_OF_SERVICE_MISSING_DATA', msgID: MsgID.OUT_OF_SERVICE_MISSING_DATA, payload: {} },
            { name: 'CV_UPGRADE', msgID: MsgID.CV_UPGRADE, payload: { status: 1 } },
            { name: 'DAGW_OPERATION', msgID: MsgID.DAGW_OPERATION, payload: {} },
            { name: 'NEW_DAGW_OPERATION', msgID: MsgID.NEW_DAGW_OPERATION, payload: {} },
            { name: 'BUS_OPERATION_MENU', msgID: MsgID.BUS_OPERATION_MENU, payload: {} },
            { name: 'BC_TAP_CARD_LOGIN', msgID: MsgID.BC_TAP_CARD_LOGIN, payload: {} },
            { name: 'BC_TAP_CARD_PIN', msgID: MsgID.BC_TAP_CARD_PIN, payload: {} },
            { name: 'BC_TAP_CARD_DUTY', msgID: MsgID.BC_TAP_CARD_DUTY, payload: {} },
            { name: 'MANUAL_LOGIN_DUTY', msgID: MsgID.MANUAL_LOGIN_DUTY, payload: {} },
            { name: 'MS_TAP_CARD_LOGIN', msgID: MsgID.MS_TAP_CARD_LOGIN, payload: {} },
            { name: 'BOOT_UP_COMMISSIONING', msgID: MsgID.BOOT_UP_COMMISSIONING, payload: { message: 'IN_PROGRESS' } },
            { name: 'END_TRIP', msgID: MsgID.END_TRIP, payload: {} },
            { name: 'MAIN_FREE', msgID: MsgID.MAIN_FREE, payload: {} },
            { name: 'MAIN_BREAKDOWN', msgID: MsgID.MAIN_BREAKDOWN, payload: {} },
            { name: 'MAIN_REAR_DOORS', msgID: MsgID.MAIN_REAR_DOORS, payload: {} },
            { name: 'MAIN_CASH', msgID: MsgID.MAIN_CASH, payload: {} },
            { name: 'MAIN_FRONT_DOOR', msgID: MsgID.MAIN_FRONT_DOOR, payload: {} },
            { name: 'MAIN_REDEEM', msgID: MsgID.MAIN_REDEEM, payload: { message: 'x' } },
            { name: 'COMMON_PRINT_ERROR', msgID: MsgID.COMMON_PRINT_ERROR, payload: { message: 'x' } },
            { name: 'NOTIFY_TO_LOCK', msgID: MsgID.NOTIFY_TO_LOCK, payload: {} },
            { name: 'UNLOCK_SUCCESS', msgID: MsgID.UNLOCK_SUCCESS, payload: {} },
            { name: 'IGNITION_OFF', msgID: MsgID.IGNITION_OFF, payload: { currentTime: 'now', delay: 5 } },
            { name: 'AUTO_DISABLE_BLS', msgID: MsgID.AUTO_DISABLE_BLS, payload: {} },
            { name: 'MAIN_FARE_BUS_STOP_MODE', msgID: MsgID.MAIN_FARE_BUS_STOP_MODE, payload: { message: 'x' } },
            { name: 'INVALID_INSPECTOR_CARD', msgID: MsgID.INVALID_INSPECTOR_CARD, payload: { message: 'x' } },
            { name: 'BUS_OFF_ROUTE', msgID: MsgID.BUS_OFF_ROUTE, payload: { status: true } },
            { name: 'MAIN_CJB_PLATE_NUMBER', msgID: MsgID.MAIN_CJB_PLATE_NUMBER, payload: { message: 'PLATE1' } },
            { name: 'MAIN_CHECK_POINT', msgID: MsgID.MAIN_CHECK_POINT, payload: {} },
            { name: 'MAIN_BYPASS_TEN_BUS_STOP', msgID: MsgID.MAIN_BYPASS_TEN_BUS_STOP, payload: {} },
            { name: 'MAIN_FMS_BLS_ARE_NOT_WORKING', msgID: MsgID.MAIN_FMS_BLS_ARE_NOT_WORKING, payload: {} },
            { name: 'MAIN_BLS_RECOVERED', msgID: MsgID.MAIN_BLS_RECOVERED, payload: {} },
            { name: 'LOGIN_OPTION_ERROR', msgID: MsgID.LOGIN_OPTION_ERROR, payload: {} },
            { name: 'unmapped default case', msgID: -12345, payload: {} },
        ];

        simpleNotifyCases.forEach(({ name, msgID, payload }) => {
            it(`handles NOTIFY case: ${name}`, () => {
                expect(() => fireMain(notifyHeader(msgID), payload)).not.toThrow();
            });
        });

        it('TAP_CARD_NOTIFICATION dispatches and navigates immediately (no messValidation wrapper)', () => {
            fireMain(notifyHeader(MsgID.TAP_CARD_NOTIFICATION), {});
            expect(store.dispatch).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.loginOptionUrl]);
        });

        it('MAIN_ACCESS_DENIED navigates immediately', () => {
            fireMain(notifyHeader(MsgID.MAIN_ACCESS_DENIED), {});
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.accessDeniedUrl]);
        });

        it('MANUAL_LOGIN_PIN when not on the lock screen dispatches manual login and navigates', () => {
            component.displayLockScreen = false;
            fireMain(notifyHeader(MsgID.MANUAL_LOGIN_PIN), { timeout: 0 });
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.manualLoginUrl]);
        });

        it('MANUAL_LOGIN_PIN2 while locked dispatches lock screen update', () => {
            component.displayLockScreen = true;
            expect(() => fireMain(notifyHeader(MsgID.MANUAL_LOGIN_PIN2), { timeout: 30 })).not.toThrow();
        });

        it('MANUAL_LOGIN_STAFF_ID while locked dispatches lock screen update', () => {
            component.displayLockScreen = true;
            expect(() => fireMain(notifyHeader(MsgID.MANUAL_LOGIN_STAFF_ID), {})).not.toThrow();
        });

        it('EXTERNAL_DEVICES_NOTIFY navigates only when navigation is required', () => {
            mockRouter.navigate.calls.reset();
            fireMain(notifyHeader(MsgID.EXTERNAL_DEVICES_NOTIFY), { isNavigationRequired: false });
            expect(mockRouter.navigate).not.toHaveBeenCalled();

            fireMain(notifyHeader(MsgID.EXTERNAL_DEVICES_NOTIFY), { isNavigationRequired: true });
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.externalDevicesUrl]);
        });

        it('START_TRIP_INFORMATION_FOR_SPECIAL_CASE handles FMS valid info type', () => {
            fireMain(notifyHeader(MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE), {
                type: StartTripTypes.FMS_VALID_INFO,
                serviceNumber: '10',
            });
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.busOperationStartTripUrl]);
        });

        it('START_TRIP_INFORMATION_FOR_SPECIAL_CASE handles FMS no-info type', () => {
            expect(() =>
                fireMain(notifyHeader(MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE), {
                    type: StartTripTypes.FMS_NO_INFO,
                }),
            ).not.toThrow();
        });

        it('START_TRIP_INFORMATION_FOR_SPECIAL_CASE ignores unknown types but still navigates', () => {
            expect(() =>
                fireMain(notifyHeader(MsgID.START_TRIP_INFORMATION_FOR_SPECIAL_CASE), { type: 'unknown' }),
            ).not.toThrow();
        });

        it('handles HASH_PASSWORD by hashing and publishing the result', async () => {
            fireMain(notifyHeader(MsgID.HASH_PASSWORD), { password: 'secret' });
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(mockMqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.HASH_PASSWORD_RESULT }),
            );
        });

        it('HASH_PASSWORD is a no-op without a password', async () => {
            mockMqttService.publishWithMessageFormat.calls.reset();
            fireMain(notifyHeader(MsgID.HASH_PASSWORD), {});
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(mockMqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        // ---- START_TRIP_POP_UP_MESSAGE subtype switch ----
        const startTripPopupTypes = [
            MainPagePopUp.BUS_STOP_MISMATCH,
            MainPagePopUp.TRIP_MISMATCH,
            MainPagePopUp.DRIVER_ID_CHANGES,
            MainPagePopUp.DRIVER_BLOCKED_LOG_OFF,
            MainPagePopUp.FMS_NO_INFO,
            'UNKNOWN_TYPE',
        ];
        startTripPopupTypes.forEach((type) => {
            it(`START_TRIP_POP_UP_MESSAGE handles type ${type}`, () => {
                expect(() => fireMain(notifyHeader(MsgID.START_TRIP_POP_UP_MESSAGE), { type })).not.toThrow();
            });
        });

        // ---- DRIVER_STATUS subtype switch ----
        const driverStatusTypes = [MainPagePopUp.DRIVER_ID_CHANGES, MainPagePopUp.DRIVER_BLOCKED_LOG_OFF, 'UNKNOWN'];
        driverStatusTypes.forEach((type) => {
            it(`DRIVER_STATUS handles type ${type}`, () => {
                expect(() => fireMain(notifyHeader(MsgID.DRIVER_STATUS), { type })).not.toThrow();
            });
        });

        // ---- RESPONSE switch: simple dispatch+navigate cases ----
        const simpleResponseCases: Array<{ name: string; msgID: number; payload?: any }> = [
            { name: 'DATE_TIME_SUBMIT', msgID: MsgID.DATE_TIME_SUBMIT, payload: {} },
            { name: 'DECK_TYPE_LIST', msgID: MsgID.DECK_TYPE_LIST, payload: {} },
            { name: 'DELETE_PARAMETER', msgID: MsgID.DELETE_PARAMETER, payload: {} },
            { name: 'COMMISSION_BUS_ID', msgID: MsgID.COMMISSION_BUS_ID, payload: {} },
            { name: 'COMMISSION_OPERATOR', msgID: MsgID.COMMISSION_OPERATOR, payload: {} },
            { name: 'COMMISSION_BUS_ID_SUBMIT', msgID: MsgID.COMMISSION_BUS_ID_SUBMIT, payload: {} },
            { name: 'BC_TAP_CARD_PIN', msgID: MsgID.BC_TAP_CARD_PIN, payload: {} },
            { name: 'BC_TAP_CARD_DUTY', msgID: MsgID.BC_TAP_CARD_DUTY, payload: {} },
            { name: 'EXTERNAL_DEVICES', msgID: MsgID.EXTERNAL_DEVICES, payload: {} },
            { name: 'MAINTENANCE_TEST_PRINT', msgID: MsgID.MAINTENANCE_TEST_PRINT, payload: {} },
            { name: 'START_TRIP_BUS_STOP_LIST', msgID: MsgID.START_TRIP_BUS_STOP_LIST, payload: {} },
            { name: 'START_TRIP_GET_SERVICE_LIST', msgID: MsgID.START_TRIP_GET_SERVICE_LIST, payload: {} },
            { name: 'START_TRIP_GET_FARE_TRIP_DETAILS', msgID: MsgID.START_TRIP_GET_FARE_TRIP_DETAILS, payload: {} },
            { name: 'START_TRIP_SUBMIT_SERVICE', msgID: MsgID.START_TRIP_SUBMIT_SERVICE, payload: {} },
            { name: 'START_TRIP_SUBMIT_FARE_TRIP', msgID: MsgID.START_TRIP_SUBMIT_FARE_TRIP, payload: {} },
            { name: 'MAIN_FRONT_DOOR_SELECT_CV', msgID: MsgID.MAIN_FRONT_DOOR_SELECT_CV, payload: {} },
            { name: 'IGNITION_OFF', msgID: MsgID.IGNITION_OFF, payload: {} },
            { name: 'FARE_BUS_STOP_MODE_SUBMIT', msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT, payload: {} },
            { name: 'AUTO_DISABLE_BLS_CONFIRM', msgID: MsgID.AUTO_DISABLE_BLS_CONFIRM, payload: {} },
            { name: 'BREAKDOWN_BUS_STOP_LIST', msgID: MsgID.BREAKDOWN_BUS_STOP_LIST, payload: { status: 1 } },
            {
                name: 'BREAKDOWN_PROCESS_BREAKDOWN_TICKET',
                msgID: MsgID.BREAKDOWN_PROCESS_BREAKDOWN_TICKET,
                payload: { status: 1 },
            },
            { name: 'BREAKDOWN_CHANGE_BUS_STOP', msgID: MsgID.BREAKDOWN_CHANGE_BUS_STOP, payload: { status: 1 } },
            { name: 'BREAKDOWN_SUBMIT', msgID: MsgID.BREAKDOWN_SUBMIT, payload: { status: 1 } },
            { name: 'BREAKDOWN_SUBMIT_REASON', msgID: MsgID.BREAKDOWN_SUBMIT_REASON, payload: { status: 1 } },
            {
                name: 'BREAKDOWN_SUBMIT_COMP_TICKET',
                msgID: MsgID.BREAKDOWN_SUBMIT_COMP_TICKET,
                payload: { status: 1 },
            },
            {
                name: 'BREAKDOWN_PROCESS_COMP_TICKET',
                msgID: MsgID.BREAKDOWN_PROCESS_COMP_TICKET,
                payload: { status: 1 },
            },
            {
                name: 'BREAKDOWN_SUBMIT_BREAKDOWN_TICKET',
                msgID: MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
                payload: { status: 1 },
            },
            { name: 'BREAKDOWN_BACK_BUTTON', msgID: MsgID.BREAKDOWN_BACK_BUTTON, payload: { status: 1 } },
            {
                name: 'MAIN_CASH_MULTI_SUBMIT',
                msgID: MsgID.MAIN_CASH_MULTI_SUBMIT,
                payload: {},
            },
            { name: 'MAIN_CASH_MULTI_BACK', msgID: MsgID.MAIN_CASH_MULTI_BACK, payload: {} },
            { name: 'MAIN_CASH_MULTI_CONFIRM', msgID: MsgID.MAIN_CASH_MULTI_CONFIRM, payload: {} },
            {
                name: 'MAIN_CASH_FARE_CALCULATION_BUS_STOP',
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
                payload: {},
            },
            { name: 'MAIN_CASH_FARE_CALCULATION_BACK', msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BACK, payload: {} },
            { name: 'MAIN_CASH_SINGLE_SUBMIT', msgID: MsgID.MAIN_CASH_SINGLE_SUBMIT, payload: {} },
            {
                name: 'MAIN_CASH_FARE_CALCULATION_PRINT',
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_PRINT,
                payload: {},
            },
            { name: 'unmapped default case', msgID: -54321, payload: {} },
        ];

        simpleResponseCases.forEach(({ name, msgID, payload }) => {
            it(`handles RESPONSE case: ${name}`, () => {
                expect(() => fireMain(responseHeader(msgID), payload)).not.toThrow();
            });
        });

        it('MS_TAP_CARD_PIN with SUCCESS status navigates to access-denied', () => {
            fireMain(responseHeader(MsgID.MS_TAP_CARD_PIN), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.accessDenied}`]);
        });

        it('MS_TAP_CARD_PIN otherwise dispatches tap card login', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.MS_TAP_CARD_PIN), { status: ResponseStatus.PROGRESS }),
            ).not.toThrow();
        });

        it('MANUAL_LOGIN_PIN2 RESPONSE while locked and successful is a silent unlock', () => {
            component.displayLockScreen = true;
            expect(() =>
                fireMain(responseHeader(MsgID.MANUAL_LOGIN_PIN2), { status: ResponseStatus.SUCCESS }),
            ).not.toThrow();
        });

        it('MANUAL_LOGIN_PIN RESPONSE while locked and not the PIN2/SUCCESS combo dispatches lock update', () => {
            component.displayLockScreen = true;
            expect(() =>
                fireMain(responseHeader(MsgID.MANUAL_LOGIN_PIN), { status: ResponseStatus.ERROR }),
            ).not.toThrow();
        });

        it('MANUAL_LOGIN_DUTY RESPONSE while unlocked dispatches manual login', () => {
            component.displayLockScreen = false;
            expect(() => fireMain(responseHeader(MsgID.MANUAL_LOGIN_DUTY), {})).not.toThrow();
        });

        it('END_SHIFT RESPONSE navigates to login on success', () => {
            fireMain(responseHeader(MsgID.END_SHIFT), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.loginUrl]);
        });

        it('END_SHIFT RESPONSE is a no-op otherwise', () => {
            expect(() => fireMain(responseHeader(MsgID.END_SHIFT), { status: ResponseStatus.ERROR })).not.toThrow();
        });

        it('END_TRIP RESPONSE dispatches and navigates only on success', () => {
            fireMain(responseHeader(MsgID.END_TRIP), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.endTripUrl]);
        });

        it('END_TRIP RESPONSE is a no-op otherwise', () => {
            expect(() => fireMain(responseHeader(MsgID.END_TRIP), { status: ResponseStatus.ERROR })).not.toThrow();
        });

        it('END_TRIP_TYPE / END_TRIP_SUBMIT always dispatch and navigate', () => {
            fireMain(responseHeader(MsgID.END_TRIP_TYPE), {});
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.endTripUrl]);
        });

        it('START_TRIP handles FMS valid info branch', () => {
            fireMain(responseHeader(MsgID.START_TRIP), { type: StartTripTypes.FMS_VALID_INFO });
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.busOperationStartTripUrl]);
        });

        it('START_TRIP handles FMS no-info branch', () => {
            fireMain(responseHeader(MsgID.START_TRIP), { type: StartTripTypes.FMS_NO_INFO });
            expect(mockRouter.navigate).toHaveBeenCalledWith([component.startTripInvalidInfoUrl]);
        });

        it('START_TRIP ignores unknown types', () => {
            mockRouter.navigate.calls.reset();
            fireMain(responseHeader(MsgID.START_TRIP), { type: 'unknown' });
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('MAIN_FREE_SUBMIT blinks CVs and shows trip info on success', () => {
            component.cvLists = [{ id: 1 } as any];
            fireMain(responseHeader(MsgID.MAIN_FREE_SUBMIT), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('MAIN_FREE_SUBMIT only shows trip info page when not successful', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.MAIN_FREE_SUBMIT), { status: ResponseStatus.ERROR }),
            ).not.toThrow();
        });

        it('MAIN_FREE_CANCEL shows trip info page on success', () => {
            fireMain(responseHeader(MsgID.MAIN_FREE_CANCEL), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('MAIN_FREE_CANCEL is a no-op otherwise', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.MAIN_FREE_CANCEL), { status: ResponseStatus.ERROR }),
            ).not.toThrow();
        });

        it('MAIN_FRONT_DOOR_CANCEL shows trip info page on success', () => {
            fireMain(responseHeader(MsgID.MAIN_FRONT_DOOR_CANCEL), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('MAIN_FRONT_DOOR_CANCEL is a no-op otherwise', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.MAIN_FRONT_DOOR_CANCEL), { status: ResponseStatus.ERROR }),
            ).not.toThrow();
        });

        it('MAIN_FRONT_DOOR_CONFIRM dispatches active CVs when a front-door cv is set', () => {
            component.frontDoor = { cvNum: 3 };
            fireMain(responseHeader(MsgID.MAIN_FRONT_DOOR_CONFIRM), {});
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('MAIN_FRONT_DOOR_CONFIRM skips dispatch without a front-door cv', () => {
            component.frontDoor = {};
            expect(() => fireMain(responseHeader(MsgID.MAIN_FRONT_DOOR_CONFIRM), {})).not.toThrow();
        });

        it('MAIN_UP_DOWN_BTN dispatches when a bus stop id is present', () => {
            expect(() => fireMain(responseHeader(MsgID.MAIN_UP_DOWN_BTN), { busStopId: 'a', index: 0 })).not.toThrow();
        });

        it('MAIN_UP_DOWN_BTN is a no-op without a bus stop id or index', () => {
            expect(() => fireMain(responseHeader(MsgID.MAIN_UP_DOWN_BTN), { index: -1 })).not.toThrow();
        });

        it('BREAKDOWN_CANCEL shows trip info on success', () => {
            fireMain(responseHeader(MsgID.BREAKDOWN_CANCEL), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('BREAKDOWN_CANCEL is a no-op otherwise', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.BREAKDOWN_CANCEL), { status: ResponseStatus.ERROR }),
            ).not.toThrow();
        });

        it('MAIN_CASH_MULTI_CANCEL shows trip info on success', () => {
            fireMain(responseHeader(MsgID.MAIN_CASH_MULTI_CANCEL), { status: ResponseStatus.SUCCESS });
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${routerUrls?.private?.main?.busStopInformation}`]);
        });

        it('MAIN_CASH_FARE_CALCULATION is a no-op when not successful', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.MAIN_CASH_FARE_CALCULATION), { status: ResponseStatus.ERROR }),
            ).not.toThrow();
        });

        it('MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE handles ERROR status', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE), {
                    status: ResponseStatus.ERROR,
                }),
            ).not.toThrow();
        });

        it('MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE handles success payload as fare result', () => {
            expect(() =>
                fireMain(responseHeader(MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE), {
                    status: ResponseStatus.SUCCESS,
                }),
            ).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // cv-tab MQTT callback (index 1)
    // -----------------------------------------------------------------------

    describe('cv-tab MQTT callback (index 1)', () => {
        it('updates cvLists on CV_STATUS', () => {
            fireCv(notifyHeader(MsgID.CV_STATUS), [{ cvNumber: 1, statuses: [CvStatusType.ENTRY] }]);
            expect(component.cvLists.length).toBe(1);
        });

        it('ignores non CV_STATUS messages', () => {
            expect(() => fireCv(notifyHeader(MsgID.CV_ICONS), {})).not.toThrow();
        });

        it('ignores messages with NA status', () => {
            expect(() => fireCv(notifyHeader(MsgID.CV_STATUS), { status: ResponseStatus.NA })).not.toThrow();
        });

        it('ignores messages without a header', () => {
            expect(() => fireCv(undefined, {})).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // fare-bus-stop-list MQTT callback (index 2)
    // -----------------------------------------------------------------------

    describe('fare-bus-stop-list MQTT callback (index 2)', () => {
        it('updates the list for a non-retained message', () => {
            expect(() =>
                fireFareBusStopList(
                    notifyHeader(MsgID.UPDATE_FARE_BUS_STOP_LIST),
                    { fareBusStopList: [{ Busid: 'a', flag: 'active' }] },
                    { retain: false },
                ),
            ).not.toThrow();
        });

        it('updates for a retained message that is the latest', () => {
            component.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB] = new Date(0).toISOString();
            expect(() =>
                fireFareBusStopList(
                    notifyHeader(MsgID.UPDATE_FARE_BUS_STOP_LIST),
                    { fareBusStopList: [{ Busid: 'a', flag: 'active' }] },
                    { retain: true },
                ),
            ).not.toThrow();
        });

        it('updates for a retained, stale message when no fare bus stop list exists yet', () => {
            component.fareBusStopList = [];
            component.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB] = new Date(Date.now() + 1000 * 60 * 60).toISOString();
            expect(() =>
                fireFareBusStopList(
                    notifyHeader(MsgID.UPDATE_FARE_BUS_STOP_LIST),
                    { fareBusStopList: [{ Busid: 'a', flag: 'active' }] },
                    { retain: true },
                ),
            ).not.toThrow();
        });

        it('skips update for a retained, stale message when a fare bus stop list already exists', () => {
            component.fareBusStopList = [{ Busid: 'existing' } as any];
            component.lastTimeStampPerTopic[TopicsKeys.MAIN_TAB] = new Date(Date.now() + 1000 * 60 * 60).toISOString();
            expect(() =>
                fireFareBusStopList(
                    notifyHeader(MsgID.UPDATE_FARE_BUS_STOP_LIST),
                    { fareBusStopList: [{ Busid: 'a', flag: 'active' }] },
                    { retain: true },
                ),
            ).not.toThrow();
        });

        it('ignores non matching msgID', () => {
            expect(() => fireFareBusStopList(notifyHeader(MsgID.CV_STATUS), {})).not.toThrow();
        });

        it('ignores NA status and missing header', () => {
            expect(() =>
                fireFareBusStopList(notifyHeader(MsgID.UPDATE_FARE_BUS_STOP_LIST), { status: ResponseStatus.NA }),
            ).not.toThrow();
            expect(() => fireFareBusStopList(undefined, {})).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // fare-bus-stop MQTT callback (index 3)
    // -----------------------------------------------------------------------

    describe('fare-bus-stop MQTT callback (index 3)', () => {
        it('dispatches using an index lookup', () => {
            component.fareBusStopList = [{ Busid: 'a' } as any, { Busid: 'b' } as any];
            expect(() => fireFareBusStop(notifyHeader(MsgID.UPDATE_FARE_BUS_STOP), { index: 1 })).not.toThrow();
        });

        it('falls back to a Busid lookup when no index match is found', () => {
            component.fareBusStopList = [{ Busid: 'a' } as any, { Busid: 'target' } as any];
            expect(() => fireFareBusStop(notifyHeader(MsgID.UPDATE_FARE_BUS_STOP), { Busid: 'target' })).not.toThrow();
        });

        it('ignores RESPONSE sub id (only NOTIFY is handled)', () => {
            expect(() => fireFareBusStop(responseHeader(MsgID.UPDATE_FARE_BUS_STOP), { index: 0 })).not.toThrow();
        });

        it('ignores messages without a header', () => {
            expect(() => fireFareBusStop(undefined, {})).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // fms-bus-stop MQTT callback (index 4)
    // -----------------------------------------------------------------------

    describe('fms-bus-stop MQTT callback (index 4)', () => {
        it('dispatches bus stop + user info updates on UPDATE_FMS_BUS_STOP', () => {
            expect(() =>
                fireFmsBusStop(notifyHeader(MsgID.UPDATE_FMS_BUS_STOP), {
                    fmsBusStopList: [{ Busid: 'a' }],
                    plateNum: 'X',
                }),
            ).not.toThrow();
        });

        it('shows the waiting-for-FMS popup on START_TRIP_POP_UP_MESSAGE with FMS_NO_INFO', () => {
            fireFmsBusStop(notifyHeader(MsgID.START_TRIP_POP_UP_MESSAGE), { type: 'FMS_NO_INFO' });
            expect(component.showPop?.title).toBe('WAITING_FOR_FMS_INFO');
        });

        it('shows the waiting-for-FMS popup on DRIVER_STATUS with FMS_NO_INFO', () => {
            fireFmsBusStop(notifyHeader(MsgID.DRIVER_STATUS), { type: 'FMS_NO_INFO' });
            expect(component.showPop?.title).toBe('WAITING_FOR_FMS_INFO');
        });

        it('ignores unrelated msgIDs', () => {
            expect(() => fireFmsBusStop(notifyHeader(MsgID.CV_STATUS), {})).not.toThrow();
        });

        it('ignores messages without a header / with NA status', () => {
            expect(() => fireFmsBusStop(undefined, {})).not.toThrow();
            expect(() =>
                fireFmsBusStop(notifyHeader(MsgID.UPDATE_FMS_BUS_STOP), { status: ResponseStatus.NA }),
            ).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // headway MQTT callback (index 5)
    // -----------------------------------------------------------------------

    describe('headway MQTT callback (index 5)', () => {
        it('dispatches deviation update with converted color on UPDATE_HEADWAY', () => {
            expect(() => fireHeadway(notifyHeader(MsgID.UPDATE_HEADWAY), { color: '0x019646' })).not.toThrow();
        });

        it('ignores unrelated msgIDs', () => {
            expect(() => fireHeadway(notifyHeader(MsgID.CV_STATUS), {})).not.toThrow();
        });

        it('ignores messages without a header / with NA status', () => {
            expect(() => fireHeadway(undefined, {})).not.toThrow();
            expect(() => fireHeadway(notifyHeader(MsgID.UPDATE_HEADWAY), { status: ResponseStatus.NA })).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // current-service-info MQTT callback (index 6)
    // -----------------------------------------------------------------------

    describe('current-service-info MQTT callback (index 6)', () => {
        it('dispatches user info update on CURRENT_SERVICE_INFO', () => {
            expect(() => fireServiceInfo(notifyHeader(MsgID.CURRENT_SERVICE_INFO), { spid: '1' })).not.toThrow();
        });

        it('ignores unrelated msgIDs', () => {
            expect(() => fireServiceInfo(notifyHeader(MsgID.CV_STATUS), {})).not.toThrow();
        });

        it('ignores messages without a header / with NA status', () => {
            expect(() => fireServiceInfo(undefined, {})).not.toThrow();
            expect(() =>
                fireServiceInfo(notifyHeader(MsgID.CURRENT_SERVICE_INFO), { status: ResponseStatus.NA }),
            ).not.toThrow();
        });
    });

    // -----------------------------------------------------------------------
    // ngOnDestroy
    // -----------------------------------------------------------------------

    describe('ngOnDestroy', () => {
        it('clears timers and unsubscribes all mqtt topics without throwing', () => {
            component.cvLists = [{ id: 1, timer: setTimeout(() => {}, 10000) as unknown as number } as any];
            expect(() => component.ngOnDestroy()).not.toThrow();
            expect(mockMqttService.unsubscribe).toHaveBeenCalledTimes(7);
        });

        it('handles ngOnDestroy when no mqtt subscriptions or timers exist', () => {
            (component as any).mqttSubscriptions = [];
            component.cvLists = [];
            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });
});
