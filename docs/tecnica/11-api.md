# Interfaz de programación

Este capítulo documenta el contrato que el servidor expone. Comienza por las convenciones comunes,
presenta el catálogo completo de puntos de acceso y detalla los seis centrales.

## Convenciones

### Dirección base y autenticación

Todos los puntos de acceso se publican bajo el prefijo `/api`. La única excepción es la verificación
de estado, deliberadamente situada fuera de él para que un supervisor externo pueda consultarla sin
conocer la estructura de la interfaz.

Salvo los puntos de acceso públicos de autenticación, todos exigen la credencial en la cabecera
correspondiente:

```http
Authorization: Bearer <token de acceso>
```

### Estructura de respuesta

Toda respuesta satisfactoria se entrega envuelta:

```json
{ "data": { … } }
```

Los listados incorporan la información de paginación:

```json
{
  "data": [ … ],
  "meta": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 }
}
```

La descarga de reportes constituye la única excepción: entrega el archivo como cuerpo y transmite sus
metadatos por cabecera.

### Estructura de error

```json
{ "error": "Descripción legible", "details": { … } }
```

El campo de detalle acompaña a los errores de validación, indicando el problema por cada campo
rechazado.

### Códigos de estado

| Código | Uso |
|---|---|
| 200 | Operación satisfactoria |
| 201 | Recurso creado |
| 400 | Datos de entrada inválidos o regla de negocio incumplida |
| 401 | Ausencia de credencial válida |
| 403 | Credencial válida sin el permiso requerido |
| 404 | Recurso inexistente |
| 409 | Conflicto con un registro existente |
| 422 | Solicitud correcta que el estado del sistema impide satisfacer |
| 429 | Límite de frecuencia excedido |
| 500 | Error no previsto |

### Paginación, búsqueda y filtros

Los listados aceptan un conjunto uniforme de parámetros:

| Parámetro | Tipo | Comportamiento |
|---|---|---|
| `page` | Entero | Página solicitada. Por omisión, la primera |
| `limit` | Entero | Tamaño de página. Por omisión veinte, con un máximo de cien |
| `search` | Texto | Búsqueda parcial, sin distinción de mayúsculas. Los campos considerados dependen del recurso |
| `from`, `to` | `AAAA-MM-DD` | Rango de fechas, normalizado al inicio y al fin del día. Una fecha inválida se ignora |

Un valor de tamaño de página superior al máximo se acota en lugar de rechazarse.

### Tipos de datos

| Concepto | Representación | Ejemplo |
|---|---|---|
| Identificador | Identificador universal único, como texto | `"3f2b8c10-…"` |
| Importe | **Cadena de texto**, para preservar la precisión decimal | `"42500.00"` |
| Cantidad | Cadena de texto, con hasta tres decimales | `"12.500"` |
| Fecha y hora | Formato ISO 8601 | `"2026-09-13T17:42:00.000Z"` |

Que los importes viajen como texto y no como número es consecuencia de la decisión de precisión
descrita en el Capítulo V.

## Catálogo de puntos de acceso

El servidor expone **cuarenta puntos de acceso**.

### Verificación de estado

| Método | Ruta | Autorización |
|---|---|---|
| GET | `/health` | Pública |

### Autenticación

| Método | Ruta | Autorización |
|---|---|---|
| POST | `/api/auth/login` | Pública |
| POST | `/api/auth/refresh` | Pública |
| GET | `/api/auth/me` | Sesión |
| POST | `/api/auth/forgot-password` | Pública, con límite de frecuencia |
| GET | `/api/auth/reset-password/:token/validate` | Pública, con límite de frecuencia |
| POST | `/api/auth/reset-password` | Pública, con límite de frecuencia |

### Usuarios y roles

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/users` | `users.read` |
| GET | `/api/users/:id` | `users.read` |
| POST | `/api/users` | `users.create` |
| PATCH | `/api/users/:id` | `users.update` |
| DELETE | `/api/users/:id` | `users.delete` |
| GET | `/api/roles` | `users.read` |
| GET | `/api/roles/:id` | `users.read` |

### Inventario

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/categories` | `inventory.read` |
| POST | `/api/categories` | `inventory.create` |
| GET | `/api/inventory/finished-products` | `inventory.read` |
| GET | `/api/inventory/finished-products/:id` | `inventory.read` |
| POST | `/api/inventory/finished-products` | `inventory.create` |
| PATCH | `/api/inventory/finished-products/:id` | `inventory.update` |
| DELETE | `/api/inventory/finished-products/:id` | `inventory.delete` |
| GET | `/api/inventory/finished-products/:id/movements` | `inventory.read` |
| POST | `/api/inventory/finished-products/:id/movements` | `inventory.update` |

### Comercial

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/commercial/customers` | `commercial.read` |
| GET | `/api/commercial/customers/:id` | `commercial.read` |
| POST | `/api/commercial/customers` | `commercial.create` |
| PATCH | `/api/commercial/customers/:id` | `commercial.update` |
| DELETE | `/api/commercial/customers/:id` | `commercial.delete` |
| GET | `/api/commercial/sales` | `commercial.read` |
| GET | `/api/commercial/sales/:id` | `commercial.read` |
| POST | `/api/commercial/sales` | `commercial.create` |
| PATCH | `/api/commercial/sales/:id/cancel` | `commercial.update` |

### Finanzas, reportes, auditoría e indicadores

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/finance/sales-cash` | `finance.read` |
| GET | `/api/finance/sales-cash/movements` | `finance.read` |
| GET | `/api/reports/:key/excel` | `reports.read` |
| GET | `/api/audit` | `audit.read` |
| GET | `/api/audit/entities` | `audit.read` |
| GET | `/api/audit/:id` | `audit.read` |
| GET | `/api/dashboard` | Sesión |
| GET | `/api/dashboard/sales-series` | Sesión |

> El enrutador reserva además los prefijos de las áreas excluidas del alcance —materias primas,
> producción, proveedores, pagos y facturación—. Se encuentran montados y autenticados pero no
> exponen ningún punto de acceso.

## Detalle de los puntos de acceso centrales

### Inicio de sesión

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "usuario@perlinor.local", "password": "…" }
```

**200**

```json
{ "data": { "accessToken": "eyJhbGciOi…", "refreshToken": "eyJhbGciOi…" } }
```

| Error | Situación |
|---|---|
| 400 | Correo con formato inválido o contraseña ausente |
| 401 | Credenciales incorrectas, usuario inexistente o dado de baja |

El mensaje de la respuesta de credenciales inválidas es idéntico en las tres situaciones, de modo que
no permita determinar cuál se produjo.

El par de tokens no incluye el perfil del usuario: el cliente lo obtiene a continuación mediante el
punto de acceso de sesión actual.

### Registro de venta

```http
POST /api/commercial/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "3f2b8c10-…",
  "paymentMethod": "TRANSFER",
  "items": [
    { "finishedProductId": "a1c4…", "quantity": 250 },
    { "finishedProductId": "b7e2…", "quantity": 40 }
  ]
}
```

| Campo | Tipo | Obligatorio | Restricción |
|---|---|---|---|
| `customerId` | Identificador | Sí | Debe corresponder a un cliente vigente |
| `paymentMethod` | Enumerado | Sí | `CASH`, `TRANSFER`, `CARD`, `CHECK` o `ACCOUNT` |
| `items` | Lista | Sí | Al menos un elemento |
| `items[].finishedProductId` | Identificador | Sí | Debe corresponder a un material vigente |
| `items[].quantity` | Número | Sí | Mayor que cero |

**El cuerpo no admite precios ni importes.** Los precios son autoridad del servidor, que los toma del
material y los congela en la línea (Capítulo VIII).

**201**

```json
{
  "data": {
    "id": "9d1f…",
    "status": "CONFIRMED",
    "paymentMethod": "TRANSFER",
    "subtotal": "291500.00",
    "tax": "0",
    "total": "291500.00",
    "soldAt": "2026-09-13T17:42:00.000Z",
    "customer": { "id": "3f2b…", "name": "Corralón del Norte S.R.L.", "taxId": "30-71204558-3" },
    "createdBy": { "id": "5a8c…", "fullName": "Usuario Ventas" },
    "details": [
      { "id": "…", "finishedProductId": "a1c4…", "quantity": "250", "unitPrice": "850.00", "lineTotal": "212500.00" },
      { "id": "…", "finishedProductId": "b7e2…", "quantity": "40",  "unitPrice": "1975.00", "lineTotal": "79000.00" }
    ]
  }
}
```

| Error | Situación |
|---|---|
| 400 | Cuerpo inválido; cliente inexistente o dado de baja; material inexistente o dado de baja; caja de ventas no configurada |
| **422** | **Existencia insuficiente.** El mensaje indica el material, la cantidad disponible y la requerida |

La distinción es relevante: la existencia insuficiente no constituye un error de la solicitud, que es
correcta, sino una condición del estado del sistema que impide atenderla.

Un rechazo **no produce efecto alguno**: no se crea la venta, no se generan movimientos, no se
descuentan existencias y la caja permanece inalterada.

### Anulación de venta

```http
PATCH /api/commercial/sales/:id/cancel
Authorization: Bearer <token>
```

Sin cuerpo. Responde **200** con la venta actualizada, en estado anulado.

| Error | Situación |
|---|---|
| 404 | La venta no existe |
| 422 | La venta no se encuentra confirmada: ya fue anulada, o una anulación simultánea se adelantó |

La operación repone las existencias, genera los movimientos de ingreso correspondientes y revierte el
movimiento de caja.

### Movimiento de existencias

```http
POST /api/inventory/finished-products/:id/movements
Authorization: Bearer <token>
Content-Type: application/json

{ "type": "IN", "quantity": 500, "reference": "Recepción de producción" }
```

| Campo | Tipo | Obligatorio | Restricción |
|---|---|---|---|
| `type` | Enumerado | Sí | **Únicamente `IN` o `ADJUST`** |
| `quantity` | Número | Sí | Mayor que cero |
| `reference` | Texto | No | Origen del movimiento |

El esquema **no admite el valor de egreso**: las salidas se originan exclusivamente en el registro de
una venta. Es la restricción que impide alterar las existencias por una vía distinta de la prevista.

**201**

```json
{ "data": { "movement": { "id": "…", "type": "IN", "quantity": "500" }, "currentStock": "4500.000" } }
```

La respuesta incluye la existencia resultante, de modo que el cliente actualice su vista sin una
consulta adicional.

Ambos tipos poseen semántica distinta: el ingreso **suma** a la existencia actual, mientras que el
ajuste la **fija** en el valor indicado.

### Serie temporal de ventas

```http
GET /api/dashboard/sales-series?groupBy=week&from=2026-07-01&to=2026-09-13
Authorization: Bearer <token>
```

| Parámetro | Valores | Por omisión |
|---|---|---|
| `groupBy` | `day`, `week`, `month` | `day` |
| `from`, `to` | `AAAA-MM-DD` | Últimos 30 días, 12 semanas o 12 meses, según la agrupación |

**200**

```json
{
  "data": {
    "groupBy": "week",
    "from": "2026-07-01",
    "to": "2026-09-13",
    "points": [
      { "label": "2026-06-29", "total": "1284500.00", "count": 7 },
      { "label": "2026-07-06", "total": "0.00", "count": 0 }
    ]
  }
}
```

| Error | Situación |
|---|---|
| 400 | Formato de fecha inválido, o fecha inicial posterior a la final |
| 422 | El rango excede el tope de puntos: 366 diarios, 120 semanales o 60 mensuales |

La respuesta incluye **todos los intervalos del rango, también los vacíos**. Omitirlos haría que el
gráfico uniera dos períodos con ventas y aparentara una continuidad inexistente.

Computa exclusivamente ventas confirmadas y agrupa según la hora del servidor, criterio compartido
con los indicadores para que ambas pantallas coincidan (Capítulo VII).

### Descarga de reporte

```http
GET /api/reports/sales-by-period/excel?from=2026-09-01&to=2026-09-13&customerId=3f2b…
Authorization: Bearer <token>
```

**200**

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="ventas-por-periodo_2026-09-01_2026-09-13.xlsx"
X-Report-Rows: 184

<contenido binario>
```

| Error | Situación |
|---|---|
| 400 | Filtros inválidos, o fecha inicial posterior a la final |
| 404 | La clave de reporte no existe en el catálogo |
| 422 | El resultado excede las veinte mil filas |

La cantidad de filas se transmite por cabecera para que el cliente pueda informar la ausencia de datos
en el período sin abrir el archivo. Ambas cabeceras requieren declaración explícita en la
configuración de origen cruzado (Capítulo VI).

Un resultado vacío **no constituye un error**: el archivo se genera igualmente, con su encabezado y
sin filas.

## Verificación manual

El repositorio incluye una colección de peticiones que reproduce el circuito completo —inicio de
sesión, alta de cliente, alta de material, carga de existencias, registro de venta y consulta del
resultado— con las variables encadenadas entre sí. Permite verificar el contrato sin la interfaz y
constituye la referencia ejecutable de este capítulo.
