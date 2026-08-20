// Carrega signing.env e executa um comando com essas variaveis no ambiente.
//
//   node scripts/with-signing-env.mjs npm run make
//   node scripts/with-signing-env.mjs node scripts/publish-update.mjs
//
// Substitui `bash -c 'set -a && source ./signing.env && set +a && ...'`.
// O Git Bash existe na maquina, mas nao esta no PATH do PowerShell, entao os
// comandos de assinatura e publicacao falhavam antes de comecar. Em Node isso
// nao depende de qual shell chamou.
//
// signing.env guarda credenciais de assinatura: este script nunca imprime
// valor nenhum, so a quantidade e os nomes das chaves carregadas.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = process.env.CENA_RAIZ_SIGNING_ENV_FILE
  ? path.resolve(process.env.CENA_RAIZ_SIGNING_ENV_FILE)
  : path.join(desktopRoot, 'signing.env');

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Uso: node scripts/with-signing-env.mjs <comando> [argumentos...]');
  process.exit(2);
}

if (!existsSync(envPath)) {
  console.error(`signing.env nao encontrado em ${envPath}.`);
  console.error('Assinatura e publicacao exigem esse arquivo; ele nao vai para o Git de proposito.');
  process.exit(1);
}

// Formato aceito: KEY=VALUE, uma por linha. Aspas ao redor do valor sao
// removidas, `export ` no inicio e ignorado, e linhas vazias ou iniciadas por
// # sao puladas — o mesmo que `source` fazia.
function parseEnvFile(text) {
  const entries = {};
  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;

    const withoutExport = line.startsWith('export ') ? line.slice(7).trim() : line;
    const separator = withoutExport.indexOf('=');
    if (separator <= 0) {
      console.error(`signing.env linha ${index + 1}: esperava KEY=VALUE.`);
      process.exit(1);
    }

    const key = withoutExport.slice(0, separator).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/u.test(key)) {
      console.error(`signing.env linha ${index + 1}: nome de variavel invalido.`);
      process.exit(1);
    }
    let value = withoutExport.slice(separator + 1).trim();
    const quoted = value.length >= 2 && (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    );
    if (quoted) value = value.slice(1, -1);
    entries[key] = value;
  });
  return entries;
}

const loaded = parseEnvFile(readFileSync(envPath, 'utf8'));
const keys = Object.keys(loaded);
if (keys.length === 0) {
  console.error('signing.env nao definiu nenhuma variavel.');
  process.exit(1);
}

// Nomes sim, valores nunca.
console.log(`signing.env: ${keys.length} variavel(is) carregada(s) — ${keys.join(', ')}`);

// `npm` no Windows e npm.cmd, e o Node 22+ recusa spawnar .cmd sem shell.
// Usar shell resolveria, mas o cmd.exe reinterpreta aspas e parenteses dos
// argumentos — quebra silenciosa e dificil de achar. Em vez disso resolvemos o
// npm do mesmo jeito que src/runtime.ts faz: node.exe + npm-cli.js, um
// executavel de verdade. Assim nao existe shell no caminho.
function resolveCommand(name, commandArgs) {
  if (process.platform !== 'win32' || (name !== 'npm' && name !== 'npx')) {
    return [name, commandArgs];
  }
  const cli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', `${name}-cli.js`);
  if (!existsSync(cli)) {
    console.error(`Nao encontrei ${name}-cli.js ao lado de ${process.execPath}.`);
    process.exit(1);
  }
  return [process.execPath, [cli, ...commandArgs]];
}

const [executable, executableArgs] = resolveCommand(command, args);
const result = spawnSync(executable, executableArgs, {
  cwd: desktopRoot,
  stdio: 'inherit',
  env: { ...process.env, ...loaded },
});

if (result.error) {
  console.error(`Falha ao executar ${command}: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
