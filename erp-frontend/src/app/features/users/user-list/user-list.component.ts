import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableLazyEvent,
} from '../../../shared/components/data-table/data-table.component';
import { UserService } from '../user.service';
import { RoleService } from '../../roles/role.service';

type UserRow = User & { roleName: string; estado: string };

/** Listado paginado (server-side) de usuarios con búsqueda, alta, edición y baja lógica. */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [ButtonModule, TooltipModule, PageHeaderComponent, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private readonly service = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<UserRow[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);

  /** roleId → nombre, para mostrar el rol en la tabla sin un fetch por fila. */
  private roleNames = new Map<string, string>();
  private lastEvent: DataTableLazyEvent = { page: 1, limit: 10, search: '' };

  readonly columns: DataTableColumn[] = [
    { field: 'fullName', header: 'Nombre' },
    { field: 'email', header: 'Email' },
    { field: 'roleName', header: 'Rol' },
    { field: 'estado', header: 'Estado' },
  ];

  constructor() {
    // Los roles son pocos y fijos: se cargan una vez y se cachean para el mapeo.
    this.roleService.list().subscribe({
      next: (roles) => {
        this.roleNames = new Map(roles.map((r) => [r.id, r.name]));
        this.rows.update((rows) =>
          rows.map((u) => ({ ...u, roleName: this.roleNames.get(u.roleId) ?? '—' })),
        );
      },
    });
  }

  onLazyLoad(event: DataTableLazyEvent): void {
    this.lastEvent = event;
    this.loading.set(true);
    this.service.list(event.page, event.limit, event.search).subscribe({
      next: (res) => {
        this.rows.set(
          res.data.map((u) => ({
            ...u,
            roleName: this.roleNames.get(u.roleId) ?? '—',
            estado: u.isActive ? 'Activo' : 'Inactivo',
          })),
        );
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onNew(): void {
    this.router.navigate(['/users/new']);
  }

  onEdit(row: UserRow): void {
    this.router.navigate(['/users', row.id, 'edit']);
  }

  onDeactivate(row: UserRow): void {
    this.confirm.confirm({
      header: 'Dar de baja',
      message: `¿Dar de baja al usuario "${row.fullName}"?`,
      accept: () => {
        this.service.deactivate(row.id).subscribe({
          next: () => {
            this.notify.success('Usuario dado de baja.');
            this.onLazyLoad(this.lastEvent);
          },
        });
      },
    });
  }
}
