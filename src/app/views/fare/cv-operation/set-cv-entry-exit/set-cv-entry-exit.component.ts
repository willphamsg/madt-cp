import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { ICVEntryExitControl, MsgID, MsgSubID } from '@models';
import { AppState } from '@store/app.state';
import { cvEntryExitControl } from '@store/fare/fare.reducer';

@Component({
    selector: 'set-cv-entry-exit',
    imports: [CommonModule, MatIconModule, RouterModule, TranslateModule],
    templateUrl: './set-cv-entry-exit.component.html',
    styleUrls: ['./set-cv-entry-exit.component.scss'],
})
export class SetCVEntryExitComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly cvEntryExitControl$: Observable<ICVEntryExitControl>;
    cvEntryExitControl: ICVEntryExitControl = {
        cvType: 0,
    };
    cvType: number = 0;
    type = '';
    topics;

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {
        this.cvEntryExitControl$ = this.store.select(cvEntryExitControl);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.cvEntryExitControl$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.cvEntryExitControl = data;
            this.cvType = data.cvType;
        });
    }

    handleSelectType(type: number) {
        this.cvType = type;
    }

    handleSubmitType(isConfirm: boolean) {
        if (!this.cvType) return;
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_CO_CV_ENTRY_EXIT_CONFIRM,
                msgSubID: MsgSubID.REQUEST,
                payload: {
                    cvType: this.cvType,
                },
            });
        } else {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_CO_CV_ENTRY_EXIT_CANCEL,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        }
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CV_OPERATION_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
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
