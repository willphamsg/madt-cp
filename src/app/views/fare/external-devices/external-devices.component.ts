import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { IExternalDevice, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { fareExternalDevices, updateFareExternalDevices } from '@store/fare/fare.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';

@Component({
    selector: 'external-devices',
    imports: [AppScrollBar, RouterModule, TranslateModule],
    templateUrl: './external-devices.component.html',
    styleUrls: ['./external-devices.component.scss'],
})
export class ExternalDevicesComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    private readonly externalDevices$: Observable<IExternalDevice>;
    initialExternalDevices: IExternalDevice = {
        testPrinter: {
            status: 0,
            message: '',
        },
        printer: {
            status: ResponseStatus.NA,
            message: '',
        },
        GNSSAntenna: {
            status: ResponseStatus.NA,
            message: '',
        },
        busETA: {
            status: ResponseStatus.NA,
            message: '',
        },
        cv1: {
            status: ResponseStatus.NA,
            message: '',
        },
        cv2: {
            status: ResponseStatus.NA,
            message: '',
        },
        cv3: {
            status: ResponseStatus.NA,
            message: '',
        },
        cv4: {
            status: ResponseStatus.NA,
            message: '',
        },
        cv5: {
            status: ResponseStatus.NA,
            message: '',
        },
        cv6: {
            status: ResponseStatus.NA,
            message: '',
        },
    };
    externalDevices = { ...this.initialExternalDevices };

    isLoading: boolean = true;
    topics;

    constructor(
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {
        this.externalDevices$ = this.store.select(fareExternalDevices);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;

                // this.mqttService.publishWithMessageFormat({
                //     topic: this.topics?.mainTab?.get,
                //     msgID: MsgID.EXTERNAL_DEVICES,
                //     msgSubID: MsgSubID.REQUEST,
                //     payload: {},
                // });
            }
        });

        this.externalDevices$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.externalDevices = data;
            this.isLoading = !data.msgID;
            // console.log({ externalDevices: this.externalDevices });
        });
    }

    existingCvs() {
        const result: string[] = [];
        [1, 2, 3, 4, 5, 6].forEach((num) => {
            if (this.externalDevices[`cv${num}`]) {
                result.push(`cv${num}`);
            }
        });
        return result;
    }

    // fieldSuccess(field: string) {
    //     return (
    //         this.externalDevices.status === ResponseStatus.SUCCESS ||
    //         (this.externalDevices[field] && this.externalDevices[field]['status'] === ResponseStatus.SUCCESS)
    //     );
    // }

    fieldSuccess(field: string) {
        return this.externalDevices[field] && this.externalDevices[field]['status'] === ResponseStatus.SUCCESS;
    }

    fieldError(field: string) {
        return this.externalDevices[field] && this.externalDevices[field]['status'] === ResponseStatus.ERROR;
    }

    errorText(field: string) {
        return this.externalDevices[field]['message'];
    }

    handlePrintTest() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleRefresh() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.EXTERNAL_DEVICES,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });

        this.store.dispatch(
            updateFareExternalDevices({
                payload: {
                    ...this.initialExternalDevices,
                },
            }),
        );
    }

    handleConfirm(isConfirm: boolean) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: isConfirm ? MsgID.EXT_DEVICE_SUBMIT : MsgID.EXT_DEVICE_CANCEL,
            msgSubID: MsgSubID.NOTIFY,
            payload: {},
        });
    }

    backToStartShift() {
        this.router.navigate(['/main/bus-operation']);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
