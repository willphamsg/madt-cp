import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgID, MsgSubID, ITransaction, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { transaction, updateTransaction } from '@store/fare/fare.reducer';
import { routerUrls } from '@app/app.routes';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';

@Component({
    selector: 'transaction',
    imports: [CommonModule, RouterModule, TranslateModule, CommonPopUp, AppScrollBar],
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit, OnDestroy {
    readonly MsgID = MsgID;
    readonly ResponseStatus = ResponseStatus;

    private readonly destroy$ = new Subject<void>();
    private readonly transaction$: Observable<ITransaction>;

    transaction: ITransaction = {};
    selectedCV: number | null = null;

    private topics: any;
    private timeOutId: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
        private soundService: SoundService,
    ) {
        this.transaction$ = this.store.select(transaction);
    }

    ngOnInit(): void {
        this.initMqttConfig();
        this.initTransactionSubscription();
    }

    ngOnDestroy(): void {
        this.cleanupResources();
    }

    private initMqttConfig(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    private initTransactionSubscription(): void {
        this.transaction$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.transaction = data;
            this.handleTransactionUpdate(data);
            this.handleRetainMessages();
        });
    }

    private handleTransactionUpdate(data: ITransaction): void {
        this.clearExistingTimeout();

        if (data.timeout && data.timeout > 0) {
            this.scheduleTimeout(data);
        }
    }

    private handleRetainMessages(): void {
        if (!this.selectedCV && this.transaction.cvNum) {
            this.selectedCV = this.transaction.cvNum;
        }
        if (!this.transaction.cvList?.length) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_MENU_BUTTON,
                msgSubID: MsgSubID.REQUEST,
                payload: { btn: 'TRANSACTION' },
            });
        }
    }

    private clearExistingTimeout(): void {
        if (this.timeOutId) {
            clearTimeout(this.timeOutId);
            this.timeOutId = undefined;
        }
    }

    private scheduleTimeout(data: ITransaction): void {
        this.timeOutId = setTimeout(() => {
            this.publishTimeoutMessage(data.msgID);
            this.backToFirstScreen();
        }, data.timeout);
    }

    private publishTimeoutMessage(msgID: number | undefined): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.TIMEOUT_MESSAGE,
            msgSubID: MsgSubID.NOTIFY,
            payload: { msgID },
        });
    }

    backToPrinterOperation(): void {
        this.router.navigate([`${routerUrls.private.fare.printerOperation.url}`]);
    }

    backToFirstScreen(): void {
        this.updateTransactionState({
            ...this.transaction,
            msgID: MsgID.FARE_TRANSACTION,
            status: undefined,
            timeout: undefined,
        });
    }

    formatValue(value: number | string): string {
        if (typeof value === 'number') {
            return value < 0 ? `-$${Math.abs(value).toFixed(2)}` : `$${value.toFixed(2)}`;
        }
        return value;
    }

    handleBack(): void {
        this.publishMqttMessage({
            msgID: MsgID.FARE_BACK_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    backToCVScreen(): void {
        this.publishMqttMessage({
            msgID: MsgID.FARE_TRANSACTION_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    backToProgressScreen(): void {
        this.updateTransactionState({
            ...this.transaction,
            status: 2,
            message: undefined,
            msgID: MsgID.FARE_TRANSACTION_CONFIRM,
            timeout: 30000, // 30 seconds
        });
    }

    handleSelectCV(cvNum: number): void {
        this.selectedCV = cvNum;
        this.publishMqttMessage({
            msgID: MsgID.FARE_TRANSACTION_SELECT,
            msgSubID: MsgSubID.REQUEST,
            payload: { cvNum },
        });
    }

    handleConfirm(isConfirm: boolean): void {
        if (isConfirm) {
            this.removeTimeout();
            this.publishMqttMessage({
                msgID: MsgID.FARE_TRANSACTION_CONFIRM,
                msgSubID: MsgSubID.REQUEST,
                payload: { cvNum: this.selectedCV },
            });
        } else {
            this.backToFirstScreen();
        }
    }

    handleStopTransaction(): void {
        this.publishMqttMessage({
            msgID: MsgID.FARE_TRANSACTION_TERMINATE,
            msgSubID: MsgSubID.NOTIFY,
            payload: { cvNum: this.selectedCV },
        });

        this.resetTransactionState();
        this.selectedCV = null;
    }

    removeTimeout(): void {
        this.clearExistingTimeout();
        this.updateTransactionState({
            ...this.transaction,
            timeout: undefined,
        });
    }

    private publishMqttMessage(config: { msgID: number; msgSubID: number; payload: any }): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            ...config,
        });
    }

    private updateTransactionState(payload: Partial<ITransaction>): void {
        this.store.dispatch(updateTransaction({ payload }));
    }

    private resetTransactionState(): void {
        this.updateTransactionState({
            ...this.transaction,
            status: undefined,
            message: undefined,
            msgID: MsgID.FARE_TRANSACTION,
            timeout: undefined,
        });
    }

    private cleanupResources(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearExistingTimeout();

        // Reset transaction state on component destruction
        this.store.dispatch(
            updateTransaction({
                payload: {
                    status: undefined,
                    message: undefined,
                    timeout: undefined,
                    cardValue: undefined,
                    cvList: undefined,
                    transactions: undefined,
                },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
