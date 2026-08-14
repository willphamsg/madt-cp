import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageSettingComponent } from './language-setting.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { of } from 'rxjs';

describe('LanguageSettingComponent', () => {
    let component: LanguageSettingComponent;
    let fixture: ComponentFixture<LanguageSettingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LanguageSettingComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LanguageSettingComponent);
        component = fixture.componentInstance;

        const localStorageService = TestBed.inject(LocalStorageService);
        spyOn(localStorageService, 'watch').and.returnValue(of(null));

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

    it('should handle navigate', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.handleNavigate('/test-page');
        expect(navigateSpy).toHaveBeenCalledWith(['/test-page']);
    });

    it('should handle change language', () => {
        const translateService = TestBed.inject(TranslateService);
        const langSpy = spyOn(translateService, 'use');
        component.handleChangeLanguage('EN');
        expect(component.language).toBe('EN');
        expect(langSpy).toHaveBeenCalledWith('en');
    });

    it('should handle confirm language', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const localStorageService = TestBed.inject(LocalStorageService) as any;

        component.language = 'EN';
        component.topics = { mainTab: { get: 'test' } };

        spyOn(localStorageService, 'setItem');

        component.handleConfirmLanguage(true);
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(localStorageService.setItem).toHaveBeenCalled();
    });
});
