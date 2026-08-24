import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedetectCVComponent } from './redetect-cv.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { of } from 'rxjs';

describe('RedetectCVComponent', () => {
    let component: RedetectCVComponent;
    let fixture: ComponentFixture<RedetectCVComponent>;
    let mqttService: MqttService;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), RedetectCVComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(RedetectCVComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize redetectCV to empty object', () => {
        expect(component.redetectCV).toEqual({});
    });

    it('handleClickButton should call mqttService.publishWithMessageFormat', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleClickButton();
        expect(publishSpy).toHaveBeenCalled();
    });

    it('handleClickOK should dispatch updateRedetectCV action', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.handleClickOK();
        expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should set topics from mqttService when mqtt config is loaded', () => {
        (mqttService as any).mqttConfigLoaded$ = of(true);
        mqttService.mqttConfig = { topics: { maintenance: { get: 'maintenance/get' } } } as any;
        component.ngOnInit();
        expect((component as any).topics).toEqual({ maintenance: { get: 'maintenance/get' } });
    });
});
