import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MsgID, MsgSubID, ResponseStatus } from '@models';
import { updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { FareConsoleScreenBase } from '@components/fare-console-screen-base/fare-console-screen.base';

@Component({
    selector: 'delete-parameter',
    imports: [RouterModule, TranslateModule],
    templateUrl: './delete-parameter.component.html',
    styleUrls: ['./delete-parameter.component.scss'],
})
export class DeleteParameterComponent extends FareConsoleScreenBase {
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    // DELETE PARAMETERS HANDLE
    handleDeleteParameter() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_DELETE_PARAMETER,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClearDeleteParameter() {
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, message: '', percentage: 0, status: undefined },
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
            }),
        );
        this.goBack();
    }

    override ngOnDestroy() {
        super.ngOnDestroy();
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, message: '', percentage: 0, status: undefined },
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
            }),
        );
    }
}
