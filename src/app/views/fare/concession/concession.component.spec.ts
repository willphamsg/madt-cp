import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConcessionComponent } from './concession.component';
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

describe('ConcessionComponent', () => {
    let component: ConcessionComponent;
    let fixture: ComponentFixture<ConcessionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                ConcessionComponent,
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

        fixture = TestBed.createComponent(ConcessionComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('handleConcession should not throw', () => {
        expect(() => component.handleConcession()).not.toThrow();
    });

    it('backToFare should not throw', () => {
        expect(() => component.backToFare()).not.toThrow();
    });

    describe('ngOnInit / ngOnDestroy', () => {
        it('should initialize and destroy without errors', () => {
            expect(() => {
                component.ngOnInit();
                component.ngOnDestroy();
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

    describe('handleConfirmConcession', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConfirmConcession();
            }).not.toThrow();
        });
    });

    describe('publishConcessionCancel', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).publishConcessionCancel();
            }).not.toThrow();
        });
    });

    describe('handleStopConcession', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleStopConcession();
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

    describe('initConcessionSubscription', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).initConcessionSubscription();
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

    describe('publishConcessionSubmit', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).publishConcessionSubmit();
            }).not.toThrow();
        });
    });

    describe('handleConcession', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).handleConcession();
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

    describe('backToFare', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).backToFare();
            }).not.toThrow();
        });
    });

    describe('resetConcessionState', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).resetConcessionState();
            }).not.toThrow();
        });
    });

    describe('updateConcessionState', () => {
        it('should execute without errors', () => {
            expect(() => {
                (component as any).updateConcessionState();
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
});
