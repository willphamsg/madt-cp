import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgID, MsgSubID, IRetentionTicket, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { retentionTicket, updateRetentionTicket } from '@store/fare/fare.reducer';

@Component({
    selector: 'retention-ticket',
    imports: [RouterModule, TranslateModule],
    templateUrl: './retention-ticket.component.html',
    styleUrls: ['./retention-ticket.component.scss'],
})
export class PrintRetentionTicket implements OnInit, OnDestroy {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    private readonly destroy$ = new Subject<void>();
    private readonly retentionTicket$: Observable<IRetentionTicket>;
    retentionTicket: IRetentionTicket = {};

    selectedCV: number | null = null;

    topics;
    timeOutId;

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {
        this.retentionTicket$ = this.store.select(retentionTicket);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.retentionTicket$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.retentionTicket = data;
            // console.log('retentionTicket', this.retentionTicket);

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.fareTab?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: {
                            msgID: data.msgID,
                        },
                    });
                    this.backToPrinterOperation();
                }, data.timeout);
            }

            if (
                (data.msgID === MsgID.FARE_PO_PRINT_RTK_PRINT || data.msgID === MsgID.FARE_PO_PRINT_RTK_BACK) &&
                data.status === ResponseStatus.SUCCESS
            ) {
                this.backToPrinterOperation();
            }

            this.handleRetainMessages();
        });
    }

    private handleRetainMessages() {
        if (!this.selectedCV && this.retentionTicket.cvNum) {
            this.selectedCV = this.retentionTicket.cvNum;
        }

        if (!this.retentionTicket.cvList?.length) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.fareTab?.get,
                msgID: MsgID.FARE_PRINT_OPERATION_BUTTON,
                msgSubID: MsgSubID.REQUEST,
                payload: { buttonID: 'PRINT_RETENTION_TICKET' },
            });
        }
    }

    backToPrinterOperation() {
        this.router.navigate(['/fare/printer-operation']);
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_PO_PRINT_RTK_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleSelectCV(cvNum: number) {
        this.selectedCV = cvNum;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_PO_PRINT_RTK_SELECT,
            msgSubID: MsgSubID.REQUEST,
            payload: { cvNum },
        });
    }

    handleConfirmDetectCart() {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_PO_PRINT_RTK_CONFIRM,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                cvNum: this.selectedCV,
            },
        });
    }

    handleCancelDetectCart() {
        this.store.dispatch(
            updateRetentionTicket({
                payload: {
                    ...this.retentionTicket,
                    msgID: MsgID.FARE_PO_PRINT_RETENTION_TICKET,
                    status: undefined,
                    timeout: undefined,
                },
            }),
        );
    }

    handleStopDetectCard() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_PO_PRINT_RTK_TERMINATE,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                cvNum: this.selectedCV,
            },
        });
        this.store.dispatch(
            updateRetentionTicket({
                payload: {
                    ...this.retentionTicket,
                    status: undefined,
                    message: undefined,
                    cardDetail: undefined,
                    timeout: undefined,
                    msgID: MsgID.FARE_PO_PRINT_RETENTION_TICKET,
                },
            }),
        );
        this.selectedCV = null;
    }

    handleCancelPrint() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_PO_PRINT_RTK_CANCEL,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handlePrintRetention() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_PO_PRINT_RTK_PRINT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    removeTimeout() {
        clearTimeout(this.timeOutId);
        this.store.dispatch(
            updateRetentionTicket({
                payload: {
                    ...this.retentionTicket,
                    timeout: undefined,
                },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        clearTimeout(this.timeOutId);
        this.store.dispatch(
            updateRetentionTicket({
                payload: {
                    status: undefined,
                    message: undefined,
                    cardDetail: undefined,
                    timeout: undefined,
                },
            }),
        );
    }
}
