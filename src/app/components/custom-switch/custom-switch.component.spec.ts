import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSwitchComponent } from './custom-switch.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CustomSwitchComponent', () => {
    let component: CustomSwitchComponent;
    let fixture: ComponentFixture<CustomSwitchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CustomSwitchComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CustomSwitchComponent);
        component = fixture.componentInstance;
        // Do not detectChanges here so we can test ngOnInit manually
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize innerChecked from checked input (true)', () => {
            component.checked = true;
            component.ngOnInit();
            expect(component.innerChecked).toBeTrue();
        });

        it('should initialize innerChecked from checked input (false)', () => {
            component.checked = false;
            component.ngOnInit();
            expect(component.innerChecked).toBeFalse();
        });

        it('should set innerChecked to false if checked is undefined', () => {
            component.checked = undefined;
            component.ngOnInit();
            expect(component.innerChecked).toBeFalse();
        });
    });

    describe('handleChangeSwitch', () => {
        it('should toggle innerChecked and emit onChange event', () => {
            const emitSpy = spyOn(component.toggled, 'emit');
            const event = {} as Event;

            component.innerChecked = false;
            component.handleChangeSwitch(event);

            expect(component.innerChecked).toBeTrue();
            expect(emitSpy).toHaveBeenCalledWith(event);

            // Toggle again
            component.handleChangeSwitch(event);
            expect(component.innerChecked).toBeFalse();
            expect(emitSpy).toHaveBeenCalledWith(event);
        });
    });
});
