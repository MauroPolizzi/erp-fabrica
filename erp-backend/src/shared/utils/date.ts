import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.locale('es');

export { dayjs };

export function now(): Date {
  return dayjs().toDate();
}

export function formatDate(date: Date | string, pattern = 'DD/MM/YYYY'): string {
  return dayjs(date).format(pattern);
}

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Normaliza un rango `YYYY-MM-DD` a [inicio del día, fin del día] en hora del servidor.
 * Es el mismo criterio que ya usan los filtros de ventas/auditoría y el KPI
 * "Ventas de hoy": mantenerlo unificado evita que dos pantallas muestren totales
 * distintos para el mismo día. Los valores ausentes o inválidos caen al default
 * (últimos `defaultDays` días, incluyendo hoy).
 */
export function parseDateRange(
  from: unknown,
  to: unknown,
  options: { defaultDays?: number } = {},
): DateRange {
  const defaultDays = options.defaultDays ?? 30;
  const parsedTo = parseDay(to, 'end') ?? dayjs().endOf('day').toDate();
  const parsedFrom =
    parseDay(from, 'start') ??
    dayjs(parsedTo)
      .subtract(defaultDays - 1, 'day')
      .startOf('day')
      .toDate();

  return { from: parsedFrom, to: parsedTo };
}

/** Parsea una fecha al inicio/fin de su día; devuelve undefined si no es válida. */
function parseDay(value: unknown, edge: 'start' | 'end'): Date | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const parsed = dayjs(value);
  if (!parsed.isValid()) return undefined;
  return (edge === 'start' ? parsed.startOf('day') : parsed.endOf('day')).toDate();
}
