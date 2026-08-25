import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IExternalDevice, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { externalDevices, updateExternalDevices } from '@store/maintenance/maintenance.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import {
    createInitialExternalDevices,
    fieldMessage,
    hasFieldStatus,
    listExistingCvs,
} from '@components/external-devices-base/external-devices.util';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'external-devices',
    imports: [MatIconModule, AppScrollBar, RouterModule, TranslateModule],
    templateUrl: './external-devices.component.html',
    styleUrls: ['./external-devices.component.scss'],
})
export class ExternalDevicesComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    private readonly externalDevices$: Observable<IExternalDevice>;
    initialExternalDevices: IExternalDevice = createInitialExternalDevices();
    externalDevices: IExternalDevice = { ...this.initialExternalDevices };

    isLoading = true;
    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.externalDevices$ = this.store.select(externalDevices);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.maintenance?.get,
                    msgID: MsgID.EXTERNAL_DEVICES,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            }
        });

        this.externalDevices$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.externalDevices = { ...data };
            if (Object.keys(data).length > 0) {
                this.isLoading = false;
            } else {
                this.isLoading = true;
            }
            // console.log({ externalDevices: this.externalDevices });
        });
    }

    existingCvs(): string[] {
        return listExistingCvs(this.externalDevices);
    }

    fieldSuccess(field: string): boolean {
        return hasFieldStatus(this.externalDevices, field, ResponseStatus.SUCCESS);
    }

    fieldError(field: string): boolean {
        return hasFieldStatus(this.externalDevices, field, ResponseStatus.ERROR);
    }

    fieldInProgress(field: string): boolean {
        return hasFieldStatus(this.externalDevices, field, ResponseStatus.PROGRESS);
    }

    errorText(field: string) {
        return fieldMessage(this.externalDevices, field);
    }

    handlePrintTest() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleRefresh() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.EXTERNAL_DEVICES,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });

        this.store.dispatch(
            updateExternalDevices({
                payload: { ...this.externalDevices, status: ResponseStatus.NA },
            }),
        );
    }

    handleCancel() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.EXT_DEVICE_CANCEL,
            msgSubID: MsgSubID.NOTIFY,
            payload: {},
        });

        this.store.dispatch(
            updateExternalDevices({
                payload: {
                    ...this.initialExternalDevices,
                    status: ResponseStatus.NA,
                },
            }),
        );
    }

    backToFareConsole() {
        this.router.navigate(['/maintenance/fare/fare-console']);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        this.store.dispatch(
            updateExternalDevices({
                payload: {
                    ...this.initialExternalDevices,
                },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
