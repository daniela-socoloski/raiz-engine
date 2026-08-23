import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-plan-inputs-test-'));

const bundle = (entry, name) => {
  const output = path.join(work, name);
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    entry, '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });
  return pathToFileURL(output).href;
};

const print = (seed) => seed.repeat(64).slice(0, 64);
const A = print('a');
const B = print('b');
const C = print('c');

try {
  const { validatePlanInputs, comparePlanInputs } = await import(
    bundle('./packages/core/production/validate-plan-inputs.ts', 'plan-inputs.mjs'));

  const base = {
    schemaVersion: '1.0',
    brief: {
      productionId: 'p1',
      version: 2,
      status: 'ready',
      path: 'edit/planning/creative-brief.json',
    },
    contentAnalysis: {
      version: 3,
      status: 'complete',
      combinedFingerprint: C,
      analyzerVersion: 'whisperx-3.1',
      sources: [
        { sourceId: 'src-1', fingerprint: A },
        { sourceId: 'src-2', fingerprint: B },
      ],
      path: 'edit/analysis/content-analysis.json',
    },
    brandProfile: {
      brandId: 'marca-raiz',
      version: 4,
      approval: 'approved',
      snapshotPath: 'edit/brand/runtime-profile.json',
    },
    preferences: [
      {
        preferenceId: 'pref-1', version: 1, scopeKind: 'brand',
        dimension: 'pacing', polarity: 'prefer', applied: true,
      },
      {
        preferenceId: 'pref-2', version: 1, scopeKind: 'production',
        dimension: 'pacing', polarity: 'require', applied: false,
        losesTo: 'pref-1',
      },
    ],
    planner: { name: 'video-and-motion-planner', version: '0.1.0' },
    resolvedAt: '2026-08-20T12:00:00.000Z',
  };

  const ok = validatePlanInputs(base);
  assert.equal(ok.valid, true, JSON.stringify(ok.issues ?? []));

  const refuse = (mutate, expectedPath, label) => {
    const candidate = structuredClone(base);
    mutate(candidate);
    const result = validatePlanInputs(candidate);
    assert.equal(result.valid, false, `deveria recusar: ${label}`);
    assert.ok(
      result.issues.some((i) => i.path === expectedPath),
      `${label}: esperava problema em ${expectedPath}, veio ${JSON.stringify(result.issues)}`,
    );
  };

  // Brief inacabado não vira direção.
  refuse((c) => { c.brief.status = 'draft'; }, 'brief.status', 'brief draft');

  // Perfil de fallback da UI herdada não governa produção.
  refuse((c) => { c.brandProfile.brandId = 'unresolved'; },
    'brandProfile.brandId', 'perfil de fallback');
  refuse((c) => { c.brandProfile.version = 0; },
    'brandProfile.version', 'perfil versão zero');
  refuse((c) => { c.brandProfile.approval = 'draft'; },
    'brandProfile.approval', 'perfil não aprovado');

  // Ausência de análise precisa ser declarada, nunca silenciosa.
  refuse((c) => { delete c.contentAnalysis; },
    'analysisAbsenceReason', 'análise sumindo sem motivo');
  refuse((c) => { c.analysisAbsenceReason = 'produção sem material'; },
    'analysisAbsenceReason', 'análise e motivo ao mesmo tempo');

  const noSource = structuredClone(base);
  delete noSource.contentAnalysis;
  noSource.analysisAbsenceReason = 'produção inteiramente gerada, sem material de origem';
  assert.equal(validatePlanInputs(noSource).valid, true,
    'ausência declarada é legítima');

  // Análise que falhou não sustenta plano.
  refuse((c) => { c.contentAnalysis.status = 'failed'; },
    'contentAnalysis.status', 'análise falhada');

  // Sem fingerprint por fonte não existe invalidação parcial.
  refuse((c) => { c.contentAnalysis.sources = []; },
    'contentAnalysis.sources', 'análise sem fontes');
  refuse((c) => { c.contentAnalysis.sources[0].fingerprint = 'nao-e-sha256'; },
    'contentAnalysis.sources[0].fingerprint', 'fingerprint inválido');

  // Caminho pessoal absoluto vaza a máquina de quem editou.
  refuse((c) => { c.brief.path = 'C:/Users/alguem/edit/planning/creative-brief.json'; },
    'brief.path', 'caminho absoluto');
  refuse((c) => { c.brief.path = 'edit\\planning\\creative-brief.json'; },
    'brief.path', 'barra invertida');
  refuse((c) => { c.brief.path = '../outra-producao/creative-brief.json'; },
    'brief.path', 'caminho para fora da produção');

  // Preferência derrotada sem registro esconde o conflito.
  refuse((c) => { delete c.preferences[1].losesTo; },
    'preferences[1].notAppliedReason', 'preferência derrotada sem razão');
  refuse((c) => { c.preferences[1].preferenceId = 'pref-1'; },
    'preferences[1]', 'preferenceId duplicado');

  // Plano sem planner identificado não pode ser corrigido depois.
  refuse((c) => { delete c.planner.version; }, 'planner.version', 'planner sem versão');
  refuse((c) => { c.schemaVersion = '2.0'; }, 'schemaVersion', 'schema desconhecido');

  // --------------------------------------------------------------- comparação
  assert.deepEqual(comparePlanInputs(base, base), [],
    'entradas idênticas não envelhecem o plano');

  const briefBumped = structuredClone(base);
  briefBumped.brief.version = 3;
  const briefChanges = comparePlanInputs(base, briefBumped);
  assert.equal(briefChanges.length, 1);
  assert.equal(briefChanges[0].kind, 'brief');

  // Uma fonte trocada precisa apontar QUAL fonte, para revisar só as cenas dela.
  const sourceSwapped = structuredClone(base);
  sourceSwapped.contentAnalysis.sources[1].fingerprint = print('d');
  sourceSwapped.contentAnalysis.combinedFingerprint = print('e');
  const sourceChanges = comparePlanInputs(base, sourceSwapped);
  const perSource = sourceChanges.find((c) => c.kind === 'content-source');
  assert.ok(perSource, 'mudança de fonte precisa ser reportada por fonte');
  assert.equal(perSource.sourceId, 'src-2');
  assert.ok(sourceChanges.some((c) => c.kind === 'content-analysis'),
    'o conjunto também mudou');

  const profileRecompiled = structuredClone(base);
  profileRecompiled.brandProfile.version = 5;
  assert.ok(comparePlanInputs(base, profileRecompiled)
    .some((c) => c.kind === 'brand-profile'));

  const preferenceLanded = structuredClone(base);
  preferenceLanded.preferences[1].applied = true;
  delete preferenceLanded.preferences[1].losesTo;
  assert.ok(comparePlanInputs(base, preferenceLanded)
    .some((c) => c.kind === 'preferences'));

  console.log('test-plan-inputs: ok');
} finally {
  rmSync(work, { recursive: true, force: true });
}
