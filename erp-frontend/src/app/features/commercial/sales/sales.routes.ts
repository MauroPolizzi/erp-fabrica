import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission.guard';

/** Rutas de la feature Ventas (lazy). `new` antes de `:id` para no capturarlo como detalle. */
export const SALES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'commercial.read' },
    loadComponent: () => import('./sale-list/sale-list.component').then((m) => m.SaleListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: 'commercial.create' },
    loadComponent: () => import('./sale-form/sale-form.component').then((m) => m.SaleFormComponent),
  },
  {
    path: ':id',
    canActivate: [permissionGuard],
    data: { permission: 'commercial.read' },
    loadComponent: () => import('./sale-detail/sale-detail.component').then((m) => m.SaleDetailComponent),
  },
];
