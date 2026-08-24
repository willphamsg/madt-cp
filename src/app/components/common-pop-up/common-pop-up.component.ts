import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SoundService } from '@services/sound.service';
import { DEFAULT_TIMEOUT } from '@models';

export type PopUpType = 'success' | 'error' | 'warning' | 'info';

@Component({
    selector: 'common-pop-up',
    imports: [CommonModule, TranslateModule],
    templateUrl: './common-pop-up.component.html',
    styleUrl: './common-pop-up.component.scss',
})
export class CommonPopUp implements OnDestroy, OnInit, OnChanges {
    @Input() type: PopUpType = 'success';
    @Input() disabled?: boolean = false;
    @Input() title?: string = '';
    @Input() message?: string = '';
    @Input() fullScreen: boolean = false;
    @Input() disableSound: boolean = false;
    @Input() overrideAll: boolean = false;
    @Input() timeout?: number = DEFAULT_TIMEOUT;
    @Input() disableTimeout: boolean = false;
    @Output() ok: EventEmitter<string> = new EventEmitter<string>();
    @Output() confirm: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancelled: EventEmitter<string> = new EventEmitter<string>();

    @Input() isOk: boolean = false;
    @Input() isConfirm: boolean = false;
    @Input() isCancel: boolean = false;
    timeoutId;

    constructor(
        private readonly soundService: SoundService, // private store: Store<AppState> (if needed in future)
    ) {}

    ngOnInit() {
        if (this.isOk && !this.disableTimeout) {
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.handleOk();
            }, this.timeout || DEFAULT_TIMEOUT);
        }
    }

    ngOnChanges() {
        if (!this.disableSound) this.soundService.playPopUp();
    }

    handleConfirm() {
        this.confirm.emit();
    }

    handleCancel() {
        this.cancelled.emit();
    }

    handleOk() {
        this.ok.emit();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        clearTimeout(this.timeoutId); // Clear the timeout to prevent memory leaks
        // Emit to destroy all active subscriptions
    }
}
