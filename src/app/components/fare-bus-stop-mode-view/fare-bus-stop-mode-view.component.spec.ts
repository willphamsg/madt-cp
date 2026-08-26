import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { FareBusStopModeViewComponent } from './fare-bus-stop-mode-view.component';
import { MsgID, ResponseStatus } from '@models';

describe('FareBusStopModeViewComponent', () => {
    let component: FareBusStopModeViewComponent;
    let fixture: ComponentFixture<FareBusStopModeViewComponent>;

    const render = () => fixture.detectChanges();
    const query = (selector: string) => (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
    const click = (selector: string) => {
        const element = query(selector);
        expect(element).withContext(`expected ${selector} to be rendered`).not.toBeNull();
        element?.click();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FareBusStopModeViewComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FareBusStopModeViewComponent);
        component = fixture.componentInstance;
        component.fareBusStopMode = {};
        component.mode = 0;
        component.finaleMode = 0;
        component.posnStatus$ = of(undefined);
        render();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should carry the page class on its host element so the page styles apply', () => {
        expect((fixture.nativeElement as HTMLElement).classList).toContain('device-operation-content');
    });

    it('should map the position source codes and fall back to an empty string', () => {
        expect(component.mappingPosnStatus(1)).toBe('FMS');
        expect(component.mappingPosnStatus(2)).toBe('FARE_SYSTEM');
        expect(component.mappingPosnStatus(3)).toBe('NONE');
        expect(component.mappingPosnStatus(99)).toBe('');
    });

    describe('mode selection', () => {
        it('should emit the mode the operator picked', () => {
            const spy = jasmine.createSpy('selectMode');
            component.selectMode.subscribe(spy);

            const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
                '.device-operation-button',
            );
            buttons[0].click();
            buttons[1].click();

            expect(spy.calls.allArgs()).toEqual([[1], [2]]);
        });

        it('should highlight the mode currently in force', () => {
            component.finaleMode = 2;
            render();

            const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('.device-operation-button');
            expect(buttons[0].classList).not.toContain('active');
            expect(buttons[1].classList).toContain('active');
        });

        it('should emit back when the operator leaves the screen', () => {
            const spy = jasmine.createSpy('back');
            component.back.subscribe(spy);

            click('.back-button');

            expect(spy).toHaveBeenCalled();
        });

        it('should show the position sources once they are known', () => {
            component.posnStatus$ = of({ GNSSSource: 1, busLocationSource: 2 });
            render();

            expect(query('.source-info')).not.toBeNull();
        });
    });

    describe('confirmation dialog', () => {
        beforeEach(() => {
            component.fareBusStopMode = { msgID: MsgID.FARE_BUS_STOP_MODE_SELECT };
            component.mode = 1;
            render();
        });

        it('should emit cancelMode when the operator backs out', () => {
            const spy = jasmine.createSpy('cancelMode');
            component.cancelMode.subscribe(spy);

            click('.btn-cancel');

            expect(spy).toHaveBeenCalled();
        });

        it('should emit confirmMode when the operator proceeds', () => {
            const spy = jasmine.createSpy('confirmMode');
            component.confirmMode.subscribe(spy);

            click('.btn-confirm');

            expect(spy).toHaveBeenCalled();
        });
    });

    it('should show the confirmation dialog again when a submit fails', () => {
        component.fareBusStopMode = { msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT, status: ResponseStatus.ERROR };
        render();

        expect(query('.btn-confirm')).not.toBeNull();
    });

    it('should emit backToSelect from the success dialog', () => {
        component.fareBusStopMode = { msgID: MsgID.FARE_BUS_STOP_MODE_SUBMIT, status: ResponseStatus.SUCCESS };
        render();
        const spy = jasmine.createSpy('backToSelect');
        component.backToSelect.subscribe(spy);

        click('.btn-ok');

        expect(spy).toHaveBeenCalled();
    });
});
