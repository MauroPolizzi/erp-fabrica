# Preguntas frecuentes y solución de problemas

Reúne las dudas que aparecen con más frecuencia. Si tu situación no está acá, consultá el capítulo
del módulo correspondiente.

## Acceso

| Situación | Qué hacer |
|---|---|
| **No puedo entrar: dice «Email o contraseña incorrectos»** | Revisá que el email esté bien escrito y que no haya quedado activada la tecla de mayúsculas. Si no lo resolvés, usá **¿Olvidaste tu contraseña?** |
| **Olvidé la contraseña** | Desde la pantalla de acceso, **¿Olvidaste tu contraseña?** El procedimiento completo está en el capítulo 3 |
| **No me llegó el mail de recuperación** | Revisá correo no deseado. Verificá que el email sea el de tu cuenta. El sistema muestra el mismo aviso exista o no la dirección, así que el aviso no confirma que haya llegado |
| **El enlace del mail no funciona** | Dura 30 minutos y se usa una sola vez. Pedí uno nuevo |
| **Me pidió iniciar sesión de nuevo** | La sesión se renueva sola mientras usás el sistema. Si pasás varios días sin entrar, vuelve a pedir la contraseña |
| **Entré pero no veo un módulo** | El menú muestra solo lo habilitado para tu rol. Consultá con la administración |

## Listados y búsquedas

| Situación | Qué hacer |
|---|---|
| **El listado aparece vacío** | En **Clientes**, **Materiales** y **Usuarios** es a propósito: escribí al menos 2 letras en el buscador |
| **No encuentro un registro que sé que existe** | Probá con menos letras, o buscá por otro dato. En Clientes podés buscar por nombre, CUIT o email; en Materiales, por SKU o nombre |
| **No encuentro una venta de otra fecha** | **Ventas**, **Caja de ventas** y **Auditoría** arrancan mostrando el día de hoy. Ampliá el rango con **Desde** y **Hasta** |
| **Filtré y ahora no veo nada** | Usá **Restablecer** para volver a los valores iniciales |

## Ventas

| Situación | Qué hacer |
|---|---|
| **«Stock insuficiente»** | La venta **no se registró** y el stock quedó como estaba. Corregí la cantidad, o cargá el stock faltante desde **Materiales** con un **Ingreso** |
| **Un material no aparece al cargar la venta** | Puede estar dado de baja. Verificalo en **Materiales** |
| **Un cliente no aparece en la lista** | Puede estar dado de baja. Verificalo en **Clientes** |
| **Registré una venta con un error** | No se puede modificar. Anulala y registrala de nuevo |
| **Registré dos veces la misma venta** | Anulá una. El stock se repone solo |
| **El precio de la venta no es el que esperaba** | El precio sale del material al momento de registrar. Corregilo en **Materiales** y volvé a registrar |
| **«No hay una caja de ventas configurada»** | Es una configuración del sistema, no un problema de tu venta. Avisá a la administración |

## Stock

| Situación | Qué hacer |
|---|---|
| **El stock quedó mal después de un movimiento** | Probablemente se eligió **Ajuste** cuando correspondía **Ingreso**, o al revés. Ingreso **suma**; Ajuste **reemplaza**. Corregí con un **Ajuste** al valor correcto |
| **Necesito descontar stock por rotura o pérdida** | Usá un **Ajuste** al valor real y aclaralo en **Referencia**. Las salidas por venta las genera el sistema |
| **Di de alta un material y quedó con stock 0** | Es lo esperado. Cargale el stock con un **Ingreso** |
| **Un material figura en «Stock más bajo» pero tiene stock** | Ese panel muestra los cinco materiales con **menos** stock, comparados entre sí. No es una alerta de faltante |

## Caja y reportes

| Situación | Qué hacer |
|---|---|
| **El saldo no coincide con los movimientos que veo** | El saldo es el **acumulado total**; el listado está filtrado por fecha. Es lo esperado |
| **Una venta anulada sigue en la caja** | Se conservan los dos movimientos: el ingreso y su reversión negativa. La suma es cero |
| **El reporte tiene más filas que ventas** | Cada fila es una **línea de venta**. Una venta con tres materiales ocupa tres filas |
| **«El reporte supera las 20.000 filas»** | Achicá el rango de fechas, o filtrá por un cliente |
| **El reporte salió vacío** | No hubo ventas confirmadas en ese período. El archivo se descarga igual, con encabezado |

## Bajas

| Situación | Qué hacer |
|---|---|
| **Di de baja algo por error** | Nada se borra. Para usuarios, editalo y marcalo como activo. Para clientes y materiales, consultá con la administración |
| **¿Puedo eliminar algo definitivamente?** | No. El sistema conserva todo para no perder el historial |
| **Un cliente dado de baja aparece en una venta vieja** | Es correcto. Las ventas anteriores conservan su información |

## Problemas generales

| Situación | Qué hacer |
|---|---|
| **La pantalla quedó en blanco o no responde** | Recargá la página. Tu sesión se conserva |
| **Un aviso rojo desapareció antes de que lo leyera** | Repetí la operación: si el problema persiste, el aviso vuelve a aparecer |
| **«Ocurrió un error inesperado» o «Error interno del servidor»** | Anotá qué estabas haciendo y avisá a la administración. Estos errores quedan registrados del lado del sistema |
| **Los datos que veo parecen desactualizados** | Recargá la página |
| **El sistema no carga** | Verificá tu conexión. Si otras páginas funcionan, avisá a la administración |

## Cuándo avisar a la administración

Resolvé por tu cuenta: contraseñas olvidadas, búsquedas sin resultado, errores de carga, ventas mal
registradas.

Avisá a la administración cuando:

- Necesites acceso a un módulo que no ves.
- Haya que reactivar un cliente o un material dado de baja.
- Aparezca «No hay una caja de ventas configurada».
- Se repitan errores internos del servidor.
- Sospeches que alguien accedió a tu cuenta.
