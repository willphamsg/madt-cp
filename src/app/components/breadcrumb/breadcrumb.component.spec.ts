import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { provideMockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

describe('BreadcrumbComponent', () => {
    let component: BreadcrumbComponent;
    let fixture: ComponentFixture<BreadcrumbComponent>;
    let mockRouterEvents: Subject<any>;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockRouterEvents = new Subject<any>();

        mockActivatedRoute = {
            snapshot: {
                data: {},
            },
            routeConfig: {},
            firstChild: null,
        };

        const routerSpy = {
            events: mockRouterEvents.asObservable(),
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), BreadcrumbComponent],
            providers: [
                provideHttpClient(),
                provideMockStore({ initialState: mockInitialState }),
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BreadcrumbComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges here so we can control ngOnInit
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call buildBreadcrumb if breadcrumbs array is empty', () => {
            const spy = spyOn(component, 'buildBreadcrumb');
            component.breadcrumbs = [];
            component.ngOnInit();
            expect(spy).toHaveBeenCalledWith(mockActivatedRoute);
        });

        it('should not call buildBreadcrumb if breadcrumbs array is not empty', () => {
            const spy = spyOn(component, 'buildBreadcrumb');
            component.breadcrumbs = [{ label: 'test', link: '/test' }];
            component.ngOnInit();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('Router Events', () => {
        it('should clear breadcrumbs and call buildBreadcrumb on NavigationEnd', () => {
            fixture.detectChanges(); // Init
            const spy = spyOn(component, 'buildBreadcrumb');
            component.breadcrumbs = [{ label: 'old', link: '/old' }];

            mockRouterEvents.next(new NavigationEnd(1, '/url', '/url'));

            expect(component.breadcrumbs.length).toBe(0);
            expect(spy).toHaveBeenCalledWith(mockActivatedRoute);
        });

        it('should do nothing for other router events', () => {
            fixture.detectChanges();
            const spy = spyOn(component, 'buildBreadcrumb');
            component.breadcrumbs = [{ label: 'old', link: '/old' }];

            mockRouterEvents.next({ type: 'OtherEvent' });

            expect(component.breadcrumbs.length).toBe(1);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('buildBreadcrumb', () => {
        it('should build breadcrumb from route data', () => {
            mockActivatedRoute.snapshot.data = { breadcrumb: 'Home' };
            mockActivatedRoute.routeConfig = { path: 'home' };

            component.breadcrumbs = [];
            component.buildBreadcrumb(mockActivatedRoute);

            expect(component.breadcrumbs.length).toBe(1);
            expect(component.breadcrumbs[0]).toEqual({
                label: 'Home',
                link: '/home',
            });
        });

        it('should handle parameterized routes', () => {
            mockActivatedRoute.snapshot.data = { breadcrumb: { link: 'user/123' } }; // Mocked object label for test
            mockActivatedRoute.routeConfig = { path: ':id' };

            component.breadcrumbs = [{ label: 'Users', link: '/users' }];
            component.buildBreadcrumb(mockActivatedRoute);

            expect(component.breadcrumbs.length).toBe(2);
            expect(component.breadcrumbs[1].link).toBe('/users/user/123');
        });

        it('should set root route link if rootRoute is provided', () => {
            mockActivatedRoute.snapshot.data = { breadcrumb: 'Settings', rootRoute: '/main' };
            mockActivatedRoute.routeConfig = { path: 'settings' };

            component.breadcrumbs = [];
            component.buildBreadcrumb(mockActivatedRoute);

            expect(component.breadcrumbs[0].link).toBe('/main');
        });

        it('should recursively call buildBreadcrumb for child routes', () => {
            const childRoute = {
                snapshot: { data: { breadcrumb: 'Child' } },
                routeConfig: { path: 'child' },
                firstChild: null,
            };

            mockActivatedRoute.snapshot.data = { breadcrumb: 'Parent' };
            mockActivatedRoute.routeConfig = { path: 'parent' };
            mockActivatedRoute.firstChild = childRoute;

            component.breadcrumbs = [];
            component.buildBreadcrumb(mockActivatedRoute);

            expect(component.breadcrumbs.length).toBe(2);
            expect(component.breadcrumbs[0].label).toBe('Parent');
            expect(component.breadcrumbs[1].label).toBe('Child');
            expect(component.breadcrumbs[1].link).toBe('/parent/child');
        });

        it('should handle empty currentBCLink when routeConfig is undefined', () => {
            mockActivatedRoute.snapshot.data = { breadcrumb: 'Unknown' };
            mockActivatedRoute.routeConfig = null;

            component.breadcrumbs = [];
            component.buildBreadcrumb(mockActivatedRoute);

            expect(component.breadcrumbs[0].link).toBe('/');
        });
    });
});
