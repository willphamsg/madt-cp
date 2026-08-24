import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CVModeControlComponent } from './cv-mode-control.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { MsgID, ResponseStatus } from '@models';
import { of } from 'rxjs';

describe('CVModeControlComponent', () => {
    let component: CVModeControlComponent;
    let fixture: ComponentFixture<CVModeControlComponent>;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CVModeControlComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CVModeControlComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit / ngOnDestroy', () => {
        it('should initialize and destroy without errors', () => {
            expect(() => {
                component.ngOnInit();
                component.ngOnDestroy();
            }).not.toThrow();
        });
    });

    describe('backToCvOperation', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToCvOperation();
            }).not.toThrow();
        });
    });

    describe('handleBack', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleBack();
            }).not.toThrow();
        });
    });

    describe('handleButtonSound', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleButtonSound();
            }).not.toThrow();
        });
    });

    describe('handleConfirm', () => {
        it('should publish the confirm request when isConfirm is true', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            component.handleConfirm(true);
            expect(publishSpy).toHaveBeenCalled();
        });

        it('should reset cvMode and dispatch when isConfirm is false', () => {
            const store = (component as any).store;
            const dispatchSpy = spyOn(store, 'dispatch');
            component.cvMode = 1;
            component.handleConfirm(false);
            expect(component.cvMode).toBeNull();
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    describe('handleRetainMessages', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleRetainMessages();
            }).not.toThrow();
        });

        it('should set cvMode from cvModeControl.cvMode when cvMode is null', () => {
            component.cvMode = null;
            component.cvModeControl = { cvMode: 2 };
            (component as any).handleRetainMessages();
            expect((component as any).cvMode).toBe(2);
        });
    });

    describe('handleSelectStatus', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectStatus();
            }).not.toThrow();
        });
    });

    it('should set topics when mqtt config is loaded', () => {
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { fareTab: { get: 'fare/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ fareTab: { get: 'fare/get' } });
    });

    describe('cvModeControl$ subscription', () => {
        it('should navigate back on SUCCESS status for FARE_CO_CV_MODE_CONTROL_CONFIRM', () => {
            const router = TestBed.inject(Router);
            const navigateSpy = spyOn(router, 'navigate');
            (component as any).cvModeControl$ = of({
                status: ResponseStatus.SUCCESS,
                msgID: MsgID.FARE_CO_CV_MODE_CONTROL_CONFIRM,
            });
            component.ngOnInit();
            expect(navigateSpy).toHaveBeenCalled();
        });

        it('should not navigate for other statuses', () => {
            const router = TestBed.inject(Router);
            const navigateSpy = spyOn(router, 'navigate');
            (component as any).cvModeControl$ = of({ status: ResponseStatus.ERROR });
            component.ngOnInit();
            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('should not schedule a timeout when data.timeout is not set', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            (component as any).cvModeControl$ = of({});
            component.ngOnInit();
            expect(publishSpy).not.toHaveBeenCalled();
        });
    });
});
