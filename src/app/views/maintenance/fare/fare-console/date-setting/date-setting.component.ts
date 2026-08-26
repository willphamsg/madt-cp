import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { MsgID, MsgSubID } from '@models';
import { updateFareConsole } from '@store/maintenance/maintenance.reducer';
import {
    buildDateFromSegments,
    clampDateSegment,
    focusNextDateSegment,
    DateTimeInputType,
} from '@utils/date-segment-input.util';
import { FareConsoleScreenBase } from '@components/fare-console-screen-base/fare-console-screen.base';

@Component({
    selector: 'date-setting',
    imports: [CommonModule, RouterModule, CustomKeyboardComponent, TranslateModule],
    providers: [DatePipe],
    templateUrl: './date-setting.component.html',
    styleUrls: ['./date-setting.component.scss'],
})
export class DateSettingComponent extends FareConsoleScreenBase {
    // hasDateInputError: boolean = false;
    dateTimeErrorMessage: string = '';
    hasTimeInputError: boolean = false;

    dateTimeInputType: DateTimeInputType = 'day';
    dateValue = {
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: '',
        second: '',
    };

    constructor(
        soundService: SoundService,
        private readonly datePipe: DatePipe,
        router: Router,
        store: Store<AppState>,
        mqttService: MqttService,
        private readonly translate: TranslateService,
    ) {
        super(soundService, router, store, mqttService);
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
            this.handleBackspaceInput(inputField, start, end, value);
        } else if (target.id === 'enterKey') {
            this.handleConfirmDate();
        } else if (this.handleCharacterKeyInput(inputField, target, start, end, value)) {
            return;
        }
        inputField.focus();
        this.autoFocusOnInput(inputField, inputField.value, target.id === 'backspaceKey', start === 0);
    }

    private handleBackspaceInput(inputField: HTMLInputElement, start: number, end: number, value: string): void {
        if (start <= 0) return;
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

    private handleCharacterKeyInput(
        inputField: HTMLInputElement,
        target: HTMLDivElement,
        start: number,
        end: number,
        value: string,
    ): boolean {
        if (
            (this.dateTimeInputType === 'year' && value.length >= 4) ||
            (this.dateTimeInputType !== 'year' && value.length >= 2)
        ) {
            inputField.focus();
            this.autoFocusOnInput(inputField, inputField.value, target.id === 'backspaceKey', start === 0);
            return true;
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
        return false;
    }

    private setValueForDateElement(value: string): string {
        if (!this.dateTimeInputType) return '';
        return clampDateSegment(this.dateValue, this.dateTimeInputType, value);
    }

    private autoFocusOnInput(inputField: HTMLInputElement, value: string, isBackspace: boolean, firstCursor: boolean) {
        const nextType = focusNextDateSegment(inputField, value, isBackspace, firstCursor);
        if (nextType) {
            this.dateTimeInputType = nextType;
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

        const { date, isValid } = buildDateFromSegments(this.dateValue);
        if (!isValid) {
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
}
