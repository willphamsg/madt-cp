import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject, DOCUMENT, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IFareConsole, IBusID, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { SoundService } from '@services/sound.service';
import {
    fareConsole,
    busIdInformation,
    updateFareConsole,
    updateBusIdInformation,
} from '@store/maintenance/maintenance.reducer';

@Component({
    selector: 'bus-id',
    imports: [
        CommonModule,
        MatIconModule,
        MatSelectModule,
        RouterModule,
        NgScrollbarModule,
        AppScrollBar,
        CustomKeyboardComponent,
        TranslateModule,
    ],
    templateUrl: './bus-id.component.html',
    styleUrls: ['./bus-id.component.scss'],
})
export class BusIdComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    ResponseStatus = ResponseStatus;
    MsgID = MsgID;

    isShowKeyboard: boolean = false;

    private readonly fareConsoleSetting$: Observable<IFareConsole>;
    private readonly busIdInformation$: Observable<IBusID>;

    busIdTemp: string = '';
    busIdData: IBusID = {
        busId: '',
        operator: {
            id: 0,
            label: '',
            serviceProvider: 0,
        },
        operators: [],
    };

    topics;
    step: number;
    busIdPrefix: string = '';
    busIdNumber: string = '';
    hasBusIdNumberError: boolean = false;

    operatorIdTemp: number | null = null;
    busIdPrefixList = ['SBS', 'SMB', 'SG', 'PC'];

    fareConsoleSetting: IFareConsole = {
        deckType: {
            id: 0,
            label: '',
        },
        blsStatus: 0,
        busId: '',
        date: '',
        time: '',
        complimentaryDays: 0,
        message: '',
    };

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        @Inject(DOCUMENT) private readonly _document: Document,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.step = 1;
        this.fareConsoleSetting$ = this.store.select(fareConsole);
        this.busIdInformation$ = this.store.select(busIdInformation);
    }

    ngOnInit() {
        this._handleOnDocumentClick();
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;

                // if (!this.busIdData?.operators?.length) {
                //     this.mqttService.publishWithMessageFormat({
                //         topic: this.topics?.maintenance?.get,
                //         msgID: MsgID.MAINTENANCE_OPERATOR,
                //         msgSubID: MsgSubID.REQUEST,
                //         payload: {},
                //     });
                // }
            }
        });

        this.fareConsoleSetting$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.fareConsoleSetting = data;
            if (data?.busId) {
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.maintenance?.get,
                    msgID: MsgID.MAINTENANCE_BUS_ID,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {
                        busId: data.busId,
                    },
                });
            }
        });

        this.busIdInformation$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.busIdData = data;
            this.busIdTemp = data.busId;
            this.operatorIdTemp = data.operator?.id || null;
            // console.log('this.busIdData', this.busIdData);

            if (data?.msgID === MsgID.MAINTENANCE_BUS_ID_SUBMIT && data?.status === ResponseStatus.SUCCESS) {
                this.store.dispatch(
                    updateFareConsole({
                        payload: {
                            ...this.fareConsoleSetting,
                            busId: this.busIdData.busId,
                        },
                    }),
                );
                this.store.dispatch(
                    updateBusIdInformation({
                        payload: {
                            ...this.busIdData,
                            status: undefined,
                            message: undefined,
                        },
                    }),
                );
                this.backToFareConsole();
            }
        });
    }

    private _handleOnDocumentClick(): void {
        this._document.addEventListener('click', (event: Event) => {
            const target = event.target || event.srcElement || event.currentTarget;
            const idAttr = target?.['id'];
            const parentNode = target?.['parentNode']?.['className'];
            // console.log('event', event);
            // console.log('parentNode', parentNode);
            // console.log('numeric-keyboard', parentNode?.includes('numeric-keyboard'));
            // // console.log('event.target()', idAttr);
            // // console.log('event.composedPath()', event.composedPath());
            const isClickKeyboard = parentNode?.includes('numeric-keyboard');
            if (!isClickKeyboard && this.isShowKeyboard) {
                this.isShowKeyboard = false;
            }

            if (idAttr === 'inputField' && !this.isShowKeyboard) {
                this.isShowKeyboard = true;
            }
        });
    }

    backToFareConsole() {
        this.router.navigate(['/maintenance/fare/fare-console']);
    }

    handleChangeStep(step: number) {
        this.step = step;
    }

    handleBusIdBack() {
        this.busIdPrefix = '';
        this.busIdNumber = '';
        this.hasBusIdNumberError = false;
        this.step = 1;
    }

    handleEnterBusId(value: string) {
        this.busIdNumber = value;
        this.hasBusIdNumberError = false;
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
                this.busIdNumber = inputField.value = value.slice(0, start - 1) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start - 1;
            } else {
                // There is a selection, delete the selected text
                this.busIdNumber = inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
            }
        } else if (target.id === 'enterKey') {
            this.isShowKeyboard = false;
            if (!value) return;
            this.handleEnterBusId(value);
        } else {
            const keyValue = target.innerText.trim();
            this.busIdNumber = inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
        }

        inputField.focus();
    }

    handleSubmitBusId() {
        if (!this.busIdPrefix) {
            return;
        }
        if (this.busIdNumber.length > 4 || this.busIdNumber.length < 1) {
            this.hasBusIdNumberError = true;
            return;
        }

        const newBusId = this.busIdPrefix + this.busIdNumber.padStart(4, '0');
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.MAINTENANCE_BUS_ID_CHANGE,
            msgSubID: MsgSubID.NOTIFY,
            payload: { newBusId },
        });
        this.store.dispatch(
            updateBusIdInformation({
                payload: { ...this.busIdData, busId: newBusId },
                msgID: this.busIdData.msgID,
            }),
        );

        this.busIdPrefix = '';
        this.busIdNumber = '';
        this.hasBusIdNumberError = false;
        this.step = 1;
    }

    handleCancelSubmitBusId() {
        this.store.dispatch(
            updateBusIdInformation({
                payload: {
                    status: undefined,
                    message: undefined,
                    busId: '',
                    operator: undefined,
                },
                msgID: this.busIdData.msgID,
            }),
        );
        this.backToFareConsole();
    }

    handleChangeOperator(operatorId: number) {
        // console.log('operatorId', operatorId);
        // console.log('operatorIdTemp', this.operatorIdTemp);

        this.operatorIdTemp = operatorId;
    }

    handleConfirmOperator() {
        const newOperator = this.busIdData?.operators?.find((operator) => operator.id === this.operatorIdTemp);
        if (newOperator) {
            this.store.dispatch(
                updateBusIdInformation({
                    payload: { ...this.busIdData, operator: newOperator },
                    msgID: this.busIdData.msgID,
                }),
            );
        }
        this.step = 1;
    }

    handleOperatorBack() {
        this.operatorIdTemp = this.busIdData?.operator?.id || null;
        this.step = 1;
    }

    handleSubmitForm() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_BUS_ID_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                busId: this.busIdData.busId,
                serviceProvider: this.busIdData?.operator?.serviceProvider,
            },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, busId: this.busIdData.busId },
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
            }),
        );
        this.backToFareConsole();
    }

    handleRetrySetBusId() {
        this.step = 1;
        this.store.dispatch(
            updateBusIdInformation({
                payload: { ...this.busIdData, status: undefined, message: undefined },
            }),
        );
    }

    ngOnDestroy(): void {
        this._document.removeEventListener('click', this._handleOnDocumentClick, false);
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateBusIdInformation({
                payload: {
                    status: undefined,
                    message: undefined,
                    busId: '',
                    operator: undefined,
                },
                msgID: this.busIdData.msgID,
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
