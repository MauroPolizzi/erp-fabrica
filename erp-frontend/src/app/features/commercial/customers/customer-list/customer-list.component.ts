import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../../../core/services/notification.service';
import { Customer } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableLazyEvent,
} from '../../../../shared/components/data-table/data-table.component';
import { CustomerService } from '../customer.service';

type CustomerRow = Customer & { estado: string };

/** Listado paginado (server-side) de clientes con búsqueda, alta, edición y baja lógica. */
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [ButtonModule, TooltipModule, PageHeaderComponent, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent {
  private readonly service = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<CustomerRow[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);

  private lastEvent: DataTableLazyEvent = { page: 1, limit: 10, search: '' };

  readonly columns: DataTableColumn[] = [
    { field: 'name', header: 'Nombre' },
    { field: 'taxId', header: 'CUIT/CUIL' },
    { field: 'email', header: 'Email' },
    { field: 'phone', header: 'Teléfono' },
    { field: 'estado', header: 'Estado' },
  ];

  onLazyLoad(event: DataTableLazyEvent): void {
    this.lastEvent = event;
    this.loading.set(true);
    this.service.list(event.page, event.limit, event.search).subscribe({
      next: (res) => {
        this.rows.set(res.data.map((c) => ({ ...c, estado: c.isActive ? 'Activo' : 'Inactivo' })));
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onNew(): void {
    this.router.navigate(['/commercial/customers/new']);
  }

  onEdit(row: CustomerRow): void {
    this.router.navigate(['/commercial/customers', row.id, 'edit']);
  }

  onDeactivate(row: CustomerRow): void {
    this.confirm.confirm({
      header: 'Dar de baja',
      message: `¿Dar de baja al cliente "${row.name}"?`,
      accept: () => {
        this.service.deactivate(row.id).subscribe({
          next: () => {
            this.notify.success('Cliente dado de baja.');
            this.onLazyLoad(this.lastEvent);
          },
        });
      },
    });
  }
}
