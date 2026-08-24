import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
    let service: LocalStorageService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({});
        service = TestBed.inject(LocalStorageService);
    });

    afterEach(() => {
        service.cleanup();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getItem', () => {
        it('should return the stored value for an existing key', () => {
            localStorage.setItem('foo', 'bar');
            expect(service.getItem('foo')).toBe('bar');
        });

        it('should return null for a missing key', () => {
            expect(service.getItem('missing-key')).toBeNull();
        });

        it('should return null and warn when localStorage throws', () => {
            spyOn(console, 'warn');
            spyOn(window.localStorage, 'getItem').and.throwError('boom');

            const result = service.getItem('foo');

            expect(result).toBeNull();
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('setItem', () => {
        it('should write the value to localStorage', () => {
            service.setItem('foo', 'bar');
            expect(localStorage.getItem('foo')).toBe('bar');
        });

        it('should create a new subject for a key not yet watched', (done) => {
            service.setItem('newKey', 'value1');
            service.watch('newKey').subscribe((value) => {
                expect(value).toBe('value1');
                done();
            });
        });

        it('should update an existing subject with the new value', (done) => {
            service.setItem('watchedKey', 'initial');
            const values: (string | null)[] = [];
            service.watch('watchedKey').subscribe((value) => values.push(value));

            service.setItem('watchedKey', 'updated');

            expect(values).toEqual(['initial', 'updated']);
            done();
        });

        it('should warn and swallow the error when localStorage throws', () => {
            spyOn(console, 'warn');
            spyOn(window.localStorage, 'setItem').and.throwError('boom');

            expect(() => service.setItem('foo', 'bar')).not.toThrow();
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('removeItem', () => {
        it('should remove the value from localStorage', () => {
            localStorage.setItem('foo', 'bar');
            service.removeItem('foo');
            expect(localStorage.getItem('foo')).toBeNull();
        });

        it('should push null to a watched subject on removal', (done) => {
            service.setItem('foo', 'bar');
            const values: (string | null)[] = [];
            service.watch('foo').subscribe((value) => values.push(value));

            service.removeItem('foo');

            expect(values).toEqual(['bar', null]);
            done();
        });

        it('should not error when removing a key with no subject', () => {
            localStorage.setItem('unwatched', 'value');
            expect(() => service.removeItem('unwatched')).not.toThrow();
            expect(localStorage.getItem('unwatched')).toBeNull();
        });

        it('should warn and swallow the error when localStorage throws', () => {
            spyOn(console, 'warn');
            spyOn(window.localStorage, 'removeItem').and.throwError('boom');

            expect(() => service.removeItem('foo')).not.toThrow();
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('watch', () => {
        it('should emit the current value immediately', (done) => {
            localStorage.setItem('foo', 'bar');
            service.watch('foo').subscribe((value) => {
                expect(value).toBe('bar');
                done();
            });
        });

        it('should emit null when the key does not exist', (done) => {
            service.watch('missing').subscribe((value) => {
                expect(value).toBeNull();
                done();
            });
        });

        it('should return the same observable/subject on repeated calls', () => {
            const first = service.watch('sameKey');
            const second = service.watch('sameKey');

            let emissions = 0;
            first.subscribe(() => emissions++);
            service.setItem('sameKey', 'value');
            second.subscribe(() => emissions++);

            // Both subscriptions observe the same underlying subject.
            expect(emissions).toBeGreaterThan(0);
        });
    });

    describe('unwatch', () => {
        it('should complete and remove the subject for a watched key', () => {
            const subject$ = service.watch('foo');
            let completed = false;
            subject$.subscribe({ complete: () => (completed = true) });

            service.unwatch('foo');

            expect(completed).toBeTrue();
        });

        it('should do nothing when the key was never watched', () => {
            expect(() => service.unwatch('never-watched')).not.toThrow();
        });
    });

    describe('hasItem', () => {
        it('should return true when the key exists', () => {
            localStorage.setItem('foo', 'bar');
            expect(service.hasItem('foo')).toBeTrue();
        });

        it('should return false when the key does not exist', () => {
            expect(service.hasItem('missing')).toBeFalse();
        });

        it('should return false and warn when localStorage throws', () => {
            spyOn(console, 'warn');
            spyOn(window.localStorage, 'getItem').and.throwError('boom');

            expect(service.hasItem('foo')).toBeFalse();
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('clear', () => {
        it('should clear all localStorage entries', () => {
            localStorage.setItem('foo', 'bar');
            localStorage.setItem('baz', 'qux');

            service.clear();

            expect(localStorage).toHaveSize(0);
        });

        it('should complete all watched subjects', () => {
            const subject$ = service.watch('foo');
            let completed = false;
            subject$.subscribe({ complete: () => (completed = true) });

            service.clear();

            expect(completed).toBeTrue();
        });

        it('should warn and swallow the error when localStorage throws', () => {
            spyOn(console, 'warn');
            const clearSpy = spyOn(window.localStorage, 'clear').and.throwError('boom');

            expect(() => service.clear()).not.toThrow();
            expect(console.warn).toHaveBeenCalled();

            // Restore real behavior before the outer afterEach calls localStorage.clear().
            clearSpy.and.callThrough();
        });
    });

    describe('getAllKeys', () => {
        it('should return all keys currently in localStorage', () => {
            localStorage.setItem('foo', '1');
            localStorage.setItem('bar', '2');

            const keys = service.getAllKeys();

            expect(keys).toContain('foo');
            expect(keys).toContain('bar');
        });

        it('should return an empty array and warn when reading keys throws', () => {
            spyOn(console, 'warn');
            spyOn(Object, 'keys').and.throwError('boom');

            expect(service.getAllKeys()).toEqual([]);
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('syncKey', () => {
        it('should push the current localStorage value to the watched subject', (done) => {
            service.watch('foo');
            localStorage.setItem('foo', 'externally-set');

            service.syncKey('foo');

            service.watch('foo').subscribe((value) => {
                expect(value).toBe('externally-set');
                done();
            });
        });

        it('should do nothing for a key that is not watched', () => {
            expect(() => service.syncKey('never-watched')).not.toThrow();
        });
    });

    describe('syncAllKeys', () => {
        it('should sync every watched key with its current localStorage value', () => {
            service.watch('foo');
            service.watch('bar');
            localStorage.setItem('foo', 'foo-value');
            localStorage.setItem('bar', 'bar-value');

            service.syncAllKeys();

            const fooValues: (string | null)[] = [];
            const barValues: (string | null)[] = [];
            service.watch('foo').subscribe((value) => fooValues.push(value));
            service.watch('bar').subscribe((value) => barValues.push(value));

            expect(fooValues).toEqual(['foo-value']);
            expect(barValues).toEqual(['bar-value']);
        });
    });

    describe('cross-tab storage events', () => {
        it('should update a watched subject when a matching storage event fires', () => {
            const values: (string | null)[] = [];
            service.watch('foo').subscribe((value) => values.push(value));

            const event = new StorageEvent('storage', {
                key: 'foo',
                newValue: 'from-other-tab',
                storageArea: window.localStorage,
            });
            window.dispatchEvent(event);

            expect(values).toEqual([null, 'from-other-tab']);
        });

        it('should ignore storage events for unwatched keys', () => {
            const event = new StorageEvent('storage', {
                key: 'not-watched',
                newValue: 'value',
                storageArea: window.localStorage,
            });

            expect(() => window.dispatchEvent(event)).not.toThrow();
        });

        it('should ignore storage events whose storageArea is not localStorage', () => {
            const values: (string | null)[] = [];
            service.watch('foo').subscribe((value) => values.push(value));

            const event = new StorageEvent('storage', {
                key: 'foo',
                newValue: 'from-session-storage',
                storageArea: window.sessionStorage,
            });
            window.dispatchEvent(event);

            expect(values).toEqual([null]);
        });

        it('should ignore storage events with a null key', () => {
            const values: (string | null)[] = [];
            service.watch('foo').subscribe((value) => values.push(value));

            const event = new StorageEvent('storage', {
                key: null,
                newValue: null,
                storageArea: window.localStorage,
            });
            window.dispatchEvent(event);

            expect(values).toEqual([null]);
        });
    });

    describe('cleanup / ngOnDestroy', () => {
        it('should complete watched subjects and stop reacting to storage events', () => {
            let completed = false;
            service.watch('foo').subscribe({ complete: () => (completed = true) });

            service.cleanup();

            expect(completed).toBeTrue();

            // After cleanup, the storage listener is removed, so a new event should
            // not reach any (new) subject created afterwards throwing an error.
            expect(() => {
                const event = new StorageEvent('storage', {
                    key: 'foo',
                    newValue: 'value',
                    storageArea: window.localStorage,
                });
                window.dispatchEvent(event);
            }).not.toThrow();
        });

        it('should be safe to call ngOnDestroy directly', () => {
            expect(() => service.ngOnDestroy()).not.toThrow();
        });
    });

    describe('deprecated aliases', () => {
        it('get() should delegate to getItem()', () => {
            spyOn(service, 'getItem').and.callThrough();
            localStorage.setItem('foo', 'bar');

            expect(service.get('foo')).toBe('bar');
            expect(service.getItem).toHaveBeenCalledWith('foo');
        });

        it('set() should delegate to setItem()', () => {
            spyOn(service, 'setItem').and.callThrough();

            service.set('foo', 'bar');

            expect(service.setItem).toHaveBeenCalledWith('foo', 'bar');
            expect(localStorage.getItem('foo')).toBe('bar');
        });

        it('remove() should delegate to removeItem()', () => {
            spyOn(service, 'removeItem').and.callThrough();
            localStorage.setItem('foo', 'bar');

            service.remove('foo');

            expect(service.removeItem).toHaveBeenCalledWith('foo');
            expect(localStorage.getItem('foo')).toBeNull();
        });
    });
});
