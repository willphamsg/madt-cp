import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FareBusStopLocationMode } from './fare-bus-stop-location-mode.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('FareBusStopLocationMode', () => {
    let component: FareBusStopLocationMode;
    let fixture: ComponentFixture<FareBusStopLocationMode>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareBusStopLocationMode],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FareBusStopLocationMode);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('handleConfirm', () => {
        it('should emit ok event', () => {
            const emitSpy = spyOn(component.ok, 'emit');
            component.handleConfirm();
            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('handleCancel', () => {
        it('should emit onCancel event', () => {
            const emitSpy = spyOn(component.cancelled, 'emit');
            component.handleCancel();
            expect(emitSpy).toHaveBeenCalled();
        });
    });
});
