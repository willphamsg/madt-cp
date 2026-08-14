import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomRadioButtonComponent } from './custom-radio-button.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CustomRadioButtonComponent', () => {
    let component: CustomRadioButtonComponent;
    let fixture: ComponentFixture<CustomRadioButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CustomRadioButtonComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CustomRadioButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('onClickHandler', () => {
        it('should emit select event with the provided value (string)', () => {
            const emitSpy = spyOn(component.select, 'emit');
            component.onClickHandler('test_value');
            expect(emitSpy).toHaveBeenCalledWith('test_value');
        });

        it('should emit select event with the provided value (number)', () => {
            const emitSpy = spyOn(component.select, 'emit');
            component.onClickHandler(12345);
            expect(emitSpy).toHaveBeenCalledWith(12345);
        });
    });
});
