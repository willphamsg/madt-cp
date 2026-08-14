import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { updateActiveCVs } from '@app/store/main/main.reducer';

import { routerUrls } from '@app/app.routes';
import { MsgID, MsgSubID } from '@models';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
@Component({
    selector: 'rear-door',
    imports: [TranslateModule],
    templateUrl: './rear-door.component.html',
    styleUrls: ['./rear-door.component.scss'],
})
export class RearDoorComponent implements OnDestroy, OnInit {
    cvMode: string = '';
    private destroy$ = new Subject<void>();
    topics;

    constructor(
        private router: Router,
        private mqttService: MqttService,
        private translate: TranslateService,
        private store: Store<AppState>,
        private soundService: SoundService,
    ) {}

    ngOnInit(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    backToMain(): void {
        this.router.navigate([routerUrls?.private?.main?.busStopInformation]);
    }

    goBack(): void {
        this.backToMain();
    }

    handleChangeCvMode(cvMode: string): void {
        this.cvMode = cvMode;
    }

    handleToggleRearDoors(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_REAR_DOORS_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }
}
