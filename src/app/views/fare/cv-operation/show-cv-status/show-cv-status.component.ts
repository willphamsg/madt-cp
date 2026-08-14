import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IShowCVStatus, MsgID, MsgSubID, FareCVStatus, FareCVSubStatus } from '@models';
import { AppState } from '@store/app.state';
import { showCVStatus } from '@store/fare/fare.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'show-cv-status',
    imports: [TranslateModule, AppScrollBar, RouterModule],
    templateUrl: './show-cv-status.component.html',
    styleUrls: ['./show-cv-status.component.scss'],
})
export class ShowCVStatusComponent implements OnInit {
    private destroy$ = new Subject<void>();

    private cvsStatus$: Observable<IShowCVStatus>;
    showCVStatus: IShowCVStatus = {
        cvStatus: [],
    };

    topics;
    FareCVStatus = FareCVStatus;
    FareCVSubStatus = FareCVSubStatus;

    constructor(
        private soundService: SoundService,
        private router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
    ) {
        this.cvsStatus$ = this.store.select(showCVStatus);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                // this.mqttService.publishWithMessageFormat({
                //     topic: this.topics?.fareTab?.get,
                //     msgID: MsgID.FARE_SHOW_CV_STATUS,
                //     msgSubID: MsgSubID.REQUEST,
                //     payload: {},
                // });
            }
        });

        this.cvsStatus$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.showCVStatus = data;
        });
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
