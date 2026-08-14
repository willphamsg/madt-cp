import { provideMockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import { mockInitialState } from '../../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainAccessDeniedComponent } from './access-denied.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('MainAccessDeniedComponent', () => {
    let component: MainAccessDeniedComponent;
    let fixture: ComponentFixture<MainAccessDeniedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MainAccessDeniedComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MainAccessDeniedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should render pre-login component with correct title and content', () => {
        const preLoginElement = fixture.debugElement.query(By.css('pre-login'));
        expect(preLoginElement).toBeTruthy();
        expect(preLoginElement.componentInstance.title).toEqual('ACCESS_DENIED');
        expect(preLoginElement.componentInstance.content).toEqual('');
    });
});
