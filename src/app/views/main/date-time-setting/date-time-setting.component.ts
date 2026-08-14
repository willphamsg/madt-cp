import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IDateTime, MsgID, MsgSubID } from '@models';
import { AppState } from '@store/app.state';
import { dateTimeSetting, updateDateTimeSetting } from '@store/main/main.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'date-time-setting',
    imports: [CommonModule, RouterModule, CustomKeyboardComponent, TranslateModule],
    providers: [DatePipe],
    templateUrl: './date-time-setting.component.html',
    styleUrls: ['./date-time-setting.component.scss'],
})
export class DateTimeSettingComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    dateTime$: Observable<IDateTime> = this.store.select(dateTimeSetting);
    dateTimeSetting: IDateTime = {
        dateTime: '',
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
        private readonly soundService: SoundService,
        private readonly datePipe: DatePipe,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly translate: TranslateService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.dateTime$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.dateTimeSetting = data;

            // console.log('Date time setting updated:', data);
        });
    }

    goBack() {
        this.router.navigate(['/maintenance/fare/fare-console']);
    }

    private setDefaultDateTime() {
        if (this.dateTimeSetting.dateTime) {
            this.dateValue = {
                year: this.datePipe.transform(this.dateTimeSetting.dateTime, 'yyyy') || '',
                month: this.datePipe.transform(this.dateTimeSetting.dateTime, 'MM') || '',
                day: this.datePipe.transform(this.dateTimeSetting.dateTime, 'dd') || '',
                hour: this.datePipe.transform(this.dateTimeSetting.dateTime, 'HH') || '',
                minute: this.datePipe.transform(this.dateTimeSetting.dateTime, 'mm') || '',
                second: this.datePipe.transform(this.dateTimeSetting.dateTime, 'ss') || '',
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
                this.removeStoreError();
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

            this.removeStoreError();
        }
        inputField.focus();
        this.autoFocusOnInput(inputField, inputField.value, target.id === 'backspaceKey', start === 0);
    }

    private removeStoreError() {
        if (this.dateTimeSetting.message) {
            this.store.dispatch(
                updateDateTimeSetting({
                    payload: {
                        dateTime: this.dateTimeSetting.dateTime,
                        message: '',
                    },
                }),
            );
        }
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

        const validDate =
            date.getFullYear() == Number(this.dateValue.year) &&
            date.getMonth() + 1 == Number(this.dateValue.month) &&
            date.getDate() == Number(this.dateValue.day);
        if (!validDate) {
            // this.hasDateInputError = true;
            this.dateTimeErrorMessage = 'INVALID_ENTRY';
            return;
        }

        if (date.getTime() < new Date(this.dateTimeSetting.minDateTime || '').getTime()) {
            this.dateTimeErrorMessage = this.translate.instant('MIN_DATE_ERROR', {
                date: this.datePipe.transform(this.dateTimeSetting.minDateTime, 'yyyy/MM/dd HH:mm:ss'),
            });
            return;
        }

        this.submitDate(this.datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ssZZZZZ"));
    }

    private submitDate(date: string | null) {
        if (!date) return;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.DATE_TIME_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: { dateTime: date },
            opts: { retain: false },
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateDateTimeSetting({
                payload: {
                    dateTime: this.dateTimeSetting.dateTime,
                    message: '',
                },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
