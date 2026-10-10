# Limitaciones conocidas y trabajo futuro

Este capítulo declara con precisión los límites del sistema entregado: qué áreas quedaron fuera del
alcance, qué limitaciones presenta el diseño adoptado y qué trabajo permitiría superarlas.

Se incluye por una razón concreta: un sistema cuyos límites no están documentados obliga a
descubrirlos durante su uso. Documentarlos es parte de la entrega.

## Áreas fuera del alcance

Las cinco áreas siguientes fueron relevadas y modeladas, pero no implementadas. La justificación es
la expuesta en el Capítulo I: el cliente priorizó el circuito de ventas y el tiempo disponible se
concentró en él.

| Área | Estado | Entidades previstas |
|---|---|---|
| Inventario de materias primas | Modelo definido, sin implementación | Materia prima, movimiento de materia prima |
| Producción | Modelo definido, sin implementación | Registro de producción, consumo de producción |
| Proveedores | Modelo definido, sin implementación | Proveedor |
| Pagos a proveedores | Modelo definido, sin implementación | Pago a proveedor |
| Facturación | Modelo definido, sin implementación | Comprobante |

En el servidor, cada una de estas áreas cuenta con su espacio de rutas montado y autenticado, sin
puntos de acceso. Constituye una reserva de superficie: su incorporación no requerirá modificar la
composición de la aplicación.

### Consecuencias funcionales

Corresponde señalar qué implica la ausencia de estas áreas, más allá de la enumeración:

**El inventario sólo contempla materiales terminados.** El sistema registra lo que la fábrica vende,
no lo que consume para producirlo. La entidad de materia prima prevé un campo de costo promedio
ponderado cuyo cálculo no se encuentra implementado.

**La producción no alimenta el inventario.** El ingreso de existencias se registra manualmente. En
el alcance completo, el registro de una producción descontaría materias primas e incrementaría
materiales terminados de forma automática.

**No existe circuito de compras.** Los proveedores y sus pagos quedan fuera, de modo que el sistema
refleja el ingreso de dinero por ventas pero no su egreso.

**Las ventas no generan comprobantes fiscales.** La entidad de comprobante prevé los campos
necesarios para la factura electrónica, incluido el código de autorización del organismo fiscal,
pero el sistema no integra con dicho organismo.

### Un módulo implementado fuera del alcance entregado

Durante la etapa de fundaciones se implementó un módulo de gestión de personal a nivel de servicios,
que no cuenta con interfaz de usuario y no integra el alcance entregado al cliente. Su incorporación
requeriría únicamente construir las pantallas, replicando el patrón de cualquier otro módulo de
datos maestros.

## Limitaciones del diseño

### Seguridad

Las siguientes se desarrollan en el Capítulo VI y se resumen aquí.

**El restablecimiento de contraseña no cierra las sesiones abiertas.** Es consecuencia directa del
esquema sin estado: un token de renovación emitido antes del cambio permanece válido hasta siete días
después. En un escenario de credenciales comprometidas, el cambio de contraseña no expulsa al intruso
de las sesiones ya establecidas.

Su resolución requiere persistir los tokens de renovación e invalidarlos ante un restablecimiento. Es
el trabajo de mayor prioridad del apartado de seguridad.

**Los tokens residen en almacenamiento accesible desde el guion**, lo que los expone ante una
vulnerabilidad de inyección. El riesgo se acota mediante la vigencia breve del token de acceso.

**La política de contraseñas se limita a una longitud mínima.** No se verifican contra listados de
credenciales filtradas ni se exige composición de caracteres.

**El registro de auditoría carece de garantías de inalterabilidad.** Quien poseyera acceso directo a
la base podría modificarlo sin dejar rastro.

**Los asientos de auditoría pueden perderse en silencio**, porque la función que los registra captura
sus errores para no interrumpir la operación de negocio que los originó.

### Funcionales

**Las ventas no discriminan impuestos.** Conforme a la restricción RE-03, el importe total coincide
con el subtotal. El campo correspondiente existe y se persiste en cero, de modo que la incorporación
del tratamiento impositivo no requiera modificar la estructura de datos ni las migraciones.

**Toda venta registra su ingreso en caja, cualquiera sea el medio de pago.** Conforme a la
restricción RE-04, así lo especificó el cliente. La consecuencia es que el saldo de la caja refleja
el total facturado y no el efectivamente cobrado: una venta en cuenta corriente incrementa el saldo
aunque el dinero no haya ingresado. Un circuito de cobranzas permitiría distinguir ambos conceptos.

**No existe registro de cuenta corriente de clientes.** El medio de pago correspondiente se registra
pero no genera saldo deudor ni admite seguimiento.

**El estado de borrador de una venta no se utiliza.** El modelo lo prevé pero ninguna operación lo
produce: toda venta nace confirmada. No existe la posibilidad de preparar una venta y confirmarla
posteriormente.

**La identificación tributaria de los clientes no es única.** El sistema admite dos clientes con
idéntico identificador.

**Los materiales carecen de existencia mínima configurable.** El panel presenta los cinco materiales
con menor existencia, sin comparar contra un umbral propio de cada uno. La entidad de materia prima
prevé ese campo; la de material terminado, no.

**Los roles y sus permisos no se administran desde la aplicación.** Se definen durante la carga
inicial. Modificarlos requiere intervención sobre la base de datos.

### Técnicas

**El sistema depende de la zona horaria del servidor.** Los cálculos de agregación temporal utilizan
la hora local del servidor, decisión deliberada para que el gráfico y los indicadores coincidan
(Capítulo VII). Un servidor configurado en otra zona produciría agrupaciones desplazadas.

**Los selectores de las pantallas de venta y de reportes solicitan hasta doscientos registros.** Con
un catálogo mayor, las opciones excedentes no se presentarían. El límite es holgado para el volumen
actual pero constituye un tope implícito.

**Los listados de categorías y de roles no se paginan.** Ambos conjuntos son pequeños y estables.

**La verificación automatizada presenta las ausencias declaradas en el Capítulo XII**: no hay
medición de cobertura publicada, ni pruebas de extremo a extremo con navegador, ni pruebas de la
generación de la planilla de reportes, ni pruebas de carga.

### De despliegue

El repositorio **no contiene artefactos de despliegue**. El sistema se ejecuta y se demuestra en
entorno local, conforme al Capítulo XIII.

La configuración de producción del cliente supone que ambos componentes se publican bajo el mismo
origen, lo que requiere un intermediario inverso que no forma parte de la entrega. La infraestructura
prevista —servidor privado virtual, intermediario inverso con cifrado y copias de respaldo
periódicas— fue definida como decisión de proyecto pero no se materializó.

## Deuda técnica menor

Se registran tres cuestiones detectadas que no afectan el funcionamiento.

**La instrucción de análisis estático del servidor no es ejecutable.** La herramienta se encuentra
instalada y la instrucción declarada, pero falta su archivo de configuración.

**Dos dependencias del servidor no se utilizan.** Una biblioteca de generación de documentos
portables y una de generación de identificadores, ambas incorporadas en previsión de necesidades que
se resolvieron de otro modo. La primera es relevante porque el sistema genera reportes en un único
formato: planilla de cálculo.

**Existe una inconsistencia de estilo** en un archivo del módulo de personal, que utiliza una
convención de indentación y comillas distinta del resto del proyecto.

## Trabajo futuro

Se propone el siguiente orden, fundado en la dependencia entre áreas y en el valor que cada una
aporta al cliente.

### Prioridad alta

| # | Trabajo | Fundamento |
|---|---|---|
| 1 | **Persistencia de tokens de renovación** | Cierra la limitación de seguridad más relevante. Acotado: una entidad, una migración y modificaciones en un único módulo |
| 2 | **Interfaz de gestión de personal** | El servicio existe y funciona. Sólo requiere construir las pantallas replicando el patrón vigente |
| 3 | **Incorporación del tratamiento impositivo** | El modelo ya lo contempla. Es la diferencia entre un registro comercial y uno con validez contable |

### Prioridad media

| # | Trabajo | Fundamento |
|---|---|---|
| 4 | **Inventario de materias primas** | Requisito previo del módulo de producción |
| 5 | **Registro de producción** | Cierra el circuito interno: consume materias primas y genera materiales terminados |
| 6 | **Proveedores y pagos** | Completa el flujo de dinero, hoy limitado a los ingresos |
| 7 | **Cobranzas y cuenta corriente** | Permite distinguir lo facturado de lo efectivamente cobrado |

### Prioridad baja

| # | Trabajo | Fundamento |
|---|---|---|
| 8 | **Facturación electrónica** | Exige integración con el organismo fiscal y su homologación. Es el trabajo de mayor complejidad externa |
| 9 | **Administración de roles y permisos** | Sólo se justifica si la estructura de la organización se vuelve variable |
| 10 | **Reportes adicionales** | La capa está preparada: cada reporte nuevo es una definición (Capítulo IX) |
| 11 | **Artefactos de despliegue** | Necesario cuando el sistema deba publicarse fuera del entorno local |

### Sobre la extensibilidad del sistema

Tres decisiones de diseño facilitan específicamente este trabajo futuro, y conviene señalarlo:

- **El modelo de datos ya contempla las áreas diferidas**, de modo que su incorporación no requiere
  rediseñar relaciones ni migrar datos productivos.
- **El catálogo de permisos incluye los módulos no implementados**, por lo que habilitarlos no exige
  modificar la carga inicial.
- **La capa de reportería admite formatos de salida nuevos** sin alterar las definiciones existentes.

El costo asumido a cambio es un esquema más amplio que el estrictamente necesario y un catálogo de
permisos con códigos que hoy no gobiernan ninguna ruta.
