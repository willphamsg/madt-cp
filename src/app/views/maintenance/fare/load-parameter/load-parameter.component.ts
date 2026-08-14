import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { ILoadParameter, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { loadParameter, updateLoadParameter } from '@store/maintenance/maintenance.reducer';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';
@Component({
    selector: 'load-parameter',
    imports: [RouterModule, TranslateModule, CommonPopUp],
    templateUrl: './load-parameter.component.html',
    styleUrls: ['./load-parameter.component.scss'],
})
export class LoadParameterComponent implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;

    private readonly destroy$ = new Subject<void>();
    private readonly loadParameter$: Observable<ILoadParameter>;
    loadParameter: ILoadParameter = {};

    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.loadParameter$ = this.store.select(loadParameter);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.loadParameter$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.loadParameter = data;
            // console.log('Redetect CV Data:', this.loadParameter);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateLoadParameter({
                payload: {},
            }),
        );
    }

    handleClickButton() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_LOAD_PARAMETERS,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClickOK() {
        this.store.dispatch(
            updateLoadParameter({
                payload: {},
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
