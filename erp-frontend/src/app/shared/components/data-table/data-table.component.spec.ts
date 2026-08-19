/**
 * Búsqueda previa del data-table: con `searchRequired` la grilla no consulta al
 * servidor hasta tener `minSearchLength` caracteres.
 *
 * El caso que más importa es el del paginador: se muestra condicionalmente según el
 * estado, y hay que garantizar que alternarlo no provoque una carga extra.
 */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DataTableColumn, DataTableComponent, DataTableLazyEvent } from './data-table.component';

describe('DataTableComponent — búsqueda previa', () => {
  let fixture: ComponentFixture<DataTableComponent<unknown>>;
  let component: DataTableComponent<unknown>;
  let emissions: DataTableLazyEvent[];

  const columns: DataTableColumn[] = [{ field: 'name', header: 'Nombre' }];

  function type(value: string): void {
    component.onSearch({ target: { value } } as unknown as Event);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    emissions = [];
    fixture.componentRef.setInput('columns', columns);
    component.lazyLoad.subscribe((e) => emissions.push(e));
  });

  it('SIN searchRequired: carga al montarse (comportamiento actual intacto)', () => {
    fixture.detectChanges();
    expect(emissions.length).toBe(1);
  });

  it('CON searchRequired: no emite nada al montarse', () => {
    fixture.componentRef.setInput('searchRequired', true);
    fixture.detectChanges();
    expect(emissions.length).toBe(0);
    expect(component.awaitingSearch()).toBe(true);
  });

  it('con 1 carácter no emite; con 2 emite una sola vez', fakeAsync(() => {
    fixture.componentRef.setInput('searchRequired', true);
    fixture.detectChanges();

    type('a');
    tick(300);
    fixture.detectChanges();
    expect(emissions.length).toBe(0);

    type('ab');
    tick(300);
    fixture.detectChanges();
    expect(emissions.length).toBe(1);
    expect(emissions[0].search).toBe('ab');
    expect(emissions[0].page).toBe(1);
  }));

  it('al volver por debajo del mínimo no emite y oculta las filas', fakeAsync(() => {
    fixture.componentRef.setInput('searchRequired', true);
    fixture.componentRef.setInput('rows', [{ name: 'Resultado previo' }]);
    fixture.detectChanges();

    type('ab');
    tick(300);
    fixture.detectChanges();
    expect(emissions.length).toBe(1);
    expect(component.displayRows().length).toBe(1);

    type('a');
    tick(300);
    fixture.detectChanges();
    expect(emissions.length).toBe(1); // no hubo request nueva
    expect(component.displayRows().length).toBe(0); // no quedan filas viejas visibles
  }));

  it('alternar el paginador al pasar a resultados no dispara una carga extra', fakeAsync(() => {
    fixture.componentRef.setInput('searchRequired', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p-paginator')).toBeNull();

    type('ab');
    tick(300);
    fixture.detectChanges();
    tick(50);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p-paginator')).not.toBeNull();
    expect(emissions.length).toBe(1); // exactamente una, no dos
  }));

  it('el mensaje guía se deriva de minSearchLength', () => {
    fixture.componentRef.setInput('searchRequired', true);
    fixture.componentRef.setInput('minSearchLength', 3);
    fixture.detectChanges();
    expect(component.guideMessage()).toContain('3');

    fixture.componentRef.setInput('promptMessage', 'Buscá un cliente.');
    fixture.detectChanges();
    expect(component.guideMessage()).toBe('Buscá un cliente.');
  });
});
