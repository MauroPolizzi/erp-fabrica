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
| Backend  | TypeScript, Express, Prisma, PostgreSQL, Zod, JWT                 |
| Frontend | Angular 19, PrimeNG, Tailwind CSS, RxJS                           |
| Tooling  | pnpm workspaces, ESLint, Vitest                                   |

## Requisitos previos

- Node.js 20+
- pnpm 9+
- PostgreSQL

## Puesta en marcha

```bash
# 1. Instalar dependencias de todo el workspace
pnpm install

# 2. Levantar infraestructura local (PostgreSQL 16 + Adminer)
docker compose up -d

# 3. Configurar variables de entorno del backend
#    Copiar erp-backend/.env.example a erp-backend/.env y ajustar si hace falta
cp erp-backend/.env.example erp-backend/.env

# 4. Generar cliente Prisma, aplicar migraciones y cargar datos iniciales
pnpm --filter erp-backend exec prisma generate
pnpm --filter erp-backend exec prisma migrate dev
pnpm --filter erp-backend db:seed

# 5. Levantar backend y frontend (en terminales separadas)
pnpm --filter erp-backend dev      # API en http://localhost:3000
pnpm --filter erp-frontend start   # SPA en http://localhost:4200
```

> El seed crea el usuario administrador `admin@perlinor.local` / `admin123`.

## Puertos de desarrollo

| Servicio   | Puerto |
|------------|--------|
| Backend    | 3000   |
| Frontend   | 4200   |
| PostgreSQL | 5432   |
| Adminer    | 8080   |

## Notas

- El archivo `erp-backend/.env` **no se versiona** (contiene credenciales). Cada entorno debe configurarlo localmente a partir de `.env.example`.
- **Extensión de Prisma en VS Code:** al abrir el monorepo como raíz del workspace, la extensión busca el `.env` junto al `schema.prisma`. Por eso existe `erp-backend/prisma/.env` (solo con `DATABASE_URL`, también ignorado por git) para evitar el error *"Environment variable not found: DATABASE_URL"*. El runtime sigue usando `erp-backend/.env`. Mantené `DATABASE_URL` sincronizado entre ambos. (Alternativa: abrir `erp-backend` como carpeta raíz en VS Code.)
