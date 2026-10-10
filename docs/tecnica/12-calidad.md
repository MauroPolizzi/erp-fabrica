# Calidad y pruebas

Este capítulo describe cómo se verifica el sistema: la estrategia adoptada, lo que cada suite cubre,
el mecanismo de integración continua y —explícitamente— lo que las pruebas no alcanzan.

## Estrategia

El sistema se verifica con **sesenta y cuatro casos de prueba automatizados**: treinta y ocho en el
servidor y veintiséis en el cliente.

La estrategia es deliberadamente distinta en cada uno, porque la naturaleza del riesgo también lo es.

| Ámbito | Tipo de prueba dominante | Fundamento |
|---|---|---|
| Servidor | **Integración contra una base de datos real** | Las garantías del sistema son transaccionales. Un sustituto de la base no puede verificarlas |
| Cliente | **Componente con las peticiones simuladas** | El riesgo reside en el comportamiento de la interfaz, no en la comunicación |

### Por qué el servidor se prueba contra una base real

Es la decisión metodológica central del capítulo y conviene fundamentarla.

Las garantías más relevantes del sistema —que una venta se aplique íntegramente o no deje rastro, y
que dos operaciones simultáneas no consuman la misma existencia— **son propiedades del motor de base
de datos**, no de la lógica de la aplicación (Capítulo VIII).

Una prueba con un sustituto verificaría que el código invoca las operaciones esperadas, lo cual no
demuestra nada sobre la propiedad que interesa. El descuento condicional funciona porque el motor
bloquea la fila y reevalúa la condición; un sustituto simplemente devolvería lo que se le indicara.

El costo asumido es una suite más lenta y con un requisito de infraestructura. Se consideró
justificado: verificar que el sistema no vende existencias inexistentes vale más que una suite veloz
que no lo verifica.

### Por qué el cliente se prueba con peticiones simuladas

El razonamiento inverso. El cliente no contiene reglas de negocio: el servidor es la autoridad
(Capítulo X). Lo que puede fallar es la interfaz —que una grilla consulte cuando no debe, que un
filtro no se aplique, que un estado no se restablezca—, y eso se verifica sin servidor.

La ventaja práctica es que la suite del cliente **se ejecuta sin infraestructura alguna**.

## Pruebas del servidor

Cuatro archivos, treinta y ocho casos, ejecutados contra la aplicación real sin levantar un servidor
ni ocupar un puerto. Esto último es posible gracias a la separación entre la composición de la
aplicación y su punto de entrada (Capítulo VII).

| Archivo | Casos | Cobertura |
|---|---|---|
| Verificación de estado | 1 | Comprobación mínima de que la aplicación responde |
| Circuito de ventas | 16 | Autenticación, alta de cliente y material, carga de existencias, venta, rechazo por existencia insuficiente, concurrencia, anulación, filtros, auditoría e indicadores |
| Recuperación de contraseña | 13 | Emisión, validación, consumo, vencimiento, reutilización, usuario dado de baja y prevención de enumeración |
| Filtros de fecha en caja | 8 | Rangos sobre caja, ventas y auditoría, e independencia del saldo respecto del filtro |

### Casos que verifican garantías no triviales

Tres casos merecen mención por verificar propiedades que serían fáciles de afirmar sin demostrar.

**Reversión completa.** Intenta una venta que excede la existencia disponible y comprueba, tras el
rechazo, que no se creó la venta, que no se generaron movimientos y que la existencia permanece
inalterada. Verifica que la reversión sea total y no parcial.

**Concurrencia.** Dispara dos peticiones de venta en paralelo sobre un material cuya existencia
alcanza para una sola, y comprueba que exactamente una se confirme. Es la prueba que convierte la
corrección del descuento condicional de afirmación de diseño en resultado verificado.

**Independencia del saldo respecto del filtro.** Comprueba que el saldo de la caja no varíe al
acotar el listado de movimientos por fecha. Verifica una distinción que la interfaz debe comunicar y
que, de invertirse, produciría un dato incorrecto con apariencia de corrección.

### Protección de la base de datos de desarrollo

La suite exige una base de datos dedicada. El archivo de configuración inicial implementa **dos
guardas** que impiden ejecutarla accidentalmente contra la base de desarrollo:

```ts
const result = config({ path: resolve(process.cwd(), '.env.test'), override: true });

if (result.error) {
  throw new Error('No se encontró erp-backend/.env.test. Copiá .env.test.example a .env.test y …');
}

if (process.env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV debe ser "test" para correr la suite (definilo en .env.test).');
}
```

La configuración se carga **antes** que la del servidor, y con precedencia sobre las variables ya
presentes. Si el archivo no existe o el entorno no corresponde, la suite falla de inmediato con una
indicación concreta, en lugar de operar sobre datos de desarrollo.

La necesidad de estas guardas es real: las pruebas crean y eliminan registros. Sin ellas, una
ejecución distraída destruiría el trabajo de desarrollo.

La configuración de pruebas deja además deliberadamente vacío el servidor de correo, de modo que la
suite no dependa de que se encuentre disponible y no envíe mensajes reales.

### Aislamiento entre casos

Cada archivo crea sus propios datos con identificadores únicos derivados del momento de ejecución, y
los elimina al finalizar en orden de dependencias. Ningún caso depende del orden ni de datos
producidos por otro, con la única excepción de los datos iniciales.

Los archivos se ejecutan **en serie** y no en paralelo, porque comparten la misma base.

## Pruebas del cliente

Seis archivos, veintiséis casos, con las peticiones simuladas mediante el controlador de pruebas del
cliente HTTP.

| Archivo | Casos | Cobertura |
|---|---|---|
| Raíz de la aplicación | 2 | Creación del componente |
| Grilla de datos | 6 | Paginación, búsqueda con retardo, modo que exige búsqueda previa |
| Búsqueda en las grillas | 2 | Comportamiento uniforme entre pantallas |
| Listado de ventas | 6 | Filtros por estado y fecha, restablecimiento, valor inicial |
| Listado de auditoría | 5 | Filtros por entidad, acción y fecha |
| Caja de ventas | 5 | Saldo, movimientos y filtro de fechas |

La concentración en la grilla compartida y en los listados no es casual: la grilla la utilizan seis
pantallas, de modo que un defecto en ella se propaga a todas. Es el componente con mayor
apalancamiento del cliente.

## Integración continua

Cada incorporación de cambios dispara la verificación automática. El proceso ejecuta dos trabajos
independientes:

| Trabajo | Pasos |
|---|---|
| Servidor | Levanta una base de datos real, instala dependencias con versiones fijas, genera el cliente de acceso a datos, prepara la configuración de pruebas, aplica migraciones, carga los datos iniciales y ejecuta la suite |
| Cliente | Instala dependencias y ejecuta la suite en un navegador sin interfaz gráfica |

Dos detalles de la configuración merecen mención.

La instalación utiliza versiones **exactamente fijadas** por el archivo de bloqueo. Una instalación
que resolviera versiones nuevas podría producir un resultado distinto del obtenido localmente, lo
que anularía el valor de la verificación.

El navegador sin interfaz se declara con la opción que deshabilita el aislamiento del proceso,
necesaria para ejecutar dentro de un contenedor. En el equipo del desarrollador se utiliza el
navegador ordinario.

## Verificación manual

Dos elementos complementan la verificación automática.

La **colección de peticiones** del repositorio reproduce el circuito completo con las variables
encadenadas entre sí. Permite recorrer el contrato sin la interfaz y sirve de referencia ejecutable
del Capítulo XI.

Determinadas condiciones se verifican manualmente porque no resultan automatizables de forma
razonable. El caso característico es el **límite de frecuencia** de los puntos de acceso de
recuperación de contraseña: la suite los consulta muchas veces desde el mismo origen, de modo que el
límite se eleva durante las pruebas y el comportamiento real se comprueba a mano.

## Alcance y limitaciones de la verificación

Corresponde declarar con precisión qué no cubren las pruebas.

**No se publica una medición de cobertura.** La infraestructura para producirla se encuentra
instalada en ambos paquetes, pero no se generó un informe. Se prefiere describir qué se verifica
antes que ofrecer un porcentaje que no fue medido.

**No hay pruebas de extremo a extremo con navegador automatizado.** El circuito se verifica en el
servidor, y la interfaz, por componente. La integración entre ambos se comprueba manualmente.

**No hay pruebas de carga ni de rendimiento.** El sistema fue dimensionado para cinco usuarios
concurrentes (restricción RE-05) y no se midió su comportamiento bajo volumen. Los requerimientos de
rendimiento del Capítulo III se enuncian con su mecanismo, no con una medición.

**La cobertura de los módulos de administración de datos maestros es indirecta.** Clientes,
materiales y usuarios se ejercitan como parte del circuito de ventas, pero no poseen un archivo de
pruebas propio que recorra sus casos límite. Comparten el patrón de módulo verificado en el
circuito, lo que acota el riesgo sin eliminarlo.

**No se verifica la generación de la planilla de reportes.** La capa de reportería carece de
pruebas automatizadas: su correcta generación se comprobó manualmente abriendo los archivos
producidos.

Estas ausencias se retoman en el Capítulo XIV como trabajo futuro.
