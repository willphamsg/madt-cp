import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class AutoDisableBlsComponent implements OnDestroy, OnInit {
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
