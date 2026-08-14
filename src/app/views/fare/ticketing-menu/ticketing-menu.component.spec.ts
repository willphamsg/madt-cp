import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketingMenuComponent } from './ticketing-menu.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('TicketingMenuComponent', () => {
    let component: TicketingMenuComponent;
    let fixture: ComponentFixture<TicketingMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), TicketingMenuComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TicketingMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit / ngOnDestroy', () => {
        it('should initialize and destroy without errors', () => {
            expect(() => {
                component.ngOnInit();
            }).not.toThrow();
        });
    });

    describe('handleClick', () => {
        it('should execute without errors', () => {
            component.topics = { fareTab: { get: 'topic' } } as any;
            (component as any).mqttService = { publishWithMessageFormat: jasmine.createSpy() };
            expect(() => {
                (component as any).handleClick('test');
            }).not.toThrow();
        });
    });

    describe('handleButtonSound', () => {
        it('should execute without errors', () => {
            (component as any).soundService = { playButton: jasmine.createSpy() };
            expect(() => {
                (component as any).handleButtonSound();
            }).not.toThrow();
        });
    });
});
