import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomKeyboardComponent } from './custom-keyboard.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { SoundService } from '@services/sound.service';

describe('CustomKeyboardComponent', () => {
    let component: CustomKeyboardComponent;
    let fixture: ComponentFixture<CustomKeyboardComponent>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;

    beforeEach(async () => {
        const soundSpy = jasmine.createSpyObj('SoundService', ['playButton']);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CustomKeyboardComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: SoundService, useValue: soundSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        soundServiceSpy = TestBed.inject(SoundService) as jasmine.SpyObj<SoundService>;
        fixture = TestBed.createComponent(CustomKeyboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('handleChangeInput', () => {
        it('should switch layout to text if switchKey1 is clicked and layout is numeric', () => {
            component.layout = 'numeric';
            const event = { target: { id: 'switchKey1' } } as unknown as Event;
            component.handleChangeInput(event);
            expect(component.layout).toBe('text');
        });

        it('should switch layout to numeric if switchKey2 is clicked and layout is text', () => {
            component.layout = 'text';
            const event = { target: { id: 'switchKey2' } } as unknown as Event;
            component.handleChangeInput(event);
            expect(component.layout).toBe('numeric');
        });

        it('should emit onKeyPress event for normal keys', () => {
            const emitSpy = spyOn(component.keyPress, 'emit');
            const event = { target: { id: 'normalKey' } } as unknown as Event;
            component.handleChangeInput(event);
            expect(emitSpy).toHaveBeenCalledWith(event);
        });
    });

    describe('handleButtonSound', () => {
        it('should play button sound', () => {
            component.handleButtonSound();
            expect(soundServiceSpy.playButton).toHaveBeenCalled();
        });
    });
});
