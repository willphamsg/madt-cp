import { Component, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { DEFAULT_TIMEOUT } from '@models';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';
@Component({
    selector: 'confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    imports: [MatButton, TranslateModule],
})
export class ConfirmDialogComponent {
    @Input() title?: string;
    @Input() content?: string;
    @Input() btnConfirm?: boolean;
    @Input() btnCancel?: boolean;
    @Input() btnOK?: boolean;
    @Input() style?: string;
    @Output() onCancel: EventEmitter<string> = new EventEmitter<string>();
    @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();
    @Output() onOK: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private soundService: SoundService,
        private ele: ElementRef,
    ) {}

    handleClick(type: string) {
        switch (type) {
            case 'cancel':
                this.onCancel.emit(type);
                break;
            case 'confirm':
                this.onConfirm.emit(type);
                break;
            case 'ok':
                this.onOK.emit(type);
                break;
            default:
                break;
        }
    }

    ngAfterContentInit() {
        if (this.btnOK) {
            window.setTimeout(() => {
                this.onOK.emit('ok');
                // this.ele.nativeElement.remove();
            }, DEFAULT_TIMEOUT);
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
