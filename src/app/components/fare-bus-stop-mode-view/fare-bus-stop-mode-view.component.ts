import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { IFareBusStopMode, IPosnStatus, MsgID, ResponseStatus } from '@models';

/**
 * Markup for the "select fare bus-stop mode" screen, shared by fare/bls-operation and
 * maintenance/fare-console - they render identical markup and differ only in the store
 * slice and MQTT topic their host component talks to. The host element takes the place
 * of the page wrapper `<div>` each screen used to declare, so the rendered structure is
 * unchanged.
 */
@Component({
    selector: 'app-fare-bus-stop-mode-view',
    imports: [AsyncPipe, TranslateModule],
    templateUrl: './fare-bus-stop-mode-view.component.html',
    styleUrls: ['./fare-bus-stop-mode-view.component.scss'],
    host: { class: 'device-operation-content' },
})
export class FareBusStopModeViewComponent {
    @Input({ required: true }) fareBusStopMode!: IFareBusStopMode;
    /** The mode awaiting confirmation, which drives the dialog wording. */
    @Input({ required: true }) mode!: number;
    /** The mode currently in force, which drives the highlighted button. */
    @Input({ required: true }) finaleMode!: number;
    @Input({ required: true }) posnStatus$!: Observable<IPosnStatus | undefined>;

    @Output() readonly back = new EventEmitter<void>();
    @Output() readonly cancelMode = new EventEmitter<void>();
    @Output() readonly confirmMode = new EventEmitter<void>();
    @Output() readonly backToSelect = new EventEmitter<void>();
    @Output() readonly selectMode = new EventEmitter<number>();

    readonly MsgID = MsgID;
    readonly ResponseStatus = ResponseStatus;

    mappingPosnStatus(num: number): string {
        switch (num) {
            case 1:
                return 'FMS';
            case 2:
                return 'FARE_SYSTEM';
            case 3:
                return 'NONE';
            default:
                return '';
        }
    }
}
