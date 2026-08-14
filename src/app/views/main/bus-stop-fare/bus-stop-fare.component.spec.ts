import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusStopFareComponent } from './bus-stop-fare.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectBusStop, selectBusStopForFare } from '@app/store/main/main.reducer';
import { of } from 'rxjs';

describe('BusStopFareComponent', () => {
    let component: BusStopFareComponent;
    let fixture: ComponentFixture<BusStopFareComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BusStopFareComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BusStopFareComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize component without errors', () => {
        expect(() => {
            if ((component as any).ngOnInit) {
                (component as any).ngOnInit();
            }
        }).not.toThrow();
    });

    it('should navigate to main on backToMain', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.backToMain();
        expect(navigateSpy).toHaveBeenCalledWith(['/main']);
    });

    it('should handle update bus stop cancel', () => {
        const router = TestBed.inject(Router);
        const store = TestBed.inject(Store);
        const navigateSpy = spyOn(router, 'navigate');
        const dispatchSpy = spyOn(store, 'dispatch');
        component.handleUpdateBusStop('cancel');
        expect(navigateSpy).toHaveBeenCalledWith(['/main']);
        expect(dispatchSpy).toHaveBeenCalledWith(selectBusStop({ payload: null }));
    });

    it('should handle update bus stop confirm', () => {
        const router = TestBed.inject(Router);
        const store = TestBed.inject(Store);
        const navigateSpy = spyOn(router, 'navigate');
        const dispatchSpy = spyOn(store, 'dispatch');

        component.selectedBusStop$ = of({ Busid: 'test-id', Name: 'test-name' } as any);
        component.handleUpdateBusStop();

        expect(dispatchSpy).toHaveBeenCalledWith(selectBusStopForFare({ payload: 'test-id' }));
        expect(navigateSpy).toHaveBeenCalledWith(['/main']);
    });
});
