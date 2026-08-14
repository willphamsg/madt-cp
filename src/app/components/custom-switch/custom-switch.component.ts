import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'custom-switch',
    templateUrl: './custom-switch.component.html',
    styleUrls: ['./custom-switch.component.scss'],
    imports: [TranslateModule],
})
export class CustomSwitchComponent implements OnInit {
    @Input() checked?: boolean;
    @Input() disabled?: boolean;
    @Input() displayText?: boolean;
    @Output() onChange: EventEmitter<Event> = new EventEmitter<Event>();

    innerChecked: boolean = false;

    constructor() {}

    ngOnInit() {
        this.innerChecked = this.checked || false;
    }

    handleChangeSwitch(event: Event): void {
        this.innerChecked = !this.innerChecked;
        this.onChange.emit(event);
    }
}
