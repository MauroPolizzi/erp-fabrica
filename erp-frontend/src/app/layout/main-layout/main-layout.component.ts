import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

/**
 * Shell autenticado: sidebar colapsable + header + área de contenido (router-outlet).
 * Montado bajo el authGuard en el grupo de rutas protegidas.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  readonly collapsed = signal(false);

  toggle(): void {
    this.collapsed.update((v) => !v);
  }
}
