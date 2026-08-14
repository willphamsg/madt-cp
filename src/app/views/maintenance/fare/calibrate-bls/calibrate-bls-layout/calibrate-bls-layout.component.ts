import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'calibrate-bls-layout',
    imports: [MatIconModule, RouterModule, RouterOutlet],
    templateUrl: './calibrate-bls-layout.component.html',
    styleUrls: ['./calibrate-bls-layout.component.scss'],
})
export class CalibrateBLSLayoutComponent implements OnInit {
    constructor(
        private soundService: SoundService,
        private router: Router,
    ) {}

    ngOnInit() {}

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
