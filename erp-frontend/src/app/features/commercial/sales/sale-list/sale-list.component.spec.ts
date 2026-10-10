/**
 * Ventas: por decisión de negocio la grilla muestra las ventas del día al entrar, sin
 * exigir búsqueda previa. La búsqueda por cliente es un filtro adicional.
 */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import dayjs from 'dayjs';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { SaleListComponent } from './sale-list.component';

describe('SaleListComponent — ventas del día', () => {
  let httpMock: HttpTestingController;
  const TODAY = dayjs().format('YYYY-MM-DD');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        MessageService,
        ConfirmationService,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  const salesUrls = () =>
    httpMock
      .match(() => true)
      .map((r) => r.request.urlWithParams)
      .filter((u) => u.includes('/commercial/sales'));

  it('al entrar carga las ventas del día, sin búsqueda previa', () => {
    const fixture = TestBed.createComponent(SaleListComponent);
    fixture.detectChanges();

    const urls = salesUrls();
    expect(urls.length).toBe(1);
    expect(urls[0]).toContain(`from=${TODAY}`);
    expect(urls[0]).toContain(`to=${TODAY}`);
    expect(urls[0]).not.toContain('search=');
  });

  it('los campos arrancan en hoy y no ofrecen "Restablecer"', () => {
    const fixture = TestBed.createComponent(SaleListComponent);
    fixture.detectChanges();
    salesUrls();

    const component = fixture.componentInstance;
    expect(component.fromDate).toBe(TODAY);
    expect(component.toDate).toBe(TODAY);
    expect(component.statusFilter).toBe('');
    expect(component.hasCustomFilters()).toBe(false);
  });

  it('un solo carácter en el buscador ya filtra (no hay mínimo)', fakeAsync(() => {
    const fixture = TestBed.createComponent(SaleListComponent);
    fixture.detectChanges();
    salesUrls();

    const grid = fixture.debugElement.query(By.directive(DataTableComponent))
      .componentInstance as DataTableComponent<unknown>;
    grid.onSearch({ target: { value: 'a' } } as unknown as Event);
    tick(300);
    fixture.detectChanges();

    const urls = salesUrls();
    expect(urls.length).toBe(1);
    expect(urls[0]).toContain('search=a');
  }));

  it('cambiar el estado recarga una sola vez', fakeAsync(() => {
    const fixture = TestBed.createComponent(SaleListComponent);
    fixture.detectChanges();
    tick();
    salesUrls();

    const component = fixture.componentInstance;
    // Se asigna y se sincroniza el binding ANTES de recargar: NgModel propaga el valor
    // de forma asíncrona y, si no se le da ese ciclo, pisa la asignación en el tick.
    component.statusFilter = 'CONFIRMED';
    fixture.detectChanges();
    tick();
    // Sincronizar el binding por sí solo no debe pedir nada: el dropdown recarga por
    // (onChange), que solo emite ante una selección real del usuario.
    expect(salesUrls()).toEqual([]);

    component.onFilterChange();
    tick();

    const urls = salesUrls();
    expect(urls.length).toBe(1);
    expect(urls[0]).toContain('status=CONFIRMED');
    expect(component.hasCustomFilters()).toBe(true);
  }));

  it('un ciclo de change detection no dispara cargas extra', fakeAsync(() => {
    const fixture = TestBed.createComponent(SaleListComponent);
    fixture.detectChanges();
    tick();
    salesUrls();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(salesUrls()).toEqual([]);
  }));

  it('"Restablecer" vuelve al día actual y limpia el estado', fakeAsync(() => {
    const fixture = TestBed.createComponent(SaleListComponent);
    fixture.detectChanges();
    salesUrls();

    const component = fixture.componentInstance;
    component.fromDate = '2020-01-01';
    component.statusFilter = 'CANCELLED';
    fixture.detectChanges();
    tick();
    salesUrls();

    component.clearFilters();
    fixture.detectChanges();
    tick();

    const urls = salesUrls();
    expect(urls.length).toBe(1);
    expect(urls[0]).toContain(`from=${TODAY}`);
    expect(urls[0]).not.toContain('status=');
    expect(component.hasCustomFilters()).toBe(false);
  }));
});
