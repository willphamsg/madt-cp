import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CustomSwitchComponent } from '@components/custom-switch/custom-switch.component';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { ICVPowerControl, MsgID, MsgSubID } from '@models';
import { AppState } from '@store/app.state';
import { cvPowerControl, updateCVPowerControl } from '@store/fare/fare.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'cv-power-control',
    imports: [CommonModule, MatIconModule, RouterModule, TranslateModule, CustomSwitchComponent],
    templateUrl: './cv-power-control.component.html',
    styleUrls: ['./cv-power-control.component.scss'],
})
export class CVPowerControlComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly cvPowerControl$: Observable<ICVPowerControl>;
    cvPowerControl: ICVPowerControl = {
        groups: [],
    };
    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.cvPowerControl$ = this.store.select(cvPowerControl);
    }
    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.cvPowerControl$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.cvPowerControl = data;
        });
    }

    handleToggleStatus(id: number) {
        const idx = this.cvPowerControl.groups.findIndex((item) => item.id === id);
        const nextGroup = this.cvPowerControl.groups.map((item) => ({ ...item }));
        nextGroup[idx].status = !nextGroup[idx].status;

        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CO_CV_POWER_CTRL_CHANGE,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                groupId: id,
                status: nextGroup[idx].status,
            },
        });
        this.store.dispatch(
            updateCVPowerControl({
                payload: {
                    ...this.cvPowerControl,
                    groups: nextGroup,
                },
            }),
        );
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CV_OPERATION_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
