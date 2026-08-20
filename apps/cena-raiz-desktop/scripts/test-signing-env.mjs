import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wrapper = path.join(projectRoot, 'scripts', 'with-signing-env.mjs');
const work = mkdtempSync(path.join(tmpdir(), 'cena-raiz-signing-env-'));
const envFile = path.join(work, 'test.env');

try {
  const dummySecret = 'dummy value with spaces and # punctuation';
  writeFileSync(envFile, `CENA_RAIZ_DUMMY_SECRET="${dummySecret}"\n`, 'utf8');
  const childProgram = [
    "if (process.env.CENA_RAIZ_DUMMY_SECRET !== 'dummy value with spaces and # punctuation') process.exit(7)",
  ].join(';');
  const result = spawnSync(process.execPath, [wrapper, process.execPath, '-e', childProgram], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, CENA_RAIZ_SIGNING_ENV_FILE: envFile },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('CENA_RAIZ_DUMMY_SECRET'), 'nome da chave deve ser auditavel');
  assert.ok(!result.stdout.includes(dummySecret), 'valor da credencial nunca pode chegar ao log');
  assert.ok(!result.stderr.includes(dummySecret), 'valor da credencial nunca pode chegar ao erro');

  writeFileSync(envFile, 'invalid-key=value\n', 'utf8');
  const invalid = spawnSync(process.execPath, [wrapper, process.execPath, '-e', ''], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, CENA_RAIZ_SIGNING_ENV_FILE: envFile },
  });
  assert.equal(invalid.status, 1);
  assert.ok(invalid.stderr.includes('nome de variavel invalido'));

  console.log('test:signing-env ok — Windows sem Bash, valores redigidos e chaves validadas.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
