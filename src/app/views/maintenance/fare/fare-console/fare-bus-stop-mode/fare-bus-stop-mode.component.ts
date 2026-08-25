import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { IFareBusStopMode, IFareConsole, MsgID, ResponseStatus } from '@models';
import {
    fareBusStopMode,
    updateFareBusStopMode,
    fareConsole,
    updateFareConsole,
} from '@store/maintenance/maintenance.reducer';
import { FareBusStopModeBase } from '@components/fare-bus-stop-mode-base/fare-bus-stop-mode.base';
import { FareBusStopModeViewComponent } from '@components/fare-bus-stop-mode-view/fare-bus-stop-mode-view.component';

@Component({
    selector: 'fare-bus-stop-mode',
    imports: [FareBusStopModeViewComponent],
    templateUrl: './fare-bus-stop-mode.component.html',
})
export class FareBusStopMode extends FareBusStopModeBase {
    protected readonly topicKey = 'maintenance' as const;
    protected readonly fareBusStopMode$: Observable<IFareBusStopMode> = this.store.select(fareBusStopMode);
    fareConsole$: Observable<IFareConsole> = this.store.select(fareConsole);
    fareConsoleSetting: IFareConsole = {
        deckType: {
            id: 0,
            label: '',
        },
        blsStatus: 0,
        busId: '',
        date: '',
        time: '',
        dateTime: '',
        complimentaryDays: 0,
        message: '',
    };

    constructor(
        private readonly router: Router,
        store: Store<AppState>,
        mqttService: MqttService,
        soundService: SoundService,
    ) {
        super(store, mqttService, soundService);
    }

    protected override initExtraSubscriptions(): void {
        this.fareConsole$.pipe(takeUntil(this.destroy$)).subscribe((data: IFareConsole) => {
            this.fareConsoleSetting = data;
            if (!this.finaleMode) {
                this.finaleMode = data.fareBusStopMode || 0;
            }
        });
    }

    protected override onFareBusStopModeData(data: IFareBusStopMode): void {
        if (data?.msgID === MsgID.FARE_BUS_STOP_MODE_SUBMIT && data?.status === ResponseStatus.SUCCESS) {
            this.store.dispatch(
                updateFareConsole({
                    payload: { ...this.fareConsoleSetting, fareBusStopMode: this.mode || data.mode },
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
            this.finaleMode = data.mode || 0;
        }
    }

    override handleBack(): void {
        // this.mqttService.publishWithMessageFormat({
        //     topic: this.topics?.maintenance?.get,
        //     msgID: MsgID.FARE_BACK_BUTTON,
        //     msgSubID: MsgSubID.REQUEST,
        //     payload: {},
        // });
        this.router.navigate(['/maintenance/fare/fare-console']);
    }

    protected override updateFareBusStopModeState(payload: Partial<IFareBusStopMode>): void {
        this.store.dispatch(updateFareBusStopMode({ payload }));
    }
}
