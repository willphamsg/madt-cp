import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareConsoleLayoutComponent } from './layout.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('FareConsoleLayoutComponent', () => {
    let component: FareConsoleLayoutComponent;
    let fixture: ComponentFixture<FareConsoleLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareConsoleLayoutComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FareConsoleLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('validateFareConsoleForm should return false when all fields are empty/zero', () => {
        component.fareConsoleSetting = {
            deckType: { id: 0, label: '' },
            blsStatus: 0,
            busId: '',
            date: '',
            time: '',
            complimentaryDays: 0,
            message: '',
        };
        expect(component.validateFareConsoleForm()).toBeFalse();
    });

    it('fareConsoleSetting should be initialized with default values', () => {
        const localComponent = TestBed.createComponent(FareConsoleLayoutComponent).componentInstance;
        expect(localComponent.fareConsoleSetting.deckType.id).toBe(0);
        expect(localComponent.fareConsoleSetting.blsStatus).toBe(0);
        expect(localComponent.fareConsoleSetting.busId).toBe('');
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });
});
