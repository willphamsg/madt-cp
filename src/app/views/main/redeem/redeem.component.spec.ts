import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedeemComponent } from './redeem.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { SoundService } from '@services/sound.service';
import { Store } from '@ngrx/store';

describe('RedeemComponent', () => {
    let component: RedeemComponent;
    let fixture: ComponentFixture<RedeemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), RedeemComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(RedeemComponent);
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

    it('should handle redeem confirm', () => {
        const mqttService = TestBed.inject(MqttService) as any;
        spyOn(mqttService, 'publishWithMessageFormat');
        component.topics = { mainTab: { get: 'test' } };
        // spy on removeTimeout
        spyOn(component, 'removeTimeout');
        component.handleRedeem(true);
        expect(component.removeTimeout).toHaveBeenCalled();
        expect(mqttService.publishWithMessageFormat).toHaveBeenCalled();
    });

    it('should handle redeem cancel', () => {
        spyOn(component, 'removeTimeout');
        spyOn(component, 'backToMain');
        component.handleRedeem(false);
        expect(component.removeTimeout).toHaveBeenCalled();
        expect(component.backToMain).toHaveBeenCalled();
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
