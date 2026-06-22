import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationService } from '../../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CustomerInput, CustomerService } from '../customer.service';

/** Alta/edición de cliente con Reactive Form. El modo lo determina el param `:id`. */
@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  readonly saving = signal(false);
  readonly loadingData = signal(false);
  readonly customerId = signal<string | null>(null);
  readonly isEdit = computed(() => this.customerId() !== null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    taxId: [''],
    email: ['', [Validators.email]],
    phone: [''],
    address: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  isInvalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const dto: CustomerInput = {
      name: raw.name.trim(),
      taxId: raw.taxId.trim() || undefined,
      email: raw.email.trim() || undefined,
      phone: raw.phone.trim() || undefined,
      address: raw.address.trim() || undefined,
    };

    const request = this.isEdit()
      ? this.service.update(this.customerId()!, dto)
      : this.service.create(dto);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notify.success(this.isEdit() ? 'Cliente actualizado.' : 'Cliente creado.');
        this.goBack();
      },
      error: () => this.saving.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/commercial/customers']);
  }

  private loadCustomer(id: string): void {
    this.loadingData.set(true);
    this.service.getById(id).subscribe({
      next: (c) => {
        this.form.patchValue({
          name: c.name,
          taxId: c.taxId ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          address: c.address ?? '',
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.goBack();
      },
    });
  }
}
