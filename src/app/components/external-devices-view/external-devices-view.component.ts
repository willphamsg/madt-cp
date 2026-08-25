import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { fieldMessage, hasFieldStatus, listExistingCvs } from '@components/external-devices-base/external-devices.util';
import { IExternalDevice, ResponseStatus } from '@models';

/**
 * Markup for the "external devices" diagnostics page, shared by the main/bus-operation
 * and fare screens - they render an identical table and differ only in the store slice
 * and MQTT topic their host component talks to. The host element takes the place of the
 * page wrapper `<div>` each screen used to declare, so the rendered structure is
 * unchanged.
 */
@Component({
    selector: 'app-external-devices-view',
    imports: [AppScrollBar, TranslateModule],
    templateUrl: './external-devices-view.component.html',
    styleUrls: ['./external-devices-view.component.scss'],
    host: { class: 'external-devices-page' },
})
export class ExternalDevicesViewComponent {
    @Input({ required: true }) externalDevices!: IExternalDevice;

    @Output() readonly printTest = new EventEmitter<void>();
    @Output() readonly refresh = new EventEmitter<void>();
    @Output() readonly confirm = new EventEmitter<boolean>();

    readonly ResponseStatus = ResponseStatus;

    existingCvs(): string[] {
        return listExistingCvs(this.externalDevices);
    }

    fieldSuccess(field: string): boolean {
        return hasFieldStatus(this.externalDevices, field, ResponseStatus.SUCCESS);
    }

    fieldError(field: string): boolean {
        return hasFieldStatus(this.externalDevices, field, ResponseStatus.ERROR);
    }

    errorText(field: string) {
        return fieldMessage(this.externalDevices, field);
    }
}
