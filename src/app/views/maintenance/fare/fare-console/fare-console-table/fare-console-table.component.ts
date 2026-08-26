import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MqttService } from '@services/mqtt.service';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { fareConsole, updateFareConsole } from '@store/maintenance/maintenance.reducer';
import { IFareConsole, MsgID, MsgSubID, ResponseStatus } from '@models';

import { AppScrollBar } from '@components/app-scrollbar/app-scrollbar.component';
import { CommonPopUp } from '@components/common-pop-up/common-pop-up.component';
import { SoundService } from '@services/sound.service';
import { applyKeyboardInput } from '@utils/keyboard-input.util';

@Component({
    selector: 'maintenance-fare-console-table',
    imports: [CommonModule, TranslateModule, AppScrollBar, CommonPopUp],
    templateUrl: './fare-console-table.component.html',
    styleUrls: ['./fare-console-table.component.scss'],
})
export class FareConsoleTableComponent implements OnDestroy, OnInit {
    urlPrefix: string = '/maintenance/fare/fare-console';
    private readonly destroy$ = new Subject<void>();
    MsgID = MsgID;
    ResponseStatus = ResponseStatus;

    fareConsole$: Observable<IFareConsole>;
    fareConsoleSetting: IFareConsole = {
        deckType: {
            id: 0,
            label: '',
        },
        blsStatus: 0,
        busId: '',
        date: '',
        time: '',
        dateTime: '',
        complimentaryDays: 0,
        message: '',
    };

    settingType: string = '';
    topics;

    selectedDeckTypeId: number = 0;

    blsStep = 1;
    selectedBlsStatus: number = 0;

    hasInputError = false;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        private readonly mqttService: MqttService,
        private readonly store: Store<AppState>,
    ) {
        this.fareConsole$ = this.store.select(fareConsole);
    }

    ngOnInit() {
        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                this.topics = this.mqttService.mqttConfig?.topics;
            }
        });

        this.fareConsole$.pipe(takeUntil(this.destroy$)).subscribe((data: IFareConsole) => {
            this.fareConsoleSetting = data;
            this.selectedDeckTypeId = data?.deckType?.id || 0;
            this.handleDeleteParameterByNotify();
        });
    }

    handleChangeSetting(setting: string) {
        this.settingType = setting;
        if (setting === 'deckType') {
            this.selectChangeDeckType();
        }
    }

    // DECK TYPE HANDLE
    selectChangeDeckType() {
        if (!this.fareConsoleSetting?.deckTypeList?.length) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.maintenance?.get,
                msgID: MsgID.DECK_TYPE_LIST,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        }
    }

    handleChangeDeckType(id: number) {
        this.selectedDeckTypeId = id;
    }

    handleConfirmDeckType(isConfirm: boolean) {
        if (isConfirm) {
            const nextSetting = { ...this.fareConsoleSetting };
            const nextDeckType = this.fareConsoleSetting.deckTypeList?.find(
                (deck) => deck.id === this.selectedDeckTypeId,
            );
            if (nextDeckType) {
                nextSetting.deckType = nextDeckType;
            }

            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.DECK_TYPE_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    deckType: this.selectedDeckTypeId,
                },
            });
            this.store.dispatch(
                updateFareConsole({
                    payload: nextSetting,
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
        } else {
            this.selectedDeckTypeId = this.fareConsoleSetting.deckType?.id || 0;
        }
        this.settingType = '';
    }

    // BLS STATUS HANDLE
    handleChangeBlsStatus(status: number) {
        this.selectedBlsStatus = status;
        this.blsStep = 2;
    }

    handleConfirmBlsStatus(isConfirm: boolean) {
        if (isConfirm) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.mainTab?.get,
                msgID: MsgID.BLS_STATUS_SUBMIT,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    blsStatus: this.selectedBlsStatus === 1,
                },
            });
            this.store.dispatch(
                updateFareConsole({
                    payload: { ...this.fareConsoleSetting, blsStatus: this.selectedBlsStatus },
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
            this.settingType = '';
        }
        this.blsStep = 1;
    }

    // TIME AND DATE HANDLE
    handleClickBack() {
        this.settingType = '';

        if (this.fareConsoleSetting?.msgID === MsgID.MAINTENANCE_DELETE_PARAMETER_NOTIFY) {
            this.store.dispatch(
                updateFareConsole({
                    payload: { ...this.fareConsoleSetting },
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
        }
    }

    handleChangeInput(event: Event, type: string): void {
        const inputField = <HTMLInputElement>document.getElementById('inputField');
        const target = <HTMLDivElement>event.target;
        const value = applyKeyboardInput(inputField, target);

        if (target.id === 'enterKey') {
            if (!value) return;
            if (type === 'time') {
                this.handleConfirmTime(value);
            } else if (type === 'date') {
                this.handleConfirmDate(value);
            } else {
                this.handleConfirmComplimentaryDays(value);
            }
        }

        inputField.focus();
    }

    private handleConfirmTime(value: string) {
        if (Number.isNaN(Number(value)) || value.length !== 6) {
            this.hasInputError = true;
            return;
        }

        const timeArray = value.match(/.{1,2}/g);
        const hhValue = Number(timeArray?.[0] || 0);
        const mmValue = Number(timeArray?.[1] || 0);
        const ssValue = Number(timeArray?.[2] || 0);
        if (hhValue > 24 || mmValue > 59 || ssValue > 59) {
            this.hasInputError = true;
            return;
        }

        if (hhValue === 24 && (mmValue > 0 || ssValue > 0)) {
            this.hasInputError = true;
            return;
        }
        this.hasInputError = false;

        this.submitTime(`${hhValue}:${mmValue}:${ssValue}`);
    }

    /**
     * Publishes a single-field update, merges it into the fareConsole store
     * slice, and closes the current setting panel. Shared by the time, date,
     * and complimentary-days "submit" handlers below, which differ only in
     * which IFareConsole field they write.
     */
    private submitFareConsoleField<K extends keyof IFareConsole>(msgID: number, field: K, value: IFareConsole[K]) {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID,
            msgSubID: MsgSubID.NOTIFY,
            payload: { [field]: value },
        });
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, [field]: value },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );
        this.settingType = '';
    }

    private submitTime(time: string) {
        this.submitFareConsoleField(MsgID.TIME_SUBMIT, 'time', time);
    }

    private handleConfirmDate(value: string) {
        if (Number.isNaN(Number(value)) || value.length !== 8) {
            this.hasInputError = true;
            return;
        }

        const dateArray = value.match(/.{1,2}/g);
        const ddValue = Number(dateArray?.[0] || 0);
        const mmValue = Number(dateArray?.[1] || 0);
        const yyyyValue = Number((dateArray?.[2] || '') + (dateArray?.[3] || ''));
        // const newDate = new Date(`${yyyyValue}/${mmValue}/${ddValue}`);

        const date = new Date(yyyyValue, mmValue - 1, ddValue);
        // console.log(
        //     date,
        //     date.getFullYear() == yyyyValue && date.getMonth() + 1 == mmValue && date.getDate() == ddValue,
        // );
        const validDate =
            date.getFullYear() == yyyyValue && date.getMonth() + 1 == mmValue && date.getDate() == ddValue;
        if (!validDate) {
            this.hasInputError = true;
            return;
        }

        this.hasInputError = false;
        this.submitDate(`${ddValue.toString().padStart(2, '0')}/${mmValue.toString().padStart(2, '0')}/${yyyyValue}`);
    }

    private submitDate(date: string) {
        this.submitFareConsoleField(MsgID.DATE_SUBMIT, 'date', date);
    }

    private handleConfirmComplimentaryDays(value: string) {
        if (Number.isNaN(Number(value))) {
            this.hasInputError = true;
            return;
        }

        this.hasInputError = false;
        this.submitComplimentaryDays(Number(value));
    }

    // COMPLIMENTARY DAYS HANDLE
    private submitComplimentaryDays(days: number) {
        this.submitFareConsoleField(MsgID.COMPLIMENTARY_DAYS_SUBMIT, 'complimentaryDays', days);
    }

    // DELETE PARAMETERS HANDLE
    handleDeleteParameter() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.DELETE_PARAMETER,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
    }

    handleClearDeleteParameter() {
        this.store.dispatch(
            updateFareConsole({
                payload: { ...this.fareConsoleSetting, message: '', percentage: 0, status: undefined },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );
        this.settingType = '';
    }

    handleDeleteParameterByNotify() {
        // console.log('this.fareConsoleSetting?.msgID', this.fareConsoleSetting?.msgID, MsgID.DELETE_PARAMETER);
        if (this.fareConsoleSetting?.msgID === MsgID.DELETE_PARAMETER) {
            this.handleNavigate('/delete-parameter');
        }
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

    handleConfirmFareConsole(): void {
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
                payload: {
                    ...this.fareConsoleSetting,
                    isSubmitted: true,
                    isDaftMode: false,
                },
                msgID: MsgID.FARE_CONSOLE,
            }),
        );
    }

    handleNavigate(url: string): void {
        if (this.fareConsoleSetting.isSubmitted) {
            this.mqttService.publishWithMessageFormat({
                topic: this.topics?.maintenance?.get,
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });

            if (!url.includes('delete-parameter')) {
                // request when edit
                this.store.dispatch(
                    updateFareConsole({
                        payload: {
                            ...this.fareConsoleSetting,
                            isSubmitted: false,
                        },
                        msgID: MsgID.FARE_CONSOLE,
                    }),
                );
            }
        }
        this.router.navigate([this.urlPrefix + url]);

        //display confirm popup when data is not submitted
        if (url.includes('delete-parameter') && !this.fareConsoleSetting.isSubmitted) {
            // request when edit
            this.store.dispatch(
                updateFareConsole({
                    payload: {
                        ...this.fareConsoleSetting,
                        isDaftMode: this.validateFareConsoleForm(),
                    },
                    msgID: MsgID.FARE_CONSOLE,
                }),
            );
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        // this.store.dispatch(
        //     updateFareConsole({
        //         payload: {
        //             ...this.fareConsoleSetting,
        //             isDaftMode: (!this.fareConsoleSetting.isSubmitted && this.validateFareConsoleForm()) ?? false,
        //         },
        //         msgID: MsgID.FARE_CONSOLE,
        //     }),
        // );
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
