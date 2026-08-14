import { TestBed } from '@angular/core/testing';

import { UtilsServices } from './utils.service';

describe('UtilsServices', () => {
    let service: UtilsServices;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UtilsServices],
        });
        service = TestBed.inject(UtilsServices);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('deepEqual', () => {
        it('returns true for the same primitive value (===)', () => {
            expect(service.deepEqual(5, 5)).toBe(true);
            expect(service.deepEqual('abc', 'abc')).toBe(true);
        });

        it('returns true when both reference the same object', () => {
            const obj = { a: 1 };
            expect(service.deepEqual(obj, obj)).toBe(true);
        });

        it('returns false when obj1 is not an object (and not === obj2)', () => {
            expect(service.deepEqual(5, { a: 1 })).toBe(false);
            expect(service.deepEqual('str', { a: 1 })).toBe(false);
        });

        it('returns false when obj1 is null', () => {
            expect(service.deepEqual(null, { a: 1 })).toBe(false);
        });

        it('returns false when obj2 is not an object', () => {
            expect(service.deepEqual({ a: 1 }, 5)).toBe(false);
        });

        it('returns false when obj2 is null', () => {
            expect(service.deepEqual({ a: 1 }, null)).toBe(false);
        });

        it('returns false when both are null (typeof null is object triggers null check)', () => {
            // obj1 === obj2 short-circuits to true since null === null
            expect(service.deepEqual(null, null)).toBe(true);
        });

        it('returns false when key counts differ', () => {
            expect(service.deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        });

        it('returns false when key sets differ but lengths match', () => {
            expect(service.deepEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
        });

        it('returns false when a nested value differs', () => {
            expect(service.deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
        });

        it('returns true for deeply equal nested objects', () => {
            const obj1 = { a: 1, b: { c: 2, d: [1, 2, 3] } };
            const obj2 = { a: 1, b: { c: 2, d: [1, 2, 3] } };
            expect(service.deepEqual(obj1, obj2)).toBe(true);
        });

        it('returns false for arrays with different values', () => {
            expect(service.deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
        });

        it('returns true for equal arrays', () => {
            expect(service.deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        });

        it('returns true for two empty objects', () => {
            expect(service.deepEqual({}, {})).toBe(true);
        });
    });

    describe('nestedUrlHandler', () => {
        it('removes the given text from the url', () => {
            expect(service.nestedUrlHandler('/app/main/login', '/app')).toBe('/main/login');
        });

        it('returns the original url when textToRemove is not present', () => {
            expect(service.nestedUrlHandler('/main/login', '/foo')).toBe('/main/login');
        });

        it('returns undefined when url is undefined (optional chaining short-circuit)', () => {
            expect(service.nestedUrlHandler(undefined as unknown as string, '/foo')).toBeUndefined();
        });

        it('returns undefined when url is null (optional chaining short-circuit)', () => {
            expect(service.nestedUrlHandler(null as unknown as string, '/foo')).toBeUndefined();
        });

        it('handles empty string textToRemove', () => {
            expect(service.nestedUrlHandler('/main/login', '')).toBe('/main/login');
        });
    });

    describe('hexToRgb', () => {
        it('returns black for undefined hex', () => {
            expect(service.hexToRgb(undefined)).toBe('black');
        });

        it('returns black for null hex', () => {
            expect(service.hexToRgb(null)).toBe('black');
        });

        it('returns black for empty string hex', () => {
            expect(service.hexToRgb('')).toBe('black');
        });

        it('converts a hex string without 0x prefix to rgb', () => {
            expect(service.hexToRgb('ff0000')).toBe('rgb(255, 0, 0)');
        });

        it('converts a hex string with 0x prefix to rgb', () => {
            expect(service.hexToRgb('0x00ff00')).toBe('rgb(0, 255, 0)');
        });

        it('converts a mixed value hex string to rgb', () => {
            expect(service.hexToRgb('0a1b2c')).toBe('rgb(10, 27, 44)');
        });
    });

    describe('createDateFromString', () => {
        it('parses a "dd/mm/yyyy hh:mm:ss" string into a Date', () => {
            const result = service.createDateFromString('25/12/2023 10:30:45');
            expect(result.getFullYear()).toBe(2023);
            expect(result.getMonth()).toBe(11); // December -> 0-indexed
            expect(result.getDate()).toBe(25);
            expect(result.getHours()).toBe(10);
            expect(result.getMinutes()).toBe(30);
            expect(result.getSeconds()).toBe(45);
        });

        it('parses a single-digit day/month/time correctly', () => {
            const result = service.createDateFromString('01/02/2020 01:02:03');
            expect(result.getFullYear()).toBe(2020);
            expect(result.getMonth()).toBe(1); // February
            expect(result.getDate()).toBe(1);
            expect(result.getHours()).toBe(1);
            expect(result.getMinutes()).toBe(2);
            expect(result.getSeconds()).toBe(3);
        });
    });

    describe('multiSort', () => {
        it('sorts by string field ascending', () => {
            const data = [{ name: 'banana' }, { name: 'apple' }, { name: 'cherry' }];
            const sorted = [...data].sort(service.multiSort([{ key: 'name', order: 'asc' }]));
            expect(sorted.map((d) => d.name)).toEqual(['apple', 'banana', 'cherry']);
        });

        it('sorts by string field descending', () => {
            const data = [{ name: 'banana' }, { name: 'apple' }, { name: 'cherry' }];
            const sorted = [...data].sort(service.multiSort([{ key: 'name', order: 'desc' }]));
            expect(sorted.map((d) => d.name)).toEqual(['cherry', 'banana', 'apple']);
        });

        it('sorts by numeric field ascending', () => {
            const data = [{ amount: 30 }, { amount: 10 }, { amount: 20 }];
            const sorted = [...data].sort(service.multiSort([{ key: 'amount', order: 'asc' }]));
            expect(sorted.map((d) => d.amount)).toEqual([10, 20, 30]);
        });

        it('sorts by numeric field descending', () => {
            const data = [{ amount: 30 }, { amount: 10 }, { amount: 20 }];
            const sorted = [...data].sort(service.multiSort([{ key: 'amount', order: 'desc' }]));
            expect(sorted.map((d) => d.amount)).toEqual([30, 20, 10]);
        });

        it('sorts by date field ascending using date + time properties', () => {
            const data = [
                { date: '25/12/2023', time: '10:00:00' },
                { date: '24/12/2023', time: '09:00:00' },
                { date: '26/12/2023', time: '08:00:00' },
            ];
            const sorted = [...data].sort(service.multiSort([{ key: 'date', order: 'asc' }]));
            expect(sorted.map((d) => d.date)).toEqual(['24/12/2023', '25/12/2023', '26/12/2023']);
        });

        it('sorts by date field descending using date + time properties', () => {
            const data = [
                { date: '25/12/2023', time: '10:00:00' },
                { date: '24/12/2023', time: '09:00:00' },
                { date: '26/12/2023', time: '08:00:00' },
            ];
            const sorted = [...data].sort(service.multiSort([{ key: 'date', order: 'desc' }]));
            expect(sorted.map((d) => d.date)).toEqual(['26/12/2023', '25/12/2023', '24/12/2023']);
        });

        it('falls through to the next field when the primary field values are equal', () => {
            const data = [
                { group: 'A', name: 'banana' },
                { group: 'A', name: 'apple' },
                { group: 'B', name: 'cherry' },
            ];
            const sorted = [...data].sort(
                service.multiSort([
                    { key: 'group', order: 'asc' },
                    { key: 'name', order: 'asc' },
                ]),
            );
            expect(sorted.map((d) => `${d.group}-${d.name}`)).toEqual(['A-apple', 'A-banana', 'B-cherry']);
        });

        it('falls through to the next field when dates are equal', () => {
            const data = [
                { date: '25/12/2023', time: '10:00:00', name: 'banana' },
                { date: '25/12/2023', time: '10:00:00', name: 'apple' },
            ];
            const sorted = [...data].sort(
                service.multiSort([
                    { key: 'date', order: 'asc' },
                    { key: 'name', order: 'asc' },
                ]),
            );
            expect(sorted.map((d) => d.name)).toEqual(['apple', 'banana']);
        });

        it('returns 0 when all fields are equal across all keys', () => {
            const data = [
                { group: 'A', name: 'apple' },
                { group: 'A', name: 'apple' },
            ];
            const sorted = [...data].sort(
                service.multiSort([
                    { key: 'group', order: 'asc' },
                    { key: 'name', order: 'asc' },
                ]),
            );
            expect(sorted.map((d) => `${d.group}-${d.name}`)).toEqual(['A-apple', 'A-apple']);
        });
    });
});
