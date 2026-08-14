import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { routerUrls } from '@app/app.routes';
import { TranslateModule } from '@ngx-translate/core';

import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject, combineLatest } from 'rxjs';
import { IBreakDown, MsgID, MsgSubID, ResponseStatus } from '@models';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { breakDownInfo, updateBreakDownInfo } from '@store/main/main.reducer';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { LocalStorageService } from '@services/local-storage.service';
@Component({
    selector: 'breakdown',
    imports: [CommonModule, RouterModule, AppScrollBar, TranslateModule],
    templateUrl: './breakdown.component.html',
    styleUrls: ['./breakdown.component.scss'],
})
export class BreakdownComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    breakDownInfo$: Observable<IBreakDown> = this.store.select(breakDownInfo);
    breakDownInfoData: IBreakDown = {
        service: 0,
        direction: '',
        busStopList: [],
        firstBusStop: {},
        lastBusStop: {},
        reasonList: [],
    };
    step: number = 0;

    reason: number = 0;
    numOfComplimentaryTickets = 0;
    numOfBreakdownTickets = 0;

    selectedFirstBusStop;
    selectedLastBusStop;

    topics;

    previousPage: number = 0;
    screen: 'DETAIL' | 'REASON' | 'COMPLIMENTARY_TICKET' | 'BREAKDOWN_TICKET' = 'DETAIL';

    //implement timeout
    timeoutMessage;
    intervalId;
    timeOutId;

    disableActions: boolean = false;

    constructor(
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly store: Store<AppState>,
        private readonly localStorageService: LocalStorageService,
        private readonly soundService: SoundService,
    ) {}

    ngOnInit() {
        combineLatest([this.mqttService.mqttConfigLoaded$, this.breakDownInfo$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([configLoaded, data]) => {
                if (configLoaded) {
                    this.topics = this.mqttService.mqttConfig?.topics;
                }
                if (data) {
                    this.breakDownInfoData = data || {};
                    console.log('breakDownInfoData', this.breakDownInfoData);

                    if (!this.selectedFirstBusStop) this.selectedFirstBusStop = this.breakDownInfoData.firstBusStop;
                    if (!this.selectedLastBusStop) this.selectedLastBusStop = this.breakDownInfoData.lastBusStop;

                    // update end bus stop success
                    if (
                        this.breakDownInfoData?.msgID === MsgID.BREAKDOWN_CHANGE_BUS_STOP &&
                        this.breakDownInfoData?.status === ResponseStatus.SUCCESS
                    ) {
                        this.step = 0;
                        const nextEndTripInfo = { ...this.breakDownInfoData };
                        this.store.dispatch(
                            updateBreakDownInfo({
                                payload: {
                                    ...nextEndTripInfo,
                                    lastBusStop: this.selectedLastBusStop,
                                    msgID: MsgID.MAIN_BREAKDOWN,
                                },
                            }),
                        );
                    }

                    // handle back
                    if (
                        this.breakDownInfoData?.msgID === MsgID.BREAKDOWN_BACK_BUTTON &&
                        this.breakDownInfoData?.status === ResponseStatus.SUCCESS
                    ) {
                        const nextEndTripInfo = { ...this.breakDownInfoData };
                        this.store.dispatch(
                            updateBreakDownInfo({
                                payload: {
                                    ...nextEndTripInfo,
                                    msgID: this.previousPage,
                                    status: ResponseStatus.SUCCESS,
                                },
                            }),
                        );
                    }

                    //handle timeout for first screen
                    clearTimeout(this.timeOutId);
                    if (data.timeout && data.timeout > 0) {
                        this.timeOutId = setTimeout(() => {
                            this.mqttService.publishWithMessageFormat({
                                topic: this.topics?.mainTab?.get,
                                msgID: MsgID.TIMEOUT_MESSAGE,
                                msgSubID: MsgSubID.NOTIFY,
                                payload: { msgID: MsgID.MAIN_BREAKDOWN },
                            });
                            this.router.navigate([routerUrls?.private?.main?.busStopInformation]);
                        }, data.timeout);
                    }

                    //remove disableActions when receive response
                    if (
                        data.msgID === MsgID.BREAKDOWN_SUBMIT_COMP_TICKET ||
                        data.msgID === MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET
                    ) {
                        this.disableActions = false;
                    }

                    this.handleSaveStateToLocalStorage();

                    //handle set current screen
                    this.setCurrentScreen();
                }
            });
    }

    handleSaveStateToLocalStorage() {
        if (this.breakDownInfoData.msgID === MsgID.BREAKDOWN_SUBMIT && !!this.breakDownInfoData.reasonList?.length) {
            this.localStorageService.setItem('reasons', JSON.stringify(this.breakDownInfoData.reasonList));
        }
    }

    setCurrentScreen(): void {
        const data = this.breakDownInfoData;
        const { msgID, status } = data || {};

        this.handleRetainMessages();

        if (status === ResponseStatus.ERROR) return;

        if (msgID === MsgID.BREAKDOWN_SUBMIT) {
            this.screen = 'REASON';
        } else if (msgID === MsgID.BREAKDOWN_SUBMIT_REASON || msgID === MsgID.BREAKDOWN_SUBMIT_COMP_TICKET) {
            this.screen = 'COMPLIMENTARY_TICKET';
        } else if (
            msgID === MsgID.BREAKDOWN_PROCESS_COMP_TICKET ||
            msgID === MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET ||
            msgID === MsgID.BREAKDOWN_PROCESS_BREAKDOWN_TICKET
        ) {
            this.screen = 'BREAKDOWN_TICKET';
        } else {
            this.screen = 'DETAIL';
        }
    }

    handleRetainMessages(): void {
        if (!this.breakDownInfoData.service && !!this.topics) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.MAIN_BUTTON,
                msgSubID: MsgSubID.REQUEST,
                payload: { btn: 'BREAKDOWN' },
            });
        }

        // store reasons list
        if (this.breakDownInfoData.msgID === MsgID.BREAKDOWN_SUBMIT && !this.breakDownInfoData.reasonList?.length) {
            const reasons = this.localStorageService.getItem('reasons');
            if (reasons) {
                this.store.dispatch(
                    updateBreakDownInfo({
                        payload: {
                            ...this.breakDownInfoData,
                            reasonList: JSON.parse(reasons),
                        },
                        msgID: MsgID.BREAKDOWN_SUBMIT,
                    }),
                );
            }
        }
    }

    navigateToBusOperation() {
        this.router.navigate([routerUrls?.private?.main?.busOperation?.url]);
    }

    goBackAndReset(step: number) {
        this.resetBreakdownInfo();
        this.step = step;
    }

    removeTimeout() {
        this.store.dispatch(updateBreakDownInfo({ payload: { ...this.breakDownInfoData, timeout: undefined } }));
        clearTimeout(this.timeOutId);
    }

    handleChangeEndBusStop() {
        this.removeTimeout();
        this.step = 1;

        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_BUS_STOP_LIST,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleSelectBusStop(busStopId) {
        const nextLastBusStop = this.breakDownInfoData.busStopList?.find((busStop) => busStop.Busid === busStopId);
        this.selectedLastBusStop = nextLastBusStop;
    }

    handleUpdateBusStop() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_CHANGE_BUS_STOP,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                busStopId: this.selectedLastBusStop.Busid,
            },
        });
    }

    handleCancelBreakdown() {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_CANCEL,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleConfirmBreakdown() {
        this.removeTimeout();
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_SUBMIT,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                service: this.breakDownInfoData.service,
                direction: this.breakDownInfoData.direction,
                firstBusStop: this.breakDownInfoData.firstBusStop.Busid,
                lastBusStop: this.breakDownInfoData.lastBusStop.Busid,
                variantName: this.breakDownInfoData.variantName,
            },
        });
    }

    backToInformation() {
        this.step = 0;
    }

    handleSelectReason(reason: number) {
        this.reason = reason;
    }

    handleConfirmReason() {
        if (!this.reason) {
            return;
        }
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_SUBMIT_REASON,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                reason: this.reason,
            },
        });
    }

    selectNumOfComplimentaryTicket(num: number) {
        this.numOfComplimentaryTickets = num;
        this.disableActions = true;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_SUBMIT_COMP_TICKET,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                numOfCompTickets: Number(num),
            },
        });
    }

    printComplimentaryTicket() {
        // if (this.numOfComplimentaryTickets > 0) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_PROCESS_COMP_TICKET,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
        // }
    }

    selectNumOfBreakdownTicket(num: number) {
        this.numOfBreakdownTickets = num;
        this.disableActions = true;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_SUBMIT_BREAKDOWN_TICKET,
            msgSubID: MsgSubID.REQUEST,
            payload: {
                numOfBreakdownTickets: this.numOfBreakdownTickets,
            },
        });
    }

    printBreakdownTicket() {
        // if (this.numOfBreakdownTickets > 0) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_PROCESS_BREAKDOWN_TICKET,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
        // }
    }

    handleBackToPreviousPage(msgID: number) {
        this.previousPage = msgID;
        this.numOfComplimentaryTickets = 0;
        this.numOfBreakdownTickets = 0;

        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.BREAKDOWN_BACK_BUTTON,
            msgSubID: MsgSubID.REQUEST,
            payload: { destination: msgID },
        });
    }

    resetBreakdownInfo() {
        this.store.dispatch(
            updateBreakDownInfo({
                payload: {
                    msgID: undefined,
                    status: 0,
                    title: '',
                    direction: '',
                    service: 0,
                    firstBusStop: {},
                    lastBusStop: {},
                    busStopList: [],
                },
                msgID: undefined,
            }),
        );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.resetBreakdownInfo();

        clearTimeout(this.timeOutId);
    }
}
