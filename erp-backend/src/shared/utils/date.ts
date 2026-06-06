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
