import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationSoundDirective } from '@directives/notification-sound.directive';
import { AutoTimeoutPopupBase } from '@components/auto-timeout-popup/auto-timeout-popup.base';

@Component({
    selector: 'cjb-plate-number',
    imports: [CommonModule, TranslateModule, NotificationSoundDirective],
    templateUrl: './cjb-plate-number.component.html',
    styleUrl: './cjb-plate-number.component.scss',
})
export class CJBPlateNumberComponent extends AutoTimeoutPopupBase {
    @Input() plateNumber?: string = '';
}
