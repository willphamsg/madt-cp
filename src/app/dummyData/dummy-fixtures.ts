/**
 * Shared literal fixtures + factory helpers for the dev-only dummy-data simulator
 * (`environment.dummy: true`). Several MQTT flows across `init-dummy-data.ts`,
 * `main-page.ts`, `maintenance.ts` and `fare.ts` respond with byte-identical
 * sample payloads (bus stop lists, external-devices status, etc.) — kept here once
 * instead of copy-pasted at every call site.
 */
import { ResponseStatus } from '@models';

export interface DummyFlow {
    id: number;
    label: string;
    isLatest: boolean;
    data: Record<string, unknown>;
}

/** Wraps a sample MQTT response payload for the `mqtt` debug screen's flow lists. */
export function flow(id: number, label: string, data: Record<string, unknown>): DummyFlow {
    return { id, label, isLatest: true, data };
}

export const BISHAN_BUS_STOP_LIST = [
    { Busid: '1', Name: 'Bishan Pk' },
    { Busid: '2', Name: 'Buspark' },
    { Busid: '3', Name: 'Bedok Interchange Boarding Berth 3 to 10 PK' },
    { Busid: '4', Name: 'Bendock interchange' },
    { Busid: '5', Name: 'Bishan Pk 2' },
    { Busid: '6', Name: 'Buspark 2' },
    { Busid: '7', Name: 'Bedok Interchange Boarding Berth 3 to 10 PK 2' },
    { Busid: '8', Name: 'Bendock interchange 2' },
    { Busid: '9', Name: 'Bishan Pk 3' },
    { Busid: '10', Name: 'Buspark 3' },
    { Busid: '11', Name: 'Bedok Interchange Boarding Berth 3 to 10 PK 3' },
    { Busid: '12', Name: 'Bendock interchange 3' },
];

export const SEMBAWANG_KM_BUS_STOP_LIST = [
    { Busid: '57059', Name: 'Opp Sembawang Air Base', km: '1.2' },
    { Busid: '57051', Name: 'Sembawang MRT Station Exit A', km: '2.2' },
    { Busid: '57041', Name: 'Sembawang Way Blk 404', km: '1' },
    { Busid: '57031', Name: 'Sembawang Crescent Blk 115', km: '12.2' },
    { Busid: '57021', Name: 'Sembawang Road Blk 241', km: '21.2' },
    { Busid: '57011', Name: 'Opp Sembawang Park', km: '4' },
    { Busid: '57001', Name: 'Sembawang Park', km: '1' },
    { Busid: '56991', Name: 'Sembawang Drive Blk 441', km: '13.2' },
    { Busid: '56981', Name: 'Sembawang Road Blk 435', km: '15.2' },
    { Busid: '56971', Name: 'Opp Sembawang Hill Park', km: '13.2' },
    { Busid: '56961', Name: 'Sembawang Hill Park', km: '1.2' },
];

export const EXTERNAL_DEVICES_ERROR_STATUS = {
    status: ResponseStatus.ERROR,
    testPrinter: { status: ResponseStatus.ERROR, message: 'OUT_OF_SERVICE' },
    printer: { status: ResponseStatus.ERROR, message: 'DOOR_OPEN' },
    GNSSAntenna: { status: ResponseStatus.SUCCESS },
    busETA: { status: ResponseStatus.SUCCESS },
    cv1: { status: ResponseStatus.SUCCESS },
    cv2: { status: ResponseStatus.ERROR, message: 'FAULTY' },
    cv3: { status: ResponseStatus.ERROR, message: 'FAULTY' },
    cv4: { status: ResponseStatus.SUCCESS },
    cv5: { status: ResponseStatus.SUCCESS },
    cv6: { status: ResponseStatus.SUCCESS },
};

export const SAMPLE_TRIP_DETAIL = {
    service: 58,
    direction: 1,
    variantName: 'M',
    firstBusStop: { Busid: '2', Name: 'Buskpark' },
    lastBusStop: { Busid: '4', Name: 'Bendock interchange' },
};

export const BREAKDOWN_REASON_LIST = [
    { id: 1, label: 'Engine Failure' },
    { id: 2, label: 'Flat Tyre' },
    { id: 3, label: 'Transmission Failure' },
    { id: 4, label: 'Flat Battery' },
    { id: 5, label: 'Electrical Fault' },
    { id: 6, label: 'Broken Widescreen' },
];

export const CASH_FARE_VALUES = {
    adultValues: [
        { index: 1, value: 120 },
        { index: 2, value: 140 },
        { index: 3, value: 160 },
        { index: 4, value: 180 },
        { index: 5, value: 200 },
        { index: 6, value: 220 },
    ],
    seniorValues: [
        { index: 1, value: 120 },
        { index: 2, value: 130 },
        { index: 3, value: 150 },
    ],
    studentValues: [
        { index: 1, value: 65 },
        { index: 2, value: 85 },
        { index: 3, value: 105 },
    ],
};

export const SAMPLE_SERVICE_LIST = [
    { serviceNumber: 12, dir: 1, variantName: 'A1' },
    { serviceNumber: 12, dir: 2, variantName: 'A LP2' },
    { serviceNumber: 12, dir: 3, variantName: 'C DR3' },
    { serviceNumber: 15, dir: 4, variantName: 'A DR4' },
    { serviceNumber: 16, dir: 5, variantName: 'D DR5' },
    { serviceNumber: 17, dir: 6, variantName: 'E DR5' },
    { serviceNumber: 18, dir: 7, variantName: 'A LP' },
    { serviceNumber: 19, dir: 8, variantName: 'F DR1' },
    { serviceNumber: 20, dir: 9, variantName: 'D DR3' },
];

export const DECK_TYPE_LIST = [
    { id: 1, label: 'SINGLE' },
    { id: 2, label: 'DOUBLE_TWO_DOORS' },
    { id: 3, label: 'DOUBLE_THREE_DOORS' },
    { id: 4, label: 'LONG_BUS' },
    { id: 5, label: '1 BCV' },
];

export const OPERATOR_LIST = [
    { id: 1, label: 'SBST', serviceProvider: 16 },
    { id: 2, label: 'SMRT', serviceProvider: 17 },
    { id: 3, label: 'LTAB', serviceProvider: 25 },
    { id: 4, label: 'BDBO', serviceProvider: 26 },
    { id: 5, label: 'LDBO', serviceProvider: 27 },
    { id: 6, label: 'MDBO', serviceProvider: 10 },
];

export const BUS_ID_INFO = {
    busId: 'SBS4567',
    operator: { id: 1, label: 'SBST', serviceProvider: 16 },
};

export const REDETECT_CV_LIST = [
    { cvNum: 1, status: 'INSTALLED', position: 'FRONT' },
    { cvNum: 2, status: 'NOT_INSTALLED', position: 'FRONT' },
    { cvNum: 3, status: 'NOT_INSTALLED', position: 'REAR_1' },
    { cvNum: 4, status: 'NOT_INSTALLED', position: 'REAR_1' },
    { cvNum: 5, status: 'NOT_INSTALLED', position: 'REAR_2' },
    { cvNum: 6, status: 'NOT_INSTALLED', position: 'REAR_2' },
];

export const FARE_CONSOLE_CONFIG = {
    // if the deck type options are dynamic, use the numeric id; otherwise use the string label
    deckType: { id: 1, label: 'Single' },
    fareBusStopMode: 2,
    dateTime: '2025-01-05T12:45:50+08:00',
    busId: 'SBS4567',
    serviceProvider: 16,
    complimentaryDays: 30,
    maximumcomplimentaryDays: 50,
    minDateTime: '2024-09-09T12:00:00+08:00',
};
