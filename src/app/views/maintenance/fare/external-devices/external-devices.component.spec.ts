import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExternalDevicesComponent } from './external-devices.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ResponseStatus } from '@models';
import { provideRouter, Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { of } from 'rxjs';

describe('ExternalDevicesComponent', () => {
    let component: ExternalDevicesComponent;
    let fixture: ComponentFixture<ExternalDevicesComponent>;
    let mqttService: MqttService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ExternalDevicesComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ExternalDevicesComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize isLoading to true', () => {
        expect(component.isLoading).toBeTrue();
    });

    it('should initialize initialExternalDevices with each device status as NA', () => {
        expect(component.initialExternalDevices.printer!.status).toBe(ResponseStatus.NA);
        expect(component.initialExternalDevices.GNSSAntenna!.status).toBe(ResponseStatus.NA);
    });

    it('should initialize externalDevices as a copy of initialExternalDevices', () => {
        const localComponent = TestBed.createComponent(ExternalDevicesComponent).componentInstance;
        expect(localComponent.externalDevices).toEqual(localComponent.initialExternalDevices);
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should set topics and request devices when mqtt config is loaded', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
        expect(publishSpy).toHaveBeenCalled();
    });

    describe('externalDevices$ subscription', () => {
        it('should set isLoading false when data has keys', () => {
            component.isLoading = true;
            (component as any).externalDevices$ = of({ printer: { status: ResponseStatus.SUCCESS } });
            component.ngOnInit();
            expect(component.isLoading).toBeFalse();
        });

        it('should set isLoading true when data is empty', () => {
            component.isLoading = false;
            (component as any).externalDevices$ = of({});
            component.ngOnInit();
            expect(component.isLoading).toBeTrue();
        });
    });

    describe('existingCvs', () => {
        it('should return only cv keys that are present', () => {
            component.externalDevices = { cv1: { status: ResponseStatus.NA, message: '' } } as any;
            expect(component.existingCvs()).toEqual(['cv1']);
        });

        it('should return an empty array when no cvs are present', () => {
            component.externalDevices = {} as any;
            expect(component.existingCvs()).toEqual([]);
        });
    });

    describe('field status helpers', () => {
        beforeEach(() => {
            component.externalDevices = {
                printer: { status: ResponseStatus.SUCCESS, message: '' },
            } as any;
        });

        it('fieldSuccess should return true for a matching field', () => {
            expect(component.fieldSuccess('printer')).toBeTruthy();
        });

        it('fieldSuccess should return falsy for a missing field', () => {
            expect(component.fieldSuccess('missing')).toBeFalsy();
        });

        it('fieldError should return falsy when status is not ERROR', () => {
            expect(component.fieldError('printer')).toBeFalsy();
        });

        it('fieldInProgress should return falsy when status is not PROGRESS', () => {
            expect(component.fieldInProgress('printer')).toBeFalsy();
        });
    });

    describe('handlePrintTest', () => {
        it('should publish a test print request', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            component.handlePrintTest();
            expect(publishSpy).toHaveBeenCalled();
        });
    });

    describe('handleRefresh', () => {
        it('should publish and dispatch reset status', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            const store = (component as any).store;
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleRefresh();
            expect(publishSpy).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    describe('handleCancel', () => {
        it('should publish cancel and dispatch reset to initial devices', () => {
            const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
            const store = (component as any).store;
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleCancel();
            expect(publishSpy).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalled();
        });
    });

    describe('backToFareConsole', () => {
        it('should navigate to /maintenance/fare/fare-console', () => {
            const router = TestBed.inject(Router);
            const navigateSpy = spyOn(router, 'navigate');
            component.backToFareConsole();
            expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
        });
    });
});
