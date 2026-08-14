import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppScrollBar } from './app-scrollbar.component';

describe('AppScrollBar', () => {
    let component: AppScrollBar;
    let fixture: ComponentFixture<AppScrollBar>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppScrollBar],
        }).compileComponents();

        fixture = TestBed.createComponent(AppScrollBar);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnChanges', () => {
        it('should scroll the viewport to top if isScrollTop is true', () => {
            const scrollToSpy = spyOn(component.viewportRef.nativeElement, 'scrollTo') as jasmine.Spy;

            component.isScrollTop = true;
            component.ngOnChanges();

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        });

        it('should not scroll if isScrollTop is false', () => {
            const scrollToSpy = spyOn(component.viewportRef.nativeElement, 'scrollTo') as jasmine.Spy;

            component.isScrollTop = false;
            component.ngOnChanges();

            expect(scrollToSpy).not.toHaveBeenCalled();
        });
    });

    describe('scrollByStep', () => {
        it('should scroll the viewport down by a positive step', () => {
            const scrollBySpy = spyOn(component.viewportRef.nativeElement, 'scrollBy') as jasmine.Spy;

            component.scrollByStep(1);

            expect(scrollBySpy).toHaveBeenCalledWith({ top: 150, behavior: 'smooth' });
        });

        it('should scroll the viewport up by a negative step', () => {
            const scrollBySpy = spyOn(component.viewportRef.nativeElement, 'scrollBy') as jasmine.Spy;

            component.scrollByStep(-1);

            expect(scrollBySpy).toHaveBeenCalledWith({ top: -150, behavior: 'smooth' });
        });
    });

    describe('thumb dragging', () => {
        it('should move the viewport scrollTop while dragging the thumb', () => {
            Object.defineProperty(component.viewportRef.nativeElement, 'scrollHeight', {
                value: 400,
                configurable: true,
            });
            Object.defineProperty(component.viewportRef.nativeElement, 'clientHeight', {
                value: 100,
                configurable: true,
            });
            Object.defineProperty(component.trackRef.nativeElement, 'clientHeight', { value: 100, configurable: true });
            Object.defineProperty(component.thumbRef.nativeElement, 'offsetHeight', { value: 20, configurable: true });
            Object.defineProperty(component.viewportRef.nativeElement, 'scrollTop', {
                value: 0,
                writable: true,
                configurable: true,
            });

            const target = {
                setPointerCapture: jasmine.createSpy('setPointerCapture'),
                releasePointerCapture: jasmine.createSpy('releasePointerCapture'),
            };

            (component as any).onThumbPointerDown({
                clientY: 0,
                pointerId: 1,
                currentTarget: target,
                preventDefault: () => {},
            } as unknown as PointerEvent);
            expect(target.setPointerCapture).toHaveBeenCalledWith(1);

            (component as any).onThumbPointerMove({ clientY: 40 } as PointerEvent);
            expect(component.viewportRef.nativeElement.scrollTop).toBeGreaterThan(0);

            (component as any).onThumbPointerUp({ pointerId: 1, currentTarget: target } as unknown as PointerEvent);
            expect(target.releasePointerCapture).toHaveBeenCalledWith(1);
        });

        it('should do nothing when moving without dragging', () => {
            component.viewportRef.nativeElement.scrollTop = 0;

            (component as any).onThumbPointerMove({ clientY: 40 } as PointerEvent);

            expect(component.viewportRef.nativeElement.scrollTop).toBe(0);
        });
    });

    describe('viewport panning', () => {
        it('should ignore mouse pointers, since they already have native wheel scrolling', () => {
            (component as any).onViewportPointerDown({
                pointerType: 'mouse',
                pointerId: 1,
                clientY: 0,
            } as PointerEvent);

            expect((component as any).isPanning).toBeFalse();
        });

        it('should not move the viewport until the drag threshold is crossed, so taps still register as clicks', () => {
            Object.defineProperty(component.viewportRef.nativeElement, 'scrollTop', {
                value: 100,
                writable: true,
                configurable: true,
            });

            (component as any).onViewportPointerDown({
                pointerType: 'touch',
                pointerId: 1,
                clientY: 0,
            } as PointerEvent);
            (component as any).onViewportPointerMove({
                pointerType: 'touch',
                pointerId: 1,
                clientY: 3,
            } as PointerEvent);

            expect((component as any).panMoved).toBeFalse();
            expect(component.viewportRef.nativeElement.scrollTop).toBe(100);
        });

        it('should move the viewport once the drag threshold is crossed', () => {
            Object.defineProperty(component.viewportRef.nativeElement, 'scrollTop', {
                value: 100,
                writable: true,
                configurable: true,
            });

            (component as any).onViewportPointerDown({
                pointerType: 'touch',
                pointerId: 1,
                clientY: 0,
            } as PointerEvent);
            (component as any).onViewportPointerMove({
                pointerType: 'touch',
                pointerId: 1,
                clientY: -20,
            } as PointerEvent);

            expect((component as any).panMoved).toBeTrue();
            expect(component.viewportRef.nativeElement.scrollTop).toBe(120);
        });

        it('should swallow the synthetic click that follows a drag', () => {
            const viewport = component.viewportRef.nativeElement;
            Object.defineProperty(viewport, 'scrollTop', { value: 0, writable: true, configurable: true });

            (component as any).onViewportPointerDown({
                pointerType: 'touch',
                pointerId: 1,
                clientY: 0,
            } as PointerEvent);
            (component as any).onViewportPointerMove({
                pointerType: 'touch',
                pointerId: 1,
                clientY: -20,
            } as PointerEvent);
            // Isolate this test to click-suppression: force momentum's velocity check to skip, so no
            // requestAnimationFrame loop is left running once the test finishes.
            (component as any).panVelocity = 0;
            (component as any).onViewportPointerUp({ pointerId: 1 } as PointerEvent);

            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            const stopPropagationSpy = spyOn(clickEvent, 'stopPropagation');
            const preventDefaultSpy = spyOn(clickEvent, 'preventDefault');

            viewport.dispatchEvent(clickEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('should not interfere with a plain tap (no movement)', () => {
            (component as any).onViewportPointerDown({
                pointerType: 'touch',
                pointerId: 1,
                clientY: 0,
            } as PointerEvent);
            (component as any).onViewportPointerUp({ pointerId: 1 } as PointerEvent);

            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            const stopPropagationSpy = spyOn(clickEvent, 'stopPropagation');

            component.viewportRef.nativeElement.dispatchEvent(clickEvent);

            expect(stopPropagationSpy).not.toHaveBeenCalled();
        });
    });

    describe('showScrollbar', () => {
        it('should show the scrollbar when content overflows the viewport', () => {
            Object.defineProperty(component.viewportRef.nativeElement, 'scrollHeight', {
                value: 400,
                configurable: true,
            });
            Object.defineProperty(component.viewportRef.nativeElement, 'clientHeight', {
                value: 100,
                configurable: true,
            });

            component.viewportRef.nativeElement.dispatchEvent(new Event('scroll'));

            expect(component.showScrollbar).toBeTrue();
        });

        it('should hide the scrollbar when content fits the viewport', () => {
            Object.defineProperty(component.viewportRef.nativeElement, 'scrollHeight', {
                value: 100,
                configurable: true,
            });
            Object.defineProperty(component.viewportRef.nativeElement, 'clientHeight', {
                value: 100,
                configurable: true,
            });

            component.viewportRef.nativeElement.dispatchEvent(new Event('scroll'));

            expect(component.showScrollbar).toBeFalse();
        });
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
