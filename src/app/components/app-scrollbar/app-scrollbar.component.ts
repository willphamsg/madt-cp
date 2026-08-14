import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const SCROLL_STEP_PX = 150;
const MIN_THUMB_SIZE_PX = 30;
const DRAG_THRESHOLD_PX = 8;
const MOMENTUM_MIN_VELOCITY = 0.02; // px/ms
const MOMENTUM_FRICTION = 0.95;

@Component({
    selector: 'app-scrollbar',
    imports: [],
    templateUrl: './app-scrollbar.component.html',
    styleUrls: ['./app-scrollbar.component.scss'],
})
export class AppScrollBar implements AfterViewInit, OnChanges, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private resizeObserver?: ResizeObserver;
    private momentumFrameId?: number;

    // Thumb dragging (mouse/touch/pen on the track handle)
    private isThumbDragging = false;
    private thumbDragStartY = 0;
    private thumbDragStartScrollTop = 0;

    // Manual content panning. The app shell sets `touch-action: none` globally (to lock down
    // pinch-zoom/pull-to-refresh on the kiosk), and a descendant can't widen that back with
    // `pan-y` - ancestors only ever narrow the browser's native touch handling, never re-enable
    // it. So native touch-scrolling of the viewport can't be relied on here; scrolling is driven
    // manually from raw pointer deltas instead, same as the thumb.
    private isPanning = false;
    private panMoved = false;
    private panPointerId: number | null = null;
    private panStartY = 0;
    private panStartScrollTop = 0;
    private panLastY = 0;
    private panLastTime = 0;
    private panVelocity = 0;

    @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;
    @ViewChild('content', { static: true }) contentRef!: ElementRef<HTMLDivElement>;
    @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLDivElement>;
    @ViewChild('thumb', { static: true }) thumbRef!: ElementRef<HTMLDivElement>;

    @Input() isScrollTop?: boolean = false;

    showScrollbar = false;

    constructor(private readonly ngZone: NgZone) {}

    ngOnChanges(): void {
        if (this.isScrollTop) {
            this.viewportRef?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    ngAfterViewInit(): void {
        const viewport = this.viewportRef.nativeElement;
        const thumb = this.thumbRef.nativeElement;

        // `scroll` fires on every frame during a drag/momentum fling (including from our own
        // manual scrollTop writes), and pointer dragging fires at high frequency too. Both are
        // kept off the Angular zone so a large, heavily-bound list doesn't get a full
        // change-detection sweep on every one of those events - updateThumb() re-enters the zone
        // itself, only when `showScrollbar` actually changes.
        this.ngZone.runOutsideAngular(() => {
            fromEvent(viewport, 'scroll')
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => this.updateThumb());

            this.resizeObserver = new ResizeObserver(() => this.updateThumb());
            this.resizeObserver.observe(viewport);
            this.resizeObserver.observe(this.contentRef.nativeElement);

            thumb.addEventListener('pointerdown', (event) => this.onThumbPointerDown(event));
            thumb.addEventListener('pointermove', (event) => this.onThumbPointerMove(event));
            thumb.addEventListener('pointerup', (event) => this.onThumbPointerUp(event));
            thumb.addEventListener('pointercancel', (event) => this.onThumbPointerUp(event));

            viewport.addEventListener('pointerdown', (event) => this.onViewportPointerDown(event));
            viewport.addEventListener('pointermove', (event) => this.onViewportPointerMove(event));
            viewport.addEventListener('pointerup', (event) => this.onViewportPointerUp(event));
            viewport.addEventListener('pointercancel', (event) => this.onViewportPointerUp(event));
            // A drag that crossed the threshold shouldn't also fire a click on whatever list item
            // the pointer happened to lift over; swallow that one synthetic click in the capture
            // phase, before it reaches any row-level click handler in the projected content.
            viewport.addEventListener(
                'click',
                (event) => {
                    if (this.panMoved) {
                        event.stopPropagation();
                        event.preventDefault();
                        this.panMoved = false;
                    }
                },
                { capture: true },
            );
        });

        // Deferred to a microtask: `showScrollbar` drives a template class binding, and mutating
        // it synchronously within ngAfterViewInit (still part of the initial change-detection
        // pass) trips Angular's ExpressionChangedAfterItHasBeenCheckedError in dev mode.
        queueMicrotask(() => this.updateThumb());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.resizeObserver?.disconnect();
        this.cancelMomentum();
    }

    scrollByStep(direction: 1 | -1): void {
        this.viewportRef?.nativeElement.scrollBy({ top: direction * SCROLL_STEP_PX, behavior: 'smooth' });
    }

    private onThumbPointerDown(event: PointerEvent): void {
        this.isThumbDragging = true;
        this.thumbDragStartY = event.clientY;
        this.thumbDragStartScrollTop = this.viewportRef.nativeElement.scrollTop;
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        event.preventDefault();
    }

    private onThumbPointerMove(event: PointerEvent): void {
        if (!this.isThumbDragging) {
            return;
        }

        const viewport = this.viewportRef.nativeElement;
        const track = this.trackRef.nativeElement;
        const thumb = this.thumbRef.nativeElement;

        const maxThumbTravel = track.clientHeight - thumb.offsetHeight;
        if (maxThumbTravel <= 0) {
            return;
        }

        const scrollableHeight = viewport.scrollHeight - viewport.clientHeight;
        const deltaY = event.clientY - this.thumbDragStartY;

        viewport.scrollTop = this.thumbDragStartScrollTop + deltaY * (scrollableHeight / maxThumbTravel);
    }

    private onThumbPointerUp(event: PointerEvent): void {
        this.isThumbDragging = false;
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    }

    private onViewportPointerDown(event: PointerEvent): void {
        // Mouse users already have wheel scrolling; manual panning is only needed to stand in for
        // native touch/pen gesture handling.
        if (event.pointerType === 'mouse') {
            return;
        }

        this.cancelMomentum();

        this.isPanning = true;
        this.panMoved = false;
        this.panPointerId = event.pointerId;
        this.panStartY = event.clientY;
        this.panStartScrollTop = this.viewportRef.nativeElement.scrollTop;
        this.panLastY = event.clientY;
        this.panLastTime = performance.now();
        this.panVelocity = 0;
    }

    private onViewportPointerMove(event: PointerEvent): void {
        if (!this.isPanning || event.pointerId !== this.panPointerId) {
            return;
        }

        const deltaY = event.clientY - this.panStartY;
        if (!this.panMoved && Math.abs(deltaY) < DRAG_THRESHOLD_PX) {
            return;
        }
        this.panMoved = true;

        this.viewportRef.nativeElement.scrollTop = this.panStartScrollTop - deltaY;

        const now = performance.now();
        const elapsed = now - this.panLastTime;
        if (elapsed > 0) {
            this.panVelocity = (this.panLastY - event.clientY) / elapsed;
        }
        this.panLastY = event.clientY;
        this.panLastTime = now;
    }

    private onViewportPointerUp(event: PointerEvent): void {
        if (event.pointerId !== this.panPointerId) {
            return;
        }

        this.isPanning = false;
        this.panPointerId = null;

        if (this.panMoved && Math.abs(this.panVelocity) > MOMENTUM_MIN_VELOCITY) {
            this.startMomentum();
        }
    }

    private startMomentum(): void {
        const viewport = this.viewportRef.nativeElement;

        const step = () => {
            this.panVelocity *= MOMENTUM_FRICTION;
            viewport.scrollTop += this.panVelocity * 16;

            if (Math.abs(this.panVelocity) < MOMENTUM_MIN_VELOCITY) {
                this.momentumFrameId = undefined;
                return;
            }
            this.momentumFrameId = requestAnimationFrame(step);
        };

        this.momentumFrameId = requestAnimationFrame(step);
    }

    private cancelMomentum(): void {
        if (this.momentumFrameId !== undefined) {
            cancelAnimationFrame(this.momentumFrameId);
            this.momentumFrameId = undefined;
        }
    }

    private updateThumb(): void {
        const viewport = this.viewportRef?.nativeElement;
        const track = this.trackRef?.nativeElement;
        const thumb = this.thumbRef?.nativeElement;
        if (!viewport || !track || !thumb) {
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const shouldShowScrollbar = scrollHeight - clientHeight > 1;
        if (shouldShowScrollbar !== this.showScrollbar) {
            // Only re-enter the zone (and trigger change detection) when the template-bound flag
            // actually flips - not on every scroll/resize tick.
            this.ngZone.run(() => (this.showScrollbar = shouldShowScrollbar));
        }

        if (!shouldShowScrollbar) {
            return;
        }

        const trackHeight = track.clientHeight;
        const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_SIZE_PX);
        const maxThumbTravel = trackHeight - thumbHeight;
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${scrollRatio * maxThumbTravel}px)`;
    }
}
