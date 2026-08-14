import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { MsgID, MsgSubID, LocalStorageKey } from '@models';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'language-setting',
    imports: [CommonModule, TranslateModule],
    templateUrl: './language-setting.component.html',
    styleUrl: './language-setting.component.scss',
})
export class LanguageSettingComponent implements OnDestroy, OnInit {
    private destroy$ = new Subject<void>();

    topics;
    languageOptions = [
        { id: 'EN', label: 'English' },
        { id: 'CH', label: '华语' },
    ];

    language: string = '';

    constructor(
        private soundService: SoundService,
        private router: Router,
        private mqttService: MqttService,
        private translate: TranslateService,
        protected store: Store<AppState>,
        private localStorageService: LocalStorageService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
        this.localStorageService
            .watch(LocalStorageKey.LANGUAGE)
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
                if (val) {
                    const language: string = JSON.parse(val);
                    this.language = language;
                }
            });
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleNavigate(page: string) {
        this.router.navigate([page]);
    }

    handleChangeLanguage(lang: string): void {
        this.language = lang;
        this.translate.use(this.language?.toLocaleLowerCase());
    }

    handleConfirmLanguage(isConfirm: boolean): void {
        if (isConfirm) {
            if (!this.language) {
                return;
            }
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.LANGUAGE_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: { language: this.language },
            });
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.tcToAllTabs,
                msgID: MsgID.LANGUAGE_SETTING,
                msgSubID: MsgSubID.NOTIFY,
                payload: { language: this.language },
                opts: { retain: false },
            });
            this.localStorageService.setItem(LocalStorageKey.LANGUAGE, JSON.stringify(this.language));
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
