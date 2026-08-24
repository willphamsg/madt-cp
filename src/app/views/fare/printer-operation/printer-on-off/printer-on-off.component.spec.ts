import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrinterOnOffComponent } from './printer-on-off.component';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('PrinterOnOffComponent', () => {
    let component: PrinterOnOffComponent;
    let fixture: ComponentFixture<PrinterOnOffComponent>;

    function setup(printerOn: boolean): void {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), PrinterOnOffComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: ActivatedRoute, useValue: { snapshot: { data: { printerOn } } } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(PrinterOnOffComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    describe('printer on route', () => {
        beforeEach(() => setup(true));

        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should resolve printerOn from route data', () => {
            expect(component.printerOn).toBe(true);
        });
    });

    describe('printer off route', () => {
        beforeEach(() => setup(false));

        it('should resolve printerOn from route data', () => {
            expect(component.printerOn).toBe(false);
        });
    });

    describe('ngOnInit', () => {
        beforeEach(() => setup(true));

        it('should initialize without errors', () => {
            expect(() => {
                component.ngOnInit();
            }).not.toThrow();
        });
    });

    describe('backToPrinterOperation', () => {
        beforeEach(() => setup(true));

        it('should execute without errors', () => {
            expect(() => {
                component.backToPrinterOperation();
            }).not.toThrow();
        });
    });

    describe('ngOnDestroy', () => {
        beforeEach(() => setup(true));

        it('should execute without errors', () => {
            expect(() => {
                component.ngOnDestroy();
            }).not.toThrow();
        });
    });
});
