import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrintRetentionTicket } from './retention-ticket.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('PrintRetentionTicket', () => {
    let component: PrintRetentionTicket;
    let fixture: ComponentFixture<PrintRetentionTicket>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), PrintRetentionTicket],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(PrintRetentionTicket);
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

    describe('handlePrintRetention', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handlePrintRetention();
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

    describe('handleConfirmDetectCart', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirmDetectCart();
            }).not.toThrow();
        });
    });

    describe('handleCancelDetectCart', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleCancelDetectCart();
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

    describe('handleCancelPrint', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleCancelPrint();
            }).not.toThrow();
        });
    });

    describe('handleSelectCV', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectCV();
            }).not.toThrow();
        });
    });

    describe('handleStopDetectCard', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleStopDetectCard();
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

    describe('handleRetainMessages', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleRetainMessages();
            }).not.toThrow();
        });
    });

    describe('backToPrinterOperation', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToPrinterOperation();
            }).not.toThrow();
        });
    });
});
