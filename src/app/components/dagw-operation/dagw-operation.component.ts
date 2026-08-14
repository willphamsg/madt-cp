import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { dagwOperation } from '@store/main/main.reducer';
import { AppState } from '@store/app.state';
import { IDagwOperation, DagwOperationStatus, MsgID } from '@models';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'dagw-operation',
    imports: [CommonModule, TranslateModule],
    templateUrl: './dagw-operation.component.html',
    styleUrls: ['./dagw-operation.component.scss'],
})
export class DagwOperationComponent implements OnInit, OnDestroy {
    MsgID = MsgID;
    private readonly destroy$ = new Subject<void>();
    dagwStatus = DagwOperationStatus;
    dagwOperation$: Observable<IDagwOperation> = this.store.select(dagwOperation);
    dagwOperationData: IDagwOperation = { msgID: 0, title: '', message: '' };
    @Output() cancel: EventEmitter<string> = new EventEmitter<string>();

    topics;

    constructor(
        private readonly soundService: SoundService,
        private readonly store: Store<AppState>,
    ) {}

    ngOnInit() {
        this.dagwOperation$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
            this.dagwOperationData = data;
        });
    }

    ngOnDestroy() {
        // Emit to destroy all active subscriptions
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleCancelDagwOperation() {
        this.cancel.emit();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
