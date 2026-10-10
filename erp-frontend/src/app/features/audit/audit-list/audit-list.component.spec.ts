/**
 * Auditoría: el listado arranca acotado al día en curso en lugar de traer el histórico
 * completo, sin perder el acceso a fechas anteriores.
 */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import dayjs from 'dayjs';
import { AuditListComponent } from './audit-list.component';

describe('AuditListComponent — acotada al día actual', () => {
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

  function auditListUrls(): string[] {
    return httpMock
      .match(() => true)
      .map((r) => r.request.urlWithParams)
      .filter((u) => u.includes('/audit') && !u.includes('/audit/entities'));
  }

  // El conteo exacto importa: los p-dropdown se cablean con (onChange) y no con
  // (ngModelChange) justamente porque este último emite al inicializarse y provocaba
  // tres cargas idénticas al abrir la pantalla.
  it('al entrar pide el listado del día de hoy una sola vez', () => {
    const fixture = TestBed.createComponent(AuditListComponent);
    fixture.detectChanges();

    const urls = auditListUrls();
    expect(urls.length).toBe(1);
    expect(urls[0]).toContain(`from=${TODAY}`);
    expect(urls[0]).toContain(`to=${TODAY}`);
  });

  it('un ciclo de change detection no dispara cargas extra', fakeAsync(() => {
    const fixture = TestBed.createComponent(AuditListComponent);
    fixture.detectChanges();
    auditListUrls();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(auditListUrls()).toEqual([]);
  }));

  it('los campos Desde/Hasta arrancan completados con hoy', () => {
    const fixture = TestBed.createComponent(AuditListComponent);
    fixture.detectChanges();
    auditListUrls();

    const component = fixture.componentInstance;
    expect(component.fromDate).toBe(TODAY);
    expect(component.toDate).toBe(TODAY);
    expect(component.hasCustomFilters()).toBe(false);
  });

  it('ampliar el rango permite consultar el histórico', fakeAsync(() => {
    const fixture = TestBed.createComponent(AuditListComponent);
    fixture.detectChanges();
    auditListUrls();

    const component = fixture.componentInstance;
    const lastMonth = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    component.fromDate = lastMonth;
    component.onFilterChange();
    tick();
    fixture.detectChanges();

    const urls = auditListUrls();
    expect(urls.length).toBe(1);
    expect(urls[0]).toContain(`from=${lastMonth}`);
    expect(component.hasCustomFilters()).toBe(true);
  }));

  it('"Restablecer" vuelve al día actual, no a "todo el histórico"', fakeAsync(() => {
    const fixture = TestBed.createComponent(AuditListComponent);
    fixture.detectChanges();
    auditListUrls();

    const component = fixture.componentInstance;
    component.fromDate = '2020-01-01';
    component.entityFilter = 'Sale';
    component.onFilterChange();
    tick();
    auditListUrls();

    component.clearFilters();
    tick();
    fixture.detectChanges();

    const urls = auditListUrls();
    expect(urls.length).toBe(1);
    expect(urls[0]).toContain(`from=${TODAY}`);
    expect(urls[0]).toContain(`to=${TODAY}`);
    expect(urls[0]).not.toContain('entity=');
    expect(component.hasCustomFilters()).toBe(false);
  }));
});
