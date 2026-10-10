# Guía de captura — manual de usuario

Lista de trabajo para tomar las 39 capturas del manual. Cada archivo va en `docs/img/` con el nombre
exacto que figura acá: los capítulos ya los referencian.

> **Sobre la numeración.** Los códigos `C-xx` son identificadores de trabajo, no el número de figura.
> El `Fig. N` lo asigna la hoja de estilos según el orden de aparición en el documento. Por eso
> `c29` aparece antes que `c27` y `c28` en el capítulo de Ventas: no es un error.

---

## Antes de empezar

1. **Levantar el sistema** con los datos de demostración cargados
   (`GUIA_MAESTRA_DOCUMENTACION.md` §16.bis).
2. **Fijar el ancho de la ventana** y no cambiarlo en toda la sesión. Recomendado: 1440 px.
3. **Iniciar sesión como Administración**, salvo donde se indique otro rol.
4. Ocultar barras de marcadores y extensiones del navegador.

<blockquote class="aviso">
<p><strong>Tres reglas que no se negocian.</strong></p>
<ol>
<li><strong>Nunca capturar la pantalla de acceso tal como carga.</strong> El formulario viene con
credenciales precargadas. Borrá los dos campos a mano y escribí un email ficticio antes de capturar
C-02 y C-03.</li>
<li><strong>Datos ficticios únicamente.</strong> Los del juego de demostración. Nada de clientes,
CUIT ni importes reales de PerliNor.</li>
<li><strong>Nada de rutas locales.</strong> Que no se vea la barra de direcciones con rutas del
equipo, ni ventanas de terminal.</li>
</ol>
</blockquote>

---

## Capítulo 1 — Presentación

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-01 | `c01-inicio-menu.png` | Ingresar como Administración | Pantalla de inicio completa, con el menú lateral desplegado y sus nueve opciones |

## Capítulo 2 — Acceso

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-02 | `c02-login.png` | `/login`, **con los campos vaciados a mano** | Formulario limpio o con un email ficticio. Contraseña enmascarada |
| C-03 | `c03-login-error.png` | Intentar ingresar con una contraseña incorrecta | El mensaje «Email o contraseña incorrectos.» visible |

## Capítulo 3 — Recuperación de contraseña

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-04 | `c04-olvide-contrasena.png` | «¿Olvidaste tu contraseña?» | Formulario con el campo de email |
| C-05 | `c05-confirmacion-envio.png` | Enviar el formulario anterior | El aviso genérico completo, legible |
| C-06 | `c06-contrasena-nueva.png` | Abrir el enlace desde la bandeja de Mailpit (`localhost:8025`) | Los dos campos de contraseña. **Que no se vea el token en la barra de direcciones** |
| C-07 | `c07-enlace-invalido.png` | Abrir `/reset-password?token=invalido` | El mensaje de enlace inválido |

## Capítulo 4 — Interfaz

> **Las cuatro son capturas normales. No hay que editar ninguna imagen.**
> En C-08 y C-09 los números los dibuja la hoja de estilos encima de la captura; sólo hay que
> encuadrar bien la pantalla.

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-08 | `c08-layout.png` | Pantalla de inicio, con el menú **desplegado** | **La ventana completa**: menú lateral, barra superior con el email, y el área de contenido con datos |
| C-09 | `c09-grilla.png` | Listado de Materiales, buscando «la» | **La grilla entera**: buscador arriba, encabezados, filas con sus botones de acción a la derecha y **el paginador al pie** |
| C-10 | `c10-aviso-exito.png` | Guardar cualquier registro | El aviso verde, recortado a la esquina superior derecha |
| C-11 | `c11-dialogo-confirmacion.png` | Dar de baja un cliente, **sin aceptar** | El diálogo con su texto y los dos botones |

### Encuadre de C-08 y C-09

Los números se posicionan por porcentaje sobre la imagen, así que el encuadre importa más que de
costumbre:

| Captura | Requisito de encuadre |
|---|---|
| **C-08** | Que entren las **tres zonas**: menú a la izquierda, barra superior arriba y contenido al centro. Si recortás el menú, el número 1 queda flotando |
| **C-09** | Que entre el **paginador**. Buscá un término con suficientes resultados para que aparezca; si la búsqueda devuelve tres filas, no hay paginador y el número 4 apunta al vacío |

Después de exportar el PDF, mirá dónde cayeron los círculos. Si alguno tapa algo importante o quedó
corrido, se ajusta el porcentaje en `manual/04-interfaz.md` —están comentados en el propio archivo—
y se vuelve a exportar. No hace falta rehacer la captura.

### C-10: el aviso dura pocos segundos

El aviso verde se desvanece solo. Lo más simple es capturar la ventana completa apenas guardás y
recortar después. Si se te escapa, repetí la operación: aparece de nuevo.

## Capítulo 5 — Pantalla de inicio

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-12 | `c12-panel-inicio.png` | `/dashboard` | Los cuatro indicadores con datos, principales clientes y stock bajo. **Que «Vigueta pretensada» aparezca en stock bajo** |
| C-13 | `c13-grafico-tooltip.png` | Mismo panel, apoyar el puntero sobre una barra | El selector Día/Semana/Mes y el tooltip abierto con importe y cantidad |

## Capítulo 6 — Clientes

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-14 | `c14-clientes-inicial.png` | Entrar a Clientes, **sin escribir nada** | El mensaje «Ingresá al menos 2 caracteres para buscar.» |
| C-15 | `c15-clientes-resultados.png` | Buscar «co» | Dos o más clientes con sus columnas y acciones |
| C-16 | `c16-cliente-alta.png` | «Nuevo cliente», formulario cargado sin guardar | Todos los campos completos |
| C-17 | `c17-cliente-baja.png` | Baja de un cliente, sin aceptar | El diálogo con el nombre del cliente en el texto |

## Capítulo 7 — Materiales y stock

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-18 | `c18-materiales-listado.png` | Buscar «la» en Materiales | Varios materiales. **Columnas Precio y Stock con valores** |
| C-19 | `c19-material-alta.png` | «Nuevo material», cargado sin guardar | SKU, nombre, categoría, unidad y precio completos |
| C-20 | `c20-categoria-nueva.png` | Botón de agregar categoría, desde el formulario anterior | El diálogo **sobre** el formulario, que se vea que no lo abandonás |
| C-21 | `c21-movimiento-stock.png` | Botón de stock de un material | **El selector Ingreso/Ajuste bien visible**, cantidad y referencia cargadas |
| C-22 | `c22-materiales-post-movimiento.png` | El listado, después de guardar el movimiento | El mismo material con el stock ya actualizado |

> C-21 es la captura más importante del manual: ilustra la distinción entre Ingreso y Ajuste. Que el
> selector se lea con claridad.

## Capítulo 8 — Ventas

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-23 | `c23-venta-nueva-vacia.png` | «Nueva venta» | Cliente, medio de pago y la primera línea vacía |
| C-24 | `c24-venta-nueva-cargada.png` | Cargar dos líneas con materiales distintos | Las dos líneas con precio unitario y total calculados, y el total al pie |
| C-25 | `c25-venta-stock-insuficiente.png` | Vender 20 unidades de `VIG-300` (stock 8) y registrar | **El aviso rojo completo**, con disponible y requerido |
| C-26 | `c26-venta-detalle-confirmada.png` | Registrar una venta válida | Detalle con cabecera, líneas, estado Confirmada y el botón Anular disponible |
| C-29 | `c29-ventas-listado-filtrado.png` | Listado de Ventas, ampliando el rango de fechas | Los filtros con valores y varias ventas listadas |
| C-27 | `c27-venta-confirmar-anulacion.png` | «Anular» en el detalle, sin aceptar | El diálogo con el texto «Se repondrá el stock…» |
| C-28 | `c28-venta-detalle-anulada.png` | Aceptar la anulación | Estado Anulada y el botón Anular ya no disponible |

> Para C-25, el juego de datos deja `VIG-300` con stock 8 justamente para poder provocar este error.

## Capítulo 9 — Caja de ventas

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-30 | `c30-caja-ventas.png` | `/finance/sales-cash` | La tarjeta de saldo **y** el listado de movimientos del día |
| C-31 | `c31-caja-reversion.png` | Mismo listado, tras anular una venta | Un movimiento con **importe negativo** y la descripción «Anulación de venta a…» |

## Capítulo 10 — Reportes

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-32 | `c32-reportes.png` | `/reports` | Los filtros de período y cliente, y el botón de descarga |
| C-33 | `c33-planilla-generada.png` | Abrir el archivo descargado | **Logo, encabezado con el período, filtro automático y bloque de totales.** Es la captura que muestra el producto final |

## Capítulo 11 — Administración

| ID | Archivo | Cómo llegar | Qué debe verse |
|---|---|---|---|
| C-34 | `c34-usuarios-listado.png` | Buscar «usuario» en Usuarios | Varios usuarios con su rol y estado |
| C-35 | `c35-usuario-alta.png` | «Nuevo usuario» | **El selector de rol desplegado**, con los cinco roles |
| C-36 | `c36-usuario-edicion.png` | Editar un usuario | **El campo de email en gris**, deshabilitado |
| C-37 | `c37-roles.png` | `/roles` | Los cinco roles con sus listas de permisos |
| C-38 | `c38-auditoria-listado.png` | `/audit`, ampliando el rango | Los filtros y varios registros |
| C-39 | `c39-auditoria-detalle.png` | Clic en un registro de modificación | El detalle con valor anterior **y** posterior |

> C-39 conviene tomarla sobre una **modificación**, no sobre una creación: es la única que muestra
> los dos valores y hace evidente para qué sirve la pantalla.

---

## Al terminar

| Verificación | |
|---|---|
| Los 39 archivos están en `docs/img/` con el nombre exacto | ☐ |
| Ninguna muestra credenciales reales ni precargadas | ☐ |
| Ninguna muestra datos reales de PerliNor | ☐ |
| Ninguna muestra rutas locales ni terminales | ☐ |
| Todas tomadas al mismo ancho de ventana | ☐ |
| C-08 y C-09 tienen sus números anotados | ☐ |
| El manual exportado no muestra íconos de imagen rota | ☐ |
