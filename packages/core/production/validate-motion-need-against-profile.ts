// Validação cruzada: MotionNeed contra MotionProfile.
//
// A lacuna que este arquivo fecha: o `MotionProfile` declara a personalidade
// cinética da marca, e o `MotionNeed` escolhe valores para uma cena. Sem uma
// regra determinística ligando os dois, o planner pode propor movimento que
// contradiz a marca e ninguém percebe até o render — a personalidade vira
// decoração.
//
// Três invariantes, todos verificáveis:
//
//   1. `patternFamily` pertence a `allowedPatterns` e nunca a
//      `prohibitedPatterns`.
//   2. O envelope da cena cabe dentro do envelope da marca.
//   3. `overshootPercent` não excede o teto da marca.
//
// Violação é erro de contrato, não escolha estética. O planner pode abster-se;
// não pode contradizer a marca em silêncio.

import type { MotionProfile, DurationEnvelope } from '../../contracts/brand/brand-runtime-profile';
import type { MotionNeed } from '../../contracts/production/scene-plan';

export interface MotionConformanceIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export type MotionConformanceResult =
  | { conforms: true; warnings: MotionConformanceIssue[] }
  | { conforms: false; issues: MotionConformanceIssue[] };

/** Classe de envelope que a função do movimento consulta no perfil. */
function envelopeFor(profile: MotionProfile, need: MotionNeed): DurationEnvelope | undefined {
  if (!profile.timing) return undefined;
  switch (need.function) {
    case 'introduce':
    case 'reveal':
      return profile.timing.entrance;
    case 'transition':
      return profile.timing.transition;
    case 'conclude':
      return profile.timing.exit ?? profile.timing.transition;
    default:
      // `emphasize` e `compare` acontecem com o elemento já em tela; o
      // envelope de entrada é a referência mais próxima.
      return profile.timing.entrance;
  }
}

/**
 * `lenient` (padrão) aceita perfil sem vocabulário ou sem timing, avisando: o
 * compilador de marca pode legitimamente não achar evidência de motion no
 * corpus, e reprovar aí bloquearia toda produção até o corpus crescer.
 *
 * `strict` transforma cobertura insuficiente em erro. É o modo do portão de
 * aprovação: antes de um plano virar `review`, "não deu para conferir" não pode
 * valer como "está conforme".
 */
export type ConformanceMode = 'lenient' | 'strict';

export interface ConformanceOptions {
  mode?: ConformanceMode;
  path?: string;
}

export function validateMotionNeedAgainstProfile(
  need: MotionNeed,
  profile: MotionProfile,
  options: ConformanceOptions | string = {},
): MotionConformanceResult {
  // Assinatura antiga aceitava `path` como terceiro argumento posicional.
  const opts: ConformanceOptions = typeof options === 'string' ? { path: options } : options;
  const path = opts.path ?? 'motionNeed';
  const strict = opts.mode === 'strict';
  const issues: MotionConformanceIssue[] = [];
  const warnings: MotionConformanceIssue[] = [];

  // --- invariante 1: vocabulário
  if (need.patternFamily) {
    const prohibited = profile.prohibitedPatterns ?? [];
    if (prohibited.includes(need.patternFamily)) {
      issues.push({
        path: `${path}.patternFamily`,
        message: `"${need.patternFamily}" está em prohibitedPatterns da marca`,
        severity: 'error',
      });
    }
    const allowed = profile.allowedPatterns;
    if (allowed && allowed.length > 0 && !allowed.includes(need.patternFamily)) {
      issues.push({
        path: `${path}.patternFamily`,
        message: `"${need.patternFamily}" não está em allowedPatterns; a marca aceita: ${allowed.join(' | ')}`,
        severity: 'error',
      });
    }
    if (!allowed || allowed.length === 0) {
      // Sem vocabulário declarado a checagem não tem o que comparar. Avisar é
      // melhor que aprovar em silêncio: a marca ainda não foi compilada com
      // essa dimensão.
      const coverage = {
        path: `${path}.patternFamily`,
        message: strict
          ? 'a marca não declara allowedPatterns; cobertura insuficiente para aprovar'
          : 'a marca não declara allowedPatterns; o padrão não pôde ser conferido',
        severity: (strict ? 'error' : 'warning') as 'error' | 'warning',
      };
      (strict ? issues : warnings).push(coverage);
    }
  }

  // --- invariante 2: envelope de tempo
  const brandEnvelope = envelopeFor(profile, need);
  const sceneEnvelope = need.envelope;

  const declaresDuration =
    sceneEnvelope?.preferredDurationFrames !== undefined ||
    sceneEnvelope?.minimumDurationFrames !== undefined ||
    sceneEnvelope?.maximumDurationFrames !== undefined;

  // Quadro sem FPS nao e duracao: 14 quadros sao 467ms a 30fps e 233ms a 60fps.
  if (declaresDuration && !sceneEnvelope?.fps) {
    issues.push({
      path: `${path}.envelope.fps`,
      message: 'obrigatório quando há duração em quadros; sem FPS não há como comparar com o envelope da marca, que é em milissegundos',
      severity: 'error',
    });
  }

  if (sceneEnvelope && brandEnvelope && sceneEnvelope.fps) {
    const { minimumMs, maximumMs } = brandEnvelope;
    const fps = sceneEnvelope.fps;
    const toMs = (frames: number) => (frames / fps) * 1000;

    // Quadro e quantizado; milissegundo e continuo. Nenhuma fronteira de quadro
    // cai exatamente num limite arbitrario em ms — 28 quadros a 30fps sao
    // 933,33ms. Sem tolerancia de meio quadro, o validador reprovaria o valor
    // legitimo mais proximo do limite, que e justamente o que a marca aceita.
    const halfFrameMs = 1000 / fps / 2;

    for (const [key, value] of [
      ['preferredDurationFrames', sceneEnvelope.preferredDurationFrames],
      ['minimumDurationFrames', sceneEnvelope.minimumDurationFrames],
      ['maximumDurationFrames', sceneEnvelope.maximumDurationFrames],
    ] as const) {
      if (value === undefined) continue;
      const ms = toMs(value);
      if (ms < minimumMs - halfFrameMs || ms > maximumMs + halfFrameMs) {
        issues.push({
          path: `${path}.envelope.${key}`,
          message: `${value} quadros a ${fps}fps = ${Math.round(ms)}ms, fora da faixa da marca (${minimumMs}–${maximumMs}ms)`,
          severity: 'error',
        });
      }
    }

    const min = sceneEnvelope.minimumDurationFrames;
    const max = sceneEnvelope.maximumDurationFrames;
    if (min !== undefined && max !== undefined && min > max) {
      issues.push({
        path: `${path}.envelope`,
        message: 'minimumDurationFrames maior que maximumDurationFrames',
        severity: 'error',
      });
    }

    const preferred = sceneEnvelope.preferredDurationFrames;
    if (preferred !== undefined) {
      if (min !== undefined && preferred < min) {
        issues.push({
          path: `${path}.envelope.preferredDurationFrames`,
          message: 'preferido abaixo do mínimo declarado na própria cena',
          severity: 'error',
        });
      }
      if (max !== undefined && preferred > max) {
        issues.push({
          path: `${path}.envelope.preferredDurationFrames`,
          message: 'preferido acima do máximo declarado na própria cena',
          severity: 'error',
        });
      }
    }
  } else if (sceneEnvelope && !brandEnvelope && declaresDuration) {
    const coverage = {
      path: `${path}.envelope`,
      message: strict
        ? 'a marca não declara timing para esta função; cobertura insuficiente para aprovar'
        : 'a marca não declara timing para esta função; os valores não puderam ser conferidos',
      severity: (strict ? 'error' : 'warning') as 'error' | 'warning',
    };
    (strict ? issues : warnings).push(coverage);
  }

  // --- invariante 3: overshoot
  const ceiling = profile.dynamics?.overshootMaximumPercent;
  const overshoot = sceneEnvelope?.overshootPercent;
  if (overshoot !== undefined) {
    if (overshoot < 0) {
      issues.push({
        path: `${path}.envelope.overshootPercent`,
        message: 'não pode ser negativo',
        severity: 'error',
      });
    } else if (ceiling !== undefined && overshoot > ceiling) {
      issues.push({
        path: `${path}.envelope.overshootPercent`,
        message: `${overshoot}% excede o teto da marca (${ceiling}%)`,
        severity: 'error',
      });
    }
  }

  // --- ancoragem: a regra raiz do sistema
  if (need.synchronization?.anchor === 'transcript-word' && !need.synchronization.cue) {
    issues.push({
      path: `${path}.synchronization.cue`,
      message: 'âncora "transcript-word" exige a palavra; sem ela o tempo volta a ser escolhido no olho',
      severity: 'error',
    });
  }

  if (issues.length > 0) return { conforms: false, issues };
  return { conforms: true, warnings };
}

/**
 * Quantos elementos podem se mover ao mesmo tempo, segundo a marca. Cenas que
 * se sobrepõem no tempo somam movimento — dois dominantes simultâneos se anulam
 * e a hierarquia deixa de existir.
 */
export function exceedsSimultaneousLimit(
  concurrentMovingElements: number,
  profile: MotionProfile,
): boolean {
  const limit = profile.dynamics?.simultaneousMovingElementsMaximum;
  return limit !== undefined && concurrentMovingElements > limit;
}

export function formatMotionConformanceIssues(issues: MotionConformanceIssue[]): string {
  return issues
    .map((i) => `${i.severity === 'warning' ? 'aviso' : 'erro'} ${i.path}: ${i.message}`)
    .join('\n');
}
