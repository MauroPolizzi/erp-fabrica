import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

/** Rutas de Auditoría (lazy, solo lectura). Requiere audit.read. */
export const AUDIT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'audit.read' },
    loadComponent: () => import('./audit-list/audit-list.component').then((m) => m.AuditListComponent),
  },
];
