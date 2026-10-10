import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CashMovement, CashRegister } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableLazyEvent,
} from '../../../../shared/components/data-table/data-table.component';
import { SalesCashService } from '../sales-cash.service';

/**
 * Fecha de hoy en el formato que esperan los inputs date y el backend.
 * Es función y no constante de módulo para que una sesión abierta de un día para el
 * otro no siga anclada a la fecha de ayer.
 */
const today = (): string => dayjs().format('YYYY-MM-DD');

/**
 * Caja de ventas: saldo actual + movimientos paginados (ingresos y reversiones).
 *
 * El listado arranca acotado al día en curso; el saldo de la tarjeta es el acumulado
 * de la caja y no depende del rango de fechas elegido.
 */
@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    PageHeaderComponent,
    DataTableComponent,
    CurrencyArsPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cash-register.component.html',
})
export class CashRegisterComponent {
  private readonly service = inject(SalesCashService);
  private readonly router = inject(Router);

  readonly register = signal<CashRegister | null>(null);
  readonly rows = signal<CashMovement[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);

  fromDate = today();
  toDate = today();

  private lastEvent: DataTableLazyEvent = { page: 1, limit: 10, search: '' };

  readonly columns: DataTableColumn[] = [
    { field: 'createdAt', header: 'Fecha', type: 'datetime' },
    { field: 'description', header: 'Descripción' },
    { field: 'amount', header: 'Importe', type: 'currency', cellClass: 'text-right' },
  ];

  constructor() {
    this.loadRegister();
  }

  onLazyLoad(event: DataTableLazyEvent): void {
    this.lastEvent = event;
    this.load();
  }

  onFilterChange(): void {
    this.load();
  }

  /** Vuelve al estado por defecto: movimientos del día actual. */
  clearFilters(): void {
    this.fromDate = today();
    this.toDate = today();
    this.load();
  }

  /** Con el default (hoy) no tiene sentido ofrecer "Restablecer". */
  hasCustomFilters(): boolean {
    return this.fromDate !== today() || this.toDate !== today();
  }

  onViewSale(saleId: string): void {
    this.router.navigate(['/commercial/sales', saleId]);
  }

  private load(): void {
    this.loading.set(true);
    this.service
      .listMovements(this.lastEvent.page, this.lastEvent.limit, {
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private loadRegister(): void {
    this.service.getRegister().subscribe({ next: (r) => this.register.set(r) });
  }
}
