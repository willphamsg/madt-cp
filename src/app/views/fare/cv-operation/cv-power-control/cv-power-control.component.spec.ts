import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CVPowerControlComponent } from './cv-power-control.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CVPowerControlComponent', () => {
    let component: CVPowerControlComponent;
    let fixture: ComponentFixture<CVPowerControlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CVPowerControlComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CVPowerControlComponent);
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

    describe('handleBack', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleBack();
            }).not.toThrow();
        });
    });

    describe('handleToggleStatus', () => {
        it('should execute without errors', () => {
            component.cvPowerControl = { groups: [{ id: 1, status: false } as any] };
            expect(() => {
                (component as any).handleToggleStatus(1);
            }).not.toThrow();
        });
    });
});
