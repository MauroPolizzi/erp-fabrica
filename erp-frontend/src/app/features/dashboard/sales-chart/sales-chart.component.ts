import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import dayjs from 'dayjs';
import { ChartCardComponent } from '../../../shared/components/chart-card/chart-card.component';
import {
  BAR_MARK,
  chartTokens,
  currencyChartOptions,
  formatArs,
} from '../../../shared/utils/chart-theme';
import { DashboardService, SalesSeries, SalesSeriesGroupBy } from '../dashboard.service';

/**
 * Evolución de las ventas confirmadas. Es el único gráfico con serie temporal real del
 * sistema: los KPIs de la home son fotos puntuales y no responden "¿cómo venimos?".
 *
 * Tiene su propio estado, así que cambiar el período recarga solo el gráfico y no
 * vuelve a pedir los KPIs.
 */
@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [FormsModule, ChartModule, SelectButtonModule, ChartCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sales-chart.component.html',
})
export class SalesChartComponent {
  private readonly service = inject(DashboardService);

  readonly series = signal<SalesSeries | null>(null);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  /** Presets: el backend deriva el rango de la granularidad. */
  groupBy: SalesSeriesGroupBy = 'day';
  readonly periodOptions: { label: string; value: SalesSeriesGroupBy }[] = [
    { label: 'Día', value: 'day' },
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
  ];

  /** Un período con todos los buckets en cero se muestra como vacío, no como barras planas. */
  readonly hasData = computed(() => (this.series()?.points ?? []).some((point) => point.count > 0));

  readonly subtitle = computed(() => {
    const series = this.series();
    if (!series) return '';
    const from = dayjs(series.from).format('DD/MM/YYYY');
    const to = dayjs(series.to).format('DD/MM/YYYY');
    return `${from} al ${to} · solo ventas confirmadas`;
  });

  readonly emptyMessage = computed(() =>
    this.loadFailed()
      ? 'No se pudieron cargar las ventas.'
      : 'Sin ventas confirmadas en el período.',
  );

  readonly chartData = computed(() => {
    const series = this.series();
    if (!series) return null;
    return {
      labels: series.points.map((point) => bucketLabel(point.label, series.groupBy)),
      datasets: [
        {
          ...BAR_MARK,
          data: series.points.map((point) => Number(point.total)),
          // Serie única: siempre el slot 1 del sistema de diseño.
          backgroundColor: chartTokens().series[0],
        },
      ],
    };
  });

  readonly chartOptions = computed(() => {
    const points = this.series()?.points ?? [];
    return currencyChartOptions((index) => {
      const point = points[index];
      if (!point) return [];
      return [formatArs(Number(point.total)), `${point.count} venta(s)`];
    });
  });

  constructor() {
    this.load();
  }

  onPeriodChange(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.service.getSalesSeries(this.groupBy).subscribe({
      next: (series) => {
        this.series.set(series);
        this.loading.set(false);
      },
      // El mensaje lo muestra el errorInterceptor; acá solo se deja la tarjeta vacía.
      error: () => {
        this.series.set(null);
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }
}

/**
 * Etiqueta del eje X. Se usa formato numérico (DD/MM, MM/YYYY) en vez de nombres de mes
 * para no depender del locale global de Day.js y para seguir el estilo de fechas del ERP.
 */
function bucketLabel(iso: string, groupBy: SalesSeriesGroupBy): string {
  return dayjs(iso).format(groupBy === 'month' ? 'MM/YYYY' : 'DD/MM');
}
