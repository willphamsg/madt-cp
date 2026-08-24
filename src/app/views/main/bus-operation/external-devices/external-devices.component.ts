import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { IExternalDevice } from '@models';
import { AppState } from '@store/app.state';
import { externalDevices, updateExternalDevices } from '@store/main/main.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { ExternalDevicesBase } from '@components/external-devices-base/external-devices.base';

@Component({
    selector: 'external-devices',
    imports: [AppScrollBar, RouterModule, TranslateModule],
    templateUrl: './external-devices.component.html',
    styleUrls: ['./external-devices.component.scss'],
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
