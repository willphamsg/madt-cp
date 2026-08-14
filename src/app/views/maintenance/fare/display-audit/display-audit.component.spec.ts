import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayAuditComponent } from './display-audit.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MqttService } from '@services/mqtt.service';
import { of } from 'rxjs';

describe('DisplayAuditComponent', () => {
    let component: DisplayAuditComponent;
    let fixture: ComponentFixture<DisplayAuditComponent>;

    beforeEach(async () => {
        const mqttSpy = jasmine.createSpyObj('MqttService', ['publishWithMessageFormat'], {
            mqttConfigLoaded$: of(false),
            mqttConfig: { topics: { maintenance: { get: 'test/topic' } } },
        });

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DisplayAuditComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                provideRouter([]),
                { provide: MqttService, useValue: mqttSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DisplayAuditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize isLoading to true', () => {
        expect(component.isLoading).toBeTrue();
    });

    it('should initialize auditRegistration with empty object', () => {
        expect(component.auditRegistration).toEqual({});
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });
});
