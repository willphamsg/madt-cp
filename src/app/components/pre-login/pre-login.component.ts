import { Component, Input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'pre-login',
    imports: [TranslateModule],
    templateUrl: './pre-login.component.html',
    styleUrl: './pre-login.component.scss',
})
export class PreLoginComponent {
    @Input() title: string = '';
    @Input() content?: string = '';

    constructor() {}
    ngOnInit() {}
}
