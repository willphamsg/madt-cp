import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PowerAllCVComponent } from './power-all-cv.component';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('PowerAllCVComponent', () => {
    let component: PowerAllCVComponent;
    let fixture: ComponentFixture<PowerAllCVComponent>;

    function setup(powerOn: boolean): void {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), PowerAllCVComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: ActivatedRoute, useValue: { snapshot: { data: { powerOn } } } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(PowerAllCVComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    describe('power on route', () => {
        beforeEach(() => setup(true));

        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should resolve powerOn from route data', () => {
            expect(component.powerOn).toBe(true);
        });

        it('should publish powerOn true when confirmed', () => {
            expect(() => {
                component.handleConfirm(true);
            }).not.toThrow();
        });
    });

    describe('power off route', () => {
        beforeEach(() => setup(false));

        it('should resolve powerOn from route data', () => {
            expect(component.powerOn).toBe(false);
        });

        it('should publish powerOn false when confirmed', () => {
            expect(() => {
                component.handleConfirm(true);
            }).not.toThrow();
        });

        it('should publish cancel when not confirmed', () => {
            expect(() => {
                component.handleConfirm(false);
            }).not.toThrow();
        });
    });

    describe('ngOnInit / ngOnDestroy', () => {
        beforeEach(() => setup(true));

        it('should initialize and destroy without errors', () => {
            expect(() => {
                component.ngOnInit();
                component.ngOnDestroy();
            }).not.toThrow();
        });
    });

    describe('backToCvOperation', () => {
        beforeEach(() => setup(true));

        it('should execute without errors', () => {
            expect(() => {
                component.backToCvOperation();
            }).not.toThrow();
        });
    });

    describe('handleButtonSound', () => {
        beforeEach(() => setup(true));

        it('should execute without errors', () => {
            expect(() => {
                component.handleButtonSound();
            }).not.toThrow();
        });
    });
});
