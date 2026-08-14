import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyTripLogComponent } from './daily-trip-log.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('DailyTripLogComponent', () => {
    let component: DailyTripLogComponent;
    let fixture: ComponentFixture<DailyTripLogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DailyTripLogComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DailyTripLogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('goBack', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).goBack();
            }).not.toThrow();
        });
    });

    describe('handlePrint', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handlePrint();
            }).not.toThrow();
        });
    });
});
