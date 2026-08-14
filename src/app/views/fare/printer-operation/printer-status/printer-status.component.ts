import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IPrintStatus, DEFAULT_TIMEOUT } from '@models';
import { AppState } from '@store/app.state';
import { printStatus } from '@store/fare/fare.reducer';
import { ButtonSoundDirective } from '@directives/button-sound.directive';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'printer-status',
    imports: [TranslateModule, RouterModule, CommonPopUp],
    templateUrl: './printer-status.component.html',
    styleUrls: ['./printer-status.component.scss'],
})
export class PrinterStatusComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    private readonly printStatus$: Observable<IPrintStatus>;
    printStatus: IPrintStatus = {
        printerStatus: 0,
    };

    topics;
    timeOutId;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.printStatus$ = this.store.select(printStatus);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
        this.printStatus$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.printStatus = data;
            // console.log('printStatus', this.printStatus);
            this.timeOutId = setTimeout(() => this.backToPrinterOperation(), DEFAULT_TIMEOUT);
        });
    }

    backToPrinterOperation() {
        clearTimeout(this.timeOutId);
        this.router.navigate(['/fare/printer-operation']);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        clearTimeout(this.timeOutId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
