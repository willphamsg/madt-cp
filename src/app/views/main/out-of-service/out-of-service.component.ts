import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OutOfServiceType } from '@models';

@Component({
    selector: 'app-out-of-service',
    imports: [],
    templateUrl: './out-of-service.component.html',
    styleUrl: './out-of-service.component.scss',
})
export class OutOfServiceComponent implements OnInit {
    constructor(private readonly activeRoute: ActivatedRoute) {}
    pageData!: string;
    withInfo = OutOfServiceType?.WITH_INFO;
    noData = OutOfServiceType?.NO_DATA;
    ngOnInit(): void {
        this.pageData = this.activeRoute.snapshot.data['pageType'] || OutOfServiceType.WITH_INFO;
    }
}
