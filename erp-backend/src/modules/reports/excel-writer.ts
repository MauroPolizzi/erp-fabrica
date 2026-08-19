import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Writable } from 'node:stream';
import { Workbook, type Worksheet } from 'exceljs';
import { logger } from '../../shared/utils/logger';
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

/**
 * Logo del encabezado (`erp-backend/assets/logo.png`).
 *
 * La ruta sube tres niveles desde este archivo porque `src/modules/reports` y
 * `dist/modules/reports` están a la misma profundidad: resuelve igual con tsx en
 * desarrollo y con `node dist/server.js` en producción, sin depender del directorio
 * de trabajo.
 *
 * OJO AL DESPLEGAR: `assets/` queda FUERA de `dist/`, así que hay que copiarla junto
 * al build o los reportes salen sin logo (ver README).
 */
const LOGO_PATH = join(__dirname, '../../../assets/logo.png');
const LOGO_WIDTH = 78;
const LOGO_HEIGHT = 72;
/** Excel mide el alto de fila en puntos y las imágenes en píxeles: 1px = 0.75pt. */
const PX_TO_PT = 0.75;
/** Aire entre el logo y el título, para que no queden pegados. */
const LOGO_ROW_PADDING_PT = 4;
/** Unidad de posicionamiento de OOXML. Es la misma que ExcelJS usa para `ext`. */
const EMU_PER_PX = 9525;
/** Margen mínimo con el borde de la celda, si la columna es más angosta que el logo. */
const LOGO_MIN_MARGIN_PX = 6;

/**
 * Se lee una sola vez al cargar el módulo: `writeReportWorkbook` corre por request.
 * Si falta o no se puede leer, los reportes se generan sin logo — es decoración y no
 * debe tumbar una descarga.
 */
const logoBuffer = readLogo();

function readLogo(): Buffer | undefined {
  try {
    return readFileSync(LOGO_PATH);
  } catch (err) {
    logger.warn('No se pudo leer el logo: los reportes se generarán sin él', {
      err,
      path: LOGO_PATH,
    });
    return undefined;
  }
}

export async function writeReportWorkbook(stream: Writable, payload: ReportPayload): Promise<void> {
  const workbook = new Workbook();
  workbook.creator = 'PerliNor ERP';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName(payload.title));

  writeLogo(sheet, workbook, payload);
  writeTitleBlock(sheet, payload);
  writeTable(sheet, payload);
  writeTotals(sheet, payload);

  await workbook.xlsx.write(stream);
}

/**
 * Banda con el logo, arriba del título, centrado en la celda A1.
 *
 * En Excel las imágenes flotan sobre la grilla en vez de ocupar celdas, así que hay que
 * reservarles una fila con altura suficiente o taparían el título. Se dimensiona por
 * píxeles (`ext`) y no por rango de celdas porque los anchos de columna se fijan después,
 * en `writeTable`: una imagen anclada a celdas se estiraría con ellos.
 *
 * El centrado se hace con offsets nativos en EMU. La alternativa —anclar con un `col`
 * fraccionario— NO sirve: ExcelJS convierte esa fracción con una escala interna
 * (`width * 10000`) que no equivale al ancho real de la columna, así que un 0.5 desplaza
 * unos pocos píxeles en lugar de centrar.
 */
function writeLogo(sheet: Worksheet, workbook: Workbook, payload: ReportPayload): void {
  if (!logoBuffer) return;

  const row = sheet.addRow([]);
  const rowHeightPt = LOGO_HEIGHT * PX_TO_PT + LOGO_ROW_PADDING_PT;
  row.height = rowHeightPt;

  const firstColumn = payload.columns[0];
  const columnPx = columnWidthToPx(firstColumn?.width ?? defaultWidth(firstColumn?.format));
  const offsetX = Math.max(LOGO_MIN_MARGIN_PX, Math.round((columnPx - LOGO_WIDTH) / 2));
  const offsetY = Math.max(0, Math.round((rowHeightPt / PX_TO_PT - LOGO_HEIGHT) / 2));

  const imageId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });
  sheet.addImage(imageId, {
    // Las anclas de ExcelJS son base 0; `row.number` es base 1. Los typings solo declaran
    // `{col, row}`, pero el constructor de Anchor acepta los offsets nativos y son la
    // única forma de fijar un margen exacto.
    tl: {
      nativeCol: 0,
      nativeColOff: offsetX * EMU_PER_PX,
      nativeRow: row.number - 1,
      nativeRowOff: offsetY * EMU_PER_PX,
    } as unknown as { col: number; row: number },
    ext: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
  });
}

/**
 * Ancho de columna de Excel → píxeles. La unidad es "caracteres del tipo por defecto",
 * que con Calibri 11 a 96 dpi da 7px por unidad más 5px de relleno de celda.
 */
function columnWidthToPx(width: number): number {
  return Math.round(width * 7) + 5;
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
