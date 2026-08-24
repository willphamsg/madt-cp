import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RearDoorComponent } from './rear-door.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { of } from 'rxjs';

describe('RearDoorComponent', () => {
    let component: RearDoorComponent;
    let fixture: ComponentFixture<RearDoorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), RearDoorComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(RearDoorComponent);
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

    it('should navigate back to main', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.backToMain();
        expect(navigateSpy).toHaveBeenCalled();
    });

    it('should handle change cv mode', () => {
        component.handleChangeCvMode('test');
        expect(component.cvMode).toBe('test');
    });

    it('should handle toggle rear doors', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        component.topics = { mainTab: { get: 'test' } };
        component.handleToggleRearDoors();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should handle button sound', () => {
        const soundService = TestBed.inject(SoundService) as any;
        const soundSpy = spyOn(soundService, 'playButton');
        component.handleButtonSound();
        expect(soundSpy).toHaveBeenCalled();
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        const mqttService = TestBed.inject(MqttService);
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { mainTab: { get: 'test' } } } as any;
        component.ngOnInit();
        expect(component.topics).toEqual({ mainTab: { get: 'test' } });
    });
});
