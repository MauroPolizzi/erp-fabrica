import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../../../core/services/notification.service';
import { Category, FinishedProduct } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableLazyEvent,
} from '../../../../shared/components/data-table/data-table.component';
import { CategoryService } from '../../categories/category.service';
import { FinishedProductService } from '../finished-product.service';
import { StockMovementDialogComponent } from '../stock-movement-dialog/stock-movement-dialog.component';

type ProductRow = FinishedProduct & { categoryName: string; estado: string };

/** Listado paginado de productos terminados con stock, alta de stock, edición y baja lógica. */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    PageHeaderComponent,
    DataTableComponent,
    StockMovementDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html',
})
export class ProductListComponent {
  private readonly service = inject(FinishedProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly confirm = inject(ConfirmationService);

  private readonly products = signal<FinishedProduct[]>([]);
  private readonly categoryMap = signal(new Map<string, string>());
  readonly total = signal(0);
  readonly loading = signal(false);

  readonly selectedProduct = signal<FinishedProduct | null>(null);
  readonly stockDialogVisible = signal(false);

  private lastEvent: DataTableLazyEvent = { page: 1, limit: 10, search: '' };

  readonly rows = computed<ProductRow[]>(() => {
    const map = this.categoryMap();
    return this.products().map((p) => ({
      ...p,
      categoryName: map.get(p.categoryId) ?? '—',
      estado: p.isActive ? 'Activo' : 'Inactivo',
    }));
  });

  readonly columns: DataTableColumn[] = [
    { field: 'sku', header: 'SKU' },
    { field: 'name', header: 'Nombre' },
    { field: 'categoryName', header: 'Categoría' },
    { field: 'unit', header: 'Unidad' },
    { field: 'salePrice', header: 'Precio', type: 'currency', cellClass: 'text-right' },
    { field: 'currentStock', header: 'Stock', cellClass: 'text-right' },
    { field: 'estado', header: 'Estado' },
  ];

  constructor() {
    this.loadCategories();
  }

  onLazyLoad(event: DataTableLazyEvent): void {
    this.lastEvent = event;
    this.loading.set(true);
    this.service.list(event.page, event.limit, event.search).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onNew(): void {
    this.router.navigate(['/inventory/finished-products/new']);
  }

  onEdit(row: ProductRow): void {
    this.router.navigate(['/inventory/finished-products', row.id, 'edit']);
  }

  onStock(row: ProductRow): void {
    this.selectedProduct.set(row);
    this.stockDialogVisible.set(true);
  }

  onStockSaved(): void {
    this.onLazyLoad(this.lastEvent);
  }

  onDeactivate(row: ProductRow): void {
    this.confirm.confirm({
      header: 'Dar de baja',
      message: `¿Dar de baja el material "${row.name}"?`,
      accept: () => {
        this.service.deactivate(row.id).subscribe({
          next: () => {
            this.notify.success('Material dado de baja.');
            this.onLazyLoad(this.lastEvent);
          },
        });
      },
    });
  }

  private loadCategories(): void {
    this.categoryService.list('FINISHED_PRODUCT').subscribe({
      next: (categories: Category[]) => {
        this.categoryMap.set(new Map(categories.map((c) => [c.id, c.name])));
      },
    });
  }
}
