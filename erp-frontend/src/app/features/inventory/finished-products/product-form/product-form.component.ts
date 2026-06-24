import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { NotificationService } from '../../../../core/services/notification.service';
import { Category } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CategoryFormComponent } from '../../categories/category-form/category-form.component';
import { CategoryService } from '../../categories/category.service';
import { FinishedProductInput, FinishedProductService } from '../finished-product.service';

/**
 * Alta/edición de material. El combo de categorías permite alta rápida (diálogo).
 * `currentStock` es de solo lectura (se mueve por movimientos). 409 de SKU → error de campo.
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    DialogModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    CategoryFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FinishedProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  readonly saving = signal(false);
  readonly loadingData = signal(false);
  readonly productId = signal<string | null>(null);
  readonly isEdit = computed(() => this.productId() !== null);
  readonly currentStock = signal<string | null>(null);

  readonly categories = signal<Category[]>([]);
  readonly categoryDialogVisible = signal(false);

  readonly form = this.fb.nonNullable.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    categoryId: ['', [Validators.required]],
    unit: ['', [Validators.required]],
    salePrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  ngOnInit(): void {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  isInvalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  hasSkuConflict(): boolean {
    return this.form.controls.sku.hasError('duplicateSku');
  }

  openCategoryDialog(): void {
    this.categoryDialogVisible.set(true);
  }

  onCategoryCreated(category: Category): void {
    this.categories.update((list) => [...list, category]);
    this.form.controls.categoryId.setValue(category.id);
    this.categoryDialogVisible.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const dto: FinishedProductInput = {
      sku: raw.sku.trim(),
      name: raw.name.trim(),
      categoryId: raw.categoryId,
      unit: raw.unit.trim(),
      salePrice: raw.salePrice!,
    };

    const request = this.isEdit()
      ? this.service.update(this.productId()!, dto)
      : this.service.create(dto);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notify.success(this.isEdit() ? 'Material actualizado.' : 'Material creado.');
        this.goBack();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        if (err.status === 409) {
          this.form.controls.sku.setErrors({ duplicateSku: true });
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/inventory/finished-products']);
  }

  private loadCategories(): void {
    this.categoryService.list('FINISHED_PRODUCT').subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  private loadProduct(id: string): void {
    this.loadingData.set(true);
    this.service.getById(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          sku: p.sku,
          name: p.name,
          categoryId: p.categoryId,
          unit: p.unit,
          salePrice: Number(p.salePrice),
        });
        this.currentStock.set(p.currentStock);
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.goBack();
      },
    });
  }
}
