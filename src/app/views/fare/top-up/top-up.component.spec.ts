import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopUpComponent } from './top-up.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('TopUpComponent', () => {
    let component: TopUpComponent;
    let fixture: ComponentFixture<TopUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), TopUpComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TopUpComponent);
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

    describe('handleConfirmTopUp', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirmTopUp();
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

    describe('handleBack', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleBack();
            }).not.toThrow();
        });
    });

    describe('backToFare', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToFare();
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

    describe('resetTopUp', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).resetTopUp();
            }).not.toThrow();
        });
    });

    describe('handleFareBox', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleFareBox();
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

    describe('handleCancel', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleCancel();
            }).not.toThrow();
        });
    });

    describe('handleSelectAmt', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectAmt();
            }).not.toThrow();
        });
    });
});
