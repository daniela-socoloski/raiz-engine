import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-scene-plan-test-'));

const bundle = (entry, name) => {
  const output = path.join(work, name);
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    entry, '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });
  return pathToFileURL(output).href;
};

try {
  const { validateScenePlan, validateScenePlanList } = await import(
    bundle('./packages/core/production/validate-scene-plan.ts', 'scene.mjs'));
  const { validateCreativePreference, resolvePreferenceConflict } = await import(
    bundle('./packages/core/production/validate-creative-preference.ts', 'preference.mjs'));

  // ---------------------------------------------------------------- ScenePlan
  const scene = {
    sceneId: 's1', startFrame: 0, endFrame: 90,
    purpose: 'hook', narrativeBeat: 'abre com a pergunta que o vídeo responde',
    mediaNeed: { kind: 'video', description: 'plano aberto do produto' },
    motionNeed: { function: 'revelar o produto depois da primeira fala', intensity: 'medium' },
    audioNeed: { role: 'voice' },
    prohibitions: [{ rule: 'sem texto sobre o rosto', reason: 'a marca proíbe cobrir pessoas' }],
    evidence: [{ source: 'content-analysis', reference: 'f2', supports: 'a fala forte está aqui' }],
    engineRecommendation: 'remotion',
  };
  assert.equal(validateScenePlan(scene).valid, true,
    JSON.stringify(validateScenePlan(scene).issues ?? []));

  // beat ausente: cena vira decoração
  const noBeat = structuredClone(scene);
  delete noBeat.narrativeBeat;
  const refusedBeat = validateScenePlan(noBeat);
  assert.equal(refusedBeat.valid, false);
  assert.ok(refusedBeat.issues.some((i) => i.path === 'narrativeBeat'));

  // keyframe vazando para o plano: execução decidida cedo demais
  for (const leak of [
    'animar opacity: 0 -> 1 com cubic-bezier(.4,0,.2,1)',
    'aplicar scale(1.2) por 300ms',
    'usar spring( stiffness 200 )',
  ]) {
    const bad = structuredClone(scene);
    bad.motionNeed.function = leak;
    const refused = validateScenePlan(bad);
    assert.equal(refused.valid, false, `deveria recusar: ${leak}`);
    assert.ok(refused.issues.some((i) => i.path === 'motionNeed.function'));
  }

  // janela invertida
  const inverted = structuredClone(scene);
  inverted.endFrame = 0;
  assert.equal(validateScenePlan(inverted).valid, false);

  // proibição sem motivo não é revisável
  const dogma = structuredClone(scene);
  dogma.prohibitions = [{ rule: 'nunca usar vermelho' }];
  assert.equal(validateScenePlan(dogma).valid, false);

  // --- conjunto: id duplicado e sobreposição
  const second = { ...structuredClone(scene), sceneId: 's2', startFrame: 90, endFrame: 180 };
  assert.equal(validateScenePlanList([scene, second]).valid, true);

  const duplicated = validateScenePlanList([scene, { ...structuredClone(second), sceneId: 's1' }]);
  assert.equal(duplicated.valid, false);
  assert.ok(duplicated.issues.some((i) => i.message.includes('duplicado')));

  const overlapping = validateScenePlanList([scene, { ...structuredClone(second), startFrame: 60 }]);
  assert.equal(overlapping.valid, false);
  assert.ok(overlapping.issues.some((i) => i.message.includes('sobrep')));

  // -------------------------------------------------------- CreativePreference
  const preference = {
    schemaVersion: '1.0', preferenceId: 'pref-1', version: 1, status: 'active',
    scope: { kind: 'brand', brandId: 'pleasing' },
    dimension: 'typography', polarity: 'prefer',
    rule: 'legenda karaokê em vertical',
    origin: 'correction', priority: 10,
    evidence: { productionId: 'prod-1', version: 2, statement: 'ela pediu karaokê em vez de empilhada' },
    provenance: { createdAt: '2026-08-20T12:00:00.000Z', approvedBy: 'daniela', approvedAt: '2026-08-20T12:05:00.000Z' },
  };
  assert.equal(validateCreativePreference(preference).valid, true,
    JSON.stringify(validateCreativePreference(preference).issues ?? []));

  // escopo de produção sem productionId: alcance indefinido tende ao global
  const vagueScope = structuredClone(preference);
  vagueScope.scope = { kind: 'production', brandId: 'pleasing' };
  const refusedScope = validateCreativePreference(vagueScope);
  assert.equal(refusedScope.valid, false);
  assert.ok(refusedScope.issues.some((i) => i.path === 'scope.productionId'));

  // correção local promovida a global carregando a produção junto
  const promoted = structuredClone(preference);
  promoted.scope = { kind: 'brand', brandId: 'pleasing', productionId: 'prod-1' };
  const refusedPromotion = validateCreativePreference(promoted);
  assert.equal(refusedPromotion.valid, false);
  assert.ok(refusedPromotion.issues.some((i) => i.path === 'scope'));

  // sem aprovador não é correção aprovada
  const unapproved = structuredClone(preference);
  delete unapproved.provenance.approvedBy;
  assert.equal(validateCreativePreference(unapproved).valid, false);

  // substituída não pode ficar sem apontar a substituta
  const orphanSuperseded = structuredClone(preference);
  orphanSuperseded.status = 'superseded';
  assert.equal(validateCreativePreference(orphanSuperseded).valid, false);

  assert.equal(validateCreativePreference(null).valid, false);

  // --- desempate determinístico
  const brandWide = structuredClone(preference);
  const productionNarrow = {
    ...structuredClone(preference),
    preferenceId: 'pref-2', priority: 1,
    scope: { kind: 'production', brandId: 'pleasing', productionId: 'prod-9' },
  };
  assert.equal(
    resolvePreferenceConflict([brandWide, productionNarrow]).preferenceId, 'pref-2',
    'a mais específica vence, mesmo com prioridade menor');

  const higher = { ...structuredClone(brandWide), preferenceId: 'pref-3', priority: 99 };
  assert.equal(
    resolvePreferenceConflict([brandWide, higher]).preferenceId, 'pref-3',
    'no mesmo escopo, a prioridade decide');

  const revoked = { ...structuredClone(productionNarrow), status: 'revoked' };
  assert.equal(
    resolvePreferenceConflict([revoked]), null,
    'preferência revogada não se aplica');

  console.log('test:scene-plan ok — beat obrigatório, keyframe vazado recusado, janelas sobrepostas e ids duplicados barrados; preferência exige escopo completo, aprovador e evidência, e o desempate é determinístico por especificidade.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
