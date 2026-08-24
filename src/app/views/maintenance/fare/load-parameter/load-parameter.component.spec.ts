import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadParameterComponent } from './load-parameter.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { of } from 'rxjs';

describe('LoadParameterComponent', () => {
    let component: LoadParameterComponent;
    let fixture: ComponentFixture<LoadParameterComponent>;
    let mqttService: MqttService;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), LoadParameterComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(LoadParameterComponent);
        component = fixture.componentInstance;
        mqttService = TestBed.inject(MqttService);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize loadParameter to empty object', () => {
        expect(component.loadParameter).toEqual({});
    });

    it('handleClickButton should call mqttService.publishWithMessageFormat', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleClickButton();
        expect(publishSpy).toHaveBeenCalled();
    });

    it('handleClickOK should dispatch to store', () => {
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
