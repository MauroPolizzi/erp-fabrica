import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

/** Estados de la pantalla, en el orden en que los recorre el usuario. */
type ResetState = 'validating' | 'form' | 'success' | 'invalid';

/** Valida a nivel grupo que ambas contraseñas coincidan. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

/**
 * Paso 2 de la recuperación: el usuario llega desde el mail con `?token=...` y elige
 * una contraseña nueva.
 *
 * El token se valida al entrar para no hacerle completar el formulario si el enlace
 * ya venció o se usó. La validación mínima (8 caracteres) replica la del backend.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    PasswordModule,
    MessageModule,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly state = signal<ResetState>('validating');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  private token = '';

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.state.set('invalid');
      return;
    }

    this.auth.validateResetToken(this.token).subscribe({
      next: (valid) => this.state.set(valid ? 'form' : 'invalid'),
      error: () => this.state.set('invalid'),
    });
  }

  isInvalid(control: 'password' | 'confirmPassword'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  /** El error de coincidencia vive en el grupo, no en el control. */
  hasMismatch(): boolean {
    const confirm = this.form.controls.confirmPassword;
    return this.form.hasError('mismatch') && (confirm.dirty || confirm.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.resetPassword(this.token, this.form.getRawValue().password).subscribe({
      next: (message) => {
        this.loading.set(false);
        this.successMessage.set(message);
        this.state.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // 400 = el enlace dejó de ser válido entre la validación inicial y el envío
        // (venció o se usó en otra pestaña): no tiene sentido reintentar el formulario.
        if (err.status === 400) {
          this.state.set('invalid');
          return;
        }
        this.errorMessage.set(
          err.status === 429
            ? 'Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.'
            : 'No se pudo actualizar la contraseña. Intentá nuevamente.',
        );
      },
    });
  }
}
