import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Sale } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { FinishedProductService } from '../../../inventory/finished-products/finished-product.service';
import { SaleService, paymentMethodLabel } from '../sale.service';

interface DetailRow {
  productName: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
}

/** Detalle de una venta: cabecera (cliente, fecha, medio de pago) + líneas con totales. */
@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [ButtonModule, PageHeaderComponent, LoadingSpinnerComponent, CurrencyArsPipe, DateFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-detail.component.html',
})
export class SaleDetailComponent implements OnInit {
  private readonly service = inject(SaleService);
  private readonly productService = inject(FinishedProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly sale = signal<Sale | null>(null);
  readonly loading = signal(false);
  private readonly productNames = signal(new Map<string, string>());

  readonly paymentLabel = computed(() => {
    const s = this.sale();
    return s ? paymentMethodLabel(s.paymentMethod) : '';
  });

  readonly detailRows = computed<DetailRow[]>(() => {
    const s = this.sale();
    if (!s) return [];
    const names = this.productNames();
    return s.details.map((d) => ({
      productName: names.get(d.finishedProductId) ?? d.finishedProductId,
      quantity: d.quantity,
      unitPrice: d.unitPrice,
      lineTotal: d.lineTotal,
    }));
  });

  constructor() {
    this.loadProductNames();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.goToList();
      return;
    }
    this.loadSale(id);
  }

  goToList(): void {
    this.router.navigate(['/commercial/sales']);
  }

  private loadSale(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (sale) => {
        this.sale.set(sale);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.goToList();
      },
    });
  }

  private loadProductNames(): void {
    this.productService.list(1, 200).subscribe({
      next: (res) => this.productNames.set(new Map(res.data.map((p) => [p.id, p.name]))),
    });
  }
}
