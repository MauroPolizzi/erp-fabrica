import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
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
} from '../../../../shared/components/data-table/data-table.component';
import { SaleService, paymentMethodLabel } from '../sale.service';

type SaleRow = Sale & { customerName: string; medioPago: string; estado: string };

/**
 * Fecha de hoy en el formato que esperan los inputs date y el backend.
 * Es función y no constante de módulo para que una sesión abierta de un día para el
 * otro no siga anclada a la fecha de ayer.
 */
const today = (): string => dayjs().format('YYYY-MM-DD');

/**
 * Listado paginado de ventas con filtros por cliente (search), estado y rango de fechas.
 *
 * A diferencia de las grillas de clientes/materiales/usuarios, **no** exige buscar para
 * mostrar contenido: la operación diaria necesita ver las ventas del día al entrar, así
 * que arranca acotada a hoy y la búsqueda por cliente es un filtro adicional.
 */
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
  fromDate = today();
  toDate = today();

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

  /** Vuelve al estado por defecto: ventas del día actual, sin filtro de estado. */
  clearFilters(): void {
    this.statusFilter = '';
    this.fromDate = today();
    this.toDate = today();
    this.load();
  }

  /** Con el default (hoy, todos los estados) no tiene sentido ofrecer "Restablecer". */
  hasCustomFilters(): boolean {
    return this.statusFilter !== '' || this.fromDate !== today() || this.toDate !== today();
  }

  onNew(): void {
    this.router.navigate(['/commercial/sales/new']);
  }

  onView(row: SaleRow): void {
    this.router.navigate(['/commercial/sales', row.id]);
  }

  private load(): void {
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
