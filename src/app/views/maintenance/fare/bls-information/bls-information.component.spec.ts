import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BLSInformationComponent } from './bls-information.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('BLSInformationComponent', () => {
    let component: BLSInformationComponent;
    let fixture: ComponentFixture<BLSInformationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BLSInformationComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BLSInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize isLoading to true', () => {
        expect(component.isLoading).toBeTrue();
    });

    it('should initialize blsInformation with empty blsList', () => {
        expect(component.blsInformation.blsList).toEqual([]);
    });

    it('should initialize sort with ascending direction for name and value', () => {
        expect(component.sort['name']).toBe('asc');
        expect(component.sort['value']).toBe('asc');
    });

    it('handleSort should toggle sort direction from asc to desc', () => {
        component.sort['name'] = 'asc';
        component.handleSort('name');
        expect(component.sort['name']).toBe('desc');
    });

    it('handleSort should toggle sort direction from desc to asc', () => {
        component.sort['name'] = 'desc';
        component.handleSort('name');
        expect(component.sort['name']).toBe('asc');
    });
});
