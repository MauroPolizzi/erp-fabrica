import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

/** Rutas de la feature Usuarios (lazy). Cada una declara su permiso RBAC. */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: 'users.read' },
    loadComponent: () => import('./user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: 'users.create' },
    loadComponent: () => import('./user-form/user-form.component').then((m) => m.UserFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard],
    data: { permission: 'users.update' },
    loadComponent: () => import('./user-form/user-form.component').then((m) => m.UserFormComponent),
  },
];
