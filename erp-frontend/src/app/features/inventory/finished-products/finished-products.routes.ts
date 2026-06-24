import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission.guard';

/** Rutas de la feature Materiales (productos terminados, lazy). Cada una declara su permiso RBAC. */
export const FINISHED_PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'inventory.read' },
    loadComponent: () =>
      import('./product-list/product-list.component').then((m) => m.ProductListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: 'inventory.create' },
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard],
    data: { permission: 'inventory.update' },
    loadComponent: () =>
      import('./product-form/product-form.component').then((m) => m.ProductFormComponent),
  },
];
