import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Raíz de la app: solo el router-outlet + los hosts globales de notificaciones
 * (p-toast, requerido por NotificationService) y confirmación (ConfirmationService).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {}
