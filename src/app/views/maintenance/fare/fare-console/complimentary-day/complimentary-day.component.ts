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
    selector: 'complimentary-day',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule],
    templateUrl: './complimentary-day.component.html',
    styleUrls: ['./complimentary-day.component.scss'],
})
export class ComplimentaryDayComponent implements OnInit {
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

    private handleConfirmComplimentaryDays(value: string) {
        if (isNaN(Number(value))) {
            this.hasInputError = true;
            return;
        }

        if (
            this.fareConsoleSetting?.maximumcomplimentaryDays &&
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
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_COMPLIMENTARY_DAYS_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                complimentaryDays: days,
            },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, complimentaryDays: days },
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
                this.hasInputError = false;
            } else {
                // There is a selection, delete the selected text
                inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
                this.hasInputError = false;
            }
        } else if (target.id === 'enterKey') {
            if (!value) return;
            this.handleConfirmComplimentaryDays(value);
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            this.hasInputError = false;
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
