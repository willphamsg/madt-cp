import { Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { Subject } from 'rxjs';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'ignition-off',
    imports: [CommonModule, TranslateModule, NotificationSoundDirective],
    templateUrl: './ignition-off.component.html',
    styleUrl: './ignition-off.component.scss',
})
export class IgnitionOffComponent implements OnDestroy, OnInit {
    private destroy$ = new Subject<void>();
    @Input() time?: string = '';
    @Input() delay?: string | number = '';
    @Input() disabled?: boolean = false;
    @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private soundService: SoundService,
        private router: Router,
        private store: Store<AppState>,
    ) {}

    ngOnInit() {
        // const audio = new Audio();
        // audio.src = '../../assets/audios/AUD2.wav';
        // audio.load();
        // audio.play();
    }

    handleClick() {
        this.onConfirm.emit();
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
