import { Directive, Input, SimpleChanges, OnChanges } from '@angular/core';
import { OnInit } from '@angular/core';

import { AudioService } from '@services/audio.service';
import { LocalStorageService } from '@services/local-storage.service';

import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { Observable, Subject, takeUntil } from 'rxjs';

import { audioVolume } from '@store/global/global.reducer';
import { IAudioVolume, LocalStorageKey } from '@app/models';

@Directive({
    selector: '[appNotificationSound]',
    standalone: true,
})
export class NotificationSoundDirective implements OnInit, OnChanges {
    @Input('appNotificationSound') isVisible: boolean = false;

    private destroy$ = new Subject<void>();
    private audio$: Observable<IAudioVolume> = this.store.select(audioVolume);
    audioVolume: IAudioVolume = { value: 0 };

    constructor(
        protected store: Store<AppState>,
        private localStorageService: LocalStorageService,
    ) {
        // this.audio$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        //     this.audioVolume = data;
        //     // console.log('Notification sound volume set to:', data);
        // });

        this.localStorageService
            .watch(LocalStorageKey.VOLUME)
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
                if (val) {
                    const volume: number = JSON.parse(val);
                    if (typeof volume === 'number') {
                        this.audioVolume = { value: volume };
                    }
                }
            });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible']?.currentValue === true) {
            const audio = new Audio('../../assets/audios/AUD2.mp3');
            audio.currentTime = 0;
            audio.volume = (this.audioVolume.value || 100) / 100; // Set volume based on store value

            // console.log('Playing button sound with volume:', this.audioVolume.value);
            audio.play().catch((err) => {
                console.warn('Autoplay blocked or failed:', err);
            });

            // Clean up after playback to avoid memory leaks
            audio.addEventListener('ended', () => audio.remove());
        }
    }

    // private playAudio(): void {
    //     const audio = new Audio();
    //     audio.src = '../../assets/audios/AUD2.mp3';
    //     audio.load();
    //     audio.play();
    // }
}
