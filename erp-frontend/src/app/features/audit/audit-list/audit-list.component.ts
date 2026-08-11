import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AuditLog } from '../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import {
  DataTableColumn,
  DataTableComponent,
  DataTableLazyEvent,
} from '../../../shared/components/data-table/data-table.component';
import { AuditService } from '../audit.service';

type AuditRow = AuditLog & { usuario: string; accionLabel: string };

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Modificación',
  DELETE: 'Baja',
};

/** Auditoría de solo lectura: listado filtrable + detalle con el diff de valores (JSON). */
@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    TooltipModule,
    PageHeaderComponent,
    DataTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audit-list.component.html',
})
export class AuditListComponent {
  private readonly service = inject(AuditService);

  readonly rows = signal<AuditRow[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly entities = signal<string[]>([]);

  readonly selected = signal<AuditLog | null>(null);
  readonly detailVisible = signal(false);

  entityFilter = '';
  actionFilter = '';
  fromDate = '';
  toDate = '';

  private lastEvent: DataTableLazyEvent = { page: 1, limit: 10, search: '' };

  readonly actionOptions = [
    { label: 'Todas las acciones', value: '' },
    { label: 'Creación', value: 'CREATE' },
    { label: 'Modificación', value: 'UPDATE' },
    { label: 'Baja', value: 'DELETE' },
  ];

  readonly columns: DataTableColumn[] = [
    { field: 'createdAt', header: 'Fecha', type: 'datetime' },
    { field: 'usuario', header: 'Usuario' },
    { field: 'accionLabel', header: 'Acción' },
    { field: 'entity', header: 'Entidad' },
  ];

  constructor() {
    this.service.entities().subscribe({ next: (e) => this.entities.set(e) });
  }

  /** Opciones del dropdown de entidad (Todas + las presentes en los logs). */
  entityOptions(): { label: string; value: string }[] {
    return [{ label: 'Todas las entidades', value: '' }, ...this.entities().map((e) => ({ label: e, value: e }))];
  }

  onLazyLoad(event: DataTableLazyEvent): void {
    this.lastEvent = event;
    this.load();
  }

  onFilterChange(): void {
    this.load();
  }

  clearFilters(): void {
    this.entityFilter = '';
    this.actionFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.load();
  }

  onView(row: AuditRow): void {
    this.detailVisible.set(true);
    this.selected.set(null);
    // El listado no trae oldValues/newValues: se piden en el detalle.
    this.service.getById(row.id).subscribe({ next: (log) => this.selected.set(log) });
  }

  /** Formatea un blob de valores (JSON) para mostrarlo en el detalle. */
  format(value: unknown): string {
    return value == null ? '—' : JSON.stringify(value, null, 2);
  }

  private load(): void {
    this.loading.set(true);
    this.service
      .list(this.lastEvent.page, this.lastEvent.limit, {
        entity: this.entityFilter || undefined,
        action: this.actionFilter || undefined,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(
            res.data.map((l) => ({
              ...l,
              usuario: l.user?.fullName ?? 'Sistema',
              accionLabel: ACTION_LABELS[l.action] ?? l.action,
            })),
          );
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
