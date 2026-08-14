import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CJBPlateNumberComponent } from './cjb-plate-number.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { DEFAULT_TIMEOUT } from '@models';

describe('CJBPlateNumberComponent', () => {
    let component: CJBPlateNumberComponent;
    let fixture: ComponentFixture<CJBPlateNumberComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CJBPlateNumberComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CJBPlateNumberComponent);
        component = fixture.componentInstance;
        // Do not call detectChanges so we can test ngOnInit manually
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('handleClick', () => {
        it('should emit ok event', () => {
            const emitSpy = spyOn(component.ok, 'emit');
            component.handleClick();
            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('ngOnInit', () => {
        it('should clear old timeout and set a new timeout that calls handleClick after DEFAULT_TIMEOUT', fakeAsync(() => {
            const handleSpy = spyOn(component, 'handleClick');

            // Assign some mock timeout
            component.intervalId = setTimeout(() => {}, 100000) as any;

            component.ngOnInit();

            // Ensure timeout has not fired immediately
            expect(handleSpy).not.toHaveBeenCalled();

            tick(DEFAULT_TIMEOUT - 1);
            expect(handleSpy).not.toHaveBeenCalled();

            tick(1);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('ngOnDestroy', () => {
        it('should clear intervalId on destroy', fakeAsync(() => {
            const handleSpy = spyOn(component, 'handleClick');

            component.ngOnInit();
            component.ngOnDestroy();

            // Advance time, since the timeout was cleared, it should not call handleClick
            tick(DEFAULT_TIMEOUT);
            expect(handleSpy).not.toHaveBeenCalled();
        }));
    });
});
