import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-creative-brief-test-'));

try {
  const output = path.join(work, 'validator.mjs');
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    './packages/core/production/validate-creative-brief.ts',
    '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });
  const { validateCreativeBrief } = await import(pathToFileURL(output).href);

  const base = {
    schemaVersion: '1.0', productionId: 'prod-1', version: 1, status: 'ready',
    brandId: 'pleasing', intent: { objective: 'lançar a coleção' },
    provenance: { origin: 'conversation', createdAt: '2026-08-20T12:00:00.000Z' },
  };
  const cases = [
    { ...base, productionKind: 'video', delivery: { channel: 'reels', aspectRatio: '9:16', targetDurationSeconds: 30, minDurationSeconds: 15, maxDurationSeconds: 60 } },
    { ...base, productionKind: 'image', delivery: { channel: 'instagram-feed', aspectRatio: '4:5', width: 1080, height: 1350 } },
    { ...base, productionKind: 'carousel', delivery: { channel: 'instagram-feed', aspectRatio: '4:5', minCards: 5, maxCards: 8 } },
    { ...base, productionKind: 'campaign', delivery: { channels: ['reels', 'email'], deliverables: ['filme principal', 'email de lançamento'] } },
  ];
  for (const brief of cases) {
    const result = validateCreativeBrief(brief);
    assert.equal(result.valid, true, result.valid ? '' : JSON.stringify(result.issues));
  }

  const invalid = structuredClone(cases[0]);
  invalid.delivery.targetDurationSeconds = 90;
  invalid.sourceMaterial = [{ path: 'C:\\segredo.mp4', mustUse: true, doNotUse: true }];
  const refused = validateCreativeBrief(invalid);
  assert.equal(refused.valid, false);
  assert.ok(refused.issues.some((issue) => issue.path === 'delivery.targetDurationSeconds'));
  assert.ok(refused.issues.some((issue) => issue.path === 'sourceMaterial[0].path'));
  assert.ok(refused.issues.some((issue) => issue.path === 'sourceMaterial[0]'));

  assert.equal(validateCreativeBrief(null).valid, false);
  console.log('test:creative-brief ok — contrato único validado para vídeo, imagem, carrossel e campanha; duração, paths e conflitos recusados.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
