import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { AutoTimeoutPopupBase } from '@components/auto-timeout-popup/auto-timeout-popup.base';

@Component({
    selector: 'bus-off-route',
    imports: [CommonModule, TranslateModule, NotificationSoundDirective],
    templateUrl: './bus-off-route.component.html',
    styleUrl: './bus-off-route.component.scss',
})
export class BusOffRouteComponent extends AutoTimeoutPopupBase {}
