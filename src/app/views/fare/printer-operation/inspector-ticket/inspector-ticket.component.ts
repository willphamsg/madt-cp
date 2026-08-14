import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '@components/confirm-dialog/confirm-dialog.component';
import { CustomKeyboardComponent } from '@components/custom-keyboard/custom-keyboard.component';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'inspector-ticket',
    imports: [MatIconModule, RouterModule, ReactiveFormsModule, ConfirmDialogComponent, CustomKeyboardComponent],
    templateUrl: './inspector-ticket.component.html',
    styleUrls: ['./inspector-ticket.component.scss'],
})
export class InspectorTicketComponent implements OnInit {
    success: boolean = true;

    constructor(
        private soundService: SoundService,
        private router: Router,
    ) {}

    ngOnInit() {}

    goBack() {
        this.router.navigate(['/ticketing/device-operation/printer']);
    }

    handlePrint() {}

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
