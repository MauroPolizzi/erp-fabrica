import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

/**
 * Indicador de carga centrado. Mostrar condicionalmente con @if en el host.
 * Uso: <app-loading-spinner [label]="'Cargando...'" />
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [ProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-spinner.component.html',
})
export class LoadingSpinnerComponent {
  readonly label = input<string>('');
}
