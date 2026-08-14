import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedetectBLSComponent } from './redetect-bls.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('RedetectBLSComponent', () => {
    let component: RedetectBLSComponent;
    let fixture: ComponentFixture<RedetectBLSComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), RedetectBLSComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(RedetectBLSComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should be an instance of RedetectBLSComponent', () => {
        expect(component instanceof RedetectBLSComponent).toBeTrue();
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });
});
