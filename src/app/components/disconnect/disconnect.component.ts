import { Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'disconnect',
    imports: [TranslateModule],
    templateUrl: './disconnect.component.html',
    styleUrl: './disconnect.component.scss',
})
export class Disconnect {
    constructor() {}
}
