import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { LocalStorageService } from '@services/local-storage.service';
import { LocalStorageKey } from '@app/models';
import { Subject, of } from 'rxjs';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;
    let volumeSubject: Subject<string>;
    let languageSubject: Subject<string>;

    beforeEach(async () => {
        volumeSubject = new Subject<string>();
        languageSubject = new Subject<string>();

        const storageSpy = jasmine.createSpyObj('LocalStorageService', ['watch']);
        storageSpy.watch.and.callFake((key: string) => {
            if (key === LocalStorageKey.VOLUME) return volumeSubject.asObservable();
            if (key === LocalStorageKey.LANGUAGE) return languageSubject.asObservable();
            return new Subject<string>().asObservable();
        });

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SettingsComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: LocalStorageService, useValue: storageSpy },
                ChangeDetectorRef,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        localStorageServiceSpy = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges to manually test ngOnInit
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize currentLanguage and listen to volume and language changes', () => {
            component.ngOnInit();

            expect(component.currentLanguage).toBe('EN');
            expect(localStorageServiceSpy.watch).toHaveBeenCalledWith(LocalStorageKey.VOLUME);
            expect(localStorageServiceSpy.watch).toHaveBeenCalledWith(LocalStorageKey.LANGUAGE);

            // Trigger volume
            volumeSubject.next('50');
            expect(component.audio.value).toBe(50);

            // Trigger language
            languageSubject.next('"ch"');
            expect(component.currentLanguage).toBe('CH');

            // Trigger missing language
            languageSubject.next('');
            expect(component.currentLanguage).toBe('EN');
        });
    });

    describe('onLanguageChange', () => {
        it('should emit onConfirmLanguage if isConfirm is true and handling close', () => {
            const emitSpy = spyOn(component.onConfirmLanguage, 'emit');
            const closeSpy = spyOn(component.onClose, 'emit');

            component.selectedLanguage = { id: 'CH', label: '华语' };
            component.fromMaintenance = false;

            component.onLanguageChange(true);

            expect(component.currentLanguage).toBe('CH');
            expect(emitSpy).toHaveBeenCalledWith('CH');
            expect(closeSpy).toHaveBeenCalled();
            expect(component.selectedLanguage).toBeNull();
        });

        it('should goBack if isConfirm is true and fromMaintenance is true', () => {
            const emitSpy = spyOn(component.onConfirmLanguage, 'emit');
            const goBackSpy = spyOn(component, 'goBack');

            component.selectedLanguage = { id: 'CH', label: '华语' };
            component.fromMaintenance = true;

            component.onLanguageChange(true);

            expect(emitSpy).toHaveBeenCalledWith('CH');
            expect(goBackSpy).toHaveBeenCalled();
            expect(component.selectedLanguage).toBeNull();
        });

        it('should reset languageStep if isConfirm is false', () => {
            component.languageStep = 2;
            component.onLanguageChange(false);

            expect(component.languageStep).toBe(1);
            expect(component.selectedLanguage).toBeNull();
        });
    });

    describe('handleClose', () => {
        it('should emit onClose', () => {
            const emitSpy = spyOn(component.onClose, 'emit');
            component.handleClose();
            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('handleSelectLang', () => {
        it('should set selectedLanguage and change step', () => {
            component.handleSelectLang('CH');
            expect(component.selectedLanguage).toEqual({ id: 'CH', label: '华语' });
            expect(component.languageStep).toBe(2);
        });

        it('should set selectedLanguage to null if not found', () => {
            component.handleSelectLang('FR');
            expect(component.selectedLanguage).toBeNull();
            expect(component.languageStep).toBe(2);
        });
    });

    describe('goBack', () => {
        it('should reset language steps', () => {
            component.step = 'test';
            component.languageStep = 2;
            component.selectedLanguage = { id: 'CH', label: '华语' };

            component.goBack();

            expect(component.step).toBe('');
            expect(component.languageStep).toBe(1);
            expect(component.selectedLanguage).toBeNull();
        });
    });

    describe('setStep', () => {
        it('should update step', () => {
            component.setStep('newStep');
            expect(component.step).toBe('newStep');
        });
    });

    describe('handleChangeAudioVolume', () => {
        it('should emit new value', () => {
            const emitSpy = spyOn(component.onChangeAudioVolume, 'emit');
            component.handleChangeAudioVolume(75);
            expect(emitSpy).toHaveBeenCalledWith(75);
        });
    });

    describe('ngOnDestroy', () => {
        it('should complete subject', () => {
            const nextSpy = spyOn((component as any).destroy$, 'next');
            const completeSpy = spyOn((component as any).destroy$, 'complete');

            component.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });
});
