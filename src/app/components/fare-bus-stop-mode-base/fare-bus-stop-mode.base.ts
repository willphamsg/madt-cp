import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { IFareBusStopMode, MsgID, MsgSubID, ResponseStatus, IPosnStatus } from '@models';
import { posnStatus } from '@store/global/global.reducer';

/**
 * Shared logic for the fare/bls-operation and maintenance/fare-console
 * "select fare bus-stop mode" screens. Subclasses supply the topic key and
 * the store slice/selectors to use, plus any per-domain hooks (extra
 * subscriptions, additional per-message handling, and the back action).
 */
@Directive()
export abstract class FareBusStopModeBase implements OnInit, OnDestroy {
    readonly MsgID = MsgID;
    readonly ResponseStatus = ResponseStatus;
    mode = 0; // 1 Manual, 2: Auto
    finaleMode = 0;

    protected readonly destroy$ = new Subject<void>();
    readonly posnStatus$: Observable<IPosnStatus | undefined> = this.store.select(posnStatus);
    fareBusStopMode: IFareBusStopMode = {};
    topics;
    timeOutId;

    protected abstract readonly topicKey: 'fareTab' | 'maintenance';
    protected abstract readonly fareBusStopMode$: Observable<IFareBusStopMode>;

    constructor(
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

        this.initExtraSubscriptions();

        this.fareBusStopMode$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.fareBusStopMode = data;

            clearTimeout(this.timeOutId);
            if (data.timeout && data.timeout > 0) {
                this.timeOutId = setTimeout(() => {
                    this.mqttService.publishWithMessageFormat({
                        topic: this.topics?.[this.topicKey]?.get,
                        msgID: MsgID.TIMEOUT_MESSAGE,
                        msgSubID: MsgSubID.NOTIFY,
                        payload: { msgID: data.msgID },
                    });
                    this.handleCancel();
                }, data.timeout);
            }

            this.onFareBusStopModeData(data);
            this.handleRetainMessages();
        });
    }

    /** Hook for a domain-specific extra subscription (e.g. maintenance's fareConsole$). */
    protected initExtraSubscriptions(): void {}

    /** Hook for domain-specific handling of a fareBusStopMode$ emission. */
    protected onFareBusStopModeData(_data: IFareBusStopMode): void {}

    private handleRetainMessages(): void {
        if (!this.mode && this.fareBusStopMode.mode) {
            this.mode = this.fareBusStopMode.mode;
        }
    }

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

    abstract handleBack(): void;

    handleCancel(): void {
        this.updateFareBusStopModeState({
            ...this.fareBusStopMode,
            timeout: undefined,
            msgID: MsgID.FARE_BUS_STOP_MODE,
        });
    }

    handleSelectFareBusStopMode(mode: number): void {
        this.mode = mode;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.[this.topicKey]?.get,
            msgID: MsgID.FARE_BUS_STOP_MODE_SELECT,
            msgSubID: MsgSubID.REQUEST,
            payload: { mode },
        });
    }

    handleConfirmFareBusStopMode(): void {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.[this.topicKey]?.get,
            msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: { mode: this.mode },
        });
    }

    backSelectMode(): void {
        this.updateFareBusStopModeState({ ...this.fareBusStopMode, msgID: MsgID.FARE_BUS_STOP_MODE });
    }

    removeTimeout(): void {
        this.updateFareBusStopModeState({ ...this.fareBusStopMode, timeout: undefined });
        clearTimeout(this.timeOutId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        clearTimeout(this.timeOutId);
        this.updateFareBusStopModeState({ status: undefined, msgID: undefined });
    }

    /** Dispatch the domain-specific updateFareBusStopMode action with the given payload. */
    protected abstract updateFareBusStopModeState(payload: Partial<IFareBusStopMode>): void;
}
