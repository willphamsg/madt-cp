import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerUrls } from '@app/app.routes';
import { SoundService } from '@services/sound.service';

@Component({
    standalone: true,
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
    activeTab: string = 'main';
    urls: any = routerUrls;
    constructor(
        private readonly soundService: SoundService,
        private readonly router: Router,
    ) {}

    buttonList: any[] = [
        {
            url: this.urls?.private?.main?.url,
            key: 'main',
            activeImg: '/assets/images/icons/main/main-active.svg',
            img: '/assets/images/icons/main/menu.svg',
            label: 'Main',
        },
        {
            url: this.urls?.private?.ticketing?.url,
            key: 'ticketing',
            activeImg: '/assets/images/icons/main/vector-active.svg',
            img: '/assets/images/icons/main/ticket.svg',
            label: 'Ticketing',
        },
        {
            url: this.urls?.private?.fms?.url,
            key: 'fms',
            activeImg: '/assets/images/icons/main/envelope-active.svg',
            img: '/assets/images/icons/main/envelope.svg',
            label: 'FMS',
        },
        {
            url: this.urls?.private?.maintenance.url,
            key: 'maintenance',
            activeImg: '/assets/images/icons/main/gear-active.svg',
            img: '/assets/images/icons/main/maintenance.svg',
            label: 'Maintenance',
        },
    ];

    ngOnInit() {
        this.checkActiveTab();
    }

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    onChangeTab(tab: string) {
        this.activeTab = tab;
        this.router.navigate([`/${tab}`]);
    }

    isRouteActive(tab: string): boolean {
        return this.activeTab === tab;
    }

    checkActiveTab(): void {
        const currentRoute = this.router.url;
        if (currentRoute.includes('maintenance')) {
            this.activeTab = 'maintenance';
        } else if (currentRoute.includes('fms')) {
            this.activeTab = 'fms';
        } else if (currentRoute.includes('main')) {
            this.activeTab = 'main';
        } else if (currentRoute.includes('ticketing')) {
            this.activeTab = 'ticketing';
        } else {
            this.activeTab = '';
        }
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
