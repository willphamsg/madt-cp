import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginOptionComponent } from './login-option.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { BehaviorSubject } from 'rxjs';
import { MsgID, MsgSubID } from '@models';
import { SoundService } from '@services/sound.service';

describe('LoginOptionComponent', () => {
    let component: LoginOptionComponent;
    let fixture: ComponentFixture<LoginOptionComponent>;
    let mqttServiceMock: {
        publishWithMessageFormat: jasmine.Spy;
        mqttConfigLoaded$: BehaviorSubject<boolean>;
        mqttConfig: any;
    };
    let soundServiceMock: {
        playButton: jasmine.Spy;
    };

    beforeEach(async () => {
        mqttServiceMock = {
            publishWithMessageFormat: jasmine.createSpy('publishWithMessageFormat'),
            mqttConfigLoaded$: new BehaviorSubject<boolean>(false),
            mqttConfig: {
                topics: {
                    mainTab: { get: 'main/topic/get' },
                },
            },
        };

        soundServiceMock = {
            playButton: jasmine.createSpy('playButton'),
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LoginOptionComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mqttServiceMock },
                { provide: SoundService, useValue: soundServiceMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginOptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize component without errors', () => {
        expect(() => {
            if ((component as any).ngOnInit) {
                (component as any).ngOnInit();
            }
        }).not.toThrow();
    });

    it('should set topics when mqtt config is loaded', () => {
        mqttServiceMock.mqttConfigLoaded$.next(true);

        expect(component.topics).toEqual(mqttServiceMock.mqttConfig.topics);
    });

    it('should play button sound', () => {
        component.handleButtonSound();

        expect(soundServiceMock.playButton).toHaveBeenCalled();
    });

    it('should publish driver login role when driver button is clicked', () => {
        component.topics = { mainTab: { get: 'main/topic/get' } };

        component.loginOptionButtons[0].onClick();

        expect(mqttServiceMock.publishWithMessageFormat).toHaveBeenCalledWith({
            topic: 'main/topic/get',
            msgID: MsgID.LOGIN_ROLE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { role: 1 },
        });
    });

    it('should publish maintenance login role when maintenance button is clicked', () => {
        component.topics = { mainTab: { get: 'main/topic/get' } };

        component.loginOptionButtons[1].onClick();

        expect(mqttServiceMock.publishWithMessageFormat).toHaveBeenCalledWith({
            topic: 'main/topic/get',
            msgID: MsgID.LOGIN_ROLE_SUBMIT,
            msgSubID: MsgSubID.NOTIFY,
            payload: { role: 2 },
        });
    });
});
