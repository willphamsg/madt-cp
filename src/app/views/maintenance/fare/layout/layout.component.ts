import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NgScrollbarModule, NgScrollbar } from 'ngx-scrollbar';
import { NgScrollReached } from 'ngx-scrollbar/reached-event';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MqttService } from '@services/mqtt.service';
import { BreadcrumbComponent } from '@components/breadcrumb/breadcrumb.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SideNavMenu, maintenanceFareMenu } from '@data/side-nav';
import { IFareConsole, MsgID, MsgSubID } from '@models';
import { AppState } from '@store/app.state';
import { tcDateTime, fareConsole, updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'maintenance-fare-layout',
    imports: [
        CommonModule,
        MatIconModule,
        CommonPopUp,
        NgScrollbarModule,
        NgScrollReached,
        RouterModule,
        RouterOutlet,
        TranslateModule,
        BreadcrumbComponent,
    ],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class MaintenanceFareLayoutComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    menus: SideNavMenu[] = maintenanceFareMenu;
    activeMenu: SideNavMenu | null = null;
    tcDateTime: Date | null = null;
    tcDateTime$: Observable<Date | null>;
    intervalId;

    isScrollTop: boolean = true;
    showSavePopup: boolean = false;
    @ViewChild(NgScrollbar) scrollbarRef?: NgScrollbar; // Now ViewChild is correctly imported

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
        private readonly soundService: SoundService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        protected store: Store<AppState>,
        private readonly mqttService: MqttService,
    ) {
        this.router.events.subscribe((ev) => {
            if (ev instanceof NavigationEnd) {
                this.checkActiveMenu(this.activatedRoute);
            }
        });
        this.tcDateTime$ = this.store.select(tcDateTime);
    }

    ngOnInit() {
        this.checkActiveMenu(this.activatedRoute);
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });
        this.tcDateTime$.pipe(takeUntil(this.destroy$)).subscribe((date) => {
            if (date) {
                clearInterval(this.intervalId);
                this.tcDateTime = new Date(date);
                this.intervalId = setInterval(() => {
                    this.tcDateTime = new Date((this.tcDateTime?.getTime() || 0) + 1000);
                }, 1000);
            }
        });
        this.fareConsoleSetting$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.fareConsoleSetting = data;

            this.showSavePopup = !!data.isDaftMode;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        clearInterval(this.intervalId);
    }

    handleActiveMenu(menu: SideNavMenu): void {
        this.activeMenu = menu;
    }

    checkActiveMenu(activeRoute: ActivatedRoute): void {
        const currentUrl = activeRoute['_routerState']['snapshot']['url'] || '';
        this.menus.forEach((m: SideNavMenu) => {
            if (currentUrl === '/maintenance/fare') {
                this.activeMenu = this.menus[0];
            }

            if (currentUrl.includes(`/maintenance/fare${m.route}`)) {
                this.activeMenu = m;
            }
        });
    }

    onTopReached(): void {
        this.isScrollTop = true;
    }

    onBottomReached(): void {
        this.isScrollTop = false;
    }

    handleScrollBottom(): void {
        const sideNav = document.querySelector('.madt-side-nav') as HTMLElement;
        this.scrollbarRef?.scrollTo({ top: sideNav.offsetHeight, duration: 300 });
    }

    handleScrollTop(): void {
        this.scrollbarRef?.scrollTo({ top: 0, duration: 300 });
    }

    handleConfirmFareConsole(): void {
        const nextFareConsoleState = {
            ...this.fareConsoleSetting,
            isSubmitted: true,
            isDaftMode: false,
        };

        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_FARE_CONSOLE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: {
                deckType: this.fareConsoleSetting.deckType.id,
                fareBusStopMode: this.fareConsoleSetting.fareBusStopMode,
                dateTime: this.fareConsoleSetting.dateTime,
                busId: this.fareConsoleSetting.busId,
                complimentaryDays: this.fareConsoleSetting.complimentaryDays,
                serviceProvider: this.fareConsoleSetting.serviceProvider,
            },
        });

        this.store.dispatch(
            updateFareConsole({
                payload: nextFareConsoleState,
                msgID: MsgID.FARE_CONSOLE,
            }),
        );

        this.showSavePopup = false;
    }

    handleBack() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.maintenance?.get,
            msgID: MsgID.MAINTENANCE_BACK,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
