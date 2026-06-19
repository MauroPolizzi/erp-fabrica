import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

/** Landing simple post-login: bienvenida + recordatorio del flujo de la demo. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  readonly steps = [
    { label: '1. Clientes', icon: 'pi pi-users', hint: 'Dar de alta el cliente de la venta.' },
    { label: '2. Materiales', icon: 'pi pi-box', hint: 'Crear el producto y su categoría.' },
    { label: '3. Stock', icon: 'pi pi-arrow-up', hint: 'Cargar stock inicial (IN).' },
    { label: '4. Venta', icon: 'pi pi-shopping-cart', hint: 'Registrar la venta y verificar el stock.' },
  ];

  userEmail(): string {
    return this.auth.currentUser()?.email ?? '';
  }
}
