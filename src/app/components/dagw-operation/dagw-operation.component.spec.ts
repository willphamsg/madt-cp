import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DagwOperationComponent } from './dagw-operation.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockInitialState } from '../../testing/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { dagwOperation } from '@store/main/main.reducer';
import { IDagwOperation } from '@models';
import { of } from 'rxjs';

describe('DagwOperationComponent', () => {
    let component: DagwOperationComponent;
    let fixture: ComponentFixture<DagwOperationComponent>;
    let store: MockStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), DagwOperationComponent],
            providers: [provideHttpClient(), provideMockStore({ initialState: mockInitialState }), provideRouter([])],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        store = TestBed.inject(MockStore);
        fixture = TestBed.createComponent(DagwOperationComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges so ngOnInit can be tested manually
    });

    it('should create the component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should subscribe to dagwOperation$ and set dagwOperationData', () => {
            const mockData: IDagwOperation = { msgID: 1, title: 'Test Title', message: 'Test Message' };
            component.dagwOperation$ = of(mockData);

            component.ngOnInit();

            expect(component.dagwOperationData).toEqual(mockData);
        });
    });

    describe('handleCancelDagwOperation', () => {
        it('should emit cancel event', () => {
            const emitSpy = spyOn(component.cancel, 'emit');
            component.handleCancelDagwOperation();
            expect(emitSpy).toHaveBeenCalled();
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
