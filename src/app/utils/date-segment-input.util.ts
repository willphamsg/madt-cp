export type DateTimeInputType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

export interface DateSegmentValues {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
}

export function emptyDateSegmentValues(): DateSegmentValues {
    return { year: '', month: '', day: '', hour: '', minute: '', second: '' };
}

/**
 * Clamps a raw segment value to its valid range (e.g. month <= 12), stores the
 * clamped value on `dateValue[type]`, and returns it. Shared by every screen
 * that renders a segmented year/month/day/hour/minute/second date input.
 */
export function clampDateSegment(dateValue: DateSegmentValues, type: DateTimeInputType, rawValue: string): string {
    let outPutVal: string = rawValue.trim();
    switch (type) {
        case 'month':
            outPutVal = Number(rawValue) > 12 ? '12' : rawValue;
            break;
        case 'day':
            outPutVal = Number(rawValue) > 31 ? '31' : rawValue;
            break;
        case 'hour':
            outPutVal = Number(rawValue) > 23 ? '23' : rawValue;
            break;
        case 'minute':
        case 'second':
            outPutVal = Number(rawValue) > 59 ? '59' : rawValue;
            break;
    }
    dateValue[type] = outPutVal;
    return outPutVal;
}

/**
 * Moves focus to the adjacent segment `<input>` (chained via a `data-order`
 * attribute) once the current segment is full (typing) or emptied
 * (backspacing). Returns the id of the segment that received focus, or null
 * if focus did not move.
 */
export function focusNextDateSegment(
    inputField: HTMLInputElement,
    value: string,
    isBackspace: boolean,
    firstCursor: boolean,
): DateTimeInputType | null {
    const nextOrder = Number(inputField.dataset['order']) + (isBackspace ? -1 : 1);
    const nextInputField = document.querySelector<HTMLInputElement>(`input[data-order="${nextOrder}"]`);
    const inputType = inputField.id as DateTimeInputType;

    if (!nextInputField) return null;
    const nextInputValueLength = nextInputField?.value?.length ?? 0;

    const shouldMoveToNext =
        (value.length === (inputType === 'year' ? 4 : 2) && !isBackspace) || ((firstCursor || !value) && isBackspace);
    if (shouldMoveToNext) {
        nextInputField.focus();
        nextInputField.setSelectionRange(nextInputValueLength, nextInputValueLength);
        return nextInputField.id as DateTimeInputType;
    }
    return null;
}

/**
 * Builds a Date from segment strings and reports whether it round-trips to
 * the same calendar date (catches e.g. Feb 30 rolling over to Mar 2).
 */
export function buildDateFromSegments(dateValue: DateSegmentValues): { date: Date; isValid: boolean } {
    const date = new Date(
        Number(dateValue.year),
        Number(dateValue.month) - 1, // Subtract 1 because months are 0-indexed
        Number(dateValue.day),
        Number(dateValue.hour),
        Number(dateValue.minute),
        Number(dateValue.second),
    );
    const isValid =
        date.getFullYear() == Number(dateValue.year) &&
        date.getMonth() + 1 == Number(dateValue.month) &&
        date.getDate() == Number(dateValue.day);
    return { date, isValid };
}
