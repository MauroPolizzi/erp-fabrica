import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Role } from '../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { RoleService } from '../role.service';

/**
 * Vista de solo lectura de roles y sus permisos. Los permisos por rol se definen en
 * el seed del backend; esta pantalla los expone para consulta (RBAC — ROADMAP §8.2).
 */
@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [PageHeaderComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-list.component.html',
})
export class RoleListComponent {
  private readonly service = inject(RoleService);

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.service.list().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
