import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationService } from '../../../../core/services/notification.service';
import { Category } from '../../../../core/models/domain.model';
import { CategoryService } from '../category.service';

/**
 * Alta rápida de categoría (tipo `FINISHED_PRODUCT`). Pensado para embeberse en
 * un diálogo desde el form de Material: emite la categoría creada por `created`.
 */
@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoryService);
  private readonly notify = inject(NotificationService);

  readonly saving = signal(false);
  readonly created = output<Category>();
  readonly cancelled = output<void>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  isInvalid(): boolean {
    const c = this.form.controls.name;
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.service.create({ name: this.form.controls.name.value.trim(), type: 'FINISHED_PRODUCT' }).subscribe({
      next: (category) => {
        this.saving.set(false);
        this.notify.success('Categoría creada.');
        this.form.reset();
        this.created.emit(category);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.form.reset();
    this.cancelled.emit();
  }
}
