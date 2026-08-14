import { Component, OnDestroy, OnInit, Input, Output, AfterContentInit, EventEmitter } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DEFAULT_NOTIFICATION_TIMEOUT } from '@models';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'notification',
    imports: [TranslateModule],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss',
})
export class Notification implements OnDestroy, OnInit, AfterContentInit {
    private destroy$ = new Subject<void>();
    @Input() type?: 'info' | 'warning' | 'error' | 'success' = 'success';
    @Input() message: string = '';
    @Input() disabled?: boolean = false;
    @Output() onOK: EventEmitter<string> = new EventEmitter<string>();

    constructor(private soundService: SoundService) {}
    ngOnInit() {}

    handleClick() {
        this.onOK.emit();
    }

    ngAfterContentInit() {
        if (this.onOK) {
            window.setTimeout(() => {
                this.onOK.emit();
                // this.ele.nativeElement.remove();
            }, DEFAULT_NOTIFICATION_TIMEOUT);
        }
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
