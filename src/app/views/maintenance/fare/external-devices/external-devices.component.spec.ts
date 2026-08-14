import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExternalDevicesComponent } from './external-devices.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ResponseStatus } from '@models';
import { provideRouter } from '@angular/router';

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
});
