import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExternalDevicesComponent } from './external-devices.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { ResponseStatus } from '@models';

describe('ExternalDevicesComponent', () => {
    let component: ExternalDevicesComponent;
    let fixture: ComponentFixture<ExternalDevicesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ExternalDevicesComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ExternalDevicesComponent);
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

    it('should return existing cvs correctly', () => {
        component.externalDevices = { ...component.initialExternalDevices, cv1: { status: 1, message: '' } };
        expect(component.existingCvs()).toContain('cv1');
    });

    it('should check field success correctly', () => {
        component.externalDevices = {
            ...component.initialExternalDevices,
            printer: { status: ResponseStatus.SUCCESS, message: '' },
        };
        expect(component.fieldSuccess('printer')).toBeTrue();
    });

    it('should check field error correctly', () => {
        component.externalDevices = {
            ...component.initialExternalDevices,
            printer: { status: ResponseStatus.ERROR, message: 'Paper jam' },
        };
        expect(component.fieldError('printer')).toBeTrue();
        expect(component.errorText('printer')).toEqual('Paper jam');
    });

    it('should handle print test', () => {
        const mqttService = TestBed.inject(MqttService);
        const spy = spyOn(mqttService, 'publishWithMessageFormat');
        component.topics = { mainTab: { get: 'test' } };
        component.handlePrintTest();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle refresh', () => {
        const mqttService = TestBed.inject(MqttService);
        const spy = spyOn(mqttService, 'publishWithMessageFormat');
        component.topics = { mainTab: { get: 'test' } };
        component.handleRefresh();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle confirm', () => {
        const mqttService = TestBed.inject(MqttService);
        const spy = spyOn(mqttService, 'publishWithMessageFormat');
        component.topics = { mainTab: { get: 'test' } };
        component.handleConfirm(true);
        expect(spy).toHaveBeenCalled();
    });

    it('should go back to start shift', () => {
        const router = TestBed.inject(Router);
        const spy = spyOn(router, 'navigate');
        component.backToStartShift();
        expect(spy).toHaveBeenCalledWith(['/main/bus-operation']);
    });
});
