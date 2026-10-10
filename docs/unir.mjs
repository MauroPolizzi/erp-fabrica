/**
 * Une los capítulos de cada documento en un único .md listo para exportar a PDF.
 *
 * La extensión de VS Code exporta un archivo por vez; sin este paso habría que
 * exportar 31 archivos y unir los PDF a mano.
 *
 * Genera, en docs/:
 *   documentacion-tecnica.md    los 14 capítulos + anexos
 *   manual-usuario.md           los 12 capítulos + glosario
 *   documentacion-completa.md   ambos, para entregar como un solo archivo
 *
 * Ejecutar desde docs/:   node unir.mjs
 *
 * Los archivos generados NO se editan: se regeneran corriendo el script de nuevo
 * después de tocar cualquier capítulo.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS = dirname(fileURLToPath(import.meta.url));

const DOCUMENTOS = [
  { carpeta: 'tecnica', salida: 'documentacion-tecnica.md', titulo: 'Documentación técnica' },
  { carpeta: 'manual', salida: 'manual-usuario.md', titulo: 'Manual de usuario' },
];

/**
 * Cuenta los capítulos numerables: los `# ` de nivel 1 que no estén dentro de un
 * bloque de código. Sin el filtro, un comentario de shell como `# {"status":"ok"}`
 * se contaría como capítulo.
 */
function contarCapitulos(texto) {
  let dentroDeCodigo = false;
  let total = 0;

  for (const linea of texto.split('\n')) {
    if (linea.startsWith('```')) dentroDeCodigo = !dentroDeCodigo;
    else if (!dentroDeCodigo && linea.startsWith('# ')) total++;
  }
  return total;
}

function resumir(nombre, texto, archivos) {
  const figuras = (texto.match(/<img /g) || []).length;
  console.log(
    `${nombre.padEnd(30)} ${String(archivos).padStart(2)} archivos · ` +
    `${contarCapitulos(texto)} capítulos · ${figuras} figuras · ` +
    `${texto.split(/\s+/).length.toLocaleString('es-AR')} palabras`,
  );
}

const generados = [];

for (const doc of DOCUMENTOS) {
  const dir = join(DOCS, doc.carpeta);

  // El prefijo numérico de cada archivo define el orden de lectura.
  const archivos = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();

  const partes = archivos.map((nombre) => {
    let texto = readFileSync(join(dir, nombre), 'utf8').trimEnd();

    // El archivo unido queda en docs/, un nivel más arriba que los capítulos:
    // las rutas de imagen pierden el salto de directorio.
    texto = texto.replaceAll('../img/', 'img/');

    return texto;
  });

  const salida = partes.join('\n\n');
  writeFileSync(join(DOCS, doc.salida), salida + '\n', 'utf8');
  resumir(doc.salida, salida, archivos.length);

  generados.push({ ...doc, texto: salida, archivos: archivos.length });
}

// ── Documento combinado, para entregar como un solo archivo ──
//
// El separador reinicia la numeración de capítulos, figuras y tablas: el manual
// empieza en I y en Fig. 1, igual que leído por separado. Ver `.nueva-parte` en
// estilo-ieee.css. Cada parte conserva su portada, que oficia de carátula.
const SEPARADOR = '<div class="nueva-parte"></div>';

const completo = [generados[0].texto, SEPARADOR, generados[1].texto].join('\n\n');
const archivosTotales = generados.reduce((n, d) => n + d.archivos, 0);

writeFileSync(join(DOCS, 'documentacion-completa.md'), completo + '\n', 'utf8');
resumir('documentacion-completa.md', completo, archivosTotales);

console.log('\nListo. Abrí el .md en VS Code y exportá con Markdown PDF: Export (pdf).');
console.log('Para entregar un solo archivo:  documentacion-completa.md');
