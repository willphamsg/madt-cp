import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import config from '@assets/config.json';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'app-cjb',
    imports: [NgScrollbarModule, RouterModule, TranslateModule],
    templateUrl: './cjb.component.html',
    styleUrls: ['./cjb.component.scss'],
})
export class CJBComponent implements OnInit {
    safeUrl: SafeResourceUrl;
    url = config.iFrameURL;
    isBroken = false;
    intervalId;
    @ViewChild('myElement') myElementRef!: ElementRef;

    constructor(
        private soundService: SoundService,
        private sanitizer: DomSanitizer,
        private router: Router,
    ) {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
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

    ngOnInit() {}

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
