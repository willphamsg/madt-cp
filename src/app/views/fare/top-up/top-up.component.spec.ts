import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopUpComponent } from './top-up.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { MsgID, ResponseStatus } from '@models';
import { of } from 'rxjs';

describe('TopUpComponent', () => {
    let component: TopUpComponent;
    let fixture: ComponentFixture<TopUpComponent>;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), TopUpComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TopUpComponent);
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

    describe('handleConfirmTopUp', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirmTopUp();
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

    describe('backToFare', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToFare();
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

    describe('resetTopUp', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).resetTopUp();
            }).not.toThrow();
        });
    });

    describe('handleFareBox', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleFareBox();
            }).not.toThrow();
        });
    });

    describe('handleRetainMessages', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleRetainMessages();
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

    describe('handleSelectAmt', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectAmt();
            }).not.toThrow();
        });
    });

    it('should set topics when connected and mqtt config is loaded', () => {
        (mqttService as any).connectionStatus$ = of(true);
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { fareTab: { get: 'fare/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ fareTab: { get: 'fare/get' } });
    });

    it('should not set topics when not connected', () => {
        (mqttService as any).connectionStatus$ = of(false);
        component.ngOnInit();
        expect((component as any).topics).toBeUndefined();
    });

    describe('topUp$ subscription', () => {
        it('should not schedule a timeout when data.timeout is not set', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            (component as any).topUp$ = of({ amounts: [10] });
            component.ngOnInit();
            expect(publishSpy).not.toHaveBeenCalled();
        });

        it('should navigate back to fare on SUCCESS status for FARE_TOP_UP_SUBMIT', () => {
            const router = TestBed.inject(Router);
            const navigateSpy = spyOn(router, 'navigate');
            (component as any).topUp$ = of({
                status: ResponseStatus.SUCCESS,
                msgID: MsgID.FARE_TOP_UP_SUBMIT,
                amounts: [10],
            });
            component.ngOnInit();
            expect(navigateSpy).toHaveBeenCalled();
        });

        it('should not navigate back to fare for other statuses', () => {
            const router = TestBed.inject(Router);
            const navigateSpy = spyOn(router, 'navigate');
            (component as any).topUp$ = of({ status: ResponseStatus.ERROR, amounts: [10] });
            component.ngOnInit();
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleRetainMessages', () => {
        it('should set selectedAmt from topUp.amount when not already set', () => {
            component.selectedAmt = 0;
            component.topUp = { amount: 20, amounts: [10, 20] };
            (component as any).handleRetainMessages();
            expect(component.selectedAmt).toBe(20);
        });

        it('should request the top-up menu when amounts is empty', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            component.topUp = { amounts: [] };
            (component as any).handleRetainMessages();
            expect(publishSpy).toHaveBeenCalled();
        });
    });
});
