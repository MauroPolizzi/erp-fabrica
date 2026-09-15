# Requerimientos

Este capítulo enuncia los requerimientos que el sistema satisface. Todos ellos se encuentran
implementados y verificados: no se incluyen requerimientos proyectados ni deseables que el alcance
entregado no cubra.

Cada requerimiento funcional indica el módulo que lo implementa y el permiso que lo gobierna, de
modo que resulte trazable hasta el código. La matriz completa de trazabilidad —requerimiento,
implementación, flujo, prueba y documentación— se presenta en el Anexo D.

## Requerimientos funcionales

### Acceso y gestión de la sesión

| ID | Requerimiento | Permiso |
|---|---|---|
| RF-01 | El sistema debe autenticar a un usuario mediante su dirección de correo y contraseña, y rechazar el acceso de usuarios inexistentes o dados de baja | — |
| RF-02 | El sistema debe renovar la sesión de forma automática y transparente mientras el usuario permanezca activo, sin solicitar nuevamente sus credenciales | — |
| RF-03 | El sistema debe permitir que un usuario solicite el restablecimiento de su contraseña mediante un enlace enviado a su dirección de correo | — |
| RF-04 | El enlace de recuperación debe admitir un único uso y vencer transcurrido un plazo configurable | — |
| RF-05 | El sistema no debe revelar si una dirección de correo se encuentra registrada | — |

### Administración

| ID | Requerimiento | Permiso |
|---|---|---|
| RF-06 | El sistema debe permitir el alta, la consulta, la modificación y la baja lógica de usuarios | `users.*` |
| RF-07 | El sistema debe permitir asignar un rol a cada usuario en el momento del alta y modificarlo posteriormente | `users.update` |
| RF-08 | El sistema debe impedir el registro de dos usuarios con la misma dirección de correo | `users.create` |
| RF-09 | El sistema debe permitir consultar los roles definidos y los permisos que cada uno agrupa | `users.read` |

### Inventario

| ID | Requerimiento | Permiso |
|---|---|---|
| RF-10 | El sistema debe permitir el alta, la consulta, la modificación y la baja lógica de materiales | `inventory.*` |
| RF-11 | El sistema debe impedir el registro de dos materiales con el mismo código (SKU) | `inventory.create` |
| RF-12 | El sistema debe permitir clasificar los materiales en categorías y dar de alta categorías nuevas | `inventory.create` |
| RF-13 | El sistema debe permitir registrar ingresos y ajustes de existencias, y debe impedir la modificación directa de la existencia de un material por cualquier otra vía | `inventory.update` |
| RF-14 | El sistema debe conservar el historial de movimientos de existencias de cada material, con su origen | `inventory.read` |

### Comercial

| ID | Requerimiento | Permiso |
|---|---|---|
| RF-15 | El sistema debe permitir el alta, la consulta, la modificación y la baja lógica de clientes | `commercial.*` |
| RF-16 | El sistema debe permitir registrar una venta compuesta por una o más líneas, cada una con su material y cantidad | `commercial.create` |
| RF-17 | El sistema debe tomar el precio de cada línea del precio vigente del material y conservarlo inalterable ante modificaciones posteriores | `commercial.create` |
| RF-18 | El sistema debe rechazar toda venta cuya cantidad solicitada exceda la existencia disponible, sin producir efecto alguno sobre los datos | `commercial.create` |
| RF-19 | El sistema debe descontar las existencias y registrar el ingreso en la caja de ventas como parte indivisible del registro de la venta | `commercial.create` |
| RF-20 | El sistema debe permitir consultar las ventas filtrando por cliente, estado y rango de fechas | `commercial.read` |
| RF-21 | El sistema debe permitir anular una venta confirmada, reponiendo las existencias y revirtiendo el movimiento de caja | `commercial.update` |
| RF-22 | El sistema debe impedir la anulación de una venta que no se encuentre confirmada | `commercial.update` |

### Finanzas e información de gestión

| ID | Requerimiento | Permiso |
|---|---|---|
| RF-23 | El sistema debe exponer el saldo acumulado de la caja de ventas y sus movimientos, filtrables por fecha | `finance.read` |
| RF-24 | El sistema debe presentar indicadores de gestión: ventas del mes y del día, materiales y clientes activos, principales clientes y materiales con menor existencia | — |
| RF-25 | El sistema debe presentar la evolución de las ventas confirmadas agrupadas por día, semana o mes | — |
| RF-26 | El sistema debe generar un reporte de ventas por período, filtrable por cliente, exportable a planilla de cálculo | `reports.read` |
| RF-27 | Los indicadores y los reportes deben computar exclusivamente ventas confirmadas | — |

### Trazabilidad

| ID | Requerimiento | Permiso |
|---|---|---|
| RF-28 | El sistema debe registrar toda creación, modificación y baja de las entidades críticas, identificando el usuario responsable | — |
| RF-29 | El sistema debe permitir consultar el registro de auditoría filtrando por entidad, acción y rango de fechas, y examinar los valores anterior y posterior de cada operación | `audit.read` |

## Requerimientos no funcionales

Los requerimientos no funcionales se enuncian junto con el mecanismo que los implementa, de modo
que cada uno resulte verificable en el código. Los capítulos indicados desarrollan cada mecanismo.

### Integridad

| ID | Requerimiento | Mecanismo | Cap. |
|---|---|---|---|
| RNF-01 | Toda operación que afecte existencias o caja debe aplicarse íntegramente o no aplicarse en absoluto | Transacciones de base de datos | VIII |
| RNF-02 | Dos operaciones simultáneas no deben poder consumir la misma existencia | Decremento atómico condicional | VIII |
| RNF-03 | El sistema no debe eliminar información: las bajas deben preservar el registro y su historial | Baja lógica mediante indicador de estado | V |
| RNF-04 | Los importes no deben sufrir errores de redondeo por representación binaria | Tipo decimal en base de datos y aritmética decimal en la aplicación | V, VIII |

### Seguridad

| ID | Requerimiento | Mecanismo | Cap. |
|---|---|---|---|
| RNF-05 | Las contraseñas no deben almacenarse de forma recuperable | Función de derivación de clave con sal | VI |
| RNF-06 | Toda función debe validar la autorización del solicitante en el servidor, con independencia de lo que muestre la interfaz | Verificación de permiso por ruta | VI |
| RNF-07 | Los datos de entrada deben validarse antes de alcanzar la lógica de negocio | Esquemas de validación declarativos | VI, VII |
| RNF-08 | Los endpoints públicos no deben poder utilizarse para inferir la existencia de cuentas | Respuesta invariable e independiente del resultado | VI |
| RNF-09 | Los endpoints públicos deben resistir el abuso automatizado | Limitación de frecuencia por dirección de origen | VI |

### Rendimiento y escala

| ID | Requerimiento | Mecanismo | Cap. |
|---|---|---|---|
| RNF-10 | Los listados no deben transferir el conjunto completo de registros | Paginación en el servidor, con límite máximo configurable | VII |
| RNF-11 | La generación de un reporte no debe comprometer la memoria del servidor | Tope de filas verificado antes de construir el archivo | IX |
| RNF-12 | Las consultas de agregación temporal deben acotarse a un volumen previsible | Tope de puntos por granularidad | VII |

### Usabilidad y localización

| ID | Requerimiento | Mecanismo | Cap. |
|---|---|---|---|
| RNF-13 | La interfaz debe presentarse íntegramente en español rioplatense | Textos de la aplicación | X |
| RNF-14 | Los importes deben expresarse en pesos argentinos y las fechas en formato local | Formateo localizado en el cliente | X |
| RNF-15 | Los errores deben comunicarse al usuario en lenguaje comprensible, sin exponer detalles técnicos | Catálogo de errores centralizado y notificación uniforme | VII, X |
| RNF-16 | Los listados de uso frecuente deben presentarse acotados a un período razonable en lugar de cargar el histórico completo | Filtro por día en curso como valor inicial | X |

### Mantenibilidad

| ID | Requerimiento | Mecanismo | Cap. |
|---|---|---|---|
| RNF-17 | La incorporación de un módulo nuevo debe seguir una estructura uniforme y previsible | Convención de módulo vertical | VII |
| RNF-18 | La incorporación de un reporte nuevo no debe requerir modificar la capa de transporte ni la de formato | Catálogo de definiciones de reporte | IX |
| RNF-19 | El sistema debe verificarse de forma automatizada ante cada cambio | Suite de pruebas ejecutada en integración continua | XII |
| RNF-20 | La configuración sensible no debe residir en el código ni versionarse | Variables de entorno validadas al arranque | IV |

## Restricciones

Las siguientes restricciones fueron acordadas con el cliente o impuestas por el contexto del
proyecto, y condicionan el diseño:

| ID | Restricción | Origen |
|---|---|---|
| RE-01 | El sistema debe ser una aplicación web accesible desde un navegador, sin instalación en los equipos de los usuarios | Cliente |
| RE-02 | El idioma del sistema es el español rioplatense y la moneda, el peso argentino | Cliente |
| RE-03 | Las ventas no discriminan impuestos en el alcance entregado | Cliente |
| RE-04 | Toda venta registra su ingreso en la caja de ventas, cualquiera sea el medio de pago | Cliente |
| RE-05 | El sistema fue dimensionado para cinco usuarios concurrentes | Contexto de la organización |
| RE-06 | Los roles y los permisos que agrupan son fijos y no se administran desde la aplicación | Decisión de diseño |

## Supuestos

| ID | Supuesto |
|---|---|
| SU-01 | Los usuarios disponen de conexión a la red donde se publica el sistema y de un navegador actualizado |
| SU-02 | La zona horaria del servidor corresponde a la de Argentina. Los cálculos de agregación temporal se apoyan en ella |
| SU-03 | Existe un servidor de correo disponible para el envío de los enlaces de recuperación de contraseña. En su ausencia, el sistema opera pero esa función queda inhabilitada |
