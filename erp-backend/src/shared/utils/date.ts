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
 * distintos para el mismo día.
 *
 * Si falta `from`, se retrocede `defaultCount` unidades desde `to` (por defecto,
 * los últimos 30 días). `defaultUnit` permite defaults por semana o mes.
 */
export function parseDateRange(
  from: unknown,
  to: unknown,
  options: { defaultCount?: number; defaultUnit?: 'day' | 'week' | 'month' } = {},
): DateRange {
  const count = options.defaultCount ?? 30;
  const unit = options.defaultUnit ?? 'day';
  const parsedTo = parseDay(to, 'end') ?? dayjs().endOf('day').toDate();
  const parsedFrom =
    parseDay(from, 'start') ??
    dayjs(parsedTo)
      .subtract(count - 1, unit)
      .startOf(unit)
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
