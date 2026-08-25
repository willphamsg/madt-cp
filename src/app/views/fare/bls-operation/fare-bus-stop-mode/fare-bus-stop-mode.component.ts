import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { IFareBusStopMode, MsgID, MsgSubID } from '@models';
import { fareBusStopMode, updateFareBusStopMode } from '@store/fare/fare.reducer';
import { FareBusStopModeBase } from '@components/fare-bus-stop-mode-base/fare-bus-stop-mode.base';
import { FareBusStopModeViewComponent } from '@components/fare-bus-stop-mode-view/fare-bus-stop-mode-view.component';

@Component({
    selector: 'fare-bus-stop-mode',
    imports: [FareBusStopModeViewComponent],
    templateUrl: './fare-bus-stop-mode.component.html',
})
export class FareBusStopMode extends FareBusStopModeBase {
    protected readonly topicKey = 'fareTab' as const;
    protected readonly fareBusStopMode$: Observable<IFareBusStopMode> = this.store.select(fareBusStopMode);

    constructor(
        private readonly router: Router,
        store: Store<AppState>,
        mqttService: MqttService,
        soundService: SoundService,
    ) {
        super(store, mqttService, soundService);
    }

    protected override onFareBusStopModeData(data: IFareBusStopMode): void {
        if (
            (data.msgID === MsgID.FARE_BUS_STOP_MODE && !this.finaleMode) ||
            data.msgID === MsgID.FARE_BUS_STOP_MODE_SUBMIT
        ) {
            this.finaleMode = data.mode || 0;
        }
    }

    override handleBack(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_BACK_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    protected override updateFareBusStopModeState(payload: Partial<IFareBusStopMode>): void {
        this.store.dispatch(updateFareBusStopMode({ payload }));
    }
}
