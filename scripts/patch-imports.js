#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');

function hasExtension(p) {
  return /\.[a-z0-9]+$/i.test(p);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full);
    else if (e.isFile() && full.endsWith('.js')) await patchFile(full);
  }
}

async function patchFile(file) {
  let src = await fs.readFile(file, 'utf8');
  // Replace import/export from '...'; only for relative paths without extensions
  src = src.replace(/(from\s+|export\s+\*\s+from\s+|export\s+\{[^}]*\}\s+from\s+)(['"])(\.{1,2}\/[^'";]+)(['"])/g, (m, p1, q1, rel, q2) => {
    if (hasExtension(rel)) return m;
    return `${p1}${q1}${rel}.js${q2}`;
  });

  // Also handle bare `export * from './client';` style without preceding keyword match (defensive)
  src = src.replace(/(['"])(\.{1,2}\/[^'";]+)(['"])/g, (m, q1, rel, q2) => {
    // skip if not a module spec in import/export by checking surrounding context is already handled
    // This second pass is conservative: only append when the string is followed/preceded by import/export keywords
    return m;
  });

  await fs.writeFile(file, src, 'utf8');
}

(async () => {
  try {
    await walk(distDir);
    console.log('Patched imports in', distDir);
  } catch (e) {
    console.error('patch-imports failed:', e);
    process.exit(1);
  }
})();
