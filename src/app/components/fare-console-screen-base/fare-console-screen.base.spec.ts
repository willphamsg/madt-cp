import { BehaviorSubject, of } from 'rxjs';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';

import { mockInitialState } from '../../testing/test-helpers';
import { fareConsole } from '@store/maintenance/maintenance.reducer';
import { FareConsoleScreenBase } from './fare-console-screen.base';

class TestFareConsoleScreenComponent extends FareConsoleScreenBase {
    lastEmission: unknown;

    protected override onFareConsoleSetting(data: unknown): void {
        this.lastEmission = data;
    }
}

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = new BehaviorSubject<boolean>(true);
    mqttConfig = {
        topics: {
            maintenance: { get: '/madt/maintenance/fare-console' },
        },
    };
    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

describe('FareConsoleScreenBase', () => {
    let component: TestFareConsoleScreenComponent;
    let mockMqttService: MockMqttService;
    let mockSoundService: { playButton: jasmine.Spy };
    let mockRouter: { navigate: jasmine.Spy };
    let store: MockStore;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideMockStore({ initialState: mockInitialState })],
        });

        mockMqttService = new MockMqttService();
        mockSoundService = { playButton: jasmine.createSpy('playButton') };
        mockRouter = { navigate: jasmine.createSpy('navigate') };
        store = TestBed.inject(Store) as unknown as MockStore;

        component = new TestFareConsoleScreenComponent(
            mockSoundService as any,
            mockRouter as any,
            store as any,
            mockMqttService as any,
        );
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('creates the component', () => {
        expect(component).toBeTruthy();
    });

    it('sets topics when mqtt config loaded emits true', () => {
        component.ngOnInit();
        mockMqttService.mqttConfigLoaded$.next(true);
        expect(component.topics).toEqual(mockMqttService.mqttConfig.topics);
    });

    it('does not set topics when mqtt config loaded emits false', () => {
        component.ngOnInit();
        component.topics = undefined;
        mockMqttService.mqttConfigLoaded$.next(false);
        expect(component.topics).toBeUndefined();
    });

    it('updates fareConsoleSetting from the store and calls the onFareConsoleSetting hook', () => {
        store.overrideSelector(fareConsole, {
            deckType: { id: 2, label: 'Upper' },
            busId: 'SBS1234',
            complimentaryDays: 0,
            message: '',
        });
        component.ngOnInit();
        store.refreshState();
        expect(component.fareConsoleSetting.busId).toBe('SBS1234');
        expect((component.lastEmission as { busId: string }).busId).toBe('SBS1234');
    });

    it('navigates back to the fare console list on goBack', () => {
        component.goBack();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('plays the button sound on handleButtonSound', () => {
        component.handleButtonSound();
        expect(mockSoundService.playButton).toHaveBeenCalled();
    });

    it('completes the destroy subject on ngOnDestroy without throwing', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
