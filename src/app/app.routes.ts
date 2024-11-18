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
        path: 'customers',
        loadComponent: () =>
          import('./components/customers/customers.component').then(
            (m) => m.CustomersComponent
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
