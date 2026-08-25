import { IExternalDevice, ResponseStatus } from '@models';

/**
 * The main/fare screens seed the test printer with 0 rather than NA. It is not a
 * ResponseStatus member, so it matches none of the template's status branches and the
 * row stays on "TESTING" until the TC reports back.
 */
export const TEST_PRINTER_UNTESTED = 0;

/**
 * Fresh "nothing reported yet" payload for the external-devices diagnostics screens.
 * The test printer's status is caller-supplied because the screens disagree on it.
 */
export function createInitialExternalDevices(testPrinterStatus: number = ResponseStatus.NA): IExternalDevice {
    return {
        testPrinter: { status: testPrinterStatus, message: '' },
        printer: { status: ResponseStatus.NA, message: '' },
        GNSSAntenna: { status: ResponseStatus.NA, message: '' },
        busETA: { status: ResponseStatus.NA, message: '' },
        cv1: { status: ResponseStatus.NA, message: '' },
        cv2: { status: ResponseStatus.NA, message: '' },
        cv3: { status: ResponseStatus.NA, message: '' },
        cv4: { status: ResponseStatus.NA, message: '' },
        cv5: { status: ResponseStatus.NA, message: '' },
        cv6: { status: ResponseStatus.NA, message: '' },
    };
}

/** Keys of the cv1..cv6 slots the TC actually reported, in order. */
export function listExistingCvs(devices: IExternalDevice): string[] {
    const result: string[] = [];
    [1, 2, 3, 4, 5, 6].forEach((num) => {
        if (devices[`cv${num}`]) {
            result.push(`cv${num}`);
        }
    });
    return result;
}

export function hasFieldStatus(devices: IExternalDevice, field: string, status: number): boolean {
    return devices[field]?.['status'] === status;
}

export function fieldMessage(devices: IExternalDevice, field: string) {
    return devices[field]['message'];
}
