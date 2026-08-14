import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareBusStopMode } from './fare-bus-stop-mode.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('FareBusStopMode', () => {
    let component: FareBusStopMode;
    let fixture: ComponentFixture<FareBusStopMode>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareBusStopMode],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(FareBusStopMode);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize mode to 0', () => {
        expect(component.mode).toBe(0);
    });

    it('should initialize fareBusStopMode to empty object', () => {
        expect(component.fareBusStopMode).toEqual({});
    });

    it('handleSelectFareBusStopMode should update mode', () => {
        component.handleSelectFareBusStopMode(1);
        expect(component.mode).toBe(1);
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });
});
