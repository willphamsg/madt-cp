import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndTripComponent } from './end-trip.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { routerUrls } from '@app/app.routes';

// Ensure you import the Store from @ngrx/store

import { MqttService } from '@services/mqtt.service';

// Mock MqttService
class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);

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

class MockStore {
    select = jasmine.createSpy('select').and.returnValue(of({})); // Mock the select method
    dispatch = jasmine.createSpy('dispatch'); // Mock the dispatch method
}

describe('EndTripComponent', () => {
    let component: EndTripComponent;
    let fixture: ComponentFixture<EndTripComponent>;
    let router: Router;
    let mockMqttService: MockMqttService;

    beforeEach(async () => {
        const routerMock = {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
        };
        mockMqttService = new MockMqttService();

        await TestBed.configureTestingModule({
            imports: [EndTripComponent], // Use imports for standalone component
            providers: [
                { provide: Router, useValue: routerMock },
                { provide: MqttService, useValue: mockMqttService },
                provideMockStore({ initialState: mockInitialState }),
            ],
            schemas: [NO_ERRORS_SCHEMA], // To ignore unknown components
        }).compileComponents();

        fixture = TestBed.createComponent(EndTripComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
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

    it('should navigate to main on backToMain', () => {
        component.backToMain();
        expect(router.navigate).toHaveBeenCalledWith([routerUrls?.private?.main?.busStopInformation]);
    });

    it('should navigate to bus operation on navigateToBusOperation', () => {
        component.navigateToBusOperation();
        expect(router.navigate).toHaveBeenCalledWith([routerUrls?.private?.main?.busOperation?.url]);
    });

    it('handleConfirm() should not throw', () => {
        expect(() => component.handleConfirm()).not.toThrow();
    });

    it('handleDeclineConfirm() should navigate to bus stop', () => {
        component.handleDeclineConfirm();
        expect(router.navigate).toHaveBeenCalledWith([routerUrls?.private?.main?.busStopInformation]);
    });

    it('handleCancelEndTrip should not throw', () => {
        expect(() => component.handleCancelEndTrip()).not.toThrow();
    });

    it('resetEndTripInfo should not throw', () => {
        expect(() => component.resetEndTripInfo()).not.toThrow();
    });

    it('handleConfirmValue should publish message', () => {
        component.topics = { mainTab: { get: 'test' } };
        component.endTripInfoData = {
            service: 1,
            direction: 'inbound',
            firstBusStop: { Busid: 'a' } as any,
            lastBusStop: { Busid: 'b' } as any,
            variantName: 'v',
        } as any;
        const mqttService = TestBed.inject(MqttService) as any;
        component.handleConfirmValue();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    // it('should select reason correctly', () => {
    //     component.handleSelectReason('reason1');
    //     expect(component.reason).toBe('reason1');
    // });

    // it('should close reason correctly', () => {
    //     component.handleCloseReason();
    //     expect(component.reason).toBe('');
    //     expect(component.displayReason).toBeFalse();
    // });

    // it('should confirm reason correctly', () => {
    //     component.reason = 'reason1';
    //     component.handleConfirmReason();
    //     expect(component.displayReason).toBeFalse();
    //     expect(router.navigate).toHaveBeenCalledWith(['/bus-operation']);
    // });

    // it('should finish and navigate back to main', () => {
    //     component.handleFinish();
    //     expect(router.navigate).toHaveBeenCalledWith([routerUrls?.private?.main?.busStopInformation]);
    // });
});
