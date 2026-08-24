import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IRedetectCV, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { redetectCV, updateRedetectCV } from '@store/maintenance/maintenance.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'redetect-cv',
    imports: [RouterModule, TranslateModule, AppScrollBar],
    templateUrl: './redetect-cv.component.html',
    styleUrls: ['./redetect-cv.component.scss'],
})
export class RedetectCVComponent implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;

    private readonly destroy$ = new Subject<void>();
    private readonly redetectCV$: Observable<IRedetectCV>;
    redetectCV: IRedetectCV = {};

    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.redetectCV$ = this.store.select(redetectCV);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.redetectCV$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.redetectCV = data;
            // console.log('Redetect CV Data:', this.redetectCV);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateRedetectCV({
                payload: {},
            }),
        );
    }

    handleClickButton() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_REDETECT_CV,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClickOK() {
        this.store.dispatch(
            updateRedetectCV({
                payload: {},
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
