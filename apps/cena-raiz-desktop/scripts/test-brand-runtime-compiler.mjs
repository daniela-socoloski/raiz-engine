// Contrato do compilador Marca Raiz -> BrandRuntimeProfile.
// Usa os três casos de referência diretamente, sem copiar fixtures.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-brand-compiler-test-'));
const esbuildBin = path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild');

function bundle(entry, output) {
  const destination = path.join(work, output);
  execFileSync(process.execPath, [
    esbuildBin,
    `./${entry}`,
    '--bundle', '--platform=node', '--format=esm', `--outfile=${destination}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });
  return pathToFileURL(destination).href;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function source(repositoryPath, role) {
  const absolute = path.join(repositoryRoot, ...repositoryPath.split('/'));
  const content = readFileSync(absolute, 'utf8');
  return {
    content,
    evidence: { path: repositoryPath, role, contentSha256: sha256(content) },
  };
}

function fingerprint(evidence) {
  const canonical = [...evidence]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((item) => `${item.path}:${item.contentSha256}`)
    .join('\n');
  return `sha256:${sha256(canonical)}`;
}

try {
  const compiler = await import(bundle(
    'packages/core/brand/compile-brand-runtime-profile.ts',
    'compiler.mjs',
  ));
  const validator = await import(bundle(
    'packages/core/brand/validate-brand-runtime-profile.ts',
    'validator.mjs',
  ));

  const methods = compiler.BRAND_RUNTIME_METHOD_SOURCE_PATHS.map((repositoryPath) =>
    source(repositoryPath, 'method'));
  const expected = {
    'gentle-monster': {
      accentColor: '#C93A2B', pace: 'slow', intensity: 'low', colorStrategy: 'campaign-variable',
    },
    lollapalooza: {
      accentColor: '#32C3E2', pace: 'fast', intensity: 'high', colorStrategy: 'edition-variable',
    },
    pleasing: {
      accentColor: '#911813', pace: 'moderate', intensity: 'medium', colorStrategy: 'fixed',
    },
  };
  const profiles = [];

  for (const [slug, expectation] of Object.entries(expected)) {
    const metadata = source(`marca-raiz-prisma/projetos/${slug}/.brand.json`, 'metadata');
    const documentPath = compiler.BRAND_DOCUMENT_FILE_CANDIDATES
      .map((name) => `marca-raiz-prisma/projetos/${slug}/resultado/${name}`)
      .find((candidate) => existsSync(path.join(repositoryRoot, ...candidate.split('/'))));
    assert.ok(documentPath, `documento editorial ausente para ${slug}`);
    const brandDocument = source(documentPath, 'brand-document');
    const evidence = [metadata.evidence, brandDocument.evidence, ...methods.map((item) => item.evidence)];
    const input = {
      metadata: JSON.parse(metadata.content),
      brandDocumentPath: documentPath,
      brandDocumentMarkdown: brandDocument.content,
      sourceEvidence: evidence,
      sourceFingerprint: fingerprint(evidence),
      compiledAt: '2026-08-20T12:00:00.000Z',
      profileVersion: 1,
    };

    const first = compiler.compileBrandRuntimeProfile(input);
    const second = compiler.compileBrandRuntimeProfile(input);
    assert.deepEqual(first, second, `${slug}: mesma evidência deve compilar igual`);

    const validation = validator.validateBrandRuntimeProfile(first);
    assert.equal(
      validation.valid,
      true,
      validation.valid ? '' : validator.formatBrandRuntimeProfileIssues(validation.issues),
    );
    assert.equal(first.brandId, slug);
    assert.equal(first.visual.accentColor, expectation.accentColor);
    assert.equal(first.visual.colorStrategy, expectation.colorStrategy);
    assert.equal(first.editorial.pace, expectation.pace);
    assert.equal(first.motion.intensity, expectation.intensity);
    assert.equal(first.approval.status, 'draft');
    assert.ok(first.verbal.toneRules.length > 0);
    assert.ok(first.visual.compositionRules.length > 0);
    assert.ok(first.motion.allowedFunctions.length > 0);
    assert.ok(first.audience.description.length > 0);
    assert.ok(first.provenance.sourceDocuments.includes(documentPath));
    profiles.push(first);
  }

  assert.equal(new Set(profiles.map((profile) => profile.visual.accentColor)).size, 3);
  assert.equal(new Set(profiles.map((profile) => profile.editorial.pace)).size, 3);

  // O nome do arquivo não controla o mapeamento. O mesmo conteúdo funciona no
  // nome preferido de projeto novo sem qualquer renomeação do caso existente.
  const gentleMetadata = source('marca-raiz-prisma/projetos/gentle-monster/.brand.json', 'metadata');
  const gentleDna = source('marca-raiz-prisma/projetos/gentle-monster/resultado/DNA.md', 'brand-document');
  const preferredPath = 'marca-raiz-prisma/projetos/gentle-monster/resultado/Marca-Raiz.md';
  const preferredEvidence = [
    gentleMetadata.evidence,
    { ...gentleDna.evidence, path: preferredPath },
    ...methods.map((item) => item.evidence),
  ];
  const preferredNameProfile = compiler.compileBrandRuntimeProfile({
    metadata: JSON.parse(gentleMetadata.content),
    brandDocumentPath: preferredPath,
    brandDocumentMarkdown: gentleDna.content,
    sourceEvidence: preferredEvidence,
    sourceFingerprint: fingerprint(preferredEvidence),
    compiledAt: '2026-08-20T12:00:00.000Z',
  });
  assert.equal(preferredNameProfile.brandId, 'gentle-monster');
  assert.ok(preferredNameProfile.provenance.sourceDocuments.includes(preferredPath));

  // Falta estrutural não vira fallback silencioso.
  assert.throws(
    () => compiler.compileBrandRuntimeProfile({
      metadata: JSON.parse(gentleMetadata.content),
      brandDocumentPath: gentleDna.evidence.path,
      brandDocumentMarkdown: gentleDna.content.replace('### 4.3 Vocabulário', 'Vocabulário sem heading'),
      sourceEvidence: [gentleMetadata.evidence, gentleDna.evidence, ...methods.map((item) => item.evidence)],
      sourceFingerprint: fingerprint([gentleMetadata.evidence, gentleDna.evidence, ...methods.map((item) => item.evidence)]),
      compiledAt: '2026-08-20T12:00:00.000Z',
    }),
    (error) => error instanceof compiler.BrandCompilationError
      && error.issues.some((issue) => issue.path.endsWith('#vocabulary')),
  );

  const malformed = structuredClone(profiles[0]);
  malformed.visual.accentColor = 'laranja';
  const refused = validator.validateBrandRuntimeProfile(malformed);
  assert.equal(refused.valid, false);
  assert.ok(refused.issues.some((issue) => issue.path === 'visual.accentColor'));

  console.log(
    'test:brand-compiler ok — 3 casos de referência distintos, determinismo, nome editorial desacoplado, falha estrutural explícita e validação de contrato.',
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
