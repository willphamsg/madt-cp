import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';

import { MsgSubID, MsgID } from '@models';

@Component({
    selector: 'app-ticketing-menu',
    imports: [TranslateModule],
    templateUrl: './ticketing-menu.component.html',
    styleUrls: ['./ticketing-menu.component.scss'],
})
export class TicketingMenuComponent implements OnInit {
    buttons = [
        {
            title: 'CANCEL_RIDE_CV1',
            icon: '/assets/images/icons/ticketing/cancel1.svg',
            url: '/fare/cancel-ride-cv1',
            btn: 'CANCEL_RIDE_CV1',
        },
        {
            title: 'CANCEL_RIDE_CV2',
            icon: '/assets/images/icons/ticketing/cancel2.svg',
            url: '/fare/cancel-ride-cv2',
            btn: 'CANCEL_RIDE_CV2',
        },
        {
            title: 'TRANSACTION',
            icon: '/assets/images/icons/ticketing/transaction.svg',
            url: '/fare/transaction',
            btn: 'TRANSACTION',
        },
        {
            title: 'PRINT_CASH_FARE',
            icon: '/assets/images/icons/ticketing/print.svg',
            url: '',
            btn: 'PRINT_CASH_FARE',
        },
        {
            title: 'CONCESSION_CV1',
            icon: '/assets/images/icons/ticketing/concession1.svg',
            url: '/fare/concession-cv1',
            btn: 'CONCESSION_CV1',
        },
        {
            title: 'CONCESSION_CV2',
            icon: '/assets/images/icons/ticketing/concession2.svg',
            url: '/fare/concession-cv2',
            btn: 'CONCESSION_CV2',
        },
        {
            title: 'TOP_UP',
            icon: '/assets/images/icons/ticketing/top-up.svg',
            url: '/fare/top-up',
            btn: 'TOP_UP',
        },
        // {
        //     title: 'Redeem Complimentary',
        //     icon: '/assets/images/icons/ticketing/redeem.svg',
        //     url: '/fare/redeem-complimentary',
        // },

        {
            title: 'CV_OPERATIONS',
            icon: '/assets/images/icons/ticketing/cv-operation.svg',
            url: '/fare/cv-operation',
            btn: 'CV_OPERATION',
        },
        {
            title: 'FARE_BUS_STOP_MODE',
            icon: '/assets/images/icons/ticketing/bls-operation.svg',
            url: '/fare/bls-operation',
            btn: 'FARE_BUS_STOP_MODE',
        },
        {
            title: 'PRINTER_OPERATIONS',
            icon: '/assets/images/icons/ticketing/printer-operation.svg',
            url: '/fare/printer-operation',
            btn: 'PRINT_OPERATION',
        },
        {
            title: 'EXTERNAL_DEVICES',
            icon: '/assets/images/icons/ticketing/iconnew-external.svg',
            url: '/fare/external-device',
            btn: 'EXTERNAL_DEVICES',
        },
    ];
    private destroy$ = new Subject<void>();

    topics;

    constructor(
        private router: Router,
        private mqttService: MqttService,
        private soundService: SoundService,
    ) {}

    ngOnInit() {
        this.mqttService.connectionStatus$.pipe(takeUntil(this.destroy$)).subscribe((isConnected) => {
            if (isConnected) {
                this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
                    if (configLoaded) {
                        const topics = this.mqttService.mqttConfig?.topics;
                        this.topics = topics;
                    }
                });
            }
        });
    }

    handleClick(btn: string): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_MENU_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                btn,
            },
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngAfterViewInit() {
        // document.getElementById('main-status')?.classList?.remove('hidden');
        // document.getElementById('settings-btn')?.classList?.remove('hidden');
        // document.getElementById('lock-btn')?.classList?.remove('hidden');
    }
}
