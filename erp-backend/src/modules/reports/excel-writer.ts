import type { Writable } from 'node:stream';
import { Workbook, type Worksheet } from 'exceljs';
import type { ColumnFormat, ReportPayload } from './report-types';

/**
 * Vuelca un reporte ya resuelto a una planilla y la streamea.
 *
 * Es el único archivo que sabe de ExcelJS: las definiciones de reporte solo declaran
 * columnas y formatos. Para agregar salida PDF más adelante alcanza con otro writer
 * que consuma el mismo `ReportPayload`.
 */

/** Formatos numéricos de Excel por tipo de columna. */
const NUMBER_FORMATS: Record<ColumnFormat, string | undefined> = {
  text: undefined,
  number: '#,##0',
  quantity: '#,##0.000',
  currency: '"$"#,##0.00',
  date: 'dd/mm/yyyy hh:mm',
};

// Colores del sistema de diseño (styles.css del frontend) para que la planilla
// no desentone con la aplicación.
const HEADER_FILL = 'FF2563EB'; // --color-primary-600
const HEADER_TEXT = 'FFFFFFFF';
const MUTED_TEXT = 'FF64748B'; // --color-text-muted

export async function writeReportWorkbook(stream: Writable, payload: ReportPayload): Promise<void> {
  const workbook = new Workbook();
  workbook.creator = 'PerliNor ERP';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName(payload.title));

  writeTitleBlock(sheet, payload);
  writeTable(sheet, payload);
  writeTotals(sheet, payload);

  await workbook.xlsx.write(stream);
}

/** Título + líneas de contexto (período, filtros aplicados), fusionadas a lo ancho. */
function writeTitleBlock(sheet: Worksheet, payload: ReportPayload): void {
  const lastColumn = payload.columns.length;

  const title = sheet.addRow([payload.title]);
  title.font = { bold: true, size: 14 };
  title.height = 22;
  if (lastColumn > 1) sheet.mergeCells(title.number, 1, title.number, lastColumn);

  for (const line of payload.header) {
    const row = sheet.addRow([line]);
    row.font = { size: 10, color: { argb: MUTED_TEXT } };
    if (lastColumn > 1) sheet.mergeCells(row.number, 1, row.number, lastColumn);
  }

  sheet.addRow([]);
}

/** Encabezado de tabla (fijo y con autofiltro) + filas de datos. */
function writeTable(sheet: Worksheet, payload: ReportPayload): void {
  const lastColumn = payload.columns.length;

  const header = sheet.addRow(payload.columns.map((column) => column.header));
  header.height = 18;
  header.font = { bold: true, color: { argb: HEADER_TEXT } };
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  for (const row of payload.rows) {
    const added = sheet.addRow(payload.columns.map((column) => cellValue(row[column.key], column.format)));
    added.eachCell((cell, columnNumber) => {
      const numberFormat = NUMBER_FORMATS[payload.columns[columnNumber - 1]?.format ?? 'text'];
      if (numberFormat) cell.numFmt = numberFormat;
    });
  }

  payload.columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width ?? defaultWidth(column.format);
  });

  // Encabezado fijo + autofiltro: el usuario ordena y filtra sin preparar nada.
  sheet.views = [{ state: 'frozen', ySplit: header.number }];
  if (payload.rows.length > 0) {
    sheet.autoFilter = {
      from: { row: header.number, column: 1 },
      to: { row: header.number + payload.rows.length, column: lastColumn },
    };
  }
}

function writeTotals(sheet: Worksheet, payload: ReportPayload): void {
  if (payload.totals.length === 0) return;

  sheet.addRow([]);
  for (const total of payload.totals) {
    const row = sheet.addRow([total.label, cellValue(total.value, total.format)]);
    row.getCell(1).font = { bold: true };

    const valueCell = row.getCell(2);
    valueCell.font = { bold: true };
    const numberFormat = NUMBER_FORMATS[total.format ?? 'text'];
    if (numberFormat) valueCell.numFmt = numberFormat;
  }
}

/** Convierte el valor de la fila al tipo que Excel debe guardar (número, fecha o texto). */
function cellValue(value: unknown, format?: ColumnFormat): string | number | Date | null {
  if (value === null || value === undefined || value === '') return null;

  if (format === 'date') {
    return value instanceof Date ? toExcelWallClock(value) : String(value);
  }

  if (format === 'currency' || format === 'quantity' || format === 'number') {
    const parsed = Number(value);
    // Se guarda como número (no como texto) para que el usuario pueda sumar y pivotear.
    return Number.isFinite(parsed) ? parsed : null;
  }

  return String(value);
}

/**
 * Excel guarda fechas sin zona horaria y ExcelJS las serializa desde el epoch UTC, así
 * que una venta de las 20:00 (ART) se abriría como 23:00. Compensamos el offset local
 * para que la planilla muestre la misma hora que la aplicación.
 */
function toExcelWallClock(date: Date): Date | null {
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
}

function defaultWidth(format?: ColumnFormat): number {
  if (format === 'date') return 18;
  if (format === 'currency' || format === 'quantity' || format === 'number') return 15;
  return 22;
}

/** Excel limita el nombre de hoja a 31 caracteres y prohíbe []:*?/\ */
function sheetName(title: string): string {
  const clean = title.replace(/[[\]:*?/\\]/g, ' ').trim();
  return clean.slice(0, 31) || 'Reporte';
}
