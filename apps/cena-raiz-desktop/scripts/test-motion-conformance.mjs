import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(desktopRoot, '..', '..');
const work = mkdtempSync(path.join(tmpdir(), 'raiz-motion-conformance-test-'));

try {
  const output = path.join(work, 'conformance.mjs');
  execFileSync(process.execPath, [
    path.join(desktopRoot, 'node_modules', 'esbuild', 'bin', 'esbuild'),
    './packages/core/production/validate-motion-need-against-profile.ts',
    '--bundle', '--platform=node', '--format=esm', `--outfile=${output}`,
  ], { cwd: repositoryRoot, stdio: 'inherit' });

  const { validateMotionNeedAgainstProfile, exceedsSimultaneousLimit } =
    await import(pathToFileURL(output).href);

  // Perfil de marca contida, com os números da gramática de motion medida.
  const profile = {
    intensity: 'low',
    allowedPatterns: ['slide-settle', 'mask-reveal', 'staggered-type-on'],
    prohibitedPatterns: ['elastic-bounce', 'continuous-wiggle', 'spin-entry'],
    timing: {
      entrance: { preferredMs: 467, minimumMs: 333, maximumMs: 600, evidenceReferenceFps: 30 },
      transition: { preferredMs: 733, minimumMs: 600, maximumMs: 933, evidenceReferenceFps: 30 },
    },
    dynamics: {
      preferredCharacter: 'precise',
      overshootMaximumPercent: 3,
      simultaneousMovingElementsMaximum: 2,
    },
  };

  const need = {
    function: 'emphasize', intensity: 'medium',
    subject: 'headline', patternFamily: 'slide-settle', behavior: 'enter-and-hold',
    direction: 'left-to-center',
    synchronization: { anchor: 'transcript-word', cue: 'agora', offsetFrames: 0 },
    envelope: {
      fps: 30,
      preferredDurationFrames: 12, minimumDurationFrames: 10, maximumDurationFrames: 16,
      travelPercent: 12, overshootPercent: 2, settleFrames: 4,
    },
  };

  const ok = validateMotionNeedAgainstProfile(need, profile);
  assert.equal(ok.conforms, true, JSON.stringify(ok.issues ?? []));
  assert.equal(ok.warnings.length, 0, 'perfil completo não deve gerar aviso');

  // --- invariante 1: padrão proibido pela marca
  const forbidden = { ...structuredClone(need), patternFamily: 'elastic-bounce' };
  const refusedForbidden = validateMotionNeedAgainstProfile(forbidden, profile);
  assert.equal(refusedForbidden.conforms, false);
  assert.ok(refusedForbidden.issues.some((i) => i.message.includes('prohibitedPatterns')));

  // --- invariante 1b: padrão fora do vocabulário declarado
  const unknown = { ...structuredClone(need), patternFamily: 'zoom-blast' };
  const refusedUnknown = validateMotionNeedAgainstProfile(unknown, profile);
  assert.equal(refusedUnknown.conforms, false);
  assert.ok(refusedUnknown.issues.some((i) => i.message.includes('allowedPatterns')));

  // --- invariante 2: envelope fora da faixa da marca
  const tooSlow = structuredClone(need);
  tooSlow.envelope.preferredDurationFrames = 24;   // marca aceita 10–18
  const refusedSlow = validateMotionNeedAgainstProfile(tooSlow, profile);
  assert.equal(refusedSlow.conforms, false);
  assert.ok(refusedSlow.issues.some((i) => i.path.endsWith('preferredDurationFrames')));

  // --- invariante 2b: transition usa outra faixa
  const asTransition = { ...structuredClone(need), function: 'transition' };
  asTransition.envelope = { fps: 30, preferredDurationFrames: 22, minimumDurationFrames: 18, maximumDurationFrames: 28 };
  assert.equal(validateMotionNeedAgainstProfile(asTransition, profile).conforms, true,
    '22 quadros é válido para transição, embora fosse inválido para entrada');

  // --- invariante 2c: incoerência interna da própria cena
  const inverted = structuredClone(need);
  inverted.envelope.minimumDurationFrames = 16;
  inverted.envelope.maximumDurationFrames = 10;
  assert.equal(validateMotionNeedAgainstProfile(inverted, profile).conforms, false);

  // --- quadro sem FPS nao e duracao
  const noFps = structuredClone(need);
  delete noFps.envelope.fps;
  const refusedNoFps = validateMotionNeedAgainstProfile(noFps, profile);
  assert.equal(refusedNoFps.conforms, false);
  assert.ok(refusedNoFps.issues.some((i) => i.path.endsWith('envelope.fps')));

  // --- o MESMO numero de quadros muda de veredito conforme o FPS
  const at60 = structuredClone(need);
  at60.envelope.fps = 60;   // 12 quadros a 60fps = 200ms, abaixo do minimo de 333ms
  const refused60 = validateMotionNeedAgainstProfile(at60, profile);
  assert.equal(refused60.conforms, false, '12 quadros a 60fps sao 200ms e nao cabem na marca');
  assert.ok(refused60.issues.some((i) => i.message.includes('200ms')));

  // --- invariante 3: overshoot acima do teto
  const bouncy = structuredClone(need);
  bouncy.envelope.overshootPercent = 8;            // teto da marca é 3
  const refusedBouncy = validateMotionNeedAgainstProfile(bouncy, profile);
  assert.equal(refusedBouncy.conforms, false);
  assert.ok(refusedBouncy.issues.some((i) => i.message.includes('teto da marca')));

  // --- regra raiz: âncora na palavra exige a palavra
  const noCue = structuredClone(need);
  delete noCue.synchronization.cue;
  const refusedCue = validateMotionNeedAgainstProfile(noCue, profile);
  assert.equal(refusedCue.conforms, false);
  assert.ok(refusedCue.issues.some((i) => i.message.includes('escolhido no olho')));

  // --- marca sem vocabulário: avisa, não aprova em silêncio
  const thin = { intensity: 'low' };
  const warned = validateMotionNeedAgainstProfile(need, thin);
  assert.equal(warned.conforms, true, 'perfil incompleto não invalida a cena');
  assert.ok(warned.warnings.some((w) => w.path.endsWith('patternFamily')));
  assert.ok(warned.warnings.some((w) => w.path.endsWith('envelope')));

  // --- modo strict: cobertura insuficiente vira erro no portao de aprovacao
  const strictThin = validateMotionNeedAgainstProfile(need, thin, { mode: 'strict' });
  assert.equal(strictThin.conforms, false, 'no portao, "nao deu para conferir" nao vale como conforme');
  assert.ok(strictThin.issues.some((i) => i.message.includes('cobertura insuficiente')));

  // e o perfil completo passa nos dois modos
  assert.equal(validateMotionNeedAgainstProfile(need, profile, { mode: 'strict' }).conforms, true);

  // --- limite de elementos simultâneos
  assert.equal(exceedsSimultaneousLimit(2, profile), false);
  assert.equal(exceedsSimultaneousLimit(3, profile), true);
  assert.equal(exceedsSimultaneousLimit(99, thin), false, 'sem limite declarado, não bloqueia');

  console.log('test:motion-conformance ok — padrão proibido e fora de vocabulário recusados, quadro sem FPS barrado, o mesmo 12 quadros aprovado a 30fps e recusado a 60fps, envelope conferido por função, overshoot acima do teto barrado, âncora sem palavra recusada, perfil incompleto avisa em lenient e reprova em strict.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
