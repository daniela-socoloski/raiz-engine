import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(path.join(tmpdir(), 'cena-raiz-member-auth-'));

try {
  const bundlePath = path.join(work, 'member-auth-storage.mjs');
  execFileSync(process.execPath, [
    path.join(projectRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    path.join(projectRoot, 'src/security/member-auth-storage.ts'),
    '--bundle', '--platform=node', '--format=esm', `--outfile=${bundlePath}`,
  ], { stdio: 'inherit' });

  const { readStoredMemberAuth, writeStoredMemberAuth } =
    await import(pathToFileURL(bundlePath).href);
  const file = path.join(work, 'member-auth.json');
  const protector = {
    isEncryptionAvailable: () => true,
    encryptString: (value) => Buffer.from(`protected:${value}`, 'utf8'),
    decryptString: (value) => {
      const text = value.toString('utf8');
      if (!text.startsWith('protected:')) throw new Error('invalid protected value');
      return text.slice('protected:'.length);
    },
  };
  const auth = {
    refreshToken: 'refresh-secret-that-must-never-reach-json',
    email: 'member@example.com',
    name: 'Member',
    lastValidatedAt: 123,
  };

  await writeStoredMemberAuth(file, protector, auth);
  const protectedDocument = readFileSync(file, 'utf8');
  assert.ok(!protectedDocument.includes(auth.refreshToken), 'refresh token ficou em texto puro');
  assert.equal(JSON.parse(protectedDocument).version, 2);
  assert.deepEqual(await readStoredMemberAuth(file, protector), auth);

  // Migração do formato herdado: a leitura funciona e regrava imediatamente.
  writeFileSync(file, `${JSON.stringify(auth)}\n`, 'utf8');
  assert.deepEqual(await readStoredMemberAuth(file, protector), auth);
  const migrated = readFileSync(file, 'utf8');
  assert.equal(JSON.parse(migrated).version, 2);
  assert.ok(!migrated.includes(auth.refreshToken));

  // Sem DPAPI/Keychain/libsecret, a base antiga em texto puro é removida.
  writeFileSync(file, `${JSON.stringify(auth)}\n`, 'utf8');
  const unavailable = { ...protector, isEncryptionAvailable: () => false };
  assert.equal(await readStoredMemberAuth(file, unavailable), null);
  assert.equal(existsSync(file), false);
  await assert.rejects(() => writeStoredMemberAuth(file, unavailable, auth));
  assert.equal(existsSync(file), false);

  await writeStoredMemberAuth(file, protector, auth);
  await writeStoredMemberAuth(file, protector, null);
  assert.equal(existsSync(file), false, 'logout precisa remover a credencial protegida');

  console.log('test:member-auth-storage ok — token protegido, migração v1→v2, falha fechada e logout.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
