# ERP Fábrica — Backend (`erp-backend`)

API REST para el ERP de PerliNor. Stack: **Node 20 + Express + TypeScript + Prisma + PostgreSQL**.
Este README cubre el arranque y la **demo de venta de material** de punta a punta.

## Requisitos

- Node 20.x y pnpm 9.x
- Docker (PostgreSQL + Adminer vía `docker-compose.yml`)

## Puesta en marcha

```bash
# Desde la raíz del monorepo
docker compose up -d                         # postgres + adminer
pnpm install

# Backend
pnpm --filter erp-backend prisma migrate dev # aplica migraciones
pnpm --filter erp-backend db:seed            # permisos, roles, admin y categorías
pnpm --filter erp-backend dev                # API en http://localhost:3000
```

Credenciales sembradas: **`admin@perlinor.local` / `admin123`** (rol Administración con permiso `admin.*`).
Adminer: http://localhost:8080 · Healthcheck: `GET http://localhost:3000/health`.

## Flujo de la demo: venta de un material

Objetivo: vender un material de punta a punta — crear cliente, crear material, cargar stock,
registrar la venta (descuento de stock transaccional) y consultar el resultado.

Base URL: `http://localhost:3000/api`. Todas las rutas excepto `auth/login` requieren
`Authorization: Bearer <accessToken>`.

| # | Paso | Endpoint |
|---|------|----------|
| 1 | Login | `POST /auth/login` |
| 2 | Crear cliente | `POST /commercial/customers` |
| 3 | Categoría (sembrada o nueva) | `GET /categories?type=FINISHED_PRODUCT` · `POST /categories` |
| 4 | Crear material (stock 0) | `POST /inventory/finished-products` |
| 5 | Cargar stock inicial (`IN`) | `POST /inventory/finished-products/:id/movements` |
| 6 | Registrar venta | `POST /commercial/sales` |
| 7 | Consultar venta / stock / movimientos | `GET /commercial/sales/:id` · `GET /inventory/finished-products/:id` · `.../movements` |

**Reproducir el flujo:** abrir [`demo.http`](./demo.http) con la extensión *REST Client* de VS Code
y ejecutar las peticiones de arriba hacia abajo (las variables se encadenan solas).

### Comportamiento clave de la venta

- La venta corre dentro de `prisma.$transaction`: valida stock por producto, **congela el precio**
  desde `salePrice` del material (nunca del cliente), crea `Sale` + `SaleDetail`, descuenta
  `currentStock` y genera movimientos `OUT` con `reference = sale.id`.
- Sin IVA en la demo: `total = subtotal` (`tax = 0`).
- **Stock insuficiente → 422 y rollback total** (no se crea venta, ni movimientos, ni se descuenta stock).
- Los montos se calculan con `decimal.js`; `Prisma.Decimal` normaliza ceros finales al serializar
  (p. ej. `42500.00` se devuelve como `"42500"`).

## Scripts

```bash
pnpm --filter erp-backend dev        # desarrollo (tsx watch)
pnpm --filter erp-backend build      # compila a dist/
pnpm --filter erp-backend test       # Vitest + Supertest
pnpm --filter erp-backend db:seed    # re-siembra (idempotente)
pnpm --filter erp-backend lint       # ESLint
```

## Despliegue: la carpeta `assets/`

`pnpm build` es `tsc` a secas y **solo emite `.js`**: no copia archivos que no sean TypeScript.
El logo de los reportes Excel vive en `assets/logo.png`, fuera de `dist/`, y se resuelve
relativo a `__dirname` (`src/` y `dist/` están a la misma profundidad, así que la ruta sirve
en desarrollo y en producción).

> **Al desplegar hay que copiar `assets/` junto a `dist/`.** Si falta, los reportes se
> generan igual pero **sin logo**, dejando un `warn` en el log — no falla la descarga.

## Tests

`tests/sales-flow.test.ts` ejecuta el flujo E2E (login OK/KO, alta de cliente, alta de material,
carga de stock, venta feliz y venta sin stock con verificación de rollback).

> Requiere **PostgreSQL accesible y el seed aplicado**. El test crea sus propios datos con
> identificadores únicos y los limpia al finalizar.

```bash
docker compose up -d
pnpm --filter erp-backend db:seed
pnpm --filter erp-backend test
```

## Estructura

```
src/
  app.ts, server.ts          # bootstrap Express
  config/                    # database, environment, cors
  modules/
    auth/                    # login/refresh/me (JWT)
    commercial/customers/    # ABM de clientes
    commercial/sales/        # ventas transaccionales (núcleo)
    inventory/categories/    # categorías de producto terminado
    inventory/finished-products/  # ABM materiales + movimientos de stock
    ...
  shared/middlewares/        # error-handler, validate, permission, audit-log
  shared/utils/              # response, pagination, app-error, logger
prisma/                      # schema, migraciones, seed
demo.http                    # flujo reproducible de la demo
```
