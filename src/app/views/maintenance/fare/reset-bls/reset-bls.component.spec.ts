import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetBLSComponent } from './reset-bls.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('ResetBLSComponent', () => {
    let component: ResetBLSComponent;
    let fixture: ComponentFixture<ResetBLSComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ResetBLSComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ResetBLSComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize step to 1', () => {
        expect(component.step).toBe(1);
    });

    it('handleSelect should set step to 2', () => {
        component.handleSelect();
        expect(component.step).toBe(2);
    });

    it('handleFinish should reset step to 1', () => {
        component.step = 2;
        component.handleFinish();
        expect(component.step).toBe(1);
    });
});
