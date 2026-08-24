import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrinterOperationMenuComponent } from './printer-operation-menu.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { of } from 'rxjs';

describe('PrinterOperationMenuComponent', () => {
    let component: PrinterOperationMenuComponent;
    let fixture: ComponentFixture<PrinterOperationMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), PrinterOperationMenuComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(PrinterOperationMenuComponent);
        component = fixture.componentInstance;
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

    describe('handleClick', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleClick();
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

    describe('handleBack', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleBack();
            }).not.toThrow();
        });
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        const mqttService = TestBed.inject(MqttService);
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { fareTab: { get: 'fare/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ fareTab: { get: 'fare/get' } });
    });
});
