import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Paso 1 de la recuperación: el usuario pide el mail con el link.
 *
 * El backend responde lo mismo exista o no el email, así que la pantalla nunca
 * confirma ni desmiente si la dirección está registrada: al enviar, siempre muestra
 * el mismo aviso genérico.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  /** Mensaje genérico del backend; su presencia conmuta a la vista de confirmación. */
  readonly sentMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isInvalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.forgotPassword(this.form.getRawValue().email.trim()).subscribe({
      next: (message) => {
        this.loading.set(false);
        this.sentMessage.set(message);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 429
            ? 'Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.'
            : 'No se pudo procesar la solicitud. Intentá nuevamente.',
        );
      },
    });
  }
}
