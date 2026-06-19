import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

/**
 * Barra superior: botón para colapsar el sidebar + menú de usuario con logout.
 * Lee el usuario del signal `currentUser` de AuthService.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, MenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly toggleSidebar = output<void>();

  readonly menuItems: MenuItem[] = [
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
  ];

  userEmail(): string {
    return this.auth.currentUser()?.email ?? '';
  }

  private logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
