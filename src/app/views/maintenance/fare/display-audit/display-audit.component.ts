import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { MqttService } from '@services/mqtt.service';
import { IAuditRegistration, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { auditRegistration, updateAuditRegistration } from '@store/maintenance/maintenance.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
@Component({
    selector: 'display-audit',
    imports: [TranslateModule, AppScrollBar, CommonPopUp],
    templateUrl: './display-audit.component.html',
    styleUrls: ['./display-audit.component.scss'],
})
export class DisplayAuditComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly auditRegistration$: Observable<IAuditRegistration> = this.store.select(auditRegistration);
    auditRegistration: IAuditRegistration = {};

    isLoading: boolean = true;
    ResponseStatus = ResponseStatus;
    topics;

    constructor(
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.maintenance?.get,
                    msgID: MsgID.MAINTENANCE_AUDIT_REGISTRATION,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            }
        });

        this.auditRegistration$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.auditRegistration = data;
            // console.log('auditRegistration', this.auditRegistration);
            if (data?.auditRegisterList?.length) {
                this.isLoading = false;
            } else if (data.status === ResponseStatus.PROGRESS) {
                this.isLoading = true;
            } else if (data.status === ResponseStatus.ERROR) {
                this.isLoading = false;
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.store.dispatch(
            updateAuditRegistration({
                payload: {},
            }),
        );
    }
}
