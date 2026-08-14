import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '@components/confirm-dialog/confirm-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'reset-bls',
    imports: [MatIconModule, RouterModule, ConfirmDialogComponent, TranslateModule],
    templateUrl: './reset-bls.component.html',
    styleUrls: ['./reset-bls.component.scss'],
})
export class ResetBLSComponent implements OnInit {
    step: number;

    constructor(private soundService: SoundService) {
        this.step = 1;
    }

    ngOnInit() {}

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
