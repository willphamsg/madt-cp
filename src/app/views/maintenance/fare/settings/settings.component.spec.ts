import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { LocalStorageService } from '@services/local-storage.service';
import { of } from 'rxjs';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let mqttService: MqttService;
    let localStorageService: LocalStorageService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), SettingsComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        localStorageService = TestBed.inject(LocalStorageService);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('handleConfirmLanguage should call mqttService.publishWithMessageFormat twice', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' }, tcToAllTabs: 'tc/all-tabs' };
        component.handleConfirmLanguage('en');
        expect(publishSpy).toHaveBeenCalledTimes(2);
    });

    it('handleConfirmLanguage should save language to localStorage', () => {
        const setItemSpy = spyOn(localStorageService, 'setItem');
        spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' }, tcToAllTabs: 'tc/all-tabs' };
        component.handleConfirmLanguage('ch');
        expect(setItemSpy).toHaveBeenCalled();
    });

    it('handleChangeAudioVolume should call mqttService.publishWithMessageFormat and localStorage', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        const setItemSpy = spyOn(localStorageService, 'setItem');
        (component as any).topics = { tcToAllTabs: 'tc/all-tabs' };
        component.handleChangeAudioVolume(50);
        expect(publishSpy).toHaveBeenCalled();
        expect(setItemSpy).toHaveBeenCalled();
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
    });
});
