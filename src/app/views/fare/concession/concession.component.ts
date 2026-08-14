import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IConcession, MsgID, MsgSubID, ResponseStatus } from '@models';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { concession, updateConcession } from '@store/fare/fare.reducer';
import { routerUrls } from '@app/app.routes';

import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';

@Component({
    selector: 'concession',
    imports: [RouterModule, TranslateModule, CommonPopUp],
    templateUrl: './concession.component.html',
    styleUrls: ['./concession.component.scss'],
})
export class ConcessionComponent implements OnInit, OnDestroy {
    readonly MsgID = MsgID;
    readonly ResponseStatus = ResponseStatus;

    cv: 'CV1' | 'CV2' = 'CV1';

    private readonly destroy$ = new Subject<void>();
    private readonly concession$: Observable<IConcession>;

    concession: IConcession = {};
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
        this.concession$ = this.store.select(concession);
    }

    private initializeCvType(): 'CV1' | 'CV2' {
        const pageData = this.activeRoute.snapshot.data;
        return pageData['cvType'] as 'CV1' | 'CV2';
    }

    ngOnInit(): void {
        this.initMqttConfig();
        this.initConcessionSubscription();
    }

    private initMqttConfig(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    private initConcessionSubscription(): void {
        this.concession$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.concession = data;
            this.handleTimeoutManagement(data);
        });
    }

    private handleTimeoutManagement(data: IConcession): void {
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

    private setTimeoutHandler(data: IConcession): void {
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

    handleConcession() {
        this.backToFare();
    }

    handleConfirmConcession(): void {
        this.removeTimeout();
        this.publishConcessionSubmit();
    }

    handleStopConcession(): void {
        this.publishConcessionCancel();
        this.backToFare();
    }

    private publishConcessionSubmit(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CONCESSION_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                cvNum: this.getCvNumber(),
            },
        });
    }

    private publishConcessionCancel(): void {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.fareTab?.get,
            msgID: MsgID.FARE_CONCESSION_CANCEL2,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                cvNum: this.getCvNumber(),
            },
        });
    }

    private getCvNumber(): number {
        return this.cv === 'CV1' ? 1 : 2;
    }

    backToFare(): void {
        this.router.navigate([`${routerUrls.private.fare.url}`]);
    }

    backToProgressScreen(): void {
        this.updateConcessionState(ResponseStatus.PROGRESS, 30000, MsgID.FARE_CONCESSION_SUBMIT);
    }

    removeTimeout(): void {
        this.clearExistingTimeout();
        this.updateConcessionState(undefined, undefined);
    }

    private updateConcessionState(status?: number, timeout?: number, msgID?: number): void {
        this.store.dispatch(
            updateConcession({
                payload: { status, timeout },
                msgID,
            }),
        );
    }

    private cleanup(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearExistingTimeout();
        this.resetConcessionState();
    }

    private resetConcessionState(): void {
        this.updateConcessionState(undefined, undefined);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy(): void {
        this.cleanup();
    }
}
