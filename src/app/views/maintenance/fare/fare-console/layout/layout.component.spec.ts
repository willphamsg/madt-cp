import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareConsoleLayoutComponent } from './layout.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { MsgID } from '@models';
import { of } from 'rxjs';

describe('FareConsoleLayoutComponent', () => {
    let component: FareConsoleLayoutComponent;
    let fixture: ComponentFixture<FareConsoleLayoutComponent>;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareConsoleLayoutComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FareConsoleLayoutComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('validateFareConsoleForm should return false when all fields are empty/zero', () => {
        component.fareConsoleSetting = {
            deckType: { id: 0, label: '' },
            blsStatus: 0,
            busId: '',
            date: '',
            time: '',
            complimentaryDays: 0,
            message: '',
        };
        expect(component.validateFareConsoleForm()).toBeFalse();
    });

    it('fareConsoleSetting should be initialized with default values', () => {
        const localComponent = TestBed.createComponent(FareConsoleLayoutComponent).componentInstance;
        expect(localComponent.fareConsoleSetting.deckType.id).toBe(0);
        expect(localComponent.fareConsoleSetting.blsStatus).toBe(0);
        expect(localComponent.fareConsoleSetting.busId).toBe('');
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('validateFareConsoleForm should return true when all fields are set', () => {
        component.fareConsoleSetting = {
            deckType: { id: 1, label: 'Single' },
            blsStatus: 0,
            busId: 'BUS1',
            date: '',
            time: '',
            dateTime: '2026-01-01',
            complimentaryDays: 1,
            fareBusStopMode: 1,
            message: '',
        };
        expect(component.validateFareConsoleForm()).toBeTrue();
    });

    it('should set topics and request the fare console when mqtt config is loaded', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
        expect(publishSpy).toHaveBeenCalled();
    });

    describe('fareConsoleSetting$ subscription', () => {
        it('should take a snapshot the first time MAINTENANCE_FARE_CONSOLE data arrives', () => {
            (component as any).fareConsoleSetting$ = of({
                deckType: { id: 1, label: '' },
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
                busId: 'BUS1',
            });
            component.ngOnInit();
            expect((component as any).submittedFareConsoleSnapshot).toEqual(
                jasmine.objectContaining({ deckTypeId: 1, busId: 'BUS1' }),
            );
        });

        it('should not overwrite an existing snapshot', () => {
            (component as any).submittedFareConsoleSnapshot = { deckTypeId: 9 };
            (component as any).fareConsoleSetting$ = of({
                deckType: { id: 1, label: '' },
                msgID: MsgID.MAINTENANCE_FARE_CONSOLE,
            });
            component.ngOnInit();
            expect((component as any).submittedFareConsoleSnapshot).toEqual({ deckTypeId: 9 });
        });
    });

    describe('ngOnDestroy', () => {
        it('should not dispatch when fareConsoleSetting.isSubmitted is true', () => {
            const dispatchSpy = spyOn((component as any).store, 'dispatch');
            component.fareConsoleSetting = { ...component.fareConsoleSetting, isSubmitted: true } as any;
            component.ngOnDestroy();
            expect(dispatchSpy).not.toHaveBeenCalled();
        });

        it('should dispatch with isDaftMode=false when there is no snapshot to compare against', () => {
            const dispatchSpy = spyOn((component as any).store, 'dispatch');
            (component as any).submittedFareConsoleSnapshot = null;
            component.fareConsoleSetting = {
                deckType: { id: 1, label: '' },
                busId: 'BUS1',
                date: '',
                time: '',
                dateTime: '2026-01-01',
                complimentaryDays: 1,
                fareBusStopMode: 1,
                message: '',
            };
            component.ngOnDestroy();
            expect(dispatchSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({ payload: jasmine.objectContaining({ isDaftMode: false }) }),
            );
        });

        it('should dispatch with isDaftMode=true when the form is valid and changed from the snapshot', () => {
            const dispatchSpy = spyOn((component as any).store, 'dispatch');
            (component as any).submittedFareConsoleSnapshot = {
                deckTypeId: 2,
                fareBusStopMode: 1,
                busId: 'OLD',
                complimentaryDays: 1,
                serviceProvider: 1,
            };
            component.fareConsoleSetting = {
                deckType: { id: 1, label: '' },
                busId: 'BUS1',
                date: '',
                time: '',
                dateTime: '2026-01-01',
                complimentaryDays: 1,
                fareBusStopMode: 1,
                message: '',
            };
            component.ngOnDestroy();
            expect(dispatchSpy).toHaveBeenCalledWith(
                jasmine.objectContaining({ payload: jasmine.objectContaining({ isDaftMode: true }) }),
            );
        });
    });
});
