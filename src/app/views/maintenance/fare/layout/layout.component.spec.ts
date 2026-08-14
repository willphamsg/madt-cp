import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceFareLayoutComponent } from './layout.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';

describe('MaintenanceFareLayoutComponent', () => {
    let component: MaintenanceFareLayoutComponent;
    let fixture: ComponentFixture<MaintenanceFareLayoutComponent>;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceFareLayoutComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MaintenanceFareLayoutComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have fareConsoleSetting initialized with default values', () => {
        const localComponent = TestBed.createComponent(MaintenanceFareLayoutComponent).componentInstance;
        expect(localComponent.fareConsoleSetting.busId).toBe('');
        expect(localComponent.fareConsoleSetting.blsStatus).toBe(0);
        expect(localComponent.fareConsoleSetting.complimentaryDays).toBe(0);
    });

    it('should initialize menus from maintenanceFareMenu', () => {
        expect(component.menus).toBeDefined();
        expect(component.menus.length).toBeGreaterThan(0);
    });

    it('should set activeMenu when handleActiveMenu is called', () => {
        const menu = component.menus[0];
        component.handleActiveMenu(menu);
        expect(component.activeMenu).toBe(menu);
    });

    it('should set isScrollTop to true when onTopReached is called', () => {
        component.isScrollTop = false;
        component.onTopReached();
        expect(component.isScrollTop).toBeTrue();
    });

    it('should set isScrollTop to false when onBottomReached is called', () => {
        component.isScrollTop = true;
        component.onBottomReached();
        expect(component.isScrollTop).toBeFalse();
    });

    it('handleConfirmFareConsole should publish MQTT message', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleConfirmFareConsole();
        expect(publishSpy).toHaveBeenCalled();
    });
});
