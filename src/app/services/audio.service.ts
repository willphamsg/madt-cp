import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private audio = new Audio();

    constructor() {}

    load(src: string): void {
        this.audio.src = src;
        this.audio.load();
    }

    play(): void {
        this.audio.play();
    }
}
