import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { IBlsInformation, MsgID, MsgSubID, ResponseStatus } from '@models';
import { AppState } from '@store/app.state';
import { blsInformation, updateBlsInformation } from '@store/maintenance/maintenance.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'bls-information',
    imports: [RouterModule, AppScrollBar, TranslateModule, CommonPopUp],
    templateUrl: './bls-information.component.html',
    styleUrls: ['./bls-information.component.scss'],
})
export class BLSInformationComponent implements OnInit {
    sort = { name: 'asc', value: 'asc' };

    private destroy$ = new Subject<void>();
    private blsInformation$: Observable<IBlsInformation> = this.store.select(blsInformation);
    blsInformation: IBlsInformation = {
        blsList: [],
    };

    isLoading: boolean = true;
    ResponseStatus = ResponseStatus;
    topics;

    constructor(
        private soundService: SoundService,
        private router: Router,
        protected store: Store<AppState>,
        private mqttService: MqttService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.maintenance?.get,
                    msgID: MsgID.MAINTENANCE_BLS_INFORMATION,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            }
        });

        this.blsInformation$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.blsInformation = data;
            if (data && data?.blsList?.length) {
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
            updateBlsInformation({
                payload: {
                    msgID: undefined,
                    status: undefined,
                    message: undefined,
                    blsList: [],
                },
            }),
        );
    }

    handleSort(key: string): void {
        this.sort[key] = this.sort[key] === 'asc' ? 'desc' : 'asc';
        const nextParameters = [...this.blsInformation.blsList];
        this.store.dispatch(
            updateBlsInformation({
                payload: {
                    ...this.blsInformation,
                    blsList: nextParameters.sort((a, b) => {
                        const key1 = a[key]?.toUpperCase();
                        const key2 = b[key]?.toUpperCase();
                        const sortResult = key1.localeCompare(key2, undefined, { numeric: true, sensitivity: 'base' });
                        return this.sort[key] === 'asc' ? sortResult : sortResult * -1;
                    }),
                },
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
