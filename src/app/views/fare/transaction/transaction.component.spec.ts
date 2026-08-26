import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionComponent } from './transaction.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('TransactionComponent', () => {
    let component: TransactionComponent;
    let fixture: ComponentFixture<TransactionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), TransactionComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionComponent);
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

    describe('scheduleTimeout', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).scheduleTimeout(10, 1);
            }).not.toThrow();
        });
    });

    describe('clearExistingTimeout', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).clearExistingTimeout();
            }).not.toThrow();
        });
    });

    describe('backToFirstScreen', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToFirstScreen();
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

    describe('removeTimeout', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).removeTimeout();
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

    describe('handleStopTransaction', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleStopTransaction();
            }).not.toThrow();
        });
    });

    describe('resetTransactionState', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).resetTransactionState();
            }).not.toThrow();
        });
    });

    describe('publishTimeoutMessage', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).publishTimeoutMessage();
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

    describe('handleSelectCV', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectCV();
            }).not.toThrow();
        });
    });

    describe('handleTransactionUpdate', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleTransactionUpdate({ timeout: 0 });
            }).not.toThrow();
        });
    });

    describe('handleConfirm', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirm();
            }).not.toThrow();
        });
    });

    describe('handleCancelConfirm', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleCancelConfirm();
            }).not.toThrow();
        });
    });

    describe('formatValue', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).formatValue();
            }).not.toThrow();
        });
    });

    describe('backToCVScreen', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToCVScreen();
            }).not.toThrow();
        });
    });

    describe('initMqttConfig', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).initMqttConfig();
            }).not.toThrow();
        });
    });

    describe('cleanupResources', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).cleanupResources();
            }).not.toThrow();
        });
    });

    describe('initTransactionSubscription', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).initTransactionSubscription();
            }).not.toThrow();
        });
    });

    describe('updateTransactionState', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).updateTransactionState();
            }).not.toThrow();
        });
    });

    describe('publishMqttMessage', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).publishMqttMessage();
            }).not.toThrow();
        });
    });

    describe('backToProgressScreen', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToProgressScreen();
            }).not.toThrow();
        });
    });
});
