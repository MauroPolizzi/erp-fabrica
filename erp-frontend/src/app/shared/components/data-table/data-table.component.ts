import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyArsPipe } from '../../pipes/currency-ars.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

export interface DataTableColumn {
  field: string;
  header: string;
  type?: 'text' | 'currency' | 'date' | 'datetime';
  sortable?: boolean;
  /** Clases Tailwind extra para la celda (ej. 'text-right'). */
  cellClass?: string;
}

export interface DataTableLazyEvent {
  page: number;
  limit: number;
  search: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tabla genérica con paginación server-side (PrimeNG p-table lazy), búsqueda con
 * debounce y formateo por tipo de columna. Emite `lazyLoad` con page/limit/search.
 *
 * Para una columna de acciones, proyectar un template:
 *   <app-data-table ...>
 *     <ng-template #rowActions let-row>
 *       <p-button icon="pi pi-pencil" (onClick)="edit(row)" />
 *     </ng-template>
 *   </app-data-table>
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CurrencyArsPipe,
    DateFormatPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T = Record<string, unknown>> {
  readonly columns = input.required<DataTableColumn[]>();
  readonly rows = input<T[]>([]);
  readonly total = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rowsPerPage = input<number>(10);
  readonly searchable = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Buscar...');
  readonly emptyMessage = input<string>('Sin resultados.');

  readonly lazyLoad = output<DataTableLazyEvent>();

  @ContentChild('rowActions') rowActions?: TemplateRef<unknown>;

  private search = '';
  private lastEvent?: TableLazyLoadEvent;
  private readonly search$ = new Subject<void>();

  constructor() {
    this.search$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => this.emit());
  }

  colspan(): number {
    return this.columns().length + (this.rowActions ? 1 : 0);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.lastEvent = event;
    this.emit();
  }

  onSearch(event: Event): void {
    this.search = (event.target as HTMLInputElement).value.trim();
    // Una nueva búsqueda vuelve a la primera página.
    if (this.lastEvent) {
      this.lastEvent.first = 0;
    }
    this.search$.next();
  }

  private emit(): void {
    const first = this.lastEvent?.first ?? 0;
    const limit = (this.lastEvent?.rows as number) || this.rowsPerPage();
    const sortField = (this.lastEvent?.sortField as string) || undefined;
    const sortOrder = this.lastEvent?.sortOrder === -1 ? 'desc' : this.lastEvent?.sortOrder === 1 ? 'asc' : undefined;
    this.lazyLoad.emit({
      page: Math.floor(first / limit) + 1,
      limit,
      search: this.search,
      sortField,
      sortOrder,
    });
  }
}
