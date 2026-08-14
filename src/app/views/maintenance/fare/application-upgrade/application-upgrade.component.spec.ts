import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationUpgrade } from './application-upgrade.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';

describe('ApplicationUpgrade', () => {
    let component: ApplicationUpgrade;
    let fixture: ComponentFixture<ApplicationUpgrade>;
    let router: Router;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ApplicationUpgrade],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ApplicationUpgrade);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        mqttService = TestBed.inject(MqttService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize isLoading to true', () => {
        expect(component.isLoading).toBeTrue();
    });

    it('should initialize appUpgrade with upgradeStatus: false', () => {
        const localComponent = TestBed.createComponent(ApplicationUpgrade).componentInstance;
        expect(localComponent.appUpgrade.upgradeStatus).toBeFalse();
    });

    it('backToFare should navigate to /maintenance/fare', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.backToFare();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare']);
    });

    it('handleUpgrade should call mqttService.publishWithMessageFormat', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleUpgrade();
        expect(publishSpy).toHaveBeenCalled();
    });
});
