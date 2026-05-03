import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './layouts/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'templates',
        loadComponent: () =>
          import('./features/templates/templates.component').then((m) => m.TemplatesComponent),
      },
      {
        path: 'pages',
        loadComponent: () =>
          import('./features/pages/pages-list/pages-list.component').then(
            (m) => m.PagesListComponent,
          ),
      },
      {
        path: 'pages/new',
        loadComponent: () =>
          import('./features/pages/page-create/page-create.component').then(
            (m) => m.PageCreateComponent,
          ),
      },
      {
        path: 'pages/:id',
        loadComponent: () =>
          import('./features/pages/page-detail/page-detail.component').then(
            (m) => m.PageDetailComponent,
          ),
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./features/requests/request-detail.component').then(
            (m) => m.RequestDetailComponent,
          ),
      },
      {
        path: 'settings/users',
        loadComponent: () =>
          import('./features/settings/users/users.component').then((m) => m.UsersComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
  { path: '**', redirectTo: 'app/dashboard' },
];
