import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import config from 'devextreme/core/config';
import { AuthGuard, IsActiveToken } from './auth.guard';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient } from '@angular/common/http';

// required for AoT
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const licenseKey =
  'ewogICJmb3JtYXQiOiAxLAogICJjdXN0b21lcklkIjogIjEyMWExN2Y3LWZmMTUtNDdhYS1iYTY2LThhNDJjYTY1ZTI2MiIsCiAgIm1heFZlcnNpb25BbGxvd2VkIjogMjQxCn0=.B0EsatLpIUdG1pQ3koQgaggtK1aL0IiSOiQSSw3pmG9EuZpeEEcY/SpLGdglb7rNhMhUmdLZ1qhfE1xs5X5LcedswvQTYZ/T+Vf5mvjMCWWRD2881A1oVbJFK4clnbj8RLWJyQ==';

config({ licenseKey });

export const appConfig: ApplicationConfig = {
  providers: [
    AuthGuard,
    IsActiveToken,
    provideHttpClient(),
    TranslateModule.forRoot({
      defaultLanguage: 'pl',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }).providers!,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};
