import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteParameterComponent } from './delete-parameter.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';

describe('DeleteParameterComponent', () => {
    let component: DeleteParameterComponent;
    let fixture: ComponentFixture<DeleteParameterComponent>;
    let router: Router;
    let mqttService: MqttService;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DeleteParameterComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteParameterComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        mqttService = TestBed.inject(MqttService);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('handleDeleteParameter should call mqttService.publishWithMessageFormat', () => {
        const publishSpy = spyOn(mqttService, 'publishWithMessageFormat');
        (component as any).topics = { maintenance: { get: 'maintenance/get' } };
        component.handleDeleteParameter();
        expect(publishSpy).toHaveBeenCalled();
    });

    it('handleClearDeleteParameter should dispatch to store and navigate back', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        const navigateSpy = spyOn(router, 'navigate');
        component.handleClearDeleteParameter();
        expect(dispatchSpy).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('goBack should navigate to /maintenance/fare/fare-console', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });
});
