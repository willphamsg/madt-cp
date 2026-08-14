// safe-json.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root', // This will provide the service globally across your app
})
export class SafeJsonService {
    constructor() {}

    /**
     * Safely parses a JSON string.
     * @param jsonString The JSON string to parse.
     * @returns The parsed object or null if parsing fails.
     */
    safeParse(jsonString: string): any {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            // Optionally log the error or handle it accordingly
            console.error('Invalid JSON string:', e);
            return {}; // Or return a default value, or undefined, depending on your needs
        }
    }
}
