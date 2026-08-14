import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@app/services/sound.service';
import { LocalStorageService } from '@services/local-storage.service';
import { of } from 'rxjs';
import { MsgID, MsgSubID } from '@models';
import * as autoClicker from '../../../../../test/main';
import { environment } from '@env/environment';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let store: MockStore;
    let routerSpy: jasmine.SpyObj<Router>;
    let mqttServiceSpy: jasmine.SpyObj<MqttService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;

    beforeEach(async () => {
        const rSpy = jasmine.createSpyObj('Router', ['navigate']);
        const mqttSpy = jasmine.createSpyObj(
            'MqttService',
            ['publishWithMessageFormat', 'clearMqttLog', 'downloadMqttLog'],
            {
                mqttConfigLoaded$: of(true),
                mqttConfig: { topics: { mainTab: { get: 'test/topic' } } },
            },
        );
        const soundSpy = jasmine.createSpyObj('SoundService', ['playButton']);
        const localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['watch']);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HeaderComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: rSpy },
                { provide: MqttService, useValue: mqttSpy },
                { provide: SoundService, useValue: soundSpy },
                { provide: LocalStorageService, useValue: localStorageSpy },
                DatePipe,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        store = TestBed.inject(MockStore);
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        mqttServiceSpy = TestBed.inject(MqttService) as jasmine.SpyObj<MqttService>;
        soundServiceSpy = TestBed.inject(SoundService) as jasmine.SpyObj<SoundService>;

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        component.screen = 'main';
        // Don't detectChanges here to manually trigger ngOnInit
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should setup interval, topics, and watch storage changes', fakeAsync(() => {
            const watchSpy = spyOn(<any>component, 'watchStorageChanges');

            component.ngOnInit();

            expect(watchSpy).toHaveBeenCalled();
            expect(component.topics).toEqual({ mainTab: { get: 'test/topic' } });

            const initialDate = component.currentDate;
            tick(1100);
            expect(component.currentDate).not.toEqual(initialDate);

            clearInterval(component.intervalId);
        }));
    });

    describe('ngOnChanges', () => {
        it('should update BOLC visibility when isLoggedIn changes', () => {
            component.isLoggedIn = true;
            component.ngOnChanges({
                isLoggedIn: new SimpleChange(false, true, true),
            });
            expect(component.statusIndicators[1].hidden).toBeFalse();

            component.isLoggedIn = false;
            component.ngOnChanges({
                isLoggedIn: new SimpleChange(true, false, false),
            });
            expect(component.statusIndicators[1].hidden).toBeTrue();
        });
    });

    describe('watchStorageChanges', () => {
        it('should subscribe to connectionStatusState$ and update indicators', () => {
            component.connectionStatusState$ = of({
                statusBTS: true,
                statusBOLC: false,
                statusFMS: true,
                statusCRP: false,
            });
            component.isLoggedIn = true;

            (component as any).watchStorageChanges();

            expect(component.statusIndicators[0].connected).toBeTrue(); // BTS
            expect(component.statusIndicators[1].connected).toBeFalse(); // BOLC
            expect(component.statusIndicators[2].connected).toBeTrue(); // Fare has no mapping, remains true
            expect(component.statusIndicators[3].connected).toBeTrue(); // FMS
            expect(component.statusIndicators[4].connected).toBeFalse(); // CRP

            expect(component.statusIndicators[1].hidden).toBeFalse(); // BOLC hidden check
        });
    });

    describe('handleNavigate', () => {
        it('should navigate to page', () => {
            component.handleNavigate('/test-page');
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/test-page']);
        });
    });

    describe('handleChangeAutoClick', () => {
        beforeEach(() => {
            spyOn(window, 'setInterval').and.returnValue(123 as any);
            spyOn(window, 'clearInterval').and.stub();
        });

        afterEach(() => {
            autoClicker.stopAutoClicker();
        });

        it('should start auto clicker when toggled on', () => {
            component.activeAutoClick = false;
            component.handleChangeAutoClick();

            expect(component.activeAutoClick).toBeTrue();
            expect(window.setInterval).toHaveBeenCalled();
        });

        it('should stop auto clicker when toggled off', () => {
            component.activeAutoClick = true;
            component.handleChangeAutoClick();

            expect(component.activeAutoClick).toBeFalse();
            expect(window.clearInterval).toHaveBeenCalled();
        });
    });

    describe('handleButtonSound', () => {
        it('should play button sound', () => {
            component.handleButtonSound();
            expect(soundServiceSpy.playButton).toHaveBeenCalled();
        });
    });

    describe('button click handlers', () => {
        beforeEach(() => {
            component.ngOnInit(); // load topics
        });

        it('settings-btn should emit clickSettings', () => {
            const emitSpy = spyOn(component.clickSettings, 'emit');
            const btn = component.buttons.find((b) => b.id === 'settings-btn');
            btn?.onClick?.({});
            expect(emitSpy).toHaveBeenCalled();
        });

        it('log-out-btn should emit clickLogout', () => {
            const emitSpy = spyOn(component.clickLogout, 'emit');
            const btn = component.buttons.find((b) => b.id === 'log-out-btn');
            btn?.onClick?.({});
            expect(emitSpy).toHaveBeenCalled();
        });

        it('end-trip-btn should publish MQTT message', () => {
            const btn = component.buttons.find((b) => b.id === 'end-trip-btn');
            btn?.onClick?.({});
            expect(mqttServiceSpy.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.END_TRIP }),
            );
        });

        it('lock-btn should emit clickLock', () => {
            const emitSpy = spyOn(component.clickLock, 'emit');
            const btn = component.buttons.find((b) => b.id === 'lock-btn');
            btn?.onClick?.({});
            expect(emitSpy).toHaveBeenCalled();
        });

        it('manual-login should publish MQTT message', () => {
            const btn = component.buttons.find((b) => b.id === 'manual-login');
            btn?.onClick?.({});
            expect(mqttServiceSpy.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({ msgID: MsgID.MANUAL_LOGIN }),
            );
        });

        it('wlan-btn should publish MQTT message with triggerDAGWButton payload', () => {
            const btn = component.buttons.find((b) => b.id === 'wlan-btn');
            btn?.onClick?.({});
            expect(mqttServiceSpy.publishWithMessageFormat).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    msgID: MsgID.TRIGGER_DAGW_OPERATION,
                    payload: { triggerDAGWButton: true },
                }),
            );
        });
    });

    describe('ngOnDestroy', () => {
        it('should clear interval and complete destroy$', () => {
            const nextSpy = spyOn((component as any).destroy$, 'next');
            const completeSpy = spyOn((component as any).destroy$, 'complete');
            const clearIntervalSpy = spyOn(window, 'clearInterval');

            component.intervalId = 123;
            component.ngOnDestroy();

            expect(clearIntervalSpy).toHaveBeenCalledWith(123);
            expect(nextSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });
});
