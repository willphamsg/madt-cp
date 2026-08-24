import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplimentaryDayComponent } from './complimentary-day.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { of } from 'rxjs';

describe('ComplimentaryDayComponent', () => {
    let component: ComplimentaryDayComponent;
    let fixture: ComponentFixture<ComplimentaryDayComponent>;
    let router: Router;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ComplimentaryDayComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ComplimentaryDayComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        mqttService = TestBed.inject(MqttService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize hasInputError to false', () => {
        expect(component.hasInputError).toBeFalse();
    });

    it('goBack should navigate to /maintenance/fare/fare-console', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
    });

    describe('handleConfirmComplimentaryDays (private)', () => {
        it('should set hasInputError when value is not a number', () => {
            (component as any).handleConfirmComplimentaryDays('abc');
            expect(component.hasInputError).toBeTrue();
        });

        it('should set hasInputError when value exceeds maximumcomplimentaryDays', () => {
            (component as any).fareConsoleSetting = { maximumcomplimentaryDays: 5 };
            (component as any).handleConfirmComplimentaryDays('10');
            expect(component.hasInputError).toBeTrue();
        });

        it('should submit and navigate back when value is valid', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            const navigateSpy = spyOn(router, 'navigate');
            (component as any).fareConsoleSetting = {};
            (component as any).handleConfirmComplimentaryDays('3');
            expect(component.hasInputError).toBeFalse();
            expect(publishSpy).toHaveBeenCalled();
            expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
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
            inputField.value = '123';
            inputField.selectionStart = 3;
            inputField.selectionEnd = 3;
            component.handleChangeInput(makeEvent('backspaceKey'));
            expect(inputField.value).toBe('12');
        });

        it('should delete selected text on backspaceKey with a selection', () => {
            inputField.value = '123';
            inputField.selectionStart = 0;
            inputField.selectionEnd = 2;
            component.handleChangeInput(makeEvent('backspaceKey'));
            expect(inputField.value).toBe('3');
        });

        it('should do nothing on enterKey when value is empty', () => {
            inputField.value = '';
            const confirmSpy = spyOn<any>(component as any, 'handleConfirmComplimentaryDays');
            component.handleChangeInput(makeEvent('enterKey'));
            expect(confirmSpy).not.toHaveBeenCalled();
        });

        it('should confirm complimentary days on enterKey with a value', () => {
            inputField.value = '5';
            const confirmSpy = spyOn<any>(component as any, 'handleConfirmComplimentaryDays');
            component.handleChangeInput(makeEvent('enterKey'));
            expect(confirmSpy).toHaveBeenCalledWith('5');
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
