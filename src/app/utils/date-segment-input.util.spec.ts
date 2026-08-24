import {
    buildDateFromSegments,
    clampDateSegment,
    emptyDateSegmentValues,
    focusNextDateSegment,
} from './date-segment-input.util';

describe('date-segment-input.util', () => {
    describe('emptyDateSegmentValues', () => {
        it('returns all segments as empty strings', () => {
            expect(emptyDateSegmentValues()).toEqual({
                year: '',
                month: '',
                day: '',
                hour: '',
                minute: '',
                second: '',
            });
        });
    });

    describe('clampDateSegment', () => {
        it('clamps month above 12 to 12', () => {
            const dateValue = emptyDateSegmentValues();
            expect(clampDateSegment(dateValue, 'month', '13')).toBe('12');
            expect(dateValue.month).toBe('12');
        });

        it('passes month at or below 12 through unchanged', () => {
            const dateValue = emptyDateSegmentValues();
            expect(clampDateSegment(dateValue, 'month', '7')).toBe('7');
        });

        it('clamps day above 31 to 31', () => {
            const dateValue = emptyDateSegmentValues();
            expect(clampDateSegment(dateValue, 'day', '35')).toBe('31');
            expect(dateValue.day).toBe('31');
        });

        it('clamps hour above 23 to 23', () => {
            const dateValue = emptyDateSegmentValues();
            expect(clampDateSegment(dateValue, 'hour', '25')).toBe('23');
            expect(dateValue.hour).toBe('23');
        });

        it('clamps minute above 59 to 59', () => {
            const dateValue = emptyDateSegmentValues();
            expect(clampDateSegment(dateValue, 'minute', '65')).toBe('59');
            expect(dateValue.minute).toBe('59');
        });

        it('clamps second above 59 to 59', () => {
            const dateValue = emptyDateSegmentValues();
            expect(clampDateSegment(dateValue, 'second', '65')).toBe('59');
            expect(dateValue.second).toBe('59');
        });

        it('passes year through unchanged (no clamp rule)', () => {
            const dateValue = emptyDateSegmentValues();
            expect(clampDateSegment(dateValue, 'year', '2025')).toBe('2025');
            expect(dateValue.year).toBe('2025');
        });
    });

    describe('focusNextDateSegment', () => {
        afterEach(() => {
            document.querySelectorAll('[data-test-created]').forEach((el) => el.remove());
        });

        function createInput(id: string, order: number, value = ''): HTMLInputElement {
            const input = document.createElement('input');
            input.id = id;
            input.value = value;
            input.dataset['order'] = String(order);
            input.setAttribute('data-test-created', 'true');
            document.body.appendChild(input);
            return input;
        }

        it('returns null when there is no adjacent field', () => {
            const lone = createInput('second', 6, '55');
            expect(focusNextDateSegment(lone, '55', false, false)).toBeNull();
        });

        it('moves focus forward when the year segment is full', () => {
            const year = createInput('year', 3, '2025');
            const hour = createInput('hour', 4);
            expect(focusNextDateSegment(year, '2025', false, false)).toBe('hour');
            expect(document.activeElement).toBe(hour);
        });

        it('moves focus forward when a non-year segment is full', () => {
            const day = createInput('day', 1, '15');
            const month = createInput('month', 2);
            expect(focusNextDateSegment(day, '15', false, false)).toBe('month');
            expect(document.activeElement).toBe(month);
        });

        it('moves focus backward on backspace at the start of a field', () => {
            const day = createInput('day', 1, '15');
            const month = createInput('month', 2, '05');
            expect(focusNextDateSegment(month, '05', true, true)).toBe('day');
            expect(document.activeElement).toBe(day);
        });

        it('moves focus backward on backspace when the field becomes empty', () => {
            const day = createInput('day', 1, '15');
            const month = createInput('month', 2, '');
            expect(focusNextDateSegment(month, '', true, false)).toBe('day');
            expect(document.activeElement).toBe(day);
        });

        it('does not move focus when neither condition is met', () => {
            createInput('day', 1, '15');
            const month = createInput('month', 2, '1');
            expect(focusNextDateSegment(month, '1', false, false)).toBeNull();
        });
    });

    describe('buildDateFromSegments', () => {
        it('reports a valid real calendar date', () => {
            const { date, isValid } = buildDateFromSegments({
                year: '2025',
                month: '06',
                day: '15',
                hour: '10',
                minute: '00',
                second: '00',
            });
            expect(isValid).toBeTrue();
            expect(date.getFullYear()).toBe(2025);
            expect(date.getMonth()).toBe(5);
            expect(date.getDate()).toBe(15);
        });

        it('reports an impossible calendar date as invalid (e.g. Feb 30)', () => {
            const { isValid } = buildDateFromSegments({
                year: '2023',
                month: '02',
                day: '30',
                hour: '10',
                minute: '00',
                second: '00',
            });
            expect(isValid).toBeFalse();
        });
    });
});
