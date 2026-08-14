import { Component, Output, EventEmitter, Input } from '@angular/core';
import { StrNum } from '@models';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'app-custom-radio-button',
    imports: [],
    templateUrl: './custom-radio-button.component.html',
    styleUrl: './custom-radio-button.component.scss',
})
export class CustomRadioButtonComponent {
    constructor(private soundService: SoundService) {}

    @Output() onSelect = new EventEmitter<StrNum>();
    @Input() value!: StrNum;
    @Input() label!: StrNum;
    @Input() isSelected!: boolean;

    onClickHandler(e: string | number) {
        this.onSelect.emit(e);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
