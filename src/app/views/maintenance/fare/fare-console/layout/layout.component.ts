import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet } from '@angular/router';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { MsgID, MsgSubID, IFareConsole } from '@models';
import { AppState } from '@store/app.state';
import { tcDateTime, fareConsole, updateFareConsole } from '@store/maintenance/maintenance.reducer';
@Component({
    selector: 'fare-console-layout',
    imports: [MatIconModule, RouterModule, RouterOutlet],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class FareConsoleLayoutComponent implements OnInit {
    private destroy$ = new Subject<void>();
    private submittedFareConsoleSnapshot: {
        deckTypeId: number;
        fareBusStopMode?: number;
        dateTime?: string;
        busId?: string;
        complimentaryDays?: number;
        serviceProvider?: number;
    } | null = null;

    fareConsoleSetting$: Observable<IFareConsole> = this.store.select(fareConsole);
    fareConsoleSetting: IFareConsole = {
        deckType: {
            id: 0,
            label: '',
        },
        blsStatus: 0,
        busId: '',
        date: '',
        time: '',
        complimentaryDays: 0,
        message: '',
    };

    topics;

    constructor(
        protected store: Store<AppState>,
        private mqttService: MqttService,
    ) {}

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.maintenance?.get,
                    msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            }
        });

        this.fareConsoleSetting$.pipe(takeUntil(this.destroy$)).subscribe((data: IFareConsole) => {
            this.fareConsoleSetting = data;

            // Only save the first received fare console data as snapshot for comparison,
            // which is expected to be the initial state before any modification.
            // Subsequent updates to fare console (e.g. from user modification) will not update the snapshot,
            // so that we can compare with the snapshot to determine if there is any change to show the save popup.
            if (!this.submittedFareConsoleSnapshot && data.msgID === MsgID.MAINTENANCE_FARE_CONSOLE) {
                this.submittedFareConsoleSnapshot = this.getComparableFareConsole(data);
            }
        });
    }

    validateFareConsoleForm() {
        return [
            this.fareConsoleSetting.deckType.id,
            this.fareConsoleSetting.dateTime,
            this.fareConsoleSetting.busId,
            this.fareConsoleSetting.complimentaryDays,
            this.fareConsoleSetting.fareBusStopMode,
        ].every((value) => !!value);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        if (!this.fareConsoleSetting.isSubmitted) {
            this.store.dispatch(
                updateFareConsole({
                    payload: {
                        ...this.fareConsoleSetting,
                        isDaftMode:
                            this.validateFareConsoleForm() &&
                            this.hasFareConsoleChangedFromSnapshot(this.fareConsoleSetting),
                    },
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
        }
    }

    private getComparableFareConsole(data: IFareConsole): {
        deckTypeId: number;
        fareBusStopMode?: number;
        dateTime?: string;
        busId?: string;
        complimentaryDays?: number;
        serviceProvider?: number;
    } {
        return {
            deckTypeId: data.deckType?.id || 0,
            fareBusStopMode: data.fareBusStopMode,
            dateTime: data.dateTime,
            busId: data.busId,
            complimentaryDays: data.complimentaryDays,
            serviceProvider: data.serviceProvider,
        };
    }

    private hasFareConsoleChangedFromSnapshot(data: IFareConsole): boolean {
        if (!this.submittedFareConsoleSnapshot) {
            return false;
        }

        const current = this.getComparableFareConsole(data);

        return (
            current.deckTypeId !== this.submittedFareConsoleSnapshot.deckTypeId ||
            current.fareBusStopMode !== this.submittedFareConsoleSnapshot.fareBusStopMode ||
            current.busId !== this.submittedFareConsoleSnapshot.busId ||
            current.complimentaryDays !== this.submittedFareConsoleSnapshot.complimentaryDays ||
            current.serviceProvider !== this.submittedFareConsoleSnapshot.serviceProvider
        );
    }
}
