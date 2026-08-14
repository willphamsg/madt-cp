import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { MsgID, MsgSubID, ResponseStatus, LocalStorageKey } from '@models';
import { AppState } from '@store/app.state';
import { SettingsComponent as SettingCpn } from '@components/settings/settings.component';

@Component({
    selector: 'settings',
    imports: [RouterModule, SettingCpn, TranslateModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;
    private readonly destroy$ = new Subject<void>();

    commissionError: string | null = null;
    topics;
    displaySettingsPopUp: boolean = false;

    constructor(
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly localStorageService: LocalStorageService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    handleConfirmLanguage(language: string): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.LANGUAGE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language },
        });
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.tcToAllTabs,
            msgID: MsgID.LANGUAGE_SETTING,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language },
            opts: { retain: false },
        });
        this.localStorageService.setItem(LocalStorageKey.LANGUAGE, JSON.stringify(language));
    }

    handleChangeAudioVolume(value: number): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.tcToAllTabs,
            msgID: MsgID.VOLUME_SETTING,
            msgSubID: MsgSubID.NOTIFY,
            payload: { value },
            opts: { retain: false },
        });
        this.localStorageService.setItem(LocalStorageKey.VOLUME, JSON.stringify(value));
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
