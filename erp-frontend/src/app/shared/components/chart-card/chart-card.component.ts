import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

/**
 * Contenedor de un gráfico: tarjeta, título, alto fijo y los estados de carga/vacío.
 * El componente que lo usa solo aporta el gráfico y, si hace falta, controles.
 *
 * Uso:
 *   <app-chart-card title="Ventas" [loading]="loading()" [empty]="!hasData()">
 *     <p-dropdown chartActions ... />
 *     <p-chart type="bar" ... />
 *   </app-chart-card>
 */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart-card.component.html',
})
export class ChartCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly loading = input<boolean>(false);
  readonly empty = input<boolean>(false);
  readonly emptyMessage = input<string>('Sin datos para el período seleccionado.');
  readonly loadingLabel = input<string>('Cargando datos...');
}
