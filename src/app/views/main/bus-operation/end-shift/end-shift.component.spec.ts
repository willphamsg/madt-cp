import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndShiftComponent } from './end-shift.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';

describe('EndShiftComponent', () => {
    let component: EndShiftComponent;
    let fixture: ComponentFixture<EndShiftComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), EndShiftComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(EndShiftComponent);
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

    it('should navigate to bus-operation on goBack', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['/main/bus-operation']);
    });

    it('should publish end shift message on handleEndShift', () => {
        const mqttService = TestBed.inject(MqttService);
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        component.topics = { mainTab: { get: 'test-topic' } };
        component.handleEndShift();
        expect(publishSpy).toHaveBeenCalled();
    });
});
