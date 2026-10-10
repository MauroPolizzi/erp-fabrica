/**
 * Grillas con búsqueda previa: al entrar no debe salir ninguna request de listado, y
 * sí al tipear 2 caracteres.
 *
 * Se afirma sobre el HTTP y no sobre el estado interno porque el requisito de negocio
 * es exactamente ese: no traer el listado completo al abrir la pantalla.
 */
import { Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DataTableComponent } from '../shared/components/data-table/data-table.component';
import { CustomerListComponent } from './commercial/customers/customer-list/customer-list.component';
import { ProductListComponent } from './inventory/finished-products/product-list/product-list.component';
import { UserListComponent } from './users/user-list/user-list.component';

interface GridCase {
  name: string;
  component: Type<unknown>;
  /** Fragmento de URL del endpoint de listado que NO debe pedirse al entrar. */
  listUrl: string;
}

// Ventas NO está acá: por decisión de negocio muestra las ventas del día al entrar
// (ver sale-list.component.spec.ts).
const CASES: GridCase[] = [
  { name: 'Clientes', component: CustomerListComponent, listUrl: '/commercial/customers' },
  { name: 'Materiales', component: ProductListComponent, listUrl: '/inventory/finished-products' },
  { name: 'Usuarios', component: UserListComponent, listUrl: '/users' },
];

describe('Grillas sin carga inicial', () => {
  let httpMock: HttpTestingController;

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

  /** URLs pedidas hasta el momento (se consumen para no dejar requests pendientes). */
  function issuedUrls(): string[] {
    return httpMock.match(() => true).map((r) => r.request.urlWithParams);
  }

  for (const testCase of CASES) {
    it(`${testCase.name}: no pide el listado al entrar`, () => {
      const fixture = TestBed.createComponent(testCase.component);
      fixture.detectChanges();

      const listRequests = issuedUrls().filter((u) => u.includes(testCase.listUrl));
      expect(listRequests).toEqual([]);
    });

    it(`${testCase.name}: pide el listado al tipear 2 caracteres`, fakeAsync(() => {
      const fixture = TestBed.createComponent(testCase.component);
      fixture.detectChanges();
      issuedUrls(); // descarta las cargas auxiliares (categorías, roles)

      typeInGrid(fixture, 'ab');
      tick(300);
      fixture.detectChanges();

      const listRequests = issuedUrls().filter((u) => u.includes(testCase.listUrl));
      expect(listRequests.length).toBe(1);
      expect(listRequests[0]).toContain('search=ab');
    }));
  }

  function typeInGrid(fixture: ComponentFixture<unknown>, value: string): void {
    const grid = fixture.debugElement.query(By.directive(DataTableComponent))
      .componentInstance as DataTableComponent<unknown>;
    grid.onSearch({ target: { value } } as unknown as Event);
  }
});
