import { Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Theme, ThemeType } from '@models';
import { routerUrls } from '@app/app.routes';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'app-setting',
    imports: [MatSelectModule, TranslateModule, CommonModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
    step: string = '';
    languages = ['EN', 'CH'];
    currentLanguage: string = 'EN';
    selectedLanguage: { id: string; label: string } | null = null;
    themeType = ThemeType;
    themeMode: Theme = ThemeType.DARK;
    languageStep: number = 1;

    languageOptions = [
        { id: 'EN', label: 'English' },
        { id: 'CH', label: '华语' },
    ];

    constructor(
        private soundService: SoundService,
        private translate: TranslateService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.currentLanguage = this.translate.currentLang?.toUpperCase() || 'EN';
    }

    onLanguageChange(isConfirm: boolean): void {
        if (isConfirm) {
            this.currentLanguage = this.selectedLanguage?.id || 'EN';
            this.backToMain();
        } else {
            this.languageStep = 1;
        }
        this.selectedLanguage = null;
    }

    toggleDarkMode(mode: Theme): void {
        this.themeMode = mode;
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove(mode === ThemeType.LIGHT ? 'dark-theme' : 'light-theme');
        body.classList.add(mode === ThemeType.LIGHT ? 'light-theme' : 'dark-theme');
        this.step = '';
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

    backToMain(): void {
        this.router.navigate(['/' + routerUrls.private.main.busStopInformation]);
    }

    setStep(step: string): void {
        this.step = step;
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
