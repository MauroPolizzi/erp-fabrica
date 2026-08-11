# Plan de implementación — Reportería y gráficos de Dashboard

> Documento de planificación basado en **auditoría del código real** de `erp-backend` y `erp-frontend`.
> Fecha: 2026-08-11. Estado base: MVP estable (commit `1779b52 fix 10 dashboard real KPIs`).
> **No contiene código implementado.** Es la especificación previa a la ejecución.

---

## 1. Estado actual

### 1.1 Hallazgos que definen todo el plan

Cinco hechos verificados en el código cambian radicalmente el costo de ambas features:

| # | Hallazgo | Consecuencia |
|---|---|---|
| **H1** | `exceljs@4.4.0` y `pdfkit@0.15.1` (+ `@types/pdfkit`) **ya están instalados** en `erp-backend/package.json:32,37` y **no se usan en ningún archivo**. | Reportería en backend: **0 dependencias nuevas**, para PDF o para Excel. |
| **H2** | `file-saver@2.0.5` (+ `@types/file-saver`) **ya está instalado** en `erp-frontend/package.json:24` y **no se usa**. | Descarga en frontend: **0 dependencias nuevas**. |
| **H3** | El módulo `reports` **ya existe como stub montado y autenticado**: `reports.routes.ts` aplica `authenticate` y `app.ts:55` lo monta en `/api/reports`. | No hay que crear ni cablear el módulo: solo agregarle `controller` + `service` + `dto`. |
| **H4** | Los permisos `reports.read/create/update/delete` **ya están sembrados** (`prisma/seed.ts:16` incluye `reports` en `MODULES`) y el rol **Finanzas ya tiene `reports.read`** (`seed.ts:61`). Administración usa `admin.*`. | **0 cambios de seed, 0 migraciones** para habilitar RBAC de reportes. |
| **H5** | El módulo `dashboard` (controller/service/routes) **ya existe** y es, de hecho, la capa de métricas: `dashboard.service.ts` hace agregaciones con `prisma.aggregate`/`groupBy` + `dayjs`. Está montado en `/api/dashboard` con **solo `authenticate`** (decisión deliberada documentada en `dashboard.routes.ts:5-6`: es la home de todos los roles). | El gráfico **no necesita un módulo nuevo**: es un endpoint más en `dashboard`. |

**Conclusión:** el proyecto ya tiene ~70% de la infraestructura de ambas features. El trabajo real es escribir la lógica, no montar arquitectura.

### 1.2 Backend — patrones reutilizables

| Pieza | Ubicación | Uso en este plan |
|---|---|---|
| Convención de módulo vertical | `controller → service → routes → dto` | Se replica tal cual en `reports` |
| Sobre de respuesta | `shared/utils/response.ts` → `ok(data, meta?)` | El endpoint de serie lo usa; el de Excel **no** (devuelve binario) |
| Errores | `AppError` + `errorHandler` (`shared/middlewares/error-handler.ts:8`) mapea Zod/AppError/Prisma | Reutilizado; requiere 1 hardening (§2.7 R3) |
| Validación | `validate(schema, source)` (`shared/middlewares/validate.ts:7`) — **ya soporta `'query'` pero nunca se usó con ese source** | Primer uso real: filtros de reporte y de serie |
| Paginación | `getPagination` / `buildMeta` | **No aplica**: un reporte no se pagina, y una serie tampoco |
| RBAC | `requirePermission('modulo.accion')` en las rutas | `requirePermission('reports.read')` |
| Auditoría | `writeAuditLog(...)` desde services | Opcional (§7); no en v1 |
| Agregación con Prisma + dayjs | `dashboard.service.ts:16-42` | Molde exacto del endpoint de serie |
| Transacciones y `decimal.js` | `sales.service.ts:71` | Solo lectura acá; se conserva el criterio de `Decimal → string` en el DTO |

**Deuda menor detectada, relevante para este plan:** la función `parseDate(value, edge)` está **duplicada literalmente** en `sales.controller.ts:16` y `audit.controller.ts:13`. Ambas features necesitan lo mismo por tercera vez → se justifica extraerla a `shared/utils/date.ts` (que ya existe y ya exporta `dayjs`).

### 1.3 Frontend — patrones reutilizables

| Pieza | Ubicación | Uso en este plan |
|---|---|---|
| `ApiService` | `core/services/api.service.ts:27-63` — desempaqueta `{ data }`, omite params vacíos | Se **extiende** con un método `getBlob` (no existe capacidad de descarga) |
| `errorInterceptor` | `core/interceptors/error.interceptor.ts:16` — toast con `err.error?.error` | **Requiere ajuste**: con `responseType:'blob'` el body de error es un `Blob` (§2.7 R1) |
| `jwtInterceptor` | Adjunta token y refresca en 401 | Funciona igual para descargas, sin cambios |
| Barra de filtros | `sale-list.component.html:8-53` (estado + desde + hasta + limpiar) | **Se copia el markup** para el filtro del reporte y del gráfico |
| `page-header`, `loading-spinner`, `data-table` | `shared/components/` | Reutilizados |
| Pipes | `currency-ars`, `date-format` | Reutilizados en la pantalla de reporte |
| Sidebar con RBAC | `sidebar.component.ts:43` filtra por `auth.hasPermission(...)` | Un ítem nuevo: `Reportes` con `permission: 'reports.read'` |
| Rutas lazy + `permissionGuard` | `app.routes.ts` + `features/*/[feature].routes.ts` | Molde exacto de la feature `reports` |
| Tokens de diseño | `styles.css` (`--color-primary-600`, `--color-text-muted`, …) | El gráfico **lee estas variables**, no hardcodea colores |
| Estado | Signals (`signal`/`computed`) + `OnPush` | Idéntico |

**Faltante crítico frontend:** `chart.js` **no está instalado**. `primeng/chart` sí está presente en `node_modules` y hace `import Chart from 'chart.js/auto'` internamente → **`chart.js` es la única dependencia nueva de todo el plan.**

### 1.4 Datos disponibles (sin tocar el schema)

El reporte y el gráfico solicitados se construyen **enteramente** con lo que ya existe:

```
Sale        → customerId, createdById, status, paymentMethod, subtotal, tax, total, soldAt
SaleDetail  → saleId, finishedProductId, quantity, unitPrice, lineTotal
Customer    → name, taxId
FinishedProduct → sku, name, unit
User        → fullName  (vendedor, vía Sale.createdBy)
```

**0 modificaciones de entidades. 0 migraciones.**

Semántica ya establecida por el código y que se debe respetar: **solo cuentan las ventas `CONFIRMED`** (`dashboard.service.ts:20,25` y `sales.service.ts:144`); las anuladas revierten stock y caja pero permanecen en la tabla.

---

## 2. Análisis de Reportería

### 2.1 Recomendación de formato: **Excel (ExcelJS)**

| Criterio | Excel / ExcelJS | PDF / PDFKit |
|---|---|---|
| Dependencias | Ya instalada (H1) | Ya instalada (H1) |
| Código para el 1er reporte | Bajo: `worksheet.columns = [...]` + `addRows(...)` | **Alto**: PDFKit no tiene tablas. Hay que dibujar celdas por coordenadas, calcular anchos, truncar texto y **paginar a mano** (~150-250 líneas de helper antes de ver la primera fila) |
| Costo del reporte 2 y 3 | Muy bajo: nueva definición de columnas | Bajo **solo después** de haber construido el motor de tablas |
| Valor para el usuario | Alto: filtra, ordena, pivotea, suma y se lo manda al contador | Medio: es una foto, no se puede reanalizar |
| Mantenibilidad | Alta: el layout lo resuelve Excel | Media: el layout es código propio y frágil |
| Streaming | `workbook.xlsx.write(res)` | `doc.pipe(res)` |
| Formato de datos | Números reales, moneda y fechas nativas de Excel | Todo es texto renderizado |

**Recomendación: Excel para el primer reporte.** Es un reporte **analítico** (N filas, agregable, comparable), y ese es exactamente el terreno donde Excel gana por goleada en costo y valor.

**Dónde va PDF (más adelante, no ahora):** PDFKit es la herramienta correcta para **documentos**, no para reportes tabulares — el comprobante de una venta (remito/factura, una sola venta, layout fijo, membrete). Ese caso llega naturalmente con el módulo `invoicing` y reutilizará el mismo esqueleto de `reports` cambiando solo el *renderer*. La arquitectura de §2.3 deja ese hueco abierto sin pagarlo hoy.

### 2.2 Primer reporte recomendado: **Ventas por período**

Se confirma la propuesta del pedido. Justificación:

- Es el **único dominio con datos reales y volumen** en el sistema (ventas + líneas + caja funcionan de punta a punta).
- Cubre exactamente lo pedido: período, cliente, cantidad de ventas, materiales, cantidades y total vendido.
- No requiere ningún módulo en estado stub (`raw-materials`, `production`, `suppliers`, `invoicing` siguen sin implementar).
- Es el reporte que un dueño de fábrica efectivamente pide todos los meses.

**Grano: una fila por línea de venta** (`SaleDetail`). Es el grano más fino disponible; cualquier agregación (por cliente, por material, por mes) la hace el usuario con una tabla dinámica, sin pedirnos un reporte nuevo. Esto es deliberado: **maximiza el valor del primer reporte y reduce la presión por reportes 2 y 3**.

**Columnas propuestas**

| Columna | Origen | Formato Excel |
|---|---|---|
| Fecha | `sale.soldAt` | fecha `dd/mm/yyyy hh:mm` |
| Venta | `sale.id` (8 primeros caracteres) | texto |
| Cliente | `customer.name` | texto |
| CUIT/Doc | `customer.taxId` | texto |
| SKU | `finishedProduct.sku` | texto |
| Material | `finishedProduct.name` | texto |
| Cantidad | `detail.quantity` | número (3 decimales) |
| Unidad | `finishedProduct.unit` | texto |
| Precio unitario | `detail.unitPrice` | moneda ARS |
| Total línea | `detail.lineTotal` | moneda ARS |
| Medio de pago | `sale.paymentMethod` → etiqueta en español | texto |
| Vendedor | `sale.createdBy.fullName` | texto |

**Bloque de encabezado** (filas 1-4, antes de la tabla): título, rango aplicado, cliente filtrado (o "Todos"), leyenda *"Incluye únicamente ventas confirmadas"* y fecha de generación.

**Bloque de totales** (al pie): **Cantidad de ventas** = `sales.length` (ventas distintas, **no** cantidad de filas) · **Total vendido** = suma de `sale.total` de las ventas distintas · **Unidades vendidas** = suma de `quantity`.

> ⚠️ **Trampa de corrección a respetar desde el día 1:** "Total vendido" **no** debe calcularse sumando `lineTotal`. Hoy coincide porque `tax` está fijo en `'0'` (`sales.service.ts:147`), pero cuando se implemente IVA (Fase 1 del `ROADMAP_POST_MVP`) el reporte quedaría silenciosamente mal. Sumar siempre `sale.total` sobre ventas distintas.

### 2.3 Arquitectura propuesta (backend)

Separación mínima en 4 responsabilidades, ni una más:

```
src/modules/reports/
├── reports.routes.ts        # (ya existe, stub) → se le agrega la ruta
├── reports.controller.ts    # NUEVO  — HTTP: headers, streaming, nombre de archivo
├── reports.service.ts       # NUEVO  — resuelve la definición por clave y orquesta
├── reports.dto.ts           # NUEVO  — Zod de filtros (validate(schema, 'query'))
├── report-types.ts          # NUEVO  — el contrato (≈20 líneas)
├── excel-writer.ts          # NUEVO  — definición + filas → workbook → stream
└── definitions/
    └── sales-by-period.ts   # NUEVO  — EL reporte 1 (query + columnas + totales)
```

**El contrato** (`report-types.ts`) — es todo lo que hace falta para que el reporte 2 sea barato:

```ts
type ColumnFormat = 'text' | 'number' | 'quantity' | 'currency' | 'date';

interface ReportColumn { header: string; key: string; width?: number; format?: ColumnFormat; }

interface ReportDefinition<F, R extends Record<string, unknown>> {
  key: string;                                  // 'sales-by-period' → segmento de URL
  title: string;                                // encabezado de la hoja y nombre del archivo
  filtersSchema: ZodTypeAny;                    // valida el query string
  columns: ReportColumn[];
  fetch(filters: F): Promise<R[]>;              // ÚNICO punto que toca Prisma
  header?(filters: F): string[];                // líneas del bloque superior
  totals?(rows: R[], filters: F): Array<[string, string | number]>;
}
```

**Registro** (en `reports.service.ts`): `const REPORTS = { 'sales-by-period': salesByPeriodReport }`. Agregar el reporte 2 = **un archivo nuevo + una línea en este objeto.** Nada más.

**Qué NO se construye** (deliberado): no hay motor de reportes genérico, ni DSL de consultas, ni builder de filtros dinámicos, ni catálogo persistido en BD, ni sistema de plantillas. `fetch` es una función que escribe una query de Prisma a mano — que es exactamente lo que el resto del repo hace.

**Endpoint**

```
GET /api/reports/:key/excel?from=YYYY-MM-DD&to=YYYY-MM-DD&customerId=<uuid>
     → 200 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     → Content-Disposition: attachment; filename="ventas-por-periodo_2026-08-01_2026-08-11.xlsx"
```

Ruta única con lookup en el registro: el reporte 2 **no toca `reports.routes.ts`**. Permiso estático `requirePermission('reports.read')` en la ruta, igual que todo el repo (si algún reporte futuro necesita un permiso distinto, ahí se agrega `permission` a la definición — no antes).

**Orden de operaciones en el controller (crítico):**

1. Zod valida el query (via `validate(schema, 'query')`).
2. Resolver la definición → si la clave no existe, `AppError.notFound`.
3. `fetch(filters)` → **si falla, el `errorHandler` responde JSON normalmente porque todavía no se escribió nada.**
4. Guardar de volumen: si `rows.length > MAX_REPORT_ROWS` (20.000) → `AppError.unprocessable('El reporte supera N filas. Achicá el rango.')`. ExcelJS arma el workbook **en memoria**; sin este guard un rango de 5 años tumba el proceso.
5. Recién ahora: `res.setHeader(...)` × 2.
6. `excel-writer` construye y hace `workbook.xlsx.write(res)` → `res.end()`.

### 2.4 Componentes frontend

```
src/app/features/reports/
├── reports.routes.ts                        # NUEVO — lazy + permissionGuard('reports.read')
├── report.service.ts                        # NUEVO — descarga + nombre de archivo
└── sales-report/
    ├── sales-report.component.ts            # NUEVO
    └── sales-report.component.html          # NUEVO
```

Más 3 tocados: `app.routes.ts` (ruta `reports`), `sidebar.component.ts` (ítem `Reportes`, `pi pi-file-excel`, `permission: 'reports.read'`), `api.service.ts` (método `getBlob`).

**`ApiService.getBlob(path, params)`** — devuelve `Observable<HttpResponse<Blob>>` usando `{ responseType: 'blob', observe: 'response' }`. Se observa la respuesta completa para leer el nombre real desde `Content-Disposition` (con fallback a un nombre construido en el cliente si el header no llega — p. ej. detrás de un proxy que no expone `Content-Disposition` vía CORS).

**Pantalla `/reports`** — una sola pantalla, con la barra de filtros copiada de `sale-list.component.html:8-53`:

- Card "Ventas por período": desde / hasta (inputs `type="date"`, idénticos a los de ventas) + cliente (`p-dropdown` opcional, "Todos los clientes" por defecto) + botón **Descargar Excel**.
- **Defaults**: `from` = primer día del mes actual, `to` = hoy. La pantalla es útil sin tocar nada.
- **Validación cliente**: `from <= to`, ambos obligatorios → botón deshabilitado con mensaje inline (no toast).
- **Loading**: signal `generating` → `[loading]="generating()"` en el `p-button`. El botón es la única superficie que cambia; no se bloquea la pantalla.
- **Éxito**: `saveAs(blob, filename)` de `file-saver` + `notify.success('Reporte generado.')`.
- **Error**: lo cubre el `errorInterceptor` una vez ajustado (§2.7 R1); el componente solo apaga `generating`.
- **Empty state**: si el reporte no tiene filas, el backend igual devuelve el Excel con encabezado y totales en cero **y** el frontend avisa por header opcional `X-Report-Rows: 0` → `notify.info('No hay ventas en el período seleccionado.')`. *(Alternativa aceptable y más simple: devolver 422 y dejar que el interceptor muestre el mensaje. Recomendado: el header, porque un Excel vacío es una respuesta legítima y evita que el usuario dude si falló.)*

### 2.5 Dependencias

**Ninguna.** `exceljs` (backend) y `file-saver` (frontend) ya están instalados y hoy no se usan.

### 2.6 Comparación de alternativas — ubicación de la funcionalidad

| Opción | Pro | Contra | Veredicto |
|---|---|---|---|
| **A. Pantalla `/reports` dedicada** | Es donde aterrizan los reportes 2 y 3 sin rediseñar nada; usa el permiso correcto (`reports.read`); el ítem de sidebar aparece solo para quien corresponde | Una pantalla nueva (~120 líneas) | ✅ **Recomendada** |
| B. Botón "Exportar" en `sale-list` | Costo casi cero, reusa los filtros existentes | Acopla el reporte al listado; usa `commercial.read` (Finanzas no lo tiene); el reporte 2 (compras, stock) no tiene dónde ir | Como **agregado opcional posterior**, apuntando a la misma URL |

### 2.7 Riesgos

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| **R1** | **Errores en descargas binarias se muestran ilegibles.** `error.interceptor.ts:16` lee `err.error?.error`; con `responseType:'blob'` el body de error es un `Blob` → el toast muestra `[object Blob]` o el mensaje genérico de Angular. | Alto (UX) — un 403/422 se ve como error desconocido | En el interceptor: si `err.error instanceof Blob`, leer `.text()`, parsear el JSON y emitir el toast con el mensaje real. ~8 líneas, **una sola vez**, y queda resuelto para toda descarga futura. |
| **R2** | **Rango amplio → memoria.** ExcelJS arma el workbook completo en RAM. | Alto (disponibilidad) | Guard `MAX_REPORT_ROWS = 20.000` → 422 con mensaje accionable (§2.3 paso 4). |
| **R3** | **Error después de `setHeader`.** `errorHandler` (`error-handler.ts:8`) no chequea `res.headersSent`; si el stream falla a mitad, intentaría escribir JSON sobre una respuesta ya comprometida. | Medio | (a) Orden estricto de §2.3 — el 99% de los errores ocurre antes de escribir; (b) agregar `if (res.headersSent) return _next(err)` al inicio del `errorHandler` (3 líneas, directamente motivadas por esta feature). |
| **R4** | **`compression` sobre el binario.** `app.ts:33` comprime todo; los `.xlsx` ya son ZIP → gasto de CPU sin beneficio. | Bajo | Aceptable en v1 (5 usuarios). Si molesta: `res.setHeader('Content-Encoding','identity')` o filtro en `compression`. |
| **R5** | **Total vendido mal calculado al llegar el IVA.** | Alto (corrección) | Documentado en §2.2: sumar `sale.total` de ventas distintas, nunca `lineTotal`. Cubrir con test. |
| **R6** | **Zona horaria en los bordes del rango.** `sold_at` es `TIMESTAMP(3)` sin zona (migración `20260605155905_init`), Prisma escribe UTC. | Medio | Usar exactamente el mismo criterio que ya usa el sistema: `dayjs(x).startOf('day')` / `.endOf('day')` en hora del servidor (idéntico a `sales.controller.ts:16`). El helper compartido garantiza que los tres consumidores no diverjan. |

---

## 3. Análisis de Dashboard

### 3.1 Primer gráfico recomendado: **Ventas por día (últimos 30 días)**

Se confirma la propuesta del pedido, con una precisión: **por día, en un rango configurable, con `groupBy` día/semana/mes desde el endpoint**.

Justificación frente a las alternativas:

| Candidato | Datos disponibles | Valor | Veredicto |
|---|---|---|---|
| **Ventas por período** | ✅ Total (`Sale.soldAt` + `total`) | **Alto** — es la única **serie temporal** real del sistema: la venta es el único evento transaccional de alta frecuencia | ✅ **Recomendado** |
| Top materiales vendidos | ✅ (`SaleDetail` groupBy) | Medio — es un ranking, no una tendencia; y el dashboard **ya tiene** un ranking (top clientes) | Candidato natural a gráfico 2 |
| Stock por material | ✅ | Bajo — el dashboard **ya muestra** "stock más bajo" como lista; un gráfico no agrega información | No |
| Producción / compras | 🔴 Módulos en stub | — | Imposible hoy |

Razón decisiva: los KPIs actuales (`dashboard.component.html:7-26`) son **fotos puntuales** (mes, hoy, activos). Ninguno responde *"¿cómo venimos?"*. Una serie temporal es la información que hoy **falta**, no una repetición con otro envase.

**Bonus de arquitectura:** el gráfico comparte con el reporte el mismo concepto de rango (`from`/`to` sobre `soldAt`, solo `CONFIRMED`) → el helper `parseDateRange` construido para el reporte se reutiliza tal cual.

### 3.2 Datos necesarios y endpoint

```
GET /api/dashboard/sales-series?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month

200 {
  "data": {
    "groupBy": "day",
    "from": "2026-07-13",
    "to": "2026-08-11",
    "points": [
      { "label": "2026-07-13", "total": "0.00",      "count": 0 },
      { "label": "2026-07-14", "total": "184500.00", "count": 3 }
    ]
  }
}
```

- Envuelto en `ok(...)` como todo el resto de la API.
- `total` como **string** (criterio de `Decimal` ya establecido en `dashboard.service.ts:52` y consumido así por el frontend en `dashboard.service.ts:6-8`).
- **Los buckets vacíos se rellenan con `0`.** Sin esto el gráfico miente: días sin ventas desaparecerían y la línea se vería continua.
- Permiso: **solo `authenticate`**, coherente con la decisión ya tomada y documentada en `dashboard.routes.ts:5-6` (la home debe funcionar para los 5 roles).
- Guard de rango: máx. 366 puntos (día), 120 (semana), 60 (mes) → `AppError.unprocessable`.

### 3.3 Arquitectura propuesta

**Backend — se extiende `dashboard`, no se crea un módulo nuevo.**

| Archivo | Cambio |
|---|---|
| `dashboard.dto.ts` | **NUEVO** — `salesSeriesSchema` (Zod): `from`/`to` opcionales, `groupBy` enum con default `'day'` |
| `dashboard.service.ts` | **+1 método** `getSalesSeries(filters)` |
| `dashboard.controller.ts` | **+1 handler** `getSalesSeries` |
| `dashboard.routes.ts` | **+1 ruta** con `validate(salesSeriesSchema, 'query')` |

**Agregación: en JS con dayjs, no con `date_trunc` en SQL.** Decisión con fundamento concreto:

- `sold_at` es `TIMESTAMP(3)` **sin zona** y Prisma persiste UTC. Un `date_trunc('day', sold_at)` agruparía por **día UTC**, mandando toda venta argentina posterior a las 21:00 al día siguiente. El error sería silencioso y sistemático.
- `dayjs().startOf('day')` en el servidor es **exactamente el criterio que ya usa** el KPI "Ventas de hoy" (`dashboard.service.ts:13-14`). Usar otro produciría dos números incoherentes en la misma pantalla.
- Volumen: unas pocas miles de ventas al año. `findMany({ select: { soldAt, total } })` sobre un rango acotado es trivial.
- **Extensibilidad:** si algún día el volumen lo exige, se reemplaza el interior del método por `$queryRaw` con `AT TIME ZONE 'America/Argentina/Buenos_Aires'` **sin tocar el DTO ni el frontend**.

**Frontend — dos piezas reutilizables + una específica:**

```
src/app/shared/components/chart-card/
├── chart-card.component.ts       # NUEVO — card + título + slot de acciones + loading + empty
└── chart-card.component.html     # NUEVO
src/app/shared/utils/chart-theme.ts   # NUEVO — opciones base y paleta leídas de las CSS vars
src/app/features/dashboard/sales-chart/
├── sales-chart.component.ts      # NUEVO — selector de período + fetch + mapeo a chart.js
└── sales-chart.component.html    # NUEVO
```

- **`chart-card`** (~35 líneas): resuelve el chrome `bg-surface-0 rounded-md shadow-card p-5` que hoy está **repetido 6 veces** en `dashboard.component.html`, más `loading` (reusa `app-loading-spinner`) y `empty`. Todo gráfico futuro entra acá y sale con el mismo aspecto y los mismos estados. **Justificado, no especulativo.**
- **`chart-theme.ts`** (~40 líneas): una función `baseChartOptions()` que lee `getComputedStyle(document.documentElement)` para tomar `--color-primary-600`, `--color-surface-200`, `--color-text-muted`, y define grilla, leyenda, tooltip con formato ARS y ticks del eje Y en pesos. **Ningún componente de gráfico hardcodea un color.** El gráfico 2 llama a la misma función.
- **`sales-chart`**: dueño del selector de período, del fetch y del mapeo `points[] → { labels, datasets }`. Es la única parte que se reescribe por gráfico.
- **`dashboard.component.html`**: se le agrega el `<app-sales-chart />` entre los KPIs y las dos listas. Nada más cambia.

**Tipo de gráfico: barras.** Ventas diarias son eventos discretos y frecuentemente cero; una línea entre dos ceros sugiere continuidad que no existe. `type="bar"` con `borderRadius` leve. Cuando se agrupe por mes, barras siguen siendo correctas.

**Selector de período:** `p-selectButton` o `p-dropdown` con 3 presets — *Últimos 30 días (día)* · *Últimas 12 semanas (semana)* · *Últimos 12 meses (mes)*. Presets, **no** un date-range libre: cubren el 95% del uso, evitan estados inválidos y el rango libre ya está disponible en el reporte Excel.

### 3.4 Dependencias

**Una sola en todo el plan: `chart.js@^4`** (frontend). Verificado: `primeng/chart` está instalado y hace `import Chart from 'chart.js/auto'`; sin `chart.js` el componente falla en runtime.

| Alternativa | Veredicto |
|---|---|
| **`chart.js` + `p-chart` de PrimeNG** | ✅ **Recomendada.** 1 dep, 0 código de renderizado, consistente con la UI PrimeNG, cae en el chunk lazy del dashboard |
| SVG a mano | 0 deps, ~80 líneas para barras… y otras tantas para ejes, tooltips y responsive; el gráfico 2 (torta/línea) exige escribir todo de nuevo | ❌ Ahorro falso |
| ngx-charts / ApexCharts | Más pesadas, fuera del patrón PrimeNG del repo | ❌ |

> Actualizar `CONTEXT.md` §2 agregando `chart.js` a la tabla de stack del frontend.

### 3.5 Riesgos

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| **R7** | **Buckets vacíos omitidos** → gráfico engañoso | Alto (corrección) | Rellenar el rango completo en el service (§3.2); cubrir con test |
| **R8** | **Desfase de zona horaria** con `date_trunc` | Alto (corrección) | Bucketing en JS con dayjs (§3.3) |
| **R9** | **Peso del bundle**: `chart.js/auto` registra todos los controladores (~200 KB min / ~70 KB gz) | Bajo | Aceptable: el dashboard es una ruta lazy (`app.routes.ts:21-24`), así que el peso queda en su chunk. Si molestara, `p-chart` acepta registro manual de controladores |
| **R10** | **Colores fuera del sistema de diseño** | Bajo (visual) | `chart-theme.ts` como única fuente de color (§3.3) |
| **R11** | **Redimensionado dentro del layout**: chart.js necesita un contenedor con altura definida | Bajo | Alto fijo (`h-72`) en `chart-card` + `maintainAspectRatio: false` |

---

## 4. Comparación de alternativas — decisiones importantes

| Decisión | Alternativas | Elección | Fundamento en una línea |
|---|---|---|---|
| Formato del reporte | PDF / **Excel** | **Excel** | Datos tabulares analíticos; PDFKit exigiría escribir un motor de tablas antes de la primera fila |
| Grano del reporte | Resumen por cliente / **línea de venta** | **Línea de venta** | El grano fino permite que el usuario agregue como quiera y reduce la demanda de reportes nuevos |
| Ruta del reporte | Una ruta por reporte / **ruta con `:key`** | **`:key` + registro** | El reporte 2 no toca routes ni controller |
| Generación | **Síncrona** / cola BullMQ | **Síncrona** | Las colas se eliminaron a propósito (`ROADMAP_POST_MVP` R5/`CONTEXT` §13). Un rango mensual son cientos de filas: <1 s. Reintroducir Redis por esto es sobreingeniería |
| Ubicación FE del reporte | Botón en `sale-list` / **pantalla `/reports`** | **Pantalla `/reports`** | Es el domicilio de los reportes 2 y 3; usa el permiso correcto |
| Módulo del gráfico | Módulo `metrics` nuevo / **extender `dashboard`** | **Extender `dashboard`** | `dashboard.service.ts` ya *es* la capa de métricas |
| Agregación | SQL `date_trunc` / **JS + dayjs** | **JS + dayjs** | `sold_at` es UTC sin zona: `date_trunc` desplazaría los días; dayjs mantiene coherencia con el KPI existente |
| Librería de gráficos | SVG propio / ngx-charts / **chart.js + p-chart** | **chart.js + p-chart** | 1 dependencia, 0 código de render, consistente con PrimeNG |
| Período del gráfico | Rango libre / **presets** | **Presets** | Menos estados inválidos; el rango libre ya vive en el reporte |
| Qué se implementa primero | Gráfico / **Reporte** | **Reporte** | Mayor valor para el usuario y concentra el riesgo técnico nuevo (streaming binario) al principio |

---

## 5. Roadmap

**Orden global:** F1 → F2 → F3 → F4 → F5 → F6 → F7.
F1-F3 (reportería) y F4-F6 (gráfico) son **independientes entre sí**: si se quisiera, el bloque del gráfico puede adelantarse sin bloqueos. La única pieza compartida es `parseDateRange` (F1), trivial de duplicar si se invierte el orden.

---

### F1 — Base de reportería + primer reporte (backend)

**Objetivo:** que `GET /api/reports/sales-by-period/excel?from&to` devuelva un `.xlsx` correcto y descargable.

**Tareas / Backend**
1. `shared/utils/date.ts`: agregar `parseDateRange(query, { defaultDays })` → `{ from, to }` con `startOf/endOf('day')`. *(Extraído de la lógica ya duplicada en `sales.controller.ts:16` y `audit.controller.ts:13`; **migrar esos dos controllers es opcional y queda fuera de alcance**.)*
2. `modules/reports/report-types.ts`: `ReportColumn`, `ColumnFormat`, `ReportDefinition` (§2.3).
3. `modules/reports/excel-writer.ts`: `writeReportToStream(res, def, rows, filters)` — encabezado, cabecera de tabla con estilo, filas con formato por `ColumnFormat`, bloque de totales, anchos de columna, `freeze` de la fila de encabezado, `workbook.xlsx.write(res)`.
4. `modules/reports/definitions/sales-by-period.ts`: `filtersSchema` (`from`, `to`, `customerId?`), `columns` (§2.2), `fetch` = un `prisma.saleDetail.findMany` con `include: { sale: { include: { customer, createdBy } }, finishedProduct }`, `where: { sale: { status: 'CONFIRMED', soldAt: { gte, lte }, customerId? } }`, `orderBy: { sale: { soldAt: 'asc' } }`; `header` y `totals`.
5. `modules/reports/reports.service.ts`: registro `REPORTS`, `getDefinition(key)` (404 si no existe), guard `MAX_REPORT_ROWS`.
6. `modules/reports/reports.controller.ts`: orden estricto de §2.3, `Content-Type` + `Content-Disposition` + `X-Report-Rows`, nombre de archivo con slug + rango.
7. `modules/reports/reports.routes.ts`: `GET /:key/excel` con `requirePermission('reports.read')`.
8. `error-handler.ts`: guard `res.headersSent` (§2.7 R3).

**Frontend:** ninguno.
**Dependencias:** ninguna (H1, H3, H4).

**Criterios de aceptación**
- Un usuario con `reports.read` (o `admin.*`) recibe un `.xlsx` que abre sin advertencias en Excel/LibreOffice.
- Sin ese permiso → **403 JSON**, no un archivo corrupto.
- Solo aparecen ventas `CONFIRMED`; una venta anulada dentro del rango **no** figura.
- "Cantidad de ventas" cuenta ventas distintas y "Total vendido" suma `sale.total` (no `lineTotal`).
- Rango sin ventas → archivo válido con totales en cero y `X-Report-Rows: 0`.
- Clave inexistente → 404 JSON. Fechas inválidas → 400 JSON de Zod.
- Rango que excede `MAX_REPORT_ROWS` → 422 JSON con mensaje accionable.

**Complejidad: Media**

---

### F2 — Descarga del reporte (frontend)

**Objetivo:** que un usuario elija período y cliente, presione un botón y obtenga el archivo.

**Tareas / Frontend**
1. `core/services/api.service.ts`: `getBlob(path, params): Observable<HttpResponse<Blob>>`.
2. `core/interceptors/error.interceptor.ts`: manejo de `err.error instanceof Blob` (§2.7 R1).
3. `features/reports/report.service.ts`: `downloadSalesByPeriod(filters)` — llama `getBlob`, extrae el filename de `Content-Disposition` (con fallback), `saveAs(...)`, devuelve el conteo de `X-Report-Rows`.
4. `features/reports/sales-report/*`: componente + template (filtros, validación `from<=to`, botón con `[loading]`, mensajes inline).
5. `features/reports/reports.routes.ts` + entrada en `app.routes.ts`.
6. `layout/sidebar/sidebar.component.ts`: ítem `Reportes` (`pi pi-file-excel`, `permission: 'reports.read'`).

**Backend:** ninguno.
**Dependencias:** F1. **Deps nuevas:** ninguna (H2).

**Criterios de aceptación**
- El archivo se descarga con nombre legible (`ventas-por-periodo_2026-08-01_2026-08-11.xlsx`).
- El botón muestra spinner durante la generación y se rehabilita al terminar, también si falla.
- Un 403/422 muestra el **mensaje real del backend** en el toast (no `[object Blob]`).
- Sin `reports.read` el ítem del sidebar no aparece y la ruta redirige por `permissionGuard`.
- Defaults (mes actual) funcionan sin tocar los filtros.
- Un 401 durante la descarga refresca el token y reintenta (comportamiento existente del `jwtInterceptor`).

**Complejidad: Media**

---

### F3 — Validación de reportería

**Objetivo:** blindar las reglas de negocio del reporte antes de sumar el gráfico.

**Tareas**
- Test de integración (patrón `tests/sales-flow.test.ts`): crear cliente + producto + 2 ventas, anular una, pedir el reporte → assert de `200`, `Content-Type`, `X-Report-Rows` y que la anulada no cuenta.
- Test de permisos: usuario sin `reports.read` → 403.
- Test de la trampa del total: assert de que "Total vendido" = suma de `sale.total` (blinda el futuro IVA).
- Prueba manual del `.xlsx` en Excel y LibreOffice (formato de moneda, fechas, anchos).
- Actualizar `CONTEXT.md` (§6: `reports` pasa de planificado a implementado, formato Excel).

**Dependencias:** F1, F2. **Complejidad: Baja**

---

### F4 — Endpoint de serie de ventas (backend)

**Objetivo:** exponer la serie temporal agregada que consumirá el gráfico.

**Tareas / Backend**
1. `dashboard.dto.ts` (NUEVO): `salesSeriesSchema` con `from?`, `to?`, `groupBy` (`day|week|month`, default `day`).
2. `dashboard.service.ts`: `getSalesSeries()` — `findMany` acotado, bucketing con `dayjs().startOf(groupBy)`, **relleno de buckets vacíos**, guard de cantidad de puntos, `Decimal → string`.
3. `dashboard.controller.ts` + `dashboard.routes.ts`: handler y ruta con `validate(salesSeriesSchema, 'query')`, solo `authenticate`.

**Frontend:** ninguno. **Dependencias:** ninguna (idealmente F1 para reusar `parseDateRange`).

**Criterios de aceptación**
- Un día sin ventas aparece como punto con `total: "0.00"`, `count: 0`.
- Solo suma ventas `CONFIRMED`.
- El total de "hoy" en la serie **coincide exactamente** con el KPI "Ventas de hoy" del summary (misma convención horaria).
- `groupBy` inválido → 400 de Zod. Rango excesivo → 422.
- Accesible para los 5 roles (sin permiso específico).

**Complejidad: Baja**

---

### F5 — Base visual de gráficos (frontend)

**Objetivo:** dejar instalada la infraestructura mínima para que **cualquier** gráfico futuro sea solo "datos + tipo".

**Tareas / Frontend**
1. Agregar `chart.js@^4` a `erp-frontend/package.json`; `pnpm install` desde la raíz.
2. `shared/components/chart-card/*`: inputs `title`, `loading`, `empty`, `emptyMessage`; slot para acciones (el selector de período) y slot de contenido.
3. `shared/utils/chart-theme.ts`: `baseChartOptions()` + `seriesColors()` leyendo las CSS vars de `styles.css`; tooltip y ticks con formato ARS.
4. Actualizar `CONTEXT.md` §2 con `chart.js`.

**Backend:** ninguno. **Dependencias:** ninguna. **Complejidad: Baja**

*(F5 y F6 pueden entregarse como un solo PR; se separan para que la base quede revisable por sí misma.)*

---

### F6 — Gráfico "Ventas por período" en el Dashboard

**Objetivo:** el dashboard muestra la tendencia real de ventas.

**Tareas / Frontend**
1. `features/dashboard/dashboard.service.ts`: interfaces `SalesSeriesPoint` / `SalesSeries` + método `getSalesSeries(params)`.
2. `features/dashboard/sales-chart/*`: `p-chart type="bar"` dentro de `app-chart-card`, selector de 3 presets, signals `series`/`loading`, mapeo `points → { labels, datasets }`, `computed` para el dataset.
3. `dashboard.component.html`: insertar `<app-sales-chart />` entre los KPIs y las dos listas.

**Backend:** ninguno. **Dependencias:** F4, F5.

**Criterios de aceptación**
- El gráfico carga por defecto los últimos 30 días por día.
- Cambiar el preset recarga sin recargar el resto del dashboard (los KPIs no parpadean).
- Estados: spinner mientras carga; mensaje "Sin ventas en el período" si todos los puntos son cero; el error muestra toast y deja la card vacía, **sin romper la pantalla**.
- Los colores provienen de las CSS vars; el tooltip muestra ARS formateado.
- Responsive: no desborda en `sm` con el sidebar colapsado.
- La suma de las barras del mes en curso **coincide** con el KPI "Ventas del mes".

**Complejidad: Media**

---

### F7 — Validación del gráfico y cierre

**Objetivo:** cerrar consistencia y documentación.

**Tareas**
- Test del service: relleno de buckets, exclusión de `CANCELLED`, coherencia con `getSummary`.
- Prueba manual: rango sin datos, un solo día con datos, rango largo (12 meses).
- Verificación de coherencia cruzada: KPI mes = suma de barras del mes; total del reporte del mes = KPI mes.
- Actualizar `CONTEXT.md` (§6) y agregar una nota de estado en `ROADMAP_POST_MVP.md` §6 Fase 5 (parcialmente cubierta).

**Dependencias:** F4, F5, F6. **Complejidad: Baja**

---

### Resumen de fases

| Fase | Bloque | Backend | Frontend | Deps nuevas | Complejidad |
|---|---|---|---|---|---|
| F1 | Reportería | ✅ | — | 0 | Media |
| F2 | Reportería | — | ✅ | 0 | Media |
| F3 | Reportería | validación | validación | 0 | Baja |
| F4 | Gráficos | ✅ | — | 0 | Baja |
| F5 | Gráficos | — | ✅ | **chart.js** | Baja |
| F6 | Gráficos | — | ✅ | 0 | Media |
| F7 | Gráficos | validación | validación | 0 | Baja |

**Archivos nuevos totales:** 13 backend + 9 frontend. **Archivos tocados:** 4 backend + 5 frontend.
**Migraciones: 0. Cambios de schema: 0. Cambios de seed: 0.**

---

## 6. Arquitectura de evolución

### 6.1 Reportería

| Necesidad futura | Qué hay que hacer | Costo |
|---|---|---|
| **Reporte 2** (p. ej. *Movimientos de stock por material*) | 1 archivo en `definitions/` + 1 línea en el registro `REPORTS` + 1 card en la pantalla `/reports` | ~1 h |
| **Reporte 3** (p. ej. *Caja de ventas por período*) | Ídem | ~1 h |
| **Formato PDF** | Nuevo `pdf-writer.ts` que consuma **la misma** `ReportDefinition` + ruta `GET /:key/pdf`. Las definiciones existentes **no se tocan**: `fetch` y `columns` son agnósticos del formato. PDFKit ya está instalado | ~1 día (incluye el helper de tablas, que se paga una sola vez) |
| **Nuevos filtros** (medio de pago, vendedor, categoría) | Ampliar el `filtersSchema` de esa definición + su `where` + un control en la pantalla | ~15 min por filtro |
| **Catálogo dinámico** (que `/reports` se dibuje sola) | Agregar `GET /api/reports` que devuelva `{ key, title, filters }` del registro y hacer la pantalla data-driven | ~2 h — **hacerlo recién con el reporte 3**, no antes |
| **Reportes pesados / asíncronos** | Ahí sí reintroducir BullMQ + Redis (`ROADMAP_POST_MVP` R5): el endpoint pasa a encolar y devolver un id; `fetch` y el writer se reutilizan intactos | Solo si el volumen lo exige |
| **Programación / envío por mail** | Un job que invoca el mismo `ReportDefinition` y adjunta el buffer | Sin rediseño |

**La clave:** `fetch` (datos) · `columns`/`totals` (definición) · `excel-writer` (archivo) · `controller` (transporte) están separados, así que cada eje evoluciona sin tocar los otros.

### 6.2 Dashboard

| Necesidad futura | Qué hay que hacer | Costo |
|---|---|---|
| **Gráfico 2** (p. ej. *Top materiales vendidos*, torta/barras horizontales) | `+1 método` en `dashboard.service` · `+1 ruta` · `+1 componente` que reusa `chart-card` + `baseChartOptions()` | ~2 h |
| **Gráfico 3** | Ídem | ~2 h |
| **Nuevas métricas** (margen, ticket promedio, ventas por vendedor) | Un método más en `dashboard.service`; el patrón de agregación ya está establecido | ~1 h |
| **Nuevos períodos / filtros** (por cliente, por categoría) | Ampliar `salesSeriesSchema` + el `where`; el componente agrega un control en el slot de acciones de `chart-card` | ~30 min |
| **Cambio de fuente de datos** (SQL agregado por performance) | Reescribir el interior de `getSalesSeries` con `$queryRaw` + `AT TIME ZONE`. **El DTO y el frontend no se enteran** | ~2 h, solo si hace falta |
| **Dashboards por rol** | Los componentes de gráfico ya son independientes: se componen distinto según `auth.hasPermission(...)` | Sin rediseño |
| **Cambio de tema/paleta** | Editar `styles.css`; todos los gráficos siguen | 0 |

**La clave:** `service` (datos+agregación) · `dto` (contrato) · `chart-theme` (apariencia) · `chart-card` (estados y chrome) · componente (mapeo específico). Un gráfico nuevo solo escribe la última capa.

---

## 7. Recomendación final

### Qué implementar primero
**Reportería (F1 → F2 → F3).** Razones, en orden:
1. **Valor:** un Excel de ventas exportable es lo primero que pide un dueño de fábrica; un gráfico es lectura, un archivo es una herramienta de trabajo.
2. **Riesgo:** concentra lo técnicamente nuevo (streaming binario, `Content-Disposition`, errores sobre blobs). Conviene resolverlo temprano, no al final.
3. **Dependencias:** 0 dependencias nuevas — la fase 1 no toca `package.json`.
4. **Reutilización:** deja `parseDateRange` y el manejo de descargas listos para lo que venga.

### Qué implementar después
**Gráfico del dashboard (F4 → F5 → F6 → F7).** Backend casi trivial; el esfuerzo está en la base visual, que es una inversión que se amortiza en el gráfico 2.

### Qué NO implementar todavía

| No hacer | Por qué |
|---|---|
| ❌ Segundo reporte / segundo gráfico | El pedido es explícito: uno de cada uno. La arquitectura ya deja el costo del segundo en ~1-2 h |
| ❌ Salida PDF | Excel cubre el caso analítico. PDF llega con el **comprobante de venta**, junto con `invoicing` |
| ❌ BullMQ / Redis / generación asíncrona | Se quitaron a propósito (`CONTEXT` §13). Un reporte mensual tarda <1 s |
| ❌ Endpoint catálogo `GET /api/reports` | Con un solo reporte no aporta nada. Recién con el reporte 3 |
| ❌ Motor genérico de reportes, DSL de filtros, plantillas en BD | Sobreingeniería explícita. `fetch` es una query de Prisma escrita a mano, como el resto del repo |
| ❌ Reportes programados / envío por email | Fuera de alcance |
| ❌ Exportación genérica desde `data-table` | Suena barato y es una trampa: obliga a resolver formato/permisos/paginación en un componente compartido |
| ❌ Refactorizar `sales.controller` y `audit.controller` para usar el helper nuevo | Es un refactor sin relación directa con estas features. El helper nace usado solo por el código nuevo |
| ❌ Cambios de schema, migraciones o seed | No hacen falta (H4 + §1.4) |
| ❌ IVA, descuentos, `minStock`, filtros guardados | Otras fases del `ROADMAP_POST_MVP` |
| ❌ Dark mode / temas de gráfico | `chart-theme.ts` deja la puerta abierta; no se paga hoy |

### Decisiones técnicas que deben quedar simples en esta primera versión

1. **Un solo endpoint de reporte y un solo registro en memoria.** Nada de catálogo persistido ni descubrimiento automático.
2. **Generación 100% síncrona** con un guard duro de filas. Sin colas, sin jobs, sin polling.
3. **Un único permiso, `reports.read`, estático en la ruta.** Sin permisos por reporte hasta que un reporte lo pida.
4. **`fetch` es una query de Prisma escrita a mano.** Sin query builder ni abstracción de repositorio.
5. **Agregación en JavaScript con dayjs.** Sin SQL crudo, sin vistas materializadas, sin tabla de métricas.
6. **Presets de período en el gráfico**, no date-range libre.
7. **`Decimal` viaja como `string`** en todos los DTOs nuevos, igual que en `dashboard.service.ts:52`.
8. **Los estados (loading/error/empty) se resuelven con lo que ya existe**: signals + `loading-spinner` + `errorInterceptor`. Ningún manejo de errores nuevo salvo el caso Blob.
9. **Cero cambios de datos**: ninguna de las dos features escribe en la BD. Ambas son estrictamente de lectura, lo que las hace de bajo riesgo y fáciles de revertir.
