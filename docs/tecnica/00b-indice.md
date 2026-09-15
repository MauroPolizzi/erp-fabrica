<div class="indice">

<h1 class="sin-numero">Índice</h1>

<!-- Los números de página se completan tras la conversión a PDF.
     Con Pandoc, reemplazar este archivo por la opción --toc.
     Con la extensión de VS Code, completarlos a mano en la revisión final (bloque B5). -->

**I. Introducción y contexto del proyecto**
&nbsp;&nbsp;&nbsp;&nbsp;A. Contexto de la organización
&nbsp;&nbsp;&nbsp;&nbsp;B. Situación previa y problema detectado
&nbsp;&nbsp;&nbsp;&nbsp;C. Objetivo del sistema
&nbsp;&nbsp;&nbsp;&nbsp;D. Alcance
&nbsp;&nbsp;&nbsp;&nbsp;E. Roles y usuarios
&nbsp;&nbsp;&nbsp;&nbsp;F. Organización del informe

**II. Metodología y proceso de desarrollo**
&nbsp;&nbsp;&nbsp;&nbsp;A. Enfoque
&nbsp;&nbsp;&nbsp;&nbsp;B. Análisis previo a la planificación
&nbsp;&nbsp;&nbsp;&nbsp;C. Cronograma
&nbsp;&nbsp;&nbsp;&nbsp;D. Control de versiones
&nbsp;&nbsp;&nbsp;&nbsp;E. Integración continua
&nbsp;&nbsp;&nbsp;&nbsp;F. Herramientas
&nbsp;&nbsp;&nbsp;&nbsp;G. Documentación del proceso

**III. Requerimientos**
&nbsp;&nbsp;&nbsp;&nbsp;A. Requerimientos funcionales
&nbsp;&nbsp;&nbsp;&nbsp;B. Requerimientos no funcionales
&nbsp;&nbsp;&nbsp;&nbsp;C. Restricciones
&nbsp;&nbsp;&nbsp;&nbsp;D. Supuestos

**IV. Arquitectura del sistema**
&nbsp;&nbsp;&nbsp;&nbsp;A. Visión general
&nbsp;&nbsp;&nbsp;&nbsp;B. Decisiones arquitectónicas
&nbsp;&nbsp;&nbsp;&nbsp;C. Arquitectura del servidor
&nbsp;&nbsp;&nbsp;&nbsp;D. Arquitectura del cliente
&nbsp;&nbsp;&nbsp;&nbsp;E. Comunicación entre cliente y servidor
&nbsp;&nbsp;&nbsp;&nbsp;F. Configuración
&nbsp;&nbsp;&nbsp;&nbsp;G. Observabilidad y manejo de errores

**V. Modelo de datos**
&nbsp;&nbsp;&nbsp;&nbsp;A. Alcance del modelo
&nbsp;&nbsp;&nbsp;&nbsp;B. Convenciones de modelado
&nbsp;&nbsp;&nbsp;&nbsp;C. Diccionario de datos
&nbsp;&nbsp;&nbsp;&nbsp;D. Entidades modeladas sin implementación
&nbsp;&nbsp;&nbsp;&nbsp;E. Versionado del esquema
&nbsp;&nbsp;&nbsp;&nbsp;F. Datos iniciales

**VI. Seguridad**
&nbsp;&nbsp;&nbsp;&nbsp;A. Autenticación
&nbsp;&nbsp;&nbsp;&nbsp;B. Autorización
&nbsp;&nbsp;&nbsp;&nbsp;C. Protección de credenciales
&nbsp;&nbsp;&nbsp;&nbsp;D. Recuperación de contraseña
&nbsp;&nbsp;&nbsp;&nbsp;E. Protección de la capa de transporte
&nbsp;&nbsp;&nbsp;&nbsp;F. Validación de entrada
&nbsp;&nbsp;&nbsp;&nbsp;G. Limitaciones conocidas

**VII. Implementación del servidor**
&nbsp;&nbsp;&nbsp;&nbsp;A. Organización del código
&nbsp;&nbsp;&nbsp;&nbsp;B. Anatomía de un módulo
&nbsp;&nbsp;&nbsp;&nbsp;C. Mecanismos transversales
&nbsp;&nbsp;&nbsp;&nbsp;D. Utilidades compartidas
&nbsp;&nbsp;&nbsp;&nbsp;E. Agregación temporal
&nbsp;&nbsp;&nbsp;&nbsp;F. Apagado ordenado

**VIII. El núcleo transaccional: registro y anulación de ventas**
&nbsp;&nbsp;&nbsp;&nbsp;A. El problema
&nbsp;&nbsp;&nbsp;&nbsp;B. Atomicidad
&nbsp;&nbsp;&nbsp;&nbsp;C. Secuencia de la operación
&nbsp;&nbsp;&nbsp;&nbsp;D. Anulación
&nbsp;&nbsp;&nbsp;&nbsp;E. Verificación empírica
&nbsp;&nbsp;&nbsp;&nbsp;F. Síntesis

**IX. Reportería**
&nbsp;&nbsp;&nbsp;&nbsp;A. El problema de diseño
&nbsp;&nbsp;&nbsp;&nbsp;B. El contrato
&nbsp;&nbsp;&nbsp;&nbsp;C. El reporte de ventas por período
&nbsp;&nbsp;&nbsp;&nbsp;D. Control del volumen
&nbsp;&nbsp;&nbsp;&nbsp;E. Orden de ejecución
&nbsp;&nbsp;&nbsp;&nbsp;F. Generación de la planilla
&nbsp;&nbsp;&nbsp;&nbsp;G. Descarga en el cliente
&nbsp;&nbsp;&nbsp;&nbsp;H. Incorporación de un reporte nuevo

**X. Implementación del cliente**
&nbsp;&nbsp;&nbsp;&nbsp;A. Organización
&nbsp;&nbsp;&nbsp;&nbsp;B. Estado con señales
&nbsp;&nbsp;&nbsp;&nbsp;C. Carga diferida
&nbsp;&nbsp;&nbsp;&nbsp;D. Capa de acceso a datos
&nbsp;&nbsp;&nbsp;&nbsp;E. Interceptores
&nbsp;&nbsp;&nbsp;&nbsp;F. Guardas de ruta
&nbsp;&nbsp;&nbsp;&nbsp;G. Componentes compartidos
&nbsp;&nbsp;&nbsp;&nbsp;H. Sistema de diseño
&nbsp;&nbsp;&nbsp;&nbsp;I. Estructura de la aplicación autenticada

**XI. Interfaz de programación**
&nbsp;&nbsp;&nbsp;&nbsp;A. Convenciones
&nbsp;&nbsp;&nbsp;&nbsp;B. Catálogo de puntos de acceso
&nbsp;&nbsp;&nbsp;&nbsp;C. Detalle de los puntos de acceso centrales
&nbsp;&nbsp;&nbsp;&nbsp;D. Verificación manual

**XII. Calidad y pruebas**
&nbsp;&nbsp;&nbsp;&nbsp;A. Estrategia
&nbsp;&nbsp;&nbsp;&nbsp;B. Pruebas del servidor
&nbsp;&nbsp;&nbsp;&nbsp;C. Pruebas del cliente
&nbsp;&nbsp;&nbsp;&nbsp;D. Integración continua
&nbsp;&nbsp;&nbsp;&nbsp;E. Verificación manual
&nbsp;&nbsp;&nbsp;&nbsp;F. Alcance y limitaciones de la verificación

**XIII. Instalación, configuración y ejecución**
&nbsp;&nbsp;&nbsp;&nbsp;A. Requisitos
&nbsp;&nbsp;&nbsp;&nbsp;B. Puesta en marcha
&nbsp;&nbsp;&nbsp;&nbsp;C. Entorno de pruebas
&nbsp;&nbsp;&nbsp;&nbsp;D. Compilación
&nbsp;&nbsp;&nbsp;&nbsp;E. Operación

**XIV. Limitaciones conocidas y trabajo futuro**
&nbsp;&nbsp;&nbsp;&nbsp;A. Áreas fuera del alcance
&nbsp;&nbsp;&nbsp;&nbsp;B. Limitaciones del diseño
&nbsp;&nbsp;&nbsp;&nbsp;C. Deuda técnica menor
&nbsp;&nbsp;&nbsp;&nbsp;D. Trabajo futuro

**Anexo A — Glosario**
**Anexo B — Roles y permisos**
**Anexo C — Mensajes del sistema**
**Anexo D — Matriz de trazabilidad**

</div>
