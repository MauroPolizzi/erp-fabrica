import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

/** Rutas de la feature Roles (lazy, solo lectura). Acompaña a la gestión de usuarios. */
export const ROLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'users.read' },
    loadComponent: () => import('./role-list/role-list.component').then((m) => m.RoleListComponent),
  },
];
