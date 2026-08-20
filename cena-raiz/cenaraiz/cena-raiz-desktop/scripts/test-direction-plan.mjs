// Teste do AudiovisualDirectionPlan: criacao, validacao, persistencia e migracao.
//
// Criterios de aceitacao da primeira integracao (ARQUITETURA secao 14):
//   - o plano e validado antes de ser salvo;
//   - o plano e gravado atomicamente;
//   - reabrir o projeto recupera a versao ativa;
//   - um plano invalido nunca chega ao agente ou renderer;
//   - existe teste de criacao, validacao, persistencia e migracao.
//
// Segue o padrao das outras suites: esbuild empacota o TypeScript e o teste
// importa o bundle. Sem framework, sem dependencia nova.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(path.join(tmpdir(), 'cena-raiz-plan-test-'));

try {
  // Chama o shim JS do esbuild com o proprio Node: o wrapper .cmd do Windows nao
  // pode ser executado por spawnSync sem shell desde a correcao CVE-2024-27980.
  const bundle = (entry, out) => {
    execFileSync(process.execPath, [
      path.join(projectRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
      path.join(projectRoot, entry),
      '--bundle', '--platform=node', '--format=esm',
      `--outfile=${path.join(work, out)}`,
    ], { stdio: 'inherit' });
    return pathToFileURL(path.join(work, out)).href;
  };

  const { validateDirectionPlan, formatValidationIssues } =
    await import(bundle('src/application/direction/validate-direction-plan.ts', 'validate.mjs'));
  const { buildPlanFromStyle } =
    await import(bundle('src/application/direction/build-plan-from-style.ts', 'build.mjs'));
  const { createFallbackBrandProfile } =
    await import(bundle('src/domain/brand/brand-runtime-profile.ts', 'brand.mjs'));
  const { normalizeDirectionPlan, serializeDirectionPlan, directionPlansAreEquivalent } =
    await import(bundle('src/application/direction/serialize-direction-plan.ts', 'serialize.mjs'));

  const FIXED = new Date('2026-08-20T12:00:00.000Z');
  const estiloBase = {
    edit: 'limpa',
    headline: 'outline',
    captions: 'karaoke',
    accent: '#09b5b7',
    elements: { tracking: false, zoomAuto: false, zoomCuts: false, flashCut: false, musicAI: false },
    note: 'apresentar o produto em 30 segundos',
  };

  // --- Criacao ------------------------------------------------------------
  const plano = buildPlanFromStyle({
    projectId: 'proj-1',
    style: estiloBase,
    brand: createFallbackBrandProfile('#09b5b7'),
    now: () => FIXED,
    planId: 'plan-fixo',
  });

  assert.equal(plano.schemaVersion, '1.0');
  assert.equal(plano.version, 1);
  assert.equal(plano.status, 'draft');
  assert.equal(plano.intent.objective, 'apresentar o produto em 30 segundos');
  assert.equal(plano.intent.format, '9:16');
  assert.equal(plano.provenance.origin, 'migration', 'plano vindo de selecao de UI nao e planner');
  assert.deepEqual(plano.scenes, [], 'nascer sem cenas e valido');

  // O estilo carrega decisoes editoriais implicitas; o contrato as torna explicitas.
  assert.equal(plano.direction.pace, 'moderate', 'corte limpo mantem o ritmo da fala');
  assert.equal(plano.direction.energy, 'restrained', 'nenhum elemento ligado');
  assert.equal(plano.direction.density, 'dense', 'headline + legenda ocupam a tela');
  assert.ok(plano.direction.visualHierarchy.includes('headline:outline'));
  assert.ok(plano.direction.prohibitedPatterns.includes('nao adicionar trilha musical'));

  // Determinismo: mesma entrada, mesmo plano.
  const plano2 = buildPlanFromStyle({
    projectId: 'proj-1', style: estiloBase,
    brand: createFallbackBrandProfile('#09b5b7'),
    now: () => FIXED, planId: 'plan-fixo',
  });
  assert.deepEqual(plano, plano2, 'a construcao deve ser deterministica');

  // Estilo agressivo produz direcao diferente. Se nao produzir, o contrato nao
  // esta lendo a intencao, so preenchendo campos.
  const agressivo = buildPlanFromStyle({
    projectId: 'proj-1',
    style: { ...estiloBase, edit: 'split',
      elements: { tracking: true, zoomAuto: true, zoomCuts: true, flashCut: true, musicAI: true } },
    now: () => FIXED,
  });
  assert.equal(agressivo.direction.pace, 'fast');
  assert.equal(agressivo.direction.energy, 'expressive');
  assert.ok(!agressivo.direction.prohibitedPatterns.includes('nao adicionar trilha musical'));

  // Nota vazia nao vira objetivo inventado.
  const semNota = buildPlanFromStyle({ projectId: 'p', style: { ...estiloBase, note: '   ' }, now: () => FIXED });
  assert.equal(semNota.intent.objective, 'objetivo nao declarado pelo usuario');
  assert.equal(semNota.direction.narrativeSummary, undefined);

  // --- Validacao ----------------------------------------------------------
  const ok = validateDirectionPlan(plano);
  assert.equal(ok.valid, true, ok.valid ? '' : formatValidationIssues(ok.issues));

  const recusa = (mutar, campoEsperado) => {
    const copia = JSON.parse(JSON.stringify(plano));
    mutar(copia);
    const r = validateDirectionPlan(copia);
    assert.equal(r.valid, false, `deveria recusar: ${campoEsperado}`);
    assert.ok(r.issues.some((i) => i.path.startsWith(campoEsperado)),
      `esperava problema em ${campoEsperado}, veio: ${r.issues.map((i) => i.path).join(', ')}`);
  };

  recusa((p) => { p.schemaVersion = '2.0'; }, 'schemaVersion');
  recusa((p) => { p.planId = ''; }, 'planId');
  recusa((p) => { p.version = 0; }, 'version');
  recusa((p) => { p.status = 'aprovado'; }, 'status');
  recusa((p) => { p.intent.objective = ''; }, 'intent.objective');
  recusa((p) => { p.intent.format = '4:3'; }, 'intent.format');
  recusa((p) => { p.direction.pace = 'rapido'; }, 'direction.pace');
  recusa((p) => { p.direction.visualHierarchy = 'headline'; }, 'direction.visualHierarchy');
  recusa((p) => { delete p.provenance; }, 'provenance');
  recusa((p) => { p.provenance.createdAt = 'ontem'; }, 'provenance.createdAt');

  assert.equal(validateDirectionPlan(null).valid, false);
  assert.equal(validateDirectionPlan('{}').valid, false);
  assert.equal(validateDirectionPlan([]).valid, false);

  // --- Cenas --------------------------------------------------------------
  const comCena = JSON.parse(JSON.stringify(plano));
  comCena.scenes = [{
    sceneId: 's1', startFrame: 0, endFrame: 90,
    purpose: 'hook', narrativeBeat: 'abre com a dor do cliente',
    motionNeed: { function: 'revelar o texto', intensity: 'low' },
    audioNeed: { role: 'voice' },
    engineRecommendation: 'remotion',
  }];
  assert.equal(validateDirectionPlan(comCena).valid, true);

  // Cena que termina antes de comecar renderiza como nada, em silencio.
  recusa((p) => {
    p.scenes = [{ sceneId: 's1', startFrame: 90, endFrame: 30, purpose: 'hook', narrativeBeat: 'x' }];
  }, 'scenes[0].endFrame');

  // Toda cena declara sua funcao. Sem isso, e decoracao.
  recusa((p) => {
    p.scenes = [{ sceneId: 's1', startFrame: 0, endFrame: 30, purpose: 'hook', narrativeBeat: '' }];
  }, 'scenes[0].narrativeBeat');

  // IDs duplicados fazem duas cenas disputarem o mesmo slot no compilador.
  recusa((p) => {
    p.scenes = [
      { sceneId: 'dup', startFrame: 0, endFrame: 30, purpose: 'hook', narrativeBeat: 'a' },
      { sceneId: 'dup', startFrame: 30, endFrame: 60, purpose: 'clarify', narrativeBeat: 'b' },
    ];
  }, 'scenes');

  // --- Persistencia atomica ----------------------------------------------
  const projeto = path.join(work, 'projeto');
  const destino = path.join(projeto, 'edit', 'planning', 'audiovisual-direction-plan.json');
  mkdirSync(path.dirname(destino), { recursive: true });

  // Grava em arquivo temporario e renomeia: um render interrompido no meio da
  // escrita nunca deixa um plano truncado no lugar do valido.
  // A serializacao passa pela fronteira, nunca por JSON.stringify direto.
  const gravarAtomico = (plan) => {
    const validado = validateDirectionPlan(plan);
    assert.equal(validado.valid, true, 'nunca gravar plano invalido');
    const tmp = `${destino}.tmp`;
    writeFileSync(tmp, serializeDirectionPlan(plan), 'utf8');
    renameSync(tmp, destino);
  };

  gravarAtomico(plano);
  assert.ok(existsSync(destino));
  assert.ok(!existsSync(`${destino}.tmp`), 'temporario nao deve sobrar');

  // Reabrir o projeto recupera a versao ativa.
  const lido = JSON.parse(readFileSync(destino, 'utf8'));
  const relido = validateDirectionPlan(lido);
  assert.equal(relido.valid, true);
  assert.deepEqual(lido, plano, 'ida e volta ao disco preserva o plano');

  // --- A fronteira fecha o buraco para QUALQUER plano ---------------------
  // Corrigir so no construtor deixaria passar plano vindo do modelo, do disco
  // ou de uma revisao feita em outro lugar. Este plano nao veio do construtor.
  const planoExterno = {
    ...JSON.parse(JSON.stringify(plano)),
    inputs: {
      brandProfileVersion: '3',
      timelineFingerprint: undefined,
      transcriptFingerprint: 'abc123',
      assetRegistryVersion: undefined,
    },
    intent: { ...plano.intent, audience: undefined, channel: undefined },
  };

  assert.ok('timelineFingerprint' in planoExterno.inputs, 'a chave existe antes de normalizar');
  const normalizado = normalizeDirectionPlan(planoExterno);
  assert.ok(!('timelineFingerprint' in normalizado.inputs), 'chave undefined removida');
  assert.equal(normalizado.inputs.transcriptFingerprint, 'abc123', 'valor real preservado');
  assert.deepEqual(
    normalizado,
    JSON.parse(JSON.stringify(planoExterno)),
    'normalizar deve dar o mesmo resultado que ida e volta pelo JSON',
  );

  // O caso que motivou tudo: decidir se a midia precisa ser reanalisada.
  gravarAtomico(planoExterno);
  const doDisco = JSON.parse(readFileSync(destino, 'utf8'));
  assert.deepEqual(doDisco, normalizado, 'plano externo tambem sobrevive a ida e volta');
  assert.ok(
    directionPlansAreEquivalent(planoExterno, doDisco),
    'um plano nao pode parecer diferente de si mesmo depois de gravado',
  );

  // `null` sobrevive: significa "declarado como ausente", diferente de "nao declarado".
  const comNull = normalizeDirectionPlan({ ...planoExterno, inputs: { assetRegistryVersion: null } });
  assert.ok('assetRegistryVersion' in comNull.inputs, 'null e preservado');

  // --- Migracao -----------------------------------------------------------
  // Plano de versao futura e recusado em vez de interpretado por adivinhacao.
  const futuro = { ...plano, schemaVersion: '9.9' };
  const rf = validateDirectionPlan(futuro);
  assert.equal(rf.valid, false);
  assert.ok(rf.issues.some((i) => i.path === 'schemaVersion'));

  // Revisao: nova versao, plano anterior vira superseded.
  const revisado = { ...JSON.parse(JSON.stringify(plano)), version: 2, status: 'review' };
  const anterior = { ...JSON.parse(JSON.stringify(plano)), status: 'superseded' };
  assert.equal(validateDirectionPlan(revisado).valid, true);
  assert.equal(validateDirectionPlan(anterior).valid, true);
  assert.ok(revisado.version > anterior.version);

  console.log('test:direction-plan ok — criacao deterministica, 16 recusas de plano invalido, gravacao atomica pela fronteira de serializacao, ida e volta ao disco para plano do construtor E plano externo, null preservado, equivalencia e migracao de versao.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
