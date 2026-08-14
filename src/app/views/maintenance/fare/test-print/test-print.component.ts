import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'test-print',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './test-print.component.html',
    styleUrls: ['./test-print.component.scss'],
})
export class TestPrintComponent {
    step: number;

    constructor(private readonly soundService: SoundService) {
        this.step = 1;
    }

    handleSelect() {
        this.step = 2;
    }

    handleFinish() {
        this.step = 1;
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
