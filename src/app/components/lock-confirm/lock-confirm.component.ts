import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'lock-pop-up',
    imports: [CommonModule, TranslateModule],
    templateUrl: './lock-confirm.component.html',
    styleUrl: './lock-confirm.component.scss',
})
export class LockConfirmPopUp {
    @Input() disabled?: boolean = false;
    @Input() mqttTopic: string = '';
    @Input() fullScreen?: boolean = false;
    @Output() confirm: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancel: EventEmitter<string> = new EventEmitter<string>();

    constructor(private readonly soundService: SoundService) {}

    handleConfirm() {
        this.confirm.emit();
    }

    handleCancel() {
        this.cancel.emit();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
