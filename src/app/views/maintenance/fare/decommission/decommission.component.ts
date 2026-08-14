import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IDeCommission, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { decommission, updateDecommission } from '@store/maintenance/maintenance.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'decommission',
    imports: [RouterModule, CustomKeyboardComponent, TranslateModule],
    templateUrl: './decommission.component.html',
    styleUrls: ['./decommission.component.scss'],
})
export class Decommission implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;
    private readonly destroy$ = new Subject<void>();

    private readonly decommission$: Observable<IDeCommission>;
    decommission: IDeCommission = {};

    commissionError: string | null = null;
    topics;

    constructor(
        private readonly soundService: SoundService,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.decommission$ = this.store.select(decommission);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.decommission$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.decommission = data;
            if (data.status === ResponseStatus.ERROR) {
                this.commissionError = data.message || 'INVALID_ENTRY';
            } else {
                this.commissionError = null;
            }
        });
    }

    handleSubmit(value) {
        this.commissionError = null;
        if (!value.length || value.length > 6) {
            this.commissionError = 'INVALID_ENTRY';
            return;
        }
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.maintenance?.get,
            msgID: MsgID?.DECOMMISSION,
            msgSubID: MsgSubID?.REQUEST,
            payload: { value },
        });
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
                this.commissionError = null;
            } else {
                // There is a selection, delete the selected text
                inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
                this.commissionError = null;
            }
        } else if (target.id === 'enterKey') {
            this.handleSubmit(value);
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            this.commissionError = null;
        }
        inputField.focus();
    }

    handleClosePopup() {
        this.commissionError = null;
        this.store.dispatch(updateDecommission({ payload: { status: undefined } }));
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
