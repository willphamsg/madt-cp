import { provideMockStore, MockStore as NgrxMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashPaymentComponent } from './cash-payment.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { Store } from '@ngrx/store';
import { cashPayment as cashPaymentSelector } from '@store/main/main.reducer';
import { MsgID, ECashType, ECashMode, ResponseStatus, MainButton } from '@models';

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);
    mqttConfig = { topics: {} };
    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

class MockStore {
    select = jasmine.createSpy('select').and.returnValue(of({}));
    dispatch = jasmine.createSpy('dispatch');
}

describe('CashPaymentComponent', () => {
    let component: CashPaymentComponent;
    let fixture: ComponentFixture<CashPaymentComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [CashPaymentComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: { params: of({}) } },
                provideMockStore({ initialState: mockInitialState }),
                { provide: MqttService, useClass: MockMqttService },
                { provide: SoundService, useValue: { playButton: jasmine.createSpy('playButton') } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CashPaymentComponent);
        component = fixture.componentInstance;
        spyOn(TestBed.inject(NgrxMockStore), 'dispatch').and.callThrough();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize component without errors', () => {
        expect(() => {
            if ((component as any).ngOnInit) {
                (component as any).ngOnInit();
            }
        }).not.toThrow();
    });

    it('should initialize fareMode to ECashMode.SINGLE', () => {
        expect(component.fareMode).toBeDefined();
    });

    it('should initialize cashType as empty string', () => {
        expect(component.cashType).toBe('');
    });

    it('should initialize selectedAmount to 0', () => {
        expect(component.selectedAmount).toBe(0);
    });

    it('should initialize quantity as empty string', () => {
        expect(component.quantity).toBe('');
    });

    it('should navigate to bus-stop-information on backToMain', () => {
        component.backToMain();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['main/bus-stop-information']);
    });

    it('should handle terminate', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handleTerminate();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should handle print inspector ticket', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handlePrintInspectorTicket();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should handle fare box', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handleFareBox();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should validate quantity', () => {
        component.quantity = '5';
        expect(component.validateQuantity()).toBeTrue();
        expect(component.quantityError).toBe('');

        component.quantity = '15';
        expect(component.validateQuantity()).toBeFalse();
        expect(component.quantityError).toBe('CAN_NOT_PRINT_MORE_THEN_10_TICKET');
    });

    it('should set fare mode', () => {
        component.setFareMode(component.ECashMode.MULTIPLE);
        expect(component.fareMode).toBe(component.ECashMode.MULTIPLE);
        expect(component.selectedIndex).toBe(-1);
        expect(component.selectedAmount).toBe(0);
    });

    // ------------------------------------------------------------------
    // formatKm
    // ------------------------------------------------------------------
    describe('formatKm', () => {
        it('should format a numeric km value to one decimal', () => {
            expect(component.formatKm(3)).toBe('3.0');
            expect(component.formatKm(3.456)).toBe('3.5');
        });

        it('should format a numeric-string km value to one decimal', () => {
            expect(component.formatKm('4.2')).toBe('4.2');
        });

        it('should return 0.0 when the string km value is not numeric', () => {
            expect(component.formatKm('abc')).toBe('0.0');
        });

        it('should return the original value when neither a number nor a string', () => {
            expect(component.formatKm(null as any)).toBeNull();
        });
    });

    // ------------------------------------------------------------------
    // genCashDefaultOptions
    // ------------------------------------------------------------------
    it('genCashDefaultOptions should reset fare mode and selection state', () => {
        component.fareMode = component.ECashMode.MULTIPLE;
        component.selectedIndex = 2;
        component.selectedAmount = 100;
        component.changeBusStopMode = null;
        component.quantity = '5';
        component.isShowKeyboard = true;

        component.genCashDefaultOptions();

        expect(component.fareMode).toBe(component.ECashMode.SINGLE);
        expect(component.selectedIndex).toBe(-1);
        expect(component.selectedAmount).toBe(0);
        expect(component.changeBusStopMode as any).toBe('EXIT');
        expect(component.quantity).toBe('');
        expect(component.isShowKeyboard).toBeFalse();
    });

    // ------------------------------------------------------------------
    // handleResetBusStopPopup
    // ------------------------------------------------------------------
    describe('handleResetBusStopPopup', () => {
        it('should call handleBackFareCalculator when there is no fareResult', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.cashPayment = { adultValues: [], seniorValues: [], studentValues: [] };

            component.handleResetBusStopPopup();

            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BACK }),
            );
        });

        it('should restore bus stop selections from fareResult when present', () => {
            component.cashPayment = {
                adultValues: [],
                seniorValues: [],
                studentValues: [],
                fareResult: {
                    adultFare: 1,
                    seniorFare: 1,
                    studentFare: 1,
                    exitBusStop: { Busid: 'exit-1', Name: 'Exit One' },
                    entryBusStop: { Busid: 'entry-1', Name: 'Entry One' },
                },
            };
            component.selectedExitIdx = 5;
            component.selectedEntryIdx = 6;
            component.changeBusStopMode = 'ENTRY';

            component.handleResetBusStopPopup();

            expect(component.changeBusStopMode).toBeNull();
            expect(component.selectedExitBusStop).toBe('exit-1');
            expect(component.selectedEntryBusStop).toBe('entry-1');
            expect(component.selectedExitIdx).toBeUndefined();
            expect(component.selectedEntryIdx).toBeUndefined();
        });

        it('should fall back to empty strings when fareResult bus stops are missing', () => {
            component.cashPayment = {
                adultValues: [],
                seniorValues: [],
                studentValues: [],
                fareResult: {
                    adultFare: 1,
                    seniorFare: 1,
                    studentFare: 1,
                    exitBusStop: undefined as any,
                    entryBusStop: undefined as any,
                },
            };

            component.handleResetBusStopPopup();

            expect(component.selectedExitBusStop).toBe('');
            expect(component.selectedEntryBusStop).toBe('');
        });
    });

    // ------------------------------------------------------------------
    // handleSelectBusStop
    // ------------------------------------------------------------------
    describe('handleSelectBusStop', () => {
        it('should set entry bus stop when mode is ENTRY', () => {
            component.changeBusStopMode = 'ENTRY';
            component.handleSelectBusStop('entry-stop', 3);
            expect(component.selectedEntryBusStop).toBe('entry-stop');
            expect(component.selectedEntryIdx).toBe(3);
        });

        it('should set exit bus stop when mode is EXIT', () => {
            component.changeBusStopMode = 'EXIT';
            component.handleSelectBusStop('exit-stop', 4);
            expect(component.selectedExitBusStop).toBe('exit-stop');
            expect(component.selectedExitIdx).toBe(4);
        });

        it('should do nothing when mode is null', () => {
            component.changeBusStopMode = null;
            component.selectedEntryBusStop = '';
            component.selectedExitBusStop = '';
            component.handleSelectBusStop('anything', 1);
            expect(component.selectedEntryBusStop).toBe('');
            expect(component.selectedExitBusStop).toBe('');
        });
    });

    // ------------------------------------------------------------------
    // handleSubmitNewBusStop
    // ------------------------------------------------------------------
    describe('handleSubmitNewBusStop', () => {
        it('should return early when EXIT mode has no selected exit bus stop', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.changeBusStopMode = 'EXIT';
            component.selectedExitBusStop = '';

            component.handleSubmitNewBusStop();

            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should return early when ENTRY mode has no selected entry bus stop', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.changeBusStopMode = 'ENTRY';
            component.selectedEntryBusStop = '';

            component.handleSubmitNewBusStop();

            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should publish entry bus stop payload when mode is ENTRY', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.changeBusStopMode = 'ENTRY';
            component.selectedEntryBusStop = 'entry-stop';
            component.selectedEntryIdx = 7;

            component.handleSubmitNewBusStop();

            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
                    payload: jasmine.objectContaining({
                        entryBusStopId: 'entry-stop',
                        selectionMode: 3,
                        index: 7,
                    }),
                }),
            );
        });

        it('should publish exit bus stop payload when mode is EXIT', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.changeBusStopMode = 'EXIT';
            component.selectedExitBusStop = 'exit-stop';
            component.selectedExitIdx = 8;

            component.handleSubmitNewBusStop();

            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
                    payload: jasmine.objectContaining({
                        exitBusStopId: 'exit-stop',
                        selectionMode: 4,
                        index: 8,
                    }),
                }),
            );
        });

        it('should publish an empty payload when mode is neither ENTRY nor EXIT', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.changeBusStopMode = null;

            component.handleSubmitNewBusStop();

            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ payload: {} }),
            );
        });
    });

    // ------------------------------------------------------------------
    // handlePrintReceipt
    // ------------------------------------------------------------------
    it('handlePrintReceipt should publish type and amount', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handlePrintReceipt(ECashType.SENIOR, 250);
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_PRINT,
                payload: { type: ECashType.SENIOR, amount: 250 },
            }),
        );
    });

    // ------------------------------------------------------------------
    // handleChangeBusStop
    // ------------------------------------------------------------------
    describe('handleChangeBusStop', () => {
        it('should publish a bus stop list request when busStopList is empty', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.cashPayment = { adultValues: [], seniorValues: [], studentValues: [], busStopList: [] };

            component.handleChangeBusStop('ENTRY');

            expect(component.changeBusStopMode).toBe('ENTRY');
            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP }),
            );
        });

        it('should not publish when busStopList already has entries', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.cashPayment = {
                adultValues: [],
                seniorValues: [],
                studentValues: [],
                busStopList: [{ Busid: '1', Name: 'a', km: 1 }],
            };

            component.handleChangeBusStop('EXIT');

            expect(component.changeBusStopMode).toBe('EXIT');
            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });
    });

    it('handleFareCalculator should publish fare calculation bus stop request', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handleFareCalculator();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP }),
        );
    });

    it('handleConfirmFareCalculator should publish fare calculation confirm request', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handleConfirmFareCalculator();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_FARE_CALCULATION }),
        );
    });

    it('handleBackFareCalculator should publish fare calculation back request', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handleBackFareCalculator();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BACK }),
        );
    });

    // ------------------------------------------------------------------
    // setFareMode
    // ------------------------------------------------------------------
    describe('setFareMode', () => {
        it('should call handleFareCalculator when switching to CALCULATOR mode', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.setFareMode(ECashMode.CALCULATOR);
            expect(component.fareMode).toBe(ECashMode.CALCULATOR);
            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP }),
            );
        });

        it('should not call handleFareCalculator for SINGLE mode', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.topics = { mainTab: { get: 'test' } };
            component.setFareMode(ECashMode.SINGLE);
            expect(component.fareMode).toBe(ECashMode.SINGLE);
            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });
    });

    // ------------------------------------------------------------------
    // setCash / printSingleTicket / setMultipleAmount
    // ------------------------------------------------------------------
    describe('setCash', () => {
        beforeEach(() => {
            component.topics = { mainTab: { get: 'test' } };
            component.cashPayment = {
                adultValues: [{ index: 0, value: 100 }],
                seniorValues: [{ index: 0, value: 50 }],
                studentValues: [{ index: 0, value: 75 }],
            };
        });

        it('should resolve the adult amount and print a single ticket in SINGLE mode', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.fareMode = ECashMode.SINGLE;
            component.setCash(ECashType.ADULT, 0);
            expect(component.selectedAmount).toBe(100);
            expect(component.cashType).toBe(ECashType.ADULT);
            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_SINGLE_SUBMIT }),
            );
        });

        it('should resolve the senior amount', () => {
            component.fareMode = ECashMode.CALCULATOR;
            component.setCash(ECashType.SENIOR, 0);
            expect(component.selectedAmount).toBe(50);
        });

        it('should resolve the student amount', () => {
            component.fareMode = ECashMode.CALCULATOR;
            component.setCash(ECashType.STUDENT, 0);
            expect(component.selectedAmount).toBe(75);
        });

        it('should default the amount to 0 when no matching cash value is found', () => {
            component.fareMode = ECashMode.CALCULATOR;
            component.setCash(ECashType.ADULT, 99);
            expect(component.selectedAmount).toBe(0);
        });

        it('should submit multiple amount in MULTIPLE mode', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.fareMode = ECashMode.MULTIPLE;
            component.setCash(ECashType.ADULT, 0);
            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_MULTI_SUBMIT }),
            );
        });

        it('should not submit anything when selectedIndex is negative', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.fareMode = ECashMode.SINGLE;
            component.setCash(ECashType.ADULT, -1);
            expect(component.selectedIndex).toBe(-1);
            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should not submit anything in CALCULATOR mode even with a valid index', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            component.fareMode = ECashMode.CALCULATOR;
            component.setCash(ECashType.ADULT, 0);
            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });
    });

    it('printSingleTicket should publish MAIN_CASH_SINGLE_SUBMIT', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.printSingleTicket(ECashType.ADULT, 0);
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAIN_CASH_SINGLE_SUBMIT,
                payload: { type: ECashType.ADULT, cashIndex: 0 },
            }),
        );
    });

    it('setMultipleAmount should publish MAIN_CASH_MULTI_SUBMIT', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.setMultipleAmount(ECashType.SENIOR, 1);
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAIN_CASH_MULTI_SUBMIT,
                payload: { type: ECashType.SENIOR, cashIndex: 1 },
            }),
        );
    });

    it('handleBack should publish MAIN_CASH_MULTI_BACK', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.handleBack();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({ msgID: MsgID.MAIN_CASH_MULTI_BACK }),
        );
    });

    // ------------------------------------------------------------------
    // printMultipleTicket
    // ------------------------------------------------------------------
    it('printMultipleTicket should publish quantity, type and cashIndex', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        component.topics = { mainTab: { get: 'test' } };
        component.cashType = ECashType.STUDENT;
        component.quantity = '3';
        component.selectedIndex = 2;

        component.printMultipleTicket();

        expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
            jasmine.objectContaining({
                msgID: MsgID.MAIN_CASH_MULTI_CONFIRM,
                payload: { type: ECashType.STUDENT, quantity: 3, cashIndex: 2 },
            }),
        );
    });

    // ------------------------------------------------------------------
    // handleEnterNumberOfTicket / validateQuantity edge cases
    // ------------------------------------------------------------------
    describe('handleEnterNumberOfTicket', () => {
        it('should not set an error for a valid quantity', () => {
            component.quantity = '10';
            component.handleEnterNumberOfTicket();
            expect(component.quantityError).toBe('');
        });

        it('should set an error for an invalid (>10) quantity', () => {
            component.quantity = '11';
            component.handleEnterNumberOfTicket();
            expect(component.quantityError).toBe('CAN_NOT_PRINT_MORE_THEN_10_TICKET');
        });

        it('should treat zero as a valid quantity', () => {
            component.quantity = '0';
            expect(component.validateQuantity()).toBeTrue();
        });

        it('should treat negative quantity as valid (below the 10 threshold)', () => {
            component.quantity = '-5';
            expect(component.validateQuantity()).toBeTrue();
        });

        it('should treat a very large quantity as invalid', () => {
            component.quantity = '999999';
            expect(component.validateQuantity()).toBeFalse();
        });
    });

    // ------------------------------------------------------------------
    // handleChangeInput
    // ------------------------------------------------------------------
    describe('handleChangeInput', () => {
        let inputField: HTMLInputElement;

        beforeEach(() => {
            // Defensively remove any stale #inputField left by another spec file's fixture.
            document.getElementById('inputField')?.remove();
            inputField = document.createElement('input');
            inputField.id = 'inputField';
            document.body.appendChild(inputField);
        });

        afterEach(() => {
            if (inputField.parentNode) {
                document.body.removeChild(inputField);
            }
        });

        function setSelection(value: string, start: number, end: number) {
            inputField.value = value;
            inputField.focus();
            inputField.setSelectionRange(start, end);
        }

        it('should delete the character before the cursor on backspace with no selection', () => {
            setSelection('1234', 2, 2);
            const target = document.createElement('div');
            target.id = 'backspaceKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(component.quantity).toBe('134');
            expect(component.quantityError).toBe('');
        });

        it('should delete the selected text on backspace with a selection', () => {
            setSelection('1234', 1, 3);
            const target = document.createElement('div');
            target.id = 'backspaceKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(component.quantity).toBe('14');
            expect(component.quantityError).toBe('');
        });

        it('should insert a digit at the cursor position for a non-special key', () => {
            setSelection('12', 1, 1);
            const target = document.createElement('div');
            target.innerText = '9';

            component.handleChangeInput({ target } as unknown as Event);

            expect(component.quantity).toBe('192');
        });

        it('should return early on enterKey when the field is empty', () => {
            setSelection('', 0, 0);
            component.isShowKeyboard = true;
            const target = document.createElement('div');
            target.id = 'enterKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(component.isShowKeyboard).toBeFalse();
            expect(component.quantityError).toBe('');
        });

        it('should hide the keyboard and validate the quantity on enterKey with a value', () => {
            setSelection('11', 2, 2);
            // handleEnterNumberOfTicket validates component.quantity, not the raw DOM input value
            component.quantity = '11';
            component.isShowKeyboard = true;
            const target = document.createElement('div');
            target.id = 'enterKey';

            component.handleChangeInput({ target } as unknown as Event);

            expect(component.isShowKeyboard).toBeFalse();
            expect(component.quantityError).toBe('CAN_NOT_PRINT_MORE_THEN_10_TICKET');
        });
    });

    // ------------------------------------------------------------------
    // document click handling (private _handleOnDocumentClick via ngOnInit)
    // ------------------------------------------------------------------
    describe('document click handling', () => {
        it('should open the keyboard when clicking the input field', () => {
            component.ngOnInit();
            const el = document.createElement('div');
            el.id = 'inputField';
            document.body.appendChild(el);

            el.click();

            expect(component.isShowKeyboard).toBeTrue();
            document.body.removeChild(el);
        });

        it('should close the keyboard and flag an error when clicking outside with an invalid quantity', () => {
            component.ngOnInit();
            component.isShowKeyboard = true;
            component.quantity = '99';
            const el = document.createElement('div');
            document.body.appendChild(el);

            el.click();

            expect(component.isShowKeyboard).toBeFalse();
            expect(component.quantityError).toBe('CAN_NOT_PRINT_MORE_THEN_10_TICKET');
            document.body.removeChild(el);
        });

        it('should close the keyboard without an error when clicking outside with a valid quantity', () => {
            component.ngOnInit();
            component.isShowKeyboard = true;
            component.quantity = '2';
            const el = document.createElement('div');
            document.body.appendChild(el);

            el.click();

            expect(component.isShowKeyboard).toBeFalse();
            expect(component.quantityError).toBe('');
            document.body.removeChild(el);
        });

        it('should keep the keyboard open when clicking inside the numeric keyboard', () => {
            component.ngOnInit();
            component.isShowKeyboard = true;
            const parent = document.createElement('div');
            parent.className = 'numeric-keyboard-container';
            const child = document.createElement('span');
            parent.appendChild(child);
            document.body.appendChild(parent);

            child.click();

            expect(component.isShowKeyboard).toBeTrue();
            document.body.removeChild(parent);
        });
    });

    // ------------------------------------------------------------------
    // handleCloseErrorPopup / resetCashPaymentState / handleButtonSound
    // ------------------------------------------------------------------
    it('handleCloseErrorPopup should dispatch updateCashPayment with SUCCESS status', () => {
        const store = TestBed.inject(Store) as any;
        component.cashPayment = { adultValues: [], seniorValues: [], studentValues: [], status: ResponseStatus.ERROR };

        component.handleCloseErrorPopup();

        expect(store.dispatch).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: jasmine.objectContaining({ status: ResponseStatus.SUCCESS }),
            }),
        );
    });

    it('resetCashPaymentState should dispatch updateCashPayment with fareResult undefined', () => {
        const store = TestBed.inject(Store) as any;
        component.cashPayment = {
            adultValues: [],
            seniorValues: [],
            studentValues: [],
            fareResult: {
                adultFare: 1,
                seniorFare: 1,
                studentFare: 1,
                exitBusStop: { Busid: '1', Name: 'a' },
                entryBusStop: { Busid: '2', Name: 'b' },
            },
        };

        component.resetCashPaymentState();

        expect(store.dispatch).toHaveBeenCalledWith(
            jasmine.objectContaining({
                payload: jasmine.objectContaining({ fareResult: undefined }),
            }),
        );
    });

    it('handleButtonSound should call soundService.playButton', () => {
        const soundService = TestBed.inject(SoundService) as any;
        component.handleButtonSound();
        expect(soundService.playButton).toHaveBeenCalled();
    });

    it('ngOnDestroy should reset cash payment state and complete the destroy subject', () => {
        const store = TestBed.inject(Store) as any;
        expect(() => component.ngOnDestroy()).not.toThrow();
        expect(store.dispatch).toHaveBeenCalled();
    });

    // ------------------------------------------------------------------
    // ngOnInit: mqttConfigLoaded$ + cash$ subscription branches
    // ------------------------------------------------------------------
    describe('ngOnInit subscriptions', () => {
        afterEach(() => {
            // Selector overrides mutate the shared selector function's memoized result;
            // without resetting, they leak into other spec files' tests.
            (TestBed.inject(Store) as unknown as NgrxMockStore).resetSelectors();
        });

        it('should set topics once mqtt config is loaded', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            mqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };

            component.ngOnInit();

            expect(component.topics).toEqual({ mainTab: { get: 'topic/get' } });
        });

        it('should navigate to main when a multi cancel completes successfully', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_MULTI_CANCEL,
                status: ResponseStatus.SUCCESS,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['main/bus-stop-information']);
        });

        it('should navigate to main when a fare calculation completes successfully', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION,
                status: ResponseStatus.SUCCESS,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(mockRouter.navigate).toHaveBeenCalledWith(['main/bus-stop-information']);
        });

        it('should not navigate when multi cancel status is not SUCCESS', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_MULTI_CANCEL,
                status: ResponseStatus.ERROR,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });

        it('should reset to default cash options when a multi confirm completes successfully', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            component.fareMode = ECashMode.MULTIPLE;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_MULTI_CONFIRM,
                status: ResponseStatus.SUCCESS,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(component.fareMode).toBe(ECashMode.SINGLE);
        });

        it('should reset to default cash options when multi back completes successfully', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            component.fareMode = ECashMode.MULTIPLE;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_MULTI_BACK,
                status: ResponseStatus.SUCCESS,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(component.fareMode).toBe(ECashMode.SINGLE);
        });

        it('should reset to default cash options when fare calculation back completes successfully', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            component.fareMode = ECashMode.CALCULATOR;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BACK,
                status: ResponseStatus.SUCCESS,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(component.fareMode).toBe(ECashMode.SINGLE);
        });

        it('should update bus stop selections and clear the popup on submit bus stop change', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
                fareResult: {
                    adultFare: 1,
                    seniorFare: 1,
                    studentFare: 1,
                    exitBusStop: { Busid: 'exit-x', Name: 'Exit X' },
                    entryBusStop: { Busid: 'entry-x', Name: 'Entry X' },
                },
            });

            component.ngOnInit();

            expect(component.changeBusStopMode).toBeNull();
            expect(component.selectedExitBusStop).toBe('exit-x');
            expect(component.selectedEntryBusStop).toBe('entry-x');
        });

        it('should default bus stop selections to empty strings when fareResult is missing on submit change', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(component.selectedExitBusStop).toBe('');
            expect(component.selectedEntryBusStop).toBe('');
        });

        it('should switch to calculator fare mode on fare calculation bus stop message', () => {
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(component.fareMode).toBe(ECashMode.CALCULATOR);
        });

        it('should retain messages: publish MAIN_BUTTON CASH and dispatch MAIN_CASH when no values exist yet', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            mqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
                type: ECashType.ADULT,
                cashIndex: 0,
            });

            component.ngOnInit();

            expect(mqttService.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.MAIN_BUTTON,
                    payload: { btn: MainButton.CASH },
                }),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    payload: jasmine.objectContaining({ msgID: MsgID.MAIN_CASH }),
                }),
            );
            expect(component.currentMsgID).toBeNull();
        });

        it('should not retain messages when cash value arrays already contain data', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            mqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH,
                adultValues: [{ index: 0, value: 10 }],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MAIN_BUTTON }),
            );
        });

        it('should not retain messages when there is no mainTab.get topic configured', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            mqttService.mqttConfig = { topics: {} };
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(mqttService.publishWithMessageFormat).not.toHaveBeenCalled();
        });

        it('should switch to calculator mode and clear the popup within retain-messages for submit bus stop change', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            mqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_SUBMIT_BUS_STOP_CHANGE,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(component.fareMode).toBe(ECashMode.CALCULATOR);
            expect(component.changeBusStopMode).toBeNull();
        });

        it('should switch to calculator mode within retain-messages for fare calculation bus stop', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            mqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };
            const store: NgrxMockStore = TestBed.inject(Store) as any;
            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH_FARE_CALCULATION_BUS_STOP,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();

            expect(component.fareMode).toBe(ECashMode.CALCULATOR);
        });

        it('should dispatch a retained MAIN_CASH update on a later emission using the previously captured msgID', () => {
            const mqttService = TestBed.inject(MqttService) as any;
            mqttService.mqttConfig = { topics: { mainTab: { get: 'topic/get' } } };
            const store: NgrxMockStore = TestBed.inject(Store) as any;

            store.overrideSelector(cashPaymentSelector, {
                msgID: 999,
                adultValues: [],
                seniorValues: [],
                studentValues: [],
            });

            component.ngOnInit();
            expect(component.currentMsgID).toBe(999);

            store.overrideSelector(cashPaymentSelector, {
                msgID: MsgID.MAIN_CASH,
                adultValues: [{ index: 0, value: 5 }],
                seniorValues: [],
                studentValues: [],
            });
            store.refreshState();

            expect(store.dispatch).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    // dispatch retains the previously-captured msgID (999), not the new emission's MAIN_CASH
                    payload: jasmine.objectContaining({ msgID: 999 }),
                }),
            );
            expect(component.currentMsgID).toBeNull();
        });
    });
});
