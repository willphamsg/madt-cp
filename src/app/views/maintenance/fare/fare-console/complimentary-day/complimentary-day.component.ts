import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { TranslateModule } from '@ngx-translate/core';

import { MsgID, MsgSubID } from '@models';
import { updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { applyKeyboardInput } from '@utils/keyboard-input.util';
import { FareConsoleScreenBase } from '@components/fare-console-screen-base/fare-console-screen.base';

@Component({
    selector: 'complimentary-day',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule],
    templateUrl: './complimentary-day.component.html',
    styleUrls: ['./complimentary-day.component.scss'],
})
export class ComplimentaryDayComponent extends FareConsoleScreenBase {
    hasInputError: boolean = false;

    private handleConfirmComplimentaryDays(value: string) {
        if (Number.isNaN(Number(value))) {
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
        const target = <HTMLDivElement>event.target;
        const value = applyKeyboardInput(inputField, target);

        if (target.id === 'enterKey') {
            if (!value) return;
            this.handleConfirmComplimentaryDays(value);
        } else {
            this.hasInputError = false;
        }

        inputField.focus();
    }
}
