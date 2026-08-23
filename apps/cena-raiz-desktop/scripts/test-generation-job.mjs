import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-generation-job-test-'));

const bundle = (entry, name) => {
  const output = path.join(work, name);
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    entry, '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });
  return pathToFileURL(output).href;
};

try {
  const { validateGenerationJob, looksLikeLogo, soundFallback } = await import(
    bundle('./packages/core/production/validate-generation-job.ts', 'job.mjs'));
  const { selectProvider, planExecutionPaths } = await import(
    bundle('./packages/core/production/capability-registry.ts', 'registry.mjs'));

  // ------------------------------------------------------- capacidades
  const higgsfield = {
    schemaVersion: '1.0',
    providerId: 'higgsfield-cli',
    displayName: 'Higgsfield CLI',
    availability: 'ok',
    probedAt: '2026-08-20T12:00:00.000Z',
    image: {
      models: ['gpt_image_2'],
      aspectRatios: ['9:16', '1:1', '16:9'],
      resolutions: ['1k', '2k', '4k'],
      qualities: ['low', 'medium', 'high'],
      acceptsReferences: true,
      maxReferences: 4,
    },
    video: {
      models: ['seedance_2_0'],
      aspectRatios: ['9:16', '1:1', '16:9'],
      resolutions: ['480p', '720p', '1080p'],
      durationSecondsMin: 4,
      durationSecondsMax: 15,
      modes: ['std', 'fast'],
      genres: ['auto', 'drama', 'epic', 'action'],
      sound: 'parameter',
      acceptsImages: true,
      maxImages: 6,
    },
  };

  const magnific = {
    ...higgsfield,
    providerId: 'freepik-magnific-mcp',
    displayName: 'Freepik / Magnific',
    image: { ...higgsfield.image, models: ['magnific'] },
    video: { ...higgsfield.video, models: ['magnific-video'], sound: 'never' },
  };

  // --------------------------------------------- Capability Registry
  // Só um caminho: usa e não pergunta.
  const single = selectProvider([higgsfield], 'video');
  assert.equal(single.outcome, 'use');
  assert.equal(single.providerId, 'higgsfield-cli');

  // Dois caminhos: pergunta uma vez.
  assert.equal(selectProvider([higgsfield, magnific], 'video').outcome, 'ask');

  // Escolha já registrada vence sem nova pergunta.
  const preferred = selectProvider([higgsfield, magnific], 'video', 'freepik-magnific-mcp');
  assert.equal(preferred.outcome, 'use');
  assert.equal(preferred.providerId, 'freepik-magnific-mcp');

  // Preferência que não serve mais reabre a decisão em vez de apontar fantasma.
  assert.equal(
    selectProvider([higgsfield, magnific], 'video', 'provider-que-sumiu').outcome, 'ask');

  // Sessão expirada é recuperável e diz o que fazer.
  const expired = selectProvider(
    [{ ...higgsfield, availability: 'login-required' }], 'video');
  assert.equal(expired.outcome, 'blocked');
  assert.match(expired.reason, /login/u);

  // Sem gerador de vídeo, a produção não trava: pacote manual.
  const imageOnly = { ...higgsfield, video: undefined };
  const plan = planExecutionPaths([imageOnly]);
  assert.equal(plan.image.outcome, 'use');
  assert.equal(plan.needsManualPackage, true);

  // Imagem por um provider e vídeo por outro é caminho legítimo, e é dito.
  const split = planExecutionPaths(
    [{ ...magnific, video: undefined }, { ...higgsfield, image: undefined }]);
  assert.equal(split.splitPath, true);
  assert.equal(split.needsManualPackage, false);

  // ------------------------------------------------ heurística do logo
  for (const positivo of [
    'assets/logo/cliente.png',
    'assets/marca/logo-principal.png',
    'assets/referencias/LOGO.PNG',
  ]) assert.equal(looksLikeLogo(positivo), true, positivo);

  for (const negativo of [
    'assets/referencias/estilo-colagem.png',
    'edit/execution/frame/frame-01.png',
  ]) assert.equal(looksLikeLogo(negativo), false, negativo);

  // ------------------------------------------------------- job de vídeo
  const videoJob = {
    schemaVersion: '1.0',
    jobId: 'j1',
    kind: 'video',
    status: 'estimated',
    providerId: 'higgsfield-cli',
    sceneIds: ['s1', 's2'],
    promptPath: 'edit/execution/motion-generativo/motion/prompt-motion.txt',
    params: {
      model: 'seedance_2_0', aspectRatio: '9:16', resolution: '1080p',
      durationSeconds: 15, mode: 'std', genre: 'auto', sound: 'on',
    },
    attachments: [
      { role: 'frame', path: 'edit/execution/motion-generativo/frame/frame-01.png' },
      { role: 'product', path: 'assets/produto/frasco.png' },
      { role: 'logo', path: 'assets/logo/cliente.png' },
    ],
    estimate: { value: 120, unit: 'creditos', estimatedAt: '2026-08-20T12:00:00.000Z', providerId: 'higgsfield-cli' },
    outputPath: 'edit/execution/motion-generativo/motion/motion-01.mp4',
    provenance: { createdAt: '2026-08-20T12:00:00.000Z', model: 'seedance_2_0' },
  };

  const ok = validateGenerationJob(videoJob, higgsfield);
  assert.equal(ok.valid, true, JSON.stringify(ok.issues ?? []));
  assert.deepEqual(ok.warnings, []);

  const refuse = (mutate, code, label, cap = higgsfield) => {
    const candidate = structuredClone(videoJob);
    mutate(candidate);
    const result = validateGenerationJob(candidate, cap);
    assert.equal(result.valid, false, `deveria recusar: ${label}`);
    assert.ok(
      result.issues.some((i) => i.code === code),
      `${label}: esperava ${code}, veio ${JSON.stringify(result.issues)}`,
    );
  };

  // A ordem dos anexos amarra o prompt aos arquivos.
  refuse((j) => { j.attachments = [j.attachments[2], j.attachments[0], j.attachments[1]]; },
    'ATTACHMENT_ORDER_VIOLATION', 'logo antes do frame');

  // Vídeo sem frame não tem o que animar.
  refuse((j) => { j.attachments = j.attachments.filter((a) => a.role !== 'frame'); },
    'VIDEO_WITHOUT_FRAME', 'vídeo sem frame');

  // Fora da capacidade declarada do provider.
  refuse((j) => { j.params.durationSeconds = 30; },
    'DURATION_OUTSIDE_CAPABILITY', 'duração acima do máximo');
  refuse((j) => { j.params.durationSeconds = 2; },
    'DURATION_OUTSIDE_CAPABILITY', 'duração abaixo do mínimo');
  refuse((j) => { j.params.resolution = '4k'; },
    'OUTSIDE_PROVIDER_CAPABILITY', 'resolução não suportada');
  refuse((j) => { j.params.model = 'seedance_9_9'; },
    'OUTSIDE_PROVIDER_CAPABILITY', 'modelo desconhecido');

  // Vídeo custa mais que imagem: estimar depois de disparar não é estimar.
  refuse((j) => { j.status = 'dispatched'; delete j.estimate; },
    'DISPATCH_WITHOUT_ESTIMATE', 'disparo sem estimativa');

  // Job órfão: ninguém sabe qual cena aprovada ele cumpre.
  refuse((j) => { j.sceneIds = []; }, 'JOB_WITHOUT_SCENE', 'job sem cena');

  // Provider indisponível não recebe job.
  refuse((j) => { void j; }, 'PROVIDER_UNAVAILABLE', 'provider com sessão caída',
    { ...higgsfield, availability: 'login-required' });

  // Caminho pessoal absoluto vaza a máquina de quem editou.
  refuse((j) => { j.attachments[0].path = 'C:/Users/alguem/frame-01.png'; },
    'NON_PORTABLE_PATH', 'caminho absoluto');

  // Sem logo gera, mas avisa: a peça termina sem assinatura.
  const semLogo = structuredClone(videoJob);
  semLogo.attachments = semLogo.attachments.filter((a) => a.role !== 'logo');
  const semLogoResult = validateGenerationJob(semLogo, higgsfield);
  assert.equal(semLogoResult.valid, true);
  assert.ok(semLogoResult.warnings.some((w) => w.code === 'NO_LOGO'));

  // Provider que não expõe som avisa que o áudio fica com o modelo.
  const magnificJob = structuredClone(videoJob);
  magnificJob.providerId = 'freepik-magnific-mcp';
  magnificJob.params.model = 'magnific-video';
  const magnificResult = validateGenerationJob(magnificJob, magnific);
  assert.equal(magnificResult.valid, true, JSON.stringify(magnificResult.issues ?? []));
  assert.ok(magnificResult.warnings.some((w) => w.code === 'SOUND_PARAMETER_UNSUPPORTED'));

  // -------------------------------------------------------- job de imagem
  const imageJob = {
    ...structuredClone(videoJob),
    jobId: 'j2',
    kind: 'image',
    status: 'draft',
    sceneIds: ['s1'],
    params: { model: 'gpt_image_2', aspectRatio: '9:16', resolution: '2k', quality: 'high' },
    attachments: [{ role: 'frame', path: 'assets/referencias/estilo-colagem.png' }],
    outputPath: 'edit/execution/motion-generativo/frame/frame-01.png',
  };
  delete imageJob.estimate;

  const imageOk = validateGenerationJob(imageJob, higgsfield);
  assert.equal(imageOk.valid, true, JSON.stringify(imageOk.issues ?? []));

  // O logo nunca entra na imagem estática — nem declarado, nem disfarçado.
  const comLogo = structuredClone(imageJob);
  comLogo.attachments.push({ role: 'logo', path: 'assets/logo/cliente.png' });
  const comLogoResult = validateGenerationJob(comLogo, higgsfield);
  assert.equal(comLogoResult.valid, false);
  assert.ok(comLogoResult.issues.some((i) => i.code === 'LOGO_AS_IMAGE_REFERENCE'));

  const logoDisfarcado = structuredClone(imageJob);
  logoDisfarcado.attachments = [
    { role: 'frame', path: 'assets/referencias/logo-do-cliente.png' },
  ];
  const disfarcadoResult = validateGenerationJob(logoDisfarcado, higgsfield);
  assert.equal(disfarcadoResult.valid, false);
  assert.ok(disfarcadoResult.issues.some((i) => i.code === 'LOGO_LOOKALIKE_REFERENCE'));

  // kind e params precisam concordar.
  const trocado = structuredClone(imageJob);
  trocado.kind = 'video';
  const trocadoResult = validateGenerationJob(trocado, higgsfield);
  assert.equal(trocadoResult.valid, false);
  assert.ok(trocadoResult.issues.some((i) => i.code === 'KIND_PARAMS_MISMATCH'));

  // ----------------------------------------------- degradação do som
  const fallback = soundFallback(videoJob, higgsfield);
  assert.ok(fallback, 'provider com parâmetro de som permite retry sem ele');
  assert.equal(fallback.omitSoundParameter, true);
  assert.equal(fallback.outcome, 'model-default');

  // Provider que nunca expõe o parâmetro já nasceu sem ele: nada a repetir.
  assert.equal(soundFallback(videoJob, magnific), null);
  // Imagem não tem som.
  assert.equal(soundFallback(imageJob, higgsfield), null);

  console.log('test-generation-job: ok');
} finally {
  rmSync(work, { recursive: true, force: true });
}
