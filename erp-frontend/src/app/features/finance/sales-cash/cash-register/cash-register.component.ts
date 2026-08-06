import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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

/** Caja de ventas: saldo actual + movimientos paginados (ingresos y reversiones). */
@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [ButtonModule, TooltipModule, PageHeaderComponent, DataTableComponent, CurrencyArsPipe],
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

  readonly columns: DataTableColumn[] = [
    { field: 'createdAt', header: 'Fecha', type: 'datetime' },
    { field: 'description', header: 'Descripción' },
    { field: 'amount', header: 'Importe', type: 'currency', cellClass: 'text-right' },
  ];

  constructor() {
    this.loadRegister();
  }

  onLazyLoad(event: DataTableLazyEvent): void {
    this.loading.set(true);
    this.service.listMovements(event.page, event.limit).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onViewSale(saleId: string): void {
    this.router.navigate(['/commercial/sales', saleId]);
  }

  private loadRegister(): void {
    this.service.getRegister().subscribe({ next: (r) => this.register.set(r) });
  }
}
