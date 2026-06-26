import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface FlowStep {
  label: string;
  icon: string;
  hint: string;
  route: string;
}

/** Landing simple post-login: bienvenida + accesos rápidos al flujo de la demo. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly steps: FlowStep[] = [
    {
      label: '1. Clientes',
      icon: 'pi pi-users',
      hint: 'Dar de alta el cliente de la venta.',
      route: '/commercial/customers',
    },
    {
      label: '2. Materiales',
      icon: 'pi pi-box',
      hint: 'Crear el producto y su categoría.',
      route: '/inventory/finished-products',
    },
    {
      label: '3. Stock',
      icon: 'pi pi-arrow-up',
      hint: 'Cargar stock inicial (IN).',
      route: '/inventory/finished-products',
    },
    {
      label: '4. Venta',
      icon: 'pi pi-shopping-cart',
      hint: 'Registrar la venta y verificar el stock.',
      route: '/commercial/sales/new',
    },
  ];

  userEmail(): string {
    return this.auth.currentUser()?.email ?? '';
  }

  onNewSale(): void {
    this.router.navigate(['/commercial/sales/new']);
  }
}
