import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IFareConsole, MsgID, MsgSubID } from '@models';
import { AppState } from '@store/app.state';
import { fareConsole, updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'date-setting',
    imports: [CommonModule, RouterModule, CustomKeyboardComponent, TranslateModule],
    providers: [DatePipe],
    templateUrl: './date-setting.component.html',
    styleUrls: ['./date-setting.component.scss'],
})
export class DateSettingComponent implements OnInit {
    private destroy$ = new Subject<void>();
    fareConsoleSetting$: Observable<IFareConsole>;
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

    // hasDateInputError: boolean = false;
    dateTimeErrorMessage: string = '';
    hasTimeInputError: boolean = false;

    dateTimeInputType: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'day';
    dateValue = {
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: '',
        second: '',
    };
    topics;

    constructor(
        private soundService: SoundService,
        private datePipe: DatePipe,
        private router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
        private translate: TranslateService,
    ) {
        this.fareConsoleSetting$ = this.store.select(fareConsole);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.fareConsoleSetting$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.fareConsoleSetting = data;

            // this.setDefaultDateTime();
        });
    }

    goBack() {
        this.router.navigate(['/maintenance/fare/fare-console']);
    }

    private setDefaultDateTime() {
        if (this.fareConsoleSetting.dateTime) {
            this.dateValue = {
                year: this.datePipe.transform(this.fareConsoleSetting.dateTime, 'yyyy') || '',
                month: this.datePipe.transform(this.fareConsoleSetting.dateTime, 'MM') || '',
                day: this.datePipe.transform(this.fareConsoleSetting.dateTime, 'dd') || '',
                hour: this.datePipe.transform(this.fareConsoleSetting.dateTime, 'HH') || '',
                minute: this.datePipe.transform(this.fareConsoleSetting.dateTime, 'mm') || '',
                second: this.datePipe.transform(this.fareConsoleSetting.dateTime, 'ss') || '',
            };
        }
    }

    handleChangeInput(event: Event): void {
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
                    // this.hasDateInputError = false;
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
                // this.hasDateInputError = false;
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
        // this.hasDateInputError = false;
        this.dateTimeErrorMessage = '';
        this.hasTimeInputError = false;
        if (!this.dateValue.year || !this.dateValue.month || !this.dateValue.day) {
            // this.hasDateInputError = true;
            this.dateTimeErrorMessage = 'INVALID_ENTRY';
        }
        if (!this.dateValue.hour || !this.dateValue.minute || !this.dateValue.second) {
            this.hasTimeInputError = true;
        }

        if (!!this.dateTimeErrorMessage || this.hasTimeInputError) {
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

        // if (isNaN(Number(value)) || value.length !== 8) {
        //     this.hasInputError = true;
        //     return;
        // }

        // const dateArray = value.match(/.{1,2}/g);
        // const ddValue = Number(dateArray?.[0] || 0);
        // const mmValue = Number(dateArray?.[1] || 0);
        // const yyyyValue = Number((dateArray?.[2] || '') + (dateArray?.[3] || ''));
        // // const newDate = new Date(`${yyyyValue}/${mmValue}/${ddValue}`);

        // const date = new Date(yyyyValue, mmValue - 1, ddValue);
        // // console.log(
        // //     date,
        // //     date.getFullYear() == yyyyValue && date.getMonth() + 1 == mmValue && date.getDate() == ddValue,
        // // );
        const validDate =
            date.getFullYear() == Number(this.dateValue.year) &&
            date.getMonth() + 1 == Number(this.dateValue.month) &&
            date.getDate() == Number(this.dateValue.day);
        if (!validDate) {
            // this.hasDateInputError = true;
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
    }

    private submitDate(date: string | null) {
        if (!date) return;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_DATE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { dateTime: date },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, dateTime: date },
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
            }),
        );
        this.goBack();
    }

    // handleChangeInput(event: Event): void {
    //     const inputField = <HTMLInputElement>document.getElementById('inputField');
    //     const start = inputField?.selectionStart || 0;
    //     const end = inputField?.selectionEnd || 0;
    //     const value = inputField.value;
    //     const target = <HTMLDivElement>event.target;

    //     if (target.id === 'backspaceKey') {
    //         if (start === end) {
    //             // No selection, just delete the character before the cursor
    //             inputField.value = value.slice(0, start - 1) + value.slice(end);
    //             inputField.selectionStart = inputField.selectionEnd = start - 1;
    //         } else {
    //             // There is a selection, delete the selected text
    //             inputField.value = value.slice(0, start) + value.slice(end);
    //             inputField.selectionStart = inputField.selectionEnd = start;
    //         }
    //     } else if (target.id === 'enterKey') {
    //         if (!value) return;
    //         this.handleConfirmDate(value);
    //     } else {
    //         const keyValue = target.innerText.trim();
    //         inputField.value = value.slice(0, start) + keyValue + value.slice(end);
    //         inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
    //     }

    //     inputField.focus();
    // }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
