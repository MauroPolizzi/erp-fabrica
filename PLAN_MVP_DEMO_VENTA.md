# Plan de Implementación — MVP Demo de Venta de Material (`erp-backend`)

> **Versión 2 — Revisada contra el estado real del repositorio (2026-06-11).**
> Esta versión reemplaza al plan original, que asumía un arranque desde cero. La auditoría del código demostró que la base (bootstrap, schema, migración, auth, RBAC y el patrón CRUD) **ya está implementada**. Aquí solo queda el trabajo pendiente para cerrar el flujo de venta.
> Objetivo único: demostrar el flujo de **venta de un material de punta a punta** reutilizando la arquitectura existente.

---

## 0. Auditoría del Estado Actual

### 0.1 Componentes base — COMPLETADOS, NO REQUIEREN TRABAJO

| Componente | Estado | Archivo |
|---|---|---|
| App Express + middlewares globales + montaje de rutas | ✅ COMPLETADO | `src/app.ts` |
| Config (`database`, `environment`, `cors`) | ✅ COMPLETADO | `src/config/*` |
| `error-handler` (maneja `ZodError`, `AppError`, `Prisma` P2002/P2025, 500) | ✅ COMPLETADO | `src/shared/middlewares/error-handler.ts` |
| `validate` (Zod), `permission` (`requirePermission` + `admin.*`), `audit-log` (`writeAuditLog`) | ✅ COMPLETADO | `src/shared/middlewares/*` |
| Utils: `response` (`ok`/`paginated`), `pagination` (`getPagination`/`buildMeta`), `app-error`, `logger` | ✅ COMPLETADO | `src/shared/utils/*` |
| **Schema Prisma (21 modelos) + migración `20260605155905_init` aplicada** | ✅ COMPLETADO | `prisma/schema.prisma` |
| Auth: `POST /login`, `POST /refresh`, `GET /me` (JWT access+refresh, bcrypt) | ✅ COMPLETADO (excede lo pedido) | `src/modules/auth/*` |
| RBAC: middleware `authenticate` (resuelve permisos por rol) + `requirePermission` | ✅ COMPLETADO | `src/modules/auth/auth.middleware.ts` |
| Seed: permisos por módulo, roles, usuario `admin@perlinor.local` / `admin123` | ✅ COMPLETADO (falta sembrar categorías) | `prisma/seed.ts` |
| **Patrón CRUD de referencia** (`users`, `employees`): service + controller + dto Zod + routes | ✅ COMPLETADO — es la plantilla a clonar | `src/modules/employees/*` |

> **Consecuencia directa:** las antiguas *Fase 1 (fundaciones), auth, schema, migración y RBAC* del plan original quedan **ELIMINADAS** del roadmap. No se crea schema reducido, no se ejecuta migración inicial, no se implementa "auth mínima": todo eso ya existe y es superior a lo planificado.

### 0.2 Decisión arquitectónica: NO degradar el RBAC

El plan original proponía reemplazar el RBAC por "auth mínima solo con token". **Se descarta:** el RBAC granular ya funciona con `admin.*` y el usuario admin sembrado ya tiene ese comodín. Los módulos nuevos **deben** seguir el patrón existente:

```ts
routes.use(authenticate);
routes.get('/',   requirePermission('commercial.read'),   controller.list);
routes.post('/',  requirePermission('commercial.create'), validate(schema), controller.create);
```

Con `admin.*` el usuario de la demo pasa todos los checks; no hace falta tocar el seed de permisos.

### 0.3 Módulos del flujo de venta — STUBS (router vacío + TODO)

| Módulo | Estado | Qué hay hoy |
|---|---|---|
| `commercial/customers` | 🟡 SOLO STUB | `Router` + `authenticate`, comentario TODO |
| `inventory/finished-products` | 🟡 SOLO STUB | idem |
| `commercial/sales` | 🟡 SOLO STUB | idem |
| `categories` | 🔴 NO EXISTE | no hay módulo ni mount en `app.ts` |

### 0.4 Discrepancias plan original ↔ schema ya migrado (CORRECCIONES OBLIGATORIAS)

El diseño de entidades del plan original (§4) está **obsoleto**: nombraba campos inexistentes. **El schema migrado es la fuente de verdad.** Mapeo correcto a usar:

| Entidad | Plan original (INCORRECTO) | Schema real (USAR ESTO) |
|---|---|---|
| `FinishedProduct` | `code`, `unitPrice`, `minStock`, `description` | **`sku`**, **`salePrice`** *(no existen `minStock` ni `description`)* |
| `Customer` | `documentType` + `documentNumber` único | solo **`taxId`** (opcional, **sin** unique) |
| `Sale` | `saleNumber`, `date`, `isActive`, status `CONFIRMED` por defecto | *(sin `saleNumber`)*, **`soldAt`**, *(sin `isActive`)*, status default **`DRAFT`** → setear `CONFIRMED` explícito |
| `Sale` | `paymentMethod` opcional, sin IVA | **`paymentMethod` requerido**, existe campo **`tax`** (usar `0`) |
| `FinishedProductMovement` | `referenceId` (FK a Sale), `reason` | campo único **`reference`** (String? libre; guardar ahí el `sale.id`) |
| `Category` | enum solo `FINISHED_PRODUCT` | enum `RAW_MATERIAL`/`FINISHED_PRODUCT`; tabla con `@@unique([name, type])` |

**Política:** adaptar el código al schema; **no se generan nuevas migraciones** para la demo (ver Gaps §3 para las dos excepciones opcionales).

---

## 1. Flujo Funcional de la Demo (sin cambios respecto al objetivo)

1. **Login** → `POST /api/auth/login` (YA FUNCIONA) → access token.
2. **Crear cliente** → `POST /api/commercial/customers`.
3. **(Opcional) Categoría** → usar la sembrada, o `POST /api/categories`.
4. **Crear material** → `POST /api/inventory/finished-products` (nace con `currentStock = 0`).
5. **Cargar stock inicial** → `POST /api/inventory/finished-products/:id/movements` (tipo `IN`).
6. **Crear venta** → `POST /api/commercial/sales` (transaccional: valida stock, crea `Sale`+`SaleDetail`, descuenta `currentStock`, genera movimientos `OUT`, calcula totales).
7. **Consultar** → `GET /api/commercial/sales/:id`, `GET /api/inventory/finished-products/:id`.

> **Nota de rutas:** los paths reales respetan el montaje existente en `app.ts` (`/api/commercial/...`, `/api/inventory/...`), **no** los `/api/customers` / `/api/products` del plan original.

---

## 2. Trabajo Pendiente por Módulo

> Todos los módulos clonan el patrón de `employees` (service con `publicSelect`, `list` paginado con `search`, `getById`, `create` con chequeo de unicidad + `writeAuditLog`, `update`, `deactivate` lógico; controller que envuelve en `ok()`; dto Zod; routes con `authenticate` + `requirePermission` + `validate`).

### 2.1 `commercial/customers` — CRUD estándar
- **Reutiliza:** patrón `employees` 1:1. Modelo `Customer` ya existe.
- **Crear:** `customers.dto.ts` (Zod), `customers.service.ts`, `customers.controller.ts`; completar `customers.routes.ts`.
- **Campos DTO:** `name` (req, min 2), `taxId?`, `email?` (email), `phone?`, `address?`. *(No hay `documentType`; el documento es `taxId`.)*
- **Unicidad:** el schema no exige `taxId` único → en la demo no se valida unicidad (o ver Gap opcional G2).
- **Permiso:** `commercial.*` (cubierto por `admin.*`).
- **Estimación:** **Baja** (copia directa del patrón).

### 2.2 `categories` — alta + listado mínimo (MÓDULO NUEVO + MOUNT)
- **Reutiliza:** patrón de service/controller/routes. Modelo `Category` ya existe.
- **Crear:** módulo `src/modules/inventory/categories/*` y **montarlo en `app.ts`** (`api.use('/categories', categoriesRoutes)`).
- **Endpoints:** `GET /api/categories` (lista, no paginada), `POST /api/categories`.
- **DTO:** `name` (req), `type` (enum `CategoryType`). Respeta `@@unique([name, type])` (el `error-handler` ya traduce P2002 → 409).
- **Seed:** agregar 1–2 categorías `FINISHED_PRODUCT` a `seed.ts` para poder saltar este paso en la demo.
- **Estimación:** **Baja**.

### 2.3 `inventory/finished-products` — ABM + movimientos de stock
- **Reutiliza:** patrón `employees` + transacción Prisma.
- **Crear:** dto, service, controller; completar routes.
- **ABM (campos reales):** `sku` (req, único), `name` (req), `categoryId` (req, existente), `unit` (req), `salePrice` (decimal ≥ 0). **`currentStock` no se acepta en el body** (default 0, se mueve solo por movimientos). PUT no toca stock.
- **Movimientos (sub-recurso):**
  - `POST /api/inventory/finished-products/:id/movements` — body `{ type: 'IN'|'ADJUST', quantity, reference? }`. Dentro de `prisma.$transaction`: crea `FinishedProductMovement` y actualiza `currentStock` (`IN` suma; `ADJUST` fija el valor). `OUT` queda reservado a ventas.
  - `GET /api/inventory/finished-products/:id/movements` — historial paginado.
- **Permiso:** `inventory.*`.
- **Estimación:** **Media** (ABM Baja + movimientos transaccionales Media).

### 2.4 `commercial/sales` — núcleo transaccional (CRÍTICO)
- **Reutiliza:** `prisma.$transaction`, `decimal.js` (ya en deps), `error-handler`, `writeAuditLog`. Modelos `Sale`/`SaleDetail`/`FinishedProductMovement` ya existen.
- **`POST /api/commercial/sales`** — body `{ customerId, paymentMethod, items: [{ finishedProductId, quantity }] }`:
  1. Verifica cliente existente y activo.
  2. Por item: lee producto (activo), **congela `unitPrice` desde `salePrice`** del producto (nunca del cliente), valida `currentStock >= quantity`.
  3. Stock insuficiente en cualquier línea → `throw AppError` 422 → rollback total. *(Nota: `AppError` no tiene helper 422; agregar `static unprocessable()` o usar `new AppError(422, ...)`.)*
  4. Crea `Sale` (`status: 'CONFIRMED'`, `tax: 0`, `total = subtotal`) + `SaleDetail` con `lineTotal` calculado con `decimal.js`.
  5. Descuenta `currentStock` y crea movimientos `OUT` con `reference = sale.id`.
- **`GET /api/commercial/sales`** (paginado) y **`GET /api/commercial/sales/:id`** (con `details` + `customer`).
- **Permiso:** `commercial.*` o `sales.*` (ambos cubiertos por `admin.*`).
- **Estimación:** **Alta** (es la pieza con lógica de negocio y transacción).

---

## 3. Gaps para la Demo

### Funcionalidades faltantes
- CRUD de `Customer` (service/controller/dto; routes está stub).
- ABM de `FinishedProduct` + endpoint de movimientos de stock.
- Módulo `categories` (no existe) + su montaje en `app.ts`.
- Núcleo de ventas transaccional.
- Sembrado de categorías en `seed.ts`.

### Endpoints faltantes
- `GET/POST/PUT/DELETE /api/commercial/customers[/:id]`
- `GET/POST /api/categories`
- `GET/POST/PUT/DELETE /api/inventory/finished-products[/:id]`
- `POST/GET /api/inventory/finished-products/:id/movements`
- `POST/GET /api/commercial/sales`, `GET /api/commercial/sales/:id`

### Entidades faltantes
- **Ninguna.** Las 7 entidades del flujo (`User`, `Customer`, `Category`, `FinishedProduct`, `FinishedProductMovement`, `Sale`, `SaleDetail`) ya están modeladas y migradas. **No se requieren migraciones nuevas** salvo los dos gaps opcionales siguientes.

### Validaciones faltantes
- DTOs Zod de customers, categories, finished-products, movements y sales (no existen).
- Regla de negocio de stock insuficiente (422) en ventas.

### Integraciones / utilidades faltantes
- `AppError.unprocessable(422)` (hoy `app-error.ts` no tiene helper 422; el `error-handler` sí respeta `statusCode`, así que basta agregar el helper o instanciar `new AppError(422, msg)`).
- Comunicación `sales.service` → lectura/escritura de stock **dentro de la misma transacción** (`tx.finishedProduct` / `tx.finishedProductMovement`), respetando la convención de no acceder a modelos de otro módulo fuera de la capa de servicio.

### Gaps OPCIONALES (requieren micro-migración — excluibles de la demo)
- **G1 — `Sale.saleNumber` correlativo legible** (ej. `V-0001`): el campo no existe. Para la demo se usa `sale.id`. Si se quiere el correlativo, agregar columna nullable + lógica → migración. **Recomendación: omitir.**
- **G2 — Unicidad de documento de cliente:** el schema no la impone. Para la demo no se valida. Si se requiere, `@@unique` sobre `taxId` → migración. **Recomendación: omitir.**

---

## 4. Nuevo Roadmap

> Eliminadas las fases ya completas (bootstrap, schema, migración, auth, RBAC). Solo queda el camino Cliente → Material → Stock → Venta → Consulta.

| Fase | Objetivo | Tareas | Dependencias | Estimación |
|---|---|---|---|---|
| **F0 — Prep mínima** | Dejar lista la infra de soporte | (a) Agregar `AppError.unprocessable(422)`. (b) Sembrar 1–2 categorías `FINISHED_PRODUCT` en `seed.ts`. (c) `prisma generate` si hiciera falta. | Ninguna (base ya migrada) | **Baja** |
| **F1 — Clientes** | ABM de `Customer` | Clonar patrón `employees`: dto/service/controller + completar `customers.routes.ts`. Campos reales (`name`, `taxId?`, …). | F0 | **Baja** |
| **F2 — Categorías + Materiales** | Clasificar y dar de alta materiales | (a) Módulo `categories` (`GET`/`POST`) + montar en `app.ts`. (b) ABM `finished-products` con campos reales (`sku`, `salePrice`); `currentStock` no editable por body. | F0 | **Media** |
| **F3 — Stock** | Cargar stock inicial y registrar movimientos | `POST/GET /finished-products/:id/movements` (`IN`/`ADJUST`) en `$transaction`, actualiza `currentStock`. | F2 | **Media** |
| **F4 — Ventas (núcleo)** | Venta transaccional con descuento de stock | `POST /commercial/sales` en `$transaction`: valida cliente y stock por línea, congela `salePrice`, crea `Sale`(`CONFIRMED`)+`SaleDetail`, descuenta stock, movimientos `OUT` (`reference = sale.id`), totales con `decimal.js`. 422+rollback si falta stock. `GET` listado y `GET /:id`. | F1, F2, F3 | **Alta** |
| **F5 — Verificación E2E** | Flujo reproducible | (a) Archivo `.http`/REST o script: login → cliente → material → stock → venta → consultas. (b) Tests Vitest+Supertest: happy path + venta sin stock (422+rollback). (c) README de la demo. | F1–F4 | **Media** |

### Ruta crítica mínima
`F0 → F1 → F2 → F3 → F4`. Con eso el flujo corre punta a punta. **F5** (tests + reproducibilidad) es robustez recomendada pero no bloqueante para una demo "viva".

### Estimación global
Mayoría **Baja/Media** porque no hay infraestructura, schema ni auth por construir: se clona un patrón CRUD ya probado y solo la venta concentra la complejidad (**Alta**).

---

## 5. Riesgos y Supuestos (vigentes)

- **Concurrencia de stock:** mitigada por `$transaction` con lectura del stock dentro de la transacción; bloqueo pesimista/optimista fuera de alcance (riesgo bajo con pocos usuarios).
- **Precisión decimal:** usar `decimal.js` (ya en dependencias) para montos; `Decimal(12,3)` para cantidades; `Decimal(12,2)` para precios/totales.
- **Sin migraciones nuevas** (salvo G1/G2 opcionales): reduce superficie de error y respeta el schema ya aplicado.
- **`paymentMethod` es requerido** por el schema: el DTO de venta debe exigirlo (o el seed/demo enviar `CASH`).
- **`total = subtotal`** (`tax = 0`); sin IVA en la demo.
- **Status de venta:** se confirma directo (`CONFIRMED`); no hay flujo de borrador/aprobación pese a que el enum lo permite.
- **Usuario `admin@perlinor.local` / `admin123`** con rol `Administración` (`admin.*`) ya sembrado: cubre todos los `requirePermission`.

---

## 6. Fuera de Alcance (diferido, sin cambios)

Materias primas + costo promedio, producción/consumo de MP, proveedores/compras/pagos, cajas y movimientos financieros, facturación/CAE, reportes PDF/Excel, colas (BullMQ/Redis), gestión de roles/permisos por UI. Sus modelos **ya existen** en el schema, pero sus módulos permanecen como stubs y no se desarrollan para esta demo.
