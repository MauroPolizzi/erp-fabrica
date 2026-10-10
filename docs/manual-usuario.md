<div class="portada">

<img src="img/logo-utn.png" class="logo" alt="Universidad Tecnológica Nacional">

<p class="institucion">Universidad Tecnológica Nacional</p>
<p class="facultad">Facultad Regional Tucumán</p>

<p class="tipo">Informe de Práctica Profesional Supervisada</p>

<p class="titulo">PerliNor ERP</p>

<p class="subtitulo">Sistema de gestión comercial y de inventario<br>para una fábrica de materiales para la construcción</p>

<p class="subtitulo" style="font-style: normal; font-variant: small-caps; letter-spacing: .08em;">Manual de usuario</p>

<div class="datos">
<p><span class="etiqueta">Autor:</span> Mauro Esteban Polizzi</p>
<p><span class="etiqueta">Carrera:</span> Tecnicatura Universitaria en Programación</p>
<p><span class="etiqueta">Asignatura:</span> Práctica Profesional Supervisada</p>
<p><span class="etiqueta">Empresa:</span> PerliNor</p>
</div>

<p class="fecha">Tucumán, 26 de septiembre de 2026</p>

</div>

<div class="indice">

<h1 class="sin-numero">Índice</h1>

<!-- Los números de página se completan tras la conversión a PDF (bloque B5). -->

**I. Presentación del sistema**
&nbsp;&nbsp;&nbsp;&nbsp;A. Qué es PerliNor ERP
&nbsp;&nbsp;&nbsp;&nbsp;B. Para qué sirve
&nbsp;&nbsp;&nbsp;&nbsp;C. Qué hace el sistema por vos
&nbsp;&nbsp;&nbsp;&nbsp;D. Los módulos
&nbsp;&nbsp;&nbsp;&nbsp;E. Qué vas a ver según tu rol
&nbsp;&nbsp;&nbsp;&nbsp;F. Cómo está organizado este manual

**II. Requisitos y acceso**
&nbsp;&nbsp;&nbsp;&nbsp;A. Qué necesitás
&nbsp;&nbsp;&nbsp;&nbsp;B. Cómo entrar
&nbsp;&nbsp;&nbsp;&nbsp;C. Si no podés entrar
&nbsp;&nbsp;&nbsp;&nbsp;D. Sobre tu sesión
&nbsp;&nbsp;&nbsp;&nbsp;E. Cómo salir
&nbsp;&nbsp;&nbsp;&nbsp;F. Tu contraseña

**III. Recuperación de contraseña**
&nbsp;&nbsp;&nbsp;&nbsp;A. Parte 1 — Pedir el enlace
&nbsp;&nbsp;&nbsp;&nbsp;B. Parte 2 — Elegir la contraseña nueva
&nbsp;&nbsp;&nbsp;&nbsp;C. El enlace tiene límites
&nbsp;&nbsp;&nbsp;&nbsp;D. Si hiciste muchos intentos

**IV. Recorrido por la interfaz**
&nbsp;&nbsp;&nbsp;&nbsp;A. Las zonas de la pantalla
&nbsp;&nbsp;&nbsp;&nbsp;B. Los listados
&nbsp;&nbsp;&nbsp;&nbsp;C. Los avisos
&nbsp;&nbsp;&nbsp;&nbsp;D. Las confirmaciones
&nbsp;&nbsp;&nbsp;&nbsp;E. Los formularios
&nbsp;&nbsp;&nbsp;&nbsp;F. Cómo se muestran los datos

**V. Pantalla de inicio**
&nbsp;&nbsp;&nbsp;&nbsp;A. Los indicadores
&nbsp;&nbsp;&nbsp;&nbsp;B. Top clientes
&nbsp;&nbsp;&nbsp;&nbsp;C. Stock más bajo
&nbsp;&nbsp;&nbsp;&nbsp;D. Ventas por período
&nbsp;&nbsp;&nbsp;&nbsp;E. Qué hacer con esta información

**VI. Clientes**
&nbsp;&nbsp;&nbsp;&nbsp;A. Buscar un cliente
&nbsp;&nbsp;&nbsp;&nbsp;B. Dar de alta un cliente
&nbsp;&nbsp;&nbsp;&nbsp;C. Modificar un cliente
&nbsp;&nbsp;&nbsp;&nbsp;D. Dar de baja un cliente
&nbsp;&nbsp;&nbsp;&nbsp;E. Mensajes que podés ver

**VII. Materiales y stock**
&nbsp;&nbsp;&nbsp;&nbsp;A. Buscar un material
&nbsp;&nbsp;&nbsp;&nbsp;B. Dar de alta un material
&nbsp;&nbsp;&nbsp;&nbsp;C. Modificar un material
&nbsp;&nbsp;&nbsp;&nbsp;D. Registrar un movimiento de stock
&nbsp;&nbsp;&nbsp;&nbsp;E. Dar de baja un material
&nbsp;&nbsp;&nbsp;&nbsp;F. Mensajes que podés ver

**VIII. Ventas**
&nbsp;&nbsp;&nbsp;&nbsp;A. Antes de registrar una venta
&nbsp;&nbsp;&nbsp;&nbsp;B. Registrar una venta
&nbsp;&nbsp;&nbsp;&nbsp;C. Si no alcanza el stock
&nbsp;&nbsp;&nbsp;&nbsp;D. Otros errores al registrar
&nbsp;&nbsp;&nbsp;&nbsp;E. Ver el detalle de una venta
&nbsp;&nbsp;&nbsp;&nbsp;F. Consultar ventas
&nbsp;&nbsp;&nbsp;&nbsp;G. Anular una venta

**IX. Caja de ventas**
&nbsp;&nbsp;&nbsp;&nbsp;A. La caja se alimenta sola
&nbsp;&nbsp;&nbsp;&nbsp;B. Qué vas a ver
&nbsp;&nbsp;&nbsp;&nbsp;C. El saldo no cambia con el filtro
&nbsp;&nbsp;&nbsp;&nbsp;D. Filtrar los movimientos
&nbsp;&nbsp;&nbsp;&nbsp;E. Cómo leer los movimientos

**X. Reportes**
&nbsp;&nbsp;&nbsp;&nbsp;A. Qué necesitás saber antes
&nbsp;&nbsp;&nbsp;&nbsp;B. Descargar el reporte de ventas
&nbsp;&nbsp;&nbsp;&nbsp;C. Qué contiene el archivo
&nbsp;&nbsp;&nbsp;&nbsp;D. Una fila por línea, no por venta
&nbsp;&nbsp;&nbsp;&nbsp;E. Solo ventas confirmadas
&nbsp;&nbsp;&nbsp;&nbsp;F. Mensajes que podés ver

**XI. Administración: usuarios, roles y auditoría**
&nbsp;&nbsp;&nbsp;&nbsp;A. Usuarios
&nbsp;&nbsp;&nbsp;&nbsp;B. Roles
&nbsp;&nbsp;&nbsp;&nbsp;C. Auditoría

**XII. Preguntas frecuentes y solución de problemas**
&nbsp;&nbsp;&nbsp;&nbsp;A. Acceso
&nbsp;&nbsp;&nbsp;&nbsp;B. Listados y búsquedas
&nbsp;&nbsp;&nbsp;&nbsp;C. Ventas
&nbsp;&nbsp;&nbsp;&nbsp;D. Stock
&nbsp;&nbsp;&nbsp;&nbsp;E. Caja y reportes
&nbsp;&nbsp;&nbsp;&nbsp;F. Bajas
&nbsp;&nbsp;&nbsp;&nbsp;G. Problemas generales
&nbsp;&nbsp;&nbsp;&nbsp;H. Cuándo avisar a la administración

**Glosario**

</div>

# Presentación del sistema

## Qué es PerliNor ERP

PerliNor ERP es el sistema de gestión de la fábrica. Reúne en un solo lugar la información que antes
estaba repartida entre planillas y papeles: el catálogo de materiales, el stock disponible, los
clientes, las ventas y el movimiento de la caja.

Se usa desde el navegador, como cualquier página web. No hay nada que instalar en tu computadora.

<figure>
  <img src="img/c01-inicio-menu.png" alt="Pantalla de inicio con el menú lateral desplegado">
  <figcaption>Pantalla de inicio del sistema, con el menú de navegación a la izquierda.</figcaption>
</figure>

## Para qué sirve

El sistema te permite:

- **Consultar y mantener el catálogo de materiales**, con su precio y su stock.
- **Registrar los ingresos de stock** cuando entra mercadería.
- **Administrar los clientes** de la fábrica.
- **Registrar las ventas**, que descuentan el stock automáticamente.
- **Anular una venta** si se registró por error, reponiendo el stock.
- **Consultar la caja de ventas**, que se alimenta sola con cada operación.
- **Ver indicadores de gestión**: cuánto se vendió, quiénes son los principales clientes, qué
  materiales están por agotarse.
- **Descargar reportes** para abrir en una planilla de cálculo.

## Qué hace el sistema por vos

Hay tres cosas que conviene tener claras desde el principio, porque son las que más cambian respecto
de trabajar con planillas.

**El stock se actualiza solo.** Cuando registrás una venta, el sistema descuenta los materiales
vendidos. No hay que ajustar nada a mano.

**La caja se alimenta sola.** Cada venta registra su ingreso en la caja de ventas. No se cargan
movimientos manualmente.

**Nada se borra.** Cuando das de baja un cliente o un material, el sistema lo desactiva pero conserva
toda su información y su historial. Una venta vieja siempre se puede consultar, aunque el cliente ya
no esté activo.

## Los módulos

| Módulo | Para qué sirve |
|---|---|
| **Inicio** | Indicadores de gestión y evolución de las ventas |
| **Clientes** | Alta, consulta, modificación y baja de clientes |
| **Materiales** | Catálogo de materiales, precios y movimientos de stock |
| **Ventas** | Registro, consulta y anulación de ventas |
| **Caja de ventas** | Saldo y movimientos de dinero por ventas |
| **Reportes** | Descarga de información en planilla de cálculo |
| **Usuarios** | Altas y modificaciones de las cuentas de acceso |
| **Roles** | Consulta de qué puede hacer cada rol |
| **Auditoría** | Registro de quién hizo qué y cuándo |

## Qué vas a ver según tu rol

El sistema le muestra a cada persona solamente lo que corresponde a su área. Por eso, **el menú no es
igual para todos**.

| Tu rol | Módulos que ves |
|---|---|
| **Administración** | Todos |
| **Ventas** | Inicio, Clientes, Materiales, Ventas |
| **Stock** | Inicio, Materiales |
| **Producción** | Inicio, Materiales |
| **Finanzas** | Inicio, Clientes, Materiales, Ventas, Caja de ventas, Reportes |

Si necesitás acceder a un módulo que no ves en tu menú, hablá con la persona a cargo de la
administración del sistema: es ella quien asigna los roles.

## Cómo está organizado este manual

Los capítulos siguen el orden en que vas a usar el sistema. Los capítulos 2 y 3 explican cómo entrar.
El capítulo 4 te muestra cómo moverte por la pantalla, y conviene leerlo aunque tengas experiencia
con otros sistemas: hay un par de comportamientos que se explican una sola vez, ahí.

Del capítulo 5 al 11 está cada módulo, con sus procedimientos paso a paso. El capítulo 12 reúne las
dudas más frecuentes y qué hacer ante los problemas más comunes.

Al final hay un glosario con los términos que usa el sistema.

# Requisitos y acceso

## Qué necesitás

| Requisito | Detalle |
|---|---|
| Una computadora con navegador | Chrome, Edge o Firefox, actualizados |
| Conexión a la red donde está publicado el sistema | — |
| Tu usuario y contraseña | Te los entrega la persona a cargo de la administración |

No hay nada que instalar ni configurar.

## Cómo entrar

**Paso 1.** Abrí el navegador e ingresá la dirección del sistema. Vas a ver la pantalla de acceso.

<figure class="media">
  <img src="img/c02-login.png" alt="Pantalla de inicio de sesión">
  <figcaption>Pantalla de acceso al sistema.</figcaption>
</figure>

**Paso 2.** Escribí tu email y tu contraseña.

**Paso 3.** Hacé clic en **Ingresar**.

Si los datos son correctos, entrás directamente a la pantalla de **Inicio**, con tu menú ya armado
según tu rol.

## Si no podés entrar

<figure class="media">
  <img src="img/c03-login-error.png" alt="Pantalla de acceso mostrando el mensaje de error">
  <figcaption>Mensaje que aparece cuando el email o la contraseña no son correctos.</figcaption>
</figure>

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| «Email o contraseña incorrectos.» | Los datos no coinciden con ninguna cuenta activa | Revisá que el email esté bien escrito y volvé a intentar. Si no lo resolvés, usá **¿Olvidaste tu contraseña?** (capítulo 3) |
| «No se pudo iniciar sesión. Intentá nuevamente.» | El sistema no pudo responder | Esperá unos segundos y reintentá. Si persiste, avisá a la administración |

> **Por qué el mensaje no dice cuál de los dos datos está mal.** Es a propósito. Si el sistema
> avisara «ese email no existe», cualquiera podría averiguar qué direcciones están registradas. El
> mensaje es el mismo en los dos casos, por seguridad.

Si el email es correcto y la contraseña también, pero igual no entrás, puede que tu cuenta haya sido
dada de baja. En ese caso, consultá con la administración.

## Sobre tu sesión

Una vez que entrás, **el sistema mantiene tu sesión abierta**. Podés cerrar la pestaña y volver más
tarde sin tener que escribir de nuevo tu contraseña, o recargar la página sin perder nada.

La sesión se renueva sola mientras la uses. Si pasás varios días sin entrar, te va a pedir la
contraseña otra vez.

## Cómo salir

Hacé clic en el ícono de usuario, arriba a la derecha, y elegí **Cerrar sesión**.

Conviene cerrar sesión si compartís la computadora con otras personas.

## Tu contraseña

Estas son las reglas que aplica el sistema:

- La contraseña debe tener **al menos 8 caracteres**.
- Si la olvidás, la podés recuperar vos mismo desde la pantalla de acceso (capítulo 3).
- Si necesitás cambiarla sin haberla olvidado, usá también **¿Olvidaste tu contraseña?**: el
  procedimiento es el mismo.

> **Importante.** Si cambiás tu contraseña, las sesiones que ya estén abiertas en otros equipos
> siguen funcionando durante unos días. Si sospechás que alguien accedió a tu cuenta, además de
> cambiar la contraseña avisá a la administración.

# Recuperación de contraseña

Si olvidaste tu contraseña, la podés recuperar vos mismo. No hace falta que intervenga la
administración.

El procedimiento tiene dos partes: primero pedís un enlace por correo, después elegís la contraseña
nueva.

## Parte 1 — Pedir el enlace

**Paso 1.** En la pantalla de acceso, hacé clic en **¿Olvidaste tu contraseña?**

**Paso 2.** Escribí tu email y hacé clic en **Enviar**.

<figure class="media">
  <img src="img/c04-olvide-contrasena.png" alt="Formulario para solicitar el enlace de recuperación">
  <figcaption>Formulario de solicitud del enlace de recuperación.</figcaption>
</figure>

**Paso 3.** Vas a ver este aviso:

<figure class="media">
  <img src="img/c05-confirmacion-envio.png" alt="Aviso de confirmación del envío">
  <figcaption>Aviso que confirma que la solicitud fue procesada.</figcaption>
</figure>

> «Si el email está registrado, vas a recibir un mensaje con las instrucciones para restablecer tu
> contraseña.»

> **Por qué dice «si el email está registrado».** El sistema muestra siempre el mismo aviso, exista o
> no la dirección que escribiste. Es una medida de seguridad: impide que alguien use esta pantalla
> para averiguar qué direcciones tienen cuenta.
>
> **No significa que haya fallado.** Si tu email es correcto, el mensaje ya salió.

**Paso 4.** Revisá tu casilla de correo. Si no lo ves en unos minutos, fijate en la carpeta de correo
no deseado.

## Parte 2 — Elegir la contraseña nueva

**Paso 5.** Abrí el mensaje y hacé clic en el enlace.

**Paso 6.** Escribí la contraseña nueva dos veces: una en **Contraseña** y otra en **Repetir
contraseña**.

<figure class="media">
  <img src="img/c06-contrasena-nueva.png" alt="Formulario para definir la contraseña nueva">
  <figcaption>Formulario para definir la contraseña nueva.</figcaption>
</figure>

La contraseña debe tener **al menos 8 caracteres**, y las dos tienen que coincidir. Si no, el botón
no se habilita.

**Paso 7.** Hacé clic en **Guardar**. Vas a ver el aviso «Tu contraseña fue actualizada. Ya podés
iniciar sesión.»

**Paso 8.** Volvé a la pantalla de acceso e ingresá con tu contraseña nueva.

## El enlace tiene límites

<blockquote class="aviso">
<p><strong>Tres cosas que conviene saber sobre el enlace:</strong></p>
<ul>
<li><strong>Dura 30 minutos.</strong> Pasado ese tiempo deja de servir y hay que pedir uno nuevo.</li>
<li><strong>Se usa una sola vez.</strong> Una vez que cambiaste la contraseña, ese enlace ya no funciona.</li>
<li><strong>Solo vale el último.</strong> Si pediste el enlace varias veces, únicamente el más reciente sirve.</li>
</ul>
</blockquote>

Si el enlace ya venció o ya lo usaste, vas a ver esta pantalla:

<figure class="media">
  <img src="img/c07-enlace-invalido.png" alt="Pantalla que informa que el enlace no es válido">
  <figcaption>Pantalla que aparece cuando el enlace venció, ya fue usado o no es válido.</figcaption>
</figure>

No es un problema: volvé a la pantalla de acceso y pedí un enlace nuevo.

## Si hiciste muchos intentos

Si pedís el enlace muchas veces seguidas, el sistema te va a frenar con este mensaje:

> «Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.»

Es una protección contra el uso automatizado. Esperá unos minutos y volvé a intentar.

## Preguntas frecuentes de este capítulo

| Duda | Respuesta |
|---|---|
| No me llegó el mensaje | Revisá correo no deseado. Verificá que el email que escribiste sea el de tu cuenta. Si no, consultá con la administración |
| Quiero cambiar la contraseña sin haberla olvidado | Usá el mismo procedimiento: **¿Olvidaste tu contraseña?** |
| ¿Alguien más puede ver mi contraseña nueva? | No. El sistema no guarda la contraseña tal como la escribís, y nadie —tampoco la administración— puede consultarla |
| Cambié la contraseña, ¿se cierran las sesiones abiertas en otros equipos? | No de inmediato. Siguen funcionando durante unos días. Si te preocupa, avisá a la administración |

# Recorrido por la interfaz

Todas las pantallas del sistema funcionan igual. Este capítulo explica esa mecánica común una sola
vez, para no repetirla en cada módulo.

**Conviene leerlo completo**, aunque tengas experiencia con otros sistemas: hay dos comportamientos
que sorprenden la primera vez y se explican acá.

## Las zonas de la pantalla

<figure>
  <div class="anotada">
    <img src="img/c08-layout.png" alt="Pantalla del sistema con sus zonas señaladas">
    <!-- Coordenadas ajustadas sobre la captura real (1223 × 821). -->
    <span class="marca" style="left:9%;  top:24%">1</span>
    <span class="marca" style="left:57%; top:3%">2</span>
    <span class="marca" style="left:74%; top:13%">3</span>
  </div>
  <figcaption>Zonas de la pantalla: (1) menú lateral, (2) barra superior, (3) área de contenido.</figcaption>
</figure>

**1 — Menú lateral.** Los módulos a los que tenés acceso. El que estás viendo queda resaltado. Con el
botón de la barra superior podés contraerlo para ganar espacio.

**2 — Barra superior.** A la izquierda, el botón que contrae el menú. A la derecha, tu email y el
ícono de usuario, donde está la opción **Cerrar sesión**.

**3 — Área de contenido.** La pantalla en la que estás trabajando.

## Los listados

Casi todos los módulos empiezan con un listado. Todos tienen la misma estructura.

<figure>
  <div class="anotada">
    <img src="img/c09-grilla.png" alt="Listado con sus elementos señalados">
    <!-- Coordenadas ajustadas sobre la captura real (1221 × 806). -->
    <span class="marca" style="left:33%; top:18%">1</span>
    <span class="marca" style="left:53%; top:22%">2</span>
    <span class="marca" style="left:93%; top:28%">3</span>
    <span class="marca" style="left:58%; top:42%">4</span>
  </div>
  <figcaption>Elementos de un listado: (1) buscador, (2) columnas, (3) acciones por fila, (4) paginador.</figcaption>
</figure>

**1 — Buscador.** Escribís y los resultados se filtran solos, sin apretar ningún botón.

**2 — Columnas.** La información de cada registro.

**3 — Acciones.** Los botones al final de cada fila: editar, dar de baja, ver detalle. Según el
módulo y tu rol, vas a ver unos u otros.

**4 — Paginador.** Si hay muchos resultados, se muestran de a páginas.

### Dos comportamientos que conviene conocer

<blockquote class="aviso">
<p><strong>1. En Clientes, Materiales y Usuarios el listado arranca vacío, a propósito.</strong></p>
<p>Cuando entrás a uno de esos módulos no vas a ver ningún registro, sino el mensaje
«Ingresá al menos 2 caracteres para buscar.»</p>
<p><strong>No es un error ni significa que no haya datos.</strong> Son catálogos que pueden tener
muchos registros, y traerlos todos no sirve de nada cuando estás buscando uno en particular.
Escribí dos letras en el buscador y los resultados aparecen.</p>
</blockquote>

<blockquote class="aviso">
<p><strong>2. En Ventas, Caja de ventas y Auditoría el listado arranca mostrando el día de hoy.</strong></p>
<p>Estos tres módulos sí muestran información al entrar, pero acotada al día en curso, que es lo que
se necesita en el trabajo diario.</p>
<p>Si buscás algo de otra fecha, <strong>ampliá el rango</strong> con los campos <strong>Desde</strong>
y <strong>Hasta</strong>. El botón <strong>Restablecer</strong> vuelve al día de hoy.</p>
</blockquote>

## Los avisos

Cuando hacés una operación, el sistema te confirma el resultado con un aviso que aparece arriba a la
derecha y desaparece solo a los pocos segundos.

<figure class="media">
  <img src="img/c10-aviso-exito.png" alt="Aviso de operación exitosa">
  <figcaption>Aviso de confirmación tras una operación exitosa.</figcaption>
</figure>

| Color | Significado |
|---|---|
| Verde | La operación se completó |
| Rojo | Algo falló. El texto explica qué |
| Azul | Información, sin que nada haya fallado |

Los avisos en rojo son los importantes: **leelos antes de que desaparezcan**. Explican por qué no se
pudo hacer lo que pediste.

## Las confirmaciones

Antes de una operación que no se puede deshacer —dar de baja algo, anular una venta—, el sistema te
pide confirmación.

<figure class="media">
  <img src="img/c11-dialogo-confirmacion.png" alt="Diálogo de confirmación">
  <figcaption>Diálogo de confirmación previo a una operación irreversible.</figcaption>
</figure>

El texto te dice **qué va a pasar**, no solo qué vas a hacer. Cuando anulás una venta, por ejemplo, te
avisa que se va a reponer el stock. Leelo antes de aceptar.

## Los formularios

**Los campos obligatorios** se marcan y no te dejan guardar si están vacíos.

**Los errores aparecen debajo del campo**, en rojo, apenas salís de él. No hace falta enviar el
formulario para enterarte.

**Mientras se guarda**, el botón se deshabilita y muestra que está trabajando. Evita que guardes dos
veces por error.

**Si algo falla al guardar**, aparece un aviso rojo y el formulario **se queda como estaba**, con todo
lo que cargaste. No perdés el trabajo: corregís lo que haga falta y volvés a intentar.

## Cómo se muestran los datos

| Dato | Formato | Ejemplo |
|---|---|---|
| Importes | Pesos, con punto de miles y coma decimal | `$ 1.234.567,89` |
| Cantidades | Coma decimal | `1.250,500` |
| Fechas | Día/mes/año | `13/09/2026` |
| Fecha y hora | Día/mes/año y hora | `13/09/2026 14:30` |
| Dato ausente | Un guion | `—` |

Un guion no es un error: significa que ese dato no se cargó o no corresponde.

# Pantalla de inicio

Es la primera pantalla que ves al entrar. Reúne los indicadores de gestión de la fábrica.

**Todos los roles tienen acceso.**

<figure>
  <img src="img/c12-panel-inicio.png" alt="Pantalla de inicio con los indicadores">
  <figcaption>Pantalla de inicio con los indicadores de gestión.</figcaption>
</figure>

## Los indicadores

### Ventas del mes

Total vendido y cantidad de ventas desde el día 1 del mes en curso hasta hoy.

### Ventas de hoy

Total vendido y cantidad de ventas del día de hoy.

### Productos activos

Cuántos materiales hay en el catálogo. No cuenta los que están dados de baja.

### Clientes activos

Cuántos clientes tenés cargados. No cuenta los dados de baja.

<blockquote class="aviso">
<p><strong>Las ventas anuladas no se cuentan en ningún indicador.</strong></p>
<p>Si anulás una venta, los totales se ajustan: esa venta deja de figurar. Lo mismo vale para el
gráfico, la caja y los reportes. Los indicadores muestran siempre las ventas que están vigentes.</p>
</blockquote>

## Top clientes

Los cinco clientes que más compraron, con el total acumulado de cada uno. Se calcula sobre todas las
ventas confirmadas, sin límite de fecha.

## Stock más bajo

Los cinco materiales con **menos stock** del catálogo, con su cantidad disponible.

> **Atención con este panel.** Muestra los cinco materiales con menor stock, comparados entre sí. **No
> son materiales por debajo de un mínimo configurado**: el sistema no maneja un stock mínimo por
> material.
>
> Si tu catálogo está bien abastecido, igual vas a ver cinco materiales acá. Son los que tienen menos,
> no necesariamente los que faltan.

## Ventas por período

El gráfico muestra cómo vienen las ventas a lo largo del tiempo.

<figure>
  <img src="img/c13-grafico-tooltip.png" alt="Panel Ventas por período con un tooltip abierto">
  <figcaption>Panel <em>Ventas por período</em>. Al apoyar el puntero sobre una barra se muestra el importe y la cantidad de ventas de ese intervalo.</figcaption>
</figure>

### Cambiar el período

Arriba del gráfico hay tres botones:

| Botón | Qué muestra |
|---|---|
| **Día** | Los últimos 30 días, una barra por día |
| **Semana** | Las últimas 12 semanas, una barra por semana |
| **Mes** | Los últimos 12 meses, una barra por mes |

Al cambiar de período, solo se recarga el gráfico. Los demás indicadores quedan como están.

### Cómo leerlo

**Apoyá el puntero sobre una barra** para ver el total vendido y la cantidad de ventas de ese período.

**Las barras en cero también aparecen.** Si un día no hubo ventas, vas a ver el espacio vacío. Es
intencional: si se omitieran, el gráfico uniría dos días con ventas y parecería que hubo actividad
continua cuando no la hubo.

Si no hubo ninguna venta en todo el período, el gráfico muestra «Sin ventas confirmadas en el
período.» en lugar de barras planas.

## Qué hacer con esta información

| Si ves… | Puede significar… |
|---|---|
| Ventas de hoy en cero, avanzada la jornada | Hay ventas sin registrar |
| Un material con stock muy bajo en el panel | Conviene reponerlo antes de que se agote y bloquee una venta |
| El gráfico con una caída sostenida | Vale la pena revisar el período en el listado de Ventas o descargar el reporte |
| Un cliente que subió al panel de principales | Puede justificar una condición comercial distinta |

# Clientes

Acá se administra el padrón de clientes de la fábrica. Todo cliente al que le vendas tiene que estar
cargado.

**Acceden:** Administración y Ventas. Finanzas puede consultarlo.

## Buscar un cliente

El listado **arranca vacío a propósito**: escribí al menos dos letras en el buscador para ver
resultados.

<figure>
  <img src="img/c14-clientes-inicial.png" alt="Listado de clientes en su estado inicial">
  <figcaption>Estado inicial del listado de Clientes. El mensaje indica que hay que buscar para ver resultados.</figcaption>
</figure>

Podés buscar por **nombre, CUIT o email**, y no hace falta escribir el dato completo: con una parte
alcanza. Tampoco importan las mayúsculas.

<figure>
  <img src="img/c15-clientes-resultados.png" alt="Listado de clientes con resultados">
  <figcaption>Listado de Clientes con resultados de una búsqueda.</figcaption>
</figure>

## Dar de alta un cliente

**Paso 1.** Hacé clic en **Nuevo cliente**.

**Paso 2.** Completá los datos.

<figure class="media">
  <img src="img/c16-cliente-alta.png" alt="Formulario de alta de cliente">
  <figcaption>Formulario de alta de cliente.</figcaption>
</figure>

| Campo | ¿Obligatorio? | Detalle |
|---|---|---|
| **Nombre** | **Sí** | Razón social o nombre. Mínimo 2 caracteres |
| CUIT / Documento | No | |
| Email | No | Si lo cargás, tiene que ser una dirección válida |
| Teléfono | No | |
| Dirección | No | |

**Paso 3.** Hacé clic en **Guardar**. Vas a ver el aviso «Cliente creado.»

> **Solo el nombre es obligatorio.** Podés dar de alta un cliente con el nombre nada más y completar
> el resto después. Conviene cargar el CUIT desde el principio, porque es el dato que aparece en el
> reporte de ventas.

> **El sistema no controla CUIT repetidos.** Si cargás dos veces el mismo cliente con distinto
> nombre, se van a crear dos fichas. Buscá antes de dar de alta.

## Modificar un cliente

**Paso 1.** Buscalo en el listado.

**Paso 2.** Hacé clic en el botón de editar de su fila.

**Paso 3.** Modificá lo que necesites y hacé clic en **Guardar**. Vas a ver «Cliente actualizado.»

Podés modificar todos los campos, incluido el nombre. **Las ventas ya registradas no se alteran**:
siguen apuntando a la misma ficha.

## Dar de baja un cliente

Se usa cuando un cliente deja de operar con la fábrica.

**Paso 1.** Buscalo en el listado.

**Paso 2.** Hacé clic en el botón de baja de su fila.

**Paso 3.** Confirmá en el diálogo.

<figure class="media">
  <img src="img/c17-cliente-baja.png" alt="Diálogo de confirmación de baja de cliente">
  <figcaption>Confirmación previa a dar de baja un cliente.</figcaption>
</figure>

Vas a ver el aviso «Cliente dado de baja.»

<blockquote class="aviso">
<p><strong>Dar de baja no borra nada.</strong></p>
<p>El cliente se desactiva, pero su ficha y todas sus ventas se conservan. El historial queda
intacto y los reportes de períodos anteriores siguen siendo correctos.</p>
<p>Lo único que cambia es que <strong>ya no vas a poder registrarle ventas nuevas</strong> ni te va a
aparecer en el selector de clientes al cargar una venta.</p>
</blockquote>

Si diste de baja un cliente por error, comunicate con la administración: la reactivación no se hace
desde esta pantalla.

## Mensajes que podés ver

| Mensaje | Qué significa |
|---|---|
| «Cliente creado.» | El alta se completó |
| «Cliente actualizado.» | Los cambios se guardaron |
| «Cliente dado de baja.» | El cliente quedó desactivado |
| «No se encontraron clientes para esa búsqueda.» | No hay coincidencias. Probá con menos letras o con otro dato |
| «Ingresá al menos 2 caracteres para buscar.» | Estado inicial del listado. Escribí en el buscador |

## Preguntas frecuentes de este capítulo

| Duda | Respuesta |
|---|---|
| Cargué mal el nombre de un cliente | Editalo. El cambio se refleja en todas sus ventas, que siguen siendo la misma operación |
| Un cliente no aparece al cargar una venta | Puede estar dado de baja. Buscalo en el listado para verificarlo |
| ¿Puedo eliminar un cliente definitivamente? | No. El sistema no borra datos, para no perder el historial de ventas |

# Materiales y stock

Acá se administra el catálogo de materiales que la fábrica vende, con su precio y su stock.

**Acceden:** Administración, Stock y Producción. Ventas y Finanzas pueden consultarlo.

## Buscar un material

El listado **arranca vacío a propósito**: escribí al menos dos letras para ver resultados. Podés
buscar por **SKU o por nombre**.

<figure>
  <img src="img/c18-materiales-listado.png" alt="Listado de materiales con resultados">
  <figcaption>Listado de Materiales. Las columnas Precio y Stock muestran los datos que más se consultan.</figcaption>
</figure>

| Columna | Qué muestra |
|---|---|
| **SKU** | Código del material. Es único |
| **Nombre** | Denominación |
| **Categoría** | Clasificación |
| **Unidad** | Cómo se cuenta: unidad, bolsa, m³ |
| **Precio** | Precio de venta vigente |
| **Stock** | Cantidad disponible |
| **Estado** | Activo o Inactivo |

## Dar de alta un material

**Paso 1.** Hacé clic en **Nuevo material**.

**Paso 2.** Completá los datos.

<figure class="media">
  <img src="img/c19-material-alta.png" alt="Formulario de alta de material">
  <figcaption>Formulario de alta de material.</figcaption>
</figure>

| Campo | ¿Obligatorio? | Detalle |
|---|---|---|
| **SKU** | **Sí** | Código único. No puede repetirse |
| **Nombre** | **Sí** | Mínimo 2 caracteres |
| **Categoría** | **Sí** | Se elige de la lista. Si falta, la podés crear acá mismo |
| **Unidad** | **Sí** | Unidad de medida: `u`, `bolsa`, `m3` |
| **Precio** | **Sí** | Precio de venta. Puede ser 0 y corregirse después |

**Paso 3.** Hacé clic en **Guardar**. Vas a ver «Material creado.»

<blockquote class="aviso">
<p><strong>El material nace con stock 0.</strong></p>
<p>El formulario de alta no tiene campo de stock, y es a propósito: el stock <strong>solo</strong> se
modifica con movimientos, para que siempre quede registrado de dónde salió cada cambio.</p>
<p>Después de dar de alta el material, cargale el stock inicial con un <strong>Ingreso</strong>
(más abajo en este capítulo).</p>
</blockquote>

### Crear una categoría sin salir del formulario

Si la categoría que necesitás no está en la lista, hacé clic en el botón de agregar que está al lado
del selector.

<figure class="media">
  <img src="img/c20-categoria-nueva.png" alt="Diálogo para crear una categoría">
  <figcaption>Diálogo de alta rápida de categoría, sobre el formulario de material.</figcaption>
</figure>

Escribí el nombre y hacé clic en **Guardar**. La categoría queda creada y **seleccionada** en el
formulario. No perdés lo que ya habías cargado.

## Modificar un material

**Paso 1.** Buscalo y hacé clic en el botón de editar.

**Paso 2.** Modificá lo que necesites y guardá. Vas a ver «Material actualizado.»

Podés cambiar el SKU, el nombre, la categoría, la unidad y el precio. **No podés cambiar el stock
desde acá.**

<blockquote class="aviso">
<p><strong>Cambiar el precio no altera las ventas ya registradas.</strong></p>
<p>Cada venta guarda el precio que el material tenía <strong>en el momento de registrarse</strong>.
Si hoy actualizás la lista de precios, las ventas de ayer conservan el precio de ayer.</p>
<p>Es lo que permite que los reportes de meses cerrados den siempre el mismo resultado.</p>
</blockquote>

## Registrar un movimiento de stock

Es el procedimiento con el que entra mercadería al sistema, y también con el que se corrigen
diferencias.

**Paso 1.** Buscá el material y hacé clic en el botón de stock de su fila.

**Paso 2.** Elegí el tipo de movimiento: **Ingreso** o **Ajuste**.

<figure class="media">
  <img src="img/c21-movimiento-stock.png" alt="Diálogo de movimiento de stock">
  <figcaption>Diálogo de movimiento de stock. El selector define si la cantidad se suma o reemplaza el stock actual.</figcaption>
</figure>

**Paso 3.** Escribí la cantidad.

**Paso 4.** Opcionalmente, completá **Referencia** con el motivo: «Recepción de producción»,
«Recuento del 13/09», el número de remito.

**Paso 5.** Hacé clic en **Guardar**. Vas a ver «Movimiento de stock registrado.»

<figure>
  <img src="img/c22-materiales-post-movimiento.png" alt="Listado de materiales con el stock actualizado">
  <figcaption>El listado refleja el stock actualizado inmediatamente después del movimiento.</figcaption>
</figure>

### Ingreso y Ajuste no son lo mismo

<blockquote class="aviso">
<p><strong>Esta es la distinción más importante del capítulo. Leela con atención.</strong></p>
<table>
<tr><th>Tipo</th><th>Qué hace</th><th>Cuándo se usa</th></tr>
<tr><td><strong>Ingreso</strong></td><td><strong>SUMA</strong> la cantidad al stock actual</td><td>Entró mercadería</td></tr>
<tr><td><strong>Ajuste</strong></td><td><strong>REEMPLAZA</strong> el stock por la cantidad indicada</td><td>Corrección tras un recuento físico</td></tr>
</table>
<p><strong>Ejemplo.</strong> Un material tiene <strong>200 unidades</strong> y cargás la cantidad
<strong>50</strong>:</p>
<ul>
<li>Con <strong>Ingreso</strong>, el stock pasa a <strong>250</strong>. (200 + 50)</li>
<li>Con <strong>Ajuste</strong>, el stock pasa a <strong>50</strong>. (queda en 50)</li>
</ul>
<p>Elegir mal el tipo modifica el inventario sin que nada avise. Si te equivocaste, corregilo con un
<strong>Ajuste</strong> al valor correcto y dejá el motivo en la Referencia.</p>
</blockquote>

### Las salidas no se cargan a mano

En el diálogo no hay opción de salida, y es intencional: **el stock baja únicamente cuando se registra
una venta**.

Así se garantiza que toda salida de mercadería tenga una venta detrás. Si necesitás descontar stock
por rotura o pérdida, usá un **Ajuste** al valor real y aclaralo en la Referencia.

## Dar de baja un material

Se usa cuando un material deja de fabricarse o venderse.

**Paso 1.** Buscalo y hacé clic en el botón de baja.

**Paso 2.** Confirmá. Vas a ver «Material dado de baja.»

Igual que con los clientes, **el material no se borra**: se desactiva. Su historial de movimientos y
las ventas donde figura se conservan. Deja de aparecer al cargar una venta.

## Mensajes que podés ver

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| «Material creado.» | El alta se completó | — |
| «Material actualizado.» | Los cambios se guardaron | — |
| «Movimiento de stock registrado.» | El stock se actualizó | Verificá el valor en la columna Stock |
| «Material dado de baja.» | Quedó desactivado | — |
| «El SKU ya fue registrado» | Ese código ya lo tiene otro material | Buscá el SKU en el listado: puede que el material ya exista |
| «La categoría indicada no existe» | La categoría fue dada de baja | Elegí otra o creá una nueva |
| «No se encontraron materiales para esa búsqueda.» | Sin coincidencias | Probá con menos letras o con el nombre en vez del SKU |

## Preguntas frecuentes de este capítulo

| Duda | Respuesta |
|---|---|
| Di de alta el material pero el stock quedó en 0 | Es lo esperado. Cargale el stock inicial con un **Ingreso** |
| Me equivoqué de tipo de movimiento | Corregí con un **Ajuste** al valor correcto y dejá el motivo en la Referencia |
| Necesito descontar stock por rotura | Usá un **Ajuste** al valor real. Las salidas por venta las genera el sistema |
| El material no aparece al cargar una venta | Puede estar dado de baja, o tener stock 0 |
| ¿Puedo ver el historial de movimientos? | Sí, el sistema lo conserva. Consultá con la administración cómo acceder |

# Ventas

Es el módulo central del sistema. Acá se registran las ventas, se consultan y, si hace falta, se
anulan.

**Acceden:** Administración y Ventas. Finanzas puede consultarlo.

## Antes de registrar una venta

Necesitás que ya existan:

- El **cliente**, dado de alta y activo (capítulo 6).
- Los **materiales**, dados de alta y **con stock suficiente** (capítulo 7).

Si falta alguno, cargalo primero.

## Registrar una venta

**Paso 1.** En el menú, entrá a **Ventas** y hacé clic en **Nueva venta**.

<figure>
  <img src="img/c23-venta-nueva-vacia.png" alt="Formulario de nueva venta vacío">
  <figcaption>Formulario de registro de venta, al abrirse.</figcaption>
</figure>

**Paso 2.** Elegí el **cliente** de la lista. Aparecen solamente los clientes activos.

**Paso 3.** Elegí el **medio de pago**: Efectivo, Transferencia, Tarjeta, Cheque o Cuenta corriente.

**Paso 4.** Cargá la primera línea: elegí el **material** y escribí la **cantidad**.

El precio unitario y el total de la línea **se calculan solos**, con el precio que el material tiene
cargado. No se escriben a mano.

**Paso 5.** Si la venta tiene más de un material, hacé clic en **Agregar línea** y repetí. Con el
botón de quitar sacás una línea que cargaste de más.

<figure>
  <img src="img/c24-venta-nueva-cargada.png" alt="Formulario de venta con dos líneas cargadas">
  <figcaption>Formulario con dos líneas cargadas. El subtotal y el total se actualizan a medida que se agregan materiales.</figcaption>
</figure>

**Paso 6.** Revisá el **total** al pie.

**Paso 7.** Hacé clic en **Registrar**.

Si todo está bien, el sistema te lleva directo al **detalle de la venta**, ya confirmada.

### Qué hace el sistema al registrar

En un solo paso, y de forma indivisible:

1. Confirma la venta con su detalle.
2. **Descuenta el stock** de cada material vendido.
3. **Registra el ingreso en la caja de ventas.**
4. Deja constancia de quién la registró.

<blockquote class="aviso">
<p><strong>O se hace todo, o no se hace nada.</strong></p>
<p>Si algo falla —por ejemplo, no alcanza el stock—, <strong>la venta no se registra y el stock queda
exactamente como estaba</strong>. Nunca vas a tener una venta a medias, ni stock descontado sin venta.</p>
</blockquote>

### El precio queda congelado

El precio que se guarda en la venta es el que el material tenía **en ese momento**. Si mañana cambia
la lista de precios, esta venta conserva el precio de hoy.

## Si no alcanza el stock

Es el error más frecuente del módulo.

<figure>
  <img src="img/c25-venta-stock-insuficiente.png" alt="Aviso de stock insuficiente">
  <figcaption>Aviso de stock insuficiente. Indica el material, la cantidad disponible y la requerida.</figcaption>
</figure>

> «Stock insuficiente para *Vigueta pretensada 3,00 m* (disponible 8, requerido 20)»

**Qué pasó:** pediste más de lo que hay. El aviso te dice el material, cuánto hay y cuánto pediste.

**Qué NO pasó:** la venta no se registró y **el stock no se tocó**. El formulario queda como estaba,
con todo lo que cargaste.

**Qué hacer**, según el caso:

| Situación | Qué hacer |
|---|---|
| Te equivocaste en la cantidad | Corregila y volvé a intentar |
| Hay mercadería que no se cargó al sistema | Andá a **Materiales**, registrá el **Ingreso**, y volvé |
| Realmente no hay stock | Sacá esa línea o reducí la cantidad a lo disponible |

> **Si cargaste el mismo material en dos líneas**, el sistema suma las dos cantidades para verificar
> el stock. Dos líneas de 60 unidades necesitan 120 disponibles, no 60.

## Otros errores al registrar

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| «La venta debe tener al menos un ítem» | No cargaste ninguna línea | Agregá al menos un material con su cantidad |
| «El cliente no existe o está inactivo» | El cliente fue dado de baja mientras cargabas | Elegí otro cliente o pedí que lo reactiven |
| «Producto inexistente o inactivo» | Un material fue dado de baja mientras cargabas | Sacá esa línea y elegí otro material |
| «No hay una caja de ventas configurada.» | Falta una configuración del sistema | Avisá a la administración. No es un problema de la venta |

## Ver el detalle de una venta

En el listado, hacé clic en la fila.

<figure>
  <img src="img/c26-venta-detalle-confirmada.png" alt="Detalle de una venta confirmada">
  <figcaption>Detalle de una venta confirmada, con su cabecera y sus líneas.</figcaption>
</figure>

Vas a ver el cliente, la fecha y hora, el medio de pago, el vendedor, el estado, cada línea con su
cantidad y precio, y los totales.

Si el vendedor aparece como «—», la venta se registró antes de que el sistema guardara ese dato.

## Consultar ventas

<figure>
  <img src="img/c29-ventas-listado-filtrado.png" alt="Listado de ventas con filtros aplicados">
  <figcaption>Listado de Ventas con sus filtros: rango de fechas, estado y buscador por cliente.</figcaption>
</figure>

El listado **arranca mostrando las ventas de hoy**.

| Filtro | Para qué sirve |
|---|---|
| **Desde** / **Hasta** | Rango de fechas. Ampliá para ver otros períodos |
| **Estado** | Todas, Confirmadas o Anuladas |
| **Buscador** | Busca por nombre de cliente. Con una parte del nombre alcanza |
| **Restablecer** | Vuelve al día de hoy, sin filtro de estado |

Las ventas se muestran de la más reciente a la más antigua.

> **Si no encontrás una venta**, lo más probable es que sea de otra fecha. Ampliá el rango con
> **Desde** y **Hasta**.

## Anular una venta

Se usa cuando una venta se registró por error.

**Paso 1.** Abrí el detalle de la venta.

**Paso 2.** Hacé clic en **Anular**.

**Paso 3.** Leé la confirmación y aceptá.

<figure class="media">
  <img src="img/c27-venta-confirmar-anulacion.png" alt="Diálogo de confirmación de anulación">
  <figcaption>Confirmación previa a anular una venta.</figcaption>
</figure>

Vas a ver el aviso «Venta anulada. Stock repuesto.»

<figure>
  <img src="img/c28-venta-detalle-anulada.png" alt="Detalle de una venta anulada">
  <figcaption>Detalle de una venta anulada. El estado cambió y el botón Anular ya no está disponible.</figcaption>
</figure>

### Qué hace el sistema al anular

1. Marca la venta como **Anulada**.
2. **Repone el stock** de todos los materiales vendidos.
3. **Revierte el ingreso en la caja**, con un movimiento negativo.

<blockquote class="aviso">
<p><strong>La anulación no se puede deshacer.</strong></p>
<p>Una venta anulada queda anulada. Si la operación era correcta, hay que <strong>registrarla de
nuevo</strong>.</p>
<p>La venta anulada no se borra: queda en el listado con estado Anulada, para que el historial
muestre lo que pasó.</p>
</blockquote>

### Qué deja de contar una venta anulada

A partir de la anulación, esa venta **no se computa** en:

- Los indicadores de la pantalla de inicio.
- El gráfico de evolución de ventas.
- El saldo de la caja de ventas.
- El reporte de ventas por período.

Sigue apareciendo en el listado de Ventas, con su estado, y en la Auditoría.

### Si no podés anular

| Mensaje | Qué significa |
|---|---|
| «Solo se pueden anular ventas confirmadas» | La venta ya estaba anulada |
| «La venta ya no está confirmada» | Otra persona la anuló al mismo tiempo. Recargá la pantalla |

## Preguntas frecuentes de este capítulo

| Duda | Respuesta |
|---|---|
| ¿Puedo modificar una venta registrada? | No. Si tiene un error, anulala y registrala de nuevo |
| ¿Puedo cambiarle el precio a una línea? | No. El precio sale del material. Si está mal, corregilo en **Materiales** y registrá la venta de nuevo |
| Registré dos veces la misma venta | Anulá una de las dos. El stock se repone solo |
| ¿La venta a Cuenta corriente suma a la caja? | Sí. Todas las ventas registran su ingreso, cualquiera sea el medio de pago |
| No encuentro una venta de la semana pasada | Ampliá el rango de fechas: el listado arranca en el día de hoy |
| ¿Puedo dejar una venta a medio cargar y seguir después? | No. La venta se registra completa o no se registra |

# Caja de ventas

Muestra el dinero que ingresó por las ventas de la fábrica.

**Acceden:** Administración y Finanzas.

## La caja se alimenta sola

<blockquote class="aviso">
<p><strong>Acá no se cargan movimientos.</strong></p>
<p>Todos los movimientos los genera el sistema:</p>
<ul>
<li>Cada <strong>venta registrada</strong> genera un ingreso por su importe total.</li>
<li>Cada <strong>venta anulada</strong> genera un movimiento negativo que revierte el ingreso.</li>
</ul>
<p>Esta pantalla es de consulta: no tiene botones de alta ni de edición.</p>
</blockquote>

## Qué vas a ver

<figure>
  <img src="img/c30-caja-ventas.png" alt="Pantalla de caja de ventas con saldo y movimientos">
  <figcaption>Caja de ventas: el saldo acumulado arriba y el listado de movimientos del día debajo.</figcaption>
</figure>

**Arriba, el saldo.** El total acumulado de la caja.

**Abajo, los movimientos**, con fecha y hora, descripción e importe. El listado **arranca mostrando
los del día de hoy**.

## El saldo no cambia con el filtro

<blockquote class="aviso">
<p><strong>Esto es lo que más confunde de esta pantalla, así que conviene tenerlo claro.</strong></p>
<p>El <strong>saldo</strong> de arriba es el <strong>acumulado total de la caja</strong>, desde
siempre. <strong>No cambia</strong> cuando filtrás por fecha.</p>
<p>El filtro afecta <strong>solamente al listado</strong> de abajo.</p>
<p>Es decir: si filtrás una semana en la que hubo $500.000 de ventas, el listado va a mostrar esos
movimientos, pero el saldo va a seguir mostrando el acumulado completo. <strong>No es un error.</strong></p>
</blockquote>

## Filtrar los movimientos

| Filtro | Para qué sirve |
|---|---|
| **Desde** / **Hasta** | Acota el listado a un rango de fechas |
| **Restablecer** | Vuelve a los movimientos del día de hoy |

Si no hay movimientos en el rango elegido, vas a ver «No hubo movimientos de caja en el período
seleccionado.»

## Cómo leer los movimientos

| Importe | Qué significa |
|---|---|
| **Positivo** | Ingreso por una venta |
| **Negativo** | Reversión por una venta anulada |

<figure>
  <img src="img/c31-caja-reversion.png" alt="Listado de caja mostrando un movimiento negativo">
  <figcaption>Movimiento negativo generado por la anulación de una venta.</figcaption>
</figure>

La descripción te dice de qué se trata: «Venta a *cliente*» para los ingresos, «Anulación de venta a
*cliente*» para las reversiones.

> **Las anulaciones dejan dos movimientos, no cero.** Cuando se anula una venta, el ingreso original
> **se conserva** y se agrega uno negativo por el mismo importe. La suma de los dos es cero, pero
> ambos quedan a la vista.
>
> Es a propósito: así el historial muestra que hubo una venta y que después se anuló. Si el ingreso
> se borrara, esa operación desaparecería del registro sin dejar rastro.

## Ir a la venta de un movimiento

Los movimientos que vienen de una venta te permiten abrirla: hacé clic en el movimiento y el sistema
te lleva a su detalle. Sirve para saber qué se vendió, a quién y quién la registró.

## Preguntas frecuentes de este capítulo

| Duda | Respuesta |
|---|---|
| El saldo no coincide con la suma de lo que veo | El saldo es el acumulado total; el listado está filtrado por fecha. Es lo esperado |
| ¿Puedo cargar un movimiento a mano? | No. Los genera el sistema con cada venta y cada anulación |
| ¿Puedo corregir un movimiento? | No directamente. Si la venta estaba mal, anulala: la caja se ajusta sola |
| Una venta en cuenta corriente aparece como ingreso | Sí. El sistema registra todas las ventas en la caja, cualquiera sea el medio de pago |
| ¿Esta caja incluye los pagos a proveedores? | No. Solo refleja ingresos por ventas y sus reversiones |

# Reportes

Permite descargar la información de ventas en un archivo de planilla de cálculo, para analizarla
fuera del sistema.

**Acceden:** Administración y Finanzas.

## Qué necesitás saber antes

Para aprovechar el reporte conviene manejar lo básico de una planilla de cálculo: abrir un archivo,
ordenar y filtrar columnas. Si sabés usar tablas dinámicas, mejor: el reporte está pensado para eso.

## Descargar el reporte de ventas

**Paso 1.** En el menú, entrá a **Reportes**.

<figure>
  <img src="img/c32-reportes.png" alt="Pantalla de reportes con sus filtros">
  <figcaption>Pantalla de Reportes. El período viene precargado con el mes en curso.</figcaption>
</figure>

**Paso 2.** Revisá el **período**. Viene precargado desde el día 1 del mes hasta hoy. Cambialo si
necesitás otro rango.

**Paso 3.** Si querés el reporte de un cliente puntual, elegilo en **Cliente**. Si lo dejás en «Todos
los clientes», salen todas las ventas del período.

**Paso 4.** Hacé clic en **Descargar**.

El archivo se descarga como cualquier archivo del navegador. Vas a ver un aviso con la cantidad de
líneas: «Reporte generado con 184 línea(s) de venta.»

## Qué contiene el archivo

<figure>
  <img src="img/c33-planilla-generada.png" alt="Planilla generada, abierta en una hoja de cálculo">
  <figcaption>Reporte generado, abierto en una planilla de cálculo: encabezado con el período aplicado, tabla con filtro automático y bloque de totales al pie.</figcaption>
</figure>

**Arriba**, el logo, el título y las líneas de contexto: el período, el cliente filtrado, la
aclaración de que solo incluye ventas confirmadas, y la fecha y hora de generación.

**En el medio**, la tabla:

| Columna | Qué muestra |
|---|---|
| Fecha | Fecha y hora de la venta |
| Venta | Identificador abreviado |
| Cliente | Nombre del cliente |
| CUIT/Doc | Identificación tributaria |
| SKU | Código del material |
| Material | Nombre del material |
| Cantidad | Unidades vendidas en esa línea |
| Unidad | Unidad de medida |
| Precio unitario | Precio al momento de la venta |
| Total línea | Importe de la línea |
| Medio de pago | En español |
| Vendedor | Quién registró la venta |

**Abajo**, los totales: cantidad de ventas, unidades vendidas y total vendido.

## Una fila por línea, no por venta

<blockquote class="aviso">
<p><strong>Cada fila es una línea de venta, no una venta.</strong></p>
<p>Una venta con tres materiales distintos ocupa <strong>tres filas</strong>, que repiten el cliente,
la fecha y el número de venta.</p>
<p>Por eso <strong>«Cantidad de ventas» no coincide con la cantidad de filas</strong>: cuenta ventas
distintas, no líneas.</p>
<p>Es a propósito. Con este nivel de detalle podés armar el corte que necesites —por cliente, por
material, por mes, por vendedor— con una tabla dinámica, sin pedir un reporte nuevo.</p>
</blockquote>

## Solo ventas confirmadas

El reporte **no incluye las ventas anuladas**. El encabezado del archivo lo aclara, para que quien lo
reciba no tenga que suponerlo.

Es el mismo criterio de los indicadores y de la caja: una venta anulada devolvió el stock y revirtió
el dinero, así que no corresponde computarla.

## La planilla viene lista para trabajar

**El encabezado queda fijo**: al bajar por la tabla, los títulos de columna siguen visibles.

**Las columnas tienen filtro automático**: podés ordenar y filtrar desde los títulos.

**Los números son números**, no texto. Se pueden sumar y usar en tablas dinámicas sin conversiones.

## Mensajes que podés ver

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| «Reporte generado con N línea(s) de venta.» | La descarga se completó | Abrí el archivo |
| «No hay ventas confirmadas en el período. El archivo se descargó sin datos.» | No hubo ventas en ese rango | El archivo se descarga igual, con encabezado y sin filas. Ampliá el período |
| «El reporte supera las 20.000 filas. Achicá el rango de fechas.» | El período es demasiado amplio | Reducí el rango, o filtrá por un cliente |
| «La fecha "desde" no puede ser posterior a "hasta".» | El rango está invertido | Corregí las fechas |

## Preguntas frecuentes de este capítulo

| Duda | Respuesta |
|---|---|
| ¿Puedo exportar a PDF? | No. El único formato es planilla de cálculo |
| ¿El reporte incluye las ventas anuladas? | No |
| ¿Por qué hay más filas que ventas? | Cada fila es una línea de venta. Una venta con varios materiales ocupa varias filas |
| Necesito el total por cliente | Descargá el reporte y armá una tabla dinámica agrupando por Cliente |
| ¿Puedo pedir otro reporte? | Hoy hay uno solo. El sistema está preparado para incorporar otros |
| ¿Dónde quedó el archivo? | En la carpeta de descargas de tu navegador |

# Administración: usuarios, roles y auditoría

Los tres módulos de este capítulo son exclusivos del rol **Administración**.

## Usuarios

Acá se administran las cuentas de acceso al sistema.

> **Usuario no es lo mismo que empleado.** Un usuario es una cuenta para entrar al sistema. La
> fábrica tiene más empleados que usuarios: solo tienen cuenta quienes necesitan operar el sistema.

### Buscar un usuario

El listado **arranca vacío**: escribí al menos dos letras. Podés buscar por **nombre o email**.

<figure>
  <img src="img/c34-usuarios-listado.png" alt="Listado de usuarios">
  <figcaption>Listado de Usuarios con resultados de una búsqueda.</figcaption>
</figure>

### Dar de alta un usuario

**Paso 1.** Hacé clic en **Nuevo usuario**.

**Paso 2.** Completá los datos.

<figure class="media">
  <img src="img/c35-usuario-alta.png" alt="Formulario de alta de usuario">
  <figcaption>Formulario de alta de usuario, con el selector de rol desplegado.</figcaption>
</figure>

| Campo | ¿Obligatorio? | Detalle |
|---|---|---|
| **Nombre completo** | **Sí** | Nombre que se muestra en el sistema |
| **Email** | **Sí** | Con el que va a entrar. No puede repetirse |
| **Contraseña** | **Sí** | Mínimo 8 caracteres |
| **Rol** | **Sí** | Define qué va a poder hacer |

**Paso 3.** Guardá. Vas a ver «Usuario creado.»

**Paso 4.** Entregale al usuario su email y su contraseña, y pedile que la cambie en el primer
ingreso (capítulo 3).

<blockquote class="aviso">
<p><strong>El rol define todo lo que la persona puede hacer.</strong></p>
<p>Elegilo con cuidado: determina qué módulos ve en el menú y qué operaciones puede realizar.
El alcance de cada rol está en el capítulo 1.</p>
</blockquote>

### Modificar un usuario

<figure class="media">
  <img src="img/c36-usuario-edicion.png" alt="Formulario de edición de usuario con el email deshabilitado">
  <figcaption>Formulario de edición. El email aparece en gris porque no se puede modificar.</figcaption>
</figure>

Podés cambiar el **nombre** y el **rol**.

**El email no se puede modificar.** Aparece en gris, deshabilitado. Si alguien necesita otro email,
hay que dar de alta una cuenta nueva y dar de baja la anterior.

**La contraseña no se cambia desde acá.** Ni siquiera Administración puede verla o modificarla: cada
persona la cambia con el procedimiento del capítulo 3.

### Dar de baja un usuario

**Paso 1.** Buscalo y hacé clic en el botón de baja.

**Paso 2.** Confirmá. Vas a ver «Usuario dado de baja.»

A partir de ese momento **no puede entrar al sistema**. Todo lo que hizo se conserva: las ventas que
registró siguen mostrando su nombre, y sus operaciones siguen en la auditoría.

### Mensajes que podés ver

| Mensaje | Qué significa |
|---|---|
| «Usuario creado.» · «Usuario actualizado.» · «Usuario dado de baja.» | La operación se completó |
| «El email ya está registrado» | Ya existe una cuenta con ese email, activa o dada de baja |

## Roles

Es una pantalla de **consulta**: muestra los cinco roles y qué permisos tiene cada uno.

<figure>
  <img src="img/c37-roles.png" alt="Pantalla de roles con sus permisos">
  <figcaption>Pantalla de Roles: cada rol con la lista de permisos que agrupa.</figcaption>
</figure>

> **Los roles no se modifican desde el sistema.** Están definidos y no se pueden editar, ni crear
> roles nuevos. Lo que sí podés hacer es **cambiarle el rol a un usuario** desde el módulo de
> Usuarios.

Los permisos se nombran con el formato `módulo.acción`. Por ejemplo, `commercial.create` significa
«puede crear en el módulo comercial».

Algunos roles tienen permisos de módulos que todavía no están disponibles, como Producción. Están
previstos para cuando esos módulos se incorporen.

## Auditoría

Registra **quién hizo qué y cuándo** en las operaciones importantes del sistema.

<figure>
  <img src="img/c38-auditoria-listado.png" alt="Listado de auditoría con filtros">
  <figcaption>Listado de Auditoría con sus filtros: entidad, acción y rango de fechas.</figcaption>
</figure>

El listado **arranca mostrando el día de hoy**.

### Filtros

| Filtro | Para qué sirve |
|---|---|
| **Entidad** | Sobre qué se operó: Venta, Cliente, Material, Usuario |
| **Acción** | Creación, Modificación o Baja |
| **Desde** / **Hasta** | Rango de fechas |

### Ver el detalle

Hacé clic en una fila para ver qué cambió exactamente.

<figure>
  <img src="img/c39-auditoria-detalle.png" alt="Detalle de un registro de auditoría">
  <figcaption>Detalle de un registro de auditoría, con los valores anterior y posterior.</figcaption>
</figure>

El detalle muestra el **valor anterior** y el **valor posterior**. En una creación solo hay valor
posterior; en una baja, solo anterior.

> Los valores se muestran en el formato técnico en que el sistema los guarda. No es el más cómodo de
> leer, pero permite ver con precisión qué campo cambió y de qué a qué.

### Para qué sirve

| Situación | Cómo ayuda |
|---|---|
| Un precio cambió y nadie sabe quién | Filtrá por entidad Material y acción Modificación |
| Un cliente aparece dado de baja | Filtrá por entidad Cliente y acción Baja |
| Hay que reconstruir qué pasó un día | Poné el rango en esa fecha y mirá todo el movimiento |

### Qué se registra y qué no

**Se registra:** creación, modificación y baja de clientes, materiales, usuarios, categorías, ventas
y movimientos de stock. También los cambios de contraseña, sin guardar la contraseña.

**No se registra:** las consultas. Que alguien vea un listado o descargue un reporte no deja
registro.

## Preguntas frecuentes de este capítulo

| Duda | Respuesta |
|---|---|
| Necesito cambiarle el email a un usuario | No se puede. Creá una cuenta nueva y dá de baja la anterior |
| Un usuario olvidó su contraseña | Que use **¿Olvidaste tu contraseña?** en la pantalla de acceso. Vos no podés cambiársela |
| Necesito un rol con otros permisos | Los roles son fijos. Elegí el más parecido, o consultá por una modificación del sistema |
| Di de baja un usuario por error | Editalo y volvé a marcarlo como activo |
| ¿Se puede borrar un registro de auditoría? | No. La auditoría es de solo lectura |

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

<h1 class="sin-numero">Glosario</h1>

Términos que usa el sistema, explicados en lenguaje corriente.

| Término | Qué significa |
|---|---|
| **Ajuste** | Movimiento de stock que **reemplaza** la cantidad disponible por el valor que indicás. Se usa para corregir después de un recuento |
| **Anular** | Revertir una venta registrada por error. Repone el stock y descuenta el importe de la caja. No se puede deshacer |
| **Auditoría** | Registro de quién hizo qué operación y cuándo |
| **Caja de ventas** | Registro del dinero ingresado por ventas. Se alimenta sola |
| **Categoría** | Agrupación de materiales, para clasificarlos |
| **Confirmada** | Estado de una venta vigente. Descontó stock y sumó a la caja |
| **CUIT / Doc** | Identificación tributaria del cliente |
| **Dar de baja** | Desactivar un cliente, material o usuario. **No lo borra**: conserva su información y su historial |
| **Entidad** | En la pantalla de Auditoría, sobre qué se hizo la operación: una Venta, un Cliente, un Material, un Usuario |
| **Filtro** | Condición para acotar un listado: un rango de fechas, un estado, un cliente |
| **Indicador** | Cada uno de los números de la pantalla de inicio: ventas del mes, ventas de hoy, materiales activos, clientes activos |
| **Ingreso** | Movimiento de stock que **suma** la cantidad al stock actual. Se usa cuando entra mercadería |
| **Línea de venta** | Cada material dentro de una venta, con su cantidad y su precio |
| **Material** | Producto que fabrica y vende la empresa |
| **Medio de pago** | Cómo se pagó la venta: Efectivo, Transferencia, Tarjeta, Cheque o Cuenta corriente |
| **Movimiento de caja** | Cada entrada o salida de dinero de la caja. Positivo es ingreso; negativo, reversión de una anulación |
| **Movimiento de stock** | Cada cambio en la cantidad disponible de un material, con su motivo |
| **Permiso** | Autorización para una acción concreta. Los permisos se agrupan en roles |
| **Reporte** | Archivo de planilla de cálculo con información exportada del sistema |
| **Rol** | Función dentro de la empresa que determina qué puede hacer un usuario. Hay cinco: Administración, Ventas, Producción, Stock y Finanzas |
| **Saldo** | Dinero acumulado en la caja de ventas. No cambia al filtrar el listado por fecha |
| **Sesión** | Período durante el cual el sistema te mantiene identificado, sin volver a pedirte la contraseña |
| **SKU** | Código único que identifica a cada material |
| **Stock** | Cantidad disponible de un material |
| **Subtotal** | Suma de las líneas de una venta, antes de impuestos |
| **Total** | Importe final de la venta |
| **Unidad** | Cómo se cuenta un material: unidad, bolsa, metro cúbico |
| **Usuario** | Cuenta con la que una persona entra al sistema. No todos los empleados tienen usuario |
| **Vendedor** | Usuario que registró una venta |

## Tres distinciones que conviene no confundir

| No es lo mismo | Diferencia |
|---|---|
| **Ingreso** y **Ajuste** | Ingreso **suma** al stock; Ajuste lo **reemplaza**. Ver capítulo 7 |
| **Dar de baja** y **Anular** | La baja desactiva una ficha (cliente, material, usuario); la anulación revierte una venta |
| **Empleado** y **Usuario** | El empleado trabaja en la empresa; el usuario es una cuenta del sistema. No todo empleado tiene cuenta |
