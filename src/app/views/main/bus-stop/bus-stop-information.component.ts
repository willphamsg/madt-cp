import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList } from '@angular/core'; // Add ViewChild import here
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import {
    currentFareBusStop,
    busStopList,
    selectBusStop,
    busStopFareId,
    userInfo,
    currentDir,
    fareBusStopList,
    updateCurrentFareBusStop,
    deviation,
    displayFareBusStopList,
    updateDisplayFareBusStopList,
    // nextBusInfo,
} from '@store/main/main.reducer';
import { AppState } from '@store/app.state';
import { Observable, Subject, combineLatest, switchMap } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import {
    IFmsBusStop,
    ICurrenNowDest,
    IDeviation,
    IUserInfoMain,
    StrNum,
    // INextBusInfo,
    IFareBusStop,
    MsgID,
    MsgSubID,
} from '@models';
import { ButtonSoundDirective } from '@directives/button-sound.directive';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';

@Component({
    selector: 'bus-stop-information',
    imports: [CommonModule, TranslateModule, AppScrollBar],
    templateUrl: './bus-stop-information.component.html',
    styleUrls: ['./bus-stop-information.component.scss'],
    providers: [DatePipe],
})
export class BusStopInformationComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>(); // A single Subject to manage all cleanup
    headwayBars: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    displayFareBusStopList$: Observable<boolean> = this.store.select(displayFareBusStopList);
    displayFareBusStop = false;
    displayCfmBusStopFare = false;
    selectFareBusStop!: string;
    selectFareBusStopName!: string;
    selectedIndex: number = -1;
    // Observables
    barCounts: number[] = [];
    currentFareBusStop$: Observable<IFareBusStop | null>;
    fareBusStop: IFareBusStop | null = null;
    fareBusStopList$: Observable<IFareBusStop[]>;
    busStopList$: Observable<IFmsBusStop[]>;
    busStopFareId$: Observable<string>;
    userInfo$: Observable<IUserInfoMain>;
    allBusStopList: IFmsBusStop[] = [];
    currentNowNext: string[] = [];
    currentUserIfo: IUserInfoMain | null = null;
    destination!: IFmsBusStop | undefined;
    currentDir$: Observable<ICurrenNowDest | null>;
    hasUpdate: boolean = false;
    deviation$: Observable<IDeviation>;
    deviation: IDeviation | null = null;
    @ViewChildren('indicatorDiv') indicatorDiv: QueryList<ElementRef> | undefined;
    // nextBusInfo$: Observable<INextBusInfo>;

    topics;
    backToTop: boolean = false;

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private mqttService: MqttService,
        private soundService: SoundService,
    ) {
        // Store selectors
        this.currentFareBusStop$ = this.store.select(currentFareBusStop);
        this.fareBusStopList$ = this.store.select(fareBusStopList);
        this.busStopList$ = this.store.select(busStopList);
        this.busStopFareId$ = this.store.select(busStopFareId);
        this.userInfo$ = this.store.select(userInfo);
        this.currentDir$ = this.store.select(currentDir);
        this.deviation$ = this.store.select(deviation);
        // this.nextBusInfo$ = this.store.select(nextBusInfo).pipe(takeUntil(this.destroy$));
    }

    getNowNextDataById(id, data) {
        const index = data.findIndex((item) => item.Busid === id);
        if (index === -1) {
            return null;
        }
        const result = [data[index]];
        if (index < data.length - 1) {
            result.push(data[index + 1]);
        }

        return result;
    }

    getColoredBars(direction, bars) {
        const numbers: number[] = [];
        let i = ['left', 'up', 'top']?.includes(direction) ? 6 - bars + 1 : 6;
        if (['left', 'up', 'top']?.includes(direction)) {
            do {
                numbers.push(i);
                i = i + 1;
            } while (i <= 6);
        }
        if (['right', 'down', 'bottom']?.includes(direction)) {
            do {
                numbers.push(i);
                i = i + 1;
            } while (i >= 6 && i <= 6 + bars - 1);
        }

        if (direction === 'middle') {
            let start = Math.ceil((12 - bars) / 2);
            let tempBars = bars;
            while (tempBars > 0) {
                numbers.push(start);
                start = start + 1;
                tempBars = tempBars - 1;
            }
        }

        return bars === 0 ? [] : numbers;
    }

    // scrollToElement(elementId: string) {
    //     const targetElement = document.getElementById(elementId);
    //     if (targetElement) {
    //         // Pass smooth scrolling options
    //         this.scrollbarRef?.scrollToElement(targetElement);
    //     }
    // }

    triggerScrollTop() {
        this.backToTop = true;

        setTimeout(() => {
            this.backToTop = false;
        }, 300);
    }

    convertSecondsToMinutes(seconds: number): number {
        return Math.ceil(seconds / 60);
    }

    // ngDoCheck(): void {
    //     if (this.currentNowNext?.length > 0 && this.hasUpdate) {
    //         this.indicatorDiv?.toArray().forEach((elementRef) => {
    //             if (elementRef.nativeElement.id === this.currentNowNext?.[0]) {
    //                 this.hasUpdate = false;
    //                 this.scrollToElement(this.currentNowNext[0]);
    //             }
    //         });
    //     }
    // }

    filterById(data, id) {
        return data?.filter((item) => item?.Busid === id)?.[0];
    }

    ngOnInit(): void {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.deviation$.pipe(takeUntil(this.destroy$)).subscribe((_deviation) => {
            if (_deviation?.direction) {
                this.barCounts = this.getColoredBars(_deviation?.direction, _deviation?.bars);
            }
            this.deviation = _deviation;
        });

        this.displayFareBusStopList$.pipe(takeUntil(this.destroy$)).subscribe((_isDisplay) => {
            this.displayFareBusStop = _isDisplay;
        });
        // Subscribe to lineActive and busStopList observables and clean up
        this.currentFareBusStop$
            .pipe(
                takeUntil(this.destroy$), // Will automatically unsubscribe when component is destroyed
                switchMap((fareBusStop) => {
                    return combineLatest([
                        this.busStopList$,
                        this.userInfo$,
                        this.currentDir$,
                        this.fareBusStopList$,
                    ]).pipe(
                        takeUntil(this.destroy$), // Subscribe to all in parallel with a single takeUntil
                        map(([busStops, userIn, dirInfo, fareBusStopList]) => {
                            this.allBusStopList = busStops;
                            this.destination = busStops[busStops.length - 1];
                            this.currentUserIfo = userIn;
                            this.fareBusStop = fareBusStop;

                            // console.log('currentUserIfo', this.currentUserIfo);
                            // console.log('fareBusStop', fareBusStop);
                        }),
                    );
                }),
            )
            .subscribe();
    }

    formatKm(km: number | string): string {
        if (typeof km === 'number') {
            return km.toFixed(1);
        }
        if (typeof km === 'string') {
            const num = parseFloat(km);
            return isNaN(num) ? '0.0' : num.toFixed(1);
        }
        return km;
    }

    // Select bus stop and navigate
    selectBusStop(busStop: IFmsBusStop): void {
        this.router.navigate([`/main/bus-stop-fare/${busStop.Busid}`]);
        this.store.dispatch(selectBusStop({ payload: busStop }));
    }

    // Toggle visibility for bus stop fare information
    handleDisplayFareBusStop() {
        // this.displayBusStopFare = true;
        this.store.dispatch(
            updateDisplayFareBusStopList({
                payload: true,
            }),
        );
    }

    handleCloseBusStopFare() {
        // this.displayBusStopFare = false;
        this.displayCfmBusStopFare = false;
        this.selectFareBusStop = '';
        this.selectFareBusStopName = '';
        this.selectedIndex = -1;
        this.store.dispatch(
            updateDisplayFareBusStopList({
                payload: false,
            }),
        );
    }

    handleChangeBusStopFare(busStop: IFareBusStop, idx: number) {
        this.selectFareBusStop = busStop?.Busid;
        this.selectFareBusStopName = busStop?.Name;
        this.selectedIndex = idx;
        // this.displayBusStopFare = false;
        this.displayCfmBusStopFare = true;
    }

    handleConfirmBusStopFare(isConfirm: boolean) {
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics.mainTab?.get,
                msgID: MsgID.MAIN_UPDATE_FARE_BUS_STOP,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    busStopId: this.selectFareBusStop,
                    index: this.selectedIndex,
                },
            });
            this.store.dispatch(
                updateCurrentFareBusStop({
                    payload: this.selectFareBusStop,
                    idx: this.selectedIndex,
                }),
            );
            // this.displayBusStopFare = false;
            this.displayCfmBusStopFare = false;
            this.selectFareBusStop = '';
            this.selectFareBusStopName = '';
            this.selectedIndex = -1;
            this.store.dispatch(
                updateDisplayFareBusStopList({
                    payload: false,
                }),
            );
        } else {
            // this.displayBusStopFare = true;
            this.displayCfmBusStopFare = false;
            this.store.dispatch(
                updateDisplayFareBusStopList({
                    payload: true,
                }),
            );
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    // Clean up observables when component is destroyed
    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }
}
