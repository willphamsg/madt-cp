import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FreeComponent } from './free.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { updateFreeCVs } from '@app/store/main/main.reducer';

describe('FreeComponent', () => {
    let component: FreeComponent;
    let fixture: ComponentFixture<FreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FreeComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FreeComponent);
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

    it('should navigate back to main', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.backToMain();
        expect(navigateSpy).toHaveBeenCalledWith(['main/bus-stop-information']);
    });

    it('should handle confirm free ride mode', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const store = TestBed.inject(Store);
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };
        component.free = { freeMode: false };

        component.handleConfirmFreeRideMode();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should handle cancel free ride mode', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const store = TestBed.inject(Store);
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };

        component.handleCancelFreeRideMode();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });
});
