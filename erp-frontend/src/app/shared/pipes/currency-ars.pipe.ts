import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un monto en ARS (es-AR): `$ 1.234,56`.
 * Acepta string (Decimal serializado) o number. Valores no numéricos → '—'.
 */
@Pipe({ name: 'currencyArs', standalone: true })
export class CurrencyArsPipe implements PipeTransform {
  private static readonly formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) {
      return '—';
    }
    return CurrencyArsPipe.formatter.format(num);
  }
}
