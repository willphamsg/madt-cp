import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ExternalDevicesViewComponent } from './external-devices-view.component';
import { createInitialExternalDevices } from '@components/external-devices-base/external-devices.util';
import { ResponseStatus } from '@models';

describe('ExternalDevicesViewComponent', () => {
    let component: ExternalDevicesViewComponent;
    let fixture: ComponentFixture<ExternalDevicesViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ExternalDevicesViewComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ExternalDevicesViewComponent);
        component = fixture.componentInstance;
        component.externalDevices = createInitialExternalDevices();
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should carry the page class on its host element so the page styles apply', () => {
        expect((fixture.nativeElement as HTMLElement).classList).toContain('external-devices-page');
    });

    it('should list only the cv slots the TC reported', () => {
        component.externalDevices = { cv1: { status: ResponseStatus.NA, message: '' } };
        expect(component.existingCvs()).toEqual(['cv1']);
    });

    it('should report a successful device', () => {
        component.externalDevices = { printer: { status: ResponseStatus.SUCCESS, message: '' } };
        expect(component.fieldSuccess('printer')).toBeTrue();
        expect(component.fieldError('printer')).toBeFalse();
    });

    it('should report a failed device with its error text', () => {
        component.externalDevices = { printer: { status: ResponseStatus.ERROR, message: 'Paper jam' } };
        expect(component.fieldError('printer')).toBeTrue();
        expect(component.fieldSuccess('printer')).toBeFalse();
        expect(component.errorText('printer')).toEqual('Paper jam');
    });

    const click = (selector: string) => {
        const element = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
        expect(element).withContext(`expected ${selector} to be rendered`).not.toBeNull();
        element?.click();
    };

    it('should emit printTest when the print button is tapped', () => {
        const spy = jasmine.createSpy('printTest');
        component.printTest.subscribe(spy);

        click('.button');

        expect(spy).toHaveBeenCalled();
    });

    it('should emit refresh when the refresh button is tapped', () => {
        const spy = jasmine.createSpy('refresh');
        component.refresh.subscribe(spy);
        component.externalDevices = { status: ResponseStatus.SUCCESS };
        fixture.detectChanges();

        click('.refresh-button');

        expect(spy).toHaveBeenCalled();
    });

    it('should emit a false confirm while the diagnostics are still running', () => {
        const spy = jasmine.createSpy('confirm');
        component.confirm.subscribe(spy);

        click('.btn-cancel');

        expect(spy).toHaveBeenCalledWith(false);
    });

    it('should emit a true confirm once the diagnostics have finished', () => {
        const spy = jasmine.createSpy('confirm');
        component.confirm.subscribe(spy);
        component.externalDevices = { status: ResponseStatus.SUCCESS };
        fixture.detectChanges();

        click('.btn-confirm');

        expect(spy).toHaveBeenCalledWith(true);
    });

    it('should surface the fallback message when a device reports an error', () => {
        component.externalDevices = { status: ResponseStatus.ERROR };
        fixture.detectChanges();

        expect((fixture.nativeElement as HTMLElement).querySelector('.error-text')).not.toBeNull();
    });
});
