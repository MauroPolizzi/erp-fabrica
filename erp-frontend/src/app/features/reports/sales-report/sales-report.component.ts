import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import dayjs from 'dayjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Customer } from '../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CustomerService } from '../../commercial/customers/customer.service';
import { ReportService } from '../report.service';

/**
 * Pantalla de reportes. Hoy tiene uno solo (ventas por período); los próximos se suman
 * como una tarjeta más, sin tocar la ruta ni el servicio de descarga.
 */
@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [FormsModule, ButtonModule, DropdownModule, InputTextModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sales-report.component.html',
})
export class SalesReportComponent {
  private readonly service = inject(ReportService);
  private readonly customerService = inject(CustomerService);
  private readonly notify = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly generating = signal(false);
  readonly customers = signal<Customer[]>([]);

  /** El listado de clientes es de otro módulo: sin permiso, se oculta el filtro. */
  readonly canFilterByCustomer = this.auth.hasPermission('commercial.read');

  // Por defecto, el mes en curso: la pantalla sirve sin configurar nada.
  from = dayjs().startOf('month').format('YYYY-MM-DD');
  to = dayjs().format('YYYY-MM-DD');
  customerId = '';

  constructor() {
    if (this.canFilterByCustomer) {
      this.customerService.list(1, 200).subscribe({ next: (res) => this.customers.set(res.data) });
    }
  }

  customerOptions(): { label: string; value: string }[] {
    return [
      { label: 'Todos los clientes', value: '' },
      ...this.customers().map((c) => ({ label: c.name, value: c.id })),
    ];
  }

  /** Mensaje de validación del período; cadena vacía si el rango es válido. */
  rangeError(): string {
    if (!this.from || !this.to) return 'Indicá el período completo (desde y hasta).';
    if (this.from > this.to) return 'La fecha "desde" no puede ser posterior a "hasta".';
    return '';
  }

  onDownload(): void {
    if (this.rangeError()) return;

    this.generating.set(true);
    this.service
      .downloadSalesByPeriod({
        from: this.from,
        to: this.to,
        customerId: this.customerId || undefined,
      })
      .subscribe({
        next: (result) => {
          this.generating.set(false);
          if (result.rows === 0) {
            this.notify.info('No hay ventas confirmadas en el período. El archivo se descargó sin datos.');
          } else {
            this.notify.success(`Reporte generado con ${result.rows} línea(s) de venta.`);
          }
        },
        // El mensaje de error lo muestra el errorInterceptor.
        error: () => this.generating.set(false),
      });
  }
}
