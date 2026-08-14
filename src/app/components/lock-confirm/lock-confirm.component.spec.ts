import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LockConfirmPopUp } from './lock-confirm.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { SoundService } from '@services/sound.service';

describe('LockConfirmPopUp', () => {
    let component: LockConfirmPopUp;
    let fixture: ComponentFixture<LockConfirmPopUp>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;

    beforeEach(async () => {
        const soundSpy = jasmine.createSpyObj('SoundService', ['playButton']);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LockConfirmPopUp],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: SoundService, useValue: soundSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        soundServiceSpy = TestBed.inject(SoundService) as jasmine.SpyObj<SoundService>;
        fixture = TestBed.createComponent(LockConfirmPopUp);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('handleConfirm', () => {
        it('should emit onConfirm event', () => {
            const emitSpy = spyOn(component.onConfirm, 'emit');
            component.handleConfirm();
            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('handleCancel', () => {
        it('should emit onCancel event', () => {
            const emitSpy = spyOn(component.onCancel, 'emit');
            component.handleCancel();
            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('handleButtonSound', () => {
        it('should play button sound', () => {
            component.handleButtonSound();
            expect(soundServiceSpy.playButton).toHaveBeenCalled();
        });
    });
});
