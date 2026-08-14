import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaintenanceLogoffComponent } from './log-off.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('MaintenanceLogoffComponent', () => {
    let component: MaintenanceLogoffComponent;
    let fixture: ComponentFixture<MaintenanceLogoffComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MaintenanceLogoffComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MaintenanceLogoffComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should be an instance of MaintenanceLogoffComponent', () => {
        expect(component instanceof MaintenanceLogoffComponent).toBeTrue();
    });

    it('should render without errors', () => {
        expect(() => fixture.detectChanges()).not.toThrow();
    });
});
