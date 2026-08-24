import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareBusStopMode } from './fare-bus-stop-mode.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { MsgID, ResponseStatus } from '@models';
import { Store } from '@ngrx/store';
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

    it('should initialize mode to 0', () => {
        expect(component.mode).toBe(0);
    });

    it('should initialize fareBusStopMode to empty object', () => {
        expect(component.fareBusStopMode).toEqual({});
    });

    it('handleSelectFareBusStopMode should update mode', () => {
        component.handleSelectFareBusStopMode(1);
        expect(component.mode).toBe(1);
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

    describe('mappingPosnStatus', () => {
        it('should map known values and default to empty string', () => {
            expect(component.mappingPosnStatus(1)).toBe('FMS');
            expect(component.mappingPosnStatus(2)).toBe('FARE_SYSTEM');
            expect(component.mappingPosnStatus(3)).toBe('NONE');
            expect(component.mappingPosnStatus(99)).toBe('');
        });
    });

    describe('fareConsole$ subscription', () => {
        it('should set finaleMode from data when not already set', () => {
            (component as any).fareConsole$ = of({ fareBusStopMode: 2 });
            component.ngOnInit();
            expect(component.finaleMode).toBe(2);
        });

        it('should not overwrite an already-set finaleMode', () => {
            component.finaleMode = 1;
            (component as any).fareConsole$ = of({ fareBusStopMode: 2 });
            component.ngOnInit();
            expect(component.finaleMode).toBe(1);
        });
    });

    describe('fareBusStopMode$ subscription', () => {
        it('should not schedule a timeout when data.timeout is not set', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            (component as any).fareBusStopMode$ = of({});
            component.ngOnInit();
            expect(publishSpy).not.toHaveBeenCalled();
        });

        it('should dispatch updateFareConsole when submit succeeds', () => {
            const store = TestBed.inject(Store);
            const dispatchSpy = spyOn(store, 'dispatch');
            (component as any).fareBusStopMode$ = of({
                msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
                status: ResponseStatus.SUCCESS,
                mode: 2,
            });
            component.ngOnInit();
            expect(dispatchSpy).toHaveBeenCalled();
            expect(component.finaleMode).toBe(2);
        });

        it('should not dispatch updateFareConsole when status is not SUCCESS', () => {
            const store = TestBed.inject(Store);
            const dispatchSpy = spyOn(store, 'dispatch');
            (component as any).fareBusStopMode$ = of({
                msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT,
                status: ResponseStatus.ERROR,
            });
            component.ngOnInit();
            expect(dispatchSpy).not.toHaveBeenCalled();
        });

        it('should set mode from fareBusStopMode.mode when mode is not already set', () => {
            (component as any).fareBusStopMode$ = of({ mode: 3 });
            component.ngOnInit();
            expect(component.mode).toBe(3);
        });
    });
});
