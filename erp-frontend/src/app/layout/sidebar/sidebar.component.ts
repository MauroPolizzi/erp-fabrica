import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  /** Funcionalidad de una fase posterior: se muestra pero deshabilitada. */
  disabled?: boolean;
}

/**
 * Navegación lateral del shell autenticado. Los ítems sin ruta aún
 * (features de fases posteriores) se muestran deshabilitados.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly collapsed = input<boolean>(false);

  // Solo Dashboard está activo en Fase 0; el resto se habilita en sus fases.
  readonly items: NavItem[] = [
    { label: 'Inicio', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Clientes', icon: 'pi pi-users', route: '/commercial/customers' },
    { label: 'Materiales', icon: 'pi pi-box', disabled: true },
    { label: 'Ventas', icon: 'pi pi-shopping-cart', disabled: true },
  ];
}
