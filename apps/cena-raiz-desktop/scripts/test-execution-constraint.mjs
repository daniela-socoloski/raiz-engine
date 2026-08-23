import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-execution-constraint-test-'));

try {
  const output = path.join(work, 'validator.mjs');
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    './packages/core/production/validate-execution-constraint.ts',
    '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });

  const { validateExecutionConstraint, constraintsForEngine, blockingConstraints } =
    await import(pathToFileURL(output).href);

  const provenance = { recordedAt: '2026-08-20T12:00:00.000Z' };

  // Restrições REAIS, das duas fontes que motivaram o contrato. Se o contrato
  // não couber nelas, ele está errado — não elas.
  const real = [
    {
      // DIRECAO-BLIV.md, "Armadilhas já pagas"
      schemaVersion: '1.0', constraintId: 'remotion-colorspace-bt709',
      engine: 'remotion', domain: 'color', effect: 'breaks-output',
      rule: "Config.setColorSpace('bt709') é obrigatório no remotion.config.ts",
      mechanism: 'Sem isso o Remotion marca bt470bg + full range, e qualquer player que respeite as tags desloca matiz e contraste.',
      evidence: { kind: 'incident', statement: 'matiz saiu deslocado na entrega Bliv', productionId: 'bliv-bikman' },
      check: { validatorId: 'ffprobe-stream-property', parameters: { property: 'color_primaries', expected: 'bt709' }, failureSignal: 'color_primaries diferente de bt709' },
      provenance,
    },
    {
      schemaVersion: '1.0', constraintId: 'remotion-prores-alpha-sem-audio',
      engine: 'remotion', domain: 'audio', effect: 'breaks-output',
      rule: 'Ao exportar ProRes 4444 com alpha pelo Remotion, declare a voz como <Audio> separado e confira a faixa no resultado',
      mechanism: 'Neste pipeline a exportação com alpha saiu sem faixa de áudio. NÃO é propriedade do codec: a Apple documenta ProRes 4444 com LPCM em QuickTime. O fato observado pertence a esta cadeia de export, não ao formato.',
      evidence: {
        kind: 'incident', statement: 'mixagem final saiu a -31,5 LUFS por ausência da faixa de voz no arquivo com alpha',
        productionId: 'bliv-bikman',
        measurement: { unit: 'LUFS', tool: 'ffmpeg loudnorm', pipeline: 'Remotion -> ProRes 4444 (yuva444p12le) -> mux' },
      },
      supersededWhen: 'a mesma cadeia de export preservar a faixa de áudio numa versão verificada',
      provenance,
    },
    {
      schemaVersion: '1.0', constraintId: 'loudnorm-duas-passadas',
      engine: 'ffmpeg', domain: 'audio', effect: 'breaks-output',
      rule: 'Política do projeto: loudnorm em duas passadas para -14 LUFS, pico <= -1 dBTP',
      mechanism: 'O FFmpeg aceita uma ou duas passadas. Em passada única ele mede e aplica ao mesmo tempo, então o alvo é estimado; a segunda aplica os valores já medidos. É escolha por normalização linear controlada, não impossibilidade da passada única.',
      evidence: {
        kind: 'measured', statement: 'passada única entregou -11,9 LUFS com alvo -14',
        measurement: { unit: 'LUFS', sampleSize: 1, tool: 'ffmpeg loudnorm', pipeline: 'entrega bliv-bikman' },
      },
      check: { validatorId: 'loudness-ebur128', parameters: { targetLufs: -14, tolerance: 0.5 }, failureSignal: 'LUFS fora de -14 +/- 0,5' },
      provenance,
    },
    {
      // README ancestral, "As 10 regras, pelo mecanismo"
      schemaVersion: '1.0', constraintId: 'nunca-linear',
      engine: 'remotion', domain: 'motion', effect: 'degrades',
      rule: 'Nunca usar easing linear, exceto em fenômeno contínuo declarado',
      mechanism: 'Velocidade constante tem jerk infinito nas bordas; nenhum objeto com massa se move assim.',
      evidence: { kind: 'measured', statement: 'regra 1 das 10 do sistema Cena Raiz Vídeo', measurement: { unit: 'qualitativo', tool: 'revisão de peças entregues' } },
      provenance,
    },
    {
      schemaVersion: '1.0', constraintId: 'determinismo-por-quadro',
      engine: 'remotion', domain: 'determinism', effect: 'breaks-output',
      rule: 'Sem Date.now(), Math.random() sem semente ou setTimeout na composição',
      mechanism: 'Os quadros renderizam fora de ordem entre workers paralelos; qualquer fonte não determinística vira flicker impossível de depurar.',
      evidence: { kind: 'measured', statement: 'regra 2 das 10', measurement: { unit: 'qualitativo', tool: 'Remotion render paralelo' } },
      provenance,
    },
    {
      schemaVersion: '1.0', constraintId: 'mola-mede-com-measurespring',
      engine: 'remotion', domain: 'timing', effect: 'breaks-output',
      rule: 'Duração de mola medida com measureSpring, nunca pela fórmula do livro',
      mechanism: 'O Remotion não tem ramo superamortecido e o damping satura no crítico, então a fórmula teórica erra a janela.',
      evidence: { kind: 'upstream-documented', statement: 'regra 8 das 10', toolVersion: 'remotion 4.x' },
      provenance,
    },
  ];

  for (const constraint of real) {
    const result = validateExecutionConstraint(constraint);
    assert.equal(result.valid, true,
      `${constraint.constraintId}: ${JSON.stringify(result.issues ?? [])}`);
  }

  // --- mecanismo é o que separa conhecimento de superstição
  const noMechanism = structuredClone(real[0]);
  delete noMechanism.mechanism;
  const refusedMechanism = validateExecutionConstraint(noMechanism);
  assert.equal(refusedMechanism.valid, false);
  assert.ok(refusedMechanism.issues.some((i) => i.path === 'mechanism'));

  // --- "alguém disse" não é fato técnico
  const noEvidence = structuredClone(real[0]);
  delete noEvidence.evidence;
  assert.equal(validateExecutionConstraint(noEvidence).valid, false);

  // --- incidente sem produção não é auditável
  const orphanIncident = structuredClone(real[0]);
  delete orphanIncident.evidence.productionId;
  const refusedIncident = validateExecutionConstraint(orphanIncident);
  assert.equal(refusedIncident.valid, false);
  assert.ok(refusedIncident.issues.some((i) => i.path === 'evidence.productionId'));

  // --- quebra sem verificação é aviso, não erro
  const noCheck = structuredClone(real[4]);
  const warned = validateExecutionConstraint(noCheck);
  assert.equal(warned.valid, true, 'ausência de check não invalida');
  assert.ok(warned.warnings.some((w) => w.path === 'check'),
    'mas precisa avisar que é aviso, não portão');

  // --- fato de upstream sem versão avisa
  const noVersion = structuredClone(real[5]);
  delete noVersion.evidence.toolVersion;
  const versionWarned = validateExecutionConstraint(noVersion);
  assert.equal(versionWarned.valid, true);
  assert.ok(versionWarned.warnings.some((w) => w.path === 'evidence.toolVersion'));

  // --- comando de shell livre e recusado: manifesto nao pode virar execucao
  const freeCommand = structuredClone(real[0]);
  freeCommand.check = { command: 'rm -rf /', failureSignal: 'qualquer' };
  const refusedCommand = validateExecutionConstraint(freeCommand);
  assert.equal(refusedCommand.valid, false, 'comando livre nao pode ser aceito');
  assert.ok(refusedCommand.issues.some((i) => i.path === 'check.validatorId'));

  // --- medicao sem contexto vira dogma
  const bareMeasurement = structuredClone(real[3]);
  delete bareMeasurement.evidence.measurement;
  const refusedBare = validateExecutionConstraint(bareMeasurement);
  assert.equal(refusedBare.valid, false);
  assert.ok(refusedBare.issues.some((i) => i.path === 'evidence.measurement'));

  assert.equal(validateExecutionConstraint(null).valid, false);

  // --- seleção por motor: 'any' sempre entra
  const generic = {
    ...structuredClone(real[3]), constraintId: 'generico', engine: 'any',
  };
  const pool = [...real, generic];
  const forFfmpeg = constraintsForEngine(pool, 'ffmpeg');
  assert.ok(forFfmpeg.some((c) => c.constraintId === 'generico'), '"any" vale para qualquer motor');
  assert.ok(forFfmpeg.every((c) => c.engine === 'ffmpeg' || c.engine === 'any'));
  assert.ok(!forFfmpeg.some((c) => c.engine === 'remotion'));

  // --- bloqueantes: degradar não é quebrar
  const blocking = blockingConstraints(pool);
  assert.ok(!blocking.some((c) => c.effect === 'degrades'));
  assert.ok(blocking.some((c) => c.constraintId === 'remotion-colorspace-bt709'));

  console.log(`test:execution-constraint ok — ${real.length} restrições reais validadas; mecanismo e evidência obrigatórios, comando de shell livre recusado, medição sem contexto recusada, incidente sem produção barrado, seleção por motor e bloqueio corretos.`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
