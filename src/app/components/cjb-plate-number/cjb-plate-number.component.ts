import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_TIMEOUT } from '@models';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'cjb-plate-number',
    imports: [CommonModule, TranslateModule, NotificationSoundDirective],
    templateUrl: './cjb-plate-number.component.html',
    styleUrl: './cjb-plate-number.component.scss',
})
export class CJBPlateNumberComponent implements OnDestroy, OnInit {
    @Input() disabled?: boolean = false;
    @Input() fullScreen?: boolean = false;
    @Input() plateNumber?: string = '';
    @Output() ok: EventEmitter<string> = new EventEmitter<string>();

    intervalId;

    constructor(private readonly soundService: SoundService) {}

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
        // Emit to destroy all active subscriptions
        clearTimeout(this.intervalId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
