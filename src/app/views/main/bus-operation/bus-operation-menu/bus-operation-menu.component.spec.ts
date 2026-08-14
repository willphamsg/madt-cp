import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusOperationMenuComponent } from './bus-operation-menu.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';

describe('BusOperationMenuComponent', () => {
    let component: BusOperationMenuComponent;
    let fixture: ComponentFixture<BusOperationMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BusOperationMenuComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BusOperationMenuComponent);
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

    it('should navigate to provided url in navigateTo', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.navigateTo(['/test']);
        expect(navigateSpy).toHaveBeenCalledWith(['/test']);
    });

    it('should hide popup if handleEndShift is false', () => {
        component.displayEndShiftPopup = true;
        component.handleEndShift(false);
        expect(component.displayEndShiftPopup).toBeFalse();
    });
});
