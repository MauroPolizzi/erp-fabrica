# Metodología y proceso de desarrollo

Este capítulo describe cómo se organizó el trabajo: el enfoque adoptado, la práctica que gobernó
cada etapa, el cronograma efectivamente ejecutado y las herramientas que sostuvieron el proceso.

Las fechas y los hitos que se presentan no constituyen una reconstrucción posterior: provienen del
historial del sistema de control de versiones del proyecto.

## Enfoque

El desarrollo se organizó de manera **incremental**, en etapas que entregan funcionalidad
verificable. Cada etapa parte de un análisis del estado real del código, produce un plan acotado y
concluye con la funcionalidad integrada y probada.

La elección responde a la condición del proyecto: un único desarrollador, un cliente con una
prioridad explícita —el circuito de ventas— y un alcance que excedía el tiempo disponible. Un
enfoque secuencial habría exigido definir la totalidad del sistema antes de escribir código, con el
riesgo de agotar el plazo sin haber entregado el circuito que el cliente necesitaba.

El resultado es el descrito en el Capítulo I: un corredor operativo completo y verificado, y un
conjunto de áreas diferidas cuyo modelo de datos quedó previsto.

## Análisis previo a la planificación

Una práctica gobernó todas las etapas y merece desarrollarse, porque explica varias decisiones del
proyecto: **cada plan se elaboró auditando el código existente, no sobre supuestos**.

El procedimiento, repetido en cada etapa, consistió en:

1. Relevar qué se encontraba efectivamente implementado.
2. Identificar qué componentes resultaban reutilizables.
3. Determinar el trabajo restante real.
4. Recién entonces, planificar.

El resultado fue consistente: el trabajo pendiente resultaba sistemáticamente menor al estimado a
priori, porque la infraestructura previa cubría más de lo supuesto.

Dos ejemplos concretos ilustran el efecto de la práctica:

| Etapa | Hallazgo de la auditoría | Efecto sobre el plan |
|---|---|---|
| Circuito de ventas | La autenticación, el control de acceso, el esquema de datos y el patrón de módulo ya existían y superaban lo planificado | Se eliminaron del plan las fases de fundaciones, autenticación y migración inicial |
| Reportería | Las bibliotecas de planillas y de descarga ya se encontraban instaladas; el módulo estaba montado y autenticado; los permisos, sembrados | Cero dependencias nuevas, cero migraciones y cero cambios en la carga inicial |

Un tercer hallazgo produjo una decisión de sentido inverso. La auditoría detectó que la
infraestructura de colas de trabajos, incorporada previendo la generación asincrónica de reportes,
**no se utilizaba en ninguna parte**. Se retiró del proyecto. El criterio aplicado fue el mismo que
en el resto de la arquitectura: no sostener infraestructura hasta que exista un problema que la
justifique.

## Cronograma

El desarrollo se extendió entre el 30 de mayo y el 29 de agosto de 2026. Se detallan las dos etapas
principales y, a continuación, las intermedias.

### Etapa A — Circuito de ventas

Cuatro semanas. Constituye el alcance prioritario definido por el cliente.

| Fase | Período | Trabajo |
|---|---|---|
| A.1 — Fundaciones | 30/05 – 06/06 | Repositorio, estructura de ambos paquetes, conexión a la base y módulo de autenticación |
| A.2 — Servicios del dominio | 11/06 – 14/06 | Clientes, categorías, materiales con movimientos de existencias y registro de ventas transaccional |
| A.3 — Verificación del circuito | 18/06 | Colección de peticiones reproducible y prueba de extremo a extremo del circuito |
| A.4 — Interfaz | 19/06 – 26/06 | Estructura visual, componentes compartidos, y las pantallas de acceso, clientes, materiales y ventas |

El orden no es casual: el servidor precedió a la interfaz porque concentra las reglas de negocio, y
la prueba del circuito precedió a la interfaz porque permitió validarlo antes de construir las
pantallas que lo consumirían.

### Etapa B — Reportería e información de gestión

Una semana.

| Fase | Período | Trabajo |
|---|---|---|
| B.0 — Planificación | 11/08 | Auditoría del código y especificación |
| B.1 — Implementación | 12/08 – 16/08 | Capa de reportería, reporte de ventas por período, serie temporal e interfaz del gráfico |
| B.2 — Acabado | 18/08 | Incorporación del logotipo institucional a la planilla generada |

### Etapas intermedias

| Etapa | Período | Trabajo |
|---|---|---|
| Pruebas y flujo de trabajo | 30/06 – 23/07 | Suite de pruebas e integración continua |
| Consolidación posterior al circuito | 27/07 – 11/08 | Control de acceso completo, trazabilidad del vendedor, retiro de la infraestructura de colas, anulación de ventas con reversión de existencias y caja, caja de ventas, filtros de listados, consulta de auditoría e indicadores |
| Recuperación de contraseña y búsqueda | 17/08 – 18/08 | Circuito completo de restablecimiento y búsqueda en las grillas |
| Infraestructura de correo | 29/08 | Servidor de correo local para desarrollo |

### Contraste con la estimación inicial

La planificación original preveía dieciséis semanas distribuidas entre siete módulos. El desarrollo
efectivo abarcó trece semanas concentradas en el circuito comercial.

La diferencia no radica en la duración sino en la **distribución**: el tiempo se concentró en la
prioridad definida por el cliente en lugar de repartirse entre los siete módulos planificados. Es la
consecuencia directa de la decisión de alcance descrita en el Capítulo I.

## Control de versiones

El proyecto se versionó desde el primer día, con treinta y ocho confirmaciones distribuidas a lo
largo de las trece semanas.

Se utilizaron dos ramas: una principal, que refleja el estado estable, y una de desarrollo, donde se
integró el trabajo de las etapas posteriores al circuito inicial.

Los mensajes de confirmación identifican la etapa y la fase a la que pertenecen, de modo que el
historial resulta legible como una secuencia de trabajo y no como una sucesión de cambios sueltos.

## Integración continua

A partir de la etapa de pruebas, cada incorporación de cambios dispara automáticamente la
verificación del proyecto. El proceso ejecuta dos trabajos independientes:

| Trabajo | Qué hace |
|---|---|
| Servidor | Levanta una base de datos real, aplica las migraciones, carga los datos iniciales y ejecuta la suite completa |
| Cliente | Ejecuta la suite en un navegador sin interfaz gráfica |

Que el trabajo del servidor levante una base real y no un sustituto es coherente con la estrategia
de pruebas descrita en el Capítulo XII: las garantías que el sistema ofrece —atomicidad y
comportamiento bajo concurrencia— sólo pueden verificarse contra un motor de base de datos
verdadero.

## Herramientas

| Herramienta | Uso |
|---|---|
| Control de versiones distribuido | Historial y ramas |
| Integración continua | Verificación automática ante cada cambio |
| Gestor de paquetes con espacios de trabajo | Instalación única para ambos paquetes, con versiones compartidas |
| Contenedores | Base de datos, administrador web y servidor de correo para desarrollo |
| Entorno de desarrollo con verificación de tipos | Detección de errores antes de la ejecución |

El uso de contenedores para la infraestructura de desarrollo merece mención. Permite que cualquier
colaborador disponga de la base de datos, su administrador web y un servidor de correo de prueba con
una única instrucción, sin instalar nada en su equipo ni ajustar configuraciones propias. Reduce a
minutos la puesta en marcha descrita en el Capítulo XIII.

## Documentación del proceso

Cada etapa produjo un documento de planificación previo a su ejecución, elaborado sobre la auditoría
del código. Esos documentos permanecen en el repositorio como registro del proceso, identificados
con su fecha y marcados como material histórico: describen el estado del proyecto en el momento de
su redacción y no el sistema actual.

No integran esta documentación, pero constituyen la evidencia de que la práctica descrita en la
sección segunda se aplicó efectivamente y no se reconstruyó a posteriori.
