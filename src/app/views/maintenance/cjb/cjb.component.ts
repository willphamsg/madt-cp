import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import config from '@assets/config.json';
import { SoundService } from '@services/sound.service';

/**
 * `assets/config.json` is a deployed file, so the CJB address it carries is not implicitly
 * trusted: bypassing Angular's sanitizer for a resource URL would let a `javascript:` or
 * `data:` address run script in this app's origin.
 */
const ALLOWED_IFRAME_PROTOCOLS = new Set(['http:', 'https:']);

@Component({
    selector: 'app-cjb',
    imports: [NgScrollbarModule, RouterModule, TranslateModule],
    templateUrl: './cjb.component.html',
    styleUrls: ['./cjb.component.scss'],
})
export class CJBComponent {
    safeUrl: SafeResourceUrl | null;
    url = config.iFrameURL;
    isBroken = false;
    intervalId;
    @ViewChild('myElement') myElementRef!: ElementRef;

    constructor(
        private readonly soundService: SoundService,
        private readonly sanitizer: DomSanitizer,
        private readonly router: Router,
    ) {
        this.safeUrl = this.trustIframeUrl(this.url);
        this.isBroken = !this.safeUrl;
    }

    private trustIframeUrl(rawUrl: string): SafeResourceUrl | null {
        let parsed: URL;
        try {
            parsed = new URL(rawUrl);
        } catch {
            return null;
        }

        if (!ALLOWED_IFRAME_PROTOCOLS.has(parsed.protocol)) {
            return null;
        }

        return this.sanitizer.bypassSecurityTrustResourceUrl(parsed.href);
    }

    onIframeLoad(iframe: HTMLIFrameElement) {
        console.log('Iframe loaded - checking content...');
        try {
            // Try to access iframe's document
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
                this.isBroken = false;
                // if (!doc.body) {
                //     this.isBroken = true;
                // }
            } else {
                // No document → broken
                this.isBroken = true;
            }
        } catch (err) {
            console.warn('Cross-origin - cannot check iframe content.', err);
            // Cross-origin → cannot access iframe → assume it's fine OR you can fallback to HEAD request
            this.isBroken = false; // or true based on your policy
        }
    }

    onIframeError() {
        console.log('Iframe failed to load');
        this.isBroken = true;
    }

    backToMaintenance() {
        this.router.navigate(['/maintenance']);
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
