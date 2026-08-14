import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectedBusStop, selectBusStop, selectBusStopForFare } from '@app/store/main/main.reducer';
import { AppState } from '@store/app.state';
import { Observable, Subject } from 'rxjs';
import { IFmsBusStop } from '@models';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { SoundService } from '@services/sound.service';

@Component({
    selector: 'bus-stop-fare',
    imports: [CommonModule, MatCardModule, MatInputModule, MatButtonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './bus-stop-fare.component.html',
    styleUrls: ['./bus-stop-fare.component.scss'],
})
export class BusStopFareComponent {
    private destroy$ = new Subject<void>();
    selectedBusStop$: Observable<IFmsBusStop | null>;

    constructor(
        private soundService: SoundService,
        private router: Router,
        private store: Store<AppState>,
    ) {
        this.selectedBusStop$ = this.store.select(selectedBusStop);
    }

    backToMain(): void {
        this.router.navigate(['/main']);
    }

    handleUpdateBusStop(status?: string): void {
        if (status === 'cancel') {
            this.router.navigate(['/main']);
            this.store.dispatch(selectBusStop({ payload: null }));
        } else {
            this.selectedBusStop$.pipe(takeUntil(this.destroy$)).subscribe((_bs: IFmsBusStop | null) => {
                if (_bs !== null) {
                    this.store.dispatch(selectBusStopForFare({ payload: _bs.Busid }));
                    this.router.navigate(['/main']);
                }
            });
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    handleButtonSound(): void {
        this.soundService.playButton();
    }
}
