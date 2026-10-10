import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

/** Rutas de la feature Reportes (lazy). */
export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'reports.read' },
    loadComponent: () =>
      import('./sales-report/sales-report.component').then((m) => m.SalesReportComponent),
  },
];
