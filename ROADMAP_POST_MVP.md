# Evaluación y Roadmap Post-MVP — PerliNor ERP

> Documento de recomendaciones basado en **auditoría del código real** (no de la documentación).
> Fecha: 2026-07-27.

> **Aclaración clave:** `CONTEXT.md` describe una arquitectura aspiracional. El código real
> implementa solo el corredor de la demo (**Cliente → Material → Stock → Venta**). Muchos módulos
> existen únicamente como *stubs* (`routes.ts` con `authenticate` + un `// TODO`), y varias
> entidades del `schema.prisma` no tienen capa de servicio. Este roadmap se basa en lo que
> **está construido**, no en lo que el schema promete.

---

## 1. Auditoría del estado actual (verificada sobre código)

### 1.1 Backend — qué está realmente implementado

| Módulo | Estado real | Detalle |
|---|---|---|
| `auth` | ✅ Completo | login, refresh, `/me`. JWT access(15m)+refresh(7d) |
| `users` | ✅ CRUD | controller+service+dto |
| `employees` | ✅ CRUD | controller+service+dto |
| `inventory/categories` | ✅ CRUD | controller+service+dto |
| `inventory/finished-products` | ✅ Completo | CRUD + movimientos de stock `IN`/`ADJUST` + historial |
| `commercial/customers` | ✅ CRUD | controller+service+dto |
| `commercial/sales` | ✅ Núcleo | list, getById, create **transaccional** (multi-línea, congela precio, valida stock, audita) |
| `inventory/raw-materials` | 🔴 **Stub** | solo `routes.ts` con TODO |
| `production` | 🔴 **Stub** | solo `routes.ts` con TODO |
| `commercial/suppliers` | 🔴 **Stub** | solo `routes.ts` con TODO |
| `finance/sales-cash` | 🔴 **Stub** | solo `routes.ts` con TODO |
| `finance/payments` | 🔴 **Stub** | solo `routes.ts` con TODO |
| `finance/invoicing` | 🔴 **Stub** | solo `routes.ts` con TODO |
| `reports` | 🔴 **Stub** | solo `routes.ts` con TODO |
| `audit` | 🔴 **Stub** (escritura sí funciona) | `writeAuditLog` se invoca desde services, pero **no hay endpoint de consulta** |

**Arquitectura backend (sólida y consistente):** módulos verticales `controller → service → routes → dto`,
Express + Prisma, validación con Zod vía middleware `validate`, `AppError` + `errorHandler` centralizado
(mapea ZodError, AppError y errores Prisma P2002/P2025), paginación server-side homogénea,
helmet/cors/compression/rate-limit. El patrón es bueno y **no requiere reescritura**.

**Entidades en el schema sin capa de servicio** (existen en la BD por la migración `init`, pero ningún
código las usa): `RawMaterial`, `RawMaterialMovement`, `ProductionRecord`, `ProductionConsumption`,
`Supplier`, `CashRegister`, `CashMovement`, `SupplierPayment`, `Invoice`. El modelo de datos ya está
diseñado para el ERP completo; falta el código.

**Infraestructura muerta (deuda técnica concreta):**
- `jobs/queue.ts` y los processors (`reportWorker`, `emailWorker`) **nunca se importan** desde
  `app.ts`/`server.ts`. BullMQ + Redis + ioredis son dependencias que hoy no ejecutan nada.
- Una sola migración (`20260605155905_init`).
- Sin OpenAPI/Swagger.
- Tests: solo `health.test.ts` y `sales-flow.test.ts` (E2E que requiere Postgres real + seed).
  Cero tests unitarios.

### 1.2 Frontend — qué está realmente implementado

| Feature | Pantallas | Estado |
|---|---|---|
| `auth/login` | login | ✅ |
| `dashboard` | landing | ⚠️ Estático — atajos al flujo demo, **sin KPIs reales** |
| `commercial/customers` | list + form | ✅ CRUD con baja lógica |
| `commercial/sales` | list + form multi-línea + detail | ✅ Núcleo |
| `inventory/finished-products` | list + form + diálogo de stock | ✅ |
| `inventory/categories` | solo form | ⚠️ **Sin listado** (alta inline) |

**No existen pantallas** para: usuarios, empleados, materias primas, producción, proveedores, finanzas,
reportes, auditoría. El sidebar solo expone 4 ítems (Inicio, Clientes, Materiales, Ventas).

**Arquitectura frontend (moderna y correcta):** Angular 19 standalone, lazy-loading por feature, **Signals**
(`signal`/`computed`/`toSignal`), Reactive Forms, `OnPush` en todos lados, interceptores funcionales
(`jwtInterceptor` con refresh automático + reintento, `errorInterceptor` con toasts), `permissionGuard`
**correctamente cableado** con `data.permission` en cada feature route, componentes compartidos reutilizables
(`data-table`, `confirm-dialog`, `page-header`, `loading-spinner`), pipes `currency-ars`/`date-format`.
`ApiService` desempaqueta el sobre `{ data }` y unifica paginación. Uso consistente de `decimal.js` para
montos. **Base muy buena; no requiere reescritura.**

---

## 2. Evaluación del MVP (flujo Cliente → Material → Stock → Venta)

El flujo funciona y está bien resuelto para su alcance. `sales.service.ts` es el mejor código del repo:
transacción atómica, agrega cantidades por producto repetido, congela `salePrice`, valida stock con
rollback (422), genera movimientos `OUT` trazables y descuenta stock. El test E2E cubre el happy path
y el rollback por falta de stock.

### Puntos débiles reales del flujo

| # | Debilidad | Evidencia en código | Severidad |
|---|---|---|---|
| D1 | **Oversell por concurrencia.** Dos ventas simultáneas leen `currentStock=10`, ambas validan y ambas escriben `4` → se venden 12 de 10. *Lost update* clásico bajo aislamiento Read Committed. | `sales.service.ts:69-118`: read-check-write sin `SELECT FOR UPDATE`, sin decremento condicional ni `isolationLevel: Serializable`. | 🔴 Alta |
| D2 | **La venta no registra quién la hizo.** `Sale` no tiene `userId`. El actor solo va al `AuditLog` (best-effort). | `schema.prisma:268` (model `Sale` sin `createdBy`). | 🟠 Media |
| D3 | **No hay anulación de venta.** El enum `SaleStatus` tiene `CANCELLED` pero no hay endpoint que lo use ni reversión de stock. | `sales.routes.ts` (solo GET/GET/POST). | 🟠 Media |
| D4 | **`DRAFT` es fantasma.** La venta siempre se crea `CONFIRMED`; no existe flujo de borrador. | `sales.service.ts:95`. | 🟢 Baja |
| D5 | **Venta desconectada de finanzas.** Al confirmar no se genera `CashMovement` ni `Invoice`. Cajas y facturación quedan vacías por diseño. | Módulos finance = stubs. | 🟠 Media |
| D6 | **Sin IVA ni descuentos.** `tax` hardcodeado a `'0'`, sin línea de descuento ni override de precio. | `sales.service.ts:91,99`. | 🟠 Media |
| D7 | **Listado de ventas sin filtros.** `list()` no filtra por cliente, fecha ni estado; solo pagina por `soldAt desc`. | `sales.service.ts:16-28`. | 🟢 Baja |

### Casos de negocio no contemplados
- Cargar stock de un producto **exige crear antes su categoría** desde un form sin listado → fricción de UX.
- No existe el concepto de **materia prima → producción → producto terminado** en el runtime (todo el brazo
  izquierdo del ERP está en stubs), aunque el schema lo modela.
- Solo el rol **Administración** tiene permisos sembrados; los otros 4 roles se crean **sin ningún permiso**
  → hoy son inutilizables. No hay UI de usuarios/roles.

---

## 3. Mejoras técnicas (solo las que el código realmente pide)

**Backend**
1. **Concurrencia de stock (D1)** — cambiar el read-check-write por un decremento atómico condicional o
   `isolationLevel: 'Serializable'` con reintento. *Es el único defecto de corrección de datos serio.*
2. **Refresh tokens sin estado** — `auth.service.ts` firma refresh tokens pero no los persiste: **no hay
   logout server-side ni revocación**. Para 5 usuarios internos es tolerable, pero conviene una tabla de
   refresh tokens (o denylist) antes de exponer el sistema.
3. **Auditoría en endpoint** — la escritura funciona; falta el GET de consulta (el stub ya existe).
4. **Decidir sobre BullMQ/Redis** — o se usan (reportes async/email) o se eliminan del stack. Hoy son
   peso muerto que confunde.
5. **OpenAPI** — con Zod ya presente, generar spec con `zod-to-openapi` es barato y desbloquea
   documentación + contract testing.

**Frontend**
1. **Sidebar no respeta permisos** — muestra los 4 ítems a todos por igual (el `permissionGuard` sí
   protege la navegación, pero el menú no oculta lo no permitido). Menor hoy porque solo hay admin.
2. **Tokens en `localStorage`** — expuestos a XSS. Aceptable para intranet; a revisar si el sistema sale
   a internet.
3. **Listado de categorías** — falta la pantalla; hoy se crean inline.

> **No necesitan cambios** (están bien): estructura de módulos, manejo de errores (interceptor + toasts),
> loading states (signals `loading`/`saving`), validaciones de formularios, paginación server-side, uso de
> decimal.js. **No sobre-ingenierizar acá.**

---

## 4–5. Funcionalidades priorizadas

Leyenda complejidad/valor: 🟢 baja · 🟡 media · 🔴 alta.

| Prioridad | Funcionalidad | Backend | Frontend | Valor | Complejidad | Dependencias |
|---|---|---|---|---|---|---|
| **P0** | Fix oversell de stock (D1) | Decremento atómico en `sales.service` + test | — | 🔴 | 🟢 | — |
| **P0** | Sembrar permisos de los 5 roles + UI usuarios/roles | Seed + `users` (ya CRUD) | Pantallas users/roles | 🔴 | 🟡 | — |
| **P0** | `Sale.createdBy` + trazabilidad de actor | Migración + set en create | Mostrar en detalle | 🟡 | 🟢 | — |
| **P0** | Decidir BullMQ/Redis (usar o quitar) | Limpieza o wiring | — | 🟡 | 🟢 | — |
| **P1** | Anulación de venta con reversión de stock (D3) | Endpoint `PATCH /:id/cancel` transaccional | Botón + confirm en detalle | 🔴 | 🟡 | createdBy |
| **P1** | IVA + descuentos en venta (D6) | Cálculo tax/desc en service+dto | Inputs en sale-form | 🔴 | 🟡 | — |
| **P1** | Filtros/búsqueda en listado de ventas (D7) | `where` por cliente/fecha/estado | Filtros en sale-list | 🟡 | 🟢 | — |
| **P1** | Caja de ventas conectada a la venta (D5) | Implementar `sales-cash` + hook en sale create | Pantalla caja | 🔴 | 🟡 | anulación |
| **P1** | Consulta de auditoría | Endpoint GET (stub→real) | Pantalla read-only | 🟡 | 🟢 | permisos |
| **P2** | Materias primas + producción (brazo izquierdo) | Implementar 2 stubs (schema listo) | 2 features nuevos | 🔴 | 🔴 | — |
| **P2** | Proveedores + pagos | Implementar stubs | Features | 🟡 | 🟡 | — |
| **P2** | Dashboard con KPIs reales | Endpoint de métricas | Reemplazar landing estática | 🔴 | 🟡 | ventas/stock |
| **P2** | Facturación (A/B/C/Recibo, CAE) | `invoicing` real | Pantalla | 🔴 | 🔴 | caja |
| **P3** | Reportes PDF/Excel (aquí sí usar BullMQ) | Processors reales | Descargas | 🟡 | 🔴 | métricas |
| **P3** | Categorías/UM/costos avanzados de producto | Extensión | Pantallas | 🟡 | 🟡 | — |

---

## 6. Roadmap propuesto (por fases)

**Fase 0 — Hardening del MVP** *(lo que hay que arreglar antes de sumar features)*
Fix oversell (D1) · `Sale.createdBy` · sembrar permisos de los 5 roles · UI mínima de usuarios/roles ·
decisión sobre BullMQ/Redis · endpoint de auditoría. Cierra los agujeros que se agrandan con cada feature nueva.

**Fase 1 — Consolidación de ventas**
Anulación con reversión de stock · IVA + descuentos · filtros en listado · caja de ventas conectada a la
venta. Convierte la "venta demo" en un proceso comercial real.

**Fase 2 — Inventario completo**
Ajustes/alertas de stock mínimo (`minStock` ya existe en schema y hoy no se usa) · listado de categorías ·
costos. El schema ya soporta casi todo.

**Fase 3 — Producción y materias primas**
Implementar los stubs `raw-materials` + `production` (schema ya modela `ProductionRecord`/`Consumption` y
costo promedio ponderado). Cierra el ciclo MP → producción → PT.

**Fase 4 — Compras y proveedores** *(condicional a necesidad de negocio)*
`suppliers` + `payments`. Recomendado **solo si** compran MP a proveedores; si no, postergar.

**Fase 5 — Dashboard, reportes y facturación**
KPIs reales · reportes PDF/Excel (aquí recién tiene sentido activar BullMQ) · facturación/CAE (alta
complejidad AFIP — evaluar aparte).

**Fase 6 — Calidad y escalabilidad**
Tests unitarios de services · OpenAPI · CI/CD · logging con correlación · revocación de tokens si sale a internet.

---

## 7. Recomendaciones específicas (Situación → Problema → Recomendación → Beneficio)

**R1 — Concurrencia de stock**
*Situación:* `create` lee stock, valida y escribe dentro de la transacción. → *Problema:* bajo Read Committed
dos ventas concurrentes sobre-venden. → *Recomendación:* decremento atómico condicional
(`updateMany where currentStock >= required` y verificar `count`) o `Serializable` con reintento.
**Backend únicamente.** → *Beneficio:* integridad de stock garantizada; es la corrección de mayor impacto
y menor esfuerzo.

**R2 — Roles sin permisos**
*Situación:* el seed solo da `admin.*` a Administración; los otros 4 roles quedan vacíos. → *Problema:* el
modelo RBAC está construido de punta a punta (middleware backend + `permissionGuard` frontend) pero es
inutilizable con roles no-admin. → *Recomendación:* sembrar permisos por rol + pantalla de gestión de
usuarios/roles (el CRUD de `users` ya existe en backend). **Backend:** seed + endpoints roles.
**Frontend:** features `users`/`roles`. → *Beneficio:* habilita a los 5 usuarios reales del negocio;
hoy solo admin puede operar.

**R3 — Venta ↔ Finanzas desconectadas**
*Situación:* confirmar una venta no genera movimiento de caja ni comprobante. → *Problema:* las cajas y
facturación (stubs) nunca tendrán datos. → *Recomendación:* al confirmar, generar `CashMovement` en la caja
de ventas dentro de la misma transacción. **Backend:** `sales-cash` + hook en `sales.service`.
**Frontend:** pantalla de caja. → *Beneficio:* trazabilidad financiera real del ingreso.

**R4 — Anulación con reversión**
*Situación:* `SaleStatus.CANCELLED` existe pero nada lo usa. → *Problema:* un error de carga no tiene remedio
salvo tocar la BD. → *Recomendación:* endpoint transaccional que pase a `CANCELLED`, genere movimientos `IN`
de reversión y (si aplica) revierta la caja. **Backend + Frontend.** → *Beneficio:* operación corregible sin
intervención técnica.

**R5 — Infra de colas muerta**
*Situación:* BullMQ/Redis/processors existen pero no se importan. → *Problema:* dependencias y un servicio
Docker (Redis) sin función; confunde a quien mantiene. → *Recomendación:* quitarlos ahora y reintroducirlos
recién en Fase 5 (reportes async), **o** cablear un worker mínimo si se usarán pronto. → *Beneficio:* menos
superficie que mantener y menos discrepancia entre `CONTEXT.md` y la realidad.

> **Nota transversal:** conviene actualizar `CONTEXT.md` para marcar qué está implementado vs. planificado.
> Hoy describe el ERP completo como si existiera, y eso induce a error en el análisis y en el onboarding.

---

## 8. Top 10 post-MVP (orden recomendado)

1. **Fix oversell de stock** — es un bug de integridad de datos; todo lo demás se apoya en que el stock sea
   confiable. Mínimo esfuerzo, máximo impacto.
2. **Sembrar permisos de los 5 roles + UI de usuarios/roles** — desbloquea que el sistema lo usen personas
   reales, no solo el admin. El RBAC ya está construido; falta "encenderlo".
3. **`Sale.createdBy` + actor en operaciones** — trazabilidad básica de negocio; barato de agregar y
   prerequisito de anulación/reportes.
4. **Decisión BullMQ/Redis (limpiar)** — elimina deuda y alinea el código con la realidad antes de crecer.
5. **Anulación de venta con reversión de stock** — primera necesidad operativa real; sin esto un error obliga
   a tocar la BD.
6. **IVA + descuentos en la venta** — imprescindible para que la venta sea fiscalmente válida en Argentina;
   el resto de finanzas depende de totales correctos.
7. **Caja de ventas conectada a la venta** — convierte el ingreso en un dato financiero rastreable y da
   sentido al módulo `finance`.
8. **Filtros/búsqueda en listado de ventas** — a poco volumen el listado plano se vuelve inusable; mejora de
   UX de bajo costo.
9. **Endpoint + pantalla de auditoría** — la escritura ya existe; exponerla cierra el ciclo de control interno
   con poco esfuerzo.
10. **Dashboard con KPIs reales** — reemplaza la landing estática por valor de gestión (ventas del período,
    stock bajo con `minStock`, top clientes), una vez que ventas e inventario ya son confiables.

*Los ítems 1–4 son Fase 0 (hardening); 5–8 consolidan ventas; 9–10 abren visibilidad. Producción, proveedores
y facturación quedan deliberadamente fuera del top 10: son valiosos pero dependen de que este núcleo esté
firme primero.*
