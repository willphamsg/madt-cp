import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';

type Layout = 'numeric' | 'text';
@Component({
    selector: 'custom-keyboard',
    templateUrl: './custom-keyboard.component.html',
    styleUrls: ['./custom-keyboard.component.scss'],
    imports: [TranslateModule],
})
export class CustomKeyboardComponent {
    @Input() layout?: Layout;
    @Output() onKeyPress: EventEmitter<Event> = new EventEmitter<Event>();

    constructor(private soundService: SoundService) {}

    handleChangeInput(event: Event): void {
        const target = <HTMLDivElement>event.target;

        if (['switchKey1', 'switchKey2'].includes(target.id)) {
            this.layout = this.layout === 'numeric' ? 'text' : 'numeric';
            return;
        }

        this.onKeyPress.emit(event);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
