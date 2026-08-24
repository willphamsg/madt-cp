import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { AppState } from '@store/app.state';
import { IFareConsole } from '@models';
import { fareConsole } from '@store/maintenance/maintenance.reducer';

/**
 * Shared boilerplate for the maintenance/fare/fare-console sub-screens
 * (complimentary-day, time-setting, date-setting, bls, delete-parameter,
 * ...): they all load mqtt topics + the fareConsole store slice on init,
 * navigate back to the fare-console list, play a button sound, and tear
 * down their subscription on destroy. Subclasses can override
 * `onFareConsoleSetting` for any extra per-emission handling.
 */
@Directive()
export abstract class FareConsoleScreenBase implements OnInit, OnDestroy {
    protected readonly destroy$ = new Subject<void>();
    protected readonly fareConsoleSetting$: Observable<IFareConsole> = this.store.select(fareConsole);
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
        protected readonly soundService: SoundService,
        protected readonly router: Router,
        protected readonly store: Store<AppState>,
        protected readonly mqttService: MqttService,
    ) {}

    ngOnInit(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.fareConsoleSetting$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.fareConsoleSetting = data;
            this.onFareConsoleSetting(data);
        });
    }

    /** Hook for subclasses that need extra handling on each fareConsoleSetting$ emission. */
    protected onFareConsoleSetting(_data: IFareConsole): void {}

    goBack(): void {
        this.router.navigate(['/maintenance/fare/fare-console']);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
