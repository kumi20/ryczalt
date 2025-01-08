import { Routes } from '@angular/router';
import { AuthGuard, IsActiveToken } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [IsActiveToken],
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'content',
    canActivate: [AuthGuard],

    loadComponent: () =>
      import('./components/content/content.component').then(
        (m) => m.ContentComponent
      ),
    children: [
      {
        path: 'flate-rate',
        loadComponent: () =>
          import('./components/flate-rate/flate-rate.component').then(
            (m) => m.FlateRateComponent
          ),
      },
      {
        path: 'vat-register-sell',
        loadComponent: () =>
          import('./components/vat-register/vat-register.component').then(
            (m) => m.VatRegisterComponent
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./components/customers/customers.component').then(
            (m) => m.CustomersComponent
          ),
      },
      {
        path: 'dictionaries/countries',
        loadComponent: () =>
          import('./components/country/country.component').then(
            (m) => m.CountryComponent
          ),
      },
      {
        path: 'dictionaries/document-type',
        loadComponent: () =>
          import('./components/document-type/document-type.component').then(
            (m) => m.DocumentTypeComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/no-found/no-found.component').then(
        (m) => m.NoFoundComponent
      ),
  },
];
