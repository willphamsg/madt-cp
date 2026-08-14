import { Component, OnInit, OnDestroy, Inject, DOCUMENT } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { cashPayment, updateCashPayment } from '@store/main/main.reducer';

import { routerUrls } from '@app/app.routes';
import { ICashPayment, MsgID, MsgSubID, ECashType, ECashMode, ResponseStatus, MainButton } from '@models';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';

type BUS_STOP_MODE = 'ENTRY' | 'EXIT';

@Component({
    selector: 'cash-payment',
    imports: [AppScrollBar, CustomKeyboardComponent, TranslateModule, CommonPopUp],
    templateUrl: './cash-payment.component.html',
    styleUrls: ['./cash-payment.component.scss'],
})
export class CashPaymentComponent implements OnInit, OnDestroy {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;
    ECashMode = ECashMode;
    ECashType = ECashType;
    private readonly destroy$ = new Subject<void>();
    cash$: Observable<ICashPayment> = this.store.select(cashPayment);
    cashPayment: ICashPayment = {
        adultValues: [],
        seniorValues: [],
        studentValues: [],
    };

    fareMode: ECashMode = ECashMode.SINGLE;
    cashType: ECashType | string = '';
    selectedIndex: number = -1;
    selectedAmount: number = 0;
    quantity: string = '';
    isShowKeyboard: boolean = false;
    quantityError: string = '';

    selectedEntryBusStop: string = '';
    selectedEntryIdx?: number;
    selectedExitBusStop: string = '';
    selectedExitIdx?: number;

    changeBusStopMode: BUS_STOP_MODE | null = 'EXIT';

    currentMsgID: number | null = null;
    topics;

    constructor(
        private readonly router: Router,
        private readonly activeRouter: ActivatedRoute,
        private readonly mqttService: MqttService,
        private readonly store: Store<AppState>,
        private readonly soundService: SoundService,
        @Inject(DOCUMENT) private readonly _document: Document,
    ) {
        // this.inputValue = '';
    }

    ngOnInit() {
        this._handleOnDocumentClick();

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.cash$.pipe(takeUntil(this.destroy$)).subscribe((data: ICashPayment) => {
            this.cashPayment = data;
            // console.log('Cash Payment Data:', this.cashPayment);

            // multiple terminate or confirm
            if (
                (data.msgID === MsgID.MAIN_CASH_MULTI_CANCEL || data.msgID === MsgID.MAIN_CASH_FARE_CALCULATION) &&
                data.status === ResponseStatus.SUCCESS
            ) {
                this.backToMain();
            }

            if (
                (data.msgID === MsgID.MAIN_CASH_MULTI_CONFIRM ||
                    data.msgID === MsgID.MAIN_CASH_MULTI_BACK ||
                    data.msgID === MsgID.MAIN_CASH_FARE_CALCULATION_BACK) &&
                data.status === ResponseStatus.SUCCESS
            ) {
                // back to cash screen
                this.genCashDefaultOptions();
            }

            // remove change bus stop popup
            if (data.msgID === MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE) {
                this.changeBusStopMode = null;
                this.selectedExitBusStop = data.fareResult?.exitBusStop?.Busid || '';
                this.selectedEntryBusStop = data.fareResult?.entryBusStop?.Busid || '';
            }

            //display fare calculator screen
            if (data.msgID === MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP) {
                this.fareMode = ECashMode.CALCULATOR;
            }

            this.handleRetainMessages();
        });
    }

    private _handleOnDocumentClick(): void {
        this._document.addEventListener('click', (event: Event) => {
            const target = event.target || event.srcElement || event.currentTarget;
            const idAttr = target?.['id'];
            const parentNode = target?.['parentNode']?.['className'];
            const isClickKeyboard = parentNode?.includes('numeric-keyboard');

            if (!isClickKeyboard && this.isShowKeyboard) {
                this.isShowKeyboard = false;

                if (!this.validateQuantity()) {
                    this.quantityError = 'CAN_NOT_PRINT_MORE_THEN_10_TICKET';
                }
            }

            if (idAttr === 'inputField' && !this.isShowKeyboard) {
                this.isShowKeyboard = true;
            }
        });
    }

    formatKm(km: number | string): string {
        if (typeof km === 'number') {
            return km.toFixed(1);
        }
        if (typeof km === 'string') {
            const num = parseFloat(km);
            return isNaN(num) ? '0.0' : num.toFixed(1);
        }
        return km;
    }

    genCashDefaultOptions(): void {
        this.fareMode = ECashMode.SINGLE;
        this.selectedIndex = -1;
        this.selectedAmount = 0;
        this.changeBusStopMode = 'EXIT';
        this.quantity = '';
        this.isShowKeyboard = false;
    }

    private handleRetainMessages(): void {
        // console.log('Handling retain messages for cash payment', this.topics);
        if (
            ![
                !!this.cashPayment.seniorValues?.length,
                !!this.cashPayment.adultValues?.length,
                !!this.cashPayment.studentValues?.length,
            ].includes(true) &&
            this.topics?.mainTab?.get
        ) {
            //common
            this.mqttService.publishWithMessageFormat({
                topic: this.topics.mainTab?.get,
                msgID: MsgID.MAIN_BUTTON,
                msgSubID: MsgSubID.REQUEST,
                payload: { btn: MainButton.CASH },
            });
            this.currentMsgID = this.cashPayment.msgID || null;

            //fare calculator
            if (
                this.cashPayment.msgID === MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE ||
                this.cashPayment.msgID === MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP
            ) {
                this.fareMode = ECashMode.CALCULATOR;

                if (this.cashPayment.msgID === MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE)
                    this.changeBusStopMode = null;
            }
        }

        // this logic to get the cash amount list but don't change current screen
        if (!!this.currentMsgID && this.cashPayment.msgID === MsgID.MAIN_CASH) {
            this.store.dispatch(
                updateCashPayment({
                    payload: {
                        ...this.cashPayment,
                        msgID: this.currentMsgID,
                    },
                }),
            );
            this.currentMsgID = null;

            // set default selected cash type and index
            if (this.cashPayment.type) {
                this.setCash(this.cashPayment.type, this.cashPayment?.cashIndex || 0);
            }
        }
    }

    handleBackFareCalculator() {
        // only call for first time
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleResetBusStopPopup() {
        if (!this.cashPayment.fareResult) {
            this.handleBackFareCalculator();
        } else {
            this.changeBusStopMode = null;
            this.selectedExitBusStop = this.cashPayment.fareResult?.exitBusStop?.Busid || '';
            this.selectedEntryBusStop = this.cashPayment.fareResult?.entryBusStop?.Busid || '';
            this.selectedExitIdx = undefined;
            this.selectedEntryIdx = undefined;
        }
    }

    handleSelectBusStop(selected: string, idx: number) {
        if (this.changeBusStopMode === 'ENTRY') {
            this.selectedEntryBusStop = selected;
            this.selectedEntryIdx = idx;
        } else if (this.changeBusStopMode === 'EXIT') {
            this.selectedExitBusStop = selected;
            this.selectedExitIdx = idx;
        }
    }

    handleSubmitNewBusStop() {
        if (!this.selectedExitBusStop && this.changeBusStopMode === 'EXIT') {
            return;
        }
        if (!this.selectedEntryBusStop && this.changeBusStopMode === 'ENTRY') {
            return;
        }
        const payload = {};
        if (this.changeBusStopMode === 'ENTRY') {
            payload['entryBusStopId'] = this.selectedEntryBusStop;
            payload['selectionMode'] = 3;
            payload['index'] = this.selectedEntryIdx;
        } else if (this.changeBusStopMode === 'EXIT') {
            payload['exitBusStopId'] = this.selectedExitBusStop;
            payload['selectionMode'] = 4;
            payload['index'] = this.selectedExitIdx;
        }

        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
            msgSubID: MsgSubID.REQUEST,
            payload,
        });
    }

    handlePrintReceipt(type: ECashType, amount: number): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_FARE_CALCULATION_PRINT,
            msgSubID: MsgSubID.REQUEST,
            payload: { type, amount },
        });
    }

    handleChangeBusStop(type: BUS_STOP_MODE) {
        this.changeBusStopMode = type;

        if (!this.cashPayment.busStopList?.length) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        }
    }

    handleFareCalculator() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleConfirmFareCalculator() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_FARE_CALCULATION,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    setFareMode(mode: ECashMode): void {
        this.fareMode = mode;
        this.selectedIndex = -1; // Reset selected index when changing fare mode
        this.selectedAmount = 0; // Reset selected amount when changing fare mode

        if (this.fareMode === ECashMode.CALCULATOR) {
            this.handleFareCalculator();
        }
    }

    setCash(cashType: ECashType, cashIndex: number): void {
        this.selectedIndex = cashIndex;
        this.cashType = cashType;

        if (cashType === ECashType.ADULT) {
            this.selectedAmount = this.cashPayment.adultValues?.find((_c) => _c.index === cashIndex)?.value || 0;
        } else if (cashType === ECashType.SENIOR) {
            this.selectedAmount = this.cashPayment.seniorValues?.find((_c) => _c.index === cashIndex)?.value || 0;
        } else if (cashType === ECashType.STUDENT) {
            this.selectedAmount = this.cashPayment.studentValues?.find((_c) => _c.index === cashIndex)?.value || 0;
        }

        if (this.fareMode === ECashMode.MULTIPLE && this.selectedIndex >= 0) {
            this.setMultipleAmount(cashType, cashIndex);
        } else if (this.fareMode === ECashMode.SINGLE && this.selectedIndex >= 0) {
            this.printSingleTicket(cashType, cashIndex);
        }
    }

    printSingleTicket(type, cashIndex): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_SINGLE_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: { type, cashIndex },
        });
    }

    setMultipleAmount(type, cashIndex): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_MULTI_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: { type, cashIndex },
        });
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_MULTI_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    backToMain(): void {
        this.router.navigate([routerUrls?.private?.main?.busStopInformation]);
    }

    handleChangeInput(event: Event): void {
        const inputField = <HTMLInputElement>document.getElementById('inputField');
        const start = inputField?.selectionStart || 0;
        const end = inputField?.selectionEnd || 0;
        const value = inputField.value;
        const target = <HTMLDivElement>event.target;

        if (target.id === 'backspaceKey') {
            if (start === end) {
                // No selection, just delete the character before the cursor
                this.quantity = inputField.value = value.slice(0, start - 1) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start - 1;
                this.quantityError = '';
            } else {
                // There is a selection, delete the selected text
                this.quantity = inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
                this.quantityError = '';
            }
        } else if (target.id === 'enterKey') {
            this.isShowKeyboard = false;
            if (!value) return;
            this.handleEnterNumberOfTicket();
        } else {
            const keyValue = target.innerText.trim();
            this.quantity = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            this.quantityError = '';
        }

        inputField.focus();
    }

    handleEnterNumberOfTicket(): void {
        if (!this.validateQuantity()) {
            this.quantityError = 'CAN_NOT_PRINT_MORE_THEN_10_TICKET';
            return;
        }
    }

    validateQuantity(): boolean {
        this.quantityError = '';

        if (+this.quantity > 10) {
            this.quantityError = 'CAN_NOT_PRINT_MORE_THEN_10_TICKET';
            return false;
        }
        return true;
    }

    printMultipleTicket(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_MULTI_CONFIRM,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                type: this.cashType,
                quantity: Number(this.quantity),
                cashIndex: this.selectedIndex,
            },
        });
    }

    handleTerminate(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_MULTI_CANCEL,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handlePrintInspectorTicket() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_INSPECTOR_TICKET,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleFareBox() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAIN_CASH_FARE_BOX,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleCloseErrorPopup() {
        this.store.dispatch(
            updateCashPayment({
                payload: {
                    ...this.cashPayment,
                    status: ResponseStatus.SUCCESS,
                },
            }),
        );
    }

    resetCashPaymentState(): void {
        this.store.dispatch(
            updateCashPayment({
                payload: {
                    ...this.cashPayment,
                    fareResult: undefined,
                },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this._document.removeEventListener('click', this._handleOnDocumentClick, false);
        this.resetCashPaymentState();

        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
        // clearTimeout(this.timeOutId);
    }
}
