import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

/**
 * Formatea fechas con Day.js. Por defecto `DD/MM/YYYY`; pasar 'datetime' para
 * `DD/MM/YYYY HH:mm` o un patrón Day.js explícito. Valores inválidos → '—'.
 */
@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined, format: 'date' | 'datetime' | string = 'date'): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    const d = dayjs(value);
    if (!d.isValid()) {
      return '—';
    }
    const pattern =
      format === 'date' ? 'DD/MM/YYYY' : format === 'datetime' ? 'DD/MM/YYYY HH:mm' : format;
    return d.format(pattern);
  }
}
