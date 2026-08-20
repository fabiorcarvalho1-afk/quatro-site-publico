import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist-pages');

const skipNames = new Set([
  '.git',
  '.github',
  '.codex-backups',
  'dist-pages',
  'node_modules',
  'scripts',
]);
const maxAssetBytes = 25 * 1024 * 1024;

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const entries = await readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (skipNames.has(entry.name)) continue;
    const sourcePath = path.join(rootDir, entry.name);
    const targetPath = path.join(distDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryFiltered(sourcePath, targetPath);
      continue;
    }

    const sourceStat = await stat(sourcePath);
    if (sourceStat.size > maxAssetBytes) {
      console.warn(`Skipping oversized asset: ${entry.name} (${formatMiB(sourceStat.size)})`);
      continue;
    }

    await cp(sourcePath, targetPath);

    if (entry.name.endsWith('.html')) {
      await createPrettyRoute(entry.name);
    }
  }

  await createRedirects();
}

async function createPrettyRoute(htmlFilename) {
  if (htmlFilename === 'index.html') return;

  const routeName = htmlFilename.slice(0, -'.html'.length);
  const routeDir = path.join(distDir, routeName);
  await mkdir(routeDir, { recursive: true });

  const htmlSource = path.join(distDir, htmlFilename);
  const htmlContent = await readFile(htmlSource, 'utf8');
  await writeFile(path.join(routeDir, 'index.html'), htmlContent, 'utf8');
}

async function createRedirects() {
  const redirectsPath = path.join(distDir, '_redirects');
  let redirectsContent = '';

  try {
    redirectsContent = await readFile(redirectsPath, 'utf8');
  } catch {
    redirectsContent = '';
  }

  const requiredLines = [
    '/chef-profissional-setembro-2026 /chef-profissional-setembro-2026.html 200',
    '/chef-profissional /chef-profissional.html 200',
    '/confeitaria-profissional-setembro-2026 /confeitaria-profissional-setembro-2026.html 200',
    '/confeitaria-profissional /confeitaria-profissional.html 200',
  ];

  const normalized = redirectsContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of requiredLines) {
    if (!normalized.includes(line)) normalized.push(line);
  }

  await writeFile(redirectsPath, `${normalized.join('\n')}\n`, 'utf8');
}

async function copyDirectoryFiltered(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryFiltered(sourcePath, targetPath);
      continue;
    }

    const sourceStat = await stat(sourcePath);
    if (sourceStat.size > maxAssetBytes) {
      console.warn(`Skipping oversized asset: ${path.relative(rootDir, sourcePath)} (${formatMiB(sourceStat.size)})`);
      continue;
    }

    await cp(sourcePath, targetPath);
  }
}

function formatMiB(size) {
  return `${(size / (1024 * 1024)).toFixed(2)} MiB`;
}

await main();
