import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import * as CryptoJS from 'crypto-js';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('encryptPassword', () => {
        it('should throw when plainPassword is empty', () => {
            expect(() => service.encryptPassword('')).toThrowError('Password cannot be empty.');
        });

        it('should throw when secretKey is empty', () => {
            expect(() => service.encryptPassword('pass123', '')).toThrowError('Secret key cannot be empty.');
        });

        it('should return an enc:-prefixed string when given valid inputs', () => {
            const result = service.encryptPassword('pass123');
            expect(result.startsWith('enc:')).toBeTrue();
        });
    });

    describe('decryptPassword', () => {
        it('should throw when encryptedPassword is empty', () => {
            expect(() => service.decryptPassword('')).toThrowError('Encrypted password cannot be empty.');
        });

        it('should throw when secretKey is empty', () => {
            expect(() => service.decryptPassword('enc:abc', '')).toThrowError('Secret key cannot be empty.');
        });

        it('should decrypt a value produced by encryptPassword (enc: prefix stripped)', () => {
            const encrypted = service.encryptPassword('pass123');
            expect(service.decryptPassword(encrypted)).toBe('pass123');
        });

        it('should decrypt a raw payload without the enc: prefix', () => {
            const encrypted = service.encryptPassword('pass123').slice(4);
            expect(service.decryptPassword(encrypted)).toBe('pass123');
        });

        it('should throw when decryption fails to produce a plain password', () => {
            spyOn(CryptoJS.AES, 'decrypt').and.returnValue({ toString: () => '' } as CryptoJS.lib.WordArray);
            expect(() => service.decryptPassword('enc:whatever')).toThrowError('Failed to decrypt password.');
        });
    });

    describe('hashPassword', () => {
        it('should delegate to encryptPassword and return an enc:-prefixed string', async () => {
            const result = await service.hashPassword('pass123');
            expect(result.startsWith('enc:')).toBeTrue();
        });
    });

    describe('verifyPassword', () => {
        it('should return false when plainPassword is missing', async () => {
            expect(await service.verifyPassword('', 'enc:abc')).toBeFalse();
        });

        it('should return false when passwordHashOrEncrypted is missing', async () => {
            expect(await service.verifyPassword('pass123', '')).toBeFalse();
        });

        it('should return true when the enc:-prefixed value decrypts to the plain password', async () => {
            const encrypted = service.encryptPassword('pass123');
            expect(await service.verifyPassword('pass123', encrypted)).toBeTrue();
        });

        it('should return false when the enc:-prefixed value decrypts to a different password', async () => {
            const encrypted = service.encryptPassword('other');
            expect(await service.verifyPassword('pass123', encrypted)).toBeFalse();
        });

        it('should return false when decrypting the enc:-prefixed value throws', async () => {
            expect(await service.verifyPassword('pass123', 'enc:not-a-real-payload')).toBeFalse();
        });

        it('should compare plainly when there is no enc: prefix', async () => {
            expect(await service.verifyPassword('pass123', 'pass123')).toBeTrue();
            expect(await service.verifyPassword('pass123', 'other')).toBeFalse();
        });
    });
});
