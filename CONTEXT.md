# ERP Fábrica de Productos de Construcción — Contexto del Proyecto

> Documento de contexto para desarrollo asistido. Contiene **únicamente decisiones ya tomadas**.
> No incluye análisis comparativos ni opciones descartadas.

---

## 1. Resumen del Proyecto

Sistema ERP de gestión para una fábrica de productos de construcción.

| Aspecto | Definición |
|---------|------------|
| **Usuarios totales** | 5 |
| **Roles** | Administración, Ventas, Producción, Stock, Finanzas |
| **Tipo de aplicación** | Web (SPA + API REST) |
| **Arquitectura** | Monolítica modular |
| **Idioma del sistema** | Español (es-AR) |
| **Moneda** | ARS (Peso argentino) |

---

## 2. Stack Tecnológico (DEFINITIVO)

### Backend
| Componente | Tecnología | Versión |
|------------|------------|---------|
| Runtime | Node.js LTS | 20.11.0 |
| Framework | Express | 4.21.1 |
| Lenguaje | TypeScript | 5.6.3 |
| ORM | Prisma | 5.22.0 |
| Base de datos | PostgreSQL | 16 |
| Autenticación | JWT + Refresh Tokens (jsonwebtoken 9.0.2) | — |
| Hash de contraseñas | bcryptjs | 2.4.3 |
| Validación | Zod | 3.23.8 |
| Reportes PDF | PDFKit | 0.15.1 |
| Exportación Excel | ExcelJS | 4.4.0 |
| Fechas | Day.js | 1.11.13 |
| Decimales (montos) | decimal.js | 10.4.3 |
| Logging | Winston | 3.15.0 |
| Testing | Vitest + Supertest | 2.1.4 / 7.0.0 |

### Frontend
| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Angular | 19.x |
| Estado reactivo | Signals (nativo de Angular) | — |
| Estilos | Tailwind CSS | 3.4.14 |
| Componentes UI | PrimeNG + PrimeIcons | 17.18.11 / 7.0.0 |
| Gráficos | Chart.js (vía `p-chart` de PrimeNG) | 4.5.1 |
| Fechas | Day.js | 1.11.13 |
| Decimales | decimal.js | 10.4.3 |
| Exportación archivos | file-saver | 2.0.5 |

### Herramientas
| Herramienta | Decisión | Versión |
|-------------|----------|---------|
| **Package manager** | **pnpm** | 9.x |
| Contenedores (dev) | Docker + Docker Compose | — |
| Angular CLI | — | 19.0.2 |

> **Nota sobre estado global:** Para este tamaño de aplicación se usan **servicios con Signals**. NO se usa NgRx.

---

## 3. Estructura del Repositorio (DECISIÓN: Monorepo con pnpm workspaces)

**Monorepo gestionado con pnpm workspaces.** Backend y frontend son paquetes del workspace;
un único `pnpm install` en la raíz instala todo y comparte el `pnpm-lock.yaml`.

> Existe `pnpm-workspace.yaml` en la raíz (lista `erp-backend` y `erp-frontend`) y un
> `package.json` raíz con scripts agregadores que delegan vía `pnpm --filter`.

```
erp-fabrica/
├── pnpm-workspace.yaml         # Declara los paquetes del workspace
├── package.json                # Raíz: scripts agregadores (--filter)
├── pnpm-lock.yaml              # Lock único compartido
├── docker-compose.yml          # PostgreSQL + Adminer
├── README.md
├── erp-backend/                # Paquete del workspace
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   ├── package.json            # name: "erp-backend"
│   └── tsconfig.json
└── erp-frontend/               # Paquete del workspace
    ├── src/
    ├── package.json            # name: "erp-frontend"
    ├── angular.json
    └── tailwind.config.js
```

**Instalación:**
```bash
pnpm install              # Desde la raíz: instala backend + frontend
```

**Ejecución desde la raíz (vía --filter):**
```bash
pnpm --filter erp-backend dev
pnpm --filter erp-frontend start
```

---

## 4. Estructura del Backend

```
erp-backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── config/
│   │   ├── database.ts          # Conexión Prisma
│   │   ├── environment.ts       # Variables de entorno tipadas
│   │   └── cors.ts
│   ├── modules/
│   │   ├── auth/                # controller, service, routes, middleware, dto
│   │   ├── users/
│   │   ├── employees/
│   │   ├── inventory/
│   │   │   ├── raw-materials/
│   │   │   └── finished-products/
│   │   ├── production/
│   │   ├── commercial/
│   │   │   ├── customers/
│   │   │   ├── suppliers/
│   │   │   └── sales/
│   │   ├── finance/
│   │   │   ├── sales-cash/
│   │   │   ├── payments/
│   │   │   └── invoicing/
│   │   ├── reports/
│   │   └── audit/
│   ├── shared/
│   │   ├── middlewares/         # error-handler, validate, audit-log, permission
│   │   ├── utils/               # pagination, response, date, app-error
│   │   └── types/               # express.d.ts
│   ├── app.ts                   # Configuración Express
│   └── server.ts                # Entry point
└── tests/
```

**Convención de módulos:** cada módulo expone `controller`, `service`, `routes`, `dto`
(y `middleware` cuando aplica). Los módulos se comunican vía servicios, nunca accediendo
directamente a modelos de otro módulo.

---

## 5. Estructura del Frontend

```
erp-frontend/src/app/
├── core/                        # Singletons (providedIn: 'root')
│   ├── services/                # auth, http, notification
│   ├── guards/                  # auth.guard, permission.guard
│   └── interceptors/            # jwt.interceptor, error.interceptor
├── shared/                      # Reutilizable
│   ├── components/              # data-table, confirm-dialog, page-header, pagination, loading-spinner
│   ├── directives/
│   └── pipes/                   # currency-ars, date-format
├── layout/                      # main-layout, sidebar, header
└── features/                    # Módulos lazy-loaded
    ├── auth/                    # login
    ├── dashboard/
    ├── users/
    ├── employees/
    ├── inventory/               # raw-materials, finished-products
    ├── production/
    ├── commercial/              # customers, suppliers, sales
    ├── finance/                 # sales-cash, supplier-payments, invoicing
    └── reports/
```

**Convenciones Frontend:**
- Componentes usan **Signals** (`signal()`, `computed()`) para estado local.
- **Lazy loading** obligatorio en cada feature module.
- Formularios con **Reactive Forms**.
- Listados con paginación **server-side**.
- Las rutas declaran permiso requerido en `data: { permission: 'modulo.accion' }`.

---

## 6. Alcance Funcional

| Módulo | Funcionalidad |
|--------|---------------|
| Usuarios | Gestión de usuarios, roles y permisos |
| Empleados | Alta/baja/modificación de personal |
| Inventario MP | Stock de materias primas, movimientos, costo promedio ponderado |
| Inventario PT | Stock de productos terminados, movimientos |
| Producción | Registro de producción, consumo de materias primas, actualización automática de stock |
| Comercial | Clientes, proveedores |
| Ventas | Ventas, detalle, facturación |
| Caja Ventas | Movimientos de ingreso por ventas |
| Caja Pagos | Pagos a proveedores |
| Facturación | Comprobantes (A, B, C, Recibo), soporte CAE para factura electrónica |
| Reportes | Operativos y financieros, exportación PDF/Excel |
| Auditoría | Log de operaciones críticas (CREATE/UPDATE/DELETE) |

---

## 7. Modelo de Datos (Prisma)

### Convenciones
- IDs: `uuid` (`@default(uuid())`).
- Nombres de tabla en snake_case vía `@@map`.
- Campos en snake_case en BD vía `@map`, camelCase en código.
- Montos: `Decimal @db.Decimal(12, 2)`.
- Cantidades: `Decimal @db.Decimal(12, 3)`.
- Timestamps: `created_at` (`@default(now())`) y `updated_at` (`@updatedAt`).
- Borrado lógico: campo `isActive` (no borrado físico).

### Entidades principales
- **Core:** `User`, `Role`, `Permission` (M2M Role↔Permission).
- **Empleados:** `Employee`.
- **Inventario:** `Category` (enum `CategoryType`), `RawMaterial`, `RawMaterialMovement`, `FinishedProduct`, `FinishedProductMovement` (enum `MovementType`: IN/OUT/ADJUST).
- **Producción:** `ProductionRecord`, `ProductionConsumption`.
- **Comercial:** `Customer`, `Supplier`, `Sale`, `SaleDetail` (enums `SaleStatus`, `PaymentMethod`).
- **Finanzas:** `CashRegister` (enum `CashType`: SALES/PAYMENTS), `CashMovement`, `SupplierPayment`, `Invoice` (enums `InvoiceType`, `InvoiceStatus`).
- **Auditoría:** `AuditLog` (oldValues/newValues como JSON, índices por entity+entityId, userId, createdAt).

### Reglas de negocio relevantes
- Las operaciones que afectan stock se ejecutan dentro de `prisma.$transaction`.
- Entrada de stock de MP recalcula **costo promedio ponderado**.
- El registro de producción descuenta MP y suma PT automáticamente.
- Toda operación crítica genera un `AuditLog`.

---

## 8. Autenticación y Autorización

- **JWT con dos tokens:** access (15m) y refresh (7d).
- Frontend usa `JwtInterceptor` que adjunta el token y maneja el refresh automático en errores 401.
- Backend protege rutas con middleware `requirePermission('modulo.accion')`.
- Frontend protege rutas con `PermissionGuard` leyendo `data.permission`.
- Permisos con formato `modulo.accion` (ej: `inventory.read`, `sales.create`).
- Permiso comodín de administrador: `admin.*`.

**Recuperación de contraseña** (endpoints públicos de `auth`):
- `POST /auth/forgot-password` responde siempre 200 genérico (no permite enumerar cuentas).
- El token es aleatorio de 256 bits; en `password_reset_tokens` se guarda solo su SHA-256.
- Vence según `PASSWORD_RESET_TTL_MINUTES` (30 por defecto) y es de **un solo uso** (`used_at`).
- `POST /auth/reset-password` invalida los demás tokens del usuario y deja un `AuditLog`.
- Los tres endpoints tienen rate limit propio (5 por IP cada 15 min).
- **Limitación conocida:** al ser los refresh tokens JWT stateless, un reset no cierra
  las sesiones ya abiertas (hasta 7 días). Resolverlo requiere un store de refresh tokens.

---

## 9. Variables de Entorno (Backend)

```
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
DATABASE_URL="postgresql://erp_user:erp_dev_password@localhost:5432/erp_db?schema=public"
JWT_ACCESS_SECRET=<secreto>
JWT_REFRESH_SECRET=<secreto>
DEFAULT_PAGINATION_LIMIT=20
MAX_PAGINATION_LIMIT=100
PASSWORD_RESET_TTL_MINUTES=30
SMTP_HOST=            # opcional; sin host el link de recuperación se loguea (dev)
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="ERP PerliNor <no-reply@perlinor.local>"
```

---

## 10. Infraestructura

| Recurso | Decisión |
|---------|----------|
| Hosting | VPS (Hetzner o DigitalOcean) |
| BD producción | PostgreSQL 16 |
| Reverse proxy | Nginx (SSL) |
| Backups | Dump diario de PostgreSQL a almacenamiento externo (Backblaze B2) |
| Desarrollo local | Docker Compose (postgres + adminer) |

**Puertos de desarrollo:**
- Backend: `3000`
- Frontend: `4200`
- PostgreSQL: `5432`
- Adminer: `8080`
- Prisma Studio: `5555`

---

## 11. Comandos Frecuentes

### Backend
```bash
pnpm dev                 # Desarrollo (tsx watch)
pnpm build               # Compilar TypeScript
pnpm start               # Producción
pnpm prisma migrate dev  # Nueva migración
pnpm prisma generate     # Generar cliente
pnpm prisma studio       # Ver BD
pnpm db:seed             # Cargar datos iniciales
pnpm test                # Vitest
```

### Frontend
```bash
pnpm start               # ng serve (localhost:4200)
pnpm build:prod          # Build de producción
pnpm test                # Karma/Jasmine
```

### Docker
```bash
docker compose up -d     # Levantar postgres + adminer
docker compose down      # Detener
```

---

## 12. Cronograma de Desarrollo

| Fase | Módulos | Duración |
|------|---------|----------|
| 1 | Core + Auth + Usuarios | 2 semanas |
| 2 | Empleados + Inventario | 3 semanas |
| 3 | Producción | 2 semanas |
| 4 | Comercial (clientes, proveedores, ventas) | 3 semanas |
| 5 | Finanzas (cajas, pagos, facturación) | 2 semanas |
| 6 | Reportes + Auditoría | 2 semanas |
| 7 | Testing + Deploy | 2 semanas |

**Total estimado:** 16 semanas (~4 meses).

---

## 13. Decisiones Cerradas (No Reabrir)

- ✅ Aplicación **Web** (no Desktop).
- ✅ Arquitectura **Monolítica modular** (no microservicios).
- ✅ Backend **Node.js + Express + TypeScript** (no Django/Python).
- ✅ Frontend **Angular** (no React).
- ✅ **pnpm** como package manager (no npm).
- ✅ **Monorepo con pnpm workspaces** (`erp-backend` + `erp-frontend` como paquetes; lock único en la raíz).
- ✅ ORM **Prisma** + **PostgreSQL**.
- ✅ Estado con **Signals**, sin NgRx.
- ✅ UI con **PrimeNG + Tailwind CSS**.
- ✅ Colas async (**BullMQ/Redis**) **diferidas**: se removieron del stack por no usarse; se reintroducirán al implementar reportes async (ver `ROADMAP_POST_MVP.md`, Fase 5).
