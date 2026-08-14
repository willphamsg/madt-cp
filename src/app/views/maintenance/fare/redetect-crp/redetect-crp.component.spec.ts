import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedetectCRPComponent } from './redetect-crp.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('RedetectCRPComponent', () => {
    let component: RedetectCRPComponent;
    let fixture: ComponentFixture<RedetectCRPComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), RedetectCRPComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(RedetectCRPComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize step to 1', () => {
        expect(component.step).toBe(1);
    });

    it('should initialize progress to 0', () => {
        expect(component.progress).toBe(0);
    });

    it('handleFinishTransaction should reset step to 1', () => {
        component.step = 3;
        component.handleFinishTransaction();
        expect(component.step).toBe(1);
    });
});
