import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { ISaveTransaction, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { saveTransaction, updateSaveTransaction } from '@store/maintenance/maintenance.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'save-transaction',
    imports: [RouterModule, TranslateModule, CommonPopUp],
    templateUrl: './save-transaction.component.html',
    styleUrls: ['./save-transaction.component.scss'],
})
export class SaveTransactionComponent implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;

    private readonly destroy$ = new Subject<void>();
    private readonly saveTransaction$: Observable<ISaveTransaction>;
    saveTransaction: ISaveTransaction = {};

    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.saveTransaction$ = this.store.select(saveTransaction);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.saveTransaction$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.saveTransaction = data;
            // console.log('Redetect CV Data:', this.redetectCV);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateSaveTransaction({
                payload: {},
            }),
        );
    }

    handleClickButton() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_SAVE_TRANSACTION,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClickOK() {
        this.store.dispatch(
            updateSaveTransaction({
                payload: {},
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
