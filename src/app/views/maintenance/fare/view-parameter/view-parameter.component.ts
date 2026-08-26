import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { UtilsServices } from '@services/utils.service';
import { IViewParameter, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { viewParameter, updateViewParameter } from '@store/maintenance/maintenance.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'view-parameter',
    imports: [MatIconModule, RouterModule, AppScrollBar, CommonPopUp, TranslateModule],
    templateUrl: './view-parameter.component.html',
    styleUrls: ['./view-parameter.component.scss'],
})
export class ViewParameterComponent implements OnInit, OnDestroy {
    sort = { fullName: 'asc', version: 'asc', date: 'asc', status: 'asc' };
    private readonly destroy$ = new Subject<void>();
    private readonly viewParameter$: Observable<IViewParameter> = this.store.select(viewParameter);
    viewParameter: IViewParameter = { parameters: [] };

    isLoading: boolean = true;
    ResponseStatus = ResponseStatus;
    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
        private readonly utilsService: UtilsServices,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.maintenance?.get,
                    msgID: MsgID.MAINTENANCE_PARAMETER,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            }
        });

        this.viewParameter$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.viewParameter = data;
            if (data.status === ResponseStatus.PROGRESS) {
                this.isLoading = true;
            } else if (data.status === ResponseStatus.ERROR || data.status === ResponseStatus.SUCCESS) {
                this.isLoading = false;
            }
        });
    }

    ngOnDestroy() {
        this.store.dispatch(
            updateViewParameter({
                payload: {
                    msgID: undefined,
                    status: undefined,
                    message: undefined,
                    parameters: [],
                },
            }),
        );

        // Unsubscribe from all subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleSort(key: string): void {
        this.sort[key] = this.sort[key] === 'asc' ? 'desc' : 'asc';
        const nextParameters = [...this.viewParameter.parameters];
        if (key === 'date') {
            nextParameters.sort((a, b) => {
                const date1 = this.utilsService.createDateFromString(`${a['date']} ${a['time']}`);
                const date2 = this.utilsService.createDateFromString(`${b['date']} ${b['time']}`);
                const sortResult = date1.getTime() - date2.getTime();
                return this.sort[key] === 'asc' ? sortResult : sortResult * -1;
            });
            this.store.dispatch(
                updateViewParameter({
                    payload: {
                        ...this.viewParameter,
                        parameters: nextParameters,
                    },
                }),
            );
        } else {
            nextParameters.sort((a, b) => {
                const key1 = a[key]?.toUpperCase();
                const key2 = b[key]?.toUpperCase();
                const sortResult = key1.localeCompare(key2, undefined, {
                    numeric: true,
                    sensitivity: 'base',
                });
                return this.sort[key] === 'asc' ? sortResult : sortResult * -1;
            });
            this.store.dispatch(
                updateViewParameter({
                    payload: {
                        ...this.viewParameter,
                        parameters: nextParameters,
                    },
                }),
            );
        }
    }

    handleRetry(): void {
        this.isLoading = true;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_PARAMETER,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
