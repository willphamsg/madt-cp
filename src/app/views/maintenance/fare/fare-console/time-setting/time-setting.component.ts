import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { TranslateModule } from '@ngx-translate/core';

import { MsgID, MsgSubID } from '@models';
import { updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { applyKeyboardInput } from '@utils/keyboard-input.util';
import { FareConsoleScreenBase } from '@components/fare-console-screen-base/fare-console-screen.base';

@Component({
    selector: 'time-setting',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule],
    templateUrl: './time-setting.component.html',
    styleUrls: ['./time-setting.component.scss'],
})
export class TimeSettingComponent extends FareConsoleScreenBase {
    hasInputError: boolean = false;

    private handleConfirmTime(value: string) {
        if (Number.isNaN(Number(value)) || value.length !== 6) {
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
        const target = <HTMLDivElement>event.target;
        const value = applyKeyboardInput(inputField, target);

        if (target.id === 'enterKey') {
            if (!value) return;
            this.handleConfirmTime(value);
        }

        inputField.focus();
    }
}
