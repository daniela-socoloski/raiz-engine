// Teste do Motion Asset Registry.
//
// Criterios de aceitacao do WP3:
//   - o registry carrega deterministicamente;
//   - assets duplicados, invalidos ou incompativeis NAO chegam ao planner;
//   - todo asset selecionado cita ID, fonte, compatibilidade e proposito.
//
// Alem dos casos sinteticos, valida os manifestos REAIS do repositorio: um
// manifesto quebrado deve derrubar este teste, nao aparecer no render.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fingerprintOf } from './refresh-motion-fingerprints.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(path.join(tmpdir(), 'cena-raiz-registry-test-'));

try {
  execFileSync(process.execPath, [
    path.join(projectRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    path.join(projectRoot, 'src/application/motion/motion-asset-registry.ts'),
    '--bundle', '--platform=node', '--format=esm',
    `--outfile=${path.join(work, 'registry.mjs')}`,
  ], { stdio: 'inherit' });

  const {
    validateMotionAssetManifest, buildMotionAssetRegistry,
    selectMotionAssets, validateAssetParameters,
  } = await import(pathToFileURL(path.join(work, 'registry.mjs')).href);

  const base = () => ({
    schemaVersion: '1.0',
    assetId: 'a1', version: '1.0.0', name: 'Asset 1', engine: 'remotion',
    source: { component: 'src/X.tsx' },
    capabilities: ['caption'], brandTags: [], aspectRatios: ['9:16'],
    duration: { mode: 'stretchable', defaultFrames: 60, minFrames: 20, maxFrames: 300 },
    parameters: { text: { type: 'string', required: true, maxLength: 100 } },
    preview: { thumbnail: 'p/a1.png' }, compatibility: {},
    fingerprint: 'sha256:abc',
  });

  // --- Validacao ----------------------------------------------------------
  assert.equal(validateMotionAssetManifest(base()).valid, true);

  const recusa = (mutar, campo) => {
    const m = base(); mutar(m);
    const r = validateMotionAssetManifest(m);
    assert.equal(r.valid, false, `deveria recusar: ${campo}`);
    assert.ok(r.issues.some((i) => i.path.startsWith(campo)),
      `esperava ${campo}, veio: ${r.issues.map((i) => i.path).join(', ')}`);
  };

  recusa((m) => { m.schemaVersion = '2.0'; }, 'schemaVersion');
  recusa((m) => { m.assetId = ''; }, 'assetId');
  recusa((m) => { m.fingerprint = ''; }, 'fingerprint');
  recusa((m) => { m.engine = 'blender'; }, 'engine');
  recusa((m) => { m.capabilities = []; }, 'capabilities');
  recusa((m) => { m.aspectRatios = []; }, 'aspectRatios');
  recusa((m) => { m.preview = {}; }, 'preview.thumbnail');
  // Cada motor exige um campo de origem diferente.
  recusa((m) => { m.source = { file: 'x.mp4' }; }, 'source.component');
  recusa((m) => { m.engine = 'after-effects'; m.source = { component: 'x' }; }, 'source.composition');
  // Um asset fixo com faixa declarada mente sobre o proprio comportamento.
  recusa((m) => { m.duration = { mode: 'fixed', defaultFrames: 60, minFrames: 10 }; }, 'duration');
  recusa((m) => { m.parameters = { c: { type: 'enum', values: [] } }; }, 'parameters.c.values');

  // --- Determinismo -------------------------------------------------------
  const a = { ...base(), assetId: 'aaa' };
  const b = { ...base(), assetId: 'bbb' };
  const r1 = buildMotionAssetRegistry([{ ref: 'x', raw: a }, { ref: 'y', raw: b }]);
  const r2 = buildMotionAssetRegistry([{ ref: 'y', raw: b }, { ref: 'x', raw: a }]);
  assert.deepEqual(r1.assets.map((m) => m.assetId), r2.assets.map((m) => m.assetId),
    'a ordem de entrada nao pode mudar o registry');
  assert.deepEqual(r1.assets.map((m) => m.assetId), ['aaa', 'bbb']);

  // --- Invalidos e duplicados nao chegam ao planner ------------------------
  const comLixo = buildMotionAssetRegistry([
    { ref: 'ok.json', raw: base() },
    { ref: 'quebrado.json', raw: { schemaVersion: '1.0' } },
    { ref: 'dup.json', raw: base() },
    { ref: 'nao-e-objeto.json', raw: 'texto' },
  ]);
  assert.equal(comLixo.assets.length, 1, 'so o valido entra');
  assert.equal(comLixo.rejected.length, 3);
  assert.ok(comLixo.rejected.some((r) => r.reason === 'duplicate'), 'duplicado e rejeitado explicitamente');
  assert.ok(comLixo.rejected.every((r) => r.ref && r.reason),
    'rejeicao silenciosa esconde asset quebrado: toda rejeicao cita ref e motivo');

  // --- Selecao ------------------------------------------------------------
  const reg = buildMotionAssetRegistry([
    { ref: '1', raw: { ...base(), assetId: 'cap-9x16', aspectRatios: ['9:16'] } },
    { ref: '2', raw: { ...base(), assetId: 'cap-16x9', aspectRatios: ['16:9'] } },
    { ref: '3', raw: { ...base(), assetId: 'cap-marca', brandTags: ['pleasing'] } },
    { ref: '4', raw: { ...base(), assetId: 'graf', capabilities: ['graphic'] } },
    { ref: '5', raw: { ...base(), assetId: 'fixo', duration: { mode: 'fixed', defaultFrames: 30 } } },
  ]);

  const sel = selectMotionAssets(reg, { capability: 'caption', aspectRatio: '9:16' });
  const ids = sel.matches.map((m) => m.assetId);
  assert.ok(!ids.includes('cap-16x9'), 'formato incompativel fora');
  assert.ok(!ids.includes('graf'), 'capacidade diferente fora');
  assert.ok(sel.matches.every((m) => m.compatibility.length > 0),
    'toda selecao precisa citar por que o asset e compativel');
  assert.ok(sel.matches.every((m) => m.assetId && m.source && m.engine),
    'toda selecao cita ID, fonte e motor');
  assert.ok(sel.rejections.every((r) => r.reason), 'toda rejeicao explica o motivo');

  // Marca especifica ganha do neutro; asset de outra marca e recusado.
  const comMarca = selectMotionAssets(reg, { capability: 'caption', aspectRatio: '9:16', brandTag: 'pleasing' });
  assert.equal(comMarca.matches[0].assetId, 'cap-marca', 'asset da marca vem primeiro');
  const outraMarca = selectMotionAssets(reg, { capability: 'caption', aspectRatio: '9:16', brandTag: 'outra' });
  assert.ok(!outraMarca.matches.some((m) => m.assetId === 'cap-marca'), 'asset de outra marca fora');

  // Duracao: fixo so serve se bater exatamente.
  const curto = selectMotionAssets(reg, { capability: 'caption', aspectRatio: '9:16', frames: 30 });
  assert.ok(curto.matches.some((m) => m.assetId === 'fixo'), 'fixo de 30f atende 30f');
  const longo = selectMotionAssets(reg, { capability: 'caption', aspectRatio: '9:16', frames: 200 });
  assert.ok(!longo.matches.some((m) => m.assetId === 'fixo'), 'fixo de 30f nao atende 200f');

  // Abstencao e resposta legitima. Forcar escolha ruim e pior que nao escolher.
  const nada = selectMotionAssets(reg, { capability: 'inexistente', aspectRatio: '9:16' });
  assert.deepEqual(nada.matches, [], 'sem asset compativel, o sistema se abstem');
  assert.ok(nada.rejections.length > 0, 'e explica o que descartou');

  // Fonte ausente quebra o render depois, no meio da fila. Barrar antes.
  const comFonte = buildMotionAssetRegistry([
    { ref: '1', raw: { ...base(), assetId: 'precisa-fonte', compatibility: { requiredFonts: ['Poppins'] } } },
  ]);
  assert.equal(selectMotionAssets(comFonte,
    { capability: 'caption', aspectRatio: '9:16', requiredFonts: [] }).matches.length, 0);
  assert.equal(selectMotionAssets(comFonte,
    { capability: 'caption', aspectRatio: '9:16', requiredFonts: ['Poppins'] }).matches.length, 1);

  // --- Parametros: campo inventado pelo modelo nao chega ao motor ----------
  const asset = base();
  assert.deepEqual(validateAssetParameters(asset, { text: 'ola' }), []);
  const inventado = validateAssetParameters(asset, { text: 'ola', glow: true });
  assert.ok(inventado.some((i) => i.path === 'glow'), 'parametro nao declarado e recusado');
  assert.ok(validateAssetParameters(asset, {}).some((i) => i.path === 'text'), 'obrigatorio ausente');
  assert.ok(validateAssetParameters(asset, { text: 'x'.repeat(200) }).length > 0, 'maxLength respeitado');

  const comCor = { ...base(), parameters: { c: { type: 'color', required: true } } };
  assert.deepEqual(validateAssetParameters(comCor, { c: '#09b5b7' }), []);
  assert.ok(validateAssetParameters(comCor, { c: 'teal' }).length > 0, 'cor exige #rrggbb');

  // --- Os manifestos REAIS do repositorio ---------------------------------
  const dir = path.join(projectRoot, 'resources', 'motion-assets', 'manifests');
  assert.ok(existsSync(dir), 'o diretorio de manifestos deve existir');
  const arquivos = readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(arquivos.length >= 5, `WP3 pede 5 a 10 assets; achei ${arquivos.length}`);

  const reais = buildMotionAssetRegistry(arquivos.map((f) => ({
    ref: f, raw: JSON.parse(readFileSync(path.join(dir, f), 'utf8')),
  })));
  assert.deepEqual(reais.rejected, [],
    `manifesto real invalido:\n${JSON.stringify(reais.rejected, null, 2)}`);
  assert.equal(reais.assets.length, arquivos.length);

  // Toda fonte declarada precisa apontar para arquivo que existe, e o
  // fingerprint precisa bater com o conteudo desse arquivo. Sem isso o
  // manifesto descreve um asset que ja mudou e ninguem percebe.
  const tpl = path.join(projectRoot, 'resources', 'remotion-template');
  for (const m of reais.assets) {
    const rel = m.source.component ?? m.source.file;
    assert.ok(rel, `${m.assetId} sem origem resolvivel`);
    const origem = path.join(tpl, rel);
    assert.ok(existsSync(origem), `${m.assetId} aponta para arquivo inexistente: ${rel}`);
    assert.equal(m.fingerprint, fingerprintOf(origem),
      `${m.assetId}: ${rel} mudou depois que o manifesto foi escrito. ` +
      'Revise o manifesto e rode: node scripts/refresh-motion-fingerprints.mjs --write');
  }

  // O registry real responde a uma consulta de cena de verdade.
  const legendas = selectMotionAssets(reais, { capability: 'caption', aspectRatio: '9:16', requiredFonts: ['Poppins'] });
  assert.ok(legendas.matches.length >= 3, 'as tres legendas registradas devem ser elegiveis');
  const transicoes = selectMotionAssets(reais, { capability: 'transition', aspectRatio: '9:16' });
  assert.ok(transicoes.matches.length >= 1, 'sound design de transicao registrado');

  console.log(`test:motion-registry ok — 11 recusas de manifesto invalido, determinismo por ordem de entrada, duplicados e incompativeis barrados, abstencao quando nada serve, parametro inventado recusado, e os ${reais.assets.length} manifestos reais validados com origem existente no disco.`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
