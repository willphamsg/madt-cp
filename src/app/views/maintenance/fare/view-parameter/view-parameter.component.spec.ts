import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewParameterComponent } from './view-parameter.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { ResponseStatus } from '@models';
import { of } from 'rxjs';

describe('ViewParameterComponent', () => {
    let component: ViewParameterComponent;
    let fixture: ComponentFixture<ViewParameterComponent>;
    let mqttService: MqttService;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ViewParameterComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ViewParameterComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize isLoading to true', () => {
        expect(component.isLoading).toBeTrue();
    });

    it('should initialize viewParameter with empty parameters array', () => {
        expect(component.viewParameter.parameters).toEqual([]);
    });

    it('should initialize sort with asc values', () => {
        expect(component.sort['fullName']).toBe('asc');
        expect(component.sort['version']).toBe('asc');
        expect(component.sort['date']).toBe('asc');
    });

    it('handleSort should toggle sort direction from asc to desc', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.sort['fullName'] = 'asc';
        component.handleSort('fullName');
        expect(component.sort['fullName']).toBe('desc');
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('handleRetry should set isLoading to true and call mqttService.publishWithMessageFormat', () => {
        component.isLoading = false;
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleRetry();
        expect(component.isLoading).toBeTrue();
        expect(publishSpy).toHaveBeenCalled();
    });

    it('handleSort should sort by date field', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.viewParameter = {
            parameters: [
                { date: '2026-01-02', time: '10:00' },
                { date: '2026-01-01', time: '10:00' },
            ] as any,
        };
        component.handleSort('date');
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should set topics and request parameters when mqtt config is loaded', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
        expect(publishSpy).toHaveBeenCalled();
    });

    describe('viewParameter$ subscription', () => {
        it('should set isLoading true on PROGRESS status', () => {
            component.isLoading = false;
            (component as any).viewParameter$ = of({ status: ResponseStatus.PROGRESS, parameters: [] });
            component.ngOnInit();
            expect(component.isLoading).toBeTrue();
        });

        it('should set isLoading false on ERROR status', () => {
            component.isLoading = true;
            (component as any).viewParameter$ = of({ status: ResponseStatus.ERROR, parameters: [] });
            component.ngOnInit();
            expect(component.isLoading).toBeFalse();
        });

        it('should set isLoading false on SUCCESS status', () => {
            component.isLoading = true;
            (component as any).viewParameter$ = of({ status: ResponseStatus.SUCCESS, parameters: [] });
            component.ngOnInit();
            expect(component.isLoading).toBeFalse();
        });

        it('should leave isLoading unchanged for other statuses', () => {
            component.isLoading = true;
            (component as any).viewParameter$ = of({ status: ResponseStatus.NA, parameters: [] });
            component.ngOnInit();
            expect(component.isLoading).toBeTrue();
        });
    });
});
