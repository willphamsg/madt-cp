import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareBusStopMode } from './fare-bus-stop-mode.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { MsgID } from '@models';
import { of } from 'rxjs';

describe('FareBusStopMode', () => {
    let component: FareBusStopMode;
    let fixture: ComponentFixture<FareBusStopMode>;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareBusStopMode],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(FareBusStopMode);
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

    describe('handleConfirmFareBusStopMode', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirmFareBusStopMode();
            }).not.toThrow();
        });
    });

    describe('backSelectMode', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backSelectMode();
            }).not.toThrow();
        });
    });

    describe('removeTimeout', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).removeTimeout();
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

    describe('handleSelectFareBusStopMode', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectFareBusStopMode();
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

    describe('handleCancel', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleCancel();
            }).not.toThrow();
        });
    });

    describe('handleRetainMessages', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleRetainMessages();
            }).not.toThrow();
        });

        it('should set mode from fareBusStopMode.mode when mode is not already set', () => {
            component.mode = 0;
            component.fareBusStopMode = { mode: 2 };
            (component as any).handleRetainMessages();
            expect(component.mode).toBe(2);
        });
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { fareTab: { get: 'fare/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ fareTab: { get: 'fare/get' } });
    });

    describe('fareBusStopMode$ subscription', () => {
        it('should not schedule a timeout when data.timeout is not set', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            (component as any).fareBusStopMode$ = of({});
            component.ngOnInit();
            expect(publishSpy).not.toHaveBeenCalled();
        });

        it('should set finaleMode when msgID is FARE_BUS_STOP_MODE and finaleMode is unset', () => {
            (component as any).fareBusStopMode$ = of({ msgID: MsgID.FARE_BUS_STOP_MODE, mode: 2 });
            component.ngOnInit();
            expect(component.finaleMode).toBe(2);
        });

        it('should set finaleMode when msgID is FARE_BUS_STOP_MODE_SUBMIT', () => {
            (component as any).fareBusStopMode$ = of({ msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT, mode: 1 });
            component.ngOnInit();
            expect(component.finaleMode).toBe(1);
        });

        it('should not set finaleMode for an unrelated msgID', () => {
            component.finaleMode = 0;
            (component as any).fareBusStopMode$ = of({ msgID: MsgID.FARE_BACK_BUTTON, mode: 2 });
            component.ngOnInit();
            expect(component.finaleMode).toBe(0);
        });
    });
});
