import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'CentroDeHoteles';
const basePath = process.env.PAGES_BASE_PATH ?? (repo.endsWith('.github.io') ? '' : `/${repo}`);
const env = { ...process.env, GITHUB_PAGES: 'true', PAGES_BASE_PATH: basePath, SHOW_DRAFTS: 'true' };
for (const args of [['scripts/validate-data.mjs'], ['node_modules/next/dist/bin/next', 'build']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
writeFileSync('out/.nojekyll', '');
console.log(`Demo estática lista en out; ruta base: ${basePath || '/'}`);
