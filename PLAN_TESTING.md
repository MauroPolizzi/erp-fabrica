# Plan de Testing — PerliNor ERP (Backend + Frontend)

> Plan de implementación de tests **dividido por fases**, alineado al stack y a los patrones
> que ya existen en el repo. Cubre los **endpoints del backend** y los **services/componentes
> del frontend**. Cada fase espeja una fase funcional ya implementada (F0–F5).

---

## 0. Stack y estado actual

### Backend (`erp-backend`)
- **Runner:** [Vitest](https://vitest.dev) (`vitest run` / `vitest`). Config en `vitest.config.ts`
  (`environment: node`, `globals: true`, incluye `tests/**/*.test.ts` y `src/**/*.test.ts`).
- **HTTP:** [supertest](https://github.com/ladjs/supertest) sobre `createApp()` (no levanta servidor real).
- **Tipo de test dominante:** **integración** contra una base PostgreSQL real (Prisma), con
  datos auto-generados (sufijo único) y limpieza en `afterAll`.
- **Ya existe:**
  - `tests/health.test.ts` — smoke de `GET /health`.
  - `tests/sales-flow.test.ts` — E2E del flujo (login → cliente → material → stock → venta + 422/rollback).

### Frontend (`erp-frontend`)
- **Runner:** [Karma](https://karma-runner.github.io) + [Jasmine](https://jasmine.github.io) (`ng test`),
  con `karma-coverage` ya instalado.
- **Utilidades:** `TestBed`, `HttpTestingController` (`provideHttpClientTesting`), `fakeAsync`/`tick`.
- **Ya existe:** `src/app/app.component.spec.ts` (smoke de creación).

### Convenciones de este plan
- **Backend:** un archivo por módulo en `tests/<modulo>.test.ts` (integración). Lógica pura
  (utils) puede ir como unit test co-localizado `src/**/<x>.test.ts`.
- **Frontend:** spec co-localizado `*.component.spec.ts` / `*.service.spec.ts` junto al archivo.
- **Naming:** `describe('<unidad>')` + `it('<comportamiento esperado>')` en español, como los tests existentes.
- **Aislamiento:** cada test crea/limpia sus propios datos; nada depende del orden ni de datos previos (salvo el seed admin/categorías).

### Pre-requisitos de ejecución
- **Backend:** PostgreSQL accesible + seed aplicado (`pnpm --filter erp-backend db:seed`).
  **Recomendado:** un `DATABASE_URL` de **base de tests dedicada** (`.env.test`) para no ensuciar dev.
- **Frontend:** no requiere backend (todo HTTP se mockea con `HttpTestingController`).

### Comandos
```bash
# Backend
pnpm --filter erp-backend test            # vitest run
pnpm --filter erp-backend test:watch
# (a agregar) test:coverage -> "vitest run --coverage"

# Frontend
pnpm --filter erp-frontend test           # ng test (Karma)
# (a agregar) test:ci -> "ng test --watch=false --browsers=ChromeHeadless --code-coverage"
```

---

## Fase T0 — Infraestructura de testing + núcleo

**Objetivo:** dejar helpers y testear la base transversal que sostiene todas las features.

### Backend
| Unidad | Casos |
|---|---|
| `shared/utils/response` (`ok`, `paginated`) | sobre `{ data }` sin meta; `{ data, meta }` con meta |
| `shared/utils/pagination` (`getPagination`, `buildMeta`) | defaults; clamp a `MAX_PAGINATION_LIMIT`; `skip` correcto; `totalPages` (incluye `total=0 → 1`) |
| Helpers de test | `loginAsAdmin()` → token; `authHeader(token)`; factory de datos con sufijo único |
| App smoke | `GET /health` (ya existe); 404 handler para ruta inexistente |

### Frontend (núcleo `core/`)
| Unidad | Casos |
|---|---|
| `ApiService` | `get` desempaqueta `{data}`; `getPaged` devuelve `{data,meta}`; `post/patch/put/delete` envían body y URL correctos; `toParams` ignora `null/undefined/''` |
| `AuthService` | `login` guarda tokens y encadena `/auth/me` (setea `currentUser`); `refresh` actualiza token; `hasPermission` (incluye `admin.*`); `logout` limpia storage y signal; `isAuthenticated` |
| `jwtInterceptor` | adjunta `Bearer` salvo en `/auth/*`; en **401** llama `refresh` y reintenta; si refresh falla → `logout` |
| `errorInterceptor` | **no** toast en 401; toast (mensaje del backend) en ≥400 restantes |
| `authGuard` | con token → `true`; sin token → `UrlTree('/login')` con `returnUrl` |
| `permissionGuard` | sin `data.permission` → `true`; con permiso → `true`; sin permiso → `UrlTree('/')` |
| Pipes `currencyArs` / `dateFormat` | formato `$ 1.234,56` (es-AR); `—` para vacío/NaN; `DD/MM/YYYY` y `datetime`; `—` para fecha inválida |
| `NotificationService` | delega `success/error/info/warn` en `MessageService.add` con severidad correcta |

**Técnicas FE:** `HttpTestingController` para services/interceptores; spies de `MessageService`/`Router`;
`AuthService` con `localStorage` real (limpiar en `afterEach`).

**Salida de fase:** helpers backend listos; `core` con cobertura alta (es la base de todo).

---

## Fase T1 — Auth / Login / Sesión

**Objetivo:** asegurar autenticación end-to-end y la pantalla de login.

### Backend — endpoints
| Endpoint | Casos |
|---|---|
| `POST /api/auth/login` | 200 + `accessToken`/`refreshToken` con credenciales válidas; **401** inválidas; 400 body inválido (email/cuerpo faltante) |
| `POST /api/auth/refresh` | 200 + nuevo `accessToken` con refresh válido; 401 con refresh inválido/ausente |
| `GET /api/auth/me` | 200 + usuario (con `permissions`) con token; **401** sin token / token inválido |

### Frontend — componentes
| Unidad | Casos |
|---|---|
| `LoginComponent` | form inválido no envía (marca touched); submit OK → `AuthService.login` y navega a `returnUrl`/`/dashboard`; **401** → mensaje inline "incorrectos"; otro error → mensaje genérico; `loading` togglea botón; si ya autenticado en `ngOnInit` → redirige |

**Nota:** la restauración de sesión (`provideAppInitializer` → `/auth/me`) se valida indirectamente
en T0 (`AuthService.loadProfile`); su integración a nivel app es candidata a E2E (T5).

---

## Fase T2 — Clientes (ABM)

### Backend — `/api/commercial/customers`
| Caso | Esperado |
|---|---|
| `GET` paginado | `{data, meta}`; respeta `page/limit`; `search` filtra por name/taxId/email |
| `GET /:id` | 200 existente; **404** inexistente |
| `POST` | 201 + `isActive:true`; **400** si `name` < 2; campos opcionales aceptados |
| `PATCH /:id` | 200 actualiza; 404 inexistente |
| `DELETE /:id` | 200 con `isActive:false` (baja lógica, sin borrado físico) |
| RBAC | **401** sin token en cualquiera de las rutas |

### Frontend
| Unidad | Casos |
|---|---|
| `CustomerService` | URLs/métodos correctos: `list` (`getPaged` con page/limit/search), `getById`, `create` (POST), `update` (**PATCH**), `deactivate` (DELETE) |
| `CustomerListComponent` | `onLazyLoad` llama service y mapea `estado`; `total` seteado; `onNew/onEdit` navegan; `onDeactivate` abre confirm → service → toast → recarga |
| `CustomerFormComponent` | modo alta vs edición (param `:id` → `patchValue`); validaciones (`name` req min2, `email` formato); submit normaliza vacíos a `undefined`, success → toast + navega; `loadingData` en edición |

---

## Fase T3 — Materiales + Categorías + Stock

### Backend
| Endpoint | Casos |
|---|---|
| `GET /api/categories` | lista; filtra por `?type=FINISHED_PRODUCT` |
| `POST /api/categories` | 201; **409** si `name`+`type` duplicado; 400 si `name`<2 |
| `GET /api/inventory/finished-products` | paginado; `search` por sku/name |
| `GET /:id` | 200 con `category` embebida; **404** inexistente |
| `POST` | 201 + `currentStock:'0'`; **409** sku duplicado; **400** categoría inexistente; 400 datos inválidos |
| `PATCH /:id` | 200; **409** si nuevo sku ya existe; no toca `currentStock` |
| `DELETE /:id` | baja lógica `isActive:false` |
| `POST /:id/movements` | `IN` suma (`currentStock` actualizado); `ADJUST` fija; 400 tipo `OUT`/cantidad ≤0; 404 producto inexistente |
| `GET /:id/movements` | historial paginado |

### Frontend
| Unidad | Casos |
|---|---|
| `CategoryService` | `list(type?)` GET con/sin `type`; `create` POST |
| `FinishedProductService` | todas las rutas; `addMovement` (POST `/:id/movements`), `listMovements` (`getPaged`) |
| `CategoryFormComponent` | inválido no envía; success → emite `created` con la categoría + reset; `cancel` emite `cancelled` |
| `StockMovementDialogComponent` | `onShow` resetea (`type=IN`, qty null); validación cantidad; submit → `addMovement` → emite `saved(currentStock)` y cierra; `IN` vs `ADJUST` |
| `ProductListComponent` | mapeo `categoryName` (id→nombre) y `estado`; abrir diálogo de stock (`selectedProduct`); `onStockSaved` recarga |
| `ProductFormComponent` | combo cargado; alta rápida (`onCategoryCreated` agrega y selecciona); **409 sku → `duplicateSku` inline**; `currentStock` read-only en edición; submit create/update |

---

## Fase T4 — Ventas (núcleo)

### Backend — `/api/commercial/sales`
| Caso | Esperado |
|---|---|
| `POST` happy path | 201, `status:CONFIRMED`, `subtotal/total` con decimal, `details` con `unitPrice/lineTotal` congelados |
| Efectos | genera movimientos `OUT` (reference = sale.id) y **descuenta** `currentStock` |
| **422** stock insuficiente | mensaje con nombre del producto + **rollback** (sin venta, sin movimientos, stock intacto) — *ya cubierto en `sales-flow.test.ts`, extender a multi-línea* |
| **400** | cliente inexistente/inactivo; producto inexistente/inactivo |
| Líneas repetidas | agrega cantidades del mismo producto y valida stock total |
| `GET` lista | paginado; incluye `customer` y `details` |
| `GET /:id` | 200 con `customer`+`details`; **404** inexistente |
| Precisión decimal | totales con 2 decimales; sin errores de coma flotante |

### Frontend
| Unidad | Casos |
|---|---|
| `SaleService` | `create` (POST body `{customerId,paymentMethod,items}`), `list` (`getPaged`), `getById`; `paymentMethodLabel` mapea enum→etiqueta |
| `SaleFormComponent` | agrega/quita líneas (mín 1); **preview** subtotal/total con `decimal.js` reactivo; `paymentMethod` requerido default `CASH`; submit OK → navega a `/commercial/sales/:id`; **error/422 → no navega**, `saving` vuelve a false; avisos `noCustomers`/`noProducts` |
| `SaleListComponent` | mapea `customerName`/`medioPago`/`estado`; `onView` navega al detalle |
| `SaleDetailComponent` | carga venta (`loading`); mapea nombres de producto en `detailRows`; muestra totales; 404 → vuelve a la lista |

**Técnica clave FE:** mockear `CustomerService`/`FinishedProductService` con datos fijos para
verificar el cálculo del preview (p. ej. precio 8500 × 5 = 42500) sin tocar HTTP.

---

## Fase T5 — E2E, layout y cobertura

**Objetivo:** asegurar el recorrido completo y fijar umbrales de calidad.

### Backend
- **E2E de flujo** (`tests/sales-flow.test.ts`, ya existe): extender con
  venta multi-línea, venta con líneas repetidas y baja lógica que impide vender material inactivo.
- **Cobertura:** agregar script `test:coverage` (`vitest run --coverage`, provider `v8`) y
  umbral sugerido (ver tabla). Excluir `prisma/`, `*.routes.ts` triviales.

### Frontend
- **Smoke de layout:** `MainLayout` (toggle `collapsed`), `Sidebar` (ítems activos/deshabilitados),
  `Header` (email del `currentUser`, logout → `AuthService.logout` + navega `/login`).
- **Shared:** `DataTableComponent` (emite `lazyLoad` con page/limit/search; **debounce** de búsqueda con
  `fakeAsync`/`tick(300)`; reset a página 1 al buscar; slot `rowActions`); `PageHeader`/`ConfirmDialog`/`LoadingSpinner` (render básico).
- **Dashboard:** tarjetas con `routerLink`; acción "Nueva venta" navega.
- **Cobertura:** `ng test --code-coverage` (karma-coverage ya instalado); umbral en `karma.conf`/`angular.json`.
- **(Opcional) E2E de navegador:** Playwright/Cypress para el recorrido real
  (login → cliente → material → stock → venta). **Fuera del stack actual** — decisión aparte.

### Umbrales de cobertura sugeridos
| Capa | Mínimo |
|---|---|
| Backend services (`*.service.ts`) | 85% |
| Backend endpoints (vía integración) | rutas críticas 100% (auth, sales, stock) |
| Frontend `core/` (services, guards, interceptores, pipes) | 90% |
| Frontend services de feature | 90% |
| Frontend componentes | 70% (lógica; el template se valida en build AOT) |

---

## Orden de implementación recomendado

`T0` (base + helpers) → `T1` (auth) → `T2` (clientes) → `T3` (materiales/stock) →
`T4` (ventas) → `T5` (E2E + cobertura).

> La **ruta crítica de valor** es `T0 → T4` (núcleo de la demo: auth + venta con 422/rollback y
> preview decimal). `T2`/`T3` aseguran los datos de entrada; `T5` fija calidad y E2E.

## Checklist de avance

- [ ] T0 — utils backend + helpers; `core` frontend (ApiService, AuthService, interceptores, guards, pipes)
- [ ] T1 — endpoints auth; `LoginComponent`
- [ ] T2 — endpoints customers; `CustomerService` + list/form
- [ ] T3 — endpoints categories/finished-products/movements; services + form/list/dialog
- [ ] T4 — endpoints sales (incl. 422/rollback multi-línea); `SaleService` + form/list/detail
- [ ] T5 — E2E backend extendido; smoke layout/shared/dashboard; cobertura + scripts `test:coverage`/`test:ci`

---

## Scripts a agregar

```jsonc
// erp-backend/package.json
"test:coverage": "vitest run --coverage"

// erp-frontend/package.json
"test:ci": "ng test --watch=false --browsers=ChromeHeadless --code-coverage"
```

> Para CI: usar una base de datos de tests dedicada (`.env.test` con `DATABASE_URL` propio) y
> `ChromeHeadless` en el frontend. Correr seed antes de los tests de integración del backend.
