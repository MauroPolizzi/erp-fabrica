/**
 * Une los capítulos de cada documento en un único .md listo para exportar a PDF.
 *
 * La extensión de VS Code exporta un archivo por vez; sin este paso habría que
 * exportar 31 archivos y unir los PDF a mano.
 *
 * Genera, en docs/:
 *   documentacion-tecnica.md
 *   manual-usuario.md
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

  const figuras = (salida.match(/<img /g) || []).length;
  const capitulos = (salida.match(/^# /gm) || []).length;

  console.log(
    `${doc.salida.padEnd(28)} ${archivos.length} archivos · ` +
    `${capitulos} capítulos numerados · ${figuras} figuras · ` +
    `${salida.split(/\s+/).length.toLocaleString('es-AR')} palabras`,
  );
}

console.log('\nListo. Abrí cada .md en VS Code y exportá con Markdown PDF: Export (pdf).');
