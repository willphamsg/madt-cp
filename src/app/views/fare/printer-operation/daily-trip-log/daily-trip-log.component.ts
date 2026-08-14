import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '@components/confirm-dialog/confirm-dialog.component';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'daily-trip-log',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, ConfirmDialogComponent, CustomKeyboardComponent],
    templateUrl: './daily-trip-log.component.html',
    styleUrls: ['./daily-trip-log.component.scss'],
})
export class DailyTripLogComponent {
    success: boolean = true;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
    ) {}

    goBack() {
        this.router.navigate(['/ticketing/device-operation/printer']);
    }

    handlePrint() {
        // No MsgID is defined yet for this print action; placeholder until the backend request is specified.
        console.warn('DailyTripLogComponent: print not yet implemented');
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
