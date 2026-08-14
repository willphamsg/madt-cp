import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartTripDetailsIssueComponent } from './start-trip-details-issue.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';

describe('StartTripDetailsIssueComponent', () => {
    let component: StartTripDetailsIssueComponent;
    let fixture: ComponentFixture<StartTripDetailsIssueComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), StartTripDetailsIssueComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(StartTripDetailsIssueComponent);
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

    it('should navigate and publish message on backToBusOperation', () => {
        const router = TestBed.inject(Router);
        const mqttService = TestBed.inject(MqttService);
        const navigateSpy = spyOn(router, 'navigate');
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');

        component.topics = { mainTab: { get: 'test' } };
        component.backToBusOperation();

        expect(navigateSpy).toHaveBeenCalledWith(['main/bus-operation']);
        expect(publishSpy).toHaveBeenCalled();
    });

    it('should publish message on handleSettingTrip', () => {
        const mqttService = TestBed.inject(MqttService);
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');

        component.topics = { mainTab: { get: 'test' } };
        component.handleSettingTrip();

        expect(publishSpy).toHaveBeenCalled();
    });
});
