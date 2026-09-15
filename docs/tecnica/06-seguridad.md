# Seguridad

Este capítulo describe los mecanismos de seguridad del sistema: cómo se identifica a los usuarios,
cómo se decide qué puede hacer cada uno, cómo se protegen las credenciales y qué medidas resguardan
los puntos de acceso públicos. Se incluyen también, de forma explícita, las limitaciones conocidas
del diseño adoptado.

## Autenticación

### Esquema de tokens

La autenticación se resuelve mediante **dos tokens firmados de vigencia asimétrica**:

| Token | Vigencia | Contenido | Uso |
|---|---|---|---|
| Acceso | 15 minutos | Identificador del usuario, correo y rol | Acompaña cada petición a un recurso protegido |
| Renovación | 7 días | Identificador del usuario | Obtiene un par de tokens nuevo, sin credenciales |

Ambos se firman con **secretos distintos**, de modo que la exposición del secreto de acceso no
habilita la emisión de tokens de renovación.

La asimetría es el fundamento del esquema. Un token de acceso de vigencia breve acota la ventana de
aprovechamiento en caso de intercepción, mientras que el de renovación evita que el usuario deba
autenticarse cada quince minutos.

### Ausencia de estado de sesión

El sistema **no persiste sesiones**: no existe una tabla de tokens emitidos ni un almacén de
sesiones activas. La validez de un token se determina verificando su firma y su vencimiento.

Esta decisión simplifica considerablemente la arquitectura —no requiere almacenamiento adicional ni
su limpieza periódica— y tiene una consecuencia que se documenta en la sección de limitaciones: un
token emitido **no puede revocarse** antes de su vencimiento.

### Resolución de permisos

Al recibir una petición protegida, el middleware de autenticación verifica la firma del token de
acceso y, a continuación, **consulta la base de datos** para resolver los permisos del rol.

Esta consulta por petición podría evitarse incorporando los permisos al propio token. No se hizo, y
el motivo constituye una ventaja concreta: **una modificación de los permisos de un rol surte
efecto en la petición inmediatamente siguiente**. Si los permisos viajaran dentro del token, un
usuario conservaría los suyos hasta que su token de acceso venciera.

Dado el volumen de operación del sistema, el costo de la consulta resulta irrelevante frente al
beneficio.

### Renovación automática

El cliente implementa la renovación de forma transparente. Un interceptor de peticiones detecta la
respuesta de sesión inválida, solicita un par de tokens nuevo y **reintenta la petición original una
única vez**. Si la renovación fracasa, cierra la sesión y redirige al inicio.

El límite de un reintento es deliberado: evita el ciclo infinito que se produciría si el servidor
respondiera de forma persistente con sesión inválida.

Los puntos de acceso públicos de autenticación quedan excluidos de este mecanismo. Sin esa
exclusión, un intento de inicio de sesión con credenciales incorrectas —que responde con sesión
inválida— dispararía una renovación carente de sentido.

### Almacenamiento en el cliente

Los tokens se conservan en el almacenamiento local del navegador. Esto permite que la sesión
sobreviva al cierre de la pestaña y a la recarga de la página; al iniciarse, la aplicación recupera
el perfil del usuario antes del primer dibujado, de modo que el menú se presenta ya filtrado por sus
permisos.

La alternativa —cookies con marca de inaccesibilidad desde el guion— ofrece mayor resistencia y se
analiza en la sección de limitaciones.

## Autorización

### Modelo de control de acceso

La autorización se basa en roles. Un usuario posee exactamente un rol; un rol agrupa un conjunto de
permisos; cada permiso habilita una acción sobre un módulo.

```
Usuario  →  Rol  →  Permisos  →  Acciones habilitadas
```

Los códigos de permiso siguen el patrón `módulo.acción`, con cuatro acciones por módulo: consulta,
creación, modificación y baja. El sistema define diez módulos, lo que produce cuarenta códigos, más
el comodín de administración.

Los roles y sus permisos **se definen durante la carga inicial y no se administran desde la
aplicación** (restricción RE-06). La organización posee cinco áreas estables y la complejidad de una
interfaz de administración de permisos no se justificaba. La aplicación ofrece una vista de consulta
de los roles y sus permisos.

### Verificación en dos capas

La autorización se verifica en dos lugares, con propósitos distintos que conviene no confundir:

| Capa | Mecanismo | Propósito |
|---|---|---|
| Cliente | Guarda de ruta y filtrado del menú | **Usabilidad.** Evitar que el usuario acceda a pantallas donde no podría operar |
| Servidor | Verificación de permiso en cada ruta | **Seguridad.** Es la única verificación con valor real |

**La verificación del cliente no constituye una medida de seguridad.** El código de la aplicación se
ejecuta en el navegador del usuario y puede modificarse. Un usuario que construyera manualmente una
petición hacia un recurso no autorizado obtendría una respuesta de acceso denegado del servidor,
porque toda ruta protegida verifica el permiso con independencia de lo que la interfaz permita.

Se explicita este punto porque la duplicación podría interpretarse como redundancia. No lo es: son
dos mecanismos con finalidades diferentes, y la eliminación de cualquiera de los dos degradaría el
sistema —el del cliente, en experiencia de uso; el del servidor, en seguridad.

### Correspondencia entre permisos y rutas

Cada ruta del servidor declara el permiso que exige junto a su definición, de modo que la relación
entre una función y su autorización resulta legible en un único lugar:

```ts
usersRoutes.get('/',      requirePermission('users.read'),   usersController.list);
usersRoutes.post('/',     requirePermission('users.create'), validate(schema), usersController.create);
usersRoutes.delete('/:id', requirePermission('users.delete'), usersController.deactivate);
```

En el cliente, cada ruta declara el permiso requerido como dato asociado, que la guarda lee. La
correspondencia entre ambos es directa y se verifica en el Anexo B.

Una única ruta protegida escapa a este esquema: el panel de indicadores exige sesión válida pero
ningún permiso particular. La decisión es deliberada —constituye la pantalla inicial de todos los
roles— y quedó documentada en el código para que no se interprete como una omisión.

## Protección de credenciales

### Contraseñas

Las contraseñas se almacenan mediante una función de derivación de clave con sal incorporada,
configurada con un factor de coste de diez. La función es deliberadamente lenta, lo que encarece el
ataque por fuerza bruta sobre una base filtrada.

El sistema **nunca almacena ni transmite la contraseña en claro**. La verificación se realiza
comparando el resultado de la derivación, no el valor original.

La política mínima exige ocho caracteres y se aplica de manera uniforme en el alta de usuario y en
el restablecimiento, de modo que ninguna de las dos vías permita establecer una contraseña más débil
que la otra.

### Respuestas de autenticación

El inicio de sesión responde con un **mensaje idéntico** en tres situaciones distintas: correo
inexistente, contraseña incorrecta y usuario dado de baja. Un mensaje diferenciado permitiría
determinar qué direcciones se encuentran registradas.

## Recuperación de contraseña

Este flujo concentra las decisiones de seguridad más elaboradas del sistema, por tratarse de puntos
de acceso **públicos** que pueden emitir credenciales.

### Diseño del token

El token es una cadena aleatoria de **256 bits** generada con el generador criptográfico del
entorno. De él se persiste **exclusivamente su resumen SHA-256**; el valor en claro viaja únicamente
en el correo.

La consecuencia es que **una filtración de la base de datos no habilita la toma de cuentas**: los
resúmenes almacenados no permiten reconstruir los tokens.

La alternativa considerada fue emitir un token firmado autocontenido, sin persistencia. Se descartó
por una razón concreta: no admite uso único ni revocación. Un token firmado permanece válido hasta
su vencimiento, de modo que quien lo interceptara podría reutilizarlo. La tabla resuelve ambos
problemas con un costo de una entidad y una migración.

### Uso único

El consumo del token se realiza con una **actualización condicional dentro de una transacción**: la
condición de no haber sido consumido viaja en la propia sentencia de actualización.

Ante dos peticiones simultáneas con el mismo token, únicamente una obtiene resultado afirmativo; la
otra encuentra cero registros afectados y revierte. Es el mismo criterio aplicado al descuento de
existencias (Capítulo VIII), y la razón es idéntica: verificar una condición y actuar en dos pasos
separados abre una ventana que la concurrencia puede aprovechar.

Al consumirse un token, **los restantes tokens del usuario se eliminan**. De este modo, si alguien
hubiera solicitado varios enlaces, ninguno permanece utilizable.

### Prevención de enumeración de cuentas

La solicitud de recuperación responde **siempre con el mismo mensaje**, con independencia de que la
dirección exista, no exista o pertenezca a un usuario dado de baja:

> «Si el email está registrado, vas a recibir un mensaje con las instrucciones para restablecer tu
> contraseña.»

El servicio interrumpe su ejecución en silencio cuando no encuentra un usuario válido, y el
controlador responde de manera incondicional. El punto de acceso no resulta, por lo tanto, utilizable
para determinar qué direcciones se encuentran registradas.

Por el mismo motivo, la función de envío de correo **nunca propaga una excepción**: un fallo del
servidor de correo produciría una respuesta distinta y revelaría, por diferencia, que la dirección
existía.

### Limitación de frecuencia

Los tres puntos de acceso del flujo aplican un límite propio de **cinco peticiones por origen cada
quince minutos**, considerablemente más estricto que el límite global de la aplicación.

La justificación es directa: se trata de puntos públicos que generan tokens y envían correos. El
límite global, dimensionado para el uso normal de la aplicación, no acota el abuso de un punto de
acceso con esas características.

### Auditoría

El restablecimiento genera un asiento de auditoría **deliberadamente sin valores**. Registrar el
estado anterior y posterior implicaría almacenar resúmenes de contraseña en la tabla de auditoría,
que posee criterios de acceso distintos de los de la tabla de usuarios.

## Protección de la capa de transporte

El servidor aplica las siguientes medidas sobre la totalidad de las peticiones:

| Medida | Función |
|---|---|
| Cabeceras de seguridad | Establece cabeceras que mitigan vectores conocidos del navegador |
| Restricción de origen | Únicamente el origen del cliente, definido por configuración, puede consumir la interfaz |
| Límite de frecuencia global | Mil peticiones por origen cada quince minutos |
| Compresión | Reduce el volumen transferido |

La restricción de origen requiere una precisión. Además de limitar quién puede consumir la interfaz,
declara explícitamente qué cabeceras de respuesta resultan legibles para el cliente. Sin esa
declaración, la descarga de reportes no podría obtener el nombre del archivo ni la cantidad de filas,
que el servidor transmite precisamente por cabecera (Capítulo IX).

## Validación de entrada

La totalidad de los datos de entrada se valida mediante esquemas declarativos **antes de alcanzar la
lógica de negocio**. La validación se aplica como middleware sobre la ruta, de modo que un
controlador nunca recibe datos sin validar.

Los esquemas no sólo verifican: **transforman y reemplazan** el contenido de la petición por el
valor ya normalizado, con sus tipos convertidos. Un identificador que debe ser universal único se
rechaza si no lo es, y una cantidad textual llega al servicio ya convertida a número.

El tratamiento se extiende a la configuración: las variables de entorno se validan con el mismo
mecanismo al arrancar el proceso, que termina de inmediato si alguna resulta inválida (Capítulo IV).

## Limitaciones conocidas

Se enumeran las limitaciones del diseño adoptado. Ninguna compromete la operación en el contexto de
uso previsto, pero corresponde documentarlas.

### El restablecimiento de contraseña no cierra las sesiones abiertas

Es la consecuencia directa de la ausencia de estado de sesión. Un token de renovación emitido antes
del cambio de contraseña **continúa siendo válido hasta siete días después**.

En un escenario de compromiso de credenciales, el usuario que cambia su contraseña no expulsa al
intruso de las sesiones ya establecidas.

La solución requiere abandonar el esquema sin estado: persistir los tokens de renovación e
invalidarlos ante un restablecimiento. Constituye trabajo futuro (Capítulo XIV).

### Los tokens residen en almacenamiento accesible desde el guion

El almacenamiento local del navegador resulta accesible para cualquier código que se ejecute en la
página. Ante una vulnerabilidad de inyección de guiones, un atacante podría extraer los tokens.

La mitigación estándar consiste en utilizar cookies inaccesibles desde el guion, lo que traslada el
problema al ámbito de la falsificación de peticiones entre sitios y exige un mecanismo adicional. Se
optó por el esquema más simple, acotando el riesgo mediante la vigencia breve del token de acceso.

### Ausencia de verificación de contraseñas comprometidas

La política se limita a una longitud mínima. No se verifica la contraseña contra listados de
credenciales filtradas ni se exige composición de caracteres.

### Registro de auditoría sin protección de integridad

Los asientos de auditoría se almacenan en una tabla ordinaria. Quien poseyera acceso directo a la
base podría modificarlos sin dejar rastro. Una auditoría con garantías de inalterabilidad requeriría
encadenamiento criptográfico o almacenamiento externo de sólo anexado.

### Los asientos de auditoría pueden perderse en silencio

La función que registra la auditoría **captura sus propios errores y no los propaga**. La decisión
es intencional: un fallo al registrar la auditoría no debe impedir la operación de negocio que la
originó.

El efecto secundario es que un problema persistente en la escritura de auditoría degradaría la
trazabilidad de forma silenciosa, visible únicamente en el registro de actividad del servidor.
