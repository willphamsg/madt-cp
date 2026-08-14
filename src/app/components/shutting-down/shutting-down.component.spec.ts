import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShuttingDownComponent } from './shutting-down.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { bootUp } from '@store/main/main.reducer';
import * as MainActions from '@store/main/main.reducer';
import { of, Subject } from 'rxjs';
import { IBootUp } from '@models';

describe('ShuttingDownComponent', () => {
    let component: ShuttingDownComponent;
    let fixture: ComponentFixture<ShuttingDownComponent>;
    let store: MockStore;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const rSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ShuttingDownComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: rSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        store = TestBed.inject(MockStore);
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(ShuttingDownComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges to manually test ngOnInit
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should subscribe to bootUp$ and set bootUpdata', () => {
            const mockData: IBootUp = {
                softwareVersion: '1.0',
                osVersion: '10',
                releaseDate: '2023',
                serialNumber: '123',
            };
            component.bootUp$ = of(mockData);

            component.ngOnInit();

            expect(component.bootUpdata).toEqual(mockData);
        });
    });

    describe('handleNavigate', () => {
        it('should navigate to the given page', () => {
            component.handleNavigate('settings');
            expect(routerSpy.navigate).toHaveBeenCalledWith(['settings']);
        });
    });

    describe('ngOnDestroy', () => {
        it('should emit and complete destroy$ subject', () => {
            const nextSpy = spyOn((component as any).destroy$, 'next');
            const completeSpy = spyOn((component as any).destroy$, 'complete');

            component.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });
    });
});
