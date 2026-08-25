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

    it('should trust the configured http(s) address and render the iframe', () => {
        expect(component.safeUrl).toBeTruthy();
        expect(fixture.nativeElement.querySelector('iframe')).toBeTruthy();
    });

    it('should refuse a configured address that is not http(s)', () => {
        expect(component['trustIframeUrl']('javascript:alert(1)')).toBeNull();
        expect(component['trustIframeUrl']('data:text/html,<script></script>')).toBeNull();
    });

    it('should refuse a malformed configured address', () => {
        expect(component['trustIframeUrl']('not-a-url')).toBeNull();
    });

    it('should show the error state instead of the iframe when the address is refused', () => {
        component.safeUrl = null;
        component.isBroken = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
        expect(fixture.nativeElement.querySelector('.cjb-error')).toBeTruthy();
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
