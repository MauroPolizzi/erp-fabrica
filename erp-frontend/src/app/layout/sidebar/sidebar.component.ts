import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  /** Permiso RBAC requerido para ver el ítem. Sin permiso = visible para todos. */
  permission?: string;
  /** Funcionalidad de una fase posterior: se muestra pero deshabilitada. */
  disabled?: boolean;
}

/**
 * Navegación lateral del shell autenticado. Los ítems se filtran por el permiso
 * RBAC del usuario (los sin ruta aún de fases posteriores se muestran deshabilitados).
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  readonly collapsed = input<boolean>(false);

  private readonly allItems: NavItem[] = [
    { label: 'Inicio', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Clientes', icon: 'pi pi-users', route: '/commercial/customers', permission: 'commercial.read' },
    { label: 'Materiales', icon: 'pi pi-box', route: '/inventory/finished-products', permission: 'inventory.read' },
    { label: 'Ventas', icon: 'pi pi-shopping-cart', route: '/commercial/sales', permission: 'commercial.read' },
    { label: 'Caja de ventas', icon: 'pi pi-wallet', route: '/finance/sales-cash', permission: 'finance.read' },
    { label: 'Usuarios', icon: 'pi pi-id-card', route: '/users', permission: 'users.read' },
    { label: 'Roles', icon: 'pi pi-shield', route: '/roles', permission: 'users.read' },
    { label: 'Auditoría', icon: 'pi pi-history', route: '/audit', permission: 'audit.read' },
    { label: 'Reportes', icon: 'pi pi-file-excel', route: '/reports', permission: 'reports.read' },
  ];

  /** Ítems visibles según los permisos del usuario autenticado. */
  readonly items = computed(() =>
    this.allItems.filter((item) => !item.permission || this.auth.hasPermission(item.permission)),
  );
}
