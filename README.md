# PerliNor ERP — erp-fabrica

Monorepo del sistema ERP para PerliNor, gestionado con **pnpm workspaces**.

## Estructura

```
erp-fabrica/
├── erp-backend/    # API REST — Node.js + TypeScript + Express + Prisma (PostgreSQL)
└── erp-frontend/   # SPA — Angular 19 + PrimeNG + Tailwind CSS
```

## Tecnologías

| Capa     | Stack principal                                                    |
|----------|-------------------------------------------------------------------|
| Backend  | TypeScript, Express, Prisma, PostgreSQL, Redis (BullMQ), Zod, JWT |
| Frontend | Angular 19, PrimeNG, Tailwind CSS, RxJS                           |
| Tooling  | pnpm workspaces, ESLint, Vitest                                   |

## Requisitos previos

- Node.js 20+
- pnpm 9+
- PostgreSQL
- Redis (para colas con BullMQ)

## Puesta en marcha

```bash
# Instalar dependencias de todo el workspace
pnpm install

# Configurar variables de entorno del backend
# Editar erp-backend/.env con la cadena de conexión a PostgreSQL (DATABASE_URL)

# Generar el cliente de Prisma
pnpm --filter erp-backend exec prisma generate

# Frontend (modo desarrollo)
pnpm --filter erp-frontend start
```

## Notas

- El archivo `erp-backend/.env` **no se versiona** (contiene credenciales). Cada entorno debe configurarlo localmente.
