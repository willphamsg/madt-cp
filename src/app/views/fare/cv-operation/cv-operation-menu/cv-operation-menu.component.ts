import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgSubID, MsgID } from '@models';
@Component({
    selector: 'cv-operation-menu',
    imports: [TranslateModule],
    templateUrl: './cv-operation-menu.component.html',
    styleUrls: ['./cv-operation-menu.component.scss'],
})
export class CVOperationMenuComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    urlPrefix = '/fare/cv-operation';

    buttons = [
        {
            title: 'SHOW_CV_STATUS',
            btn: 'SHOW_CV_STATUS',
        },
        {
            title: 'SET_SV_ENTRY_EXIT',
            btn: 'SET_CV_ENTRY_EXIT',
        },
        {
            title: 'CV_MODE_CONTROL',
            btn: 'CV_MODE_CONTROL',
        },
        {
            title: 'POWER_ALL_CV_ON',
            btn: 'POWER_ALL_CV_ON',
        },
        {
            title: 'POWER_ALL_CV_OFF',
            btn: 'POWER_ALL_CV_OFF',
        },
        {
            title: 'CV_POWER_CONTROL',
            btn: 'CV_POWER_CONTROL',
        },
        {
            title: 'RESET_ALL_CV',
            btn: 'RESET_ALL_CV',
        },
    ];
    topics;

    constructor(
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_BACK_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClick(btn: string): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CV_OPERATION_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                btn,
            },
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
