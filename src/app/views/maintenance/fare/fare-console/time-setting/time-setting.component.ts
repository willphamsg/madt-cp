import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IFareConsole, MsgID, MsgSubID } from '@models';
import { AppState } from '@store/app.state';
import { fareConsole, updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'time-setting',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule],
    templateUrl: './time-setting.component.html',
    styleUrls: ['./time-setting.component.scss'],
})
export class TimeSettingComponent implements OnInit {
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

    hasInputError: boolean = false;
    topics;

    constructor(
        private soundService: SoundService,
        private router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
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
        });
    }

    goBack() {
        this.router.navigate(['/maintenance/fare/fare-console']);
    }

    private handleConfirmTime(value: string) {
        if (isNaN(Number(value)) || value.length !== 6) {
            this.hasInputError = true;
            return;
        }

        const timeArray = value.match(/.{1,2}/g);
        const hhValue = Number(timeArray?.[0] || 0);
        const mmValue = Number(timeArray?.[1] || 0);
        const ssValue = Number(timeArray?.[2] || 0);
        if (hhValue > 24 || mmValue > 59 || ssValue > 59) {
            this.hasInputError = true;
            return;
        }

        if (hhValue === 24 && (mmValue > 0 || ssValue > 0)) {
            this.hasInputError = true;
            return;
        }
        this.hasInputError = false;

        this.submitTime(`${hhValue}:${mmValue}:${ssValue}`);
    }

    submitTime(time: string) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_TIME_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                time,
            },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, time },
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
            }),
        );
        this.goBack();
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
                inputField.value = value.slice(0, start - 1) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start - 1;
            } else {
                // There is a selection, delete the selected text
                inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
            }
        } else if (target.id === 'enterKey') {
            if (!value) return;
            this.handleConfirmTime(value);
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
        }

        inputField.focus();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
