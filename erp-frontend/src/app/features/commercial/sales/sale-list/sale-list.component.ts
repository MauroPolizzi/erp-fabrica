import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Sale, SaleStatus } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableLazyEvent,
  MIN_SEARCH_LENGTH,
} from '../../../../shared/components/data-table/data-table.component';
import { SaleService, paymentMethodLabel } from '../sale.service';

type SaleRow = Sale & { customerName: string; medioPago: string; estado: string };

/** Listado paginado de ventas con filtros por cliente (search), estado y rango de fechas. */
@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    TooltipModule,
    PageHeaderComponent,
    DataTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-list.component.html',
})
export class SaleListComponent {
  private readonly service = inject(SaleService);
  private readonly router = inject(Router);

  readonly rows = signal<SaleRow[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);

  // Filtros propios del listado (el cliente se busca con el search del data-table).
  statusFilter: SaleStatus | '' = '';
  fromDate = '';
  toDate = '';

  private lastEvent: DataTableLazyEvent = { page: 1, limit: 10, search: '' };

  readonly statusOptions: { label: string; value: SaleStatus | '' }[] = [
    { label: 'Todos los estados', value: '' },
    { label: 'Confirmada', value: 'CONFIRMED' },
    { label: 'Anulada', value: 'CANCELLED' },
  ];

  readonly columns: DataTableColumn[] = [
    { field: 'soldAt', header: 'Fecha', type: 'datetime' },
    { field: 'customerName', header: 'Cliente' },
    { field: 'medioPago', header: 'Medio de pago' },
    { field: 'total', header: 'Total', type: 'currency', cellClass: 'text-right' },
    { field: 'estado', header: 'Estado' },
  ];

  onLazyLoad(event: DataTableLazyEvent): void {
    this.lastEvent = event;
    this.load();
  }

  /** Cambio en un filtro propio: recarga con la página/búsqueda actuales del data-table. */
  onFilterChange(): void {
    this.load();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.load();
  }

  onNew(): void {
    this.router.navigate(['/commercial/sales/new']);
  }

  onView(row: SaleRow): void {
    this.router.navigate(['/commercial/sales', row.id]);
  }

  private load(): void {
    // Los filtros propios llaman acá sin pasar por el data-table, que es el que
    // normalmente frena la carga. Sin búsqueda válida la grilla queda vacía: cambiar
    // estado o fechas no debe traer el listado completo de ventas.
    if (this.lastEvent.search.length < MIN_SEARCH_LENGTH) {
      this.rows.set([]);
      this.total.set(0);
      return;
    }

    this.loading.set(true);
    this.service
      .list(this.lastEvent.page, this.lastEvent.limit, {
        search: this.lastEvent.search || undefined,
        status: this.statusFilter || undefined,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(
            res.data.map((s) => ({
              ...s,
              customerName: s.customer?.name ?? '—',
              medioPago: paymentMethodLabel(s.paymentMethod),
              estado: s.status === 'CONFIRMED' ? 'Confirmada' : s.status === 'CANCELLED' ? 'Anulada' : 'Borrador',
            })),
          );
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
