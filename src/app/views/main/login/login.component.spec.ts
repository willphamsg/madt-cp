import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LoginComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
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

    it('should handle change language', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const localStorageService = TestBed.inject(LocalStorageService) as any;
        component.topics = { mainTab: { get: 'test' }, tcToAllTabs: 'test2' };

        spyOn(localStorageService, 'setItem');

        component.handleChangeLanguage('CH');
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(localStorageService.setItem).toHaveBeenCalled();
    });

    it('should handle cancel dagw operation', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        component.topics = { mainTab: { get: 'test' } };

        component.handleCancelDagwOperation();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });
});
