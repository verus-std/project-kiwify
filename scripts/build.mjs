import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = join(projectRoot, 'dist');
const assetsDirectory = join(outputDirectory, 'assets');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all([
  cp(join(projectRoot, 'assets'), assetsDirectory, { recursive: true }),
  cp(join(projectRoot, 'styles.css'), join(outputDirectory, 'styles.css')),
  cp(join(projectRoot, 'script.js'), join(outputDirectory, 'script.js')),
]);

await mkdir(join(assetsDirectory, 'vendor'), { recursive: true });
await cp(
  join(projectRoot, 'node_modules', 'lenis', 'dist', 'lenis.min.js'),
  join(assetsDirectory, 'vendor', 'lenis.min.js'),
);

const sourceHtml = await readFile(join(projectRoot, 'index.html'), 'utf8');
const productionHtml = sourceHtml.replace(
  'node_modules/lenis/dist/lenis.min.js',
  'assets/vendor/lenis.min.js',
);

await writeFile(join(outputDirectory, 'index.html'), productionHtml);

const localReferences = new Set();
const htmlReferencePattern = /(?:src|href)="([^"]+)"/g;
const cssReferencePattern = /url\(["']?([^"')]+)["']?\)/g;

for (const match of productionHtml.matchAll(htmlReferencePattern)) {
  localReferences.add(match[1]);
}

const stylesheet = await readFile(join(outputDirectory, 'styles.css'), 'utf8');

for (const match of stylesheet.matchAll(cssReferencePattern)) {
  localReferences.add(match[1]);
}

const missingReferences = [];

for (const reference of localReferences) {
  if (/^(?:https?:|mailto:|tel:|#|data:)/.test(reference)) continue;

  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference || !/\.[a-z0-9]{2,5}$/i.test(cleanReference)) continue;

  try {
    await access(join(outputDirectory, cleanReference));
  } catch {
    missingReferences.push(cleanReference);
  }
}

if (missingReferences.length) {
  throw new Error(`Build interrompido. Arquivos ausentes: ${missingReferences.join(', ')}`);
}

console.log(`Build concluído em dist/ com ${localReferences.size} referências verificadas.`);
