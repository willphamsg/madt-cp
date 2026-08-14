import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_TIMEOUT } from '@models';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'bus-off-route',
    imports: [CommonModule, TranslateModule, NotificationSoundDirective],
    templateUrl: './bus-off-route.component.html',
    styleUrl: './bus-off-route.component.scss',
})
export class BusOffRouteComponent implements OnDestroy, OnInit {
    @Input() disabled?: boolean = false;
    @Input() fullScreen?: boolean = false;
    @Output() onOk: EventEmitter<string> = new EventEmitter<string>();

    intervalId;

    constructor(private soundService: SoundService) {}

    ngOnInit() {
        clearTimeout(this.intervalId);
        this.intervalId = setTimeout(() => {
            this.handleClick();
        }, DEFAULT_TIMEOUT);
    }

    handleClick() {
        this.onOk.emit();
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        clearTimeout(this.intervalId);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
