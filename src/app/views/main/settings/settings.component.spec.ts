import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { ThemeType } from '@models';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SettingsComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(SettingsComponent);
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

    it('should handle setStep', () => {
        component.setStep('test');
        expect(component.step).toBe('test');
    });

    it('should handle goBack', () => {
        component.step = 'test';
        component.languageStep = 2;
        component.selectedLanguage = { id: 'CH', label: '华语' };
        component.goBack();
        expect(component.step).toBe('');
        expect(component.languageStep).toBe(1);
        expect(component.selectedLanguage).toBeNull();
    });

    it('should handle navigate backToMain', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.backToMain();
        expect(navigateSpy).toHaveBeenCalled();
    });

    it('should handle handleSelectLang', () => {
        component.handleSelectLang('CH');
        expect(component.selectedLanguage).toEqual({ id: 'CH', label: '华语' });
        expect(component.languageStep).toBe(2);
    });

    it('should handle onLanguageChange confirm', () => {
        spyOn(component, 'backToMain');
        component.selectedLanguage = { id: 'CH', label: '华语' };
        component.onLanguageChange(true);
        expect(component.currentLanguage).toBe('CH');
        expect(component.backToMain).toHaveBeenCalled();
        expect(component.selectedLanguage).toBeNull();
    });

    it('should handle onLanguageChange cancel', () => {
        component.languageStep = 2;
        component.onLanguageChange(false);
        expect(component.languageStep).toBe(1);
        expect(component.selectedLanguage).toBeNull();
    });

    it('should toggle dark mode', () => {
        component.toggleDarkMode(ThemeType.LIGHT);
        expect(component.themeMode).toBe(ThemeType.LIGHT);
        expect(component.step).toBe('');
    });
});
