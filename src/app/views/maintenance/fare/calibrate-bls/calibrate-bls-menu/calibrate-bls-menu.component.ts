import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { MsgID, MsgSubID } from '@models';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'calibrate-bls-menu',
    imports: [RouterModule, TranslateModule],
    templateUrl: './calibrate-bls-menu.component.html',
    styleUrls: ['./calibrate-bls-menu.component.scss'],
})
export class CalibrateBLSMenuComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        private readonly mqttService: MqttService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleSelect(type: number): void {
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.maintenance?.get,
            msgID: MsgID?.MAINTENANCE_CALIBRATE_BLS_TYPE,
            msgSubID: MsgSubID?.REQUEST,
            payload: { type },
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
