import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinishedProductService, StockMovementInput } from '../finished-product.service';

/**
 * Diálogo para registrar un movimiento de stock (`IN` suma, `ADJUST` fija) sobre
 * un producto. Emite por `saved` el `currentStock` resultante que devuelve el backend.
 */
@Component({
  selector: 'app-stock-movement-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-movement-dialog.component.html',
})
export class StockMovementDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FinishedProductService);
  private readonly notify = inject(NotificationService);

  readonly visible = model<boolean>(false);
  readonly productId = input<string>('');
  readonly productName = input<string>('');
  readonly currentStock = input<string>('0');

  readonly saved = output<string>();

  readonly saving = signal(false);

  readonly typeOptions = [
    { label: 'Ingreso (IN)', value: 'IN' },
    { label: 'Ajuste (ADJUST)', value: 'ADJUST' },
  ];

  readonly form = this.fb.nonNullable.group({
    type: ['IN' as 'IN' | 'ADJUST', [Validators.required]],
    quantity: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.0001)]),
    reference: [''],
  });

  onShow(): void {
    this.form.reset({ type: 'IN', quantity: null, reference: '' });
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
    const dto: StockMovementInput = {
      type: raw.type,
      quantity: raw.quantity!,
      reference: raw.reference.trim() || undefined,
    };

    this.service.addMovement(this.productId(), dto).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.notify.success('Movimiento de stock registrado.');
        this.saved.emit(res.currentStock);
        this.visible.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  close(): void {
    this.visible.set(false);
  }
}
