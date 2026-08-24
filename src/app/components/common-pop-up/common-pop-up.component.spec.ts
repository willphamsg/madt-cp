import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonPopUp } from './common-pop-up.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { SoundService } from '@services/sound.service';
import { DEFAULT_TIMEOUT } from '@models';

describe('CommonPopUp', () => {
    let component: CommonPopUp;
    let fixture: ComponentFixture<CommonPopUp>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;

    beforeEach(async () => {
        const soundSpy = jasmine.createSpyObj('SoundService', ['playPopUp', 'playButton']);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CommonPopUp],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: SoundService, useValue: soundSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        soundServiceSpy = TestBed.inject(SoundService) as jasmine.SpyObj<SoundService>;
        fixture = TestBed.createComponent(CommonPopUp);
        component = fixture.componentInstance;
        // Do not detectChanges natively to allow custom testing for lifecycle hooks
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should set timeout to call handleOk when isOk=true and disableTimeout=false', fakeAsync(() => {
            component.isOk = true;
            component.disableTimeout = false;
            component.timeout = 5000;
            const okSpy = spyOn(component, 'handleOk');

            component.ngOnInit();

            expect(okSpy).not.toHaveBeenCalled();
            tick(5000);
            expect(okSpy).toHaveBeenCalled();
        }));

        it('should default to DEFAULT_TIMEOUT if timeout is not provided', fakeAsync(() => {
            component.isOk = true;
            component.disableTimeout = false;
            component.timeout = undefined;
            const okSpy = spyOn(component, 'handleOk');

            component.ngOnInit();

            tick(DEFAULT_TIMEOUT);
            expect(okSpy).toHaveBeenCalled();
        }));

        it('should not set timeout if isOk is false', fakeAsync(() => {
            component.isOk = false;
            component.disableTimeout = false;
            const okSpy = spyOn(component, 'handleOk');

            component.ngOnInit();

            tick(DEFAULT_TIMEOUT);
            expect(okSpy).not.toHaveBeenCalled();
        }));

        it('should not set timeout if disableTimeout is true', fakeAsync(() => {
            component.isOk = true;
            component.disableTimeout = true;
            const okSpy = spyOn(component, 'handleOk');

            component.ngOnInit();

            tick(DEFAULT_TIMEOUT);
            expect(okSpy).not.toHaveBeenCalled();
        }));
    });

    describe('ngOnChanges', () => {
        it('should play popup sound if disableSound is false', () => {
            component.disableSound = false;
            component.ngOnChanges();
            expect(soundServiceSpy.playPopUp).toHaveBeenCalled();
        });

        it('should not play popup sound if disableSound is true', () => {
            component.disableSound = true;
            component.ngOnChanges();
            expect(soundServiceSpy.playPopUp).not.toHaveBeenCalled();
        });
    });

    describe('Event Handlers', () => {
        it('should emit onConfirm on handleConfirm', () => {
            const emitSpy = spyOn(component.confirm, 'emit');
            component.handleConfirm();
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should emit onCancel on handleCancel', () => {
            const emitSpy = spyOn(component.cancelled, 'emit');
            component.handleCancel();
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should emit ok on handleOk', () => {
            const emitSpy = spyOn(component.ok, 'emit');
            component.handleOk();
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should play button sound on handleButtonSound', () => {
            component.handleButtonSound();
            expect(soundServiceSpy.playButton).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should clear timeout sequence', fakeAsync(() => {
            component.isOk = true;
            component.disableTimeout = false;
            const okSpy = spyOn(component, 'handleOk');

            component.ngOnInit();
            component.ngOnDestroy();

            tick(DEFAULT_TIMEOUT);
            expect(okSpy).not.toHaveBeenCalled();
        }));
    });
});
