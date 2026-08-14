import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class FareBusStopLocationMode implements OnDestroy, OnInit {
    @Input() disabled?: boolean = false;
    @Input() fullScreen?: boolean = false;
    @Output() onOk: EventEmitter<string> = new EventEmitter<string>();
    @Output() onCancel: EventEmitter<string> = new EventEmitter<string>();

    constructor(private soundService: SoundService) {}

    ngOnInit() {}

    handleConfirm() {
        this.onOk.emit();
    }

    handleCancel() {
        this.onCancel.emit();
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
