import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { routerUrls } from '@app/app.routes';
import { IStatusIndicators, MsgID, MsgSubID, IConnectionStatus } from '@models';
import { MqttService } from '@services/mqtt.service';
import { Observable, Subject, interval } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { LocalStorageService } from '@services/local-storage.service';
import { SoundService } from '@app/services/sound.service';
import { environment } from '@env/environment';
import { allConnectionStatus, locationMode } from '@store/global/global.reducer';
import { startAutoClicker, stopAutoClicker } from '../../../../../test/main';
@Component({
    selector: 'app-header',
    imports: [CommonModule, MatSlideToggleModule, TranslateModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [DatePipe],
})
// routerUrls?.private?.main?.busOperation?.startTrip
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
    env = environment;
    @Input({ required: true }) screen!: string; // main/ ticketing/ maintenance
    @Input() onlyDateTime: boolean = false;
    @Input() disconnect: boolean = false; // Used to show disconnect component in header
    @Input() disabledAllButtons?: boolean = false;
    @Input() activeButtons?: string[] = [];
    @Input() isLoggedIn?: boolean = false;
    @Output() clickLock: EventEmitter<Event> = new EventEmitter<Event>();
    @Output() clickLogout: EventEmitter<Event> = new EventEmitter<Event>();
    @Output() clickSettings: EventEmitter<Event> = new EventEmitter<Event>();
    currentDate = Date.now(); // Initialize with current date and time

    intervalId;
    activeAutoClick: boolean = false;
    locationConfigVisible: boolean = environment.displayLocationConfig || false;

    buttons: {
        id: string;
        imgSrc?: string;
        label: string;
        navigateTo?: string;
        screens: string[];
        class: string;
        data?: any;
        msgID?: number;
        type?: string;
        onClick?: (params: any, allData?: any) => void;
    }[] = [
        {
            id: 'settings-btn',
            imgSrc: '/assets/images/icons/main/settings.svg',
            label: 'SETTINGS',
            screens: [
                routerUrls?.private?.main?.url,
                routerUrls?.private?.fare?.url,
                routerUrls?.private?.busOperation?.url,
                routerUrls?.private?.main?.busOperation?.url,
                routerUrls?.private?.main?.busOperation?.startTripValidInfo,
                routerUrls?.private?.main?.busOperation?.endShift,
            ],
            class: 'button',
            type: 'button',
            onClick: () => {
                this.clickSettings?.emit();
                // this.handleNavigate(`/${routerUrls?.private?.logOut?.url}`);
            },
        },
        {
            id: 'log-out-btn',
            imgSrc: '/assets/images/icons/main/logout.svg',
            label: 'LOGOUT',
            screens: [routerUrls?.private?.maintenance?.url],
            class: 'button',
            type: 'button',
            onClick: () => {
                this.clickLogout?.emit();
                // this.handleNavigate(`/${routerUrls?.private?.logOut?.url}`);
            },
        },
        {
            id: 'end-trip-btn',
            imgSrc: '/assets/images/icons/main/end-trip.svg',
            label: 'END_TRIP',
            // navigateTo: `/${routerUrls?.private?.main?.endTrip}`,
            screens: [routerUrls?.private?.main?.url],
            class: 'button',
            type: 'button',
            onClick: () => {
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.mainTab?.get,
                    msgID: MsgID.END_TRIP,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            },
        },
        {
            id: 'lock-btn',
            imgSrc: '/assets/images/icons/main/lock.svg',
            label: 'LOCK',
            screens: [
                routerUrls?.private?.main?.url,
                routerUrls?.private?.fare?.url,
                routerUrls?.private?.busOperation?.url,
                routerUrls?.private?.main?.busOperation?.url,
                routerUrls?.private?.main?.busOperation?.startTripValidInfo,
                routerUrls?.private?.main?.busOperation?.endShift,
            ],
            class: 'button lock-button',
            type: 'button',
            onClick: () => {
                // this.mqttService.publishWithMessageFormat({
                //     topic: this.topics?.mainTab?.get,
                //     msgID: MsgID.LOCK,
                //     msgSubID: MsgSubID.REQUEST,
                //     payload: {},
                // });
                // this.handleNavigate(`/${routerUrls?.private?.main?.lockScreen}`);
                this.clickLock?.emit();
            },
        },
        {
            id: 'manual-login',
            label: 'MANUAL_LOGIN',
            screens: [
                routerUrls?.private?.main?.login,
                routerUrls?.private?.main?.dagwOperation,
                routerUrls?.private?.main?.tapCardLogin,
            ],
            class: 'button',
            type: 'button',
            onClick: () => {
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.mainTab?.get,
                    msgID: MsgID.MANUAL_LOGIN,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {},
                });
            },
        },
        {
            id: 'wlan-btn',
            imgSrc: '/assets/images/icons/main/wlan.svg',
            label: 'WLAN',
            onClick: () => {
                this.mqttService.publishWithMessageFormat({
                    topic: this.topics?.mainTab?.get,
                    msgID: MsgID.TRIGGER_DAGW_OPERATION,
                    msgSubID: MsgSubID.REQUEST,
                    payload: {
                        triggerDAGWButton: true,
                    },
                });
            },
            screens: [
                routerUrls?.private?.main?.login,
                routerUrls?.private?.main?.tapCardLogin,
                routerUrls?.private?.main?.dagwOperation,
            ],
            class: 'button',
            type: 'button',
        },
    ];

    statusIndicators: IStatusIndicators[] = [
        { label: 'BTS', connected: false, hidden: false },
        { label: 'BOLC', connected: false, hidden: false },
        { label: 'Fare', connected: true, hidden: false },
        { label: 'FMS', connected: false, hidden: false },
        { label: 'CRP', connected: false, hidden: false }, // You can modify this condition as needed
    ];

    private readonly destroy$ = new Subject<void>();
    connectionStatusState$: Observable<IConnectionStatus> = this.store.select(allConnectionStatus);
    locationConfigStatus$: Observable<number> = this.store.select(locationMode);

    topics;

    constructor(
        public datePipe: DatePipe,
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly soundService: SoundService,
        private readonly store: Store<AppState>,
        private readonly localStorageService: LocalStorageService,
    ) {}

    ngOnInit() {
        this.watchStorageChanges();

        interval(1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.currentDate = Date.now();
            });

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        // console.log('Changes detected in HeaderComponent:', changes);
        const isLoggedIn = changes['isLoggedIn']?.currentValue;
        const prevLoggedIn = changes['isLoggedIn']?.previousValue;

        if (isLoggedIn !== prevLoggedIn) {
            this.statusIndicators[1].hidden = !isLoggedIn; //  BOLC indicator visibility based on login status
        }
    }

    private watchStorageChanges(): void {
        // combineLatest([
        //     this.localStorageService.watch(LocalStorageKey.STATUS_BOLC),
        //     this.localStorageService.watch(LocalStorageKey.STATUS_FMS),
        //     this.localStorageService.watch(LocalStorageKey.STATUS_CRP),
        //     this.localStorageService.watch(LocalStorageKey.STATUS_BTS),
        //     // this.localStorageService.watch(LocalStorageKey.AUTH),
        // ])
        //     .pipe(
        //         takeUntil(this.destroy$),
        //         map(([statusBOLCStr, statusFMSStr, statusCRPStr, statusBTSStr]) => {
        //             const statusBOLC: boolean = statusBOLCStr
        //                 ? JSON.parse(statusBOLCStr)
        //                 : initialDeviceStatus.statusBOLC;
        //             const statusFMS: boolean = statusFMSStr ? JSON.parse(statusFMSStr) : initialDeviceStatus.statusFMS;
        //             const statusCRP: boolean = statusCRPStr ? JSON.parse(statusCRPStr) : initialDeviceStatus.statusCRP;
        //             const statusBTS: boolean = statusBTSStr ? JSON.parse(statusBTSStr) : initialDeviceStatus.statusBTS;
        //             return { statusBOLC, statusFMS, statusCRP, statusBTS };
        //         }),
        //     )
        //     .subscribe(({ statusBOLC, statusFMS, statusCRP, statusBTS }) => {
        //         const mapping = {
        //             BTS: { connected: statusBTS },
        //             BOLC: { connected: statusBOLC },
        //             FMS: { connected: statusFMS },
        //             CRP: { connected: statusCRP },
        //         };
        //         const formatStatus = this.statusIndicators?.map((item) => {
        //             return {
        //                 ...item,
        //                 ...mapping[item?.label],
        //             };
        //         });

        //         // only show BOLC indicator if user is logged in
        //         this.statusIndicators = formatStatus;
        //         this.statusIndicators[1].hidden = this.isLoggedIn ? false : true; //  BOLC indicator visibility based on login status
        //     });

        this.connectionStatusState$.pipe(takeUntil(this.destroy$))?.subscribe((status) => {
            const mapping = {
                BTS: {
                    connected: status?.statusBTS,
                },
                BOLC: {
                    connected: status?.statusBOLC,
                },
                FMS: {
                    connected: status?.statusFMS,
                },
                CRP: {
                    connected: status?.statusCRP,
                },
            };
            const formatStatus = this.statusIndicators?.map((item) => {
                return {
                    ...item,
                    ...mapping[item?.label],
                };
            });
            this.statusIndicators = formatStatus;
            this.statusIndicators[1].hidden = !this.isLoggedIn; //  BOLC indicator visibility based on login status
        });
    }

    handleNavigate(page: string) {
        this.router.navigate([page]);
    }

    handleChangeAutoClick() {
        this.activeAutoClick = !this.activeAutoClick;

        if (this.activeAutoClick) {
            this.mqttService.clearMqttLog();
            startAutoClicker(environment.clickInterval || 3000); // click every 3s
        } else {
            stopAutoClicker();
            this.mqttService.downloadMqttLog(`mqtt-log-${Date.now()}.csv`);
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
