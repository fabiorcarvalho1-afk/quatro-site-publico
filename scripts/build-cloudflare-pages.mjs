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
  }

  await removeDuplicateRouteDirectories();
  await createRedirects();
}

async function createRedirects() {
  const redirectsPath = path.join(distDir, '_redirects');
  await writeFile(redirectsPath, '', 'utf8');
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

async function removeDuplicateRouteDirectories() {
  const entries = await readdir(distDir, { withFileTypes: true });
  const htmlRouteNames = new Set(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => entry.name.slice(0, -'.html'.length))
      .filter(Boolean),
  );

  for (const routeName of htmlRouteNames) {
    const duplicatedDirectory = path.join(distDir, routeName);
    await rm(duplicatedDirectory, { recursive: true, force: true });
  }
}

await main();
