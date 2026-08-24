import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MsgID, MsgSubID } from '@models';
import { updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { FareConsoleScreenBase } from '@components/fare-console-screen-base/fare-console-screen.base';

@Component({
    selector: 'bls-status',
    imports: [RouterModule, TranslateModule],
    templateUrl: './bls.component.html',
    styleUrls: ['./bls.component.scss'],
})
export class BLSStatusComponent extends FareConsoleScreenBase {
    step: number = 1;
    selectedBlsStatus: number = 0;

    handleSelectStatus(status: number) {
        this.selectedBlsStatus = status;
        this.step = 2;
    }

    handleConfirmBlsStatus(isConfirm: boolean) {
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.maintenance?.get,
                msgID: MsgID.MAINTENANCE_BLS_STATUS_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    blsStatus: this.selectedBlsStatus,
                },
            });
            this.store.dispatch(
                updateFareConsole({
                    payload: { ...this.fareConsoleSetting, blsStatus: this.selectedBlsStatus },
                    msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
                }),
            );
            this.goBack();
        } else {
            this.step = 1;
        }
    }
}
