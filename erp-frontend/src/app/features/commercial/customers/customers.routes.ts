import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission.guard';

/** Rutas de la feature Clientes (lazy). Cada una declara su permiso RBAC. */
export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'commercial.read' },
    loadComponent: () =>
      import('./customer-list/customer-list.component').then((m) => m.CustomerListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: 'commercial.create' },
    loadComponent: () =>
      import('./customer-form/customer-form.component').then((m) => m.CustomerFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard],
    data: { permission: 'commercial.update' },
    loadComponent: () =>
      import('./customer-form/customer-form.component').then((m) => m.CustomerFormComponent),
  },
];
