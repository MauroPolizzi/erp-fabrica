# PerliNor ERP — Frontend (Demo de Venta de Materiales)

Frontend Angular 19 de la demo funcional de **venta de materiales de punta a punta**:
**Login → Cliente → Material → Stock → Venta → Consulta**. Consume la API del backend
`erp-backend` (la lógica de negocio —totales, descuento de stock— es autoridad del servidor).

Stack: **Angular 19** (standalone + Signals), **PrimeNG 17** (tema `lara-light-blue`),
**Tailwind CSS**, **Day.js**, **decimal.js**.

## Requisitos

- Node 20.11.0+ y **pnpm** 9.x.
- **Backend corriendo** en `http://localhost:3000` (la demo no funciona sin él). El backend
  ya tiene CORS habilitado, por eso no se usa proxy de dev.

## Cómo levantar

```bash
# desde la raíz del workspace
pnpm install
pnpm --filter erp-frontend start
# o, dentro de erp-frontend/
pnpm start
```

App en `http://localhost:4200/`. En desarrollo, `environment.development.ts` apunta a
`http://localhost:3000/api`.

## Credenciales (seed del backend)

```
email:    admin@perlinor.local
password: admin123
```

El usuario admin tiene `admin.*`, por lo que pasa todos los chequeos de permisos de la UI.

## Recorrido E2E de la demo

1. **Login** (`/login`) → entra al shell autenticado.
2. **Clientes** (`/commercial/customers`) → «Nuevo cliente» → completar y guardar.
3. **Materiales** (`/inventory/finished-products`) → «Nuevo material»; la categoría se elige
   del combo o se crea al vuelo con «+». El `currentStock` nace en 0.
4. **Stock** → en la fila del material, acción «Cargar stock» → movimiento `IN` (suma) o
   `ADJUST` (fija). El stock se refleja al instante en el listado.
5. **Venta** (`/commercial/sales/new`) → seleccionar cliente y medio de pago, agregar líneas
   (material + cantidad), ver el **preview** de subtotal/total y «Confirmar venta».
   - Si falta stock, el backend responde **422** y un toast indica el material afectado
     (la venta no se registra y no se navega).
   - Si todo OK, se navega al **detalle** de la venta.
6. **Consulta** → detalle de la venta (`/commercial/sales/:id`) y, al volver a Materiales,
   el `currentStock` ya descontado.

## Arquitectura

```
src/app/
├── core/          # ApiService, AuthService, NotificationService, guards, interceptores, modelos
├── shared/        # DataTable, PageHeader, ConfirmDialog, LoadingSpinner; pipes currencyArs / dateFormat
├── layout/        # MainLayout + Sidebar + Header (shell autenticado)
└── features/      # auth (login), commercial (customers, sales), inventory (finished-products, categories)
```

- **Sesión:** JWT con refresh automático (`jwtInterceptor`); la sesión se restaura al recargar
  (`provideAppInitializer` → `/auth/me`). Rutas protegidas por `authGuard` + `permissionGuard`.
- **Listados:** paginación server-side reutilizando `DataTableComponent`.
- **Errores:** `errorInterceptor` → toast (PrimeNG `MessageService`). Validaciones inline en forms.
- **Montos:** llegan como string (Decimal); se muestran tal cual y se parsean con `decimal.js`
  solo para el preview de la venta.

## Convención de componentes (obligatoria)

Lógica en `.ts`, template en archivo `.html` vía **`templateUrl`** (prohibido `template:` inline);
estilos en archivo propio solo si el componente los necesita (el resto es Tailwind).
Standalone components, Signals para estado local, Reactive Forms.

## Comandos

```bash
pnpm start        # servidor de desarrollo (http://localhost:4200)
pnpm build        # build de producción (dist/erp-frontend)
pnpm test         # tests unitarios (Karma/Jasmine)
```
