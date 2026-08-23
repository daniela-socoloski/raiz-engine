import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-stage-boundary-test-'));

try {
  const output = path.join(work, 'boundary.mjs');
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    './packages/core/production/validate-planner-stage-boundary.ts',
    '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });

  const { validatePlannerStageBoundary, stripExecutionDecisions } =
    await import(pathToFileURL(output).href);

  const semantic = {
    sceneId: 's1', startFrame: 0, endFrame: 90,
    purpose: 'hook', narrativeBeat: 'abre com a pergunta',
  };

  // O passo 8 produz decisão semântica e nada mais.
  assert.equal(validatePlannerStageBoundary([semantic], 'planner').withinBoundary, true);

  // Asset escolhido no passo 8 viola a regra de saída do próprio passo.
  const withAsset = { ...semantic, selectedAssetId: 'asset-42' };
  const refusedAsset = validatePlannerStageBoundary([withAsset], 'planner');
  assert.equal(refusedAsset.withinBoundary, false);
  assert.ok(refusedAsset.issues.some((i) => i.code === 'PLANNER_STAGE_BOUNDARY_VIOLATION'));
  assert.ok(refusedAsset.issues.some((i) => i.path.endsWith('selectedAssetId')));

  // Motor escolhido no passo 8, idem.
  const withEngine = { ...semantic, engineRecommendation: 'remotion' };
  assert.equal(validatePlannerStageBoundary([withEngine], 'planner').withinBoundary, false);

  // Depois do passo 11 os mesmos campos são legítimos.
  assert.equal(validatePlannerStageBoundary([withEngine], 'asset-selection').withinBoundary, true);

  // Caminho inverso: chegar à execução sem motor significa que o 11 não rodou.
  const refusedExecution = validatePlannerStageBoundary([semantic], 'execution');
  assert.equal(refusedExecution.withinBoundary, false);
  assert.ok(refusedExecution.issues.some((i) => i.code === 'EXECUTION_WITHOUT_ENGINE'));
  assert.equal(validatePlannerStageBoundary([withEngine], 'execution').withinBoundary, true);

  // Saneamento preserva a decisão semântica e descarta só a execução.
  const stripped = stripExecutionDecisions({ ...withAsset, engineRecommendation: 'ffmpeg' });
  assert.equal(stripped.selectedAssetId, undefined);
  assert.equal(stripped.engineRecommendation, undefined);
  assert.equal(stripped.narrativeBeat, 'abre com a pergunta', 'a semântica não pode ser perdida');
  assert.equal(validatePlannerStageBoundary([stripped], 'planner').withinBoundary, true);

  console.log('test:planner-stage-boundary ok — asset e motor recusados no passo 8, aceitos depois do 11, execução sem motor barrada, e o saneamento preserva a decisão semântica.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
