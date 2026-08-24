import { fakeAsync, tick } from '@angular/core/testing';
import { DEFAULT_TIMEOUT } from '@models';
import { SoundService } from '@services/sound.service';
import { AutoTimeoutPopupBase } from './auto-timeout-popup.base';

class TestPopup extends AutoTimeoutPopupBase {}

describe('AutoTimeoutPopupBase', () => {
    let component: TestPopup;
    let soundService: jasmine.SpyObj<SoundService>;

    beforeEach(() => {
        soundService = jasmine.createSpyObj('SoundService', ['playButton']);
        component = new TestPopup(soundService);
    });

    it('emits ok on handleClick', () => {
        const emitSpy = spyOn(component.ok, 'emit');
        component.handleClick();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('clears any prior timeout and auto-triggers handleClick after DEFAULT_TIMEOUT', fakeAsync(() => {
        const handleSpy = spyOn(component, 'handleClick');
        component.intervalId = setTimeout(() => {}, 100000) as any;

        component.ngOnInit();

        expect(handleSpy).not.toHaveBeenCalled();
        tick(DEFAULT_TIMEOUT - 1);
        expect(handleSpy).not.toHaveBeenCalled();
        tick(1);
        expect(handleSpy).toHaveBeenCalledTimes(1);
    }));

    it('clears the timeout on destroy so handleClick is never called', fakeAsync(() => {
        const handleSpy = spyOn(component, 'handleClick');

        component.ngOnInit();
        component.ngOnDestroy();

        tick(DEFAULT_TIMEOUT);
        expect(handleSpy).not.toHaveBeenCalled();
    }));

    it('delegates handleButtonSound to SoundService', () => {
        component.handleButtonSound();
        expect(soundService.playButton).toHaveBeenCalled();
    });
});
