import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ICancelRide, MsgID, MsgSubID, ResponseStatus } from '@models';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { cancelRide, updateCancelRide } from '@store/fare/fare.reducer';
import { routerUrls } from '@app/app.routes';

import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';

@Component({
    selector: 'cancel-ride',
    imports: [RouterModule, TranslateModule, CommonPopUp],
    templateUrl: './cancel-ride.component.html',
    styleUrls: ['./cancel-ride.component.scss'],
})
export class CancelRideComponent implements OnInit, OnDestroy {
    readonly MsgID = MsgID;
    readonly ResponseStatus = ResponseStatus;

    cv: 'CV1' | 'CV2' = 'CV1';

    private readonly destroy$ = new Subject<void>();
    private readonly cancelRide$: Observable<ICancelRide>;

    cancelRide: ICancelRide = {};
    topics: any;
    private timeOutId: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private readonly router: Router,
        private readonly activeRoute: ActivatedRoute,
        protected readonly store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
    ) {
        this.cv = this.initializeCvType();
        this.cancelRide$ = this.store.select(cancelRide);
    }

    private initializeCvType(): 'CV1' | 'CV2' {
        const pageData = this.activeRoute.snapshot.data;
        return pageData['cvType'] as 'CV1' | 'CV2';
    }

    ngOnInit(): void {
        this.initMqttConfig();
        this.initCancelRideSubscription();
    }

    private initMqttConfig(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    private initCancelRideSubscription(): void {
        this.cancelRide$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.cancelRide = data;
            this.handleTimeoutManagement(data);
        });
    }

    private handleTimeoutManagement(data: ICancelRide): void {
        this.clearExistingTimeout();

        if (data.timeout && data.timeout > 0) {
            this.setTimeoutHandler(data);
        }
    }

    private clearExistingTimeout(): void {
        if (this.timeOutId !== null) {
            clearTimeout(this.timeOutId);
            this.timeOutId = null;
        }
    }

    private setTimeoutHandler(data: ICancelRide): void {
        this.timeOutId = setTimeout(() => {
            this.publishTimeoutMessage(data.msgID || 0);
            this.backToFare();
        }, data.timeout);
    }

    private publishTimeoutMessage(msgID: number): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.TIMEOUT_MESSAGE,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                msgID: msgID,
            },
        });
    }

    handleCancelRide(): void {
        this.backToFare();
    }

    handleConfirmCancelRide(): void {
        this.removeTimeout();
        this.publishCancelRideSubmit();
    }

    handleStopCancelRide(): void {
        this.publishCancelRideStop();
        this.backToFare();
    }

    private publishCancelRideSubmit(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CANCEL_RIDE_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                cvNum: this.getCvNumber(),
            },
        });
    }

    private publishCancelRideStop(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CANCEL_RIDE_CANCEL2,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                cvNum: this.getCvNumber(),
            },
        });
    }

    private getCvNumber(): number {
        return this.cv === 'CV1' ? 1 : 2;
    }

    backToProgressScreen(): void {
        this.updateCancelRideState(ResponseStatus.PROGRESS, 30000, MsgID.FARE_CANCEL_RIDE_SUBMIT);
    }

    backToFare(): void {
        this.router.navigate([`${routerUrls.private.fare.url}`]);
    }

    removeTimeout(): void {
        this.clearExistingTimeout();
        this.updateCancelRideState();
    }

    private updateCancelRideState(status?: number, timeout?: number, msgID?: number): void {
        this.store.dispatch(
            updateCancelRide({
                payload: { status, timeout },
                msgID,
            }),
        );
    }

    private cleanup(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearExistingTimeout();
        this.resetCancelRideState();
    }

    private resetCancelRideState(): void {
        this.updateCancelRideState();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy(): void {
        this.cleanup();
    }
}
