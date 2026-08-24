import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'fare-bus-stop-location-mode',
    imports: [CommonModule, TranslateModule, NotificationSoundDirective],
    templateUrl: './fare-bus-stop-location-mode.component.html',
    styleUrl: './fare-bus-stop-location-mode.component.scss',
})
export class FareBusStopLocationMode {
    @Input() disabled?: boolean = false;
    @Input() fullScreen?: boolean = false;
    @Output() ok: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancelled: EventEmitter<string> = new EventEmitter<string>();

    constructor(private readonly soundService: SoundService) {}

    handleConfirm() {
        this.ok.emit();
    }

    handleCancel() {
        this.cancelled.emit();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
