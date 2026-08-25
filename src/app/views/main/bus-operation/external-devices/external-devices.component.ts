import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { IExternalDevice } from '@models';
import { AppState } from '@store/app.state';
import { externalDevices, updateExternalDevices } from '@store/main/main.reducer';
import { ExternalDevicesBase } from '@components/external-devices-base/external-devices.base';
import { ExternalDevicesViewComponent } from '@components/external-devices-view/external-devices-view.component';

@Component({
    selector: 'external-devices',
    imports: [ExternalDevicesViewComponent],
    templateUrl: './external-devices.component.html',
})
export class ExternalDevicesComponent extends ExternalDevicesBase {
    protected readonly topicKey = 'mainTab' as const;
    protected readonly externalDevices$: Observable<IExternalDevice> = this.store.select(externalDevices);

    constructor(router: Router, store: Store<AppState>, mqttService: MqttService, soundService: SoundService) {
        super(router, store, mqttService, soundService);
    }

    protected override updateExternalDevicesState(payload: IExternalDevice): void {
        this.store.dispatch(updateExternalDevices({ payload }));
    }
}
