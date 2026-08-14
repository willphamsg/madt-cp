import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CJBComponent } from './cjb.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

describe('CJBComponent', () => {
    let component: CJBComponent;
    let fixture: ComponentFixture<CJBComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), CJBComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        fixture = TestBed.createComponent(CJBComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have isBroken set to false initially', () => {
        expect(component.isBroken).toBeFalse();
    });

    it('should set isBroken to true when onIframeError is called', () => {
        component.onIframeError();
        expect(component.isBroken).toBeTrue();
    });

    it('should set isBroken to false when onIframeLoad is called with accessible document', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        component.isBroken = true;
        component.onIframeLoad(iframe);
        expect(component.isBroken).toBeFalse();
        document.body.removeChild(iframe);
    });

    it('should navigate to /maintenance when backToMaintenance is called', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.backToMaintenance();
        expect(navigateSpy).toHaveBeenCalledWith(['/maintenance']);
    });
});
