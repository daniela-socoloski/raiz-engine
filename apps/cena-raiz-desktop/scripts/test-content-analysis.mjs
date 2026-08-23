import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-content-analysis-test-'));

const bundle = (entry, name) => {
  const output = path.join(work, name);
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    entry, '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });
  return pathToFileURL(output).href;
};

const sha = (value) => createHash('sha256').update(value).digest('hex');

try {
  const { validateContentAnalysis } = await import(
    bundle('./packages/core/production/validate-content-analysis.ts', 'validator.mjs'));
  const { combineFingerprints, decideContentAnalysisCache, pruneStaleEvidence } = await import(
    bundle('./packages/core/production/content-analysis-cache.ts', 'cache.mjs'));

  const fpA = sha('a');
  const fpB = sha('b');

  const valid = {
    schemaVersion: '1.0',
    productionId: 'prod-1',
    version: 1,
    status: 'complete',
    sources: [
      { sourceId: 'take-1', path: 'brutos/take-1.mp4', kind: 'video', fingerprint: fpA, durationSeconds: 42 },
      { sourceId: 'take-2', path: 'brutos/take-2.mp4', kind: 'video', fingerprint: fpB },
    ],
    facts: [
      { factId: 'f1', kind: 'silence', statement: '12s de silêncio no início', sourceId: 'take-1', range: { startSeconds: 0, endSeconds: 12 }, basis: 'observed' },
      { factId: 'f2', kind: 'topic', statement: 'fala sobre a coleção nova', sourceId: 'take-2', basis: 'model', confidence: 0.82 },
    ],
    transcript: {
      analyzer: 'whisperx', analyzerVersion: '3.8.6', dominantLanguage: 'pt',
      segments: [{ sourceId: 'take-1', startSeconds: 12, endSeconds: 15.5, text: 'olha isso aqui', confidence: 0.94 }],
    },
    gaps: [{ kind: 'missing-coverage', statement: 'não há plano do produto fechado' }],
    risks: [{ kind: 'trademark-visible', statement: 'logo de terceiro no fundo', sourceId: 'take-2' }],
    unknowns: [],
    provenance: { analyzedAt: '2026-08-20T12:00:00.000Z', analyzerVersion: 'raiz-analyzer/1.0.0', combinedFingerprint: sha('combo') },
  };

  assert.equal(validateContentAnalysis(valid).valid, true,
    JSON.stringify(validateContentAnalysis(valid).issues ?? []));

  // --- fronteira: evidência não pode virar direção sem confiança declarada
  const noConfidence = structuredClone(valid);
  delete noConfidence.facts[1].confidence;
  const refusedConfidence = validateContentAnalysis(noConfidence);
  assert.equal(refusedConfidence.valid, false);
  assert.ok(refusedConfidence.issues.some((i) => i.path === 'facts[1].confidence'));

  // --- referência a fonte inexistente
  const ghostSource = structuredClone(valid);
  ghostSource.facts[0].sourceId = 'take-9';
  const refusedGhost = validateContentAnalysis(ghostSource);
  assert.equal(refusedGhost.valid, false);
  assert.ok(refusedGhost.issues.some((i) => i.path === 'facts[0].sourceId'));

  // --- intervalo invertido e caminho absoluto de máquina
  const badShape = structuredClone(valid);
  badShape.facts[0].range = { startSeconds: 10, endSeconds: 4 };
  badShape.sources[0].path = 'C:\\Users\\RAIZ\\take.mp4';
  const refusedShape = validateContentAnalysis(badShape);
  assert.equal(refusedShape.valid, false);
  assert.ok(refusedShape.issues.some((i) => i.path === 'facts[0].range'));
  assert.ok(refusedShape.issues.some((i) => i.path === 'sources[0].path'));

  // --- "complete" com pergunta em aberto é contradição
  const contradictory = structuredClone(valid);
  contradictory.unknowns = [{ question: 'quem é a pessoa em take-2?', reason: 'rosto parcialmente coberto' }];
  const refusedStatus = validateContentAnalysis(contradictory);
  assert.equal(refusedStatus.valid, false);
  assert.ok(refusedStatus.issues.some((i) => i.path === 'status'));

  // --- unknown sem motivo não é auditável
  const vagueUnknown = structuredClone(valid);
  vagueUnknown.status = 'partial';
  vagueUnknown.unknowns = [{ question: 'qual o produto?' }];
  assert.equal(validateContentAnalysis(vagueUnknown).valid, false);

  assert.equal(validateContentAnalysis(null).valid, false);

  // --- cache: ordem das fontes não pode mudar a identidade
  const ordered = combineFingerprints([{ sourceId: 'a', fingerprint: fpA }, { sourceId: 'b', fingerprint: fpB }], sha);
  const shuffled = combineFingerprints([{ sourceId: 'b', fingerprint: fpB }, { sourceId: 'a', fingerprint: fpA }], sha);
  assert.equal(ordered, shuffled, 'fingerprint combinado deve ser estável por ordem');

  const current = [{ sourceId: 'take-1', fingerprint: fpA }, { sourceId: 'take-2', fingerprint: fpB }];
  const analyzer = 'raiz-analyzer/1.0.0';

  assert.equal(decideContentAnalysisCache(null, current, analyzer).reason, 'no-previous-analysis');
  assert.equal(decideContentAnalysisCache(valid, current, analyzer).reuse, true);
  assert.equal(decideContentAnalysisCache(valid, current, 'raiz-analyzer/2.0.0').reason, 'analyzer-changed');
  assert.equal(decideContentAnalysisCache({ ...valid, status: 'failed' }, current, analyzer).reason, 'previous-failed');

  const changed = decideContentAnalysisCache(valid, [current[0], { sourceId: 'take-2', fingerprint: sha('novo') }], analyzer);
  assert.equal(changed.reason, 'sources-changed');
  assert.deepEqual(changed.staleSourceIds, ['take-2']);

  const added = decideContentAnalysisCache(valid, [...current, { sourceId: 'take-3', fingerprint: sha('c') }], analyzer);
  assert.equal(added.reason, 'sources-added');
  assert.deepEqual(added.staleSourceIds, ['take-3']);

  assert.equal(decideContentAnalysisCache(valid, [current[0]], analyzer).reason, 'sources-removed');

  // --- invalidação cirúrgica: some o que dependia de take-2, fica o resto
  const pruned = pruneStaleEvidence(valid, ['take-2']);
  assert.equal(pruned.status, 'partial');
  assert.deepEqual(pruned.sources.map((s) => s.sourceId), ['take-1']);
  assert.deepEqual(pruned.facts.map((f) => f.factId), ['f1']);
  assert.equal(pruned.risks.length, 0, 'risco preso a take-2 deve sair');
  assert.equal(pruned.gaps.length, 1, 'lacuna sem fonte deve permanecer');
  assert.equal(pruned.transcript.segments.length, 1, 'segmento de take-1 deve permanecer');

  console.log('test:content-analysis ok — evidência separada de direção, inferência sem confiança recusada, fonte fantasma barrada, "complete" com unknown recusado, fingerprint estável por ordem e invalidação cirúrgica por fonte.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
