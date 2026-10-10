# Implementación del servidor

Este capítulo describe la organización interna del servidor de aplicación: su estructura de
directorios, la anatomía de un módulo, los mecanismos transversales y las utilidades compartidas.

No se documenta cada archivo del proyecto. Se explica en profundidad **un módulo de referencia** y
se describen los mecanismos que todos comparten, de modo que la lectura de cualquier otro módulo
resulte previsible.

## Organización del código

```
erp-backend/
├── prisma/            esquema, migraciones y carga de datos iniciales
└── src/
    ├── config/        entorno, conexión a la base, restricción de origen
    ├── modules/       un directorio por módulo del dominio
    ├── shared/        middlewares y utilidades transversales
    ├── app.ts         composición de la aplicación
    └── server.ts      punto de entrada
```

La separación entre la composición de la aplicación y el punto de entrada responde a una necesidad
concreta de las pruebas. El primero construye la aplicación y la devuelve sin ponerla a escuchar; el
segundo establece la conexión con la base, la pone a escuchar y gestiona el apagado ordenado. Gracias
a esa separación, la suite de pruebas construye la aplicación y le envía peticiones **sin levantar un
servidor real ni ocupar un puerto** (Capítulo XII).

### Módulos

| Módulo | Ruta base | Estado |
|---|---|---|
| Autenticación | `/api/auth` | Implementado |
| Usuarios | `/api/users` | Implementado |
| Roles | `/api/roles` | Implementado, sólo consulta |
| Categorías | `/api/categories` | Implementado |
| Materiales | `/api/inventory/finished-products` | Implementado |
| Clientes | `/api/commercial/customers` | Implementado |
| Ventas | `/api/commercial/sales` | Implementado |
| Caja de ventas | `/api/finance/sales-cash` | Implementado, sólo consulta |
| Reportes | `/api/reports` | Implementado |
| Auditoría | `/api/audit` | Implementado, sólo consulta |
| Indicadores | `/api/dashboard` | Implementado |

El enrutador reserva además los prefijos correspondientes a las áreas excluidas del alcance. Esos
prefijos se encuentran montados y autenticados, pero no exponen ningún punto de acceso: cualquier
ruta bajo ellos responde recurso inexistente.

## Anatomía de un módulo

Todos los módulos implementados presentan la misma estructura de cuatro archivos. Se toma el módulo
de clientes como referencia por ser el más representativo.

```
modules/commercial/customers/
├── customers.routes.ts       montaje y barreras
├── customers.controller.ts   traducción HTTP ↔ dominio
├── customers.service.ts      reglas de negocio
└── customers.dto.ts          esquemas de validación
```

### Rutas

El archivo de rutas monta los puntos de acceso y aplica las tres barreras que atraviesa toda
petición antes de alcanzar la lógica:

```ts
customersRoutes.use(authenticate);

customersRoutes.get('/',    requirePermission('commercial.read'),   customersController.list);
customersRoutes.post('/',   requirePermission('commercial.create'),
                            validate(createCustomerSchema),         customersController.create);
customersRoutes.patch('/:id', requirePermission('commercial.update'),
                            validate(updateCustomerSchema),         customersController.update);
customersRoutes.delete('/:id', requirePermission('commercial.delete'), customersController.deactivate);
```

El archivo no contiene lógica alguna. Su valor reside precisamente en eso: permite verificar de un
vistazo qué permiso exige cada operación y qué esquema valida cada cuerpo.

### Esquemas de validación

Declaran la forma esperada de los datos de entrada. Se definen dos esquemas por entidad, uno para el
alta y otro para la modificación, en el que todos los campos resultan opcionales:

```ts
export const createCustomerSchema = z.object({
  name:    z.string().min(2),
  taxId:   z.string().optional(),
  email:   z.string().email().optional(),
  phone:   z.string().optional(),
  address: z.string().optional(),
});
```

Los esquemas cumplen además una función de tipado: los tipos de los objetos de transferencia se
**derivan** del esquema en lugar de declararse por separado, de modo que validación y tipo no pueden
divergir.

### Controlador

Traduce entre el protocolo y el dominio. Normaliza los parámetros de consulta, invoca al servicio y
selecciona el código de respuesta:

```ts
async create(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customersService.create(req.body, req.user?.id);
    res.status(201).json(ok(customer));
  } catch (err) {
    next(err);
  }
}
```

Dos elementos merecen atención. El controlador **no consulta la base de datos**: toda su
interacción con los datos ocurre a través del servicio. Y **no maneja los errores**: los deriva al
manejador centralizado, que decide la respuesta según la naturaleza de lo recibido.

El identificador del usuario responsable se obtiene del contexto de la petición, donde lo dejó el
middleware de autenticación, y se transmite al servicio para la auditoría.

### Servicio

Concentra las reglas de negocio. En un módulo de administración de datos maestros, su contenido es
directo:

```ts
async create(dto: CreateCustomerDto, actorId?: string) {
  const customer = await prisma.customer.create({ data: { ... }, select: publicSelect });
  await writeAuditLog({ userId: actorId, action: 'CREATE',
                        entity: 'Customer', entityId: customer.id, newValues: customer });
  return customer;
}
```

Los servicios **no conocen los objetos de petición y respuesta**. Reciben datos ya validados y
devuelven datos o lanzan errores de aplicación. Esta independencia permite invocarlos desde
contextos ajenos a una petición HTTP.

Tres patrones se repiten en todos ellos:

1. **Proyección explícita.** Cada servicio define qué campos expone. En el módulo de usuarios esto
   resulta determinante: el resumen de la contraseña jamás integra la proyección, de modo que no
   puede filtrarse por olvido.
2. **Auditoría de toda operación de escritura.** Creación, modificación y baja generan su asiento.
3. **Baja lógica.** La operación de baja marca el registro como no vigente.

## Mecanismos transversales

### Validación

El middleware de validación aplica un esquema sobre una sección de la petición —cuerpo, parámetros
de consulta o de ruta— y **reemplaza esa sección con el valor ya procesado**:

```ts
export function validate(schema: ZodTypeAny, source: Source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req[source] = result.data;
    return next();
  };
}
```

El reemplazo es lo que distingue este middleware de una verificación. El controlador no recibe la
entrada original sino la ya normalizada, con sus conversiones de tipo aplicadas.

Ante un fallo, el error se deriva al manejador centralizado en lugar de construir una respuesta, de
modo que el formato del error de validación se define en un único lugar.

### Verificación de permisos

```ts
export function requirePermission(permission: string) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    const granted = req.user.permissions.includes('admin.*')
                 || req.user.permissions.includes(permission);
    if (!granted) return next(AppError.forbidden(`Falta el permiso: ${permission}`));
    return next();
  };
}
```

La distinción entre ausencia de sesión y ausencia de permiso es relevante: la primera produce una
respuesta que el cliente interpreta como orden de renovar la sesión; la segunda, una denegación que
no debe disparar renovación alguna.

### Auditoría

```ts
export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({ data: { ... } });
  } catch (err) {
    logger.error('No se pudo escribir AuditLog', { err, entity: input.entity });
  }
}
```

La función **captura sus errores y no los propaga**. Se trata de una decisión explícita: un fallo al
registrar la auditoría no debe impedir la operación de negocio que la originó. Una venta correcta no
debe fracasar porque la auditoría no pudo escribirse.

La contrapartida se documenta como limitación en el Capítulo VI.

Se invoca desde los servicios y no desde los controladores, porque es el servicio quien conoce el
estado anterior y posterior de la entidad. En las operaciones transaccionales se ejecuta **fuera de
la transacción**, una vez confirmada: auditar dentro implicaría que una reversión eliminase también
el asiento.

### Manejo centralizado de errores

Un único manejador, situado al final de la cadena, clasifica lo recibido:

| Origen | Respuesta |
|---|---|
| Respuesta ya iniciada | Delega en el manejador por omisión e interrumpe la conexión |
| Error de validación | 400, con el detalle por campo |
| Error de aplicación | El código que declara, con su mensaje |
| Violación de unicidad de la base | 409, indicando el campo en conflicto |
| Registro inexistente en la base | 404 |
| Cualquier otro | 500 genérico, con el detalle en el registro del servidor |

El primer caso corresponde a una situación específica que conviene explicar. Durante la transmisión
del archivo de un reporte, las cabeceras ya fueron enviadas y el cuerpo comenzó a escribirse: resulta
imposible reemplazar esa respuesta por un mensaje de error. El manejador detecta la condición y
delega, de modo que la conexión se interrumpe. El cliente recibe una descarga incompleta —que puede
detectar— en lugar de un archivo con un mensaje de error incrustado.

El último caso protege la información interna: los errores no contemplados producen siempre un
mensaje genérico, mientras el detalle queda registrado del lado del servidor.

Los errores de aplicación se construyen mediante métodos de fábrica que asocian cada situación a su
código:

```ts
AppError.badRequest(mensaje)     // 400
AppError.unauthorized(mensaje)   // 401
AppError.forbidden(mensaje)      // 403
AppError.notFound(mensaje)       // 404
AppError.conflict(mensaje)       // 409
AppError.unprocessable(mensaje)  // 422
```

## Utilidades compartidas

### Paginación

Normaliza los parámetros de paginación respetando los límites de configuración:

```ts
export function getPagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const requested = Number(query.limit) || env.DEFAULT_PAGINATION_LIMIT;
  const limit = Math.min(Math.max(1, requested), env.MAX_PAGINATION_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}
```

Un valor ausente, no numérico o negativo produce el valor por omisión en lugar de un error, y un
valor excesivo se acota al máximo configurado. Este último detalle implementa el requerimiento
RNF-10: **ningún cliente puede solicitar el conjunto completo de registros** aumentando el tamaño de
página.

Todos los listados obtienen la página y el total en paralelo, y construyen la información de
paginación con la misma función, de modo que la estructura resulte idéntica en todos ellos.

### Manejo de fechas

Los filtros por rango de fechas de tres pantallas distintas —ventas, auditoría y caja— comparten un
único analizador:

```ts
export function parseDay(value: unknown, edge: 'start' | 'end'): Date | undefined
```

La unificación no es una cuestión de estilo. Si cada pantalla interpretara los límites del rango de
manera propia, dos consultas sobre el mismo período podrían arrojar resultados distintos. La función
normaliza al inicio o al fin del día según corresponda y **devuelve valor indefinido ante una fecha
inválida**, de modo que el filtro se ignore en lugar de producir un error.

Una segunda función resuelve el rango completo, aplicando un valor por omisión cuando falta el
límite inicial.

### Registro de actividad

El registrador emite por consola con formato legible en desarrollo y estructurado en JSON en
producción. El nivel de detalle también depende del entorno.

### Envío de correo

El servidor de correo es **opcional**. En su ausencia, la función de envío registra el contenido del
mensaje en el registro de actividad y devuelve un valor que indica que no hubo envío:

```ts
if (!isMailConfigured()) {
  logger.warn('SMTP no configurado: el mail no se envía, se registra en el log', { ... });
  return false;
}
```

Esto permite completar el flujo de recuperación de contraseña en desarrollo sin servidor de correo,
copiando el enlace desde la consola. Para que el modo no pase inadvertido en producción, el arranque
emite una advertencia explícita cuando detecta esa combinación.

La función **nunca propaga una excepción**: un fallo de envío produciría una respuesta distinta y
revelaría, por diferencia, que la dirección existía (Capítulo VI).

## Agregación temporal

El módulo de indicadores presenta el único caso del sistema en que la agregación **no se delega en la
base de datos**, decisión que conviene justificar por apartarse del criterio general.

La serie temporal de ventas agrupa por día, semana o mes. La solución natural sería truncar la fecha
en la consulta. No se hizo: la marca temporal se almacena sin zona horaria, expresada en tiempo
universal, de modo que agrupar en la base desplazaría al día siguiente toda venta posterior a
determinada hora de la tarde.

La agregación se realiza entonces en la aplicación, utilizando la hora del servidor —el mismo
criterio que aplican los indicadores— de modo que el total del día en el gráfico **coincide con el
indicador de ventas del día**. Dos pantallas que muestran el mismo dato no pueden diferir.

El volumen de operación del sistema vuelve irrelevante el costo de traer las ventas del período. Si
alguna vez dejara de serlo, la consulta puede reemplazarse por una versión que convierta la zona
horaria en la base sin alterar el contrato de la respuesta.

Dos decisiones complementarias completan el diseño:

- Se emiten **todos los intervalos del rango, incluidos los vacíos**. Omitirlos haría que el gráfico
  uniera dos días con ventas y aparentara una continuidad inexistente.
- Se aplica un **tope de intervalos por granularidad**, verificado antes de consultar. Un rango
  excesivo se rechaza con un mensaje que indica reducirlo.

## Apagado ordenado

El punto de entrada atiende las señales de interrupción y terminación. Al recibir cualquiera de
ellas, deja de aceptar conexiones nuevas, aguarda la finalización de las peticiones en curso, cierra
la conexión con la base y finaliza.

Sin este manejo, una interrupción durante una operación transaccional dejaría la conexión sin
liberar.
