// Builds the self-contained creator profile. The first distributable installer
// intentionally bundles every runtime so it can be validated before an owned
// runtime/update channel exists.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prepared = process.argv.includes('--prepared');

function npmCommand(args) {
  if (process.platform !== 'win32') return ['npm', args];
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (!existsSync(npmCli)) throw new Error(`npm-cli.js nao encontrado ao lado de ${process.execPath}`);
  return [process.execPath, [npmCli, ...args]];
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const buildScript = prepared ? 'make:prepared' : 'make';
console.log(`Perfil creator: build ${prepared ? 'com runtimes ja preparados' : 'completo'}.`);
const [npm, npmArgs] = npmCommand(['run', buildScript]);
run(npm, npmArgs, { ...process.env, CENA_RAIZ_BUNDLE_RUNTIMES: '1' });
run(process.execPath, [path.join(projectRoot, 'scripts', 'verify-creator-build.mjs')]);
