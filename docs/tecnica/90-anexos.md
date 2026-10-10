<h1 class="sin-numero">Anexo A — Glosario</h1>

El vocabulario del sistema se define en el documento `GLOSARIO.md` del repositorio, que fija para
cada concepto su término de dominio, su denominación en el código y el nombre con que aparece en la
interfaz.

Se reproducen aquí las equivalencias cuya confusión resulta más probable durante la lectura.

| Dominio *(este informe)* | Código | Interfaz *(manual de usuario)* |
|---|---|---|
| Material | `FinishedProduct` · `/inventory/finished-products` | Material |
| Existencia | `currentStock` | Stock |
| Movimiento de existencias | `FinishedProductMovement` | Movimiento de stock |
| Ingreso de existencias | `MovementType.IN` | Ingreso |
| Ajuste de existencias | `MovementType.ADJUST` | Ajuste |
| Egreso de existencias | `MovementType.OUT` | *(no se carga manualmente)* |
| Línea de venta | `SaleDetail` | Línea · Detalle |
| Caja de ventas | `CashRegister` con `type = SALES` | Caja de ventas |
| Baja lógica | `isActive = false` · `deactivate()` · verbo `DELETE` | Dar de baja |
| Asiento de auditoría | `AuditLog` | Registro |
| Panel de indicadores | `/dashboard` | Inicio |

## Distinciones relevantes

| Par | Distinción |
|---|---|
| **Empleado** ≠ **Usuario** | El empleado es una persona de la empresa; el usuario, una cuenta del sistema. No toda persona posee cuenta |
| **Ingreso** ≠ **Ajuste** | El ingreso suma a la existencia; el ajuste la reemplaza por el valor indicado |
| **Dar de baja** ≠ **Anular** | La baja desactiva una ficha; la anulación revierte una venta y sus efectos |
| **Venta confirmada** ≠ **venta anulada** | Sólo las confirmadas computan en indicadores, caja y reportes |
| **Precio del material** ≠ **precio de la venta** | La venta congela el precio vigente al registrarse |
| **Saldo de caja** ≠ **suma de los movimientos listados** | El saldo es acumulado total; el filtro de fechas afecta únicamente al listado |

---

<h1 class="sin-numero">Anexo B — Roles y permisos</h1>

## Catálogo de permisos

El sistema define **cuarenta y un permisos**: diez módulos por cuatro acciones, más el comodín de
administración.

| Módulos | Acciones |
|---|---|
| `users`, `employees`, `inventory`, `production`, `commercial`, `sales`, `finance`, `invoicing`, `reports`, `audit` | `read`, `create`, `update`, `delete` |

El comodín `admin.*` concede la totalidad de los permisos.

El catálogo incluye deliberadamente los códigos de los módulos no implementados, de modo que su
incorporación futura no requiera modificar la carga inicial (Capítulo XIV).

## Matriz de roles y permisos

| Permiso | Administración | Ventas | Stock | Producción | Finanzas |
|---|:---:|:---:|:---:|:---:|:---:|
| `admin.*` | ● | | | | |
| `commercial.read` | ● | ● | | | ● |
| `commercial.create` | ● | ● | | | |
| `commercial.update` | ● | ● | | | |
| `commercial.delete` | ● | ● | | | |
| `inventory.read` | ● | ● | ● | ● | ● |
| `inventory.create` | ● | | ● | ● | |
| `inventory.update` | ● | | ● | ● | |
| `inventory.delete` | ● | | ● | | |
| `production.read` | ● | | | ● | |
| `production.create` | ● | | | ● | |
| `production.update` | ● | | | ● | |
| `production.delete` | ● | | | ● | |
| `finance.read` | ● | | | | ● |
| `finance.create` | ● | | | | ● |
| `finance.update` | ● | | | | ● |
| `finance.delete` | ● | | | | ● |
| `invoicing.*` | ● | | | | ● |
| `reports.read` | ● | | | | ● |
| `users.*` | ● | | | | |
| `audit.read` | ● | | | | |

El rol de Administración accede a la totalidad mediante el comodín, sin requerir permisos
individuales.

Los permisos de producción y facturación se encuentran asignados pero no gobiernan ninguna ruta,
por corresponder a áreas no implementadas.

## Correspondencia entre permisos, rutas y menú

| Opción del menú | Ruta del cliente | Permiso | Rutas del servidor |
|---|---|---|---|
| Inicio | `/dashboard` | *(sólo sesión)* | `/api/dashboard` |
| Clientes | `/commercial/customers` | `commercial.read` | `/api/commercial/customers` |
| Materiales | `/inventory/finished-products` | `inventory.read` | `/api/inventory/finished-products`, `/api/categories` |
| Ventas | `/commercial/sales` | `commercial.read` | `/api/commercial/sales` |
| Caja de ventas | `/finance/sales-cash` | `finance.read` | `/api/finance/sales-cash` |
| Usuarios | `/users` | `users.read` | `/api/users` |
| Roles | `/roles` | `users.read` | `/api/roles` |
| Auditoría | `/audit` | `audit.read` | `/api/audit` |
| Reportes | `/reports` | `reports.read` | `/api/reports` |

Las rutas de creación y modificación exigen los permisos correspondientes de creación y
modificación, con la misma correspondencia.

## Alcance efectivo por rol

| Rol | Opciones visibles |
|---|---|
| Administración | Las nueve |
| Ventas | Inicio, Clientes, Materiales, Ventas |
| Stock | Inicio, Materiales |
| Producción | Inicio, Materiales |
| Finanzas | Inicio, Clientes, Materiales, Ventas, Caja de ventas, Reportes |

El rol de Producción posee los permisos de su área, pero al no encontrarse implementado el módulo
correspondiente su alcance efectivo se limita a la consulta y carga de existencias.

---

<h1 class="sin-numero">Anexo C — Mensajes del sistema</h1>

Se reproducen textualmente los mensajes que el sistema presenta al usuario, organizados por
situación. Constituyen la referencia para el manual de usuario, que debe citarlos sin alterarlos.

## Confirmaciones

| Mensaje | Situación |
|---|---|
| «Cliente creado.» · «Cliente actualizado.» · «Cliente dado de baja.» | Operaciones sobre clientes |
| «Material creado.» · «Material actualizado.» · «Material dado de baja.» | Operaciones sobre materiales |
| «Categoría creada.» | Alta de categoría |
| «Movimiento de stock registrado.» | Ingreso o ajuste de existencias |
| «Usuario creado.» · «Usuario actualizado.» · «Usuario dado de baja.» | Operaciones sobre usuarios |
| «Venta anulada. Stock repuesto.» | Anulación de una venta |
| «Reporte generado con N línea(s) de venta.» | Descarga satisfactoria |
| «Tu contraseña fue actualizada. Ya podés iniciar sesión.» | Restablecimiento completado |

## Solicitudes de confirmación

| Mensaje | Situación |
|---|---|
| «¿Dar de baja al cliente "…"?» | Baja de cliente |
| «¿Dar de baja el material "…"?» | Baja de material |
| «¿Dar de baja al usuario "…"?» | Baja de usuario |
| «¿Anular esta venta? Se repondrá el stock de los materiales vendidos.» | Anulación |

## Acceso

| Mensaje | Situación |
|---|---|
| «Email o contraseña incorrectos.» | Credenciales inválidas, usuario inexistente o dado de baja |
| «No se pudo iniciar sesión. Intentá nuevamente.» | Fallo no atribuible a las credenciales |
| «Si el email está registrado, vas a recibir un mensaje con las instrucciones para restablecer tu contraseña.» | Solicitud de recuperación, **con independencia del resultado** |
| «El enlace de recuperación es inválido o expiró» | Enlace vencido, ya utilizado o inexistente |
| «Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.» | Límite de frecuencia excedido |

## Conflictos y validaciones

| Mensaje | Situación |
|---|---|
| «El email ya está registrado» | Alta de usuario con correo existente |
| «El SKU ya fue registrado» | Alta o modificación de material con código existente |
| «Ya existe una categoría con ese nombre y tipo» | Alta de categoría duplicada |
| «La categoría indicada no existe» | Categoría inválida en el alta de material |
| «La venta debe tener al menos un ítem» | Venta sin líneas |
| «Formato de fecha esperado: YYYY-MM-DD» | Fecha con formato inválido |
| «La fecha "desde" no puede ser posterior a "hasta"» | Rango invertido |
| «Datos inválidos» | Error de validación, acompañado del detalle por campo |

## Reglas de negocio

| Mensaje | Situación |
|---|---|
| «Stock insuficiente para *material* (disponible X, requerido Y)» | Venta que excede la existencia |
| «El cliente no existe o está inactivo» | Venta con cliente dado de baja |
| «Producto inexistente o inactivo: …» | Venta con material dado de baja |
| «No hay una caja de ventas configurada. Ejecutá el seed.» | Venta sin caja creada |
| «Solo se pueden anular ventas confirmadas» | Anulación de una venta ya anulada |
| «La venta ya no está confirmada» | Anulación simultánea |
| «El reporte supera las 20.000 filas. Achicá el rango de fechas.» | Rango excesivo |
| «El rango supera los N puntos para esta agrupación. Achicá el período.» | Serie temporal excesiva |

## Ausencia de resultados

| Mensaje | Pantalla |
|---|---|
| «Ingresá al menos 2 caracteres para buscar.» | Clientes, Materiales, Usuarios |
| «No se encontraron clientes para esa búsqueda.» | Clientes |
| «No se encontraron materiales para esa búsqueda.» | Materiales |
| «No se encontraron usuarios para esa búsqueda.» | Usuarios |
| «No hay ventas para el período y los filtros seleccionados.» | Ventas |
| «No hubo movimientos de caja en el período seleccionado.» | Caja de ventas |
| «No hay registros de auditoría para los filtros aplicados.» | Auditoría |
| «Sin ventas confirmadas en el período.» | Gráfico de evolución |
| «No hay ventas confirmadas en el período. El archivo se descargó sin datos.» | Reportes |

## Errores técnicos

| Mensaje | Situación |
|---|---|
| «No autenticado» · «Token inválido o expirado» | Ausencia o invalidez de la credencial |
| «Falta el permiso: …» | Credencial válida sin autorización |
| «Recurso no encontrado» · «Ruta no encontrada» | Recurso o ruta inexistentes |
| «Violación de unicidad» | Conflicto detectado por la base de datos |
| «Error interno del servidor» | Error no previsto. El detalle queda en el registro del servidor |
| «Ocurrió un error inesperado» | Mensaje de reserva del cliente |

---

<h1 class="sin-numero">Anexo D — Matriz de trazabilidad</h1>

Relaciona cada funcionalidad entregada con su requerimiento, su implementación, su verificación y su
documentación.

| ID | Funcionalidad | RF | Permiso | Implementación (servidor) | Implementación (cliente) | Prueba | Cap. técnico | Cap. manual |
|---|---|---|---|---|---|---|:---:|:---:|
| F01 | Inicio de sesión | RF-01 | — | `auth.service.ts` | `login.component.ts` | Circuito de ventas | VI | 2 |
| F02 | Solicitud de recuperación | RF-03, RF-05 | — | `auth.service.ts` | `forgot-password.component.ts` | Recuperación | VI | 3 |
| F03 | Restablecimiento | RF-04 | — | `auth.service.ts` | `reset-password.component.ts` | Recuperación | VI | 3 |
| F04 | Renovación de sesión | RF-02 | — | `auth.service.ts` | `jwt.interceptor.ts` | — | VI, X | — |
| F05 | Indicadores de gestión | RF-24, RF-27 | Sesión | `dashboard.service.ts` | `dashboard.component.ts` | Circuito de ventas | VII | 5 |
| F06 | Evolución de ventas | RF-25 | Sesión | `dashboard.service.ts` | `sales-chart.component.ts` | — | VII | 5 |
| F07 | Gestión de clientes | RF-15 | `commercial.*` | `customers.service.ts` | `customer-list` · `customer-form` | Circuito de ventas | VII | 6 |
| F08 | Gestión de materiales | RF-10, RF-11 | `inventory.*` | `finished-products.service.ts` | `product-list` · `product-form` | Circuito de ventas | VII | 7 |
| F09 | Alta de categoría | RF-12 | `inventory.create` | `categories.service.ts` | `category-form.component.ts` | — | VII | 7 |
| F10 | Movimientos de existencias | RF-13, RF-14 | `inventory.update` | `finished-products.service.ts` | `stock-movement-dialog` | Circuito de ventas | VII | 7 |
| **F11** | **Registro de venta** | RF-16 a RF-19 | `commercial.create` | `sales.service.ts` → `create()` | `sale-form.component.ts` | **Circuito de ventas: caso feliz, rechazo y concurrencia** | **VIII** | **8** |
| F12 | Consulta de ventas | RF-20 | `commercial.read` | `sales.controller.ts` | `sale-list.component.ts` | Circuito · Listado de ventas | VII, XI | 8 |
| F13 | Detalle de venta | RF-20 | `commercial.read` | `sales.service.ts` → `getById()` | `sale-detail.component.ts` | Circuito de ventas | XI | 8 |
| **F14** | **Anulación de venta** | RF-21, RF-22 | `commercial.update` | `sales.service.ts` → `cancel()` | `sale-detail.component.ts` | Circuito de ventas | **VIII** | 8 |
| F15 | Caja de ventas | RF-23 | `finance.read` | `sales-cash.service.ts` | `cash-register.component.ts` | Filtros de fecha · Caja | VII | 9 |
| F16 | Reporte de ventas | RF-26, RF-27 | `reports.read` | `sales-by-period.ts` · `excel-writer.ts` | `sales-report.component.ts` | — | **IX** | 10 |
| F17 | Consulta de auditoría | RF-29 | `audit.read` | `audit.service.ts` | `audit-list.component.ts` | Circuito · Auditoría | VII | 11 |
| F18 | Gestión de usuarios | RF-06 a RF-08 | `users.*` | `users.service.ts` | `user-list` · `user-form` | — | VI, VII | 11 |
| F19 | Consulta de roles | RF-09 | `users.read` | `roles.service.ts` | `role-list.component.ts` | — | VI | 11 |

## Trazabilidad de los requerimientos no funcionales

| RNF | Mecanismo | Verificación | Cap. |
|---|---|---|:---:|
| RNF-01 | Transacción de base de datos | Reversión completa ante existencia insuficiente | VIII |
| RNF-02 | Decremento atómico condicional | **Prueba de concurrencia** | VIII |
| RNF-03 | Baja lógica | Circuito de ventas | V |
| RNF-04 | Tipo y aritmética decimales | Circuito de ventas | V, VIII |
| RNF-05 | Derivación de clave con sal | Recuperación de contraseña | VI |
| RNF-06 | Verificación de permiso por ruta | — | VI |
| RNF-07 | Esquemas de validación | Recuperación · Circuito | VI, VII |
| RNF-08 | Respuesta invariable | **Recuperación: correo inexistente y usuario dado de baja** | VI |
| RNF-09 | Límite de frecuencia | Verificación manual | VI |
| RNF-10 | Paginación con tope | — | VII |
| RNF-11 | Tope de filas del reporte | — | IX |
| RNF-12 | Tope de puntos de la serie | — | VII |
| RNF-13 a RNF-16 | Textos, formateo local, catálogo de errores, filtros iniciales | Listados de ventas, auditoría y caja | X |
| RNF-17 | Convención de módulo vertical | — | VII |
| RNF-18 | Catálogo de definiciones de reporte | — | IX |
| RNF-19 | Integración continua | La suite completa | XII |
| RNF-20 | Variables de entorno validadas | — | IV |

Los requerimientos sin prueba automatizada asociada se verificaron de forma manual o resultan
observables por inspección del código. El Capítulo XII declara el alcance y las limitaciones de la
verificación.
