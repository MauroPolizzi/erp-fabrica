import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyArsPipe } from '../../shared/pipes/currency-ars.pipe';
import { DashboardService, DashboardSummary } from './dashboard.service';
import { SalesChartComponent } from './sales-chart/sales-chart.component';

/** Home post-login: KPIs de gestión (ventas del período, top clientes, stock bajo). */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, LoadingSpinnerComponent, CurrencyArsPipe, SalesChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(DashboardService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.service.getSummary().subscribe({
      next: (s) => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  userEmail(): string {
    return this.auth.currentUser()?.email ?? '';
  }
}
