import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareBusStopMode } from './fare-bus-stop-mode.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('FareBusStopMode', () => {
    let component: FareBusStopMode;
    let fixture: ComponentFixture<FareBusStopMode>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareBusStopMode],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(FareBusStopMode);
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

    describe('handleConfirmFareBusStopMode', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirmFareBusStopMode();
            }).not.toThrow();
        });
    });

    describe('backSelectMode', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backSelectMode();
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

    describe('mappingPosnStatus', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).mappingPosnStatus();
            }).not.toThrow();
        });
    });

    describe('handleSelectFareBusStopMode', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectFareBusStopMode();
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

    describe('handleCancel', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleCancel();
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
});
