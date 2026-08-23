import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-planning-context-test-'));

try {
  const output = path.join(work, 'assemble.mjs');
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    './packages/core/production/assemble-planning-context.ts',
    '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });

  const { assemblePlanningContext } = await import(pathToFileURL(output).href);

  const NOW = '2026-08-20T12:00:00.000Z';

  const brief = {
    schemaVersion: '1.0', productionId: 'prod-1', version: 1, status: 'ready',
    brandId: 'pleasing', productionKind: 'video',
    intent: { objective: 'lançar a coleção' },
    delivery: { channel: 'reels', aspectRatio: '9:16', targetDurationSeconds: 30 },
    provenance: { origin: 'conversation', createdAt: NOW },
  };

  const brandProfile = {
    schemaVersion: '1.0', brandId: 'pleasing', brandName: 'Pleasing', version: 3,
    verbal: { toneRules: [] }, visual: { accentColor: '#D4E017' },
    motion: { intensity: 'low' }, sound: { principles: [] },
    editorial: { pace: 'moderate', energy: 'balanced', density: 'moderate' },
    approval: { status: 'approved' },
    provenance: { origin: 'marca-raiz-prisma', compiledAt: NOW },
  };

  const analysis = {
    schemaVersion: '1.0', productionId: 'prod-1', version: 1, status: 'complete',
    sources: [], facts: [], gaps: [], risks: [], unknowns: [],
    provenance: { analyzedAt: NOW, analyzerVersion: '1.0', combinedFingerprint: 'a'.repeat(64) },
  };

  const pref = (over) => ({
    schemaVersion: '1.0', preferenceId: 'p', version: 1, status: 'active',
    scope: { kind: 'brand', brandId: 'pleasing' },
    dimension: 'typography', polarity: 'prefer', rule: 'karaokê',
    origin: 'correction', priority: 10,
    evidence: { productionId: 'prod-0', version: 1, statement: 'pediu karaokê' },
    provenance: { createdAt: NOW, approvedBy: 'daniela', approvedAt: NOW },
    ...over,
  });

  const base = { brief, brandProfile, contentAnalysis: analysis, assembledAt: NOW };

  // --- caminho feliz
  const ok = assemblePlanningContext(base);
  assert.equal(ok.assembled, true, JSON.stringify(ok.issues ?? []));
  assert.equal(ok.context.staleness.length, 0);

  // --- brief de uma marca com perfil de outra: cada artefato é válido, a
  //     relação entre eles não
  const wrongBrand = assemblePlanningContext({
    ...base, brandProfile: { ...brandProfile, brandId: 'gentle-monster' },
  });
  assert.equal(wrongBrand.assembled, false);
  assert.ok(wrongBrand.issues.some((i) => i.code === 'BRAND_MISMATCH'));

  // --- análise de outra produção
  const wrongProduction = assemblePlanningContext({
    ...base, contentAnalysis: { ...analysis, productionId: 'prod-9' },
  });
  assert.equal(wrongProduction.assembled, false);
  assert.ok(wrongProduction.issues.some((i) => i.code === 'PRODUCTION_MISMATCH'));

  // --- perfil em rascunho não pode governar direção
  const draft = assemblePlanningContext({
    ...base, brandProfile: { ...brandProfile, approval: { status: 'draft' } },
  });
  assert.equal(draft.assembled, false);
  assert.ok(draft.issues.some((i) => i.code === 'BRAND_PROFILE_NOT_APPROVED'));

  // --- ausência de análise: legítima se declarada, defeito se silenciosa
  const silent = assemblePlanningContext({ brief, brandProfile, assembledAt: NOW });
  assert.equal(silent.assembled, false);
  assert.ok(silent.issues.some((i) => i.code === 'ANALYSIS_ABSENCE_UNDECLARED'));

  const declared = assemblePlanningContext({
    brief, brandProfile, assembledAt: NOW,
    analysisAbsenceReason: 'produção parte de material a gerar, sem bruto',
  });
  assert.equal(declared.assembled, true);

  // --- análise falha não é evidência
  assert.equal(
    assemblePlanningContext({ ...base, contentAnalysis: { ...analysis, status: 'failed' } }).assembled,
    false);

  // --- análise parcial passa, mas o planner é avisado
  const partial = assemblePlanningContext({
    ...base,
    contentAnalysis: { ...analysis, status: 'partial', unknowns: [{ question: 'quem?', reason: 'rosto coberto' }] },
  });
  assert.equal(partial.assembled, true);
  assert.ok(partial.context.staleness.some((s) => s.kind === 'analysis-outdated'));

  // --- preferências: escopo filtra, e o descarte é registrado
  const withPrefs = assemblePlanningContext({
    ...base,
    preferences: [
      pref({ preferenceId: 'da-marca' }),
      pref({ preferenceId: 'de-outra-marca', scope: { kind: 'brand', brandId: 'lollapalooza' } }),
      pref({ preferenceId: 'de-outra-producao', scope: { kind: 'production', brandId: 'pleasing', productionId: 'prod-9' } }),
      pref({ preferenceId: 'revogada', status: 'revoked' }),
      pref({ preferenceId: 'expirada', expiresAt: '2026-01-01T00:00:00.000Z' }),
      pref({ preferenceId: 'do-canal-certo', dimension: 'color', scope: { kind: 'channel', brandId: 'pleasing', value: 'reels' } }),
      pref({ preferenceId: 'do-canal-errado', dimension: 'color', scope: { kind: 'channel', brandId: 'pleasing', value: 'tiktok' } }),
    ],
  });
  assert.equal(withPrefs.assembled, true);

  const applied = withPrefs.context.preferences.flatMap((p) => [p.winner.preferenceId, ...p.losers.map((l) => l.preferenceId)]);
  assert.ok(applied.includes('da-marca'));
  assert.ok(applied.includes('do-canal-certo'));
  for (const rejected of ['de-outra-marca', 'de-outra-producao', 'revogada', 'expirada', 'do-canal-errado']) {
    assert.ok(!applied.includes(rejected), `${rejected} não deveria se aplicar`);
    assert.ok(
      withPrefs.context.inapplicablePreferences.some((i) => i.preference.preferenceId === rejected),
      `${rejected} precisa constar como inaplicável, com razão`);
  }

  // --- desempate por especificidade, com o derrotado registrado
  const conflict = assemblePlanningContext({
    ...base,
    preferences: [
      pref({ preferenceId: 'ampla', priority: 99 }),
      pref({ preferenceId: 'estreita', priority: 1, scope: { kind: 'production', brandId: 'pleasing', productionId: 'prod-1' } }),
    ],
  });
  const typography = conflict.context.preferences.find((p) => p.dimension === 'typography');
  assert.equal(typography.winner.preferenceId, 'estreita', 'a mais específica vence, mesmo com prioridade menor');
  assert.deepEqual(typography.losers.map((l) => l.preferenceId), ['ampla'],
    'a derrotada precisa ser distinguível da que ninguém consultou');

  // --- determinismo: a mesma entrada produz o mesmo contexto
  const a = assemblePlanningContext({ ...base, preferences: [pref({ preferenceId: 'x' }), pref({ preferenceId: 'y', dimension: 'color' })] });
  const b = assemblePlanningContext({ ...base, preferences: [pref({ preferenceId: 'y', dimension: 'color' }), pref({ preferenceId: 'x' })] });
  assert.deepEqual(
    a.context.preferences.map((p) => p.dimension),
    b.context.preferences.map((p) => p.dimension),
    'a ordem de entrada não pode mudar o contexto montado');

  console.log('test:planning-context ok — marca trocada, produção trocada e perfil em rascunho recusados; ausência de análise exige declaração; preferência de outra marca, outra produção, revogada, expirada e de outro canal filtradas com razão registrada; desempate por especificidade preserva o derrotado; montagem determinística.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
