import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckPrinterComponent } from './check-printer.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CheckPrinterComponent', () => {
    let component: CheckPrinterComponent;
    let fixture: ComponentFixture<CheckPrinterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CheckPrinterComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CheckPrinterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should be an instance of CheckPrinterComponent', () => {
        expect(component instanceof CheckPrinterComponent).toBeTrue();
    });
});
