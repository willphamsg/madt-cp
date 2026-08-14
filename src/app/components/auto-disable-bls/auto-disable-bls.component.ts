import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'auto-disable-bls',
    imports: [CommonModule, TranslateModule, NotificationSoundDirective],
    templateUrl: './auto-disable-bls.component.html',
    styleUrl: './auto-disable-bls.component.scss',
})
export class AutoDisableBlsComponent {
    @Input() disabled?: boolean = false;
    @Input() fullScreen?: boolean = false;
    @Output() ok: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancel: EventEmitter<string> = new EventEmitter<string>();

    constructor(private readonly soundService: SoundService) {}

    handleConfirm() {
        this.ok.emit();
    }

    handleCancel() {
        this.cancel.emit();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
