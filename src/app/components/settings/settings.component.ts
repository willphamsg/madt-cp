import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { Subject, takeUntil } from 'rxjs';
import { LocalStorageService } from '@services/local-storage.service';

import { IAudioVolume, LocalStorageKey } from '@app/models';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'madt-setting',
    imports: [MatSliderModule, TranslateModule, CommonModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    step: string = '';
    languages = ['EN', 'CH'];
    currentLanguage: string = 'EN';
    selectedLanguage: { id: string; label: string } | null = null;
    languageStep: number = 1;
    languageOptions = [
        { id: 'EN', label: 'English' },
        { id: 'CH', label: '华语' },
    ];

    @Input() fullScreen?: boolean = false;
    @Input() fromMaintenance?: boolean = false;
    @Output() closed: EventEmitter<void> = new EventEmitter<void>();
    @Output() confirmLanguage: EventEmitter<string> = new EventEmitter<string>();

    //audio
    audio: IAudioVolume = { value: 100 };
    @Output() changeAudioVolume: EventEmitter<number> = new EventEmitter<number>();

    constructor(
        private readonly soundService: SoundService,
        private readonly translate: TranslateService,
        protected store: Store<AppState>,
        private readonly localStorageService: LocalStorageService,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.currentLanguage = this.translate.currentLang?.toUpperCase() || 'EN';
        this.localStorageService
            .watch(LocalStorageKey.VOLUME)
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
                if (val) {
                    const volume: number = JSON.parse(val);
                    if (typeof volume === 'number') {
                        this.audio = { value: volume };
                    }
                }
            });
        this.localStorageService
            .watch(LocalStorageKey.LANGUAGE)
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
                if (val) {
                    const language: string = JSON.parse(val);
                    this.currentLanguage = language?.toUpperCase() || 'EN';
                } else {
                    this.currentLanguage = 'EN';
                }
                this.cdr.detectChanges();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onLanguageChange(isConfirm: boolean): void {
        if (isConfirm) {
            this.currentLanguage = this.selectedLanguage?.id || 'EN';
            this.confirmLanguage.emit(this.currentLanguage);
            if (this.fromMaintenance) {
                this.goBack();
            } else this.handleClose();
        } else {
            this.languageStep = 1;
        }
        this.selectedLanguage = null;
    }

    handleClose(): void {
        this.closed.emit();
    }

    handleSelectLang(lang: string): void {
        this.selectedLanguage = this.languageOptions.find((option) => option.id === lang) || null;
        this.languageStep = 2;
    }

    goBack(): void {
        this.step = '';
        this.languageStep = 1;
        this.selectedLanguage = null;
    }

    setStep(step: string): void {
        this.step = step;
    }

    handleChangeAudioVolume(value: number): void {
        this.changeAudioVolume.emit(value);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
