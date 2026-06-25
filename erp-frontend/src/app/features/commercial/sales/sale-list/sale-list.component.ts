import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Sale } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableLazyEvent,
} from '../../../../shared/components/data-table/data-table.component';
import { SaleService, paymentMethodLabel } from '../sale.service';

type SaleRow = Sale & { customerName: string; medioPago: string; estado: string };

/** Listado paginado de ventas con cliente, medio de pago y total. */
@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [ButtonModule, TooltipModule, PageHeaderComponent, DataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-list.component.html',
})
export class SaleListComponent {
  private readonly service = inject(SaleService);
  private readonly router = inject(Router);

  readonly rows = signal<SaleRow[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);

  readonly columns: DataTableColumn[] = [
    { field: 'soldAt', header: 'Fecha', type: 'datetime' },
    { field: 'customerName', header: 'Cliente' },
    { field: 'medioPago', header: 'Medio de pago' },
    { field: 'total', header: 'Total', type: 'currency', cellClass: 'text-right' },
    { field: 'estado', header: 'Estado' },
  ];

  onLazyLoad(event: DataTableLazyEvent): void {
    this.loading.set(true);
    this.service.list(event.page, event.limit).subscribe({
      next: (res) => {
        this.rows.set(
          res.data.map((s) => ({
            ...s,
            customerName: s.customer?.name ?? '—',
            medioPago: paymentMethodLabel(s.paymentMethod),
            estado: s.status === 'CONFIRMED' ? 'Confirmada' : 'Borrador',
          })),
        );
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onNew(): void {
    this.router.navigate(['/commercial/sales/new']);
  }

  onView(row: SaleRow): void {
    this.router.navigate(['/commercial/sales', row.id]);
  }
}
