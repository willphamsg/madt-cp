import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceMenuComponent } from './maintenance-menu.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { of } from 'rxjs';

describe('MaintenanceMenuComponent', () => {
    let component: MaintenanceMenuComponent;
    let fixture: ComponentFixture<MaintenanceMenuComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceMenuComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MaintenanceMenuComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have 3 buttons defined', () => {
        expect(component.buttons).toHaveSize(3);
    });

    it('should have FARE_SYSTEM, FMS and CJB buttons', () => {
        const titles = component.buttons.map((b) => b.title);
        expect(titles).toContain('FARE_SYSTEM');
        expect(titles).toContain('FMS');
        expect(titles).toContain('CJB');
    });

    it('should navigate to the given link when navigate is called', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.navigate('/maintenance/fare');
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare']);
    });

    it('should navigate when FARE_SYSTEM button onClick is called', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const fareButton = component.buttons.find((b) => b.title === 'FARE_SYSTEM');
        fareButton?.onClick(fareButton.link);
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare']);
    });

    it('should navigate when CJB button onClick is called', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const cjbButton = component.buttons.find((b) => b.title === 'CJB');
        cjbButton?.onClick(cjbButton.link);
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/cjb']);
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        const mqttService = TestBed.inject(MqttService);
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        (component as any).ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
    });
});
