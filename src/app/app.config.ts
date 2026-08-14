import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { appStore } from './store/app.state';

export const appConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom(HttpClientModule),
        provideTranslateService({
            loader: provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
            fallbackLang: 'en',
        }),
        provideRouter(routes),
        provideClientHydration(),
        provideAnimationsAsync(),
        provideStore(appStore),
    ],
};
