import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeckTypeComponent } from './deck-type.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

describe('DeckTypeComponent', () => {
    let component: DeckTypeComponent;
    let fixture: ComponentFixture<DeckTypeComponent>;
    let router: Router;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DeckTypeComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DeckTypeComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize selectedDeckTypeId to 0', () => {
        expect(component.selectedDeckTypeId).toBe(0);
    });

    it('handleChangeDeckType should update selectedDeckTypeId', () => {
        component.handleChangeDeckType(2);
        expect(component.selectedDeckTypeId).toBe(2);
    });

    it('goBack should navigate to /maintenance/fare/fare-console', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('handleConfirmDeckType should do nothing when selectedDeckTypeId is 0', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.selectedDeckTypeId = 0;
        component.handleConfirmDeckType();
        expect(dispatchSpy).not.toHaveBeenCalled();
    });
});
