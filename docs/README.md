# `docs/` — Documentación de PerliNor ERP

Fuentes en Markdown de los dos documentos de la Práctica Profesional Supervisada, con la hoja de
estilos para exportarlos a PDF con formato IEEE (decisión **D6 = H2**).

---

## 1. Estructura

```
docs/
├── README.md            ← este archivo: estructura y cómo generar el PDF
├── GLOSARIO.md          ← vocabulario canónico. NORMATIVO: leer antes de escribir
├── estilo-ieee.css      ← hoja de estilos de impresión
├── img/                 ← logos y recursos compartidos
├── tecnica/             ← documentación técnica (15 capítulos + anexos)
│   ├── 00-portada.md
│   ├── 01-introduccion.md
│   └── …
└── manual/              ← manual de usuario (12 capítulos)
    ├── 00-portada.md
    └── …
```

Un archivo por capítulo, con prefijo numérico para que el orden alfabético sea el orden de lectura.
El índice de capítulos está en `GUIA_MAESTRA_DOCUMENTACION.md` §7 (técnica) y §9 (manual).

---

## 2. Decisión de formato

**Columna simple.** La plantilla de conferencia IEEE es a dos columnas, pero está pensada para
artículos breves sin material gráfico. Este informe lleva 39 capturas y tablas de hasta 12 columnas:
a dos columnas quedarían ilegibles.

Se conservan las convenciones IEEE que sí aportan a un informe de PPS:

| Convención | Aplicación |
|---|---|
| Numeración de secciones | `I.`, `II.`, `III.` (romanos) para capítulos; `A.`, `B.` para subsecciones; `1)`, `2)` para el tercer nivel |
| Tablas | Título **encima**, centrado, en versales, numeración romana: `TABLA I` |
| Figuras | Epígrafe **debajo**, centrado: `Fig. 1.` |
| Referencias | Numeradas entre corchetes `[1]`, citadas en el texto como `[1]` |
| Tipografía | Times New Roman 11 pt, texto justificado |

`estilo-ieee.css` trae al final un bloque comentado para pasar a dos columnas, por si la cátedra lo
exigiera. **Verificar el requisito antes de escribir**: cambiarlo al final obliga a revisar cada
tabla y cada figura.

---

## 3. Cómo generar el PDF

**En este equipo no hay ninguna herramienta de conversión instalada** (ni Pandoc, ni LaTeX, ni
Typst). Las tres opciones siguientes están ordenadas por fricción de instalación.

### Paso previo — unir los capítulos

La extensión exporta **un archivo por vez**. Sin este paso habría que exportar 31 archivos y unir
los PDF a mano.

```bash
cd docs
node unir.mjs
```

Genera `documentacion-tecnica.md` y `manual-usuario.md` en `docs/`, con los capítulos en orden y
las rutas de imagen corregidas al nuevo nivel de directorio.

> **Los archivos unidos no se editan.** Se corrige el capítulo correspondiente en `tecnica/` o
> `manual/` y se vuelve a correr el script.

### Opción A — Extensión de VS Code *(recomendada)*

No requiere instalar nada en el sistema: la extensión trae su propio Chromium.

1. Instalar la extensión **Markdown PDF** (`yzane.markdown-pdf`).
2. Agregar a `.vscode/settings.json`:

```json
{
  "markdown-pdf.styles": ["docs/estilo-ieee.css"],
  "markdown-pdf.includeDefaultStyles": false,
  "markdown-pdf.format": "A4",
  "markdown-pdf.margin.top": "2.5cm",
  "markdown-pdf.margin.bottom": "2.5cm",
  "markdown-pdf.margin.left": "2cm",
  "markdown-pdf.margin.right": "2cm",
  "markdown-pdf.displayHeaderFooter": true,
  "markdown-pdf.headerTemplate": "<div></div>",
  "markdown-pdf.footerTemplate": "<div style='font-family:Times New Roman,serif; font-size:9pt; width:100%; text-align:center;'><span class='pageNumber'></span></div>"
}
```

3. Abrir el `.md`, `Ctrl+Shift+P` → **Markdown PDF: Export (pdf)**.

> **Advertencia.** La extensión aplica sus propios márgenes y **ignora la regla `@page`** del CSS:
> por eso los márgenes van en la configuración de arriba y no en la hoja de estilos.

Con el paso previo hecho, son **dos exportaciones**: `documentacion-tecnica.md` y
`manual-usuario.md`.

### Opción B — Pandoc

Requiere instalar Pandoc (~30 MB, sin LaTeX si la salida intermedia es HTML).

```bash
# Un PDF por documento, concatenando los capítulos en orden
pandoc docs/tecnica/*.md -o documentacion-tecnica.html \
  --standalone --css=docs/estilo-ieee.css --embed-resources --toc --toc-depth=2
```

Luego se abre el HTML en el navegador y se imprime a PDF (`Ctrl+P` → *Guardar como PDF*, con
«Gráficos de fondo» activado).

### Opción C — Navegador, sin instalar nada

Cualquier visor de Markdown que permita adjuntar un CSS sirve para generar el HTML; después,
`Ctrl+P` → *Guardar como PDF*. Es la vía de escape si las dos anteriores fallan.

---

## 4. Orden de concatenación

Al unir los capítulos en un solo documento, este es el orden. La portada va primero y **no lleva
numeración**; el índice tampoco.

### Documentación técnica

| # | Archivo | Título |
|---|---|---|
| — | `00-portada.md` | *(sin numerar)* |
| — | `00b-indice.md` | *(sin numerar)* |
| I | `01-introduccion.md` | Introducción y contexto del proyecto |
| II | `02-metodologia.md` | Metodología y proceso de desarrollo |
| III | `03-requerimientos.md` | Requerimientos |
| IV | `04-arquitectura.md` | Arquitectura del sistema |
| V | `05-modelo-datos.md` | Modelo de datos |
| VI | `06-seguridad.md` | Seguridad |
| VII | `07-backend.md` | Implementación del backend |
| VIII | `08-nucleo-transaccional.md` | Venta y anulación |
| IX | `09-reporteria.md` | Reportería |
| X | `10-frontend.md` | Implementación del frontend |
| XI | `11-api.md` | API REST |
| XII | `12-calidad.md` | Calidad y pruebas |
| XIII | `13-instalacion.md` | Instalación, configuración y ejecución |
| XIV | `14-limitaciones.md` | Limitaciones conocidas y trabajo futuro |
| — | `90-anexos.md` | Anexos |

> El capítulo de despliegue **no existe** (decisión D4 = E1), por eso «Limitaciones» es el XIV y no
> el XV. La numeración del `GUIA_MAESTRA_DOCUMENTACION.md` §7 conserva el hueco por trazabilidad.

---

## 5. Convenciones de escritura

`GLOSARIO.md` es **normativo**: fija el término único de cada concepto, los términos prohibidos y
los formatos de moneda, fecha y cantidad. Hay que leerlo antes de escribir cualquier capítulo.

### Figuras

Markdown puro no permite epígrafes. Se escriben con HTML, que todos los conversores respetan:

```html
<figure>
  <img src="../img/c23-nueva-venta.png" alt="Formulario de nueva venta">
  <figcaption>Formulario de registro de venta, con dos líneas cargadas.</figcaption>
</figure>
```

El `Fig. N.` lo agrega el CSS automáticamente: **no escribirlo a mano**.
Para capturas angostas (diálogos, formularios cortos), usar `<figure class="media">`.

### Tablas

Las tablas de Markdown funcionan, pero **no admiten título**. Cuando la tabla necesite epígrafe
IEEE, escribirla en HTML con `<caption>`; el `TABLA N` lo agrega el CSS.
Para tablas de muchas columnas, agregar `class="compacta"`.

### Recuadros de advertencia

Para las tres advertencias críticas del manual —Ingreso vs. Ajuste, saldo vs. filtro de fechas, e
irreversibilidad de la anulación— usar:

```html
<blockquote class="aviso">
  <p><strong>Atención.</strong> …</p>
</blockquote>
```

---

## 6. Estado

| Pieza | Estado |
|---|---|
| `GLOSARIO.md` | ✅ Completo |
| `estilo-ieee.css` | ✅ Completo |
| `tecnica/00-portada.md` | ✅ Completa |
| `tecnica/00b-indice.md` | ✅ Completo — faltan los números de página |
| I — `01-introduccion.md` | ✅ Completo |
| II — `02-metodologia.md` | ✅ Completo |
| III — `03-requerimientos.md` | ✅ Completo |
| IV — `04-arquitectura.md` | ✅ Completo |
| V — `05-modelo-datos.md` | ✅ Completo |
| VI — `06-seguridad.md` | ✅ Completo |
| VII — `07-backend.md` | ✅ Completo |
| VIII — `08-nucleo-transaccional.md` | ✅ Completo |
| IX — `09-reporteria.md` | ✅ Completo |
| X — `10-frontend.md` | ✅ Completo |
| XI — `11-api.md` | ✅ Completo |
| XII — `12-calidad.md` | ✅ Completo |
| XIII — `13-instalacion.md` | ✅ Completo |
| XIV — `14-limitaciones.md` | ✅ Completo |
| `90-anexos.md` | ✅ Completo — A, B, C y D |

### Manual de usuario

| Pieza | Estado |
|---|---|
| `manual/00-portada.md` · `00b-indice.md` | ✅ Completos |
| I — `01-presentacion.md` | ✅ Completo |
| II — `02-acceso.md` | ✅ Completo |
| III — `03-recuperar-contrasena.md` | ✅ Completo |
| IV — `04-interfaz.md` | ✅ Completo |
| V — `05-inicio.md` | ✅ Completo |
| VI — `06-clientes.md` | ✅ Completo |
| VII — `07-materiales.md` | ✅ Completo |
| VIII — `08-ventas.md` | ✅ Completo |
| IX — `09-caja.md` | ✅ Completo |
| X — `10-reportes.md` | ✅ Completo |
| XI — `11-administracion.md` | ✅ Completo |
| XII — `12-preguntas-frecuentes.md` | ✅ Completo |
| `90-glosario.md` | ✅ Completo |

**Ambos documentos completos**, con su material gráfico. Resta exportar a PDF y numerar los índices.

### Orden de concatenación del manual

Portada · Índice · I a XII en orden numérico · Glosario.
La portada, el índice y el glosario están marcados `sin-numero`.

### Material gráfico

| Figura | Estado |
|---|---|
| `fig-arquitectura-general.svg` — Cap. IV | ✅ Hecha |
| `fig-der-completo.svg` — Cap. V | ✅ Hecha |
| `fig-secuencia-venta.svg` — Cap. VIII | ✅ Hecha |
| `fig01-planillas-actuales.png` — Cap. I | ✅ Hecha |
| 39 capturas del manual | ✅ Hechas — ver [`CAPTURAS.md`](CAPTURAS.md) |

Los tres diagramas son **SVG escritos a mano**: se incrustan directo en el HTML, escalan sin
pérdida al imprimir y no dependen de ninguna herramienta externa. Para modificarlos se editan como
texto.

---

## 7. Revisión de cierre

Auditoría corrida sobre los dos documentos el 13/09/2026.

| Verificación | Resultado |
|---|---|
| Referencias a capítulos (I–XIV) | ✅ Todas dentro de rango |
| Referencias a anexos (A–D) | ✅ Los cuatro existen |
| Credenciales del seed en el texto | ✅ Ninguna |
| Rutas locales del equipo | ✅ Ninguna |
| Secretos y contraseñas de infraestructura | ✅ Ninguno |
| Endpoints listados en el Cap. XI | ✅ 40, coincide con el texto |
| Capítulos numerables | ✅ 14 en la técnica, 12 en el manual |
| Encabezados `sin-numero` | ✅ 7 (2 índices + 4 anexos + 1 glosario) |
| Términos técnicos en el manual | ✅ Solo «Entidad», que es el rótulo literal de la pantalla de Auditoría |
| Conteos (22 entidades, 15/7, 41 permisos, 38/26 casos) | ✅ Consistentes entre capítulos |

### Pendiente para el cierre

| # | Tarea | Estado |
|---|---|---|
| 1 | Datos de demostración | Se conservan los datos de desarrollo — decisión del autor, 14/09 |
| 2 | Las 39 capturas y la Fig. 1 | ✅ Hechas |
| 3 | Unir los capítulos (`node unir.mjs`) | ✅ Hecho |
| 4 | Exportar los dos PDF | ⏳ |
| 5 | Revisar dónde cayeron los números de C-08 y C-09 | ⏳ Depende de 4 |
| 6 | Completar los números de página en los dos índices | ⏳ Depende de 4 |
| 7 | Verificar que ningún PDF muestre imágenes rotas | ⏳ Depende de 4 |
