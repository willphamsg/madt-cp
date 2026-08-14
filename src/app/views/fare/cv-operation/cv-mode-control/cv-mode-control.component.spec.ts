import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CVModeControlComponent } from './cv-mode-control.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CVModeControlComponent', () => {
    let component: CVModeControlComponent;
    let fixture: ComponentFixture<CVModeControlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CVModeControlComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CVModeControlComponent);
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

    describe('backToCvOperation', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToCvOperation();
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

    describe('handleButtonSound', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleButtonSound();
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

    describe('handleRetainMessages', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleRetainMessages();
            }).not.toThrow();
        });
    });

    describe('handleSelectStatus', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleSelectStatus();
            }).not.toThrow();
        });
    });
});
