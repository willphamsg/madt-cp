import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelRideComponent } from './cancel-ride.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MqttService } from '@services/mqtt.service';

class FakeLoader implements TranslateLoader {
    getTranslation(lang: string) {
        return of({});
    }
}

class MockMqttService {
    connectionStatus$ = of(true);
    mqttConfigLoaded$ = of(true);
    mqttConfig = { topics: {} };
    subscribe = jasmine.createSpy('subscribe');
    publish = jasmine.createSpy('publish');
    publishWithMessageFormat = jasmine.createSpy('publishWithMessageFormat');
}

class MockStore {
    select = jasmine.createSpy('select').and.returnValue(of({}));
    dispatch = jasmine.createSpy('dispatch');
}

describe('CancelRideComponent', () => {
    let component: CancelRideComponent;
    let fixture: ComponentFixture<CancelRideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                CancelRideComponent,
                CommonModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeLoader },
                }),
            ],
            providers: [
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
                { provide: ActivatedRoute, useValue: { params: of({}), snapshot: { data: {} } } },
                provideMockStore({ initialState: mockInitialState }),
                { provide: MqttService, useClass: MockMqttService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CancelRideComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('handleCancelRide should not throw', () => {
        expect(() => component.handleCancelRide()).not.toThrow();
    });

    it('backToProgressScreen should not throw', () => {
        expect(() => component.backToProgressScreen()).not.toThrow();
    });

    describe('ngOnInit / ngOnDestroy', () => {
        it('should initialize and destroy without errors', () => {
            expect(() => {
                component.ngOnInit();
                component.ngOnDestroy();
            }).not.toThrow();
        });
    });

    describe('resetCancelRideState', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).resetCancelRideState();
            }).not.toThrow();
        });
    });

    describe('cleanup', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).cleanup();
            }).not.toThrow();
        });
    });

    describe('clearExistingTimeout', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).clearExistingTimeout();
            }).not.toThrow();
        });
    });

    describe('handleStopCancelRide', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleStopCancelRide();
            }).not.toThrow();
        });
    });

    describe('initCancelRideSubscription', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).initCancelRideSubscription();
            }).not.toThrow();
        });
    });

    describe('getCvNumber', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).getCvNumber();
            }).not.toThrow();
        });
    });

    describe('removeTimeout', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).removeTimeout();
            }).not.toThrow();
        });
    });

    describe('handleButtonSound', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleButtonSound();
            }).not.toThrow();
        });
    });

    describe('handleTimeoutManagement', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleTimeoutManagement({ timeout: 0, msgID: 1 });
            }).not.toThrow();
        });
    });

    describe('publishTimeoutMessage', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).publishTimeoutMessage();
            }).not.toThrow();
        });
    });

    describe('publishCancelRideSubmit', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).publishCancelRideSubmit();
            }).not.toThrow();
        });
    });

    describe('handleConfirmCancelRide', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirmCancelRide();
            }).not.toThrow();
        });
    });

    describe('initMqttConfig', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).initMqttConfig();
            }).not.toThrow();
        });
    });

    describe('setTimeoutHandler', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).setTimeoutHandler(1, 100);
            }).not.toThrow();
        });
    });

    describe('updateCancelRideState', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).updateCancelRideState();
            }).not.toThrow();
        });
    });

    describe('backToFare', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToFare();
            }).not.toThrow();
        });
    });

    describe('publishCancelRideStop', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).publishCancelRideStop();
            }).not.toThrow();
        });
    });

    describe('backToProgressScreen', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToProgressScreen();
            }).not.toThrow();
        });
    });

    describe('handleCancelRide', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleCancelRide();
            }).not.toThrow();
        });
    });
});
