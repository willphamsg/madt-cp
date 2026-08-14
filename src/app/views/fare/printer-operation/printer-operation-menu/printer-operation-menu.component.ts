import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgSubID, MsgID } from '@models';

@Component({
    selector: 'printer-operation-menu',
    imports: [TranslateModule],
    templateUrl: './printer-operation-menu.component.html',
    styleUrls: ['./printer-operation-menu.component.scss'],
})
export class PrinterOperationMenuComponent implements OnInit {
    buttons = [
        {
            title: 'PRINT_INSPEC_TICKET',
            btn: 'PRINT_INSPECTOR_TICKET',
        },
        {
            title: 'PRINT_TEST_RECEIPT',
            btn: 'PRINT_TEST_RECEIPT',
        },
        {
            title: 'PRINT_RETENTION_TICKET',
            btn: 'PRINT_RETENTION_TICKET',
        },
        {
            title: 'PRINTER_ON',
            btn: 'PRINT_ON',
        },
        {
            title: 'PRINTER_OFF',
            btn: 'PRINT_OFF',
        },
        {
            title: 'PRINTER_STATUS',
            btn: 'PRINTER_STATUS',
        },
    ];
    urlPrefix = '/fare/printer-operation';
    private destroy$ = new Subject<void>();
    MsgID = MsgID;

    topics;

    constructor(
        private router: Router,
        private mqttService: MqttService,
        private soundService: SoundService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_BACK_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClick(btn: string): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_PRINT_OPERATION_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                btn,
            },
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
