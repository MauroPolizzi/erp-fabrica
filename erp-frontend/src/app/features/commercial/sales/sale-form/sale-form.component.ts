import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Decimal } from 'decimal.js';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { Customer, FinishedProduct, PaymentMethod } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';
import { CustomerService } from '../../customers/customer.service';
import { FinishedProductService } from '../../../inventory/finished-products/finished-product.service';
import { PAYMENT_METHODS, SaleInput, SaleService } from '../sale.service';

/**
 * Núcleo de la demo: registro de venta multi-línea. Selecciona cliente y medio de
 * pago, agrega líneas (material + cantidad) con precio congelado y preview de
 * subtotal/total con decimal.js. El total definitivo lo calcula el backend; ante
 * 422 (stock insuficiente) el toast del errorInterceptor avisa y no se navega.
 */
@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    PageHeaderComponent,
    CurrencyArsPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-form.component.html',
})
export class SaleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SaleService);
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(FinishedProductService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly products = signal<FinishedProduct[]>([]);
  private readonly productMap = signal(new Map<string, FinishedProduct>());
  private readonly customersLoaded = signal(false);
  private readonly productsLoaded = signal(false);

  /** Avisos cuando no hay datos suficientes para registrar una venta. */
  readonly noCustomers = computed(() => this.customersLoaded() && this.customers().length === 0);
  readonly noProducts = computed(() => this.productsLoaded() && this.products().length === 0);

  readonly paymentMethods = PAYMENT_METHODS;

  readonly form = this.fb.group({
    customerId: this.fb.nonNullable.control('', [Validators.required]),
    paymentMethod: this.fb.nonNullable.control<PaymentMethod>('CASH', [Validators.required]),
    items: this.fb.array([this.newLine()]),
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** Vista previa de cada línea + totales, recalculada con decimal.js. */
  readonly summary = computed(() => {
    const value = this.formValue();
    const map = this.productMap();
    let subtotal = new Decimal(0);
    const lines = (value.items ?? []).map((it) => {
      const product = it?.finishedProductId ? map.get(it.finishedProductId) : undefined;
      const unitPrice = product ? new Decimal(product.salePrice) : new Decimal(0);
      const quantity = new Decimal(Number(it?.quantity) || 0);
      const lineTotal = unitPrice.times(quantity);
      subtotal = subtotal.plus(lineTotal);
      return { unitPrice: unitPrice.toFixed(2), lineTotal: lineTotal.toFixed(2) };
    });
    return { lines, subtotal: subtotal.toFixed(2), total: subtotal.toFixed(2) };
  });

  constructor() {
    this.loadCustomers();
    this.loadProducts();
  }

  get items(): FormArray {
    return this.form.controls.items;
  }

  isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  addLine(): void {
    this.items.push(this.newLine());
  }

  removeLine(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const dto: SaleInput = {
      customerId: raw.customerId,
      paymentMethod: raw.paymentMethod,
      items: raw.items.map((it) => ({
        finishedProductId: it.finishedProductId,
        quantity: Number(it.quantity),
      })),
    };

    this.service.create(dto).subscribe({
      next: (sale) => {
        this.saving.set(false);
        this.router.navigate(['/commercial/sales', sale.id]);
      },
      // 422 (stock insuficiente) y demás errores los notifica el errorInterceptor;
      // no se navega para que el usuario corrija las líneas.
      error: () => this.saving.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/commercial/sales']);
  }

  private newLine() {
    return this.fb.nonNullable.group({
      finishedProductId: ['', [Validators.required]],
      quantity: this.fb.control<number | null>(1, [Validators.required, Validators.min(0.0001)]),
    });
  }

  private loadCustomers(): void {
    this.customerService.list(1, 200).subscribe({
      next: (res) => {
        this.customers.set(res.data.filter((c) => c.isActive));
        this.customersLoaded.set(true);
      },
    });
  }

  private loadProducts(): void {
    this.productService.list(1, 200).subscribe({
      next: (res) => {
        const active = res.data.filter((p) => p.isActive);
        this.products.set(active);
        this.productMap.set(new Map(active.map((p) => [p.id, p])));
        this.productsLoaded.set(true);
      },
    });
  }
}
