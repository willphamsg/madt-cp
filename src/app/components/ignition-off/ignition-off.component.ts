import { Component, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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
export class IgnitionOffComponent implements OnDestroy {
    private readonly destroy$ = new Subject<void>();
    @Input() time?: string = '';
    @Input() delay?: string | number = '';
    @Input() disabled?: boolean = false;
    @Output() confirm: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
        private readonly store: Store<AppState>,
    ) {}

    handleClick() {
        this.confirm.emit();
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
