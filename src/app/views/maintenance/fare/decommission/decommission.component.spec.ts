import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Decommission } from './decommission.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('Decommission', () => {
    let component: Decommission;
    let fixture: ComponentFixture<Decommission>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), Decommission],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(Decommission);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize commissionError to null', () => {
        expect(component.commissionError).toBeNull();
    });

    it('should initialize decommission to empty object', () => {
        expect(component.decommission).toEqual({});
    });

    it('handleSubmit with empty value should set commissionError to INVALID_ENTRY', () => {
        component.handleSubmit('');
        expect(component.commissionError).toBe('INVALID_ENTRY');
    });

    it('handleSubmit with value longer than 6 chars should set commissionError to INVALID_ENTRY', () => {
        component.handleSubmit('1234567');
        expect(component.commissionError).toBe('INVALID_ENTRY');
    });

    it('handleClosePopup should set commissionError to null', () => {
        component.commissionError = 'INVALID_ENTRY';
        component.handleClosePopup();
        expect(component.commissionError).toBeNull();
    });
});
