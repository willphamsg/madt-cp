import { Directive, HostListener, OnInit, OnDestroy } from '@angular/core';

import { Store } from '@ngrx/store';
import { AppState } from '@store/app.state';
import { Observable, Subject, takeUntil } from 'rxjs';

import { LocalStorageService } from '@services/local-storage.service';

import { audioVolume } from '@store/global/global.reducer';
import { IAudioVolume, LocalStorageKey } from '@app/models';

@Directive({
    selector: '[appButtonSound]',
    standalone: true,
})
export class ButtonSoundDirective implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();
    private readonly audio$: Observable<IAudioVolume> = this.store.select(audioVolume);
    audioVolume: IAudioVolume = { value: 0 };

    constructor(
        protected store: Store<AppState>,
        private readonly localStorageService: LocalStorageService,
    ) {}

    ngOnInit() {
        // this.audio$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        //     this.audioVolume = data;
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

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // @HostListener('click', ['$event'])
    @HostListener('click')
    public onClick(): void {
        // event.stopPropagation();
        this.playAudio();
    }

    private playAudio(): void {
        const audio = new Audio();
        audio.src = '../../assets/audios/AUD1.wav'; // Use .wav for better compatibility
        audio.load();
        audio.play();

        // console.log('Button sound played', this.audioVolume.value);
        if (this.audioVolume.value === 0) {
            audio.volume = 0;
        } else {
            audio.volume = (this.audioVolume.value || 100) / 100; // Set volume based on store value
        }
    }
}
