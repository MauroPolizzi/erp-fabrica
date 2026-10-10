/**
 * Caja de ventas: el listado de movimientos arranca acotado al día en curso, pero el
 * saldo es el acumulado de la caja y se pide sin filtros de fecha.
 */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import dayjs from 'dayjs';
import { CashRegisterComponent } from './cash-register.component';

describe('CashRegisterComponent — acotada al día actual', () => {
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

  const urls = () => httpMock.match(() => true).map((r) => r.request.urlWithParams);
  const movementUrls = () => urls().filter((u) => u.includes('/movements'));

  it('al entrar pide los movimientos del día de hoy', () => {
    const fixture = TestBed.createComponent(CashRegisterComponent);
    fixture.detectChanges();

    const found = movementUrls();
    expect(found.length).toBe(1);
    { const url = found[0];
      expect(url).toContain(`from=${TODAY}`);
      expect(url).toContain(`to=${TODAY}`);
    }
  });

  it('el saldo se pide sin filtros de fecha (es acumulado)', () => {
    const fixture = TestBed.createComponent(CashRegisterComponent);
    fixture.detectChanges();

    const registerUrl = urls().find((u) => u.includes('/sales-cash') && !u.includes('/movements'));
    expect(registerUrl).toBeDefined();
    expect(registerUrl).not.toContain('from=');
    expect(registerUrl).not.toContain('to=');
  });

  it('los campos Desde/Hasta arrancan en hoy y no ofrecen "Restablecer"', () => {
    const fixture = TestBed.createComponent(CashRegisterComponent);
    fixture.detectChanges();
    urls();

    const component = fixture.componentInstance;
    expect(component.fromDate).toBe(TODAY);
    expect(component.toDate).toBe(TODAY);
    expect(component.hasCustomFilters()).toBe(false);
  });

  it('ampliar el rango consulta el histórico', fakeAsync(() => {
    const fixture = TestBed.createComponent(CashRegisterComponent);
    fixture.detectChanges();
    urls();

    const component = fixture.componentInstance;
    const lastMonth = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    component.fromDate = lastMonth;
    component.onFilterChange();
    tick();
    fixture.detectChanges();

    const found = movementUrls();
    expect(found.length).toBe(1);
    { const url = found[0];
      expect(url).toContain(`from=${lastMonth}`);
    }
    expect(component.hasCustomFilters()).toBe(true);
  }));

  it('"Restablecer" vuelve al día actual', fakeAsync(() => {
    const fixture = TestBed.createComponent(CashRegisterComponent);
    fixture.detectChanges();
    urls();

    const component = fixture.componentInstance;
    component.fromDate = '2020-01-01';
    component.onFilterChange();
    tick();
    urls();

    component.clearFilters();
    tick();
    fixture.detectChanges();

    const found = movementUrls();
    expect(found.length).toBe(1);
    { const url = found[0];
      expect(url).toContain(`from=${TODAY}`);
      expect(url).toContain(`to=${TODAY}`);
    }
    expect(component.hasCustomFilters()).toBe(false);
  }));
});
