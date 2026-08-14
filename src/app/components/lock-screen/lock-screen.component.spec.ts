import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LockScreenComponent } from './lock-screen.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { MsgID, MsgSubID } from '@models';
import { lockScreen } from '@store/main/main.reducer';
import * as MainActions from '@store/main/main.reducer';
import { of } from 'rxjs';

describe('LockScreenComponent', () => {
    let component: LockScreenComponent;
    let fixture: ComponentFixture<LockScreenComponent>;
    let store: MockStore;
    let routerSpy: jasmine.SpyObj<Router>;
    let mqttServiceSpy: jasmine.SpyObj<MqttService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;

    beforeEach(async () => {
        const mqttSpy = jasmine.createSpyObj('MqttService', ['publishWithMessageFormat'], {
            mqttConfigLoaded$: of(true),
            mqttConfig: { topics: { mainTab: { get: 'test/topic' } } },
        });
        const soundSpy = jasmine.createSpyObj('SoundService', ['playButton']);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LockScreenComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mqttSpy },
                { provide: SoundService, useValue: soundSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        store = TestBed.inject(MockStore);
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        spyOn(routerSpy, 'navigate');
        mqttServiceSpy = TestBed.inject(MqttService) as jasmine.SpyObj<MqttService>;
        soundServiceSpy = TestBed.inject(SoundService) as jasmine.SpyObj<SoundService>;

        fixture = TestBed.createComponent(LockScreenComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges here to test ngOnInit properly
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should subscribe to lockScreen$ and handle timeout', fakeAsync(() => {
            component.lockScreen$ = of({ msgID: MsgID.NOTIFY_TO_LOCK, timeout: 5000 });

            component.ngOnInit();

            tick(5000);

            expect(mqttServiceSpy.publishWithMessageFormat).toHaveBeenCalledWith({
                topic: 'test/topic',
                msgID: MsgID.TIMEOUT_MESSAGE,
                msgSubID: MsgSubID.NOTIFY,
                payload: {
                    msgID: MsgID.NOTIFY_TO_LOCK,
                },
            });
        }));

        it('should set topics from mqttConfig when loaded', () => {
            component.ngOnInit();
            expect(component.topics).toEqual({ mainTab: { get: 'test/topic' } });
        });
    });

    describe('backToMain', () => {
        it('should navigate to /main', () => {
            component.backToMain();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
        });
    });

    describe('handleBack', () => {
        it('should dispatch updateLockScreen and clear timeout', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.timeOutId = setTimeout(() => {}, 100000) as any;

            component.handleBack();

            expect(dispatchSpy).toHaveBeenCalledWith(
                MainActions.updateLockScreen({
                    payload: { msgID: MsgID.NOTIFY_TO_LOCK, message: undefined },
                }),
            );
        });
    });

    describe('handleUnlock', () => {
        it('should publish unlock request', () => {
            component.topic = 'dummy/topic';
            component.handleUnlock();

            expect(mqttServiceSpy.publishWithMessageFormat).toHaveBeenCalledWith({
                topic: 'dummy/topic',
                msgID: MsgID.UNLOCK_SUBMIT,
                msgSubID: MsgSubID.REQUEST,
                payload: {},
            });
        });
    });

    describe('handleConfirmUnlock', () => {
        it('should return if code is empty', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.handleConfirmUnlock('');
            expect(dispatchSpy).not.toHaveBeenCalled();
        });

        it('should reset pinError, dispatch action, and publish login request', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            component.topic = 'dummy/topic';

            component.handleConfirmUnlock('1234');

            expect(component.pinError).toBe('');
            expect(dispatchSpy).toHaveBeenCalled();
            expect(mqttServiceSpy.publishWithMessageFormat).toHaveBeenCalledWith({
                topic: 'dummy/topic',
                msgID: MsgID.MANUAL_LOGIN_PIN2,
                msgSubID: MsgSubID.REQUEST,
                payload: { pin: '1234' },
            });
        });
    });

    describe('handleButtonSound', () => {
        it('should play button sound', () => {
            component.handleButtonSound();
            expect(soundServiceSpy.playButton).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should clear timeout, complete subject, and dispatch empty lock screen', () => {
            const dispatchSpy = spyOn(store, 'dispatch');
            const nextSpy = spyOn((component as any).destroy$, 'next');
            const completeSpy = spyOn((component as any).destroy$, 'complete');

            component.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
            expect(dispatchSpy).toHaveBeenCalledWith(
                MainActions.updateLockScreen({
                    payload: {
                        msgID: undefined,
                        message: undefined,
                        status: undefined,
                    },
                }),
            );
        });
    });
});
