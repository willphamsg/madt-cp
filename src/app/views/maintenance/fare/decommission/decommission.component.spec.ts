import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Decommission } from './decommission.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { ResponseStatus } from '@models';
import { of } from 'rxjs';

describe('Decommission', () => {
    let component: Decommission;
    let fixture: ComponentFixture<Decommission>;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), Decommission],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(Decommission);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize commissionError to null', () => {
        expect(component.commissionError).toBeNull();
    });

    it('should initialize decommission to empty object', () => {
        expect(component.decommission).toEqual({});
    });

    it('handleSubmit with empty value should set commissionError to INVALID_ENTRY', () => {
        component.handleSubmit('');
        expect(component.commissionError).toBe('INVALID_ENTRY');
    });

    it('handleSubmit with value longer than 6 chars should set commissionError to INVALID_ENTRY', () => {
        component.handleSubmit('1234567');
        expect(component.commissionError).toBe('INVALID_ENTRY');
    });

    it('handleClosePopup should set commissionError to null', () => {
        component.commissionError = 'INVALID_ENTRY';
        component.handleClosePopup();
        expect(component.commissionError).toBeNull();
    });

    it('handleSubmit with a valid value should publish the decommission request', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleSubmit('123456');
        expect(component.commissionError).toBeNull();
        expect(publishSpy).toHaveBeenCalled();
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
    });

    describe('decommission$ subscription', () => {
        it('should set commissionError to data.message on ERROR status', () => {
            (component as any).decommission$ = of({ status: ResponseStatus.ERROR, message: 'boom' });
            component.ngOnInit();
            expect(component.commissionError).toBe('boom');
        });

        it('should default commissionError to INVALID_ENTRY on ERROR status without a message', () => {
            (component as any).decommission$ = of({ status: ResponseStatus.ERROR });
            component.ngOnInit();
            expect(component.commissionError).toBe('INVALID_ENTRY');
        });

        it('should clear commissionError when status is not ERROR', () => {
            component.commissionError = 'INVALID_ENTRY';
            (component as any).decommission$ = of({ status: ResponseStatus.SUCCESS });
            component.ngOnInit();
            expect(component.commissionError).toBeNull();
        });
    });

    describe('handleChangeInput', () => {
        let inputField: HTMLInputElement;

        beforeEach(() => {
            inputField = document.createElement('input');
            spyOn(document, 'getElementById').and.callFake((id: string) => (id === 'inputField' ? inputField : null));
        });

        function makeEvent(targetId: string, innerText = ''): Event {
            const target = document.createElement('div');
            target.id = targetId;
            target.innerText = innerText;
            return { target } as unknown as Event;
        }

        it('should delete char before cursor on backspaceKey with no selection', () => {
            inputField.value = '1234';
            inputField.selectionStart = 4;
            inputField.selectionEnd = 4;
            component.handleChangeInput(makeEvent('backspaceKey'));
            expect(inputField.value).toBe('123');
        });

        it('should delete selected text on backspaceKey with a selection', () => {
            inputField.value = '1234';
            inputField.selectionStart = 0;
            inputField.selectionEnd = 2;
            component.handleChangeInput(makeEvent('backspaceKey'));
            expect(inputField.value).toBe('34');
        });

        it('should call handleSubmit on enterKey', () => {
            inputField.value = '1234';
            const submitSpy = spyOn(component, 'handleSubmit');
            component.handleChangeInput(makeEvent('enterKey'));
            expect(submitSpy).toHaveBeenCalledWith('1234');
        });

        it('should append the pressed digit key value', () => {
            inputField.value = '1';
            inputField.selectionStart = 1;
            inputField.selectionEnd = 1;
            component.handleChangeInput(makeEvent('digitKey', '5'));
            expect(inputField.value).toBe('15');
        });
    });
});
