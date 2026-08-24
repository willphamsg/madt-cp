import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DEFAULT_TIMEOUT } from '@models';
import { SoundService } from '@services/sound.service';

/**
 * Shared lifecycle for full-screen popups that auto-confirm (emit `ok`) after
 * `DEFAULT_TIMEOUT` unless dismissed sooner. Subclasses only need to add their
 * own `@Input()`s (and, if they don't auto-confirm via `ok`, override `handleClick`).
 *
 * Decorated with a selector-less `@Directive()` so Angular's DI can generate a
 * factory for the inherited `SoundService` constructor param; it is never
 * applied to a template directly.
 */
@Directive()
export abstract class AutoTimeoutPopupBase implements OnInit, OnDestroy {
    @Input() disabled?: boolean = false;
    @Input() fullScreen?: boolean = false;
    @Output() ok: EventEmitter<string> = new EventEmitter<string>();

    intervalId;

    constructor(protected readonly soundService: SoundService) {}

    ngOnInit() {
        clearTimeout(this.intervalId);
        this.intervalId = setTimeout(() => {
            this.handleClick();
        }, DEFAULT_TIMEOUT);
    }

    handleClick() {
        this.ok.emit();
    }

    ngOnDestroy() {
        clearTimeout(this.intervalId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
