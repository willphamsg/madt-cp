import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { routerUrls } from '@app/app.routes';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { IStartTrip, MsgID, MsgSubID, IServiceData, IBusStop, StartTripTypes, ResponseStatus } from '@models';

import { Subject, takeUntil, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { startTrip, updateStartTrip } from '@store/main/main.reducer';

@Component({
    selector: 'start-trip',
    imports: [CommonModule, MatIconModule, RouterModule, AppScrollBar, CustomKeyboardComponent, TranslateModule],
    templateUrl: './start-trip.component.html',
    styleUrls: ['./start-trip.component.scss'],
})
export class StartTripComponent implements OnInit, OnDestroy {
    ResponseStatus = ResponseStatus;
    private destroy$ = new Subject<void>();
    step: number = 0;

    topics;
    manualServiceIdError: boolean = false;
    currentValueChange: string = '';

    selectedService: IServiceData = {};
    selectedBusStop: string | undefined = undefined;

    services: IServiceData[] = [];
    busStops: IBusStop[] = [];
    private mqttSubscriptions: Array<{
        topic: string;
        topicKey: string;
    }> = []; // Track MQTT topics for cleanup

    tripDetails: {
        service: IServiceData;
        busStop?: IBusStop;
    } = {
        service: {},
        busStop: {
            Busid: '',
            Name: '',
        },
    };
    tripTypeDetails = StartTripTypes;

    private startTrip$: Observable<IStartTrip> = this.store.select(startTrip);
    startTripData: IStartTrip = {
        type: this.tripTypeDetails.FMS_NO_INFO,
    };

    isShowKeyboard: boolean = false;
    inputValue: string = '';

    constructor(
        private router: Router,
        private mqttService: MqttService,
        private activeRoute: ActivatedRoute,
        protected store: Store<AppState>,
        private soundService: SoundService,
        @Inject(DOCUMENT) private _document: Document,
    ) {}

    ngOnInit() {
        this._handleOnDocumentClick();

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.startTrip$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            //only reset when type exists and changes to another type
            if (this.startTripData.type !== data.type && !!this.startTripData.type) {
                this.step = 0;
                this.selectedService = {};
                this.selectedBusStop = undefined;
            }
            this.startTripData = { ...data };
            // console.log('startTripData', this.startTripData);

            this.services = data.services || [];
            this.busStops = data.busStopList || [];

            if (data?.type === this.tripTypeDetails.FMS_VALID_INFO || data?.type === this.tripTypeDetails.FMS_NO_INFO) {
                if (!this.step) {
                    this.step = 1;
                }
            }

            if (data.status === ResponseStatus?.SUCCESS && data.msgID === MsgID.START_TRIP_SUBMIT_SERVICE) {
                this.store.dispatch(
                    updateStartTrip({
                        payload: {
                            ...this.startTripData,
                            fare: {
                                ...this.startTripData.fare,
                                serviceNumber: Number(this.inputValue),
                                dir: data?.dir,
                                variantName: data?.variantName,
                            },
                        },
                    }),
                );

                this.inputValue = '';
                this.step = 1;
                this.manualServiceIdError = false;
                this.currentValueChange = '';
            }

            if (this.services.length) {
                this.selectedService =
                    this.services?.find(
                        (_ser) =>
                            _ser.serviceNumber === this.startTripData?.fare?.serviceNumber &&
                            _ser.variantName === this.startTripData?.fare?.variantName,
                    ) || {};
            }

            this.handleRetainMessages();
        });
    }

    private handleRetainMessages() {
        if (!this.step) {
            if (this.startTripData?.msgID === MsgID.START_TRIP_GET_FARE_TRIP_DETAILS) {
                this.store.dispatch(
                    updateStartTrip({
                        payload: {
                            ...this.startTripData,
                            type: StartTripTypes.FMS_BUS_STOP_MISMATCH,
                        },
                        msgID: this.startTripData?.msgID,
                    }),
                );
                this.step = 1;
            }

            if (
                this.startTripData?.msgID === MsgID.START_TRIP_GET_SERVICE_LIST ||
                this.startTripData?.msgID === MsgID.START_TRIP_SUBMIT_SERVICE ||
                this.startTripData?.msgID === MsgID.START_TRIP_BUS_STOP_LIST
            ) {
                this.store.dispatch(
                    updateStartTrip({
                        payload: {
                            ...this.startTripData,
                            type: StartTripTypes.FMS_NO_INFO,
                        },
                        msgID: this.startTripData?.msgID,
                    }),
                );
                this.step = 2;
                this.currentValueChange =
                    this.startTripData?.msgID === MsgID.START_TRIP_BUS_STOP_LIST ? 'busStop' : 'service';
            }
        }
    }

    fetchBusStopList(): void {
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_BUS_STOP_LIST,
            msgSubID: MsgSubID?.REQUEST,
            payload: {
                serviceNumber: this.startTripData?.fare?.serviceNumber,
                variantName: this.startTripData?.fare?.variantName,
            },
        });
    }

    fetchServiceList(): void {
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_GET_SERVICE_LIST,
            msgSubID: MsgSubID?.REQUEST,
            payload: {},
        });
    }

    navigateToStep(step: number) {
        this.step = step;
        this.manualServiceIdError = false;
        this.inputValue = '';
        this.store.dispatch(
            updateStartTrip({
                payload: {
                    status: undefined,
                    dir: undefined,
                    variantName: undefined,
                },
            }),
        );
    }

    backToBusOperation() {
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_CANCEL_FLOW,
            msgSubID: MsgSubID?.NOTIFY,
            payload: {},
        });
        this.router.navigate([routerUrls?.private?.main?.busOperation?.url]);
    }

    backToStartTripIssue() {
        this.router.navigate([routerUrls?.private?.main?.busOperation?.startTripInvalidInfo]);
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_CANCEL_FLOW,
            msgSubID: MsgSubID?.NOTIFY,
            payload: {},
        });
    }

    backToPreviousScreen() {
        this.step = 1;
    }

    handleChange(type: string) {
        this.currentValueChange = type;
        if (type === 'busStop') {
            if (!this.startTripData?.fare?.serviceNumber) return;
            this.step = 2;
            this.fetchBusStopList();
        } else {
            this.step = 2;
            this.fetchServiceList();
        }
    }

    handleSelectBusStop(busStopId: string) {
        this.selectedBusStop = busStopId;
    }

    handleUpdateBusStop() {
        const serviceIndex = this.services.findIndex(
            (item) =>
                item.serviceNumber === this.selectedService?.serviceNumber &&
                item.variantName === this.selectedService?.variantName,
        );
        this.store.dispatch(
            updateStartTrip({
                payload: {
                    ...this.startTripData,
                    fare: {
                        busStop: this.busStops?.filter((item) => item.Busid === this.selectedBusStop)[0],
                        serviceNumber: this.selectedService?.serviceNumber || this.startTripData?.fare?.serviceNumber,
                        dir: this.selectedService?.dir || this.startTripData?.fare?.dir,
                        variantName: this.selectedService?.variantName || this.startTripData?.fare?.variantName,
                        serviceIndex,
                    },
                },
            }),
        );

        this.step = 1;
    }

    handleSelectService(service: IServiceData) {
        this.selectedService = service;
    }

    handleUpdateService() {
        if (!this.selectedService) return;
        if (
            this.selectedService?.serviceNumber !== this.startTripData.fare?.serviceNumber ||
            this.selectedService?.variantName !== this.startTripData.fare?.variantName
        ) {
            this.selectedBusStop = undefined;
            const serviceIndex = this.services.findIndex(
                (item) =>
                    item.serviceNumber === this.selectedService?.serviceNumber &&
                    item.variantName === this.selectedService?.variantName,
            );
            this.store.dispatch(
                updateStartTrip({
                    payload: {
                        ...this.startTripData,
                        busStopList: [],
                        fare: {
                            busStop: undefined,
                            serviceNumber: this.selectedService?.serviceNumber,
                            dir: this.selectedService?.dir,
                            variantName: this.selectedService?.variantName,
                            serviceIndex,
                        },
                    },
                }),
            );
        }
        this.navigateToStep(1);
    }

    handleConfirmService(isConfirm: boolean) {
        console.log('isConfirm', isConfirm);
    }

    handleChangeBusStop(busStopId: string) {
        this.selectedBusStop = busStopId;
    }

    handleConfirmBusStop(isConfirm: boolean) {
        console.log('isConfirm', isConfirm);
    }

    handleDisplayManuallyInputPopUp() {
        this.step = 3;
    }

    handleChangeInput(event: Event): void {
        const inputField = <HTMLInputElement>document.getElementById('inputField');
        const start = inputField?.selectionStart || 0;
        const end = inputField?.selectionEnd || 0;
        const value = inputField.value;
        const target = <HTMLDivElement>event.target;

        if (target.id === 'backspaceKey') {
            if (start === end) {
                // No selection, just delete the character before the cursor
                inputField.value = value.slice(0, start - 1) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start - 1;
                // this.manualServiceIdError = false;
            } else {
                // There is a selection, delete the selected text
                inputField.value = value.slice(0, start) + value.slice(end);
                inputField.selectionStart = inputField.selectionEnd = start;
                // this.manualServiceIdError = false;
            }
        } else if (target.id === 'enterKey') {
            this.inputValue = value;
            this.handleSearchService(value);
            // this.handleConfirmManuallyInput(value);
        } else {
            const keyValue = target.innerText.trim();
            inputField.value = value.slice(0, start) + keyValue + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
            // this.manualServiceIdError = false;
        }

        inputField.focus();
    }

    handleCloseManuallyInput() {}

    handleSearchService(value: string) {
        this.isShowKeyboard = false;
        this.selectedService = {};

        if (!value) {
            return;
        } else {
            this.getDisplayServices();
        }
    }

    getDisplayServices() {
        return this.services.filter((item: IServiceData) => item.serviceNumber?.toString().startsWith(this.inputValue));
    }

    handleSettingFareDetails() {
        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_GET_FARE_TRIP_DETAILS,
            msgSubID: MsgSubID?.REQUEST,
            payload: {},
        });
        this.navigateToStep(1);
    }

    handleCancelSettingFareDetails(): void {
        this.step = 0;
        this.store.dispatch(
            updateStartTrip({
                payload: {
                    ...this.startTripData,
                    fare: {},
                },
            }),
        );
        this.selectedBusStop = undefined;
        this.selectedService = {};
    }

    handleConfirmStartTrip(type?: string) {
        // this.backToMain();
        // console.log('submit', this.tripDetails);
        const payload = {};
        payload['type'] = this.startTripData?.type;
        if (
            this.startTripData.type &&
            [
                this.tripTypeDetails.FMS_VALID_INFO,
                // this.tripTypeDetails.FMS_TRIP_INFO_MISMATCH,
                // this.tripTypeDetails.FMS_BUS_STOP_MISMATCH,
            ].includes(this.startTripData.type)
        ) {
            payload['serviceNumber'] = this.startTripData?.fms?.serviceNumber;
            payload['dir'] = this.startTripData?.fms?.dir;
            payload['busStopId'] = this.startTripData?.fms?.busStop?.['Busid'];
        }

        if (
            this.startTripData.type &&
            [
                this.tripTypeDetails.FMS_TRIP_INFO_MISMATCH,
                this.tripTypeDetails.FMS_BUS_STOP_MISMATCH,
                this.tripTypeDetails.FMS_NO_INFO,
            ].includes(this.startTripData.type)
        ) {
            payload['serviceNumber'] = this.startTripData?.fare?.serviceNumber;
            payload['dir'] = this.startTripData?.fare?.dir;
            payload['busStopId'] = this.startTripData?.fare?.busStop?.['Busid'];
            payload['serviceIndex'] = this.startTripData?.fare?.serviceIndex;
        }

        this.mqttService?.publishWithMessageFormat({
            topic: this.topics.mainTab?.get,
            msgID: MsgID?.START_TRIP_SUBMIT_FARE_TRIP,
            msgSubID: MsgSubID?.REQUEST,
            payload,
        });
    }

    private _handleOnDocumentClick(): void {
        this._document.addEventListener('click', (event: Event) => {
            const target = event.target || event.srcElement || event.currentTarget;
            const idAttr = target?.['id'];
            const parentNode = target?.['parentNode']?.['className'];
            // console.log('event', event);
            // console.log('parentNode', parentNode);
            // console.log('numeric-keyboard', parentNode?.includes('numeric-keyboard'));
            // // console.log('event.target()', idAttr);
            // // console.log('event.composedPath()', event.composedPath());
            const isClickKeyboard = parentNode?.includes('numeric-keyboard');
            if (!isClickKeyboard && this.isShowKeyboard) {
                this.isShowKeyboard = false;
            }

            if (idAttr === 'inputField' && !this.isShowKeyboard) {
                this.isShowKeyboard = true;
            }
        });
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        this._document.removeEventListener('click', this._handleOnDocumentClick, false);
        // Trigger unsubscription from all observables
        this.destroy$.next();
        this.destroy$.complete();
        this.mqttSubscriptions.forEach((topic) => {
            this.mqttService.unsubscribe(topic?.topic, topic?.topicKey);
        });

        this.store.dispatch(
            updateStartTrip({
                payload: {
                    fare: {},
                    fms: {},
                    type: undefined,
                    busStopList: [],
                    services: [],
                    dir: undefined,
                    variantName: undefined,
                    message: undefined,
                    status: undefined,
                },
                msgID: undefined,
            }),
        );
    }
}
