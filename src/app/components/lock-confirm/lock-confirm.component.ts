import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'lock-pop-up',
    imports: [CommonModule, TranslateModule],
    templateUrl: './lock-confirm.component.html',
    styleUrl: './lock-confirm.component.scss',
})
export class LockConfirmPopUp implements OnDestroy, OnInit {
    @Input() disabled?: boolean = false;
    @Input() mqttTopic: string = '';
    @Input() fullScreen?: boolean = false;
    @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();
    @Output() onCancel: EventEmitter<string> = new EventEmitter<string>();

    constructor(private soundService: SoundService) {}

    ngOnInit() {}

    handleConfirm() {
        this.onConfirm.emit();
    }

    handleCancel() {
        this.onCancel.emit();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
    }
}
