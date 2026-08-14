import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { MqttService } from '@services/mqtt.service';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import {
    fareConsole,
    updateFareConsole,
    cmBusIdInformation,
    updateCommissionBusIdInformation,
} from '@store/main/main.reducer';
import { IFareConsole, IBusID, MsgID, MsgSubID, ResponseStatus } from '@models';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'fare-console-setting',
    imports: [
        CommonModule,
        TranslateModule,
        MatSelectModule,
        NgScrollbarModule,
        CustomKeyboardComponent,
        AppScrollBar,
        CommonPopUp,
    ],
    templateUrl: './fare-console-setting.component.html',
    styleUrl: './fare-console-setting.component.scss',
})
export class FareConsoleSettingComponent implements OnDestroy, OnInit {
    private readonly destroy$ = new Subject<void>();
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    fareConsole$: Observable<IFareConsole>;
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

    settingType: string = '';
    hasSubmitError: boolean = false;
    highlightMissingFields: boolean = false;
    topics;

    selectedDeckTypeId: number = 0;

    blsStep = 1;
    selectedBlsStatus: number = 0;
    hasInputError = false;

    //bus id
    isShowKeyboard: boolean = false;
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
    busIdStep: number = 1;
    busIdPrefix: string = '';
    busIdNumber: string = '';
    hasBusIdNumberError: boolean = false;
    operatorIdTemp: number | null = null;
    busIdPrefixList = ['SBS', 'SMB', 'SG', 'PC'];

    dateTimeInputType: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'day';
    dateValue = {
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: '',
        second: '',
    };
    hasTimeInputError: boolean = false;
    dateTimeErrorMessage: string = '';

    missingFields: { value?: string | number; label: string }[] = [];

    constructor(
        private readonly soundService: SoundService,
        private readonly datePipe: DatePipe,
        private readonly router: Router,
        private readonly mqttService: MqttService,
        @Inject(DOCUMENT) private readonly _document: Document,
        private readonly store: Store<AppState>,
        private readonly translate: TranslateService,
    ) {
        this.fareConsole$ = this.store.select(fareConsole);
        this.busIdInformation$ = this.store.select(cmBusIdInformation);
    }

    ngOnInit() {
        this._handleOnDocumentClick();

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.fareConsole$.pipe(takeUntil(this.destroy$)).subscribe((data: IFareConsole) => {
            this.fareConsoleSetting = data;
            this.selectedDeckTypeId = data?.deckType?.id || 0;

            //handle change screen based on retain message
            if (!this.settingType) {
                if (data?.msgID === MsgID.DECK_TYPE_LIST) {
                    this.settingType = 'deckType';
                }
            }

            // console.log('fareConsoleSetting', this.fareConsoleSetting);
            // this.resetDateTimeSetting();
            this.handleDeleteParameterByNotify();
        });

        this.busIdInformation$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.busIdData = data;
            this.busIdTemp = data.busId;
            this.operatorIdTemp = data.operator?.id || null;
            // console.log('this.busIdData', this.busIdData);

            //handle change screen based on retain message
            if (!this.settingType && data.msgID && !this.fareConsoleSetting.msgID) {
                this.settingType = 'busId';

                if (data.msgID === MsgID.COMMISSION_OPERATOR) {
                    this.busIdStep = 3;
                }
            }

            if (data?.msgID === MsgID.COMMISSION_BUS_ID_SUBMIT && data?.status === ResponseStatus.SUCCESS) {
                this.store.dispatch(
                    updateFareConsole({
                        payload: {
                            ...this.fareConsoleSetting,
                            busId: this.busIdData.busId,
                        },
                        msgID: MsgID.FARE_CONSOLE,
                    }),
                );
                this.store.dispatch(
                    updateCommissionBusIdInformation({
                        payload: {
                            busId: '',
                            operator: {
                                id: 0,
                                label: '',
                                serviceProvider: 0,
                            },
                            status: undefined,
                            message: undefined,
                        },
                    }),
                );
                this.backToFareConsole();
            }
        });
    }

    handleChangeSetting(setting: string) {
        this.settingType = setting;
        switch (setting) {
            case 'deckType':
                this.selectChangeDeckType();
                break;
            case 'busId':
                this.selectChangeBusId();
                break;
        }
    }

    // DECK TYPE HANDLE
    selectChangeDeckType() {
        if (!this.fareConsoleSetting?.deckTypeList?.length) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.DECK_TYPE_LIST,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        }
    }

    handleChangeDeckType(id: number) {
        this.selectedDeckTypeId = id;
    }

    handleConfirmDeckType(isConfirm: boolean) {
        if (isConfirm) {
            const nextSetting = { ...this.fareConsoleSetting };
            const nextDeckType = this.fareConsoleSetting.deckTypeList?.find(
                (deck) => deck.id === this.selectedDeckTypeId,
            );
            if (nextDeckType) {
                nextSetting.deckType = nextDeckType;
            }

            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.DECK_TYPE_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    deckType: this.selectedDeckTypeId,
                },
            });
            this.store.dispatch(
                updateFareConsole({
                    payload: nextSetting,
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
        } else {
            this.selectedDeckTypeId = this.fareConsoleSetting.deckType?.id || 0;
            this.store.dispatch(
                updateFareConsole({
                    payload: { ...this.fareConsoleSetting },
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
        }
        this.settingType = '';
    }

    // BLS STATUS HANDLE
    handleChangeBlsStatus(status: number) {
        this.selectedBlsStatus = status;
        this.blsStep = 2;
    }

    handleConfirmBlsStatus(isConfirm: boolean) {
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.BLS_STATUS_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    blsStatus: this.selectedBlsStatus,
                },
            });
            this.store.dispatch(
                updateFareConsole({
                    payload: { ...this.fareConsoleSetting, blsStatus: this.selectedBlsStatus },
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
            this.settingType = '';
        }
        this.blsStep = 1;
    }

    // TIME AND DATE HANDLE
    private resetDateTimeSetting() {
        this.dateTimeInputType = 'day';
        this.hasTimeInputError = false;
        this.dateTimeErrorMessage = '';
        this.dateValue = {
            year: '',
            month: '',
            day: '',
            hour: '',
            minute: '',
            second: '',
        };
    }

    handleClickBack() {
        //reset deck type
        this.selectedDeckTypeId = this.fareConsoleSetting.deckType?.id || 0;

        //reset BLS
        this.blsStep = 1;

        //reset Date and Time
        this.resetDateTimeSetting();

        //reset bus id
        this.handleBusIdBack();
        this.clearBusIdData();

        //back to main fare console setting
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );

        this.settingType = '';
    }

    handleChangeDateTime(event: Event): void {
        if (!this.dateTimeInputType) return;
        const inputField = <HTMLInputElement>document.getElementById(this.dateTimeInputType || '');
        const start = inputField?.selectionStart || 0;
        const end = inputField?.selectionEnd || 0;
        const value = inputField.value;
        const target = <HTMLDivElement>event.target;

        if (target.id === 'backspaceKey') {
            if (start > 0) {
                if (start === end) {
                    // No selection, just delete the character before the cursor
                    inputField.value = this.setValueForDateElement(value.slice(0, start - 1) + value.slice(end));
                    inputField.selectionStart = inputField.selectionEnd = start - 1;
                } else {
                    // There is a selection, delete the selected text
                    inputField.value = this.setValueForDateElement(value.slice(0, start) + value.slice(end));
                    inputField.selectionStart = inputField.selectionEnd = start;
                }

                if (['day', 'month', 'year'].includes(this.dateTimeInputType)) {
                    this.dateTimeErrorMessage = '';
                } else {
                    this.hasTimeInputError = false;
                }
            }
        } else if (target.id === 'enterKey') {
            this.handleConfirmDate();
        } else {
            if (
                (this.dateTimeInputType === 'year' && value.length >= 4) ||
                (this.dateTimeInputType !== 'year' && value.length >= 2)
            ) {
                inputField.focus();
                this.autoFocusOnInput(inputField, inputField.value, target.id === 'backspaceKey', start === 0);
                return;
            }

            const keyValue = target.innerText.trim();
            inputField.value = this.setValueForDateElement(value.slice(0, start) + keyValue + value.slice(end));
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;

            if (['day', 'month', 'year'].includes(this.dateTimeInputType)) {
                this.dateTimeErrorMessage = '';
            } else {
                this.hasTimeInputError = false;
            }
        }

        inputField.focus();
        this.autoFocusOnInput(inputField, inputField.value, target.id === 'backspaceKey', start === 0);
    }

    private setValueForDateElement(value: string): string {
        if (!this.dateTimeInputType) return '';
        let outPutVal: string = value.trim();
        switch (this.dateTimeInputType) {
            case 'month':
                outPutVal = Number(value) > 12 ? '12' : value;
                break;
            case 'day':
                outPutVal = Number(value) > 31 ? '31' : value;
                break;
            case 'hour':
                outPutVal = Number(value) > 23 ? '23' : value;
                break;
            case 'minute':
                outPutVal = Number(value) > 59 ? '59' : value;
                break;
            case 'second':
                outPutVal = Number(value) > 59 ? '59' : value;
                break;
        }

        this.dateValue[this.dateTimeInputType] = outPutVal;

        return outPutVal;
    }

    private autoFocusOnInput(inputField: HTMLInputElement, value: string, isBackspace: boolean, firstCursor: boolean) {
        const nextTabIndex = inputField.tabIndex + (isBackspace ? -1 : 1);
        const nextInputField = document.querySelector<HTMLInputElement>(`input[tabindex="${nextTabIndex}"]`);
        const inputType = inputField.id as 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

        if (!nextInputField) return;
        const nextInputValueLength = nextInputField?.value?.length ?? 0;

        //next
        if (value.length === (inputType === 'year' ? 4 : 2) && !isBackspace) {
            nextInputField.focus();
            // Set cursor at the end of the next input field
            nextInputField.setSelectionRange(nextInputValueLength, nextInputValueLength);
            this.dateTimeInputType = nextInputField.id as 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
        } else if ((firstCursor || !value) && isBackspace) {
            nextInputField.focus();
            // Set cursor at the end of the next input field
            nextInputField.setSelectionRange(nextInputValueLength, nextInputValueLength);
            this.dateTimeInputType = nextInputField.id as 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
        }
    }

    private handleConfirmDate() {
        // console.log('dateValue', this.dateValue);
        this.hasTimeInputError = false;
        this.dateTimeErrorMessage = '';
        if (!this.dateValue.year || !this.dateValue.month || !this.dateValue.day) {
            this.dateTimeErrorMessage = 'INVALID_ENTRY';
        }
        if (!this.dateValue.hour || !this.dateValue.minute || !this.dateValue.second) {
            this.hasTimeInputError = true;
        }

        if (this.dateTimeErrorMessage || this.hasTimeInputError) {
            return;
        }

        const date = new Date(
            Number(this.dateValue.year),
            Number(this.dateValue.month) - 1, // Subtract 1 because months are 0-indexed
            Number(this.dateValue.day),
            Number(this.dateValue.hour),
            Number(this.dateValue.minute),
            Number(this.dateValue.second),
        );

        const validDate =
            date.getFullYear() == Number(this.dateValue.year) &&
            date.getMonth() + 1 == Number(this.dateValue.month) &&
            date.getDate() == Number(this.dateValue.day);
        if (!validDate) {
            this.dateTimeErrorMessage = 'INVALID_ENTRY';
            return;
        }

        if (date.getTime() < new Date(this.fareConsoleSetting.minDateTime || '').getTime()) {
            this.dateTimeErrorMessage = this.translate.instant('MIN_DATE_ERROR', {
                date: this.datePipe.transform(this.fareConsoleSetting.minDateTime, 'yyyy/MM/dd HH:mm:ss'),
            });
            return;
        }

        this.submitDate(this.datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ssZZZZZ"));
        this.resetDateTimeSetting();
    }

    handleChangeInput(event: Event, type: string): void {
        const inputField = <HTMLInputElement>document.getElementById('inputField');
        const start = inputField?.selectionStart || 0;
        const end = inputField?.selectionEnd || 0;
        const value = inputField.value;
        const target = <HTMLDivElement>event.target;

        if (target.id === 'backspaceKey') {
            if (start === end) {
                // No selection, just delete the character before the cursor
                inputField.value = value.slice(0, start - 1) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start - 1;
                this.hasInputError = false;
            } else {
                // There is a selection, delete the selected text
                inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
                this.hasInputError = false;
            }
        } else if (target.id === 'enterKey') {
            if (!value) return;
            if (type === 'spid') {
                this.handleConfirmSPID(value);
            } else {
                this.handleConfirmComplimentaryDays(value);
            }
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            this.hasInputError = false;
        }

        inputField.focus();
    }

    // private handleConfirmTime(value: string) {
    //     if (isNaN(Number(value)) || value.length !== 6) {
    //         this.hasInputError = true;
    //         return;
    //     }

    //     const timeArray = value.match(/.{1,2}/g);
    //     const hhValue = Number(timeArray?.[0] || 0);
    //     const mmValue = Number(timeArray?.[1] || 0);
    //     const ssValue = Number(timeArray?.[2] || 0);
    //     if (hhValue > 24 || mmValue > 59 || ssValue > 59) {
    //         this.hasInputError = true;
    //         return;
    //     }

    //     if (hhValue === 24 && (mmValue > 0 || ssValue > 0)) {
    //         this.hasInputError = true;
    //         return;
    //     }
    //     this.hasInputError = false;

    //     this.submitTime(`${hhValue}:${mmValue}:${ssValue}`);
    // }

    // private submitTime(time: string) {
    //     this.mqttService.publishWithMessageFormat({
    //         topic: this.topics?.mainTab?.get,
    //         msgID: MsgID.TIME_SUBMIT,
    //         msgSubID: MsgSubID.NOTIFY,
    //         payload: {
    //             time,
    //         },
    //     });
    //     this.store.dispatch(
    //         updateFareConsole({
    //             payload: { ...this.fareConsoleSetting, time },
    //             msgID: MsgID.FARE_CONSOLE,
    //         }),
    //     );
    //     this.settingType = '';
    // }

    private submitDate(date: string | null) {
        if (!date) {
            return;
        }
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.DATE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { dateTime: date },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, dateTime: date },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );
        this.settingType = '';
    }

    // COMPLIMENTARY DAYS HANDLE
    private handleConfirmComplimentaryDays(value: string) {
        if (isNaN(Number(value))) {
            this.hasInputError = true;
            return;
        }

        if (
            this.fareConsoleSetting.maximumcomplimentaryDays &&
            Number(value) > this.fareConsoleSetting.maximumcomplimentaryDays
        ) {
            this.hasInputError = true;
            return;
        }

        this.hasInputError = false;
        this.submitComplimentaryDays(Number(value));
    }

    private submitComplimentaryDays(days: number) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.COMPLIMENTARY_DAYS_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                complimentaryDays: days,
            },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, complimentaryDays: days },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );
        this.settingType = '';
    }

    // DELETE PARAMETERS HANDLE
    handleDeleteParameter() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.DELETE_PARAMETER,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClearDeleteParameter() {
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, message: '', percentage: 0, status: undefined },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );
        this.settingType = '';
    }

    handleDeleteParameterByNotify() {
        if (this.fareConsoleSetting?.msgID === MsgID.DELETE_PARAMETER) {
            this.handleChangeSetting('deleteParameter');
        }
    }

    // BUS ID HANDLE
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

    selectChangeBusId() {
        if (this.fareConsoleSetting.busId) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.COMMISSION_BUS_ID,
                msgSubID: MsgSubID.REQUEST,
                payload: {
                    busId: this.fareConsoleSetting.busId,
                },
            });
        }
    }

    backToFareConsole() {
        this.handleClickBack();
    }

    handleChangeStep(step: number) {
        this.busIdStep = step;

        //get operator list
        if (step === 3 && !this.busIdData?.operators?.length) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.COMMISSION_OPERATOR,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        }
    }

    handleBusIdBack() {
        this.busIdPrefix = '';
        this.busIdNumber = '';
        this.hasBusIdNumberError = false;
        this.busIdStep = 1;
    }

    handleEnterBusId(value: string) {
        this.busIdNumber = value;
        this.hasBusIdNumberError = false;
    }

    handleChangeBusIdInput(event: Event): void {
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
                this.hasBusIdNumberError = false;
            } else {
                // There is a selection, delete the selected text
                this.busIdNumber = inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
                this.hasBusIdNumberError = false;
            }
        } else if (target.id === 'enterKey') {
            this.isShowKeyboard = false;
            if (!value) return;
            this.handleEnterBusId(value);
        } else {
            const keyValue = target.innerText.trim();
            this.busIdNumber = inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            this.hasBusIdNumberError = false;
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
        // this.mqttService.publishWithMessageFormat({
        //     topic: this.topics?.mainTab?.get,
        //     msgID: MsgID.COMMISSION_BUS_ID_CHANGE,
        //     msgSubID: MsgSubID.NOTIFY,
        //     payload: {
        //         newBusId,
        //     },
        // });
        this.busIdStep = 1;
        this.store.dispatch(
            updateCommissionBusIdInformation({
                payload: { ...this.busIdData, busId: newBusId },
                msgID: this.busIdData.msgID,
            }),
        );

        this.busIdPrefix = '';
        this.busIdNumber = '';
        this.hasBusIdNumberError = false;
    }

    handleChangeOperator(operatorId: number) {
        // console.log('operatorId', operatorId);
        // console.log('operatorIdTemp', this.operatorIdTemp);

        this.operatorIdTemp = operatorId;
    }

    handleConfirmOperator() {
        const newOperatorIndex = this.busIdData?.operators?.findIndex(
            (operator) => operator.id === this.operatorIdTemp,
        );
        if (newOperatorIndex !== undefined && newOperatorIndex > -1) {
            const newOperator = this.busIdData?.operators?.[newOperatorIndex];
            // this.mqttService.publishWithMessageFormat({
            //     topic: this.topics?.mainTab?.get,
            //     msgID: MsgID.COMMISSION_OPERATOR_CHANGE,
            //     msgSubID: MsgSubID.NOTIFY,
            //     payload: {
            //         operatorId: newOperator?.id,
            //         operatorIndex: newOperatorIndex,
            //     },
            // });

            this.store.dispatch(
                updateCommissionBusIdInformation({
                    payload: { ...this.busIdData, operator: newOperator },
                    msgID: this.busIdData.msgID,
                }),
            );
            // this.store.dispatch(
            //     updateFareConsole({
            //         payload: { ...this.fareConsoleSetting, serviceProvider: newOperator?.serviceProvider },
            //         msgID: MsgID.FARE_CONSOLE,
            //     }),
            // );
        }
        this.busIdStep = 1;
    }

    handleOperatorBack() {
        this.operatorIdTemp = this.busIdData?.operator?.id || null;
        this.busIdStep = 1;
    }

    handleSpidBack() {
        this.busIdStep = 1;
    }

    private handleConfirmSPID(value: string) {
        if (!value) return;
        // this.mqttService.publishWithMessageFormat({
        //     topic: this.topics?.mainTab?.get,
        //     msgID: MsgID.COMMISSION_SPID_CHANGE,
        //     msgSubID: MsgSubID.NOTIFY,
        //     payload: { newServiceProvider: Number(value) },
        // });

        this.store.dispatch(
            updateCommissionBusIdInformation({
                payload: {
                    ...this.busIdData,
                    operator: { ...(this.busIdData.operator || {}), serviceProvider: Number(value) },
                },
                msgID: this.busIdData.msgID,
            }),
        );

        // this.store.dispatch(
        //     updateFareConsole({
        //         payload: { ...this.fareConsoleSetting, serviceProvider: Number(value) },
        //         msgID: MsgID.FARE_CONSOLE,
        //     }),
        // );
        this.busIdStep = 1;
    }

    handleSubmitForm() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.COMMISSION_BUS_ID_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                busId: this.busIdData.busId,
                serviceProvider: this.busIdData?.operator?.serviceProvider,
            },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: {
                    ...this.fareConsoleSetting,
                    busId: this.busIdData.busId,
                    serviceProvider: this.busIdData?.operator?.serviceProvider,
                },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );

        this.settingType = '';
        this.busIdStep = 1;
    }

    handleCancelSubmitBusId() {
        this.clearBusIdData();
        this.backToFareConsole();
    }

    private clearBusIdData() {
        this.store.dispatch(
            updateCommissionBusIdInformation({
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

    handleRetrySetBusId() {
        this.busIdStep = 1;
        this.store.dispatch(
            updateCommissionBusIdInformation({
                payload: { ...this.busIdData, status: undefined, message: undefined },
            }),
        );
    }

    // SUBMIT FARE CONSOLE
    validateFareConsoleForm() {
        this.missingFields = [];
        this.highlightMissingFields = false;
        let isValid: boolean = true;
        const arrayToCheck: { value?: string | number; label: string }[] = [
            { value: this.fareConsoleSetting.deckType?.id, label: 'DECK_TYPE' },
            // { value: this.fareConsoleSetting.blsStatus, label: 'SECONDARY_BLS' },
            // { value: this.fareConsoleSetting.dateTime, label: 'DATE_TIME' },
            { value: this.fareConsoleSetting.busId, label: 'BUS_ID' },
            { value: this.fareConsoleSetting.complimentaryDays, label: 'COMPLIMENTARY_DAYS' },
            { value: this.fareConsoleSetting.serviceProvider, label: 'SERVICE_PROVIDER' },
        ];

        // Check if any of the values are empty or invalid
        this.missingFields = arrayToCheck.filter((item) => !item.value);
        if (this.missingFields.length > 0) {
            isValid = false;
        }

        return isValid;
    }

    handleConfirmFareConsole(isConfirm: boolean): void {
        if (isConfirm) {
            if (!this.validateFareConsoleForm()) {
                this.hasSubmitError = true;
                return;
            }
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.FARE_CONSOLE_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    deckType: this.fareConsoleSetting.deckType.id,
                    // blsStatus: this.fareConsoleSetting.blsStatus,
                    // dateTime: this.fareConsoleSetting.dateTime,
                    busId: this.fareConsoleSetting.busId,
                    serviceProvider: this.fareConsoleSetting.serviceProvider,
                    complimentaryDays: this.fareConsoleSetting.complimentaryDays,
                },
            });
        }
    }

    handleBackToConfiguration() {
        this.hasSubmitError = false;
        this.highlightMissingFields = true;
    }

    ngOnDestroy() {
        this._document.removeEventListener('click', this._handleOnDocumentClick, false);

        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
