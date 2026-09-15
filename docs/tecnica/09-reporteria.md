# Reportería

Este capítulo describe la capa de generación de reportes. El sistema entrega un único reporte, pero
la capa se diseñó de modo que la incorporación de otros no requiera modificar ni el transporte ni el
formato de salida.

## El problema de diseño

Un reporte combina cuatro responsabilidades que tienden a mezclarse: obtener los datos, decidir cómo
se presentan las columnas, producir el archivo y entregarlo por la red.

Resolverlas juntas conduce a un resultado predecible: el segundo reporte duplica la mecánica del
primero, el tercero duplica la del segundo, y la lógica de formato queda dispersa en tantos lugares
como reportes existan.

La capa separa esas responsabilidades en tres piezas con límites definidos:

| Pieza | Responsabilidad | Conoce |
|---|---|---|
| **Definición** | Qué datos trae y cómo se presentan sus columnas | El dominio |
| **Generador de planilla** | Cómo se vuelca un reporte resuelto a un archivo | El formato de salida |
| **Controlador** | Cómo se entrega el archivo por la red | El protocolo HTTP |

Una definición ignora que la salida es una planilla de cálculo. El generador ignora qué representan
los datos. El controlador ignora ambas cosas.

## El contrato

Una definición de reporte declara qué necesita el sistema para resolverlo:

```ts
export interface ReportDefinition<F, R extends ReportRow> {
  key: string;                         // segmento de URL
  title: string;                       // título de la hoja y base del nombre de archivo
  filtersSchema: ZodTypeAny;           // valida y normaliza los filtros
  columns: ReportColumn[];             // encabezado, clave de origen, ancho y formato
  fetch(filters: F, options: { limit: number }): Promise<R[]>;
  header?(filters: F): string[] | Promise<string[]>;   // líneas de contexto
  totals?(rows: R[], filters: F): ReportTotal[];       // bloque de totales
  filename?(filters: F): string;
}
```

Las tres últimas propiedades son opcionales, de modo que un reporte elemental se define declarando
su clave, su título, el esquema de filtros, las columnas y la consulta.

Cada columna declara su formato de presentación, tomado de un conjunto acotado: texto, número,
cantidad, importe o fecha. La definición **no conoce el código de formato concreto**: expresa una
intención que el generador traduce al formato del archivo.

### Registro de reportes

Las definiciones se registran en un catálogo indexado por clave:

```ts
const REPORTS: RegisteredReport[] = [salesByPeriodReport];
const REPORT_BY_KEY = new Map(REPORTS.map((report) => [report.key, report]));
```

La ruta recibe la clave como parámetro y la resuelve contra el catálogo, de modo que **agregar un
reporte no modifica el archivo de rutas**:

```ts
reportsRoutes.get('/:key/excel', requirePermission('reports.read'), reportsController.excel);
```

## El reporte de ventas por período

Es el único reporte del sistema. Produce **una fila por línea de venta**, con doce columnas.

| Columna | Formato | Origen |
|---|---|---|
| Fecha | Fecha y hora | Momento de la venta |
| Venta | Texto | Identificador abreviado |
| Cliente | Texto | Razón social |
| CUIT/Doc | Texto | Identificación tributaria |
| SKU | Texto | Código del material |
| Material | Texto | Denominación |
| Cantidad | Cantidad | Unidades de la línea |
| Unidad | Texto | Unidad de medida |
| Precio unitario | Importe | Precio congelado |
| Total línea | Importe | Importe de la línea |
| Medio de pago | Texto | Traducido al español |
| Vendedor | Texto | Usuario que registró la venta |

### Por qué el grano es la línea y no la venta

Un reporte agregado por venta, por cliente o por mes responde una pregunta concreta y obliga a crear
un reporte nuevo ante cada pregunta distinta.

El grano de línea es el más fino disponible, y desde él el usuario obtiene cualquier agregación con
una tabla dinámica de su planilla de cálculo: por cliente, por material, por mes o por vendedor. Un
reporte cubre así lo que de otro modo requeriría varios.

Para que esa agregación resulte posible, el generador escribe los valores numéricos **como números y
no como texto**, y deja la tabla con filtro automático y encabezado fijo.

### Filtros

```ts
const filtersSchema = z.object({
    from: z.string().regex(DATE_PATTERN, 'Formato de fecha esperado: YYYY-MM-DD').optional(),
    to:   z.string().regex(DATE_PATTERN, 'Formato de fecha esperado: YYYY-MM-DD').optional(),
    customerId: z.string().uuid('Cliente inválido').optional(),
  })
  .refine((f) => !f.from || !f.to || f.from <= f.to, {
    message: 'La fecha "desde" no puede ser posterior a "hasta"', path: ['from'],
  })
  .transform((f) => ({ ...parseDateRange(f.from, f.to, { defaultCount: 30 }), customerId: f.customerId }));
```

El esquema realiza tres tareas: **valida** el formato, **verifica** la coherencia del rango y
**transforma** los filtros en el rango normalizado que la consulta utilizará. Sin rango explícito
reporta los últimos treinta días, de modo que la pantalla resulte útil sin configuración previa.

### Alcance de los datos

La consulta incluye **exclusivamente ventas confirmadas**. Las anuladas revirtieron existencias y
caja, y computarlas contradiría al resto del sistema. Es el mismo criterio de los indicadores y de la
caja (requerimiento RF-27), y el encabezado del archivo lo declara de forma explícita para que el
lector de la planilla no deba suponerlo.

### Cálculo de totales

El bloque de totales presenta tres valores, y uno de ellos merece atención:

```ts
// "Total vendido" se suma sobre VENTAS distintas usando sale.total, nunca sumando
// lineTotal: hoy coinciden porque tax = 0, pero al incorporar IVA/descuentos la suma
// de líneas dejaría de ser el total de la venta y el reporte quedaría mal en silencio.
const totalBySale = new Map<string, string>();
for (const row of rows) totalBySale.set(row.saleId, row.saleTotal);

let sold = new Decimal(0);
for (const total of totalBySale.values()) sold = sold.plus(total);
```

El total vendido se obtiene sumando los importes de **ventas distintas**, no los importes de las
líneas. Con el alcance actual ambos coinciden, porque el impuesto es cero. En cuanto se incorpore el
tratamiento impositivo o cualquier descuento por venta, dejarán de coincidir, y una suma de líneas
produciría un total incorrecto **sin manifestar error alguno**.

Para hacerlo posible, la consulta arrastra dos campos auxiliares —el identificador y el total de la
venta— que no poseen columna en la planilla. El generador escribe únicamente las claves declaradas en
las columnas, de modo que los auxiliares no aparecen en la salida.

## Control del volumen

El generador construye el archivo **completo en memoria** antes de transmitirlo. Un rango de fechas
desmedido podría comprometer la memoria del servidor.

La capa aplica un tope de veinte mil filas, verificado con un mecanismo que evita cargar el resultado
completo para comprobarlo: la definición solicita **una fila más que el tope**.

```ts
take: options.limit + 1,
```

```ts
if (rows.length > MAX_REPORT_ROWS) {
  throw AppError.unprocessable(
    `El reporte supera las ${MAX_REPORT_ROWS.toLocaleString('es-AR')} filas. Achicá el rango de fechas.`,
  );
}
```

Si la consulta devuelve la fila adicional, el rango excede el tope y se rechaza con una indicación
concreta. La consulta nunca trae más de veinte mil una filas, con independencia del volumen
existente.

## Orden de ejecución

El controlador respeta un orden que constituye el aporte técnico principal de esta capa:

```ts
async excel(req, res, next) {
  try {
    const payload = await reportsService.build(String(req.params.key), req.query);

    res.setHeader('Content-Type', XLSX_MIME);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename(payload.filename)}"`);
    res.setHeader('X-Report-Rows', String(payload.rows.length));

    await writeReportWorkbook(res, payload);
    if (!res.writableEnded) res.end();
  } catch (err) {
    next(err);
  }
}
```

**Todo lo que puede fallar ocurre antes de escribir el primer byte.** La validación de filtros, la
consulta y la verificación del tope se resuelven primero; sólo entonces se establecen las cabeceras y
se transmite el archivo.

El orden inverso —establecer cabeceras y luego consultar— tendría una consecuencia concreta: ante un
fallo posterior, las cabeceras ya enviadas impedirían responder con un mensaje de error, y el usuario
recibiría un archivo corrupto en lugar de una explicación. Es la situación que el manejador
centralizado de errores detecta y que se describe en el Capítulo VII.

### Metadatos por cabecera

Dos datos viajan fuera del cuerpo, porque el cuerpo es el archivo:

| Cabecera | Contenido | Uso en el cliente |
|---|---|---|
| `Content-Disposition` | Nombre del archivo | Guardarlo con el nombre que el servidor definió |
| `X-Report-Rows` | Cantidad de filas | Informar «no hay datos en el período» sin abrir el archivo |

Ambas requieren declaración explícita en la configuración de origen cruzado: sin ella, el navegador
las oculta al cliente por encontrarse en un origen distinto (Capítulo VI).

El nombre del archivo se depura antes de incorporarlo a la cabecera, eliminando todo carácter ajeno
al conjunto seguro.

## Generación de la planilla

El generador es el único componente que conoce la biblioteca de planillas de cálculo. Produce cuatro
bloques:

1. **Banda con el logotipo**, sobre el título.
2. **Título y líneas de contexto** —período, filtros aplicados, aclaración de alcance, momento de
   generación—, fusionadas a lo ancho de la tabla.
3. **Tabla**, con encabezado destacado, fijo y con filtro automático.
4. **Bloque de totales**, al pie.

Tres detalles de implementación merecen mención.

### Coherencia visual con la aplicación

El generador reutiliza los colores del sistema de diseño de la interfaz —el azul primario del
encabezado y el gris del texto secundario—, declarados como constantes con referencia a su origen. La
planilla no desentona con la aplicación que la produjo.

### Corrección de la zona horaria

Las planillas de cálculo almacenan fechas sin zona horaria, y la biblioteca las serializa desde el
tiempo universal. Una venta registrada a las veinte horas se abriría mostrando las veintitrés.

```ts
function toExcelWallClock(date: Date): Date | null {
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
}
```

Se compensa el desplazamiento local para que el archivo muestre la misma hora que la aplicación.

### Tolerancia ante la ausencia del logotipo

El logotipo se lee una única vez, al cargar el módulo. Si el archivo no se encuentra disponible, el
generador registra una advertencia y produce la planilla sin él.

La decisión responde a un criterio: el logotipo es ornamental y su ausencia no debe impedir una
descarga. La situación es además previsible, porque la compilación del servidor emite únicamente
código y no copia los recursos, de modo que un despliegue que omitiera copiarlos produciría reportes
sin logotipo pero funcionales. El Capítulo XIII lo advierte.

## Descarga en el cliente

El cliente extiende su capa de acceso a datos con un método de descarga binaria que, a diferencia del
resto, **no desenvuelve la estructura de respuesta** y observa la respuesta completa para leer sus
cabeceras.

```ts
private downloadExcel(key: string, params: Record<string, string>): Observable<ReportDownload> {
  return this.api.getBlob(`${this.base}/${key}/excel`, params).pipe(
    map((res) => {
      const filename = filenameFrom(res, key);
      saveAs(res.body ?? new Blob(), filename);
      return { rows: Number(res.headers.get('X-Report-Rows') ?? 0), filename };
    }),
  );
}
```

Si la cabecera del nombre no llegara —por ejemplo, tras un intermediario que no la exponga—, el
cliente construye un nombre con la fecha del día en lugar de fallar.

El manejo de errores requirió una adaptación específica. En una descarga, el cuerpo del error también
llega en formato binario, de modo que el interceptor debe leerlo como texto antes de presentarlo; sin
ese tratamiento, el usuario recibiría una notificación ininteligible en lugar del mensaje del
servidor (Capítulo X).

## Incorporación de un reporte nuevo

La separación de responsabilidades produce un resultado concreto: **agregar un reporte consiste en
escribir una definición y sumarla al catálogo**.

```ts
export const nuevoReporte = defineReport({
  key: 'clave-en-la-url',
  title: 'Título del reporte',
  filtersSchema,
  columns: [ /* … */ ],
  fetch: obtenerFilas,
  header: construirEncabezado,   // opcional
  totals: construirTotales,      // opcional
});
```

No se modifica el archivo de rutas, ni el controlador, ni el generador de planillas. Es la
implementación del requerimiento RNF-18.

La separación habilita además una extensión distinta: **un formato de salida nuevo** requiere
únicamente un generador que consuma la misma estructura resuelta. Las definiciones existentes no se
modifican. Ésta fue la razón de separar el generador del controlador, y no la de disponer de varios
reportes.
