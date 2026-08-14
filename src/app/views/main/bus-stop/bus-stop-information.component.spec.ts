import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BusStopInformationComponent } from './bus-stop-information.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { of } from 'rxjs';
import { MsgID, MsgSubID } from '@models';
import * as MainActions from '@store/main/main.reducer';

describe('BusStopInformationComponent', () => {
    let component: BusStopInformationComponent;
    let fixture: ComponentFixture<BusStopInformationComponent>;
    let store: MockStore;
    let mqttServiceSpy: jasmine.SpyObj<MqttService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;

    beforeEach(async () => {
        const mqttSpy = jasmine.createSpyObj('MqttService', ['publishWithMessageFormat'], {
            mqttConfigLoaded$: of(true),
            mqttConfig: { topics: { mainTab: { get: 'test/topic' } } },
        });
        const soundSpy = jasmine.createSpyObj('SoundService', ['playButton']);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BusStopInformationComponent],
            providers: [
                provideHttpClient(),
                provideRouter([]),
                provideMockStore({ initialState: mockInitialState }),
                { provide: MqttService, useValue: mqttSpy },
                { provide: SoundService, useValue: soundSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        store = TestBed.inject(MockStore);
        mqttServiceSpy = TestBed.inject(MqttService) as jasmine.SpyObj<MqttService>;
        soundServiceSpy = TestBed.inject(SoundService) as jasmine.SpyObj<SoundService>;

        fixture = TestBed.createComponent(BusStopInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    describe('getNowNextDataById', () => {
        it('should return null if id is not found', () => {
            const data = [{ Busid: '1' }, { Busid: '2' }];
            expect(component.getNowNextDataById('3', data)).toBeNull();
        });

        it('should return current and next data if found and not last element', () => {
            const data = [{ Busid: '1' }, { Busid: '2' }, { Busid: '3' }];
            expect(component.getNowNextDataById('2', data)).toEqual([{ Busid: '2' }, { Busid: '3' }]);
        });

        it('should return only current data if found and is last element', () => {
            const data = [{ Busid: '1' }, { Busid: '2' }];
            expect(component.getNowNextDataById('2', data)).toEqual([{ Busid: '2' }]);
        });
    });

    describe('getColoredBars', () => {
        it('should return correct bars for left/up/top', () => {
            expect(component.getColoredBars('left', 3)).toEqual([4, 5, 6]);
            expect(component.getColoredBars('up', 2)).toEqual([5, 6]);
        });

        it('should return correct bars for right/down/bottom', () => {
            expect(component.getColoredBars('right', 3)).toEqual([6, 7, 8]);
            expect(component.getColoredBars('down', 2)).toEqual([6, 7]);
        });

        it('should return correct bars for middle', () => {
            expect(component.getColoredBars('middle', 3)).toEqual([5, 6, 7]);
            expect(component.getColoredBars('middle', 2)).toEqual([5, 6]);
        });

        it('should return empty array if bars is 0', () => {
            expect(component.getColoredBars('left', 0)).toEqual([]);
        });
    });

    describe('triggerScrollTop', () => {
        it('should set backToTop to true then false after timeout', fakeAsync(() => {
            component.triggerScrollTop();
            expect(component.backToTop).toBeTrue();
            tick(300);
            expect(component.backToTop).toBeFalse();
        }));
    });

    describe('convertSecondsToMinutes', () => {
        it('should convert seconds to minutes rounded up', () => {
            expect(component.convertSecondsToMinutes(1)).toBe(1);
            expect(component.convertSecondsToMinutes(60)).toBe(1);
            expect(component.convertSecondsToMinutes(61)).toBe(2);
        });
    });

    describe('filterById', () => {
        it('should return matched item by id', () => {
            const data = [{ Busid: '1' }, { Busid: '2' }];
            expect(component.filterById(data, '1')).toEqual({ Busid: '1' });
            expect(component.filterById(data, '3')).toBeUndefined();
        });
    });

    describe('formatKm', () => {
        it('should format number with 1 decimal', () => {
            expect(component.formatKm(5)).toBe('5.0');
            expect(component.formatKm(5.15)).toBe('5.2');
        });

        it('should format string number with 1 decimal', () => {
            expect(component.formatKm('5')).toBe('5.0');
            expect(component.formatKm('5.15')).toBe('5.2');
        });

        it('should return 0.0 for invalid string', () => {
            expect(component.formatKm('abc')).toBe('0.0');
        });

        it('should return value as is if not number or string', () => {
            const obj: any = {};
            expect(component.formatKm(obj)).toBe(obj);
        });
    });

    describe('Bus stop selection & fare', () => {
        it('should select bus stop and dispatch action', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const routerSpy = spyOn((component as any).router, 'navigate');
            const busStop = { Busid: '123' } as any;

            component.selectBusStop(busStop);

            expect(routerSpy).toHaveBeenCalledWith(['/main/bus-stop-fare/123']);
            expect(dispatchSpy).toHaveBeenCalledWith(MainActions.selectBusStop({ payload: busStop }));
        });

        it('should handle display fare bus stop', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleDisplayFareBusStop();
            expect(dispatchSpy).toHaveBeenCalledWith(MainActions.updateDisplayFareBusStopList({ payload: true }));
        });

        it('should handle close bus stop fare', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleCloseBusStopFare();
            expect(component.displayCfmBusStopFare).toBeFalse();
            expect(component.selectFareBusStop).toBe('');
            expect(component.selectFareBusStopName).toBe('');
            expect(component.selectedIndex).toBe(-1);
            expect(dispatchSpy).toHaveBeenCalledWith(MainActions.updateDisplayFareBusStopList({ payload: false }));
        });

        it('should handle change bus stop fare', () => {
            const busStop = { Busid: '999', Name: 'Test Stop' } as any;
            component.handleChangeBusStopFare(busStop, 2);
            expect(component.selectFareBusStop).toBe('999');
            expect(component.selectFareBusStopName).toBe('Test Stop');
            expect(component.selectedIndex).toBe(2);
            expect(component.displayCfmBusStopFare).toBeTrue();
        });

        it('should handle confirm bus stop fare with true', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.selectFareBusStop = '999';
            component.selectedIndex = 2;
            component.topics = { mainTab: { get: 'test/topic' } } as any;

            component.handleConfirmBusStopFare(true);

            expect(mqttServiceSpy.publishWithMessageFormat).toHaveBeenCalledWith({
                topic: 'test/topic',
                msgID: MsgID.MAIN_UPDATE_FARE_BUS_STOP,
                msgSubID: MsgSubID.NOTIFY,
                payload: { busStopId: '999', index: 2 },
            });
            expect(dispatchSpy).toHaveBeenCalledWith(MainActions.updateCurrentFareBusStop({ payload: '999', idx: 2 }));
            expect(component.displayCfmBusStopFare).toBeFalse();
            expect(component.selectFareBusStop).toBe('');
            expect(component.selectFareBusStopName).toBe('');
            expect(component.selectedIndex).toBe(-1);
            expect(dispatchSpy).toHaveBeenCalledWith(MainActions.updateDisplayFareBusStopList({ payload: false }));
        });

        it('should handle confirm bus stop fare with false', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleConfirmBusStopFare(false);
            expect(component.displayCfmBusStopFare).toBeFalse();
            expect(dispatchSpy).toHaveBeenCalledWith(MainActions.updateDisplayFareBusStopList({ payload: true }));
        });
    });

    describe('handleButtonSound', () => {
        it('should play button sound', () => {
            component.handleButtonSound();
            expect(soundServiceSpy.playButton).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should emit and complete destroy$ subject', () => {
            const nextSpy = spyOn((component as any).destroy$, 'next');
            const completeSpy = spyOn((component as any).destroy$, 'complete');

            component.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });
});
