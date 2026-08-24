import { Component, OnDestroy, OnInit } from '@angular/core';
import { routerUrls } from '@app/app.routes';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { MsgID, MsgSubID } from '@models';
import { MqttService } from '@services/mqtt.service';
import { AppState } from '@store/app.state';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'app-start-trip-details-issue',
    imports: [RouterModule, TranslateModule, CommonModule],
    templateUrl: './start-trip-details-issue.component.html',
    styleUrl: './start-trip-details-issue.component.scss',
})
export class StartTripDetailsIssueComponent implements OnInit, OnDestroy {
    // tripTypeDetails = StartTripTypes;

    private readonly destroy$ = new Subject<void>();
    // private startTrip$: Observable<IStartTrip> = this.store.select(startTrip);
    // startTripData: IStartTrip = {
    //     type: this.tripTypeDetails.FMS_NO_INFO,
    // };

    topics;
    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        // this.startTrip$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        //     this.startTripData = data;
        // });
    }

    backToBusOperation() {
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_CANCEL_FLOW,
            msgSubID: MsgSubID?.NOTIFY,
            payload: {},
        });
        this.router.navigate([routerUrls?.private?.main?.busOperation?.url]);
    }

    handleSettingTrip() {
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_SELECT_FARE_DETAIL_BTN,
            msgSubID: MsgSubID?.NOTIFY,
            payload: {},
        });
        // this.router.navigate([routerUrls?.private?.main?.busOperation?.startTripValidInfo]);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
