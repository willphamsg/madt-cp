import { AfterContentInit, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
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
export class ConfirmDialogComponent implements AfterContentInit {
    @Input() title?: string;
    @Input() content?: string;
    @Input() btnConfirm?: boolean;
    @Input() btnCancel?: boolean;
    @Input() btnOK?: boolean;
    @Input() style?: string;
    @Output() cancelled: EventEmitter<string> = new EventEmitter<string>();
    @Output() confirm: EventEmitter<string> = new EventEmitter<string>();
    @Output() ok: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private readonly soundService: SoundService,
        private readonly ele: ElementRef,
    ) {}

    handleClick(type: string) {
        switch (type) {
            case 'cancel':
                this.cancelled.emit(type);
                break;
            case 'confirm':
                this.confirm.emit(type);
                break;
            case 'ok':
                this.ok.emit(type);
                break;
            default:
                break;
        }
    }

    ngAfterContentInit() {
        if (this.btnOK) {
            window.setTimeout(() => {
                this.ok.emit('ok');
                // this.ele.nativeElement.remove();
            }, DEFAULT_TIMEOUT);
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
