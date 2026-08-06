import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission.guard';

/** Rutas de la Caja de ventas (lazy, solo lectura). Requiere finance.read. */
export const SALES_CASH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'finance.read' },
    loadComponent: () =>
      import('./cash-register/cash-register.component').then((m) => m.CashRegisterComponent),
  },
];
