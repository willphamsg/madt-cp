import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { IExternalDevice, MsgID, MsgSubID, ResponseStatus } from '@models';

/**
 * Shared logic for the main/bus-operation and fare "external devices"
 * diagnostics screens, which are identical apart from the store slice/topic
 * they read and dispatch to. Subclasses supply the topic key, the
 * externalDevices$ selector, and the update action to dispatch.
 */
@Directive()
export abstract class ExternalDevicesBase implements OnInit, OnDestroy {
    protected readonly destroy$ = new Subject<void>();
    readonly MsgID = MsgID;
    readonly ResponseStatus = ResponseStatus;

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
    externalDevices: IExternalDevice = { ...this.initialExternalDevices };

    isLoading = true;
    topics;

    protected abstract readonly topicKey: 'mainTab' | 'fareTab';
    protected abstract readonly externalDevices$: Observable<IExternalDevice>;

    constructor(
        protected readonly router: Router,
        protected readonly store: Store<AppState>,
        protected readonly mqttService: MqttService,
        protected readonly soundService: SoundService,
    ) {}

    ngOnInit(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.externalDevices$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.externalDevices = data;
            this.isLoading = !data.msgID;
        });
    }

    existingCvs(): string[] {
        const result: string[] = [];
        [1, 2, 3, 4, 5, 6].forEach((num) => {
            if (this.externalDevices[`cv${num}`]) {
                result.push(`cv${num}`);
            }
        });
        return result;
    }

    fieldSuccess(field: string) {
        return this.externalDevices[field]?.['status'] === ResponseStatus.SUCCESS;
    }

    fieldError(field: string) {
        return this.externalDevices[field]?.['status'] === ResponseStatus.ERROR;
    }

    errorText(field: string) {
        return this.externalDevices[field]['message'];
    }

    handlePrintTest(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.[this.topicKey]?.get,
            msgID: MsgID.MAINTENANCE_TEST_PRINT,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleRefresh(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.[this.topicKey]?.get,
            msgID: MsgID.EXTERNAL_DEVICES,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });

        this.updateExternalDevicesState({ ...this.initialExternalDevices });
    }

    handleConfirm(isConfirm: boolean): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.[this.topicKey]?.get,
            msgID: isConfirm ? MsgID.EXT_DEVICE_SUBMIT : MsgID.EXT_DEVICE_CANCEL,
            msgSubID: MsgSubID.NOTIFY,
            payload: {},
        });
    }

    backToStartShift(): void {
        this.router.navigate(['/main/bus-operation']);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Dispatch the domain-specific updateExternalDevices action with the given payload. */
    protected abstract updateExternalDevicesState(payload: IExternalDevice): void;
}
