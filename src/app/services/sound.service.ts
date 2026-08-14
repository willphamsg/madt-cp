import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LocalStorageService } from '@services/local-storage.service';

import { AppState } from '@store/app.state';
// import { audioVolume } from '@store/global/global.reducer';
import { IAudioVolume, LocalStorageKey } from '@models';

@Injectable({
    providedIn: 'root',
})
export class SoundService implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    // private audio$: Observable<IAudioVolume> = this.store.select(audioVolume);
    audioVolume: IAudioVolume = { value: 100 };
    private playingAudios: HTMLAudioElement[] = [];
    popUpAudio: HTMLAudioElement = new Audio('assets/audios/AUD2.mp3');
    buttonAudio: HTMLAudioElement = new Audio('assets/audios/AUD1.wav');

    constructor(
        private store: Store<AppState>,
        private localStorageService: LocalStorageService,
    ) {
        // this.audio$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        //     this.audioVolume = data;
        //     // console.log('Sound service volume set to:', data);
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
                    // console.log('volume', this.audioVolume);
                }
            });
    }

    ngOnInit() {
        this.popUpAudio.load();
        this.buttonAudio.load();
    }

    ngOnDestroy() {
        this.cleanup();
    }

    /**
     * Call this when the app is destroyed (e.g. in AppComponent.ngOnDestroy)
     */
    cleanup(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.stopAll();
    }

    play(audio: HTMLAudioElement, volume?: number, onEnd?: () => void): void {
        // const audio = new Audio(src);
        // console.log('SoundService play called', audio);
        if (volume !== undefined) {
            audio.volume = volume;
        } else if (this.audioVolume.value === 0) {
            audio.volume = 0;
        } else {
            audio.volume = (this.audioVolume.value || 100) / 100;
        }
        audio.currentTime = 0;
        // console.log('Playing sound:', src, 'with volume:', audio.volume, this.audioVolume.value);
        this.playingAudios.push(audio);
        audio.play().catch(() => {});
        audio.addEventListener('ended', () => {
            this.playingAudios = this.playingAudios.filter((a) => a !== audio);
            if (onEnd) onEnd();
        });
    }

    playPopUp(volume?: number, onEnd?: () => void): void {
        this.play(this.popUpAudio, volume, onEnd);
    }

    playButton(volume?: number, onEnd?: () => void): void {
        this.play(this.buttonAudio, volume, onEnd);
    }

    stopAll(): void {
        this.playingAudios.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.playingAudios = [];
    }
}
