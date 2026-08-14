import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { DEFAULT_TIMEOUT } from '@models';

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;
    let mockElementRef: any;

    beforeEach(async () => {
        mockElementRef = {
            nativeElement: {
                remove: jasmine.createSpy('remove'),
            },
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ConfirmDialogComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: ElementRef, useValue: mockElementRef },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        // Do not call detectChanges so we can test ngAfterContentInit manually
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('handleClick', () => {
        it('should emit cancel for cancel type', () => {
            const emitSpy = spyOn(component.cancel, 'emit');
            component.handleClick('cancel');
            expect(emitSpy).toHaveBeenCalledWith('cancel');
        });

        it('should emit confirm for confirm type', () => {
            const emitSpy = spyOn(component.confirm, 'emit');
            component.handleClick('confirm');
            expect(emitSpy).toHaveBeenCalledWith('confirm');
        });

        it('should emit ok for ok type', () => {
            const emitSpy = spyOn(component.ok, 'emit');
            component.handleClick('ok');
            expect(emitSpy).toHaveBeenCalledWith('ok');
        });

        it('should not emit for unknown type', () => {
            const cancelSpy = spyOn(component.cancel, 'emit');
            const confirmSpy = spyOn(component.confirm, 'emit');
            const okSpy = spyOn(component.ok, 'emit');

            component.handleClick('unknown');

            expect(cancelSpy).not.toHaveBeenCalled();
            expect(confirmSpy).not.toHaveBeenCalled();
            expect(okSpy).not.toHaveBeenCalled();
        });
    });

    describe('ngAfterContentInit', () => {
        it('should emit ok after DEFAULT_TIMEOUT if btnOK is true', fakeAsync(() => {
            component.btnOK = true;
            const okSpy = spyOn(component.ok, 'emit');

            component.ngAfterContentInit();

            expect(okSpy).not.toHaveBeenCalled();

            tick(DEFAULT_TIMEOUT);
            expect(okSpy).toHaveBeenCalledWith('ok');
        }));

        it('should not setup timeout if btnOK is false', fakeAsync(() => {
            component.btnOK = false;
            const okSpy = spyOn(component.ok, 'emit');

            component.ngAfterContentInit();

            tick(DEFAULT_TIMEOUT);
            expect(okSpy).not.toHaveBeenCalled();
        }));
    });
});
