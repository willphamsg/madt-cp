import { randomFraction, randomIndex } from './dummy-fixtures';

describe('dummy-fixtures random helpers', () => {
    it('should draw fractions inside [0, 1)', () => {
        for (let i = 0; i < 500; i++) {
            const value = randomFraction();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });

    it('should draw integer indexes inside [0, maxExclusive)', () => {
        for (let i = 0; i < 500; i++) {
            const index = randomIndex(12);
            expect(Number.isInteger(index)).toBeTrue();
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(12);
        }
    });

    it('should always return 0 for a single-entry list', () => {
        expect(randomIndex(1)).toBe(0);
    });

    it('should spread values across the range', () => {
        const seen = new Set(Array.from({ length: 200 }, () => randomIndex(5)));
        expect(seen.size).toBeGreaterThan(1);
    });
});
