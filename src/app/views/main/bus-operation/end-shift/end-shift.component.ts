import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MqttService } from '@services/mqtt.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MsgID, MsgSubID } from '@models';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'end-shift',
    imports: [RouterModule, TranslateModule],
    templateUrl: './end-shift.component.html',
    styleUrls: ['./end-shift.component.scss'],
})
export class EndShiftComponent implements OnInit {
    private destroy$ = new Subject<void>();

    topics;

    constructor(
        private soundService: SoundService,
        private router: Router,
        private mqttService: MqttService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    handleEndShift() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.END_SHIFT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    goBack() {
        this.router.navigate(['/main/bus-operation']);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
