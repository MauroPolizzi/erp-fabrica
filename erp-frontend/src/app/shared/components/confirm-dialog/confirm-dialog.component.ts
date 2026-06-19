import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

/**
 * Diálogo global de confirmación para acciones destructivas (baja lógica, etc.).
 * Se monta una sola vez (app root) y se dispara desde cualquier feature con
 * PrimeNG `ConfirmationService` (provisto en app.config).
 *
 * Uso desde un componente:
 *   private readonly confirm = inject(ConfirmationService);
 *   this.confirm.confirm({
 *     header: 'Confirmar baja',
 *     message: '¿Dar de baja a este cliente?',
 *     accept: () => this.deactivate(),
 *   });
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {}
