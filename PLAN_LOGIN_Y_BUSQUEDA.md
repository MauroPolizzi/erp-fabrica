# Plan de implementación — Recuperación de contraseña + Búsqueda en grillas

> Basado en auditoría del código real de `erp-backend` y `erp-frontend`.
> Fecha: 2026-08-14. Base: rama `dev`, commit `5dbeec6` (MVP + reportería/gráficos estables).
>
> **Estado (2026-08-17):** Feature 1 implementada y verificada (§2.4). Feature 2 pendiente,
> con las decisiones de §5 ya cerradas.

---

## 1. Estado actual (hallazgos que definen el plan)

| # | Hallazgo | Consecuencia |
|---|---|---|
| **H1** | Auth es **JWT stateless puro**: `auth.service.ts` firma access (15m) + refresh (7d) y no persiste ninguna sesión. No hay tabla de tokens. | La recuperación necesita **una entidad nueva** (1 migración) o un token autoexpirable. Ver §2.1. |
| **H2** | `bcryptjs`, `zod`, `express-rate-limit`, `winston` y `crypto` (Node) ya están disponibles. **`nodemailer` no está instalado.** | Feature 1 = **1 dependencia nueva** (`nodemailer`), y solo si se envía correo real. |
| **H3** | `FRONTEND_URL` ya existe y está validada en `environment.ts:7`. | El link de recuperación se arma sin configuración nueva de URL. |
| **H4** | El backend **ya soporta `search`** en los 4 listados relevantes: `users.service.ts:20`, `customers.service.ts:21`, `finished-products.service.ts:33`, `sales.service.ts:29`. | Las 4 grillas con búsqueda previa **no requieren backend**. Cero endpoints nuevos, cero migraciones. |
| **H9** | Para el default "día actual" (decisión D1), las dos grillas restantes no están parejas: **auditoría ya filtra por fecha** (`audit.controller.ts:28-29` parsea `from`/`to`, y `audit-list.component.ts:56-57` ya tiene los controles), pero **caja de ventas no tiene ningún filtro**: `salesCashService.listMovements(params)` recibe solo paginación (`sales-cash.service.ts:32`). | Auditoría sale sin tocar backend. **Caja de ventas es el único cambio de backend de toda la Feature 2.** |
| **H5** | Existe una grilla compartida real: `shared/components/data-table/` con paginación lazy server-side, **búsqueda con debounce de 300 ms ya implementada** (`data-table.component.ts:78-100`), `searchable`, `loading` y `emptyMessage`. La usan **6 pantallas**. | Feature 2 se resuelve **dentro del componente compartido**, no grilla por grilla. |
| **H6** | El disparador de la carga inicial es `p-table [lazy]="true"`, que emite `onLazyLoad` al montar (`data-table.component.html:13`). | Para "no cargar nada al inicio" basta **no emitir** hacia el padre en ese primer evento. |
| **H7** | `jwtInterceptor` trata como públicos solo `['/auth/login', '/auth/refresh']` (`jwt.interceptor.ts:6`). | Los endpoints nuevos deben sumarse a esa lista. |
| **H8** | `errorInterceptor` muestra toast en **todo error ≠ 401** (`error.interceptor.ts:17`). | Los errores de reset (400) producirán toast automático; el inline es complemento, no reemplazo. |

**Conclusión:** Feature 2 es casi enteramente un cambio en un componente compartido, más un filtro de fechas en caja de ventas. Feature 1 es la que agrega superficie nueva, y está acotada a 1 modelo + 3 endpoints + 2 pantallas.

---

## 2. Feature 1 — Recuperación de contraseña

### 2.1 Decisión de diseño: token persistido, no JWT

| Criterio | Tabla `PasswordResetToken` (**elegida**) | JWT de reset |
|---|---|---|
| Uso único | Sí (`usedAt`) | No: replay válido hasta que expire |
| Revocación | Sí (al resetear se invalidan los demás) | No |
| Costo | 1 modelo + 1 migración (~25 líneas) | 0, pero con el agujero de arriba |
| Encaje arquitectónico | Prisma + módulo `auth` existente | Igual |

Se elige la tabla: el uso único es requisito de seguridad y con JWT no se obtiene sin un store igualmente.

### 2.2 Componentes reutilizados (sin tocar)

`AppError` + `errorHandler` · `validate(schema)` · `ok()` · `writeAuditLog()` · `bcrypt.hash(pwd, 10)` (mismo costo que `users.service.ts:42`) · `logger` · patrón de módulo `controller/service/routes/dto` · patrón de pantalla de `login.component` (Reactive Forms + signals + `p-message` + `p-button`).

### 2.3 Qué falta implementar

**Modelo** (`prisma/schema.prisma` + migración `add_password_reset_tokens`):

```prisma
model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  tokenHash String    @unique @map("token_hash")   // SHA-256 del token, nunca el token
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("password_reset_tokens")
}
```

Más la relación inversa `passwordResetTokens PasswordResetToken[]` en `User`.

**Endpoints** (públicos, en `auth.routes.ts`, antes de `authenticate`):

| Método | Ruta | Body / Param | Respuesta |
|---|---|---|---|
| POST | `/api/auth/forgot-password` | `{ email }` | **Siempre 200** genérico (anti-enumeración) |
| GET | `/api/auth/reset-password/:token/validate` | — | `{ valid: boolean }` |
| POST | `/api/auth/reset-password` | `{ token, password }` | 200 · 400 `Token inválido o expirado` |

**Reglas de seguridad (todas obligatorias en v1):**

1. Token = `crypto.randomBytes(32).toString('hex')` (256 bits, sin dependencia nueva).
2. En BD se guarda **solo** `sha256(token)`; el token viaja únicamente en el mail.
3. Expiración configurable, **default 30 min** (`PASSWORD_RESET_TTL_MINUTES`).
4. **Uso único**: al resetear se marca `usedAt` y se invalidan los demás tokens vigentes del usuario.
5. `forgot-password` responde 200 aunque el email no exista o el usuario esté `isActive: false`.
6. Rate limit dedicado en `forgot-password`: `rateLimit({ windowMs: 15*60*1000, limit: 5 })`. El global (`app.ts:36`) es de 1000 y no protege este caso.
7. Password nueva: `z.string().min(8)`, igual que `createUserSchema` (`users.dto.ts:5`).
8. `writeAuditLog({ action: 'UPDATE', entity: 'User', entityId })` sin valores de contraseña.

**Envío de correo** — `nodemailer` con config opcional en `environment.ts`:

```
SMTP_HOST= SMTP_PORT=587 SMTP_SECURE=false SMTP_USER= SMTP_PASS= MAIL_FROM=
PASSWORD_RESET_TTL_MINUTES=30
```

Sin `SMTP_HOST` configurado → **fallback de desarrollo**: `logger.info` con el link completo y la request igual responde 200. En `production` sin SMTP se emite un `logger.error` al arrancar. Link: `${env.FRONTEND_URL}/reset-password?token=...`.

**Frontend:**

- 2 rutas públicas nuevas en `app.routes.ts` (hermanas de `login`, fuera del `authGuard`): `forgot-password`, `reset-password`.
- 2 componentes standalone en `features/auth/forgot-password/` y `features/auth/reset-password/`, calcados de `login.component` (mismo layout, `OnPush`, signals `loading`/`errorMessage`, `p-message`).
- `AuthService`: `forgotPassword(email)`, `validateResetToken(token)`, `resetPassword(token, password)` — con `HttpClient` directo, como `login()`.
- `login.component.html`: link "¿Olvidaste tu contraseña?" (requiere importar `RouterLink`).
- `jwt.interceptor.ts:6`: agregar `/auth/forgot-password` y `/auth/reset-password` a `AUTH_ENDPOINTS` (H7).
- Estados de la pantalla de reset: validando token → formulario → éxito (con botón "Volver al login") → enlace inválido/expirado (con acceso a solicitar uno nuevo).
- Validación cliente: password ≥ 8 + confirmación coincidente.

### 2.4 Fases

| Fase | Alcance | Depende de | Estado |
|---|---|---|---|
| **F1.1** | `schema.prisma` + migración + variables en `environment.ts` y `.env.example` | — | ✅ |
| **F1.2** | `mailer` en `shared/utils/` + `auth.dto` + `auth.service` + `auth.controller` + `auth.routes` + rate limit | F1.1 | ✅ |
| **F1.3** | `AuthService` (3 métodos) + rutas + 2 componentes + link en login + `jwtInterceptor` | F1.2 | ✅ |
| **F1.4** | Test de integración del flujo (Vitest + Supertest, molde `tests/sales-flow.test.ts`) + `demo.http` + §9 de `CONTEXT.md` | F1.3 | ✅ |

> Cambio respecto de lo planificado: el consumo del token se hizo **atómico**
> (`updateMany` con `usedAt: null` en el `WHERE`), porque dos resets simultáneos con el
> mismo token pasaban ambos la validación previa. Mismo criterio que el anti-oversell
> de `sales.service`.

### 2.5 Criterios de aceptación

- [ ] Desde `/login` se llega a `/forgot-password` en un clic.
- [ ] `POST /auth/forgot-password` devuelve 200 idéntico para email existente, inexistente e inactivo.
- [ ] En dev sin SMTP, el link aparece en el log y funciona pegado en el navegador.
- [ ] El token solo existe hasheado en BD (verificable en Adminer/Prisma Studio).
- [ ] Un token usado **dos veces** falla la segunda con 400.
- [ ] Un token con `expiresAt` vencido falla con 400.
- [ ] Reset exitoso → login con la contraseña nueva OK y con la vieja 401.
- [ ] La sexta solicitud de `forgot-password` desde la misma IP en 15 min responde 429.
- [ ] Reset con password < 8 caracteres o confirmación distinta no llega al backend.
- [ ] Tras el éxito, la pantalla confirma y ofrece volver al login.

### 2.6 Limitación conocida (documentar, no resolver en v1)

Los refresh tokens son JWT stateless de 7 días: **un reset de contraseña no invalida sesiones ya abiertas**. Resolverlo exige un store de refresh tokens, que es un cambio de arquitectura fuera del alcance pedido. Se deja anotado en `ROADMAP_POST_MVP.md`.

---

## 3. Feature 2 — Grillas con búsqueda previa

### 3.1 Mapa real de grillas

Hay **dos comportamientos iniciales distintos**, según la grilla tenga o no búsqueda por texto:

| Pantalla | Componente | `search` hoy | Estado inicial (decisión D1) |
|---|---|---|---|
| Clientes | `customer-list` | Sí (nombre/CUIT/email) | **Sin resultados** hasta buscar |
| Materiales | `product-list` | Sí (SKU/nombre) | **Sin resultados** hasta buscar |
| Usuarios | `user-list` | Sí (nombre/email) | **Sin resultados** hasta buscar |
| Ventas | `sale-list` | Sí (cliente) + filtros propios | **Sin resultados** hasta buscar (con guarda extra, §3.4) |
| Auditoría | `audit-list` | `[searchable]="false"`, filtra por entidad/acción/fecha | **Registros del día actual** |
| Caja de ventas | `cash-register` | `[searchable]="false"`, sin ningún filtro | **Movimientos del día actual** |
| Roles | `role-list` | No es grilla (tarjetas, dataset fijo y chico) | Sin cambios |

El criterio detrás de la división: donde hay texto que buscar, el usuario dice qué quiere ver;
donde no lo hay, la grilla no puede quedar vacía y sin salida, así que arranca acotada al día
en curso en lugar de traer el histórico completo.

### 3.2 Decisión de diseño: la lógica vive en `data-table`

Se agregan **tres inputs opcionales** al componente compartido; las grillas que no los declaran no cambian de comportamiento.

```ts
readonly searchRequired  = input<boolean>(false);
readonly minSearchLength = input<number>(2);   // decisión D3
readonly promptMessage   = input<string>('');  // vacío = mensaje derivado del mínimo
```

Mecánica interna:

1. `search` pasa de campo privado a `signal<string>('')` (necesario para derivar estado).
2. `awaitingSearch = computed(() => this.searchRequired() && this.search().length < this.minSearchLength())`.
3. `emit()` **no emite `lazyLoad`** mientras `awaitingSearch()` sea true → ni el `onLazyLoad` inicial de p-table (H6) ni un texto de 1 carácter disparan HTTP.
4. La tabla renderiza `awaitingSearch() ? [] : rows()` y oculta el paginador en ese estado → borrar el campo de búsqueda vuelve a "sin resultados" sin pedir nada al servidor y sin mostrar datos viejos.
5. `emptymessage` muestra el mensaje guía si `awaitingSearch()`, y el `emptyMessage()` actual si la búsqueda no trajo resultados.

**Sobre el mínimo de 2 caracteres:** el texto guía no debe hardcodear el número, porque
`minSearchLength` es configurable. Se deriva:
`prompt = promptMessage() || \`Ingresá al menos ${minSearchLength()} caracteres para buscar.\``

**Impacto en cada grilla: un atributo en el HTML** (`[searchRequired]="true"`). No cambian los servicios, ni los `onLazyLoad`, ni las signals de los componentes.

**Campo de búsqueda más visible** (en el `caption` de `data-table.component.html:15-29`, así lo heredan todas): pasa de input chico alineado a la derecha a fila propia alineada a la izquierda, `w-full max-w-xl`, tamaño `lg`, con `aria-label` y el `searchPlaceholder` ya existente.

### 3.3 Grillas sin búsqueda: default al día actual

**Auditoría — solo frontend.** El backend ya parsea `from`/`to` y el componente ya tiene los
controles: alcanza con inicializar `fromDate`/`toDate` en la fecha de hoy (`dayjs().format('YYYY-MM-DD')`,
igual que el resto de las pantallas) en lugar de `''`. Los filtros de entidad y acción siguen
funcionando igual, y "Limpiar" vuelve al día actual, no a "todo".

**Caja de ventas — el único cambio de backend de la feature.** Hoy `listMovements` no acepta
filtros (H9). Hay que agregarlos siguiendo el molde de auditoría:

| Capa | Cambio |
|---|---|
| `sales-cash.service.ts:32` | `listMovements(params, filters: { from?: Date; to?: Date })` → agrega `createdAt: { gte, lte }` al `where` |
| `sales-cash.controller.ts:18` | Parsea `from`/`to` de la query y los pasa al service |
| `cash-register.component` | Barra de filtros Desde/Hasta (se copia el markup de `audit-list.component.html:30-42`), inicializada en hoy, y pasarlos al service |
| `sales-cash.service.ts` (frontend) | `listMovements(page, limit, filters)` |

**Deuda a evitar:** `parseDate(value, edge)` ya está duplicada literalmente en
`sales.controller.ts:16` y `audit.controller.ts:13`. Este sería el tercer caso, así que
corresponde **exportarla desde `shared/utils/date.ts`** (que ya tiene la función privada
`parseDay` con esa lógica exacta) y que los tres controllers la usen. Es la misma extracción
que ya había identificado `PLAN_REPORTES_Y_GRAFICOS.md` §1.2.

> El saldo que muestra la tarjeta superior es el **saldo actual de la caja**, no el del día:
> lo devuelve `getRegister()` y **no** se toca. Solo se acota el listado de movimientos.

### 3.4 Ajuste puntual en `sale-list`

`sale-list.component.ts:70` llama a `load()` desde `onFilterChange()`/`clearFilters()`, sin pasar por el data-table. Con búsqueda obligatoria hay que guardar esa vía:

```ts
private load(): void {
  if (this.lastEvent.search.length < 2) { this.rows.set([]); this.total.set(0); return; }
  ...
}
```

Es el único componente con búsqueda que necesita TypeScript nuevo.

### 3.5 Fases

| Fase | Alcance | Depende de |
|---|---|---|
| **F2.1** | `data-table.component.ts/.html`: inputs `searchRequired`/`minSearchLength`/`promptMessage`, `search` como signal, gating de `emit()`, render condicional, campo de búsqueda agrandado | — |
| **F2.2** | Activar `[searchRequired]="true"` en clientes, materiales, usuarios y ventas + guarda de `load()` en `sale-list` | F2.1 |
| **F2.3** | Auditoría al día actual (solo inicializar `fromDate`/`toDate`) | — |
| **F2.4** | Caja de ventas al día actual: `parseDate` a `shared/utils/date.ts`, filtros `from`/`to` en service + controller, barra de fechas en el componente | — |
| **F2.5** | Spec de Karma para `data-table` (no emite sin búsqueda / no emite con 1 carácter / emite con 2 / limpia al vaciar) — hoy solo existe `app.component.spec.ts` | F2.1 |

F2.3 y F2.4 son independientes entre sí y de F2.1/F2.2: se pueden hacer en cualquier orden.

### 3.6 Criterios de aceptación

**Grillas con búsqueda previa (clientes, materiales, usuarios, ventas)**

- [ ] Al entrar **no se dispara ninguna request de listado** (verificable en la pestaña Network).
- [ ] La grilla muestra el mensaje guía, sin filas y sin paginador.
- [ ] Con **1 carácter** tipeado sigue sin dispararse ninguna request; con **2** se dispara.
- [ ] La búsqueda se dispara una sola vez por ráfaga (debounce 300 ms ya existente) y muestra el spinner de p-table.
- [ ] Los resultados respetan la paginación server-side y el cambio de página conserva el texto buscado.
- [ ] Una búsqueda sin coincidencias muestra el `emptyMessage` propio de cada grilla, distinto del mensaje guía.
- [ ] Borrar el campo (o bajar de 2 caracteres) vuelve al estado inicial **sin** pedir todos los registros y sin dejar filas viejas visibles.
- [ ] En Ventas, cambiar estado/fechas sin búsqueda válida no carga nada.

**Grillas al día actual (auditoría, caja de ventas)**

- [ ] Al entrar muestran **solo los registros de hoy**, con los campos Desde/Hasta ya completados con la fecha actual.
- [ ] Ampliar el rango de fechas trae los registros históricos (no se pierde el acceso al histórico).
- [ ] En caja de ventas, el **saldo de la tarjeta superior sigue siendo el saldo actual**, no el del día.
- [ ] Un día sin movimientos muestra el mensaje de vacío, no un error.

**Transversal**

- [ ] Un error HTTP mantiene el toast actual y apaga el `loading` (comportamiento ya existente, no debe romperse).

---

## 4. Orden de ejecución y dependencias

```
F1.1 → F1.2 → F1.3 → F1.4          ✅ Feature 1 completa

F2.1 → F2.2 → F2.5                 (búsqueda previa)
F2.3                               (auditoría al día; independiente)
F2.4                               (caja de ventas al día; independiente)
```

Las dos features **no se tocan entre sí**: distintos archivos de backend y de frontend.

**Resumen de impacto**

| | Backend | Frontend | Migraciones | Dependencias |
|---|---|---|---|---|
| Feature 1 | 1 modelo, 3 endpoints, 1 util (`mailer`) | 2 pantallas, 3 métodos, 2 rutas | 1 | `nodemailer` |
| Feature 2 | Filtros `from`/`to` en caja de ventas + extraer `parseDate` a `shared/utils/date.ts` | 1 componente compartido + 1 atributo en 4 grillas + fechas de hoy en auditoría y caja | 0 | 0 |

---

## 5. Decisiones tomadas

1. ✅ **Alcance de la búsqueda obligatoria** — se aplica a las 4 grillas con búsqueda.
   Auditoría y Caja de ventas **no** quedan vacías: muestran los registros del **día actual**
   (§3.3). Esto agrega el único cambio de backend de la feature, porque caja de ventas no
   tenía filtro de fechas (H9).
2. ✅ **Envío de correo** — `nodemailer` + SMTP configurable, con fallback a log en desarrollo.
   Implementado en F1.2 (`shared/utils/mailer.ts`).
3. ✅ **Longitud mínima de búsqueda** — **2 caracteres**, vía input `minSearchLength` en
   `data-table` (default 2). Con 1 carácter la grilla sigue en su estado inicial y no consulta.
