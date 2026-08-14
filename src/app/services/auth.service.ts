import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly defaultSecretKey = 'MQTT_LTA';

    async hashPassword(plainPassword: string): Promise<string> {
        return this.encryptPassword(plainPassword);
    }

    encryptPassword(plainPassword: string, secretKey: string = this.defaultSecretKey): string {
        if (!plainPassword) {
            throw new Error('Password cannot be empty.');
        }

        if (!secretKey) {
            throw new Error('Secret key cannot be empty.');
        }

        const encrypted = CryptoJS.AES.encrypt(plainPassword, secretKey).toString();
        return `enc:${encrypted}`;
    }

    decryptPassword(encryptedPassword: string, secretKey: string = this.defaultSecretKey): string {
        if (!encryptedPassword) {
            throw new Error('Encrypted password cannot be empty.');
        }

        if (!secretKey) {
            throw new Error('Secret key cannot be empty.');
        }

        const payload = encryptedPassword.startsWith('enc:') ? encryptedPassword.slice(4) : encryptedPassword;
        const bytes = CryptoJS.AES.decrypt(payload, secretKey);
        const plainPassword = bytes.toString(CryptoJS.enc.Utf8);

        if (!plainPassword) {
            throw new Error('Failed to decrypt password.');
        }

        return plainPassword;
    }

    async verifyPassword(
        plainPassword: string,
        passwordHashOrEncrypted: string,
        secretKey: string = this.defaultSecretKey,
    ): Promise<boolean> {
        if (!plainPassword || !passwordHashOrEncrypted) {
            return false;
        }

        if (passwordHashOrEncrypted.startsWith('enc:')) {
            try {
                return this.decryptPassword(passwordHashOrEncrypted, secretKey) === plainPassword;
            } catch {
                return false;
            }
        }

        return plainPassword === passwordHashOrEncrypted;
    }
}
