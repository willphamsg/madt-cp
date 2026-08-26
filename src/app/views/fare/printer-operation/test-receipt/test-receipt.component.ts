import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '@components/confirm-dialog/confirm-dialog.component';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'test-receipt',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, ConfirmDialogComponent, CustomKeyboardComponent],
    templateUrl: './test-receipt.component.html',
    styleUrls: ['./test-receipt.component.scss'],
})
export class TestReceiptComponent {
    success: boolean = true;

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
    ) {}

    // goBack() {
    //     this.router.navigate(['/ticketing/device-operation/printer']);
    // }

    handlePrint() {
        // Printer integration not yet implemented; button is wired for the upcoming print flow.
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
