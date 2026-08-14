import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BootUpComponent } from './boot-up.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('BootUpComponent', () => {
    let component: BootUpComponent;
    let fixture: ComponentFixture<BootUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BootUpComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BootUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize component without errors', () => {
        expect(() => {
            if ((component as any).ngOnInit) {
                (component as any).ngOnInit();
            }
        }).not.toThrow();
    });

    it('should navigate to specified page when handleNavigate is called', () => {
        const router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate');
        component.handleNavigate('/test-route');
        expect(navigateSpy).toHaveBeenCalledWith(['/test-route']);
    });

    it('should set bootUpdata from store on init', () => {
        component.ngOnInit();
        expect(component.bootUpdata).toBeDefined();
    });
});
