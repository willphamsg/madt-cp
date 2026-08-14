import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { AppState } from '@store/app.state';
import { Store } from '@ngrx/store';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    IOutOfService,
    MsgID,
    MsgSubID,
    LocalStorageKey,
    TopicsKeys,
    ResponseStatus,
    IDagwOperation,
    DEFAULT_TIMEOUT,
} from '@models';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { language, outOfService, dagwOperation, updateDagwOperation } from '@store/main/main.reducer';
import { DagwOperationComponent } from '@components/dagw-operation/dagw-operation.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, MatButton, DagwOperationComponent, TranslateModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    ResponseStatus = ResponseStatus;
    currentLanguage: string = '';
    showKeyboard: boolean = false;
    isDAGWProcAborting: boolean = false;
    isDAGWProcAbortCompleted: boolean = false;
    outOfService$: Observable<IOutOfService> = this.store.select(outOfService);
    outOfServiceData: IOutOfService = {};

    dagwOperation$: Observable<IDagwOperation> = this.store.select(dagwOperation);
    dagwOperationData: IDagwOperation = { msgID: 0, title: '', message: '' };

    private mqttSubscriptions: Array<{
        topic: string;
        topicKey: string;
    }> = []; // Track MQTT topics for cleanup
    commissionError: string | null = null;

    private language$: Observable<string> = this.store.select(language);

    topics;
    timeOutId;

    constructor(
        private soundService: SoundService,
        private translate: TranslateService,
        protected store: Store<AppState>,
        private mqttService: MqttService,
        private localStorageService: LocalStorageService,
    ) {
        // this.currentLanguage = this.translate.currentLang?.toUpperCase() || 'EN';
    }

    ngOnInit() {
        this.outOfService$?.pipe(takeUntil(this.destroy$)).subscribe((outOfSer: IOutOfService) => {
            this.outOfServiceData = outOfSer;
            if (this.isDAGWProcAborting) {
                this.isDAGWProcAbortCompleted = true;
                this.isDAGWProcAborting = false;
                //Clear the DAGW pop up details after abort is completed
                this.clearDAGWPopUpData();
            }
        });

        this.localStorageService
            .watch(LocalStorageKey.LANGUAGE)
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
                if (val && val !== 'undefined') {
                    const language: string = JSON.parse(val);
                    this.currentLanguage = language?.toUpperCase();
                } else {
                    this.currentLanguage = 'EN';
                }
            });

        this.dagwOperation$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.dagwOperationData = data;
            this.isDAGWProcAbortCompleted = false;
            if (this.dagwOperationData?.message === 'ABORTING_DAGW_CONNECTION') {
                this.isDAGWProcAborting = true;
            }

            clearTimeout(this.timeOutId);
            if (data?.timeout !== 0) {
                this.timeOutId = setTimeout(() => {
                    this.clearDAGWPopUpData();
                    clearTimeout(this.timeOutId);
                }, data?.timeout || DEFAULT_TIMEOUT);
            }
        });

        this.mqttService.mqttConfigLoaded$.pipe(takeUntil(this.destroy$)).subscribe((configLoaded) => {
            if (configLoaded) {
                const topics = this.mqttService.mqttConfig?.topics;
                this.topics = topics;
            }
        });
    }

    handleChangeLanguage(lang: string) {
        // this.currentLanguage = lang;
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.LANGUAGE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language: lang },
        });
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.tcToAllTabs,
            msgID: MsgID.LANGUAGE_SETTING,
            msgSubID: MsgSubID.NOTIFY,
            payload: { language: lang },
            opts: { retain: false },
        });
        this.localStorageService.setItem(LocalStorageKey.LANGUAGE, JSON.stringify(lang));
    }

    handleCancelDagwOperation() {
        this.mqttService.publishWithMessageFormat({
            topic: this.topics?.mainTab?.get,
            msgID: MsgID.NEW_DAGW_OPERATION_CANCEL,
            msgSubID: MsgSubID.REQUEST,
            payload: {},
        });
        // piyumig : to stop the cloe pop up
        // this.store.dispatch(updateDagwOperation({ payload: { msgID: 0, title: '', message: '' } }));
    }

    clearDAGWPopUpData() {
        this.store.dispatch(updateDagwOperation({ payload: { msgID: 0, title: '', message: '' } }));
    }

    // handleSubmit(value) {
    //     this.commissionError = null;
    //     if (!value.length) {
    //         this.commissionError = 'INVALID_ENTRY';
    //         return;
    //     }

    //     this.mqttService?.publishWithMessageFormat({
    //         topic: this.topics.mainTab?.get,
    //         msgID: MsgID?.DECOMMISSION,
    //         msgSubID: MsgSubID?.REQUEST,
    //         payload: { value },
    //     });
    // }
    // handleChangeInput(event: Event): void {
    //     const inputField = <HTMLInputElement>document.getElementById('inputField');
    //     const start = inputField?.selectionStart || 0;
    //     const end = inputField?.selectionEnd || 0;
    //     const value = inputField.value;
    //     const target = <HTMLDivElement>event.target;
    //     if (target.id === 'backspaceKey') {
    //         if (start === end) {
    //             // No selection, just delete the character before the cursor
    //             inputField.value = value.slice(0, start - 1) + value.slice(end);
    //             inputField.selectionStart = inputField.selectionEnd = start - 1;
    //         } else {
    //             // There is a selection, delete the selected text
    //             inputField.value = value.slice(0, start) + value.slice(end);
    //             inputField.selectionStart = inputField.selectionEnd = start;
    //         }
    //     } else if (target.id === 'enterKey') {
    //         this.handleSubmit(value);
    //     } else {
    //         const keyValue = target.innerText.trim();
    //         inputField.value = value.slice(0, start) + keyValue + value.slice(end);
    //         inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
    //     }
    //     inputField.focus();
    // }

    // showKeyboardHandler() {
    //     this.showKeyboard = !this.showKeyboard;
    //     const inputField = <HTMLInputElement>document.getElementById('inputField');
    //     inputField.value = '';
    //     this.commissionError = null;
    //     if (this.showKeyboard) {
    //         inputField.focus();
    //     }

    //     if (this.showKeyboard && this.mqttSubscriptions?.length === 0) {
    //         this.mqttService.subscribe({
    //             topic: this.topics.mainTab?.response,
    //             topicKey: TopicsKeys?.COMMISSIONING_DIGIT_KEY_IN,
    //             callback: (message) => {
    //                 const { header, payload } = JSON.parse(message);
    //                 if (header?.msgID === MsgID?.DECOMMISSION && header?.msgSubID === MsgSubID?.RESPONSE) {
    //                     if (payload.status === ResponseStatus.ERROR) {
    //                         this.commissionError = 'INVALID_ENTRY';
    //                     } else if (payload.status === ResponseStatus.SUCCESS) {
    //                         this.showKeyboard = false;
    //                     }
    //                 }
    //             },
    //         });
    //         this.mqttSubscriptions.push({
    //             topic: this.topics.mainTab?.response,
    //             topicKey: TopicsKeys?.COMMISSIONING_DIGIT_KEY_IN,
    //         });
    //     }
    // }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.mqttSubscriptions?.length > 0) {
            this.mqttSubscriptions.forEach((topic) => {
                this.mqttService.unsubscribe(topic?.topic, topic?.topicKey);
            });
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
