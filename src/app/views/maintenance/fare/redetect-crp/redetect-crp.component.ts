import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'redetect-crp',
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './redetect-crp.component.html',
    styleUrls: ['./redetect-crp.component.scss'],
})
export class RedetectCRPComponent implements OnInit {
    progress = 0;
    step = 1;

    constructor(private readonly soundService: SoundService) {}

    ngOnInit() {
        const interval = setInterval(() => {
            this.progress += 20;
            if (this.progress >= 100) {
                clearInterval(interval);
                this.step = 2;
            }
        }, 500);
    }

    handleSaveTransaction() {
        this.step = 2;
        const interval = setInterval(() => {
            this.progress += 5;
            if (this.progress >= 100) {
                clearInterval(interval);
                this.step = 3;
            }
        }, 500);
    }

    handleFinishTransaction() {
        this.step = 1;
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
