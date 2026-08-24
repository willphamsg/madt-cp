import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { LayoutComponent } from './layout.component';
import { MqttService } from '@services/mqtt.service';
import { DummyInitService } from '@dummyData/init-dummy-data';
import { SafeJsonService } from '@app/services/safe-json.service';
import { LocalStorageService } from '@services/local-storage.service';
import { SoundService } from '@services/sound.service';
import { mockInitialState } from '@app/testing/test-helpers';
import { IGlobalError } from '@models';

describe('LayoutComponent', () => {
    let component: LayoutComponent;
    let fixture: ComponentFixture<LayoutComponent>;

    beforeEach(async () => {
        const mqttSpy = jasmine.createSpyObj('MqttService', ['connect', 'userDataInit', 'subscribe'], {
            connectionStatus$: of(false),
            messageFormatError$: of(null),
            isTCNoResponse$: of([]),
            mqttConfigLoaded$: of(false),
        });

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LayoutComponent],
            providers: [
                provideHttpClient(),
                provideRouter([]),
                provideMockStore({ initialState: mockInitialState }),
                { provide: MqttService, useValue: mqttSpy },
                {
                    provide: DummyInitService,
                    useValue: jasmine.createSpyObj('DummyInitService', ['initializeDummyData']),
                },
                { provide: SafeJsonService, useValue: jasmine.createSpyObj('SafeJsonService', ['safeParse']) },
                {
                    provide: LocalStorageService,
                    useValue: jasmine.createSpyObj('LocalStorageService', ['setItem'], { watch: () => of(null) }),
                },
                { provide: SoundService, useValue: jasmine.createSpyObj('SoundService', ['playButton', 'playPopUp']) },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LayoutComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('buildErrorText', () => {
        it('returns an empty string when error is null', () => {
            expect(component.buildErrorText(null)).toBe('');
        });

        it('joins esn, code and description when all are present', () => {
            const error: IGlobalError = { esn: '9630003', code: '140a', description: 'Description xxxxxx' };
            expect(component.buildErrorText(error)).toBe('ESN: 9630003 | ERROR 140a | Description xxxxxx');
        });

        it('omits the ESN segment when esn is empty', () => {
            const error: IGlobalError = { code: '140a', description: 'Description xxxxxx' };
            expect(component.buildErrorText(error)).toBe('ERROR 140a | Description xxxxxx');
        });

        it('renders only the code when esn and description are empty', () => {
            const error: IGlobalError = { code: '140a', description: '' };
            expect(component.buildErrorText(error)).toBe('ERROR 140a');
        });

        it('renders only the description when esn and code are empty', () => {
            const error: IGlobalError = { code: '', description: 'Description xxxxxx' };
            expect(component.buildErrorText(error)).toBe('Description xxxxxx');
        });
    });

    describe('handleGlobalError', () => {
        it('sets error when esn, code, or description is present', () => {
            (component as any).handleGlobalError({ esn: '9630003', code: '140a', description: 'Something' });
            expect(component.error).toEqual({ esn: '9630003', code: '140a', description: 'Something' });
        });

        it('does not set error when esn, code, and description are all empty', () => {
            (component as any).handleGlobalError({ code: '', description: '' });
            expect(component.error).toBeNull();
        });
    });
});
