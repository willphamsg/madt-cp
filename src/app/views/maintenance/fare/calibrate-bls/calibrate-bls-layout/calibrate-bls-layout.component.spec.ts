import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalibrateBLSLayoutComponent } from './calibrate-bls-layout.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CalibrateBLSLayoutComponent', () => {
    let component: CalibrateBLSLayoutComponent;
    let fixture: ComponentFixture<CalibrateBLSLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CalibrateBLSLayoutComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CalibrateBLSLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should be an instance of CalibrateBLSLayoutComponent', () => {
        expect(component instanceof CalibrateBLSLayoutComponent).toBeTrue();
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });
});
