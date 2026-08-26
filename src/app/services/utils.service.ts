import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root', // This makes the service available globally
})
export class UtilsServices {
    constructor() {}

    /**
     * Deep equality check for objects and arrays.
     * @param obj1 - First object to compare
     * @param obj2 - Second object to compare
     * @returns boolean - true if objects are deeply equal, false otherwise
     */
    deepEqual(obj1: any, obj2: any): boolean {
        // If both are the same object, return true
        if (obj1 === obj2) return true;

        // If either is null or not an object, return false
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
            return false;
        }

        // Get the keys of both objects
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        // If the number of keys is different, the objects are not equal
        if (keys1.length !== keys2.length) {
            return false;
        }

        // Check each key-value pair recursively
        for (const key of keys1) {
            // Check if the key exists in both objects
            if (!keys2.includes(key)) {
                return false;
            }

            // Recursively compare values of the key
            if (!this.deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }

        // If all tests pass, the objects are equal
        return true;
    }

    nestedUrlHandler(url: string, textToRemove: string): string {
        return url?.replace(textToRemove, '');
    }

    hexToRgb(hex) {
        if (!hex) return 'black';
        // Remove the '0x' prefix if it exists
        hex = hex.replace(/^0x/, '');

        // Parse the red, green, and blue components from the hex string
        const r = Number.parseInt(hex.slice(0, 2), 16);
        const g = Number.parseInt(hex.slice(2, 4), 16);
        const b = Number.parseInt(hex.slice(4, 6), 16);

        return `rgb(${r}, ${g}, ${b})`;
    }

    createDateFromString(str: string): Date {
        const [datePart, timePart] = str.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);

        return new Date(year, month - 1, day, hour, minute, second);
    }

    private compareByDate(a, b, order: string): number {
        const date1 = this.createDateFromString(`${a['date']} ${a['time']}`);
        const date2 = this.createDateFromString(`${b['date']} ${b['time']}`);
        const sortResult = date1.getTime() - date2.getTime();
        return order === 'asc' ? sortResult : sortResult * -1;
    }

    private compareByField(valA, valB, order: string): number {
        if (typeof valA === 'string') {
            return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return order === 'asc' ? valA - valB : valB - valA;
    }

    multiSort(fields) {
        return (a, b) => {
            for (const { key, order } of fields) {
                if (key === 'date') {
                    const sortResult = this.compareByDate(a, b, order);
                    if (sortResult !== 0) return sortResult;
                    continue; // go to next field if dates are equal
                }

                const valA = a[key];
                const valB = b[key];

                if (valA === valB) continue; // go to next field

                return this.compareByField(valA, valB, order);
            }
            return 0; // all equal
        };
    }
}
