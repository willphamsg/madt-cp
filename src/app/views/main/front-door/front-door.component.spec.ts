import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FrontDoorComponent } from './front-door.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';

describe('FrontDoorComponent', () => {
    let component: FrontDoorComponent;
    let fixture: ComponentFixture<FrontDoorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FrontDoorComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FrontDoorComponent);
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
        expect(navigateSpy).toHaveBeenCalledWith(['main/bus-stop-information']);
    });

    it('should handle change cv mode', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const store = TestBed.inject(Store);
        const dispatchSpy = spyOn(store, 'dispatch');
        component.topics = { mainTab: { get: 'test' } };

        component.handleChangeCvMode(1);
        expect(component.cvNum).toBe(1);
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should handle cancel', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const spy = spyOn(component, 'removeTimeout');
        component.topics = { mainTab: { get: 'test' } };

        component.handleCancel();
        expect(spy).toHaveBeenCalled();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should handle update cv', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const spy = spyOn(component, 'removeTimeout');
        component.topics = { mainTab: { get: 'test' } };

        component.handleUpdateCV();
        expect(spy).toHaveBeenCalled();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should handle close', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        const spy = spyOn(component, 'backToMain');
        component.topics = { mainTab: { get: 'test' } };

        component.handleClose();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('should remove timeout', () => {
        const store = TestBed.inject(Store);
        const dispatchSpy = spyOn(store, 'dispatch');
        component.removeTimeout();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should handle button sound', () => {
        const soundService = TestBed.inject(SoundService) as any;
        const soundSpy = spyOn(soundService, 'playButton');
        component.handleButtonSound();
        expect(soundSpy).toHaveBeenCalled();
    });
});
