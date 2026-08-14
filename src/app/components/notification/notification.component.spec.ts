import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Notification } from './notification.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { DEFAULT_NOTIFICATION_TIMEOUT } from '@models';

describe('NotificationComponent', () => {
    let component: Notification;
    let fixture: ComponentFixture<Notification>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), Notification],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(Notification);
        component = fixture.componentInstance;
        // Don't detectChanges here to test ngAfterContentInit manually
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

    describe('ngAfterContentInit', () => {
        it('should emit ok after DEFAULT_NOTIFICATION_TIMEOUT if ok is defined', fakeAsync(() => {
            const okSpy = spyOn(component.ok, 'emit');

            component.ngAfterContentInit();

            expect(okSpy).not.toHaveBeenCalled();

            tick(DEFAULT_NOTIFICATION_TIMEOUT);

            expect(okSpy).toHaveBeenCalled();
        }));
    });

    describe('ngOnDestroy', () => {
        it('should emit and complete destroy$ subject', () => {
            const nextSpy = spyOn((component as any).destroy$, 'next');
            const completeSpy = spyOn((component as any).destroy$, 'complete');

            component.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });
});
