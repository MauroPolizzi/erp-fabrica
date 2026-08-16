# Plan de implementación — Recuperación de contraseña + Búsqueda en grillas

> Basado en auditoría del código real de `erp-backend` y `erp-frontend`.
> Fecha: 2026-08-14. Base: rama `dev`, commit `5dbeec6` (MVP + reportería/gráficos estables).
> **No contiene código implementado.** Es la especificación previa a la ejecución.

---

## 1. Estado actual (hallazgos que definen el plan)

| # | Hallazgo | Consecuencia |
|---|---|---|
| **H1** | Auth es **JWT stateless puro**: `auth.service.ts` firma access (15m) + refresh (7d) y no persiste ninguna sesión. No hay tabla de tokens. | La recuperación necesita **una entidad nueva** (1 migración) o un token autoexpirable. Ver §2.1. |
| **H2** | `bcryptjs`, `zod`, `express-rate-limit`, `winston` y `crypto` (Node) ya están disponibles. **`nodemailer` no está instalado.** | Feature 1 = **1 dependencia nueva** (`nodemailer`), y solo si se envía correo real. |
| **H3** | `FRONTEND_URL` ya existe y está validada en `environment.ts:7`. | El link de recuperación se arma sin configuración nueva de URL. |
| **H4** | El backend **ya soporta `search`** en los 4 listados relevantes: `users.service.ts:20`, `customers.service.ts:21`, `finished-products.service.ts:33`, `sales.service.ts:29`. | **Feature 2 no requiere cambios de backend.** Cero endpoints nuevos, cero migraciones. |
| **H5** | Existe una grilla compartida real: `shared/components/data-table/` con paginación lazy server-side, **búsqueda con debounce de 300 ms ya implementada** (`data-table.component.ts:78-100`), `searchable`, `loading` y `emptyMessage`. La usan **6 pantallas**. | Feature 2 se resuelve **dentro del componente compartido**, no grilla por grilla. |
| **H6** | El disparador de la carga inicial es `p-table [lazy]="true"`, que emite `onLazyLoad` al montar (`data-table.component.html:13`). | Para "no cargar nada al inicio" basta **no emitir** hacia el padre en ese primer evento. |
| **H7** | `jwtInterceptor` trata como públicos solo `['/auth/login', '/auth/refresh']` (`jwt.interceptor.ts:6`). | Los endpoints nuevos deben sumarse a esa lista. |
| **H8** | `errorInterceptor` muestra toast en **todo error ≠ 401** (`error.interceptor.ts:17`). | Los errores de reset (400) producirán toast automático; el inline es complemento, no reemplazo. |

**Conclusión:** Feature 2 es casi enteramente un cambio en un componente compartido (backend intacto). Feature 1 es la que agrega superficie nueva, y está acotada a 1 modelo + 3 endpoints + 2 pantallas.

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

| Fase | Alcance | Depende de |
|---|---|---|
| **F1.1** | `schema.prisma` + migración + variables en `environment.ts` y `.env.example` | — |
| **F1.2** | `mailer` en `shared/utils/` + `auth.dto` + `auth.service` + `auth.controller` + `auth.routes` + rate limit | F1.1 |
| **F1.3** | `AuthService` (3 métodos) + rutas + 2 componentes + link en login + `jwtInterceptor` | F1.2 |
| **F1.4** | Test de integración del flujo (Vitest + Supertest, molde `tests/sales-flow.test.ts`) + `demo.http` + §9 de `CONTEXT.md` | F1.3 |

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

| Pantalla | Componente | `search` hoy | Aplica el cambio |
|---|---|---|---|
| Clientes | `customer-list` | Sí (nombre/CUIT/email) | **Sí** |
| Materiales | `product-list` | Sí (SKU/nombre) | **Sí** |
| Usuarios | `user-list` | Sí (nombre/email) | **Sí** |
| Ventas | `sale-list` | Sí (cliente) + filtros propios | **Sí** (con guarda extra, §3.3) |
| Auditoría | `audit-list` | `[searchable]="false"`, filtra por entidad/acción/fecha | **No** |
| Caja de ventas | `cash-register` | `[searchable]="false"`, es un saldo + sus movimientos | **No** |
| Roles | `role-list` | No es grilla (tarjetas, dataset fijo y chico) | **No** |

### 3.2 Decisión de diseño: la lógica vive en `data-table`

Se agregan **dos inputs opcionales** al componente compartido; las grillas que no los declaran no cambian de comportamiento.

```ts
readonly searchRequired = input<boolean>(false);
readonly promptMessage  = input<string>('Ingresá un texto para comenzar a buscar.');
```

Mecánica interna:

1. `search` pasa de campo privado a `signal<string>('')` (necesario para derivar estado).
2. `awaitingSearch = computed(() => this.searchRequired() && this.search() === '')`.
3. `emit()` **no emite `lazyLoad`** mientras `awaitingSearch()` sea true → el `onLazyLoad` inicial de p-table (H6) no dispara ningún HTTP.
4. La tabla renderiza `awaitingSearch() ? [] : rows()` y oculta el paginador en ese estado → borrar el campo de búsqueda vuelve a "sin resultados" sin pedir nada al servidor y sin mostrar datos viejos.
5. `emptymessage` muestra `promptMessage()` si `awaitingSearch()`, y el `emptyMessage()` actual si la búsqueda no trajo resultados.

**Impacto en cada grilla: un atributo en el HTML** (`[searchRequired]="true"`). No cambian los servicios, ni los `onLazyLoad`, ni las signals de los componentes.

**Campo de búsqueda más visible** (en el `caption` de `data-table.component.html:15-29`, así lo heredan todas): pasa de input chico alineado a la derecha a fila propia alineada a la izquierda, `w-full max-w-xl`, tamaño `lg`, con `aria-label` y el `searchPlaceholder` ya existente.

### 3.3 Ajuste puntual en `sale-list`

`sale-list.component.ts:70` llama a `load()` desde `onFilterChange()`/`clearFilters()`, sin pasar por el data-table. Con búsqueda obligatoria hay que guardar esa vía:

```ts
private load(): void {
  if (!this.lastEvent.search) { this.rows.set([]); this.total.set(0); return; }
  ...
}
```

Es el único componente que necesita TypeScript nuevo.

### 3.4 Fases

| Fase | Alcance | Depende de |
|---|---|---|
| **F2.1** | `data-table.component.ts/.html`: inputs `searchRequired`/`promptMessage`, `search` como signal, gating de `emit()`, render condicional, campo de búsqueda agrandado | — |
| **F2.2** | Activar `[searchRequired]="true"` en clientes, materiales, usuarios y ventas + guarda de `load()` en `sale-list` | F2.1 |
| **F2.3** | Spec de Karma para `data-table` (no emite sin búsqueda / emite con búsqueda / limpia al vaciar) — hoy solo existe `app.component.spec.ts` | F2.1 |

### 3.5 Criterios de aceptación

- [ ] Al entrar a Clientes/Materiales/Usuarios/Ventas **no se dispara ninguna request de listado** (verificable en la pestaña Network).
- [ ] La grilla muestra el mensaje guía, sin filas y sin paginador.
- [ ] Al tipear, la búsqueda se dispara una sola vez por ráfaga (debounce 300 ms ya existente) y muestra el spinner de p-table.
- [ ] Los resultados respetan la paginación server-side y el cambio de página conserva el texto buscado.
- [ ] Una búsqueda sin coincidencias muestra el `emptyMessage` propio de cada grilla, distinto del mensaje guía.
- [ ] Borrar el campo vuelve al estado inicial **sin** pedir todos los registros y sin dejar filas viejas visibles.
- [ ] En Ventas, cambiar estado/fechas con la búsqueda vacía no carga nada.
- [ ] Auditoría y Caja de ventas siguen cargando como hoy.
- [ ] Un error HTTP mantiene el toast actual y apaga el `loading` (comportamiento ya existente, no debe romperse).

---

## 4. Orden de ejecución y dependencias

```
F2.1 → F2.2 → F2.3          (independiente de Feature 1; backend intacto)
F1.1 → F1.2 → F1.3 → F1.4
```

Las dos features **no se tocan entre sí**: distintos archivos de backend y de frontend. Se sugiere ejecutar **F2 primero** (menor riesgo, sin migración ni dependencias nuevas) y luego F1.

**Resumen de impacto**

| | Backend | Frontend | Migraciones | Dependencias |
|---|---|---|---|---|
| Feature 1 | 1 modelo, 3 endpoints, 1 util (`mailer`) | 2 pantallas, 3 métodos, 2 rutas | 1 | `nodemailer` |
| Feature 2 | **0** | 1 componente compartido + 5 líneas en 4 grillas | 0 | 0 |

---

## 5. Decisiones abiertas (a confirmar antes de ejecutar)

1. **Alcance de la búsqueda obligatoria**: el plan la aplica a las 4 grillas con búsqueda y **excluye Auditoría y Caja de ventas** (no tienen campo de búsqueda y su valor es justamente el listado). Confirmar.
2. **Envío de correo**: se asume `nodemailer` + SMTP configurable, con fallback a log en desarrollo. Si no hay servidor SMTP disponible ni siquiera en producción, la alternativa es mostrar el link solo en el log — funcional, pero no apto para usuarios finales.
3. **Longitud mínima de búsqueda**: el plan dispara con 1 carácter. Si se prefiere 2 o 3, se agrega un input `minSearchLength` en el mismo cambio de F2.1 (costo marginal).
