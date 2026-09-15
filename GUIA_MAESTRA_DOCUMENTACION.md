# Guía Maestra de Documentación — PerliNor ERP (`erp-fabrica`)

> **Etapa 1 — Análisis y diseño documental.**
> Este documento **no es** la documentación técnica ni el manual de usuario: es la guía
> fundacional a partir de la cual se construirán ambos.
> Todo lo afirmado aquí fue verificado contra el código del repositorio en la rama `dev`
> (commit `a180b36`, 38 commits, 220 archivos versionados).

## Convención de marcado usada en toda la guía

| Marca | Significado |
|---|---|
| **[HC]** | **Hecho comprobado** — observado directamente en el repositorio, con archivo citado. |
| **[INF]** | **Inferencia** — conclusión razonable derivada del análisis, no afirmada por el código. |
| **[PC]** | **Información pendiente de confirmar** — no determinable desde el repositorio. |

---

# §0. Decisiones cerradas y datos del trabajo

> **Actualizado el 13/09/2026** con las respuestas del autor a §14 y §16.
> Esta sección es la **fuente de verdad** de la guía: donde contradiga a una sección posterior,
> prevalece §0.

## 0.1 Identificación académica **[HC — aportado por el autor]**

| Dato | Valor |
|---|---|
| Autor | Mauro Esteban Polizzi |
| Institución | Universidad Tecnológica Nacional — Facultad Regional Tucumán |
| Carrera | Tecnicatura Universitaria en Programación |
| Asignatura | **Práctica Profesional Supervisada (PPS)** |
| Fecha de presentación | **26 de septiembre de 2026** |
| Norma de formato | **IEEE** |
| Modalidad de entrega | Documento técnico + manual de usuario, con **demostración en vivo** |
| Manual | Debe ser **autosuficiente** (no depender de la demostración) |
| Idioma | Español rioplatense (voseo), coherente con la interfaz |

> **[INF] Implicancia de que sea una PPS y no una tesis:** el informe de PPS pondera el
> **contexto profesional real**, el trabajo efectivamente realizado y los resultados entregados
> al cliente, por encima del aparato teórico. Esto refuerza las decisiones D1 (documentar solo lo
> implementado) y D4 (omitir despliegue): ambas alinean el documento con lo que la PPS evalúa.

## 0.2 Contexto de negocio **[HC — aportado por el autor]**

| Punto | Respuesta |
|---|---|
| Empresa | PerliNor — fábrica de materiales para la construcción, rubro industrial |
| Tamaño | **10 empleados**, distribuidos en los **5 rubros** que el sistema modela como roles |
| Problema | Sobrecarga de papeleo y su distribución, que genera desorden en la operación diaria y **dificulta la toma de decisiones** |
| Naturaleza | **Caso real** (cliente real, no caso de estudio) |
| Alcance a documentar | **El alcance entregado** |
| Justificación del alcance | **El cliente priorizó el módulo de ventas**; por eso se implementó ese corredor y no el ERP completo |
| Validación con usuarios | **No hubo** usuarios reales probando el sistema aún |
| URL de acceso | `localhost` (entorno local) |

> **[HC] Coherencia verificada:** 10 empleados y 5 usuarios del sistema (uno por rol) no se
> contradicen: [CONTEXT.md](CONTEXT.md) §1 declara «usuarios totales: 5» y el seed crea
> exactamente 5 usuarios, uno por rol. El manual debe distinguir **empleado** (persona de la
> empresa) de **usuario** (cuenta del sistema).

> **[INF] Aporte del dato A-05 al Cap. 1:** «el cliente priorizó ventas» convierte el alcance
> parcial de una limitación en una **decisión de proyecto trazable a un requerimiento del
> cliente**. Es la frase que sostiene todo el capítulo de alcance y debe aparecer textualmente.

## 0.3 Reglas de negocio confirmadas **[HC — confirmado por el autor]**

| # | Regla | Estado |
|---|---|---|
| B-01 | Los 5 roles del seed **son** los roles reales de la empresa | Confirmado |
| B-02 | **Toda venta genera ingreso de caja**, incluso con medio de pago `ACCOUNT` o `CHECK` | **Confirmado: lo especificó el cliente.** Debe documentarse como regla de negocio explícita, no como simplificación |
| B-03 | **Sin IVA** (`tax = 0`) | Confirmado: simplificación deliberada para validar el módulo de ventas sin complejidad adicional, **dejando el modelo preparado para incorporar IVA** (el campo `tax` ya existe en `Sale`) |
| B-04 | `SaleStatus.DRAFT` no se usa | Confirmado: se mantiene así |
| B-05 | Empleados sin interfaz | Confirmado: se mantiene así |
| B-08 | Zona horaria del servidor: **ART** | Confirmado |

> **[INF] B-02 y B-03 pasan de «riesgo» a «regla documentada».** Ambas dejan de ser
> observaciones pendientes y se convierten en decisiones funcionales con origen identificado.
> B-03 en particular gana valor si se documenta junto con la evidencia de extensibilidad: el
> campo `tax` existe en el modelo y `total = subtotal + tax` es la fórmula que el código ya
> respeta con `tax = 0`.

## 0.4 Decisiones estructurales aprobadas

| ID | Decisión | Opción | Consecuencia operativa |
|---|---|---|---|
| **D1** | Alcance a documentar | **A1** — solo lo implementado; el resto únicamente en «trabajo futuro» | Se elimina el capítulo «Diseño del sistema completo». Los 5 módulos stub y las 7 entidades sin código se mencionan **solo** en el Cap. 15 |
| **D2** | Modelo de datos | **B2** — DER completo con distinción visual + diccionario solo de las entidades implementadas | Ver nota de compatibilidad en §0.6 |
| **D3** | Documentación interna desactualizada | **C3, breve** | Ver conflicto P-01 en §0.6 |
| **D4** | Capítulo de despliegue | **E1 — omitir** | Se elimina el Cap. 14 y el diagrama D8. El Cap. 13 (instalación y ejecución local) **se mantiene**: es imprescindible con demo en localhost |
| **D5** | Módulo de empleados | **G3 — omitir de ambos documentos** | Se elimina F20 de la matriz, los 5 endpoints de empleados del Cap. 11 y la entidad `Employee` del diccionario. Ver reserva en §0.6 |
| **D6** | Formato | **H2** — Markdown versionado → PDF con estilo académico IEEE | Fuentes en `docs/`, salida PDF con portada, índice y numeración IEEE |
| **D7** | Correcciones de código previas | **I1 — no tocar nada** | R-17 (credenciales precargadas en el login) **sigue vigente**: se neutraliza en el protocolo de capturas, no en el código |

## 0.5 Cronograma de desarrollo **[HC — reconstruido del historial de Git]**

Respuesta a A-10. Fechas reales de los commits, resumidas en las dos etapas pedidas.

### Etapa A — MVP Demo de Venta (30/05/2026 – 26/06/2026, ~4 semanas)

| Fase | Período | Trabajo |
|---|---|---|
| A.1 Fundaciones | 30/05 – 06/06 | Monorepo pnpm, scaffold backend y frontend, configuración de base de datos, módulo de autenticación |
| A.2 ABM backend | 11/06 – 14/06 | Empleados, clientes, categorías, productos terminados con movimientos de stock, ventas transaccionales |
| A.3 Pruebas del flujo | 18/06 | `demo.http`, test E2E `sales-flow`, plan de MVP frontend |
| A.4 Frontend F0–F5 | 19/06 – 26/06 | Layout y shared, login, clientes, materiales, stock, ventas |

### Etapa B — Reportes y gráficos (11/08/2026 – 18/08/2026, ~1 semana)

| Fase | Período | Trabajo |
|---|---|---|
| B.0 Planificación | 11/08 | `PLAN_REPORTES_Y_GRAFICOS.md` sobre auditoría del código real |
| B.1 Implementación F1–F6 | 12/08 – 16/08 | Capa de reportería (contrato + writer Excel), reporte «Ventas por período», endpoint de serie temporal, gráfico del dashboard |
| B.2 Acabado | 18/08 | Logo institucional en la planilla generada |

### Etapas intermedias (contexto, no pedidas pero necesarias para la continuidad)

| Etapa | Período | Trabajo |
|---|---|---|
| Testing y flujo de trabajo | 30/06 – 23/07 | Suite de pruebas, workflows de Git y CI |
| Correcciones post-MVP | 27/07 – 11/08 | RBAC completo, trazabilidad del vendedor, retiro de Redis, anulación de venta con reversión de stock y caja, caja de ventas, filtros, endpoint de auditoría, KPIs reales |
| Recuperación de contraseña y búsqueda | 17/08 – 18/08 | Flujo completo de reset, búsqueda en grillas |
| Infraestructura de correo | 29/08 | SMTP local + Mailpit en Docker Compose |

> **[INF]** El cronograma real (30/05 – 29/08, ~13 semanas) es **coherente en magnitud** con las
> 16 semanas estimadas en [CONTEXT.md](CONTEXT.md) §12, pero con una distribución distinta: se
> concentró en el corredor de ventas en lugar de repartirse entre los 7 módulos planificados.
> Esa diferencia es exactamente lo que explica A-05 y conviene señalarla.

## 0.6 Puntos abiertos — ✅ **TODOS RESUELTOS (13/09/2026)**

| ID | Punto | Resolución |
|---|---|---|
| **P-01** | Conflicto D3 ↔ B-07 | ✅ **Aplicado.** Prevalece B-07: los seis documentos de planificación **no se entregan**. «C3 breve» se materializó agregando a cada uno una cabecera de 2 líneas dentro del repositorio que los marca como documentos históricos con su fecha. Ver §0.8 |
| **P-02** | Carpeta `Documentacion/` | ✅ **Uso selectivo aprobado**, según la recomendación de §0.7: las planillas actuales de PerliNor y las actas/estimación **entran**; los 20 diagramas de contextos y `modelo_er_gestion.sql` **quedan descartados** |
| **P-03** | Logo UTN | ✅ **Verificado:** `erp-backend/assets/logo-utn.png`, 447×447 px, 11 KB. Ver nota de uso en §0.9 |

## 0.7 Análisis de la carpeta `Documentacion/` — **decisión aplicada** **[HC]**

**Contenido verificado:**

| Grupo | Archivos | Valor documental |
|---|---|---|
| **Trabajo actual de PerliNor** | `PERLINOR 2026.xls`, `DATOS CLIENTES PERLINOR.xlsm`, `CLIENTES MULTIQUIM SRL.xlsm`, `CONTROL DE GRANOMETRIA 2025.xlsx` | **Muy alto.** Es la **evidencia material del problema A-02**: el papeleo y las planillas dispersas que el sistema viene a ordenar |
| Actas de relevamiento | `Reunion general.docx`, `Reunion 1/`, `Reunion 2/` | **Alto** para una PPS: documenta el relevamiento con el cliente |
| Gestión | `Estimación de Tiempos y Presupuesto.docx/.pdf`, `Resumen ejecutivo para la direccion.pdf`, `Portafolio de sistemas.pdf` | **Alto**: respalda A-10 y el contexto profesional |
| Diagramas de diseño | 20 PNG de contextos (Identity, Catalog, Parties, Inventory, Sales, Treasury, Audit, Purchasing, Production, Maintenance, Laboratory) + `modelo_er_gestion.sql` + 2 `.md` con Mermaid | **Bajo, y riesgoso** — ver advertencia |

> **[HC] Advertencia sobre los diagramas de diseño.** Describen un sistema **distinto** al
> implementado: usan un enfoque de *bounded contexts* con entidades (`parties`,
> `party_credit_accounts`, `warehouses`, `sales_orders`, `delivery_notes`) y contextos completos
> (Mantenimiento, Laboratorio, Compras) que **no existen ni en el schema de Prisma ni en el
> código**. Es una **tercera fuente de verdad** que diverge tanto del código como de
> `CONTEXT.md`.
>
> Con **D1 = A1**, estos diagramas **no pueden ilustrar** la documentación técnica: mostrarían
> una arquitectura que el sistema entregado no tiene. Incluirlos sería el error de exactitud más
> grave posible, porque un evaluador que compare el DER con el `schema.prisma` encontraría la
> discrepancia de inmediato.

### ✅ Uso aprobado (P-02)

| Usar | Dónde | Por qué |
|---|---|---|
| ✅ Las planillas actuales de PerliNor | **Cap. 1**, como **figura** del problema | Evidencia material irremplazable del problema A-02 |
| ✅ Actas de reunión y estimación de tiempos | **Cap. 1 y Cap. 2**, como **referencia citada** | Documenta el relevamiento y el contexto profesional de la PPS |
| ❌ Los 20 diagramas de contextos | **En ninguna parte** | Contradicen el sistema entregado |
| ❌ `modelo_er_gestion.sql` | **En ninguna parte** | Es un modelo alternativo que nunca se implementó |

**[INF] Cómo usar las planillas en el Cap. 1.** Una sola figura, con una captura parcial de
`PERLINOR 2026.xls` o `DATOS CLIENTES PERLINOR.xlsm`, acompañada de un epígrafe que enuncie el
problema: registro disperso en planillas, sin validación, sin control de acceso y sin trazabilidad.
Es la forma más económica de fundamentar A-02 y de justificar, por contraste, decisiones de diseño
que después aparecen en el documento técnico: validación en dos capas, RBAC, auditoría y
transacciones.
**Anonimizar** razones sociales y CUIT reales antes de capturar (§15.4, R-21).

## 0.8 Documentos de planificación — marcado aplicado (P-01) **[HC]**

Los seis documentos llevan desde el 13/09/2026 una cabecera de dos líneas tras su título, que los
identifica como históricos y remite a esta guía. **No se modificó ningún otro contenido.**

| Documento | Fecha asignada | Origen de la fecha |
|---|---|---|
| `PLAN_MVP_DEMO_VENTA_BACKEND.md` | 11/06/2026 | Declarada en el propio documento |
| `PLAN_MVP_DEMO_VENTA_FRONTEND.md` | 18/06/2026 | Primer commit |
| `PLAN_TESTING.md` | 26/06/2026 | Primer commit |
| `ROADMAP_POST_MVP.md` | 27/07/2026 | Declarada en el propio documento |
| `PLAN_REPORTES_Y_GRAFICOS.md` | 11/08/2026 | Declarada en el propio documento |
| `PLAN_LOGIN_Y_BUSQUEDA.md` | 14/08/2026 | Declarada en el propio documento |

> **[HC] `CONTEXT.md` quedó intacto.** Es un caso distinto: no es un documento de planificación
> con fecha, sino que se presenta como descripción del estado actual del proyecto, y contiene las
> inexactitudes R-08 y R-09 (PDFKit para reportes PDF, alcance funcional superior al implementado).
> Como tampoco se entrega, no afecta a la documentación final. **Si querés, le aplico el mismo
> tratamiento breve**: dos líneas aclarando que describe la arquitectura objetivo y que el alcance
> entregado es menor.

## 0.9 Logo institucional (P-03) **[HC]**

`erp-backend/assets/logo-utn.png` — 447 × 447 px, 11 KB, PNG cuadrado.

> **[INF] Nota de uso.** A 447 px de lado rinde bien hasta unos **3,8 cm** a 300 dpi o **7,5 cm**
> a 150 dpi: suficiente para el logo de portada en formato IEEE, pero **no** para ocupar media
> página. Si la portada lo necesita más grande, conviene conseguir un SVG o un PNG de mayor
> resolución.
>
> **No confundirlo con `logo.png`** (157 × 144 px), que es el de PerliNor y lo consume
> [excel-writer.ts](erp-backend/src/modules/reports/excel-writer.ts) para los reportes. Son dos
> archivos con destinos distintos: `logo-utn.png` es material de documentación y **no lo usa el
> código**.

---

# Parte I — Análisis del proyecto

## 1. Identificación del sistema

| Aspecto | Valor | Evidencia |
|---|---|---|
| Nombre del repositorio | `erp-fabrica` | [package.json](package.json) |
| Producto | ERP para PerliNor, fábrica de productos de construcción | [CONTEXT.md](CONTEXT.md) §1 |
| Tipo | Aplicación web (SPA + API REST) | [CONTEXT.md](CONTEXT.md) §1 |
| Arquitectura | Monolito modular en monorepo pnpm workspaces | [pnpm-workspace.yaml](pnpm-workspace.yaml) |
| Idioma / localización | Español (es-AR), moneda ARS | [currency-ars.pipe.ts](erp-frontend/src/app/shared/pipes/currency-ars.pipe.ts), [date.ts](erp-backend/src/shared/utils/date.ts) |
| Usuarios previstos | 5 | [CONTEXT.md](CONTEXT.md) §1 — **[PC]** no verificable en código |
| Rama de trabajo | `dev` (principal: `master`) | git |

**[HC]** El repositorio contiene dos paquetes: [erp-backend/](erp-backend/) y [erp-frontend/](erp-frontend/), declarados en [pnpm-workspace.yaml](pnpm-workspace.yaml), con un `pnpm-lock.yaml` único en la raíz.

### 1.1 Problema que resuelve — lectura del código

**[INF]** A partir del modelo de datos y de los flujos implementados, el sistema resuelve la
gestión operativa de una fábrica pequeña: registrar el catálogo de materiales terminados y su
stock, administrar clientes, registrar ventas con descuento automático de inventario, reflejar
el ingreso en caja, permitir la anulación correctiva de operaciones, y dejar traza auditable de
todo lo anterior, con reportería exportable y control de acceso por rol.

**[PC]** El problema de negocio *previo* al sistema (cómo se gestionaba antes, qué dolor concreto
se buscaba resolver, volumen real de operaciones) no está en el repositorio. Debe aportarlo el
autor — ver §12.A.

---

## 2. Stack tecnológico verificado

### 2.1 Backend — [erp-backend/package.json](erp-backend/package.json) **[HC]**

| Rol | Paquete | Versión | ¿Usado en código? |
|---|---|---|---|
| Runtime | Node.js | `>=20.11.0` (engines) | Sí |
| Framework HTTP | `express` | 4.21.1 | Sí — [app.ts](erp-backend/src/app.ts) |
| Lenguaje | `typescript` | 5.6.3 | Sí |
| ORM | `@prisma/client` / `prisma` | 5.22.0 | Sí — [database.ts](erp-backend/src/config/database.ts) |
| Base de datos | PostgreSQL | 16 (imagen Docker) | Sí — [docker-compose.yml](docker-compose.yml) |
| Validación | `zod` | 3.23.8 | Sí — todos los `*.dto.ts` |
| Autenticación | `jsonwebtoken` | 9.0.2 | Sí — [auth.service.ts](erp-backend/src/modules/auth/auth.service.ts) |
| Hash de contraseñas | `bcryptjs` | 2.4.3 | Sí (coste 10) |
| Decimales | `decimal.js` | 10.4.3 | Sí — ventas, dashboard, reportes |
| Fechas | `dayjs` | 1.11.13 | Sí — [date.ts](erp-backend/src/shared/utils/date.ts) |
| Logging | `winston` | 3.15.0 | Sí — [logger.ts](erp-backend/src/shared/utils/logger.ts) |
| Excel | `exceljs` | 4.4.0 | Sí — [excel-writer.ts](erp-backend/src/modules/reports/excel-writer.ts) |
| Correo | `nodemailer` | 6.9.16 | Sí — [mailer.ts](erp-backend/src/shared/utils/mailer.ts) |
| Seguridad HTTP | `helmet`, `cors`, `compression`, `express-rate-limit` | 8.0.0 / 2.8.5 / 1.7.5 / 7.4.1 | Sí — [app.ts](erp-backend/src/app.ts) |
| PDF | `pdfkit` + `@types/pdfkit` | 0.15.1 | **NO** — 0 referencias en `src/` |
| UUID | `uuid` + `@types/uuid` | 10.0.0 | **NO** — 0 referencias (los UUID los genera Prisma) |
| Testing | `vitest` + `supertest` | 2.1.4 / 7.0.0 | Sí — [tests/](erp-backend/tests/) |

> **[HC] Divergencia con la documentación existente:** [CONTEXT.md](CONTEXT.md) §2 lista
> «Reportes PDF: PDFKit» como parte del stack definitivo. **El sistema no genera ningún PDF.**
> La única salida de reportes es Excel. Debe corregirse antes de documentar (ver §13).

### 2.2 Frontend — [erp-frontend/package.json](erp-frontend/package.json) **[HC]**

| Rol | Paquete | Versión | Notas |
|---|---|---|---|
| Framework | `@angular/*` | ^19.0.0 | Componentes **standalone**, sin NgModules |
| Estado | Signals nativos | — | `signal()`, `computed()`, `input()`, `output()`, `model()` |
| UI | `primeng` + `primeicons` | 17.18.11 / 7.0.0 | Tema `lara-light-blue` |
| Estilos | `tailwindcss` | 3.4.14 | Tokens vía variables CSS |
| Gráficos | `chart.js` | 4.5.1 | Consumido por `p-chart` |
| Fechas | `dayjs` | 1.11.13 | |
| Decimales | `decimal.js` | 10.4.3 | Solo para *previsualizar* totales |
| Descargas | `file-saver` | 2.0.5 | [report.service.ts](erp-frontend/src/app/features/reports/report.service.ts) |
| Testing | Karma + Jasmine | — | [karma.conf.js](erp-frontend/karma.conf.js) |

### 2.3 Tooling e infraestructura de desarrollo **[HC]**

| Herramienta | Evidencia |
|---|---|
| pnpm workspaces (v9) | [pnpm-workspace.yaml](pnpm-workspace.yaml), [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| Docker Compose: PostgreSQL 16 + Adminer + Mailpit | [docker-compose.yml](docker-compose.yml) |
| CI: GitHub Actions (job backend con servicio Postgres; job frontend con ChromeHeadless) | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| Angular CLI 19 / builder `@angular-devkit/build-angular` | [angular.json](erp-frontend/angular.json) |

> **[HC] Inconsistencia:** el script `lint` de [erp-backend/package.json](erp-backend/package.json)
> es `eslint src --ext .ts` y ESLint 9.14.0 está instalado, pero **no existe ningún archivo de
> configuración de ESLint** en el repositorio (`eslint.config.*` ni `.eslintrc*`). El script no es
> ejecutable tal como está. No documentarlo como parte del flujo de trabajo sin corregirlo.

---

## 3. Arquitectura real del sistema

### 3.1 Patrón arquitectónico **[HC]**

**Monolito modular en dos procesos**: una SPA Angular y una API REST Express, comunicadas
exclusivamente por HTTP/JSON contra una única base PostgreSQL. No hay microservicios, colas,
caché ni servicios internos adicionales.

> [CONTEXT.md](CONTEXT.md) §13 documenta que BullMQ/Redis fue **removido** del stack.
> Verificado: no hay dependencias de Redis ni de colas en ninguno de los dos `package.json`. **[HC]**

### 3.2 Capas del backend **[HC]**

```
HTTP  →  app.ts (middlewares globales)
      →  <modulo>.routes.ts      : montaje, authenticate, requirePermission, validate(schema)
      →  <modulo>.controller.ts  : traduce HTTP ↔ dominio (parseo de query, códigos de estado)
      →  <modulo>.service.ts     : reglas de negocio, transacciones, auditoría
      →  Prisma Client           : acceso a PostgreSQL
```

| Capa | Hace | No hace |
|---|---|---|
| `routes` | Monta el router, aplica `authenticate`, `requirePermission('modulo.accion')` y `validate(schema, source)` | No contiene lógica |
| `controller` | Normaliza `req.query`, arma filtros, elige el código HTTP, delega en el service | No consulta la base |
| `service` | Valida invariantes de negocio, abre `prisma.$transaction`, escribe `AuditLog`, lanza `AppError` | No conoce `Request`/`Response` |
| `shared/` | Middlewares y utilidades transversales | — |

**[HC]** Ningún service importa el service de otro módulo. La única excepción esperada es la
capa de reportes, cuya definición consulta modelos Prisma directamente
([sales-by-period.ts](erp-backend/src/modules/reports/definitions/sales-by-period.ts)).

### 3.3 Middlewares globales — [app.ts](erp-backend/src/app.ts) **[HC]**

Orden exacto de la cadena:

1. `helmet()` — cabeceras de seguridad
2. `cors(corsOptions)` — origen restringido a `FRONTEND_URL`; expone `Content-Disposition` y `X-Report-Rows`
3. `compression()`
4. `express.json()` + `express.urlencoded({ extended: true })`
5. `rateLimit({ windowMs: 15 min, limit: 1000 })` — límite global
6. `GET /health` → `{ status: 'ok' }` (fuera de `/api`, sin autenticación)
7. Router `/api` con los 17 módulos montados
8. `notFoundHandler` → 404 `{ error: 'Ruta no encontrada' }`
9. `errorHandler` → mapeo centralizado de errores

### 3.4 Manejo de errores — [error-handler.ts](erp-backend/src/shared/middlewares/error-handler.ts) **[HC]**

| Origen | Respuesta |
|---|---|
| `res.headersSent` (p. ej. descarga en streaming ya iniciada) | Delega en Express (corta la conexión) y loguea |
| `ZodError` | `400 { error: 'Datos inválidos', details: fieldErrors }` |
| `AppError` | Su `statusCode` + `{ error, details }` |
| Prisma `P2002` (unicidad) | `409 { error: 'Violación de unicidad', details: target }` |
| Prisma `P2025` (no encontrado) | `404 { error: 'Recurso no encontrado' }` |
| Cualquier otro | `500 { error: 'Error interno del servidor' }` + log Winston |

Fábrica de errores en [app-error.ts](erp-backend/src/shared/utils/app-error.ts):
`badRequest(400)`, `unauthorized(401)`, `forbidden(403)`, `notFound(404)`, `conflict(409)`,
`unprocessable(422)`.

### 3.5 Contrato de respuesta **[HC]**

[response.ts](erp-backend/src/shared/utils/response.ts): toda respuesta exitosa va envuelta en
`{ data }`; los listados agregan `{ meta: { page, limit, total, totalPages } }`. El frontend
desempaqueta ese sobre en [api.service.ts](erp-frontend/src/app/core/services/api.service.ts).

**Excepción [HC]:** la descarga de reportes (`GET /api/reports/:key/excel`) devuelve binario, no
el sobre; el frontend la consume con `getBlob()`.

### 3.6 Autenticación **[HC]**

- **JWT stateless con dos tokens** — [auth.service.ts](erp-backend/src/modules/auth/auth.service.ts):
  access (`15m`, payload `{ sub, email, roleId }`) y refresh (`7d`, payload `{ sub }`), firmados con
  secretos distintos (`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`).
- **No hay tabla de sesiones ni de refresh tokens.** El único token persistido es el de
  recuperación de contraseña.
- `authenticate` ([auth.middleware.ts](erp-backend/src/modules/auth/auth.middleware.ts)) verifica el
  access token y **consulta la base en cada request** para resolver los permisos del rol,
  adjuntándolos en `req.user.permissions`.
- **[INF]** Consecuencia de diseño relevante: un cambio de permisos de un rol impacta en la
  request siguiente, sin esperar a que expire el token.
- Frontend: tokens en `localStorage` bajo `erp_access_token` / `erp_refresh_token`
  ([auth.service.ts](erp-frontend/src/app/core/services/auth.service.ts)).

### 3.7 Autorización — RBAC **[HC]**

- Modelo: `User → Role → RolePermission → Permission`, con `Permission.code` en formato
  `modulo.accion` ([schema.prisma](erp-backend/prisma/schema.prisma)).
- Backend: `requirePermission('modulo.accion')` ([permission.ts](erp-backend/src/shared/middlewares/permission.ts));
  el comodín `admin.*` concede todo.
- Frontend: `permissionGuard` lee `route.data.permission`
  ([permission.guard.ts](erp-frontend/src/app/core/guards/permission.guard.ts)) y el sidebar filtra
  sus ítems con la misma regla ([sidebar.component.ts](erp-frontend/src/app/layout/sidebar/sidebar.component.ts)).
- **[HC] La autorización del frontend es únicamente de usabilidad**: el backend revalida todo.
  Punto fuerte a documentar explícitamente en el capítulo de seguridad.

### 3.8 Persistencia **[HC]**

- PostgreSQL 16, acceso exclusivo vía Prisma.
- 3 migraciones aplicadas: `20260605155905_init`, `20260804171416_add_sale_created_by`,
  `20260817120000_add_password_reset_tokens`.
- Convenciones ([schema.prisma](erp-backend/prisma/schema.prisma), cabecera): IDs `uuid`, tablas y
  columnas `snake_case` vía `@@map`/`@map`, montos `Decimal(12,2)`, cantidades `Decimal(12,3)`,
  `created_at`/`updated_at`, **borrado lógico** con `isActive`.
- **[HC]** Los `Decimal` de Prisma se serializan como string en JSON; el frontend los tipa como
  `string` ([domain.model.ts](erp-frontend/src/app/core/models/domain.model.ts)) y solo los
  convierte a número para previsualizar totales.

### 3.9 Servicios externos **[HC]**

| Servicio | Uso | Estado |
|---|---|---|
| SMTP (`nodemailer`) | Único servicio externo. Envía el mail de recuperación de contraseña | **Opcional**: sin `SMTP_HOST` el mailer escribe el contenido en el log y devuelve `false` ([mailer.ts](erp-backend/src/shared/utils/mailer.ts)) |
| Mailpit (dev) | Bandeja SMTP de prueba: SMTP en `1025`, UI en `8025` | [docker-compose.yml](docker-compose.yml) |
| Adminer (dev) | Cliente web de PostgreSQL en `8080` | [docker-compose.yml](docker-compose.yml) |

**[HC]** No hay integración con AFIP, pasarelas de pago, almacenamiento externo ni ningún otro
tercero. El campo `Invoice.cae` existe en el schema pero **ningún código lo escribe ni lo lee**.

### 3.10 Configuración **[HC]**

[environment.ts](erp-backend/src/config/environment.ts) valida el entorno con Zod al arrancar y
**termina el proceso** (`process.exit(1)`) si falta algo. Variables: `NODE_ENV`, `PORT`,
`FRONTEND_URL`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`DEFAULT_PAGINATION_LIMIT` (20), `MAX_PAGINATION_LIMIT` (100), `PASSWORD_RESET_TTL_MINUTES` (30),
`SMTP_HOST/PORT/SECURE/USER/PASS`, `MAIL_FROM`.

Frontend: [environment.development.ts](erp-frontend/src/environments/environment.development.ts)
apunta a `http://localhost:3000/api`; [environment.ts](erp-frontend/src/environments/environment.ts)
(producción) usa `/api` **relativo**, lo que implica un reverse proxy sirviendo ambos en el mismo
origen. **[INF]** — no hay `nginx.conf` ni `Dockerfile` en el repositorio que lo materialice.

### 3.11 Arquitectura del frontend **[HC]**

```
main.ts → app.config.ts (providers + provideAppInitializer)
        → app.routes.ts
            ├── /login, /forgot-password, /reset-password   (públicas, lazy)
            └── '' + authGuard → MainLayoutComponent
                 └── children lazy (loadChildren) con permissionGuard
```

| Capa | Contenido | Ubicación |
|---|---|---|
| `core` | `ApiService`, `AuthService`, `NotificationService`, `jwtInterceptor`, `errorInterceptor`, `authGuard`, `permissionGuard`, modelos | [core/](erp-frontend/src/app/core/) |
| `layout` | `MainLayoutComponent` (sidebar colapsable + header + outlet) | [layout/](erp-frontend/src/app/layout/) |
| `shared` | `DataTableComponent`, `PageHeaderComponent`, `ConfirmDialogComponent`, `LoadingSpinnerComponent`, `ChartCardComponent`, pipes `currencyArs` y `dateFormat`, `chart-theme.ts` | [shared/](erp-frontend/src/app/shared/) |
| `features` | 9 features lazy | [features/](erp-frontend/src/app/features/) |

**Piezas transversales verificadas:**

- **`jwtInterceptor`** ([jwt.interceptor.ts](erp-frontend/src/app/core/interceptors/jwt.interceptor.ts)):
  adjunta `Bearer`; ante un 401 en ruta no pública intenta `refresh()` y **reintenta la request
  original una sola vez**; si el refresh falla, hace `logout()`. Excluye `/auth/login`,
  `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`.
- **`errorInterceptor`** ([error.interceptor.ts](erp-frontend/src/app/core/interceptors/error.interceptor.ts)):
  toast con `error.error.error` para todo error ≠ 401; si el cuerpo es un `Blob` (descarga fallida)
  lo lee como texto antes de mostrarlo.
- **`provideAppInitializer`** ([app.config.ts](erp-frontend/src/app/app.config.ts)): si hay token,
  llama a `/auth/me` **antes del primer render** para restaurar la sesión.
- **`DataTableComponent`** ([data-table.component.ts](erp-frontend/src/app/shared/components/data-table/data-table.component.ts)):
  `p-table` en modo `lazy` con paginación server-side, búsqueda con `debounceTime(300)`,
  `MIN_SEARCH_LENGTH = 2` y modo `searchRequired` que **no consulta al servidor** hasta tener una
  búsqueda válida.

### 3.12 Sistema de diseño **[HC]**

Tokens definidos una sola vez como variables CSS en
[styles.css](erp-frontend/src/styles.css) y consumidos por Tailwind vía `theme.extend`
([tailwind.config.js](erp-frontend/tailwind.config.js)). Primario azul `#2563eb` alineado con el
tema `lara-light-blue` de PrimeNG; acento ámbar `#f59e0b`.

**[HC] Detalle destacable para la documentación técnica:** el generador de Excel del backend
reutiliza literalmente esos colores (`HEADER_FILL = 'FF2563EB'`, `MUTED_TEXT = 'FF64748B'` en
[excel-writer.ts](erp-backend/src/modules/reports/excel-writer.ts)) para que la planilla no
desentone con la aplicación. Es un ejemplo concreto de coherencia de diseño cruzando capas.

---

## 4. Modelo de datos

**[HC]** 22 modelos en [schema.prisma](erp-backend/prisma/schema.prisma), agrupados en 6 áreas.

| Área | Modelos | ¿Tiene código que los use? |
|---|---|---|
| Core | `User`, `PasswordResetToken`, `Role`, `Permission`, `RolePermission` | **Sí** |
| Empleados | `Employee` | **Sí** (backend; sin UI) |
| Inventario | `Category`, `RawMaterial`, `RawMaterialMovement`, `FinishedProduct`, `FinishedProductMovement` | **Parcial**: `Category`, `FinishedProduct`, `FinishedProductMovement` sí; `RawMaterial*` **no** |
| Producción | `ProductionRecord`, `ProductionConsumption` | **No** |
| Comercial | `Customer`, `Supplier`, `Sale`, `SaleDetail` | **Parcial**: `Supplier` **no** |
| Finanzas | `CashRegister`, `CashMovement`, `SupplierPayment`, `Invoice` | **Parcial**: `CashRegister`/`CashMovement` sí (solo escritos por ventas); `SupplierPayment` e `Invoice` **no** |
| Auditoría | `AuditLog` | **Sí** |

**Enumeraciones [HC]:** `CategoryType` (RAW_MATERIAL, FINISHED_PRODUCT), `MovementType`
(IN, OUT, ADJUST), `SaleStatus` (DRAFT, CONFIRMED, CANCELLED), `PaymentMethod` (CASH, TRANSFER,
CARD, CHECK, ACCOUNT), `CashType` (SALES, PAYMENTS), `InvoiceType` (A, B, C, RECEIPT),
`InvoiceStatus` (PENDING, ISSUED, CANCELLED).

> **[HC] Hallazgo central para la documentación:** el modelo de datos está diseñado para el ERP
> completo (22 modelos), pero **7 no tienen código alguno**. Documentar el schema como si todo
> estuviera implementado sería inexacto. La estrategia recomendada está en §5.7.

**[HC] Valores enum declarados pero nunca producidos por el código:**
`SaleStatus.DRAFT` (toda venta nace `CONFIRMED` — [sales.service.ts:144](erp-backend/src/modules/commercial/sales/sales.service.ts#L144)),
`CategoryType.RAW_MATERIAL` (no hay pantalla ni endpoint que lo use), `CashType.PAYMENTS`,
y los tres valores de `InvoiceType`/`InvoiceStatus`.

---

## 5. Alcance funcional implementado vs. declarado

### 5.1 Estado real por módulo del backend **[HC]**

| Módulo backend | Estado | Evidencia |
|---|---|---|
| `auth` | ✅ Completo (login, refresh, me, forgot/reset password) | [auth/](erp-backend/src/modules/auth/) |
| `users` | ✅ CRUD + baja lógica | [users/](erp-backend/src/modules/users/) |
| `roles` | ✅ Solo lectura | [roles/](erp-backend/src/modules/roles/) |
| `employees` | ✅ CRUD + baja lógica | [employees/](erp-backend/src/modules/employees/) |
| `inventory/categories` | ✅ Listar + crear | [categories/](erp-backend/src/modules/inventory/categories/) |
| `inventory/finished-products` | ✅ CRUD + movimientos IN/ADJUST + historial | [finished-products/](erp-backend/src/modules/inventory/finished-products/) |
| `commercial/customers` | ✅ CRUD + baja lógica | [customers/](erp-backend/src/modules/commercial/customers/) |
| `commercial/sales` | ✅ Núcleo: listar, detalle, crear transaccional, anular | [sales.service.ts](erp-backend/src/modules/commercial/sales/sales.service.ts) |
| `finance/sales-cash` | ✅ Solo lectura (saldo + movimientos) | [sales-cash/](erp-backend/src/modules/finance/sales-cash/) |
| `reports` | ✅ 1 reporte (ventas por período → Excel) | [reports/](erp-backend/src/modules/reports/) |
| `audit` | ✅ Consulta (lista, detalle, entidades) | [audit/](erp-backend/src/modules/audit/) |
| `dashboard` | ✅ KPIs + serie temporal | [dashboard/](erp-backend/src/modules/dashboard/) |
| `inventory/raw-materials` | 🔴 **Stub** (`Router` + `authenticate` + TODO) | [raw-materials.routes.ts](erp-backend/src/modules/inventory/raw-materials/raw-materials.routes.ts) |
| `production` | 🔴 **Stub** | [production.routes.ts](erp-backend/src/modules/production/production.routes.ts) |
| `commercial/suppliers` | 🔴 **Stub** | [suppliers.routes.ts](erp-backend/src/modules/commercial/suppliers/suppliers.routes.ts) |
| `finance/payments` | 🔴 **Stub** | [payments.routes.ts](erp-backend/src/modules/finance/payments/payments.routes.ts) |
| `finance/invoicing` | 🔴 **Stub** | [invoicing.routes.ts](erp-backend/src/modules/finance/invoicing/invoicing.routes.ts) |

**[HC]** Los 5 stubs están **montados en [app.ts](erp-backend/src/app.ts)** y responden 404 a
cualquier ruta bajo su prefijo. No exponen ni un solo endpoint.

### 5.2 Inventario completo de endpoints **[HC]**

| # | Método | Ruta | Autorización |
|---|---|---|---|
| 1 | GET | `/health` | Pública |
| 2 | POST | `/api/auth/login` | Pública |
| 3 | POST | `/api/auth/refresh` | Pública |
| 4 | GET | `/api/auth/me` | `authenticate` |
| 5 | POST | `/api/auth/forgot-password` | Pública + rate limit 5/15 min |
| 6 | GET | `/api/auth/reset-password/:token/validate` | Pública + rate limit |
| 7 | POST | `/api/auth/reset-password` | Pública + rate limit |
| 8 | GET | `/api/users` | `users.read` |
| 9 | GET | `/api/users/:id` | `users.read` |
| 10 | POST | `/api/users` | `users.create` |
| 11 | PATCH | `/api/users/:id` | `users.update` |
| 12 | DELETE | `/api/users/:id` | `users.delete` (baja lógica) |
| 13 | GET | `/api/roles` | `users.read` |
| 14 | GET | `/api/roles/:id` | `users.read` |
| 15 | GET | `/api/employees` | `employees.read` |
| 16 | GET | `/api/employees/:id` | `employees.read` |
| 17 | POST | `/api/employees` | `employees.create` |
| 18 | PATCH | `/api/employees/:id` | `employees.update` |
| 19 | DELETE | `/api/employees/:id` | `employees.delete` |
| 20 | GET | `/api/categories` | `inventory.read` |
| 21 | POST | `/api/categories` | `inventory.create` |
| 22 | GET | `/api/inventory/finished-products` | `inventory.read` |
| 23 | GET | `/api/inventory/finished-products/:id` | `inventory.read` |
| 24 | POST | `/api/inventory/finished-products` | `inventory.create` |
| 25 | PATCH | `/api/inventory/finished-products/:id` | `inventory.update` |
| 26 | DELETE | `/api/inventory/finished-products/:id` | `inventory.delete` |
| 27 | GET | `/api/inventory/finished-products/:id/movements` | `inventory.read` |
| 28 | POST | `/api/inventory/finished-products/:id/movements` | `inventory.update` |
| 29 | GET | `/api/commercial/customers` | `commercial.read` |
| 30 | GET | `/api/commercial/customers/:id` | `commercial.read` |
| 31 | POST | `/api/commercial/customers` | `commercial.create` |
| 32 | PATCH | `/api/commercial/customers/:id` | `commercial.update` |
| 33 | DELETE | `/api/commercial/customers/:id` | `commercial.delete` |
| 34 | GET | `/api/commercial/sales` | `commercial.read` |
| 35 | GET | `/api/commercial/sales/:id` | `commercial.read` |
| 36 | POST | `/api/commercial/sales` | `commercial.create` |
| 37 | PATCH | `/api/commercial/sales/:id/cancel` | `commercial.update` |
| 38 | GET | `/api/finance/sales-cash` | `finance.read` |
| 39 | GET | `/api/finance/sales-cash/movements` | `finance.read` |
| 40 | GET | `/api/reports/:key/excel` | `reports.read` |
| 41 | GET | `/api/audit` | `audit.read` |
| 42 | GET | `/api/audit/entities` | `audit.read` |
| 43 | GET | `/api/audit/:id` | `audit.read` |
| 44 | GET | `/api/dashboard` | Solo `authenticate` (decisión deliberada: es la home de todos los roles) |
| 45 | GET | `/api/dashboard/sales-series` | Solo `authenticate` |

### 5.3 Inventario de pantallas del frontend **[HC]**

| # | Ruta | Componente | Permiso |
|---|---|---|---|
| P01 | `/login` | `LoginComponent` | Pública |
| P02 | `/forgot-password` | `ForgotPasswordComponent` | Pública |
| P03 | `/reset-password?token=` | `ResetPasswordComponent` | Pública |
| P04 | `/dashboard` | `DashboardComponent` + `SalesChartComponent` | Solo sesión |
| P05 | `/commercial/customers` | `CustomerListComponent` | `commercial.read` |
| P06 | `/commercial/customers/new` · `/:id/edit` | `CustomerFormComponent` | `commercial.create` / `.update` |
| P07 | `/inventory/finished-products` | `ProductListComponent` | `inventory.read` |
| P08 | `/inventory/finished-products/new` · `/:id/edit` | `ProductFormComponent` (+ `CategoryFormComponent` embebido) | `inventory.create` / `.update` |
| P09 | Diálogo de movimiento de stock | `StockMovementDialogComponent` | `inventory.update` |
| P10 | `/commercial/sales` | `SaleListComponent` | `commercial.read` |
| P11 | `/commercial/sales/new` | `SaleFormComponent` | `commercial.create` |
| P12 | `/commercial/sales/:id` | `SaleDetailComponent` | `commercial.read` |
| P13 | `/finance/sales-cash` | `CashRegisterComponent` | `finance.read` |
| P14 | `/users` | `UserListComponent` | `users.read` |
| P15 | `/users/new` · `/:id/edit` | `UserFormComponent` | `users.create` / `.update` |
| P16 | `/roles` | `RoleListComponent` | `users.read` |
| P17 | `/audit` | `AuditListComponent` (+ diálogo de detalle) | `audit.read` |
| P18 | `/reports` | `SalesReportComponent` | `reports.read` |

**[HC] Ausencia relevante:** no existe ninguna pantalla de **empleados** en el frontend
(0 referencias a `employee`/`empleado` en `erp-frontend/src`), pese a que el módulo del backend
está completo. Ver §13.

### 5.4 Roles y permisos sembrados — [seed.ts](erp-backend/prisma/seed.ts) **[HC]**

Catálogo: 10 módulos × 4 acciones (`read`, `create`, `update`, `delete`) + `admin.*` = **41 permisos**.

| Rol | Permisos asignados |
|---|---|
| **Administración** | `admin.*` |
| **Ventas** | `commercial.read/create/update/delete`, `inventory.read` |
| **Stock** | `inventory.read/create/update/delete` |
| **Producción** | `inventory.read/create/update`, `production.read/create/update/delete` |
| **Finanzas** | `commercial.read`, `inventory.read`, `finance.*`, `invoicing.*`, `reports.read` |

**[INF] Menú visible por rol** (derivado del cruce entre el seed y
[sidebar.component.ts](erp-frontend/src/app/layout/sidebar/sidebar.component.ts)):

| Rol | Ítems del menú lateral |
|---|---|
| Administración | Inicio, Clientes, Materiales, Ventas, Caja de ventas, Usuarios, Roles, Auditoría, Reportes |
| Ventas | Inicio, Clientes, Materiales, Ventas |
| Stock | Inicio, Materiales |
| Producción | Inicio, Materiales |
| Finanzas | Inicio, Clientes, Materiales, Ventas, Caja de ventas, Reportes |

> **[HC] Consecuencia a documentar:** el rol **Producción** tiene los cuatro permisos
> `production.*`, pero el módulo de producción es un stub. En la práctica su experiencia es
> idéntica a la de Stock, con menos permisos. Es una inconsistencia funcional visible para un
> evaluador que pruebe el sistema con ese usuario.

### 5.5 Usuarios sembrados **[HC]**

El seed crea 5 usuarios de demostración (uno por rol) con contraseñas triviales por convención
de desarrollo. **Estas credenciales no deben presentarse en la documentación como credenciales
del sistema**: son datos de demo. Tratamiento recomendado en §13, riesgo R-08.

### 5.6 Cobertura de pruebas **[HC]**

| Suite | Archivos | Casos (`it`) |
|---|---|---|
| Backend (Vitest + Supertest, integración contra Postgres real) | [health.test.ts](erp-backend/tests/health.test.ts), [sales-flow.test.ts](erp-backend/tests/sales-flow.test.ts), [password-reset.test.ts](erp-backend/tests/password-reset.test.ts), [cash-date-filter.test.ts](erp-backend/tests/cash-date-filter.test.ts) | **38** |
| Frontend (Karma + Jasmine, con `HttpTestingController`) | 6 archivos `*.spec.ts` | **26** |

**[HC]** [tests/setup.ts](erp-backend/tests/setup.ts) implementa dos guardas que impiden ejecutar
la suite contra la base de desarrollo: falla si no existe `.env.test` y falla si `NODE_ENV !== 'test'`.
Es un detalle de ingeniería que conviene documentar en el capítulo de calidad.

### 5.7 Alcance declarado en `CONTEXT.md` vs. alcance real **[HC]**

| Funcionalidad declarada ([CONTEXT.md](CONTEXT.md) §6) | Estado real |
|---|---|
| Usuarios, roles y permisos | ✅ Implementado (roles solo lectura) |
| Empleados | ⚠️ Backend sí, **sin interfaz** |
| Inventario MP, movimientos, **costo promedio ponderado** | 🔴 **No implementado** (campo `averageCost` sin código que lo calcule) |
| Inventario PT, movimientos | ✅ Implementado |
| Producción: consumo de MP + actualización automática de stock | 🔴 **No implementado** |
| Comercial: clientes | ✅ Implementado |
| Comercial: proveedores | 🔴 **No implementado** |
| Ventas, detalle | ✅ Implementado |
| Facturación (A/B/C/Recibo, CAE) | 🔴 **No implementado** |
| Caja Ventas | ✅ Implementado (solo lectura; los movimientos los generan las ventas) |
| Caja Pagos a proveedores | 🔴 **No implementado** |
| Reportes operativos y financieros, **PDF/Excel** | ⚠️ **1 reporte, solo Excel** |
| Auditoría (CREATE/UPDATE/DELETE) | ✅ Implementado (escritura + consulta) |

> Esta tabla es, probablemente, **la decisión editorial más importante de todo el proyecto
> documental**. Ver §14, Decisión D1.

---

## 6. Comprensión funcional: fichas de funcionalidad

Formato solicitado, una ficha por funcionalidad detectada. Las 20 fichas siguientes cubren el
100 % de lo implementado.

### F01 — Inicio de sesión

| Campo | Información |
|---|---|
| Funcionalidad | Autenticación con email y contraseña |
| Módulo | Auth |
| Descripción | El usuario obtiene un par de tokens (access 15 min / refresh 7 días) y su perfil con permisos |
| Rol involucrado | Todos |
| Flujo principal | `/login` → `POST /api/auth/login` → guarda tokens en `localStorage` → `GET /api/auth/me` → redirige a `returnUrl` o `/dashboard` |
| Reglas de negocio | Usuario inexistente **o inactivo** → 401 con el mismo mensaje que contraseña incorrecta (no revela cuál falló) |
| Validaciones | `email` formato válido, `password` no vacío (Zod + Reactive Forms) |
| Dependencias | `bcryptjs`, `jsonwebtoken`, tabla `users`+`roles` |
| Implementación | [auth.service.ts](erp-backend/src/modules/auth/auth.service.ts) `login()`; [login.component.ts](erp-frontend/src/app/features/auth/login/login.component.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí |

### F02 — Solicitud de recuperación de contraseña

| Campo | Información |
|---|---|
| Funcionalidad | Envío del enlace de restablecimiento por correo |
| Módulo | Auth |
| Descripción | Genera un token aleatorio de 256 bits, guarda **solo su SHA-256** y envía el enlace por mail |
| Rol involucrado | Todos (endpoint público) |
| Flujo principal | `/forgot-password` → `POST /api/auth/forgot-password` → siempre 200 con mensaje genérico |
| Reglas de negocio | Respuesta **idéntica** exista o no el email (impide enumerar cuentas); solo el último enlace pedido queda vigente; vence en `PASSWORD_RESET_TTL_MINUTES` (30 por defecto); rate limit 5 por IP cada 15 min |
| Validaciones | `email` formato válido |
| Dependencias | `nodemailer`, `crypto`, tabla `password_reset_tokens` |
| Implementación | [auth.service.ts](erp-backend/src/modules/auth/auth.service.ts) `forgotPassword()`; [forgot-password.component.ts](erp-frontend/src/app/features/auth/forgot-password/forgot-password.component.ts) |
| Documentación técnica | Sí (caso de estudio de seguridad) |
| Manual de usuario | Sí |

### F03 — Restablecimiento de contraseña

| Campo | Información |
|---|---|
| Funcionalidad | Definir contraseña nueva desde el enlace del correo |
| Módulo | Auth |
| Descripción | Valida el token al entrar, pide la contraseña nueva, la aplica y consume el token |
| Rol involucrado | Todos |
| Flujo principal | Clic en el enlace → `/reset-password?token=` → `GET .../validate` → formulario → `POST /api/auth/reset-password` |
| Reglas de negocio | **Un solo uso** (`usedAt`, consumo atómico dentro de la transacción); al usarlo se **borran los demás tokens** del usuario; deja `AuditLog` **sin valores** (el hash no debe quedar auditado); un reset **no cierra** las sesiones ya abiertas (limitación conocida de JWT stateless) |
| Validaciones | Contraseña mínimo 8 caracteres (backend y frontend); confirmación coincidente (validador de grupo) |
| Dependencias | `bcryptjs`, transacción Prisma |
| Implementación | [auth.service.ts](erp-backend/src/modules/auth/auth.service.ts) `resetPassword()`; [reset-password.component.ts](erp-frontend/src/app/features/auth/reset-password/reset-password.component.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí |

### F04 — Renovación automática de sesión

| Campo | Información |
|---|---|
| Funcionalidad | Refresco transparente del access token |
| Módulo | Auth (frontend) |
| Descripción | Ante un 401, el interceptor renueva el token y reintenta la request original una vez |
| Rol involucrado | Todos |
| Flujo principal | Request → 401 → `POST /api/auth/refresh` → reintento con el token nuevo; si el refresh falla → `logout()` |
| Reglas de negocio | Solo un reintento; los endpoints públicos de auth quedan excluidos |
| Validaciones | Refresh token válido y usuario activo |
| Dependencias | `localStorage` |
| Implementación | [jwt.interceptor.ts](erp-frontend/src/app/core/interceptors/jwt.interceptor.ts) |
| Documentación técnica | Sí |
| Manual de usuario | **No** (es invisible; a lo sumo una nota sobre el cierre de sesión) |

### F05 — Panel de inicio (KPIs)

| Campo | Información |
|---|---|
| Funcionalidad | Métricas de gestión de la pantalla de inicio |
| Módulo | Dashboard |
| Descripción | Ventas del mes y del día, productos y clientes activos, top 5 clientes, 5 productos con menor stock |
| Rol involucrado | Todos (solo requiere sesión) |
| Flujo principal | `/dashboard` → `GET /api/dashboard` |
| Reglas de negocio | **Solo ventas `CONFIRMED`**; el día y el mes se calculan con la hora del servidor (mismo criterio que la serie temporal); «stock bajo» = los 5 productos activos con menor stock, **sin umbral por producto** |
| Validaciones | — |
| Dependencias | `prisma.aggregate` / `groupBy`, `dayjs` |
| Implementación | [dashboard.service.ts](erp-backend/src/modules/dashboard/dashboard.service.ts) `getSummary()` |
| Documentación técnica | Sí |
| Manual de usuario | Sí (cómo leer cada indicador) |

### F06 — Gráfico de evolución de ventas

| Campo | Información |
|---|---|
| Funcionalidad | Serie temporal de ventas confirmadas con selector Día/Semana/Mes |
| Módulo | Dashboard |
| Descripción | Barras con el total por bucket; tooltip con importe y cantidad de ventas |
| Rol involucrado | Todos |
| Flujo principal | Selector de período → `GET /api/dashboard/sales-series?groupBy=` |
| Reglas de negocio | Rango por defecto según granularidad (30 días / 12 semanas / 12 meses); tope de puntos 366/120/60 → **422** si se excede; **se emiten todos los buckets, incluidos los vacíos**, para no simular continuidad; la agregación se hace en JS y no con `date_trunc` porque `sold_at` guarda UTC sin zona |
| Validaciones | `from`/`to` con patrón `YYYY-MM-DD`; `from <= to` |
| Dependencias | Chart.js vía `p-chart` |
| Implementación | [dashboard.service.ts](erp-backend/src/modules/dashboard/dashboard.service.ts) `getSalesSeries()`; [sales-chart.component.ts](erp-frontend/src/app/features/dashboard/sales-chart/sales-chart.component.ts) |
| Documentación técnica | Sí (decisión de zona horaria) |
| Manual de usuario | Sí |

### F07 — Gestión de clientes

| Campo | Información |
|---|---|
| Funcionalidad | Alta, edición, consulta y baja lógica de clientes |
| Módulo | Comercial |
| Descripción | ABM completo con búsqueda server-side |
| Rol involucrado | Administración, Ventas (Finanzas: solo lectura) |
| Flujo principal | `/commercial/customers` → buscar (mín. 2 caracteres) → Nuevo/Editar/Dar de baja |
| Reglas de negocio | **Baja lógica** (`isActive = false`), nunca borrado físico; **no hay unicidad de CUIT** en el schema; toda operación deja `AuditLog` |
| Validaciones | `name` mín. 2 caracteres; `email` con formato si se informa; resto opcional |
| Dependencias | — |
| Implementación | [customers.service.ts](erp-backend/src/modules/commercial/customers/customers.service.ts); [customer-list](erp-frontend/src/app/features/commercial/customers/customer-list/customer-list.component.ts) / [customer-form](erp-frontend/src/app/features/commercial/customers/customer-form/customer-form.component.ts) |
| Documentación técnica | Sí (como patrón CRUD de referencia) |
| Manual de usuario | Sí |

### F08 — Gestión de materiales (productos terminados)

| Campo | Información |
|---|---|
| Funcionalidad | ABM del catálogo de materiales vendibles |
| Módulo | Inventario |
| Descripción | SKU, nombre, categoría, unidad y precio de venta. El stock **no** se edita aquí |
| Rol involucrado | Administración, Stock, Producción |
| Flujo principal | `/inventory/finished-products` → buscar → Nuevo/Editar/Dar de baja |
| Reglas de negocio | **SKU único** → 409 si se repite; `currentStock` **no se acepta por body**, solo se altera por movimientos; la categoría debe existir; baja lógica |
| Validaciones | `sku` no vacío; `name` mín. 2; `categoryId` UUID válido; `unit` no vacío; `salePrice >= 0` |
| Dependencias | `Category` de tipo `FINISHED_PRODUCT` |
| Implementación | [finished-products.service.ts](erp-backend/src/modules/inventory/finished-products/finished-products.service.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí |

### F09 — Alta rápida de categoría

| Campo | Información |
|---|---|
| Funcionalidad | Crear una categoría sin abandonar el formulario de material |
| Módulo | Inventario |
| Descripción | Diálogo embebido en el alta/edición de material |
| Rol involucrado | Administración, Stock, Producción |
| Flujo principal | Formulario de material → «nueva categoría» → `POST /api/categories` → se agrega al desplegable |
| Reglas de negocio | Unicidad por `(name, type)` → 409; el listado de categorías **no está paginado** |
| Validaciones | `name` mín. 2; `type` ∈ `CategoryType` |
| Dependencias | — |
| Implementación | [categories.service.ts](erp-backend/src/modules/inventory/categories/categories.service.ts); [category-form.component.ts](erp-frontend/src/app/features/inventory/categories/category-form/category-form.component.ts) |
| Documentación técnica | Sí (breve) |
| Manual de usuario | Sí (dentro del procedimiento de alta de material) |

### F10 — Movimientos de stock e historial

| Campo | Información |
|---|---|
| Funcionalidad | Registrar ingreso o ajuste de stock y consultar el historial |
| Módulo | Inventario |
| Descripción | `IN` **suma** al stock; `ADJUST` **fija** el stock al valor indicado |
| Rol involucrado | Administración, Stock, Producción |
| Flujo principal | Listado de materiales → icono de stock → diálogo → `POST .../:id/movements`; historial en `GET .../:id/movements` (paginado) |
| Reglas de negocio | **Los `OUT` solo los genera la venta**: el DTO acepta únicamente `IN` y `ADJUST`; movimiento y actualización de stock ocurren en una `$transaction`; genera `AuditLog` |
| Validaciones | `type` ∈ {IN, ADJUST}; `quantity > 0`; `reference` opcional |
| Dependencias | — |
| Implementación | [finished-products.service.ts](erp-backend/src/modules/inventory/finished-products/finished-products.service.ts) `createMovement()`; [stock-movement-dialog.component.ts](erp-frontend/src/app/features/inventory/finished-products/stock-movement-dialog/stock-movement-dialog.component.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí — **con advertencia explícita sobre la diferencia entre Ingreso y Ajuste** |

### F11 — Registro de venta

| Campo | Información |
|---|---|
| Funcionalidad | Venta multilínea con descuento de stock e ingreso en caja |
| Módulo | Comercial (núcleo del sistema) |
| Descripción | Selecciona cliente y medio de pago, agrega líneas (material + cantidad) y confirma |
| Rol involucrado | Administración, Ventas |
| Flujo principal | `/commercial/sales/new` → `POST /api/commercial/sales` → redirige al detalle |
| Reglas de negocio | Ver §7, flujo detallado CU-04. En síntesis: todo en una transacción; **precio congelado** desde `salePrice`; descuento **atómico y condicional** por producto; sin IVA (`tax = 0`, `total = subtotal`); genera un `FinishedProductMovement` `OUT` por línea; **genera el ingreso en la caja de ventas y actualiza su saldo**; estado inicial `CONFIRMED`; deja `AuditLog` |
| Validaciones | `customerId` UUID; `paymentMethod` ∈ enum; al menos 1 ítem; `quantity > 0`; cliente activo; producto existente y activo; stock suficiente |
| Dependencias | Requiere una `CashRegister` de tipo `SALES` activa (la crea el seed); si falta → 400 |
| Implementación | [sales.service.ts](erp-backend/src/modules/commercial/sales/sales.service.ts) `create()`; [sale-form.component.ts](erp-frontend/src/app/features/commercial/sales/sale-form/sale-form.component.ts) |
| Documentación técnica | Sí — **capítulo propio** |
| Manual de usuario | Sí — **procedimiento principal** |

### F12 — Consulta de ventas

| Campo | Información |
|---|---|
| Funcionalidad | Listado paginado con filtros |
| Módulo | Comercial |
| Descripción | Filtros por cliente (texto), estado y rango de fechas |
| Rol involucrado | Administración, Ventas, Finanzas |
| Flujo principal | `/commercial/sales` → `GET /api/commercial/sales?page&limit&search&status&from&to` |
| Reglas de negocio | **Arranca acotado al día en curso** (a diferencia de las grillas de clientes/materiales/usuarios, que exigen buscar); orden por `soldAt` descendente; `search` matchea el **nombre del cliente**; una fecha inválida se ignora en lugar de romper |
| Validaciones | Normalización de `from`/`to` a inicio/fin de día vía `parseDay` |
| Dependencias | — |
| Implementación | [sales.controller.ts](erp-backend/src/modules/commercial/sales/sales.controller.ts); [sale-list.component.ts](erp-frontend/src/app/features/commercial/sales/sale-list/sale-list.component.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí |

### F13 — Detalle de venta

| Campo | Información |
|---|---|
| Funcionalidad | Ver cabecera y líneas de una venta |
| Módulo | Comercial |
| Descripción | Cliente, fecha, medio de pago, vendedor, líneas con precio unitario y totales |
| Rol involucrado | Administración, Ventas, Finanzas |
| Flujo principal | Listado → fila → `/commercial/sales/:id` |
| Reglas de negocio | `createdBy` puede ser `null` en ventas anteriores a la migración `add_sale_created_by` → se muestra «—» |
| Validaciones | 404 si no existe → vuelve al listado |
| Dependencias | — |
| Implementación | [sale-detail.component.ts](erp-frontend/src/app/features/commercial/sales/sale-detail/sale-detail.component.ts) |
| Documentación técnica | Sí (breve) |
| Manual de usuario | Sí |

### F14 — Anulación de venta

| Campo | Información |
|---|---|
| Funcionalidad | Revertir una venta confirmada |
| Módulo | Comercial |
| Descripción | Repone stock, revierte la caja y marca la venta como `CANCELLED` |
| Rol involucrado | Administración, Ventas |
| Flujo principal | Detalle → «Anular» → confirmación → `PATCH /api/commercial/sales/:id/cancel` |
| Reglas de negocio | Solo ventas `CONFIRMED` → 422 en cualquier otro caso; **guard atómico** (`updateMany where status = CONFIRMED`) contra anulaciones concurrentes; genera movimientos `IN` con `reference = "Anulación venta <id>"`; genera movimiento de caja **negativo** y decrementa el saldo; **no depende de que el cliente siga activo**; deja `AuditLog` con `oldValues`/`newValues` de estado |
| Validaciones | Estado de la venta |
| Dependencias | — |
| Implementación | [sales.service.ts](erp-backend/src/modules/commercial/sales/sales.service.ts) `cancel()` |
| Documentación técnica | Sí |
| Manual de usuario | Sí — **con advertencia: la operación no se puede deshacer** |

### F15 — Caja de ventas

| Campo | Información |
|---|---|
| Funcionalidad | Consulta del saldo y de los movimientos de la caja de ventas |
| Módulo | Finanzas |
| Descripción | Tarjeta con el saldo acumulado + grilla de movimientos filtrable por fecha |
| Rol involucrado | Administración, Finanzas |
| Flujo principal | `/finance/sales-cash` → `GET /api/finance/sales-cash` + `GET .../movements` |
| Reglas de negocio | **Solo lectura**: no hay carga manual de movimientos; los generan las ventas y sus anulaciones; **el saldo es acumulado y NO se recalcula por el rango de fechas del listado** (comportamiento verificado por test); arranca acotada al día en curso |
| Validaciones | `from`/`to` vía `parseDay` |
| Dependencias | Requiere la `CashRegister` de tipo `SALES` (seed) |
| Implementación | [sales-cash.service.ts](erp-backend/src/modules/finance/sales-cash/sales-cash.service.ts); [cash-register.component.ts](erp-frontend/src/app/features/finance/sales-cash/cash-register/cash-register.component.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí — **aclarando que el saldo no responde al filtro** |

### F16 — Reporte «Ventas por período» (Excel)

| Campo | Información |
|---|---|
| Funcionalidad | Descarga de una planilla con una fila por línea de venta |
| Módulo | Reportes |
| Descripción | 12 columnas, logo, encabezado con período y filtros, autofiltro y bloque de totales |
| Rol involucrado | Administración, Finanzas |
| Flujo principal | `/reports` → elegir período y cliente → `GET /api/reports/sales-by-period/excel` → descarga |
| Reglas de negocio | **Solo ventas `CONFIRMED`**; grano de línea para permitir tablas dinámicas; tope de **20 000 filas** → 422 con pedido de achicar el rango; «Total vendido» se suma sobre **ventas distintas** usando `sale.total`, nunca sumando `lineTotal`; período por defecto: mes en curso (UI) / últimos 30 días (backend); las fechas se compensan para que Excel muestre la hora local |
| Validaciones | `from`/`to` patrón `YYYY-MM-DD`, `from <= to`, `customerId` UUID |
| Dependencias | `exceljs`, `file-saver`, `assets/logo.png`, cabeceras CORS expuestas |
| Implementación | [sales-by-period.ts](erp-backend/src/modules/reports/definitions/sales-by-period.ts), [excel-writer.ts](erp-backend/src/modules/reports/excel-writer.ts), [reports.service.ts](erp-backend/src/modules/reports/reports.service.ts) |
| Documentación técnica | Sí — **capítulo propio: es el mejor ejemplo de diseño extensible del proyecto** |
| Manual de usuario | Sí |

### F17 — Consulta de auditoría

| Campo | Información |
|---|---|
| Funcionalidad | Listado y detalle de operaciones críticas |
| Módulo | Auditoría |
| Descripción | Grilla filtrable por entidad, acción y fechas; diálogo con el diff JSON |
| Rol involucrado | Administración |
| Flujo principal | `/audit` → `GET /api/audit` → clic en fila → `GET /api/audit/:id` |
| Reglas de negocio | **Solo lectura**: la escritura la hace `writeAuditLog` desde los services; el listado **no trae** `oldValues`/`newValues` (pueden ser grandes), solo el detalle; arranca acotada al día en curso; `GET /audit/entities` alimenta el desplegable de entidades |
| Validaciones | `action` restringida a CREATE/UPDATE/DELETE; entidad como texto exacto |
| Dependencias | — |
| Implementación | [audit.service.ts](erp-backend/src/modules/audit/audit.service.ts); [audit-list.component.ts](erp-frontend/src/app/features/audit/audit-list/audit-list.component.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí (rol Administración) |

### F18 — Gestión de usuarios

| Campo | Información |
|---|---|
| Funcionalidad | ABM de usuarios con asignación de rol |
| Módulo | Usuarios |
| Descripción | Alta con contraseña, edición de nombre/rol/estado, baja lógica |
| Rol involucrado | Administración |
| Flujo principal | `/users` → buscar → Nuevo/Editar/Dar de baja |
| Reglas de negocio | **Email único** → 409; en edición **el email no se puede cambiar** (campo deshabilitado) y **la contraseña no se envía**; la contraseña se guarda con bcrypt coste 10; baja lógica |
| Validaciones | `email` válido, `password` mín. 8, `fullName` no vacío, `roleId` UUID |
| Dependencias | Catálogo de roles |
| Implementación | [users.service.ts](erp-backend/src/modules/users/users.service.ts); [user-form.component.ts](erp-frontend/src/app/features/users/user-form/user-form.component.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí (rol Administración) |

### F19 — Consulta de roles y permisos

| Campo | Información |
|---|---|
| Funcionalidad | Visualizar los 5 roles y sus códigos de permiso |
| Módulo | Usuarios / Roles |
| Descripción | Vista de solo lectura; alimenta también el desplegable del alta de usuario |
| Rol involucrado | Administración |
| Flujo principal | `/roles` → `GET /api/roles` |
| Reglas de negocio | **Los roles y sus permisos se definen en el seed y no se editan desde la aplicación**; el backend aplana la M2M a un array de códigos; protegido con `users.read` |
| Validaciones | — |
| Dependencias | — |
| Implementación | [roles.service.ts](erp-backend/src/modules/roles/roles.service.ts) |
| Documentación técnica | Sí |
| Manual de usuario | Sí (breve, informativo) |

### ~~F20 — Gestión de empleados~~ · **EXCLUIDA DE LA ENTREGA (D5 = G3)**

**Existe en el código [HC]:** CRUD completo con baja lógica y auditoría en
[employees.service.ts](erp-backend/src/modules/employees/employees.service.ts), 5 endpoints
montados en [app.ts](erp-backend/src/app.ts), **sin ninguna pantalla** en el frontend.

**Decisión: se omite de ambos documentos.** En consecuencia, **no** aparece en el Cap. 11 (API),
**no** figura en el diccionario de datos (la entidad `Employee` queda fuera, coherente con D2=B2)
y **no** se menciona en el manual.

> **Reserva que dejo asentada, para que la decisión sea informada.** Es la única de las siete
> decisiones que tensiona el principio de exactitud que vos mismo fijaste: el módulo **existe,
> está completo y es visible** para cualquiera que abra el repositorio o consulte
> `GET /api/employees`. Si el evaluador revisa el código —probable en una PPS de una carrera de
> programación—, encontrará funcionalidad no documentada.
>
> **Mitigación de costo nulo, compatible con G3:** una sola línea en el Cap. 1, dentro de la
> delimitación de alcance, del tipo *«el módulo de empleados quedó implementado a nivel de API
> durante la etapa de fundaciones y no forma parte del alcance entregado al cliente, que priorizó
> ventas»*. No documenta la funcionalidad —G3 se respeta— pero elimina la apariencia de omisión
> involuntaria y refuerza A-05. **Recomiendo incluirla; decidís vos.**

---

# Parte II — Diseño de la documentación técnica

## 7. Índice propuesto de la documentación técnica

Cada capítulo indica objetivo, contenido, fuentes, diagramas y criticidad
(**Imprescindible** / **Recomendable** / **Opcional**).

---

### Capítulo 1 — Introducción y contexto del proyecto · **Imprescindible**

- **Objetivo:** situar al lector: qué problema aborda el sistema, para quién y con qué alcance.
- **Contenido esperado:** descripción de la organización, problema de negocio, objetivos del
  sistema, alcance incluido y **excluido**, glosario de términos del dominio.
- **Importancia:** es el capítulo que un evaluador académico lee primero y con el que juzga la
  coherencia del resto.
- **Información concreta a documentar:** PerliNor como fábrica de materiales para la construcción,
  10 empleados en 5 rubros (§0.2); el problema del papeleo disperso, **ilustrado con las planillas
  actuales de la empresa** (§0.7); los 5 roles; la **delimitación explícita del alcance entregado**;
  **la frase que lo justifica: el cliente priorizó el módulo de ventas** (A-05); el glosario que
  unifique «producto terminado» / «material» / «finished product».
- **Fuentes:** información del autor (§0.1, §0.2) · `Documentacion/Trabajo actual Perlinor/`
  (figura del problema) · `Documentacion/Reunion *` y `Estimación de Tiempos y Presupuesto`
  (referencia) · [CONTEXT.md](CONTEXT.md) §1 **solo para el enunciado de propósito y roles**, nunca
  para el alcance (R-09).
- **Diagramas:** ninguno, o un diagrama de contexto (nivel 1 de C4) muy simple.
- **Nota de redacción:** este capítulo es el que más se beneficia de que el caso sea **real**
  (A-03). Un problema con evidencia material —las planillas— y un requerimiento explícito del
  cliente —priorizar ventas— sostienen por sí solos la delimitación del alcance, sin necesidad de
  justificarla como limitación.

---

### Capítulo 2 — Metodología y proceso de desarrollo · **Recomendable**

- **Objetivo:** justificar cómo se llegó al producto, no solo qué es.
- **Contenido:** enfoque incremental por fases verificable en el historial de Git; práctica de
  «auditar el código antes de planificar» evidenciada en los documentos `PLAN_*.md`; uso de CI.
- **Información concreta:** 38 commits agrupados en fases (`F0`–`F6`, «fix N», features);
  los 5 documentos de planificación previos a cada bloque de trabajo; el flujo `dev` → `master`.
- **Fuentes:** historial de Git · [.github/workflows/ci.yml](.github/workflows/ci.yml) ·
  `Documentacion/Reunion 1`, `Reunion 2` y `Reunion general` (relevamiento con el cliente) ·
  `Documentacion/Estimación de Tiempos y Presupuesto` (planificación original) · los `PLAN_*.md`
  **como fuente de consulta, no como anexo** (B-07: quedan fuera de la entrega; marcados como
  históricos en §0.8).
- **Contenido obligatorio (A-10):** el **cronograma de desarrollo** de las dos etapas pedidas
  —MVP Demo de Venta y Reportes y gráficos—, breve y resumido. **Ya reconstruido en §0.5 de esta
  guía con las fechas reales de los commits**: es material listo para transcribir.
- **Diagramas:** línea de tiempo de las dos etapas (opcional; una tabla alcanza).
- **Nota:** este capítulo es un **diferencial real para una PPS**: la trazabilidad
  planificación → implementación está documentada en el propio repositorio, y el cronograma no es
  una estimación sino el registro verificable de lo que efectivamente ocurrió.

---

### Capítulo 3 — Requerimientos · **Imprescindible**

- **Objetivo:** enunciar qué debe hacer el sistema, de forma verificable.
- **Contenido:** requerimientos funcionales (RF) derivados de las 20 fichas de §6;
  requerimientos no funcionales (RNF) **demostrables en el código**.
- **RNF con evidencia real disponible:** seguridad (RBAC, bcrypt, hash de tokens de reset,
  anti-enumeración, rate limiting), integridad transaccional, precisión decimal, localización
  es-AR/ARS, trazabilidad (auditoría), rendimiento (paginación server-side y topes de reporte),
  usabilidad (búsqueda con umbral, filtros por defecto al día en curso).
- **Fuentes:** §6 de esta guía + el código citado en cada ficha.
- **Diagramas:** ninguno.
- **Advertencia:** no inventar RNF sin respaldo (p. ej. no hay métricas de rendimiento medidas
  → si se enuncian, marcarlas como objetivo, no como resultado).

---

### Capítulo 4 — Arquitectura del sistema · **Imprescindible**

- **Objetivo:** explicar cómo está construido y por qué.
- **Contenido:** patrón arquitectónico, vista de despliegue lógico, capas del backend,
  capas del frontend, comunicación entre ambos, decisiones arquitectónicas con su justificación.
- **Información concreta:** §3.1 a §3.11 de esta guía; el contrato `{ data, meta }`;
  la cadena de middlewares; el catálogo de errores.
- **Fuentes:** [app.ts](erp-backend/src/app.ts), [server.ts](erp-backend/src/server.ts),
  [config/](erp-backend/src/config/), [shared/](erp-backend/src/shared/),
  [app.config.ts](erp-frontend/src/app/app.config.ts), [app.routes.ts](erp-frontend/src/app/app.routes.ts).
- **Diagramas:** **D1** (arquitectura general), **D2** (componentes del backend),
  **D3** (componentes del frontend), **D8** (despliegue). Ver §9.
- **Sección recomendada — «Registro de decisiones arquitectónicas»:** el proyecto tiene
  decisiones documentadas y justificadas que dan mucho valor académico:
  monolito modular vs. microservicios; Signals vs. NgRx; Prisma vs. SQL directo;
  tabla `PasswordResetToken` vs. JWT de reset (con la tabla comparativa de
  [PLAN_LOGIN_Y_BUSQUEDA.md](PLAN_LOGIN_Y_BUSQUEDA.md) §2.1); eliminación de BullMQ/Redis por no
  usarse; agregación temporal en JS en lugar de `date_trunc`.

---

### Capítulo 5 — Modelo de datos · **Imprescindible**

- **Objetivo:** documentar la estructura de persistencia y sus reglas.
- **Contenido:** DER, diccionario de datos de las entidades **con código**, convenciones de
  modelado, estrategia de migraciones, borrado lógico, tipos decimales.
- **Información concreta:** las 22 entidades separadas en «con implementación» (15) y
  «diseñadas para el alcance completo» (10); las 3 migraciones; la justificación de
  `Decimal(12,2)` / `Decimal(12,3)`; los índices declarados; el uso de `Json` en `AuditLog`.
- **Fuentes:** [schema.prisma](erp-backend/prisma/schema.prisma),
  [prisma/migrations/](erp-backend/prisma/migrations/), [seed.ts](erp-backend/prisma/seed.ts).
- **Diagramas:** **D4** (DER completo, con las entidades sin implementar marcadas visualmente),
  opcionalmente **D4b** (DER reducido al núcleo implementado).
- **Decisión pendiente:** ver §14, D2.

---

### Capítulo 6 — Seguridad · **Imprescindible**

- **Objetivo:** demostrar que la seguridad fue diseñada, no improvisada.
- **Contenido:** autenticación JWT de dos tokens; RBAC; almacenamiento de contraseñas;
  flujo de recuperación; endurecimiento HTTP; validación de entrada; limitaciones conocidas.
- **Información concreta y de alto valor académico:**
  - Anti-enumeración de cuentas: respuesta idéntica en `forgot-password`.
  - Persistencia del **SHA-256** del token, nunca el token en claro.
  - Consumo **atómico** del token (`updateMany where usedAt: null`) contra replay concurrente.
  - Rate limiting diferenciado: 1000/15 min global vs. 5/15 min en recuperación.
  - Doble validación (guard de UI + `requirePermission` en el servidor).
  - **Limitaciones declaradas honestamente:** un reset no invalida las sesiones abiertas
    (JWT stateless); tokens en `localStorage` (exposición a XSS); sin CSRF token (no aplica al
    esquema Bearer, pero conviene decirlo).
- **Fuentes:** [auth.service.ts](erp-backend/src/modules/auth/auth.service.ts),
  [auth.middleware.ts](erp-backend/src/modules/auth/auth.middleware.ts),
  [permission.ts](erp-backend/src/shared/middlewares/permission.ts),
  [auth.routes.ts](erp-backend/src/modules/auth/auth.routes.ts),
  [app.ts](erp-backend/src/app.ts), [CONTEXT.md](CONTEXT.md) §8.
- **Diagramas:** **D6** (secuencia de login + refresh), **D7** (secuencia de recuperación de contraseña).

---

### Capítulo 7 — Implementación del backend · **Imprescindible**

- **Objetivo:** explicar la organización interna y los patrones, sin inventariar archivos.
- **Contenido:** anatomía de un módulo vertical; middlewares transversales; utilidades
  compartidas; convenciones de código.
- **Información concreta:** el patrón `routes → controller → service → dto` con **un módulo de
  referencia** desarrollado en detalle (recomendado: `customers`, por ser el CRUD más limpio);
  `validate(schema, source)`; `getPagination`/`buildMeta`; `parseDay`/`parseDateRange`
  (unificados para que dos pantallas no interpreten distinto el mismo rango);
  `writeAuditLog` (nunca lanza: un fallo de auditoría no debe tumbar la operación).
- **Fuentes:** [shared/](erp-backend/src/shared/), [customers/](erp-backend/src/modules/commercial/customers/).
- **Diagramas:** ninguno obligatorio; opcional un diagrama de paquetes.
- **Regla editorial:** documentar **patrones**, no archivos. Un módulo explicado a fondo vale más
  que doce descritos por encima.

---

### Capítulo 8 — El núcleo transaccional: venta y anulación · **Imprescindible**

> Capítulo propio. Es la pieza técnicamente más rica del sistema y donde se concentra el mérito
> de ingeniería.

- **Objetivo:** explicar cómo se garantiza la consistencia del stock y de la caja bajo concurrencia.
- **Contenido:**
  - Los 5 pasos de `create()` y por qué están en ese orden.
  - **Congelamiento de precio**: el precio se toma de `salePrice` dentro de la transacción, de
    modo que un cambio de lista posterior no altera ventas ya registradas.
  - **Descuento atómico condicional**: `UPDATE ... WHERE current_stock >= required`; si
    `count === 0` → 422 y rollback total. Por qué la lectura previa **no** es el guardián real
    y por qué esto evita el *lost update*.
  - Agregación de cantidades por producto para soportar líneas repetidas.
  - Cálculo con `decimal.js` y por qué no con `number`.
  - Efectos colaterales: movimiento `OUT` por línea + asiento de caja + actualización del saldo.
  - `cancel()` como inverso exacto, con su propio guard atómico de estado.
- **Evidencia empírica disponible:** el test
  «ante dos ventas simultáneas que exceden el stock, solo una se confirma»
  ([sales-flow.test.ts](erp-backend/tests/sales-flow.test.ts)) **demuestra** la afirmación.
  Citarlo es lo que convierte una promesa en un resultado verificado.
- **Fuentes:** [sales.service.ts](erp-backend/src/modules/commercial/sales/sales.service.ts),
  [sales-flow.test.ts](erp-backend/tests/sales-flow.test.ts).
- **Diagramas:** **D5** (secuencia de registro de venta), **D9** (actividad de venta con caminos
  de error), **D10** (actividad de anulación).

---

### Capítulo 9 — Reportería · **Recomendable**

- **Objetivo:** mostrar un diseño extensible resuelto con criterio.
- **Contenido:** el contrato `ReportDefinition` / `RegisteredReport`; separación entre
  **definición** (qué datos), **writer** (qué formato) y **controller** (transporte);
  el catálogo por clave; el patrón `limit + 1` para detectar excesos sin cargar todo;
  el orden estricto «resolver antes de escribir headers» para poder responder JSON ante error.
- **Información concreta:** cómo agregar un reporte nuevo (una definición, sin tocar rutas ni
  writer); el tope de 20 000 filas; el detalle de `X-Report-Rows` y `Content-Disposition`
  expuestos por CORS; la compensación de zona horaria para Excel; el logo y su advertencia de despliegue.
- **Fuentes:** [report-types.ts](erp-backend/src/modules/reports/report-types.ts),
  [reports.service.ts](erp-backend/src/modules/reports/reports.service.ts),
  [reports.controller.ts](erp-backend/src/modules/reports/reports.controller.ts),
  [excel-writer.ts](erp-backend/src/modules/reports/excel-writer.ts),
  [sales-by-period.ts](erp-backend/src/modules/reports/definitions/sales-by-period.ts).
- **Diagramas:** diagrama de clases **acotado a este subsistema** (uno de los pocos lugares donde
  un diagrama de clases aporta valor real — ver §9, D11).

---

### Capítulo 10 — Implementación del frontend · **Imprescindible**

- **Objetivo:** explicar la arquitectura de la SPA y sus patrones.
- **Contenido:** componentes standalone + `OnPush` + Signals; lazy loading por feature;
  `ApiService` como única puerta HTTP; interceptores; guards; formularios reactivos;
  componentes compartidos; sistema de diseño.
- **Información concreta:**
  - Por qué Signals y no NgRx (tamaño de la aplicación).
  - `DataTableComponent` como pieza reutilizada por **6 pantallas**, con paginación server-side,
    debounce de 300 ms y modo `searchRequired`.
  - `provideAppInitializer` para restaurar la sesión antes del primer render.
  - Manejo de errores en dos niveles: toast global + mensaje inline en pantallas de auth.
  - Los `Decimal` como string y por qué el frontend **no** recalcula totales de forma autoritativa.
- **Fuentes:** [core/](erp-frontend/src/app/core/), [shared/](erp-frontend/src/app/shared/),
  [app.routes.ts](erp-frontend/src/app/app.routes.ts), [styles.css](erp-frontend/src/styles.css),
  [tailwind.config.js](erp-frontend/tailwind.config.js).
- **Diagramas:** **D3** (componentes del frontend), **D12** (mapa de navegación y permisos).

---

### Capítulo 11 — API REST · **Imprescindible**

- **Objetivo:** servir de referencia del contrato.
- **Contenido:** convenciones (prefijo `/api`, sobre `{data, meta}`, códigos de estado, esquema
  Bearer, paginación, búsqueda, filtros de fecha) + tabla de los 45 endpoints (§5.2) +
  detalle de **request/response** de los 6 endpoints centrales.
- **Endpoints a detallar completos:** `POST /auth/login`, `POST /commercial/sales`,
  `PATCH /commercial/sales/:id/cancel`, `POST /inventory/finished-products/:id/movements`,
  `GET /dashboard/sales-series`, `GET /reports/sales-by-period/excel`.
- **Fuentes:** archivos `*.routes.ts` y `*.dto.ts`; [demo.http](erp-backend/demo.http) como
  ejemplos reales ya escritos.
- **Diagramas:** ninguno; tablas.
- **Reglas editoriales:**
  1. **No** documentar los 5 módulos stub como si fueran endpoints. Con D1=A1, ni siquiera se
     mencionan acá: van al Cap. 15.
  2. **Excluir los 5 endpoints de `/api/employees`** (n.º 15 a 19 de §5.2), por D5=G3. La tabla
     del capítulo documenta entonces **40 endpoints**, no 45.

---

### Capítulo 12 — Calidad y pruebas · **Imprescindible**

- **Objetivo:** demostrar que el sistema fue verificado.
- **Contenido:** estrategia (integración sobre unidad en backend; componente con HTTP mockeado en
  frontend); herramientas; qué cubre cada suite; integración continua.
- **Información concreta:** 38 casos backend / 26 frontend; las guardas de `tests/setup.ts` que
  impiden correr contra la base de desarrollo; base `erp_test` separada; el job de CI con servicio
  Postgres; los tres tests que verifican reglas de negocio no triviales
  (rollback ante stock insuficiente, concurrencia de dos ventas, saldo de caja independiente del filtro).
- **Fuentes:** [tests/](erp-backend/tests/), [vitest.config.ts](erp-backend/vitest.config.ts),
  [.env.test.example](erp-backend/.env.test.example), specs del frontend,
  [.github/workflows/ci.yml](.github/workflows/ci.yml), [PLAN_TESTING.md](PLAN_TESTING.md).
- **Diagramas:** ninguno.
- **Honestidad requerida:** no hay medición de cobertura publicada. Si se incluye un porcentaje,
  debe generarse y citarse; si no, decir qué se cubrió sin dar números inventados.

---

### Capítulo 13 — Instalación, configuración y ejecución · **Imprescindible**

- **Objetivo:** que un tercero pueda levantar el sistema.
- **Contenido:** requisitos, instalación, variables de entorno, base de datos, seed, ejecución,
  build, puertos, verificación.
- **Detalle en §11.A** de esta guía.
- **Fuentes:** [README.md](README.md), [erp-backend/README.md](erp-backend/README.md),
  [erp-frontend/README.md](erp-frontend/README.md), [docker-compose.yml](docker-compose.yml),
  [.env.example](erp-backend/.env.example).
- **Diagramas:** ninguno.

---

### ~~Capítulo 14 — Despliegue y operación~~ · **ELIMINADO (D4 = E1)**

> **Decisión cerrada:** el capítulo **no se escribe**. El repositorio no contiene ningún
> artefacto de despliegue (sin `Dockerfile`, sin `nginx.conf`, sin scripts, sin pipeline de
> release) y el sistema se presenta en `localhost` (A-08), de modo que un capítulo de despliegue
> describiría algo que no ocurrió. También se elimina el diagrama **D8**.
>
> **Lo que sí se conserva, reubicado:** el Cap. 13 (instalación y ejecución local) pasa a ser el
> único capítulo operativo y **gana importancia**, porque es el que permite reproducir la
> demostración. Dentro de él conviene mantener dos notas técnicas reales, que no son despliegue
> sino comportamiento del sistema: el apagado ordenado ante SIGINT/SIGTERM
> ([server.ts](erp-backend/src/server.ts)) y la advertencia de que `assets/` queda fuera de
> `dist/` al compilar ([erp-backend/README.md](erp-backend/README.md)).
>
> La infraestructura declarada en [CONTEXT.md](CONTEXT.md) §10 (VPS, Nginx, Backblaze B2) se
> menciona **en una línea** dentro del Cap. 15, como trabajo futuro.

---

### Capítulo 15 — Limitaciones conocidas y trabajo futuro · **Imprescindible**

- **Objetivo:** cerrar con honestidad técnica. En un trabajo académico, este capítulo suma
  credibilidad en vez de restarla.
- **Contenido:** el alcance no implementado (§5.7) con su justificación; las limitaciones
  técnicas declaradas; la hoja de ruta.
- **Fuentes:** [ROADMAP_POST_MVP.md](ROADMAP_POST_MVP.md), §13 de esta guía,
  [CONTEXT.md](CONTEXT.md) §8 (limitación de refresh tokens).

---

### Anexos · **Recomendable**

- **A.** Glosario de términos del dominio.
- **B.** Catálogo completo de permisos (41) y matriz rol × permiso.
- **C.** Diccionario de datos completo.
- **D.** Matriz de trazabilidad (§11).
- **E.** Catálogo de mensajes al usuario y errores (insumo compartido con el manual — §8.11).

---

## 8. Flujos funcionales a documentar

Para cada caso de uso: actor, precondiciones, disparo, pasos, decisiones, validaciones,
interacciones, resultado, errores, estado final. Se listan aquí los flujos identificados y el
tipo de diagrama recomendado.

### CU-01 — Iniciar sesión

| Elemento | Contenido |
|---|---|
| Actor | Cualquier usuario registrado y activo |
| Precondiciones | Backend y base disponibles; usuario existente con `isActive = true` |
| Disparo | Ingreso a cualquier URL protegida sin sesión, o navegación directa a `/login` |
| Pasos | 1) `authGuard` redirige a `/login?returnUrl=...` · 2) el usuario completa email y contraseña · 3) `POST /auth/login` · 4) se guardan los tokens · 5) `GET /auth/me` carga el perfil en el signal · 6) redirección al `returnUrl` o a `/dashboard` |
| Decisiones | ¿Ya hay sesión activa? → redirige sin mostrar el formulario |
| Validaciones | Email con formato, contraseña presente; backend: usuario activo + `bcrypt.compare` |
| Interacciones | `AuthService`, `localStorage`, `jwtInterceptor` |
| Resultado | Shell autenticado con el menú filtrado por permisos |
| Errores | 401 → «Email o contraseña incorrectos.»; otro → «No se pudo iniciar sesión. Intentá nuevamente.» |
| Estado final | Sesión activa, tokens en `localStorage` |
| **Diagrama** | **Secuencia** (D6) |

### CU-02 — Recuperar la contraseña

| Elemento | Contenido |
|---|---|
| Actor | Usuario que olvidó su contraseña |
| Precondiciones | SMTP configurado para que el mail llegue (en desarrollo, Mailpit) |
| Disparo | Enlace «¿Olvidaste tu contraseña?» en el login |
| Pasos | 1) ingresa el email · 2) `POST /auth/forgot-password` · 3) mensaje genérico · 4) abre el mail y hace clic en el enlace · 5) `/reset-password?token=` valida el token · 6) ingresa y confirma la contraseña nueva · 7) `POST /auth/reset-password` · 8) vuelve al login |
| Decisiones | Token ausente/inválido/vencido/usado → pantalla «enlace inválido» sin pedir contraseña |
| Validaciones | Email con formato; contraseña ≥ 8 caracteres; confirmación coincidente |
| Interacciones | `nodemailer` → SMTP; tabla `password_reset_tokens`; `AuditLog` |
| Resultado | Contraseña actualizada; los demás tokens del usuario se eliminan |
| Errores | 429 → «Hiciste demasiados intentos…»; 400 → «El enlace de recuperación es inválido o expiró» |
| Estado final | El usuario puede iniciar sesión con la contraseña nueva; **las sesiones ya abiertas siguen vigentes** |
| **Diagrama** | **Secuencia** (D7), con los cuatro participantes: usuario, SPA, API, servidor de correo |

### CU-03 — Preparar un material para la venta

| Elemento | Contenido |
|---|---|
| Actor | Administración o Stock |
| Precondiciones | Sesión activa con `inventory.create` / `inventory.update` |
| Disparo | Necesidad de incorporar un material nuevo al catálogo |
| Pasos | 1) `/inventory/finished-products` → «Nuevo» · 2) completa SKU, nombre, categoría, unidad, precio (si falta la categoría, la crea desde el mismo formulario) · 3) guarda: el material nace con **stock 0** · 4) abre el diálogo de stock · 5) registra un movimiento `IN` con la cantidad inicial |
| Decisiones | Movimiento `IN` (suma) vs. `ADJUST` (fija el valor) |
| Validaciones | SKU único; nombre ≥ 2; categoría existente; precio ≥ 0; cantidad > 0 |
| Interacciones | `Category`, `FinishedProduct`, `FinishedProductMovement`, `AuditLog` |
| Resultado | Material activo con stock disponible |
| Errores | 409 «El SKU ya fue registrado»; 400 «La categoría indicada no existe» |
| Estado final | El material aparece en el selector del formulario de venta |
| **Diagrama** | **Actividad** (D13) |

### CU-04 — Registrar una venta · *flujo central del sistema*

| Elemento | Contenido |
|---|---|
| Actor | Administración o Ventas |
| Precondiciones | Sesión con `commercial.create`; al menos un cliente activo; al menos un material activo con stock; **caja de ventas configurada** |
| Disparo | «Nueva venta» |
| Pasos | 1) selecciona cliente y medio de pago · 2) agrega líneas (material + cantidad); la pantalla previsualiza subtotal y total con `decimal.js` · 3) confirma · 4) `POST /commercial/sales` · 5) **transacción**: valida cliente → valida caja → agrega cantidades por producto → prevalida existencia/estado/stock → **descuenta stock de forma atómica y condicional** → crea `Sale` + `SaleDetail` con precio congelado → genera un movimiento `OUT` por línea → registra el ingreso en caja y actualiza el saldo · 6) `AuditLog` · 7) redirección al detalle |
| Decisiones | ¿Cliente activo? ¿Caja configurada? ¿Producto existente y activo? ¿Stock suficiente **en el momento del UPDATE**? |
| Validaciones | Zod: `customerId` UUID, `paymentMethod` del enum, ≥ 1 ítem, cantidades > 0 |
| Interacciones | `Customer`, `FinishedProduct`, `FinishedProductMovement`, `Sale`, `SaleDetail`, `CashRegister`, `CashMovement`, `AuditLog` |
| Resultado | Venta `CONFIRMED`, stock descontado, caja incrementada, traza de auditoría |
| Errores | 400 «El cliente no existe o está inactivo» · 400 «No hay una caja de ventas configurada» · 400 «Producto inexistente o inactivo» · **422 «Stock insuficiente para X (disponible …, requerido …)» con rollback total** |
| Estado final | Sistema consistente: nunca queda una venta sin descuento de stock ni un descuento sin venta |
| **Diagrama** | **Secuencia** (D5) **y** **actividad con caminos de error** (D9). Este es el único flujo que justifica dos diagramas. |

### CU-05 — Anular una venta

| Elemento | Contenido |
|---|---|
| Actor | Administración o Ventas |
| Precondiciones | Venta en estado `CONFIRMED` |
| Disparo | Botón «Anular» en el detalle |
| Pasos | 1) confirmación explícita · 2) `PATCH /commercial/sales/:id/cancel` · 3) **transacción**: guard atómico de estado → repone stock por producto → genera movimientos `IN` de reversión → genera movimiento de caja negativo y decrementa el saldo · 4) `AuditLog` con `oldValues`/`newValues` |
| Decisiones | ¿Sigue `CONFIRMED`? (protege contra anulaciones simultáneas) |
| Validaciones | Estado de la venta |
| Interacciones | Las mismas entidades que CU-04, en sentido inverso |
| Resultado | Venta `CANCELLED`, stock repuesto, caja revertida |
| Errores | 404 «Venta no encontrada» · 422 «Solo se pueden anular ventas confirmadas» / «La venta ya no está confirmada» |
| Estado final | La venta deja de computar en dashboard, caja y reportes |
| **Diagrama** | **Actividad** (D10) |

### CU-06 — Consultar la caja de ventas

| Elemento | Contenido |
|---|---|
| Actor | Administración o Finanzas |
| Precondiciones | Sesión con `finance.read` |
| Disparo | Menú «Caja de ventas» |
| Pasos | 1) `GET /finance/sales-cash` (saldo) · 2) `GET /finance/sales-cash/movements` acotado al día · 3) el usuario puede ampliar el rango o restablecerlo · 4) desde un movimiento con venta asociada puede navegar a su detalle |
| Decisiones | Rango de fechas |
| Validaciones | Fechas normalizadas a inicio/fin de día |
| Interacciones | `CashRegister`, `CashMovement`, `Sale` |
| Resultado | Saldo acumulado + movimientos del período |
| Errores | 404 «No hay una caja de ventas configurada» (si no se ejecutó el seed) |
| Estado final | Solo consulta |
| **Diagrama** | Ninguno. Un flujo de solo lectura no justifica un diagrama. |

### CU-07 — Generar el reporte de ventas

| Elemento | Contenido |
|---|---|
| Actor | Administración o Finanzas |
| Precondiciones | Sesión con `reports.read` |
| Disparo | Menú «Reportes» |
| Pasos | 1) el período viene precargado con el mes en curso · 2) opcionalmente filtra por cliente · 3) «Descargar» → `GET /reports/sales-by-period/excel` · 4) el backend valida filtros, consulta y **luego** escribe headers y streamea · 5) el navegador descarga · 6) la pantalla informa cuántas líneas trajo |
| Decisiones | ¿0 filas? → mensaje informativo, pero el archivo igual se descarga |
| Validaciones | Formato de fecha; `from <= to` (inline y en el backend); tope de 20 000 filas |
| Interacciones | `SaleDetail`, `Sale`, `Customer`, `FinishedProduct`, `User` |
| Resultado | Archivo `.xlsx` con logo, encabezado, autofiltro y totales |
| Errores | 400 por filtros inválidos · 422 por exceso de filas · el toast lee el error aunque venga como `Blob` |
| Estado final | Archivo en el equipo del usuario |
| **Diagrama** | **Secuencia** (D14), útil porque muestra el orden «resolver antes de escribir» |

### CU-08 — Consultar la auditoría

| Elemento | Contenido |
|---|---|
| Actor | Administración |
| Precondiciones | Sesión con `audit.read` |
| Disparo | Menú «Auditoría» |
| Pasos | 1) grilla acotada al día · 2) filtra por entidad, acción y fechas · 3) abre el detalle de un asiento y ve el diff JSON |
| Decisiones | Filtros |
| Validaciones | Acción restringida al conjunto conocido |
| Interacciones | `AuditLog`, `User` |
| Resultado | Trazabilidad de operaciones críticas |
| Errores | 404 en el detalle si el asiento no existe |
| Estado final | Solo consulta |
| **Diagrama** | Ninguno |

### CU-09 — Alta de usuario y asignación de rol

| Elemento | Contenido |
|---|---|
| Actor | Administración |
| Precondiciones | Sesión con `users.create` |
| Disparo | Menú «Usuarios» → «Nuevo» |
| Pasos | 1) completa nombre, email, contraseña y rol · 2) `POST /users` · 3) el usuario queda activo |
| Decisiones | Rol asignado → determina el menú y las acciones disponibles |
| Validaciones | Email único y con formato; contraseña ≥ 8; rol obligatorio |
| Interacciones | `User`, `Role`, `AuditLog` |
| Resultado | Usuario habilitado |
| Errores | 409 «El email ya está registrado» |
| Estado final | El nuevo usuario puede iniciar sesión |
| **Diagrama** | Ninguno; alcanza con la matriz rol × permiso (D12) |

**Resumen de diagramas por flujo:**

| Flujo | Diagrama recomendado | Justificación |
|---|---|---|
| CU-01 | Secuencia | Muestra la interacción entre 4 participantes |
| CU-02 | Secuencia | Involucra un servicio externo (correo) |
| CU-03 | Actividad | Tiene una decisión relevante (IN vs. ADJUST) |
| **CU-04** | **Secuencia + Actividad** | Núcleo del sistema; concurrencia y errores |
| CU-05 | Actividad | Reversión con guard de estado |
| CU-06, CU-08, CU-09 | **Ninguno** | Flujos lineales de consulta o ABM |
| CU-07 | Secuencia | El orden de las operaciones es el aporte técnico |

---

# Parte III — Diseño del manual de usuario

## 9. Índice propuesto del manual de usuario

**Público objetivo:** usuario final sin conocimientos técnicos + docente evaluador.
**Principio rector:** el manual describe **cómo usar**, nunca **cómo está hecho**. Ninguna
mención a endpoints, tablas, JWT, transacciones ni nombres de archivo.

**Nomenclatura obligatoria [HC]:** el manual debe usar **exclusivamente** los términos que
aparecen en pantalla — «Materiales» (no «productos terminados» ni «finished products»),
«Caja de ventas», «Dar de baja» (no «eliminar»), «Anular».

---

### Capítulo 1 — Presentación del sistema

- **Objetivo:** que el lector entienda qué es y para qué sirve antes de tocar nada.
- **Destinatario:** todos.
- **Cubre:** propósito, alcance funcional en lenguaje de negocio, mapa de módulos.
- **Debe explicar previamente:** nada.
- **Capturas:** C-01 (pantalla de inicio con el menú desplegado, como panorámica).
- **Mensajes/validaciones:** ninguno.

### Capítulo 2 — Requisitos y acceso

- **Objetivo:** que el usuario pueda entrar.
- **Destinatario:** todos.
- **Cubre:** F01.
- **Pasos:** abrir el navegador → dirección del sistema → ingresar email y contraseña → «Ingresar».
- **Debe conocer previamente:** su email y contraseña, provistos por el administrador.
- **Capturas:** C-02 (login vacío), C-03 (login con error de credenciales).
- **Mensajes:** «Email o contraseña incorrectos.» · «No se pudo iniciar sesión. Intentá nuevamente.»
- **Advertencia:** describir el campo de contraseña **sin** reproducir credenciales reales
  (ver §13, riesgo R-08).

### Capítulo 3 — Recuperación de contraseña

- **Objetivo:** resolver el olvido de contraseña sin intervención del administrador.
- **Destinatario:** todos.
- **Cubre:** F02, F03.
- **Pasos:** «¿Olvidaste tu contraseña?» → email → revisar correo → clic en el enlace →
  contraseña nueva + confirmación → «Guardar» → iniciar sesión.
- **Debe conocer previamente:** acceso a su casilla de correo.
- **Capturas:** C-04 (formulario), C-05 (confirmación genérica), C-06 (formulario de contraseña
  nueva), C-07 (enlace vencido).
- **Mensajes a explicar:**
  - «Si el email está registrado, vas a recibir un mensaje…» → **explicar por qué el sistema no
    confirma si el email existe** (es una medida de seguridad, no un error).
  - «El enlace de recuperación es inválido o expiró» → el enlace dura 30 minutos y sirve una sola vez.
  - «Hiciste demasiados intentos. Esperá unos minutos…» → límite de 5 intentos cada 15 minutos.
  - **Aclaración honesta:** cambiar la contraseña no cierra las sesiones ya abiertas en otros equipos.

### Capítulo 4 — Recorrido por la interfaz

- **Objetivo:** que el usuario se oriente.
- **Destinatario:** todos.
- **Cubre:** layout general.
- **Explica:** menú lateral y su botón de colapso; barra superior con el email y el menú de
  usuario; área de contenido; **los avisos emergentes (toasts)**; los diálogos de confirmación;
  el patrón común de las grillas (buscador, paginador, columna de acciones).
- **Debe conocer previamente:** nada.
- **Capturas:** C-08 (layout con las zonas señaladas), C-09 (grilla genérica con buscador,
  paginador y acciones marcados), C-10 (ejemplo de aviso de éxito), C-11 (diálogo de confirmación).
- **Concepto clave a explicar aquí una sola vez:** *«En Clientes, Materiales y Usuarios la grilla
  aparece vacía a propósito: escribí al menos 2 letras en el buscador para ver resultados.»*
  Sin esta explicación, un usuario nuevo concluye que el sistema no tiene datos.

### Capítulo 5 — Pantalla de inicio

- **Objetivo:** interpretar los indicadores.
- **Destinatario:** todos.
- **Cubre:** F05, F06.
- **Explica:** cada KPI y su período; el top de clientes; la lista de stock más bajo; el gráfico
  y su selector Día/Semana/Mes.
- **Debe conocer previamente:** nada.
- **Capturas:** C-12 (panel completo con datos), C-13 (gráfico con el selector y un tooltip abierto).
- **Aclaraciones necesarias:** las ventas anuladas **no** se cuentan en ningún indicador;
  «stock bajo» son los 5 materiales con menos stock, **no** materiales por debajo de un mínimo
  configurado.

### Capítulo 6 — Clientes

- **Objetivo:** administrar el padrón de clientes.
- **Destinatario:** Administración, Ventas.
- **Cubre:** F07.
- **Pasos:** buscar · dar de alta · editar · dar de baja.
- **Debe conocer previamente:** qué datos del cliente son obligatorios (solo el nombre).
- **Capturas:** C-14 (listado en estado inicial vacío con el mensaje guía), C-15 (listado con
  resultados), C-16 (formulario de alta), C-17 (confirmación de baja).
- **Mensajes:** «Cliente creado.» · «Cliente actualizado.» · «Cliente dado de baja.» ·
  «No se encontraron clientes para esa búsqueda.»
- **Aclaración importante:** «dar de baja» **no borra** al cliente; sus ventas históricas se conservan.

### Capítulo 7 — Materiales y stock

- **Objetivo:** mantener el catálogo y las existencias.
- **Destinatario:** Administración, Stock, Producción.
- **Cubre:** F08, F09, F10.
- **Pasos:** buscar · alta (incluida la creación de categoría desde el mismo formulario) ·
  edición · **registrar movimiento de stock** · baja.
- **Debe conocer previamente:** qué es un SKU y que debe ser único; la unidad de medida que usa
  su empresa.
- **Capturas:** C-18 (listado con resultados y la columna Stock), C-19 (formulario de alta),
  C-20 (diálogo de nueva categoría), C-21 (**diálogo de movimiento de stock con el selector
  Ingreso/Ajuste**), C-22 (listado tras el movimiento, mostrando el stock actualizado).
- **Mensajes:** «Material creado.» · «Material actualizado.» · «Movimiento de stock registrado.» ·
  «Material dado de baja.» · «El SKU ya fue registrado» (409).
- **Explicación crítica — merece un recuadro destacado:**
  | Tipo | Efecto | Cuándo usarlo |
  |---|---|---|
  | **Ingreso (IN)** | **Suma** la cantidad al stock actual | Recepción de producción o compra |
  | **Ajuste (ADJUST)** | **Reemplaza** el stock por la cantidad indicada | Corrección tras un recuento físico |
  Confundirlos altera el inventario de forma silenciosa. Es la validación funcional más peligrosa
  del sistema y **debe explicarse con un ejemplo numérico**.
- **Aclaración:** las salidas de stock no se cargan a mano; las genera la venta.

### Capítulo 8 — Ventas · *capítulo principal del manual*

- **Objetivo:** registrar, consultar y anular ventas.
- **Destinatario:** Administración, Ventas.
- **Cubre:** F11, F12, F13, F14.
- **Pasos — registrar:** «Nueva venta» → cliente → medio de pago → agregar líneas
  (material + cantidad) → revisar el total previsualizado → «Registrar».
- **Pasos — consultar:** filtros de fecha (arranca en el día actual), estado y cliente;
  «Restablecer» vuelve al valor por defecto.
- **Pasos — anular:** detalle → «Anular» → confirmar.
- **Debe conocer previamente:** que el cliente y el material ya deben existir; que el precio lo
  toma el sistema del material y no se edita en la venta.
- **Capturas:** C-23 (formulario vacío), C-24 (formulario con dos líneas y el total calculado),
  C-25 (**mensaje de stock insuficiente**), C-26 (detalle de una venta confirmada),
  C-27 (diálogo de confirmación de anulación), C-28 (detalle de una venta anulada),
  C-29 (listado con filtros aplicados).
- **Mensajes y validaciones a explicar:**
  - «La venta debe tener al menos un ítem»
  - «Stock insuficiente para *Material* (disponible X, requerido Y)» → **explicar que la venta no
    se registró en absoluto y que el stock no se modificó**; el usuario debe corregir la cantidad
    o cargar stock.
  - «El cliente no existe o está inactivo»
  - «Venta anulada. Stock repuesto.»
  - «Solo se pueden anular ventas confirmadas»
- **Advertencias:** el precio queda **congelado** al momento de la venta; anular es
  **irreversible** y repone el stock y revierte la caja.

### Capítulo 9 — Caja de ventas

- **Objetivo:** consultar el movimiento de dinero originado en ventas.
- **Destinatario:** Administración, Finanzas.
- **Cubre:** F15.
- **Pasos:** consultar el saldo · ajustar el rango de fechas · abrir la venta asociada a un movimiento.
- **Debe conocer previamente:** que la caja se alimenta sola.
- **Capturas:** C-30 (saldo + movimientos del día), C-31 (movimiento negativo de una anulación).
- **Aclaración imprescindible:** **el saldo mostrado es el acumulado total y no cambia al filtrar
  por fechas**; el filtro afecta solo a la lista. Sin esta nota, el usuario reportará el
  comportamiento como un error.

### Capítulo 10 — Reportes

- **Objetivo:** obtener información exportable.
- **Destinatario:** Administración, Finanzas.
- **Cubre:** F16.
- **Pasos:** elegir período → (opcional) cliente → «Descargar» → abrir el archivo.
- **Debe conocer previamente:** manejo básico de una planilla de cálculo.
- **Capturas:** C-32 (pantalla de reportes con filtros), C-33 (**la planilla abierta en Excel**,
  mostrando logo, encabezado, autofiltro y totales).
- **Mensajes:** «Reporte generado con N línea(s) de venta.» · «No hay ventas confirmadas en el
  período. El archivo se descargó sin datos.» · «El reporte supera las 20.000 filas. Achicá el
  rango de fechas.»
- **Explicaciones de contenido:** una fila por **línea de venta** (una venta con 3 materiales
  ocupa 3 filas); «Cantidad de ventas» cuenta ventas, no filas; **las ventas anuladas no se incluyen**.

### Capítulo 11 — Administración: usuarios, roles y auditoría

- **Objetivo:** tareas exclusivas del administrador.
- **Destinatario:** Administración.
- **Cubre:** F17, F18, F19.
- **Pasos:** alta de usuario con rol · edición · baja · consulta de roles · consulta de auditoría.
- **Debe conocer previamente:** qué significa cada rol en su organización.
- **Capturas:** C-34 (listado de usuarios), C-35 (formulario de alta con el desplegable de roles),
  C-36 (formulario en edición, con el email deshabilitado), C-37 (pantalla de roles con permisos),
  C-38 (listado de auditoría con filtros), C-39 (detalle de un asiento con el diff).
- **Mensajes:** «Usuario creado.» · «Usuario actualizado.» · «Usuario dado de baja.» ·
  «El email ya está registrado» (409).
- **Explicaciones:** el email no se puede modificar después del alta; los roles y sus permisos
  **no se editan desde la aplicación**; la auditoría registra creaciones, modificaciones y bajas.

### Capítulo 12 — Preguntas frecuentes y solución de problemas

- **Objetivo:** resolver dudas recurrentes sin soporte técnico.
- **Destinatario:** todos.
- **Contenido propuesto (todo derivado del comportamiento real del sistema):**

| Situación | Explicación |
|---|---|
| «La lista aparece vacía» | En Clientes, Materiales y Usuarios hay que escribir al menos 2 letras en el buscador |
| «No veo un módulo en el menú» | El menú muestra solo lo habilitado para su rol; consultar al administrador |
| «Me pidió iniciar sesión de nuevo» | La sesión se renueva sola durante 7 días; pasado ese plazo hay que volver a ingresar |
| «El sistema dice que no hay stock» | La venta no se registró y el stock no cambió; corregir la cantidad o registrar un ingreso de stock |
| «No encuentro una venta de ayer» | El listado arranca filtrado al día actual; ampliar el rango de fechas |
| «El saldo de caja no coincide con la lista filtrada» | El saldo es acumulado total; el filtro afecta solo a la lista |
| «No me llegó el mail de recuperación» | Revisar correo no deseado; el sistema responde igual exista o no el email; se puede reintentar pasados unos minutos |
| «Di de baja algo por error» | La baja es lógica: el registro se conserva. Contactar al administrador |

- **Capturas:** ninguna nueva.

### Anexo — Glosario del manual

Términos en lenguaje de negocio: material, SKU, unidad de medida, stock, ingreso, ajuste, venta,
línea de venta, medio de pago, anulación, caja de ventas, movimiento, rol, permiso, auditoría,
baja lógica.

---

## 10. Capturas de pantalla recomendadas

39 capturas, cada una con función explicativa. Ninguna es decorativa.

| ID | Pantalla | Funcionalidad | Objetivo de la captura | Elementos a destacar | Momento en el procedimiento |
|---|---|---|---|---|---|
| C-01 | Inicio con menú | Panorámica | Presentar el sistema | Menú lateral completo | Cap. 1, apertura |
| C-02 | Login | F01 | Mostrar el punto de entrada | Campos y botón «Ingresar» | Cap. 2, paso 1 |
| C-03 | Login con error | F01 | Reconocer credenciales incorrectas | Mensaje de error inline | Cap. 2, errores |
| C-04 | Olvidé mi contraseña | F02 | Ubicar el formulario | Campo email + enlace de vuelta | Cap. 3, paso 1 |
| C-05 | Confirmación de envío | F02 | Explicar el mensaje genérico | Texto del aviso | Cap. 3, paso 2 |
| C-06 | Contraseña nueva | F03 | Mostrar los dos campos | Requisito de 8 caracteres | Cap. 3, paso 4 |
| C-07 | Enlace inválido | F03 | Reconocer un enlace vencido | Mensaje y acción sugerida | Cap. 3, errores |
| C-08 | Layout anotado | Interfaz | Nombrar cada zona | Sidebar, header, contenido, toast | Cap. 4, apertura |
| C-09 | Grilla anotada | Interfaz | Explicar el patrón común | Buscador, paginador, acciones | Cap. 4 |
| C-10 | Toast de éxito | Interfaz | Enseñar dónde aparecen los avisos | Esquina del aviso | Cap. 4 |
| C-11 | Diálogo de confirmación | Interfaz | Enseñar la confirmación previa | Botones Sí/No | Cap. 4 |
| C-12 | Panel de inicio | F05 | Interpretar los KPIs | Las 4 tarjetas + top clientes + stock bajo | Cap. 5 |
| C-13 | Gráfico con tooltip | F06 | Leer la evolución | Selector Día/Semana/Mes y tooltip | Cap. 5 |
| C-14 | Clientes — estado inicial | F07 | **Explicar la grilla vacía a propósito** | Mensaje «Ingresá al menos 2 caracteres…» | Cap. 6, paso 1 |
| C-15 | Clientes — resultados | F07 | Mostrar el listado | Columnas y acciones | Cap. 6, paso 2 |
| C-16 | Alta de cliente | F07 | Guiar el alta | Campos obligatorios | Cap. 6, alta |
| C-17 | Baja de cliente | F07 | Advertir antes de confirmar | Texto de la confirmación | Cap. 6, baja |
| C-18 | Materiales — listado | F08 | Mostrar catálogo y stock | Columnas Precio y Stock | Cap. 7, paso 1 |
| C-19 | Alta de material | F08 | Guiar el alta | SKU, categoría, unidad, precio | Cap. 7, alta |
| C-20 | Nueva categoría | F09 | Mostrar el atajo | Diálogo sobre el formulario | Cap. 7, alta |
| C-21 | **Movimiento de stock** | F10 | **Distinguir Ingreso de Ajuste** | Selector de tipo, cantidad, referencia | Cap. 7, movimiento |
| C-22 | Materiales tras el movimiento | F10 | Verificar el efecto | Columna Stock actualizada | Cap. 7, verificación |
| C-23 | Nueva venta — vacía | F11 | Presentar el formulario | Cliente, medio de pago, primera línea | Cap. 8, paso 1 |
| C-24 | Nueva venta — cargada | F11 | Mostrar el cálculo | Dos líneas, subtotal y total | Cap. 8, paso 3 |
| C-25 | **Stock insuficiente** | F11 | **Explicar el error más frecuente** | Toast con disponible y requerido | Cap. 8, errores |
| C-26 | Detalle de venta confirmada | F13 | Verificar el resultado | Cabecera, líneas, estado, total | Cap. 8, paso 4 |
| C-27 | Confirmación de anulación | F14 | Advertir el impacto | Texto «Se repondrá el stock…» | Cap. 8, anulación |
| C-28 | Detalle de venta anulada | F14 | Verificar el estado final | Estado «Anulada», botón deshabilitado | Cap. 8, anulación |
| C-29 | Ventas — listado filtrado | F12 | Enseñar los filtros | Fechas, estado, buscador, «Restablecer» | Cap. 8, consulta |
| C-30 | Caja de ventas | F15 | Leer saldo y movimientos | Tarjeta de saldo + grilla | Cap. 9 |
| C-31 | Caja — reversión | F15 | Reconocer un movimiento negativo | Importe negativo y descripción | Cap. 9 |
| C-32 | Reportes | F16 | Configurar la descarga | Filtros y botón | Cap. 10, paso 1 |
| C-33 | **Planilla generada** | F16 | **Mostrar el producto final** | Logo, encabezado, autofiltro, totales | Cap. 10, resultado |
| C-34 | Usuarios — listado | F18 | Mostrar el padrón | Columnas y estado | Cap. 11 |
| C-35 | Alta de usuario | F18 | Guiar el alta | Desplegable de roles | Cap. 11 |
| C-36 | Edición de usuario | F18 | **Explicar el email deshabilitado** | Campo email en gris | Cap. 11 |
| C-37 | Roles | F19 | Mostrar los permisos por rol | Lista de códigos | Cap. 11 |
| C-38 | Auditoría — listado | F17 | Enseñar los filtros | Entidad, acción, fechas | Cap. 11 |
| C-39 | Auditoría — detalle | F17 | Mostrar el diff | Valores anterior y nuevo | Cap. 11 |

**Reglas de producción de capturas [INF]:**

1. Usar **datos ficticios coherentes** (nombres de clientes y materiales verosímiles del rubro
   construcción), nunca datos reales ni los usuarios de demo del seed.
2. **Nunca capturar** la pantalla de login con las credenciales precargadas visibles (ver §13, R-08).
3. Capturar siempre a un mismo ancho de ventana para uniformidad.
4. Las capturas anotadas (C-08, C-09) deben llevar numeración de zonas referenciada en el texto.
5. Las capturas de estado de error (C-03, C-07, C-25) requieren provocar el error deliberadamente:
   documentar cómo reproducirlo para poder rehacerlas.

---

## 11. Requisitos previos y operación

### 11.A Para la documentación técnica

| Tema | Qué documentar | Fuente **[HC]** |
|---|---|---|
| Requisitos de software | Node.js ≥ 20.11.0, pnpm 9.x, Docker + Docker Compose, PostgreSQL 16 (provisto por Docker), navegador moderno | `engines`, [README.md](README.md) |
| Instalación | `pnpm install` desde la raíz (workspace único, lock compartido) | [README.md](README.md) |
| Infraestructura local | `docker compose up -d` → Postgres 5432, Adminer 8080, Mailpit SMTP 1025 / UI 8025 | [docker-compose.yml](docker-compose.yml) |
| Variables de entorno | Las 14 variables de `.env`, con su tipo, valor por defecto y obligatoriedad. **Con valores de ejemplo, jamás reales** | [environment.ts](erp-backend/src/config/environment.ts), [.env.example](erp-backend/.env.example) |
| Base de datos | `prisma generate` → `prisma migrate dev` → `db:seed`. Qué crea el seed | [README.md](README.md), [seed.ts](erp-backend/prisma/seed.ts) |
| Ejecución en desarrollo | `pnpm --filter erp-backend dev` (tsx watch, :3000) y `pnpm --filter erp-frontend start` (:4200) | `package.json` de cada paquete |
| Build | Backend `tsc` → `dist/` + **copiar `assets/` manualmente**; frontend `ng build` → `dist/erp-frontend` | [erp-backend/README.md](erp-backend/README.md), [angular.json](erp-frontend/angular.json) |
| Verificación | `GET /health`; login con el usuario administrador | [app.ts](erp-backend/src/app.ts) |
| Entorno de pruebas | `.env.test` con base `erp_test` **separada**; `db:test:setup`; guardas de `tests/setup.ts` | [.env.test.example](erp-backend/.env.test.example) |
| CI | Los dos jobs de GitHub Actions y qué valida cada uno | [.github/workflows/ci.yml](.github/workflows/ci.yml) |
| Ambientes | `development` / `test` / `production` (validados por Zod) y el `fileReplacements` de Angular | [environment.ts](erp-backend/src/config/environment.ts), [angular.json](erp-frontend/angular.json) |
| Despliegue | **Propuesto**, no implementado — ver Cap. 14 y §14 D4 | [CONTEXT.md](CONTEXT.md) §10 |
| Mantenimiento | Nuevas migraciones, re-seed idempotente, rotación de secretos JWT, backups | **[PC]** parcialmente |

### 11.B Para el manual de usuario

| Tema | Qué documentar |
|---|---|
| Requisitos para acceder | Un navegador web actualizado y conexión a la red donde está publicado el sistema. **Nada que instalar** |
| Dirección de acceso | **[PC]** — el autor debe indicar la URL con la que se presentará (o `http://localhost:4200` si la defensa es local) |
| Credenciales | Provistas por el administrador. El manual no publica contraseñas |
| Conocimientos previos | Uso básico de un navegador y de formularios web. Para el capítulo de reportes: apertura de un archivo `.xlsx` |
| Navegación inicial | Ingreso → panel de inicio → menú lateral filtrado por rol |
| Consideraciones de uso | La sesión se renueva sola; las bajas son lógicas; ciertas grillas exigen buscar; los listados operativos arrancan filtrados al día actual |

**Regla de separación:** nada de la columna 11.A aparece en el manual. Si un usuario final
necesita saber algo de instalación, es porque el sistema no está desplegado — y eso es un
problema de operación, no de manual.

---

## 12. Matriz de trazabilidad

### 12.1 Campos propuestos

A los seis campos solicitados se agregan cinco, cada uno con una justificación concreta:

| Campo | ¿Por qué? |
|---|---|
| ID | Referencia estable citable desde ambos documentos |
| Funcionalidad | — |
| Módulo | — |
| **Permiso requerido** | Es la clave que conecta funcionalidad, rol y visibilidad en el menú; sin él, la matriz no explica quién puede hacer qué |
| Implementación (backend) | — |
| Implementación (frontend) | Separar las dos columnas evidencia de inmediato los casos sin interfaz (F20) |
| **Entidades afectadas** | Conecta la matriz con el capítulo de modelo de datos |
| Flujo / caso de uso | — |
| **Prueba automatizada** | Convierte la matriz en evidencia de verificación, no solo de existencia. Es un plus académico fuerte |
| Cap. doc. técnica | — |
| Cap. manual de usuario | — |
| **Estado** | Implementado / Sin interfaz / No implementado — imprescindible dado el alcance parcial |

### 12.2 Matriz (borrador completo, a validar en la iteración 2)

| ID | Funcionalidad | Módulo | Permiso | Backend | Frontend | Entidades | Flujo | Prueba | Téc. | Man. | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| F01 | Inicio de sesión | Auth | — | `auth.service.ts` | `login.component.ts` | User, Role | CU-01 | `sales-flow` (401) | 6 | 2 | ✅ |
| F02 | Solicitud de recuperación | Auth | — | `auth.service.ts` | `forgot-password.component.ts` | PasswordResetToken | CU-02 | `password-reset` | 6 | 3 | ✅ |
| F03 | Restablecimiento | Auth | — | `auth.service.ts` | `reset-password.component.ts` | PasswordResetToken, User, AuditLog | CU-02 | `password-reset` | 6 | 3 | ✅ |
| F04 | Refresh de sesión | Auth | — | `auth.service.ts` | `jwt.interceptor.ts` | User | CU-01 | — | 6 | — | ✅ |
| F05 | KPIs de inicio | Dashboard | sesión | `dashboard.service.ts` | `dashboard.component.ts` | Sale, FinishedProduct, Customer | — | `sales-flow` | 4 | 5 | ✅ |
| F06 | Gráfico de ventas | Dashboard | sesión | `dashboard.service.ts` | `sales-chart.component.ts` | Sale | — | — | 4 | 5 | ✅ |
| F07 | Gestión de clientes | Comercial | `commercial.*` | `customers.service.ts` | `customer-list/form` | Customer, AuditLog | — | `sales-flow` | 7 | 6 | ✅ |
| F08 | Gestión de materiales | Inventario | `inventory.*` | `finished-products.service.ts` | `product-list/form` | FinishedProduct, Category, AuditLog | CU-03 | `sales-flow` | 7 | 7 | ✅ |
| F09 | Alta de categoría | Inventario | `inventory.create` | `categories.service.ts` | `category-form.component.ts` | Category, AuditLog | CU-03 | — | 7 | 7 | ✅ |
| F10 | Movimientos de stock | Inventario | `inventory.update` | `finished-products.service.ts` | `stock-movement-dialog` | FinishedProductMovement, FinishedProduct | CU-03 | `sales-flow` | 7 | 7 | ✅ |
| F11 | **Registro de venta** | Comercial | `commercial.create` | `sales.service.ts` `create()` | `sale-form.component.ts` | Sale, SaleDetail, FinishedProduct, Movement, CashRegister, CashMovement, AuditLog | CU-04 | `sales-flow` (feliz, 422, concurrencia) | **8** | **8** | ✅ |
| F12 | Consulta de ventas | Comercial | `commercial.read` | `sales.controller.ts` | `sale-list.component.ts` | Sale, Customer | — | `sales-flow`, `sale-list.spec` | 7 | 8 | ✅ |
| F13 | Detalle de venta | Comercial | `commercial.read` | `sales.service.ts` `getById()` | `sale-detail.component.ts` | Sale, SaleDetail | — | `sales-flow` | 7 | 8 | ✅ |
| F14 | Anulación de venta | Comercial | `commercial.update` | `sales.service.ts` `cancel()` | `sale-detail.component.ts` | Sale, Movement, CashMovement, AuditLog | CU-05 | `sales-flow` | **8** | 8 | ✅ |
| F15 | Caja de ventas | Finanzas | `finance.read` | `sales-cash.service.ts` | `cash-register.component.ts` | CashRegister, CashMovement | CU-06 | `cash-date-filter`, `cash-register.spec` | 7 | 9 | ✅ |
| F16 | Reporte de ventas | Reportes | `reports.read` | `sales-by-period.ts`, `excel-writer.ts` | `sales-report.component.ts` | SaleDetail, Sale, Customer, FinishedProduct | CU-07 | — | **9** | 10 | ✅ |
| F17 | Consulta de auditoría | Auditoría | `audit.read` | `audit.service.ts` | `audit-list.component.ts` | AuditLog, User | CU-08 | `sales-flow`, `audit-list.spec` | 7 | 11 | ✅ |
| F18 | Gestión de usuarios | Usuarios | `users.*` | `users.service.ts` | `user-list/form` | User, Role, AuditLog | CU-09 | — | 7 | 11 | ✅ |
| F19 | Consulta de roles | Usuarios | `users.read` | `roles.service.ts` | `role-list.component.ts` | Role, Permission | — | — | 7 | 11 | ✅ |
| ~~F20~~ | ~~Gestión de empleados~~ | Empleados | `employees.*` | `employees.service.ts` | **—** | Employee, AuditLog | — | — | **—** | **—** | 🚫 **Excluido de la entrega (D5 = G3)** |
| — | Materias primas | Inventario | — | stub | — | RawMaterial* | — | — | 15 | — | 🔴 |
| — | Producción | Producción | — | stub | — | Production* | — | — | 15 | — | 🔴 |
| — | Proveedores | Comercial | — | stub | — | Supplier | — | — | 15 | — | 🔴 |
| — | Pagos a proveedores | Finanzas | — | stub | — | SupplierPayment | — | — | 15 | — | 🔴 |
| — | Facturación / CAE | Finanzas | — | stub | — | Invoice | — | — | 15 | — | 🔴 |

**[INF]** Las últimas cinco filas no son «funcionalidades documentables»: son alcance declarado y
no implementado. Aparecen en la matriz **solo** para que la trazabilidad sea completa y para
remitir al capítulo 15.

---

## 13. Diagramas recomendados

Ninguno se genera en esta etapa. Se especifica qué debería representar cada uno.

| ID | Tipo | Título | Qué debe representar | Capítulo | Prioridad |
|---|---|---|---|---|---|
| **D1** | Arquitectura general | Vista de alto nivel | Navegador (SPA Angular) ↔ API REST Express ↔ PostgreSQL, más el servidor SMTP como único externo. Protocolos y puertos. Debe dejar claro que son **dos procesos y una base** | 4 | **Imprescindible** |
| **D2** | Componentes | Backend en capas | `app.ts` → middlewares globales → router `/api` → los 12 módulos implementados (los 5 stubs marcados aparte) → `shared/` → Prisma → PostgreSQL | 4 | **Imprescindible** |
| **D3** | Componentes | Frontend | `core` / `layout` / `shared` / `features`, con las flechas de dependencia. Debe mostrar que **todas** las features pasan por `ApiService` y que los interceptores son transversales | 4, 10 | **Imprescindible** |
| **D4** | Entidad-relación | Modelo de datos completo | Las 22 entidades con cardinalidades, **distinguiendo visualmente las 15 con código de las 7 sin implementar** | 5 | **Imprescindible** |
| D4b | Entidad-relación | Núcleo operativo | Subconjunto: User, Role, Permission, Customer, Category, FinishedProduct, Movement, Sale, SaleDetail, CashRegister, CashMovement, AuditLog | 5 | Recomendable |
| **D5** | Secuencia | Registro de venta | Usuario → SaleForm → ApiService → jwtInterceptor → API → SalesService → transacción (5 pasos) → respuesta. **El diagrama estrella del trabajo** | 8 | **Imprescindible** |
| **D6** | Secuencia | Login y refresh | Login completo + el ciclo 401 → refresh → reintento del interceptor | 6 | **Imprescindible** |
| **D7** | Secuencia | Recuperación de contraseña | Los cuatro participantes, incluido el servidor SMTP, y la generación/consumo del token | 6 | Recomendable |
| ~~D8~~ | ~~Despliegue~~ | — | **ELIMINADO (D4 = E1)**: no se escribe el capítulo de despliegue | — | 🚫 |
| **D9** | Actividad | Venta con caminos de error | Todas las decisiones y sus salidas: cliente inactivo, caja ausente, producto inválido, stock insuficiente → rollback | 8 | **Imprescindible** |
| **D10** | Actividad | Anulación de venta | Guard de estado, reposición de stock, reversión de caja | 8 | Recomendable |
| **D11** | Clases | Subsistema de reportería | `ReportDefinition`, `RegisteredReport`, `ReportPayload`, `ReportColumn`, `defineReport`, `excel-writer`. **El único diagrama de clases que aporta valor real** | 9 | Recomendable |
| **D12** | Mapa de navegación | Rutas y permisos | Árbol de rutas con el permiso de cada una y qué rol la ve | 10 | Recomendable |
| D13 | Actividad | Alta de material con stock | Alta → categoría opcional → movimiento inicial | 10 / manual | Opcional |
| D14 | Secuencia | Generación del reporte | Enfatizando «resolver datos antes de escribir headers» | 9 | Opcional |
| D15 | Estados | Ciclo de vida de una venta | `DRAFT` (declarado, no usado) → `CONFIRMED` → `CANCELLED` | 5 / 8 | Opcional |

**[INF] Diagramas que conviene NO incluir:** diagrama de clases del dominio completo (Prisma
genera tipos, no clases de dominio: sería una transcripción del DER), diagramas de secuencia de
cada CRUD (los cuatro son idénticos), y diagrama de paquetes del frontend (lo cubre D3).

**🚫 Diagramas que NO deben usarse bajo ninguna circunstancia [HC]:** los 20 PNG de contextos y el
`modelo_er_gestion.sql` de `PerliNor-ERP/Documentacion/`. Describen una arquitectura de *bounded
contexts* con entidades y módulos (Mantenimiento, Laboratorio, Compras, `parties`, `warehouses`,
`sales_orders`) que **no existen en el sistema entregado**. Ver §0.7.

### Recorte de diagramas por plazo

Con 13 días hasta la presentación, el orden de producción debe ser este. Si el tiempo se agota,
se corta desde abajo:

| Prioridad | Diagramas | Justificación |
|---|---|---|
| **1 — Irrenunciables** | D1, D4, D5 | Arquitectura, datos y el flujo central. Sin estos tres el documento no se sostiene |
| **2 — Alto valor** | D2, D3, D9 | Completan la vista estructural y los caminos de error de la venta |
| **3 — Si hay tiempo** | D6, D12 | Seguridad y navegación |
| **4 — Prescindibles** | D4b, D7, D10, D11, D13, D14, D15 | Aportan, pero ninguno es necesario para aprobar |

---

# Parte IV — Riesgos, información faltante y estrategia

## 14. Información faltante

> ## ✅ ESTADO AL 13/09/2026 — RESUELTO EN SU MAYOR PARTE
>
> | Bloque | Estado |
> |---|---|
> | **A (11 puntos)** | **11/11 respondidos.** Consolidados en §0.1, §0.2 y §0.5 |
> | **B (8 puntos)** | **8/8 confirmados.** Consolidados en §0.3 |
> | **C (5 puntos)** | **4/5 resueltos.** C-01, C-02 y C-03: sin proveedor de hosting, sin política de backups y sin integración AFIP/ARCA — los tres pierden relevancia con D4=E1. C-05: datos de ejemplo a definir por mí (propuesta en §16.bis). **C-04 sigue abierto: el archivo `logo-utn` no existe** (ver P-03) |
> | **D (8 puntos)** | Sin cambios: siguen descartados |
>
> Las tablas que siguen se conservan como **registro de la consulta**. Para el estado vigente,
> ver **§0**.

### A. Debe proporcionarlo el autor

| # | Información | Por qué es necesaria | Documento afectado |
|---|---|---|---|
| A-01 | Contexto real de PerliNor: rubro exacto, tamaño, cómo opera hoy | Cap. 1 no puede escribirse solo con código | Técnica |
| A-02 | Problema de negocio original y objetivos del proyecto | Fundamenta todo el trabajo | Ambos |
| A-03 | ¿Es un caso real, un caso realista o un caso de estudio? | Cambia el tono del documento y lo que puede afirmarse | Ambos |
| A-04 | Alcance comprometido con la cátedra vs. alcance entregado | Determina cómo presentar los módulos no implementados | Técnica |
| A-05 | Justificación de por qué se implementó el corredor de venta y no el ERP completo | Convierte una limitación en una decisión de proyecto | Cap. 1 y 15 |
| A-06 | Nombre y filiación del autor, materia, cátedra, fecha de presentación | Portada | Ambos |
| A-07 | Normas de formato exigidas (APA/IEEE, extensión, idioma, tipografía) | Condiciona el diseño de todo | Ambos |
| A-08 | URL con la que se presentará el sistema | Cap. 2 del manual | Manual |
| A-09 | ¿Habrá demostración en vivo? | Define si el manual debe ser autosuficiente o de apoyo | Manual |
| A-10 | Cronograma real de desarrollo | [CONTEXT.md](CONTEXT.md) §12 declara 16 semanas: **no verificable** en el repositorio | Cap. 2 |
| A-11 | ¿Hubo usuarios reales probando el sistema? | Habilita (o no) un apartado de validación con usuarios | Técnica |

### B. Debe confirmarse

| # | Punto ambiguo | Por qué |
|---|---|---|
| B-01 | ¿Los 5 roles del seed son los roles reales de la empresa? | [CONTEXT.md](CONTEXT.md) los declara; el código los siembra; no hay evidencia de la organización |
| B-02 | ¿Es correcto que **toda** venta genere ingreso de caja, incluso con medio de pago `ACCOUNT` (cuenta corriente) o `CHECK`? | El código lo hace sin distinción ([sales.service.ts](erp-backend/src/modules/commercial/sales/sales.service.ts)). Contablemente es discutible y hay que declararlo como regla explícita o corregirlo |
| B-03 | ¿La ausencia de IVA es una simplificación deliberada y definitiva? | `tax = 0` está fijado en el código con el comentario «sin IVA en la demo» |
| B-04 | ¿`Sale.status = DRAFT` se usará alguna vez? | Está en el enum pero ninguna venta lo alcanza |
| B-05 | ¿El módulo de empleados debe tener interfaz antes de la entrega? | Hoy es funcionalidad invisible para el usuario |
| B-06 | ¿La documentación se entrega en español rioplatense (como toda la UI) o en español neutro? | Los mensajes del sistema usan voseo («Ingresá», «Achicá») |
| B-07 | ¿`ROADMAP_POST_MVP.md` y los `PLAN_*.md` se entregan como anexos o quedan fuera? | Son excelentes evidencias de método, pero algunos están desactualizados |
| B-08 | ¿La zona horaria del servidor de la demo será ART? | La agregación temporal usa la hora del servidor |

### C. Debe obtenerse externamente

| # | Información | Fuente |
|---|---|---|
| C-01 | Infraestructura real de despliegue (si la habrá) | Proveedor de hosting |
| C-02 | Política de backups y retención | Decisión del autor / la empresa |
| C-03 | Requisitos legales de facturación electrónica argentina, si se documenta como trabajo futuro | Normativa AFIP |
| C-04 | Logo institucional en alta resolución para la portada | El repositorio solo tiene `assets/logo.png` (23 KB) para los reportes |
| C-05 | Datos de ejemplo verosímiles del rubro para las capturas | Autor / empresa |

### D. No es necesaria

| # | Elemento | Por qué se descarta |
|---|---|---|
| D-01 | Documentación exhaustiva archivo por archivo | Ruido: el valor está en los patrones, no en el inventario |
| D-02 | Diagrama de clases del dominio completo | Prisma genera tipos, no clases; duplicaría el DER |
| D-03 | Manual de instalación dentro del manual de usuario | Rompe la separación de perspectivas |
| D-04 | Capítulo genérico de «Marco teórico sobre ERP» | Solo si la cátedra lo exige explícitamente (ver A-07); si no, es relleno |
| D-05 | Documentación de los 5 módulos stub como si fueran funcionalidades | Sería inexacto; van al capítulo de trabajo futuro |
| D-06 | Métricas de rendimiento | No fueron medidas; inventarlas invalidaría el trabajo |
| D-07 | Comparativa de frameworks alternativos | [CONTEXT.md](CONTEXT.md) declara las decisiones cerradas; reabrirlas no aporta |
| D-08 | Manual de administración de PostgreSQL | Fuera del alcance del sistema |

---

## 15. Riesgos y problemas de documentación

### 15.1 Funcionalidades parciales o invisibles

| ID | Riesgo | Evidencia | Tratamiento propuesto |
|---|---|---|---|
| R-01 | **5 módulos son stubs montados** (materias primas, producción, proveedores, pagos, facturación) | `*.routes.ts` con solo `Router` + `authenticate` + TODO | Declararlos en Cap. 1 (alcance) y Cap. 15 (trabajo futuro). **No** documentarlos como API |
| R-02 | **7 de 22 entidades no tienen código** | §4 | En el DER, marcarlas visualmente como «diseñadas para el alcance completo» |
| R-03 | **Empleados: backend completo sin interfaz** | 0 referencias en el frontend | Documentar en la técnica como API sin UI; excluir del manual |
| R-04 | **Costo promedio ponderado declarado y no implementado** | [CONTEXT.md](CONTEXT.md) §7 vs. `averageCost` sin código | Corregir la afirmación; llevarlo a trabajo futuro |
| R-05 | **Rol Producción sin funcionalidad propia** | Seed le da `production.*`; el módulo es stub | Explicarlo o considerar ajustar el seed antes de la entrega |
| R-06 | **Enums con valores nunca producidos** (`DRAFT`, `RAW_MATERIAL`, `PAYMENTS`, `InvoiceType`, `InvoiceStatus`) | §4 | Documentar el ciclo de vida **real**, no el declarado |

### 15.2 Documentación existente desactualizada

| ID | Problema | Evidencia |
|---|---|---|
| R-07 | **`ROADMAP_POST_MVP.md` (27/07) marca `audit`, `reports` y `finance/sales-cash` como stubs** — hoy los tres están implementados | Comparación directa con el código |
| R-08 | **`CONTEXT.md` §2 declara PDFKit para reportes PDF** — no se genera ningún PDF | 0 referencias a `pdfkit` en `src/` |
| R-09 | **`CONTEXT.md` §6 declara alcance funcional muy superior al implementado** | §5.7 |
| R-10 | **El README raíz documenta un archivo `erp-backend/prisma/.env` que no existe** en el árbol de trabajo | `ls erp-backend/prisma` |
| R-11 | **`CONTEXT.md` §10 lista Adminer pero no Mailpit**, agregado después | [docker-compose.yml](docker-compose.yml) |
| R-12 | **Script `lint` inejecutable**: ESLint 9 sin archivo de configuración | §2.3 |
| R-13 | **Dependencias declaradas y no usadas**: `pdfkit`, `@types/pdfkit`, `uuid`, `@types/uuid`; y `listUsersQuerySchema` declarado sin uso | §2.1 |

> **Decisión requerida:** ¿se corrigen estos archivos antes de documentar, o se documenta sobre
> el código y se los deja como están? Ver §16, D3. **La documentación final no puede contradecir
> ni al código ni a un anexo del propio trabajo.**

### 15.3 Nomenclatura inconsistente

| ID | Concepto | Nombres en uso | Riesgo |
|---|---|---|---|
| R-14 | Producto vendible | «producto terminado» (CONTEXT, schema), `finished-product` (código/URL), **«Materiales»** (interfaz y manual) | Un lector puede creer que son tres cosas distintas |
| R-15 | Baja | `deactivate` (servicio), `DELETE` (verbo HTTP), «Dar de baja» (interfaz) | El verbo HTTP sugiere borrado físico, que no ocurre |
| R-16 | Caja | `CashRegister` / «Caja de ventas» / `sales-cash` | Menor, pero conviene fijar el término |

**Tratamiento:** un **glosario canónico** en el anexo A de la técnica, con la equivalencia entre
los tres registros (dominio / código / interfaz). El manual usa **solo** el término de interfaz.

### 15.4 Información sensible que NO debe aparecer

> **Esta subsección es de cumplimiento obligatorio en ambos documentos.**

| ID | Elemento | Dónde está | Regla |
|---|---|---|---|
| R-17 | **Credenciales precargadas en el formulario de login** (`admin@perlinor.local` / `admin123` como valores iniciales del Reactive Form) | [login.component.ts](erp-frontend/src/app/features/auth/login/login.component.ts) | **⚠️ RIESGO VIGENTE — D7 = I1: el código no se modifica.** Se neutraliza en el protocolo de capturas: antes de tomar **C-02** y **C-03**, borrar manualmente ambos campos en el navegador y escribir un email ficticio (`usuario@perlinor.local`) con la contraseña enmascarada. **Nunca** capturar la pantalla tal como carga. Riesgo residual asumido: si la demostración en vivo se hace desde `/login`, las credenciales serán visibles en pantalla ante el evaluador |
| R-18 | **5 usuarios de demo con contraseñas triviales** | [seed.ts](erp-backend/prisma/seed.ts) | Si se mencionan, rotularlos explícitamente como **datos de demostración local**, nunca como credenciales del sistema. Preferible: no publicarlas |
| R-19 | **Credenciales de PostgreSQL en claro** (`erp_user` / `erp_dev_password`) | [docker-compose.yml](docker-compose.yml), `.env.example` | Presentarlas siempre como **entorno local de desarrollo**. En el capítulo de despliegue, indicar generación de credenciales propias |
| R-20 | **Secretos JWT** | `.env.example` usa `changeme_*` | Documentar la variable, **jamás un valor**. Indicar generación aleatoria por entorno |
| R-21 | Datos personales reales en capturas | — | Usar exclusivamente datos ficticios |
| R-22 | Rutas absolutas del equipo del autor | Aparecen en `.claude/settings.local.json` | No incluir ese archivo ni capturas de terminal que las expongan |

**[HC] Verificación de higiene realizada:** ningún archivo `.env` real está versionado (solo
`.env.example` y `.env.test.example`), `dist/` no está versionado, y el `.gitignore` cubre
correctamente secretos, builds y `node_modules`. **Esto es un punto a favor y conviene mencionarlo
en el capítulo de seguridad.**

### 15.5 Otros riesgos técnicos a declarar

| ID | Riesgo | Evidencia |
|---|---|---|
| R-23 | **Tokens en `localStorage`** → expuestos a XSS | [auth.service.ts](erp-frontend/src/app/core/services/auth.service.ts) |
| R-24 | **Un reset de contraseña no cierra sesiones abiertas** (hasta 7 días) | Declarado en [CONTEXT.md](CONTEXT.md) §8 y verificado en el código |
| R-25 | **Dependencia de la zona horaria del servidor** en agregaciones y filtros | [dashboard.service.ts](erp-backend/src/modules/dashboard/dashboard.service.ts) |
| R-26 | **`assets/logo.png` queda fuera de `dist/`**: sin copia manual, los reportes salen sin logo | Documentado en [erp-backend/README.md](erp-backend/README.md) |
| R-27 | **Selectores acotados a 200 registros** (clientes y materiales en el formulario de venta y en reportes) | `list(1, 200)` en varios componentes |
| R-28 | **Sin paginación** en `GET /categories` ni en `GET /roles` | Servicios correspondientes |
| R-29 | **Sin unicidad de CUIT** en `Customer` ni en `Supplier` | [schema.prisma](erp-backend/prisma/schema.prisma) |
| R-30 | **Inconsistencia de estilo de código** en `employees.service.ts` (indentación de 4 espacios y comillas dobles, contra el resto del proyecto) | [employees.service.ts](erp-backend/src/modules/employees/employees.service.ts) |
| R-31 | **Flujos difíciles de explicar en el manual**: el descuento atómico condicional y la reversión de caja son correctos pero invisibles | Cap. 8 técnico sí; en el manual solo su efecto observable |

---

## 16. Estrategia de trabajo — **PLAN VIGENTE (13 días)**

> ### ⏱ Restricción dominante: 13 días
>
> Hoy es **13/09/2026**; la presentación es el **26/09/2026**. El plan original de 8 iteraciones
> fue dimensionado sin conocer la fecha y **no entra en ese plazo**. Lo que sigue es el plan
> vigente, comprimido a 5 bloques. El detalle de las 8 iteraciones se conserva más abajo como
> **material de referencia** para el contenido de cada etapa, no como cronograma.
>
> **Tres cambios de criterio que impone el plazo:**
> 1. **Se elimina la iteración de saneamiento previo.** D7=I1 y D4=E1 ya la vaciaron de contenido;
>    lo único que queda —resolver P-01, P-02 y P-03— se absorbe en el primer bloque.
> 2. **Los datos de demostración se preparan el día 2, no al final.** Alimentan las capturas,
>    los ejemplos del documento técnico y la demostración en vivo. Es la tarea con mayor efecto
>    multiplicador de todo el plan.
> 3. **Los diagramas se recortan a los 3 irrenunciables** (D1, D4, D5), con 3 más si sobra tiempo.

### Plan de 5 bloques

| # | Bloque | Días | Entregable | Criterio de cierre |
|---|---|---|---|---|
| **B1** | **Decisiones y fundaciones** | 13–14/09 (2) | P-01/P-02/P-03 resueltos · **glosario canónico** (cierra R-14 a R-16) · plantilla IEEE · **juego de datos de demostración cargado** · Cap. 1 redactado | El Cap. 1 delimita el alcance entregado y cita A-05 textualmente |
| **B2** | **Núcleo técnico** | 15–18/09 (4) | Caps. 3, 4, 5, 6, 7, **8**, 9, 10, 11 | El Cap. 8 explica el descuento atómico citando el test de concurrencia |
| **B3** | **Cierre técnico** | 19–20/09 (2) | Caps. 2 (cronograma ya listo en §0.5), 12, 13, 15 + anexos + matriz de trazabilidad | Un tercero levanta el sistema siguiendo solo el Cap. 13 — **probarlo** |
| **B4** | **Manual + capturas** | 21–23/09 (3) | Los 12 capítulos del manual + las 39 capturas | Cero términos técnicos; ninguna captura con credenciales ni datos reales |
| **B5** | **Diagramas y revisión** | 24–25/09 (2) | D1, D4, D5 (+ D2, D3, D9 si entra) · revisión de exactitud · **auditoría de §15.4** · exportación a PDF IEEE | Checklist completo de exactitud, coherencia, formato y seguridad |
| — | **Presentación** | 26/09 | — | — |

### Por qué este orden

- **El documento técnico va primero** porque es el cuello de botella: 13 capítulos contra 12 del
  manual, pero con mucha más densidad. El manual, en cambio, ya está prácticamente esbozado en §9
  de esta guía —incluidos los mensajes del sistema literales— y se redacta mucho más rápido.
- **Las capturas van después del manual y no antes**, porque el texto define qué debe mostrar cada
  una. Pero **los datos** que aparecen en ellas se preparan en B1: sin eso, B4 se bloquea.
- **Los diagramas van al final** porque son la tarea más fácil de recortar sin comprometer la
  aprobación, y la única que puede absorber un retraso acumulado.

### Si el plazo se comprime aún más

Orden de recorte, de lo primero a sacrificar a lo último:

| Orden | Qué se recorta | Costo |
|---|---|---|
| 1.º | Diagramas de prioridad 3 y 4 (§13) | Bajo |
| 2.º | Anexo C (diccionario de datos completo) → dejar solo el DER | Bajo |
| 3.º | Cap. 2 (metodología) reducido al cronograma de §0.5 | Medio |
| 4.º | Cap. 9 (reportería) fusionado dentro del Cap. 7 | Medio |
| ❌ | **Nunca recortar:** Caps. 1, 4, 5, 8, 13 ni el manual completo | — |

---

## 16.bis Datos de demostración propuestos (respuesta a C-05)

Juego coherente con el rubro, listo para cargar en B1. Sirve simultáneamente a las capturas, a los
ejemplos del documento y a la demostración en vivo.

**Categorías (producto terminado):** Materiales de construcción · Cemento y áridos *(ambas ya las
siembra el seed)* · Premoldeados

**Materiales:**

| SKU | Nombre | Categoría | Unidad | Precio | Stock inicial |
|---|---|---|---|---|---|
| `LAD-H12` | Ladrillo hueco 12×18×33 | Materiales de construcción | u | 850,00 | 4.000 |
| `LAD-H18` | Ladrillo hueco 18×18×33 | Materiales de construcción | u | 1.240,00 | 2.500 |
| `BLQ-20` | Bloque de hormigón 20×20×40 | Premoldeados | u | 1.980,00 | 1.200 |
| `CEM-50` | Cemento de albañilería 50 kg | Cemento y áridos | bolsa | 12.400,00 | 300 |
| `ARE-M3` | Arena fina | Cemento y áridos | m³ | 28.500,00 | 45 |
| `VIG-300` | Vigueta pretensada 3,00 m | Premoldeados | u | 34.700,00 | **8** |

> `VIG-300` con stock bajo a propósito: alimenta el panel «stock bajo» del inicio (C-12) y permite
> provocar el error de stock insuficiente para la captura **C-25**.

**Clientes:**

| Nombre | CUIT | Localidad |
|---|---|---|
| Corralón del Norte S.R.L. | 30-71204558-3 | San Miguel de Tucumán |
| Constructora Aconquija S.A. | 30-69874521-9 | Yerba Buena |
| Materiales Lules | 27-28456123-4 | Lules |
| Obras y Servicios del Valle S.R.L. | 33-70125896-9 | Tafí Viejo |

**Ventas a generar:** entre 25 y 35 ventas confirmadas repartidas en los **últimos 60 días**, con
2 a 4 líneas cada una, importes entre $80.000 y $2.500.000, y **al menos 3 ventas del día de las
capturas**. Sumar **2 ventas anuladas** para poder mostrar C-28 y el movimiento negativo de caja
(C-31).

> **[INF] Por qué 60 días y no una semana:** el gráfico del dashboard (C-13) con agrupación
> semanal y mensual necesita varios buckets con contenido; con datos de un solo día se ve vacío y
> la captura no demuestra nada. Además el reporte de «Ventas por período» (C-33) necesita volumen
> suficiente para que el autofiltro y los totales tengan sentido visual.
>
> **[INF] Sugerencia de implementación:** cargarlas con un script temporal contra la API o
> extendiendo `seed.ts` en una copia local. **No versionar ese script** si D7=I1 se interpreta de
> forma estricta; alcanza con conservarlo fuera del repositorio para poder regenerar los datos si
> hiciera falta rehacer capturas.

---

## 16.ter Detalle de contenido por etapa *(referencia — el cronograma vigente es §16)*

### Iteración 0 — Saneamiento previo *(absorbida en B1)*

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Que el repositorio no contradiga a la documentación que se va a escribir |
| **Actividades** | Resolver las decisiones de §16 · Decidir sobre R-07 a R-13 (corregir vs. declarar) · Decidir sobre R-17 (credenciales precargadas) · Reunir la información de §14.A |
| **Entregable** | Decisiones cerradas + `CONTEXT.md` y `ROADMAP_POST_MVP.md` actualizados o formalmente marcados como históricos |
| **Cierre** | El autor aprueba las decisiones D1–D7 |
| **Esfuerzo** | Bajo, pero **condiciona todo lo demás** |

> Saltarse esta iteración es el error más caro posible: obliga a reescribir capítulos ya redactados.

---

### Iteración 1 — Fundaciones documentales

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Fijar el esqueleto y el vocabulario de ambos documentos |
| **Actividades** | Índice definitivo de la técnica · Índice definitivo del manual · **Glosario canónico** (resuelve R-14 a R-16) · Plantilla de formato según A-07 · Cap. 1 de la técnica (introducción, contexto, alcance) |
| **Entregable** | Ambos índices aprobados + glosario + Cap. 1 redactado |
| **Cierre** | El Cap. 1 declara con precisión qué está implementado y qué no |

---

### Iteración 2 — Núcleo técnico: arquitectura y datos

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Redactar los capítulos de mayor peso conceptual |
| **Actividades** | Cap. 3 (requerimientos) · Cap. 4 (arquitectura, con el registro de decisiones) · Cap. 5 (modelo de datos) · Especificación precisa de D1, D2, D3, D4 |
| **Entregable** | Tres capítulos + cuatro diagramas especificados (aún sin dibujar) |
| **Cierre** | La matriz de trazabilidad (§12) queda validada contra el código |

---

### Iteración 3 — Implementación y el núcleo transaccional

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Redactar la parte que demuestra mérito de ingeniería |
| **Actividades** | Cap. 6 (seguridad) · Cap. 7 (backend) · **Cap. 8 (venta y anulación — el capítulo estrella)** · Cap. 9 (reportería) · Cap. 10 (frontend) · Cap. 11 (API) |
| **Entregable** | Seis capítulos |
| **Cierre** | El Cap. 8 explica el descuento atómico con su test de concurrencia como evidencia |

---

### Iteración 4 — Calidad, operación y cierre técnico

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Completar la documentación técnica |
| **Actividades** | Cap. 12 (pruebas) · Cap. 13 (instalación) · Cap. 14 (despliegue propuesto) · Cap. 15 (limitaciones y trabajo futuro) · Cap. 2 (metodología, ya con la perspectiva completa) · Anexos |
| **Entregable** | Documentación técnica completa en borrador |
| **Cierre** | Un tercero puede levantar el sistema siguiendo solo el Cap. 13 — **verificarlo en la práctica** |

---

### Iteración 5 — Manual de usuario

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Redactar el manual completo |
| **Actividades** | Los 12 capítulos de §9, en el orden en que un usuario los recorre · **Sin capturas todavía**, con marcadores `[C-xx]` |
| **Entregable** | Manual completo con marcadores de captura |
| **Cierre** | Revisión de vocabulario: cero términos técnicos; solo términos de interfaz |

> **Por qué el manual va después de la técnica y no en paralelo:** el manual debe describir el
> comportamiento **real** verificado, y esa verificación se completa durante las iteraciones 2–4.
> Escribirlo antes lleva a describir lo que se cree que hace el sistema.

---

### Iteración 6 — Producción de diagramas y capturas

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Material gráfico definitivo |
| **Actividades** | **Preparar un juego de datos de demostración coherente** (clientes y materiales del rubro, ventas distribuidas en el tiempo para que el gráfico y los reportes tengan contenido) · Dibujar D1–D12 · Tomar las 39 capturas, incluidos los estados de error · Insertarlas en los marcadores |
| **Entregable** | Ambos documentos ilustrados |
| **Cierre** | Ninguna captura muestra datos reales, credenciales ni rutas locales |

> **Nota de secuencia:** los datos de demostración deben prepararse **antes** de las capturas y
> **antes** de los diagramas de secuencia, porque varios diagramas se validan contra el
> comportamiento observado.

---

### Iteración 7 — Revisión académica y técnica final

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Entregar |
| **Actividades** | **Verificación de exactitud**: cada afirmación técnica contrastada contra el código · Coherencia entre ambos documentos · Cumplimiento de A-07 · Revisión de la matriz de trazabilidad · **Auditoría final de información sensible (§15.4)** · Lectura de prueba del manual por alguien ajeno al proyecto |
| **Entregable** | Versión final de ambos documentos |
| **Cierre** | Checklist de exactitud, coherencia, formato y seguridad completo |

---

### Correspondencia con el plan vigente

| Iteración de referencia | Bloque vigente | Peso relativo |
|---|---|---|
| 0 — Saneamiento | B1 | 5 % |
| 1 — Fundaciones | B1 | 10 % |
| 2 — Arquitectura y datos | B2 | 20 % |
| 3 — Implementación | B2 | 25 % |
| 4 — Calidad y operación | B3 | 15 % |
| 5 — Manual | B4 | 15 % |
| 6 — Gráficos y capturas | B4 + B5 | 7 % |
| 7 — Revisión | B5 | 3 % |

---

# Registro de decisiones — cerrado el 13/09/2026

> **Las siete decisiones estructurales están tomadas.** El detalle de cada opción y sus
> alternativas se conserva abajo como fundamento del criterio adoptado. El resumen operativo
> está en **§0.4**.
>
> | Decisión | Opción elegida | Recomendación previa | Coincide |
> |---|---|---|---|
> | D1 — Alcance | **A1** (solo lo implementado) | A3 | ✗ |
> | D2 — Modelo de datos | **B2** | B2 | ✓ |
> | D3 — Docs desactualizadas | **C3, breve** | C3 + C1 | ~ |
> | D4 — Despliegue | **E1** (omitir) | E2 | ✗ |
> | D5 — Empleados | **G3** (omitir) | G1 | ✗ |
> | D6 — Formato | **H2** | H2 | ✓ |
> | D7 — Correcciones | **I1** (no tocar) | I3 | ✗ |
>
> Las cuatro divergencias son decisiones legítimas del autor y **todas apuntan en la misma
> dirección: un documento más acotado y más rápido de producir**. Con 13 días de plazo, esa
> dirección es la correcta. Las consecuencias de cada una ya están aplicadas a lo largo de la
> guía; las dos que dejan riesgo residual —**D5** (§6, ficha F20) y **D7** (§15.4, R-17)— están
> señaladas donde corresponde, con su mitigación.

## Compatibilidad entre D1 y D2 **[INF]**

D1=A1 («documentar solo lo implementado») y D2=B2 («DER completo con distinción visual») podrían
parecer contradictorias. **No lo son, y la combinación es mejor que cualquiera de las dos por
separado:**

- El **cuerpo** de la documentación describe exclusivamente lo implementado — así lo manda A1.
- El **DER del Cap. 5** muestra las 22 entidades, con las 7 sin código claramente marcadas como
  *modelo previsto, sin implementación*. No documenta funcionalidad inexistente: documenta una
  **decisión de diseño de base de datos** que sí se tomó y sí está en el repositorio.
- El **diccionario de datos** cubre solo las 15 entidades implementadas — menos `Employee`, por D5: 14.

El resultado es exacto y además explica algo que, de otro modo, quedaría sin justificación: por
qué el `schema.prisma` tiene tablas que ningún código usa. **Sin esa aclaración, el schema parece
un descuido; con ella, es previsión.**

---

## Fundamento de las decisiones adoptadas

*(Se conservan las alternativas evaluadas para dejar constancia del criterio.)*

---

### D1 — Cómo presentar el alcance parcial *(la decisión más importante)*

**Situación [HC]:** el sistema implementa un corredor operativo completo y coherente
(acceso → clientes → materiales → stock → venta → caja → reportes → auditoría), pero
[CONTEXT.md](CONTEXT.md) declara un alcance mayor y el modelo de datos está diseñado para el ERP
completo. 5 de 17 módulos son stubs y 7 de 22 entidades no tienen código.

| Alternativa | Descripción | A favor | En contra |
|---|---|---|---|
| **A1** | Documentar **solo lo implementado**; el resto va únicamente a «trabajo futuro» | Máxima exactitud; documento compacto | Desaprovecha el modelo de datos completo, que es un aporte de diseño real |
| **A2** | Documentar el **diseño completo** distinguiendo en cada sección qué está implementado | Muestra visión de sistema completo; el DER cobra sentido | Riesgo de que el evaluador perciba ambigüedad si la distinción no es impecable |
| **A3** | Estructura en dos niveles: **«Sistema implementado»** (cuerpo principal) + **«Diseño del sistema completo»** (capítulo propio) | Ambas ventajas, sin ambigüedad; convierte el alcance parcial en decisión de proyecto | Un capítulo más |

**Recomendación: A3.** Es la única que permite mostrar el diseño completo sin que ninguna
afirmación quede sin respaldo. **Requiere aprobación.**

---

### D2 — Nivel de detalle del modelo de datos

| Alternativa | Descripción |
|---|---|
| **B1** | DER completo (22 entidades) + diccionario de datos completo |
| **B2** | DER completo con distinción visual + diccionario **solo** de las entidades implementadas |
| **B3** | Dos DER: núcleo operativo en el cuerpo + modelo completo en anexo |

**Recomendación: B2**, coherente con D1-A3. **Requiere aprobación**, y depende de D1.

---

### D3 — Qué hacer con la documentación interna desactualizada

**Situación [HC]:** [CONTEXT.md](CONTEXT.md) y [ROADMAP_POST_MVP.md](ROADMAP_POST_MVP.md)
contienen afirmaciones hoy incorrectas (R-07 a R-11).

| Alternativa | Descripción | Consecuencia |
|---|---|---|
| **C1** | Actualizarlos antes de documentar | El repositorio queda coherente; cuesta trabajo previo |
| **C2** | Dejarlos y **no incluirlos** en la entrega | Sin trabajo previo, pero se pierde la evidencia de método (que es valiosa) |
| **C3** | Dejarlos, incluirlos como anexo y **rotularlos explícitamente como documentos históricos de planificación**, con fecha | Conserva el valor metodológico sin comprometer la exactitud |

**Recomendación: C3** para los `PLAN_*.md` (son, por naturaleza, documentos con fecha) y
**C1 para `CONTEXT.md`**, que se presenta como descripción del estado actual y por lo tanto no
puede quedar desactualizado. **Requiere aprobación.**

---

### D4 — Tratamiento del capítulo de despliegue

**Situación [HC]:** no hay ningún artefacto de despliegue en el repositorio.

| Alternativa | Descripción |
|---|---|
| **E1** | Omitir el capítulo |
| **E2** | Incluirlo como **arquitectura de despliegue propuesta**, explícitamente rotulada |
| **E3** | Implementar el despliegue (Dockerfile + Nginx) y documentarlo como hecho |

**Recomendación: E2**, salvo que haya tiempo e intención de hacer E3 — en cuyo caso el trabajo
gana un capítulo sustancialmente más fuerte. **Requiere aprobación** (depende de la disponibilidad
de tiempo del autor).

---

### D5 — Módulo de empleados

**Situación [HC]:** backend completo, cero interfaz.

| Alternativa | Descripción |
|---|---|
| **G1** | Documentarlo en la técnica como «API sin interfaz»; excluirlo del manual |
| **G2** | Construir la pantalla antes de documentar (el patrón CRUD ya existe: sería trabajo acotado, replicando `customers`) y documentarlo completo |
| **G3** | Omitirlo de ambos documentos |

**Recomendación: G1** si el foco es documentar; **G2** si hay margen de desarrollo — reutilizando
`customer-list` / `customer-form` como plantilla, el costo es bajo y elimina una inconsistencia
visible. **G3 queda descartada**: ocultar código existente sería inexacto.

---

### D6 — Formato y herramienta de producción

| Alternativa | Descripción |
|---|---|
| **H1** | Markdown en el repositorio (versionado, coherente con el proyecto) |
| **H2** | Markdown → PDF con estilo académico (portada, índice, numeración, encabezados) |
| **H3** | Procesador de texto directamente |

**Recomendación: H2**, con los fuentes Markdown versionados en `docs/`. Depende de A-07.
**Requiere aprobación.**

**Sub-decisión — herramienta de diagramas:** Mermaid (versionable en texto, integrable en Markdown,
menor control visual) vs. draw.io/PlantUML (mejor acabado, no versionable como texto).
**Recomendación:** Mermaid para D2, D3, D5, D6, D7, D9, D10, D11, D12 (donde la estructura importa
más que la estética) y una herramienta gráfica para **D1 y D4**, que son los diagramas que el
evaluador mira primero.

---

### D7 — Alcance de la corrección de código previa

**Situación:** hay tres correcciones de bajo costo y alto impacto documental.

| # | Corrección | Costo | Impacto |
|---|---|---|---|
| 1 | Vaciar las credenciales precargadas del login (R-17) | 1 línea | **Alto** — evita una observación segura del evaluador |
| 2 | Eliminar `pdfkit` y `uuid` no usados (R-13) | 1 comando | Medio — alinea el stack declarado con el real |
| 3 | Agregar `eslint.config.js` o quitar el script `lint` (R-12) | Bajo | Medio — permite documentar el flujo de calidad sin mentir |

| Alternativa | Descripción |
|---|---|
| **I1** | No tocar nada; documentar el estado exacto, incluidas sus imperfecciones |
| **I2** | Aplicar solo la corrección 1 (seguridad/percepción) |
| **I3** | Aplicar las tres |

**Recomendación: I3.** Las tres son de riesgo nulo y las tres eliminan observaciones evitables.
**Requiere aprobación explícita**, porque implica modificar código — algo expresamente excluido
de esta etapa.

---

## Estado: ✅ etapa de análisis cerrada

| Bloque | Estado |
|---|---|
| Decisiones estructurales (D1–D7) | ✅ 7/7 cerradas — §0.4 |
| Información del autor (§14.A) | ✅ 11/11 — §0.1, §0.2, §0.5 |
| Confirmaciones (§14.B) | ✅ 8/8 — §0.3 |
| Información externa (§14.C) | ✅ 5/5 — C-01 a C-03 sin objeto tras D4=E1; C-04 en §0.9; C-05 en §16.bis |
| Puntos abiertos (P-01 a P-03) | ✅ 3/3 — §0.6 |

**Nada queda pendiente de decisión.** La guía está lista para ejecutarse.

### Dos ítems menores, a criterio del autor

| # | Ítem | Recomendación |
|---|---|---|
| 1 | **La línea sobre empleados en el Cap. 1** (§6, ficha F20): una oración que menciona que el módulo quedó a nivel de API y fuera del alcance entregado | **Incluirla.** Respeta G3, evita la apariencia de omisión involuntaria y refuerza A-05. La incluyo salvo indicación contraria |
| 2 | **Cabecera aclaratoria en `CONTEXT.md`** (§0.8) | Opcional. No afecta a la entrega, solo a la coherencia interna del repositorio |

---

## Siguiente paso: bloque B1 (13–14/09)

| Orden | Tarea | Depende de |
|---|---|---|
| 1 | **Glosario canónico** — cierra R-14 a R-16 y fija el vocabulario de ambos documentos | Nada |
| 2 | **Plantilla IEEE** — portada con `logo-utn.png`, numeración, estilos de figura y tabla | Nada |
| 3 | **Carga del juego de datos de demostración** (§16.bis) | Sistema levantado |
| 4 | **Capítulo 1** — contexto, problema, alcance entregado | Tareas 1 y 3 |

El glosario es el punto de partida natural: no depende de nada y todo lo demás lo usa.
