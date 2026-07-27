import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Shell de la app: `/login` público + grupo protegido por authGuard que monta el
 * MainLayout. Las features se agregan como rutas hijas lazy en sus fases
 * (clientes, materiales, ventas), declarando `data.permission` + permissionGuard.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'commercial/customers',
        loadChildren: () =>
          import('./features/commercial/customers/customers.routes').then((m) => m.CUSTOMERS_ROUTES),
      },
      {
        path: 'inventory/finished-products',
        loadChildren: () =>
          import('./features/inventory/finished-products/finished-products.routes').then(
            (m) => m.FINISHED_PRODUCTS_ROUTES,
          ),
      },
      {
        path: 'commercial/sales',
        loadChildren: () =>
          import('./features/commercial/sales/sales.routes').then((m) => m.SALES_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'roles',
        loadChildren: () => import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
