import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService implements OnDestroy {
    private readonly subjects = new Map<string, BehaviorSubject<string | null>>();
    private readonly destroy$ = new Subject<void>();
    private readonly storageEventHandler: (event: StorageEvent) => void;

    constructor() {
        // Bind the storage event handler to maintain proper 'this' context
        this.storageEventHandler = this.handleStorageEvent.bind(this);
        // Listen for storage events from other tabs/windows
        this.initStorageListener();
    }

    /** Initialize storage event listener for cross-tab synchronization */
    private initStorageListener(): void {
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', this.storageEventHandler);
        }
    }

    /** Handle storage events from other tabs */
    private handleStorageEvent(event: StorageEvent): void {
        if (event.storageArea === localStorage && event.key !== null) {
            const subject = this.subjects.get(event.key);
            if (subject) {
                // Update the subject with the new value from the other tab
                subject.next(event.newValue);
            }
        }
    }

    /** Get observable for a specific localStorage key */
    watch(key: string): Observable<string | null> {
        if (!this.subjects.has(key)) {
            const subject = new BehaviorSubject<string | null>(this.getItem(key));
            this.subjects.set(key, subject);
        }

        return this.subjects.get(key)!.asObservable();
    }

    /** Get value from localStorage */
    getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return null;
        }
    }

    /** Set value in localStorage and update subject */
    setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);

            // Create subject if it doesn't exist
            if (!this.subjects.has(key)) {
                this.subjects.set(key, new BehaviorSubject<string | null>(value));
            } else {
                // Update existing subject
                this.subjects.get(key)?.next(value);
            }
        } catch (error) {
            console.warn('Error writing to localStorage:', error);
        }
    }

    /** Remove from localStorage and update subject */
    removeItem(key: string): void {
        try {
            localStorage.removeItem(key);

            if (this.subjects.has(key)) {
                this.subjects.get(key)?.next(null);
            }
        } catch (error) {
            console.warn('Error removing from localStorage:', error);
        }
    }

    /** Remove subject for a specific key to prevent memory leaks */
    unwatch(key: string): void {
        const subject = this.subjects.get(key);
        if (subject) {
            subject.complete();
            this.subjects.delete(key);
        }
    }

    /** Check if a key exists in localStorage */
    hasItem(key: string): boolean {
        try {
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.warn('Error checking localStorage:', error);
            return false;
        }
    }

    /** Clear all localStorage data and subjects */
    clear(): void {
        try {
            localStorage.clear();
            this.clearAllSubjects();
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
        }
    }

    /** Get all localStorage keys */
    getAllKeys(): string[] {
        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.warn('Error getting localStorage keys:', error);
            return [];
        }
    }

    /** Manually sync a specific key with current localStorage value */
    syncKey(key: string): void {
        const subject = this.subjects.get(key);
        if (subject) {
            const currentValue = this.getItem(key);
            subject.next(currentValue);
        }
    }

    /** Manually sync all watched keys with current localStorage values */
    syncAllKeys(): void {
        this.subjects.forEach((subject, key) => {
            const currentValue = this.getItem(key);
            subject.next(currentValue);
        });
    }

    /** Clean up all subjects to prevent memory leaks */
    private clearAllSubjects(): void {
        this.subjects.forEach((subject) => {
            subject.complete();
        });
        this.subjects.clear();
    }

    /** Public cleanup method for manual cleanup */
    public cleanup(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearAllSubjects();

        // Remove storage event listener
        if (typeof window !== 'undefined') {
            window.removeEventListener('storage', this.storageEventHandler);
        }
    }

    ngOnDestroy(): void {
        this.cleanup();
    }

    // Backward compatibility methods (deprecated)
    /** @deprecated Use getItem() instead */
    get(key: string): string | null {
        return this.getItem(key);
    }

    /** @deprecated Use setItem() instead */
    set(key: string, value: string): void {
        this.setItem(key, value);
    }

    /** @deprecated Use removeItem() instead */
    remove(key: string): void {
        this.removeItem(key);
    }
}
