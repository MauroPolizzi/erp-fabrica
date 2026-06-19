import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Encabezado de página: título + subtítulo opcional + acción primaria opcional.
 * El botón de acción se muestra solo si se pasa `actionLabel`; emite `action`.
 * Para acciones a medida, proyectar contenido en el slot por defecto.
 * Uso:
 *   <app-page-header title="Clientes" actionLabel="Nuevo" (action)="onNew()" />
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionIcon = input<string>('pi pi-plus');
  readonly action = output<void>();
}
