import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BLSStatusComponent } from './bls.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';

describe('BLSStatusComponent', () => {
    let component: BLSStatusComponent;
    let fixture: ComponentFixture<BLSStatusComponent>;
    let router: Router;
    let mqttService: MqttService;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BLSStatusComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BLSStatusComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        mqttService = TestBed.inject(MqttService);
        store = TestBed.inject(MockStore);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize step to 1', () => {
        expect(component.step).toBe(1);
    });

    it('should initialize selectedBlsStatus to 0', () => {
        expect(component.selectedBlsStatus).toBe(0);
    });

    it('handleSelectStatus should set selectedBlsStatus and advance step to 2', () => {
        component.handleSelectStatus(3);
        expect(component.selectedBlsStatus).toBe(3);
        expect(component.step).toBe(2);
    });

    it('goBack should navigate to /maintenance/fare/fare-console', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance/fare/fare-console']);
    });

    it('handleConfirmBlsStatus(false) should reset step to 1', () => {
        component.step = 2;
        component.handleConfirmBlsStatus(false);
        expect(component.step).toBe(1);
    });
});
