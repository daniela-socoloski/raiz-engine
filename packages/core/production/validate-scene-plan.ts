// Validador do ScenePlan.
//
// Defende as regras do § 3.3 que a forma sozinha não garante:
//   - janela temporal coerente e não invertida;
//   - `narrativeBeat` presente — cena sem beat é decoração;
//   - `motionNeed.function` descrevendo função, não keyframe;
//   - evidência apontando para uma fonte declarada, não para prosa solta.
//
// Valida também o conjunto de cenas de um plano: `sceneId` único e janelas sem
// sobreposição. Duas cenas ocupando o mesmo frame é contradição, não estilo.

import type { ScenePlan } from '../../contracts/production/scene-plan';

export interface ScenePlanValidationIssue {
  path: string;
  message: string;
}

export type ScenePlanValidationResult =
  | { valid: true; scene: ScenePlan }
  | { valid: false; issues: ScenePlanValidationIssue[] };

export type ScenePlanListValidationResult =
  | { valid: true; scenes: ScenePlan[] }
  | { valid: false; issues: ScenePlanValidationIssue[] };

const PURPOSES = [
  'hook', 'clarify', 'emphasize', 'compare', 'explain-data',
  'transition', 'identify', 'call-to-action',
] as const;
const ENGINES = ['ffmpeg', 'remotion', 'after-effects', 'premiere', 'image-provider'] as const;
const MEDIA_KINDS = ['none', 'text', 'image', 'video', 'graphic'] as const;
const INTENSITIES = ['low', 'medium', 'high'] as const;
const AUDIO_ROLES = ['silence', 'voice', 'music', 'effect', 'mixed'] as const;
const EVIDENCE_SOURCES = ['brief', 'content-analysis', 'brand-profile', 'creative-preference'] as const;

/**
 * Vocabulário de keyframe. `motionNeed.function` deve dizer o que o movimento
 * cumpre; se descreve a mecânica, a decisão de execução vazou para o plano e o
 * passo 11 perde a liberdade de escolher motor.
 */
const KEYFRAME_WORDS = [
  'keyframe', 'easing', 'cubic-bezier', 'translatex', 'translatey',
  'opacity:', 'scale(', 'rotate(', 'px/s', 'framer-motion', 'spring(',
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function enumValue(
  value: unknown,
  allowed: readonly string[],
  path: string,
  issues: ScenePlanValidationIssue[],
): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    issues.push({ path, message: `valor aceito: ${allowed.join(' | ')}` });
  }
}

export function validateScenePlan(value: unknown, path = ''): ScenePlanValidationResult {
  const issues: ScenePlanValidationIssue[] = [];
  const at = (suffix: string) => (path ? `${path}.${suffix}` : suffix);

  if (!isObject(value)) {
    return { valid: false, issues: [{ path, message: 'cena deve ser um objeto' }] };
  }

  if (!nonEmptyString(value.sceneId)) {
    issues.push({ path: at('sceneId'), message: 'obrigatório' });
  }

  const start = value.startFrame;
  const end = value.endFrame;
  const okStart = typeof start === 'number' && Number.isInteger(start) && start >= 0;
  const okEnd = typeof end === 'number' && Number.isInteger(end) && end >= 0;
  if (!okStart) issues.push({ path: at('startFrame'), message: 'deve ser inteiro >= 0' });
  if (!okEnd) issues.push({ path: at('endFrame'), message: 'deve ser inteiro >= 0' });
  if (okStart && okEnd && end <= start) {
    issues.push({ path, message: 'endFrame deve ser maior que startFrame' });
  }

  enumValue(value.purpose, PURPOSES, at('purpose'), issues);

  // Sem beat, a cena nao declara o que cumpre na narrativa.
  if (!nonEmptyString(value.narrativeBeat)) {
    issues.push({ path: at('narrativeBeat'), message: 'obrigatório; cena sem beat é decoração' });
  }

  if (value.mediaNeed !== undefined) {
    if (!isObject(value.mediaNeed)) {
      issues.push({ path: at('mediaNeed'), message: 'deve ser objeto' });
    } else {
      enumValue(value.mediaNeed.kind, MEDIA_KINDS, at('mediaNeed.kind'), issues);
    }
  }

  if (value.motionNeed !== undefined) {
    if (!isObject(value.motionNeed)) {
      issues.push({ path: at('motionNeed'), message: 'deve ser objeto' });
    } else {
      const fn = value.motionNeed.function;
      if (!nonEmptyString(fn)) {
        issues.push({ path: at('motionNeed.function'), message: 'obrigatório' });
      } else {
        const lowered = fn.toLowerCase();
        const leak = KEYFRAME_WORDS.find((word) => lowered.includes(word));
        if (leak) {
          issues.push({
            path: at('motionNeed.function'),
            message: `descreve execução ("${leak}"), não função; keyframe nasce no passo 11`,
          });
        }
      }
      enumValue(value.motionNeed.intensity, INTENSITIES, at('motionNeed.intensity'), issues);
    }
  }

  if (value.audioNeed !== undefined) {
    if (!isObject(value.audioNeed)) {
      issues.push({ path: at('audioNeed'), message: 'deve ser objeto' });
    } else {
      enumValue(value.audioNeed.role, AUDIO_ROLES, at('audioNeed.role'), issues);
    }
  }

  if (value.prohibitions !== undefined) {
    if (!Array.isArray(value.prohibitions)) {
      issues.push({ path: at('prohibitions'), message: 'deve ser lista' });
    } else {
      value.prohibitions.forEach((item, index) => {
        const p = at(`prohibitions[${index}]`);
        if (!isObject(item)) { issues.push({ path: p, message: 'deve ser objeto' }); return; }
        if (!nonEmptyString(item.rule)) issues.push({ path: `${p}.rule`, message: 'obrigatório' });
        // Proibicao sem motivo vira dogma que ninguem consegue revisar.
        if (!nonEmptyString(item.reason)) issues.push({ path: `${p}.reason`, message: 'obrigatório' });
      });
    }
  }

  if (value.evidence !== undefined) {
    if (!Array.isArray(value.evidence)) {
      issues.push({ path: at('evidence'), message: 'deve ser lista' });
    } else {
      value.evidence.forEach((item, index) => {
        const p = at(`evidence[${index}]`);
        if (!isObject(item)) { issues.push({ path: p, message: 'deve ser objeto' }); return; }
        enumValue(item.source, EVIDENCE_SOURCES, `${p}.source`, issues);
        if (!nonEmptyString(item.reference)) issues.push({ path: `${p}.reference`, message: 'obrigatório' });
        if (!nonEmptyString(item.supports)) issues.push({ path: `${p}.supports`, message: 'obrigatório' });
      });
    }
  }

  if (value.engineRecommendation !== undefined) {
    enumValue(value.engineRecommendation, ENGINES, at('engineRecommendation'), issues);
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, scene: value as unknown as ScenePlan };
}

/**
 * Valida o conjunto. Cena isolada pode estar correta e o plano ainda ser
 * incoerente: dois `sceneId` iguais, ou duas cenas ocupando o mesmo frame.
 */
export function validateScenePlanList(value: unknown): ScenePlanListValidationResult {
  const issues: ScenePlanValidationIssue[] = [];

  if (!Array.isArray(value)) {
    return { valid: false, issues: [{ path: 'scenes', message: 'deve ser lista' }] };
  }

  const scenes: ScenePlan[] = [];
  const seen = new Set<string>();

  value.forEach((raw, index) => {
    const path = `scenes[${index}]`;
    const result = validateScenePlan(raw, path);
    if (!result.valid) { issues.push(...result.issues); return; }

    const scene = result.scene;
    if (seen.has(scene.sceneId)) {
      issues.push({ path: `${path}.sceneId`, message: `duplicado: "${scene.sceneId}"` });
    } else {
      seen.add(scene.sceneId);
    }
    scenes.push(scene);
  });

  // Sobreposicao so faz sentido comparar entre cenas ja validas.
  const ordered = [...scenes].sort((a, b) => a.startFrame - b.startFrame);
  for (let i = 1; i < ordered.length; i += 1) {
    const previous = ordered[i - 1];
    const current = ordered[i];
    if (current.startFrame < previous.endFrame) {
      issues.push({
        path: 'scenes',
        message: `"${previous.sceneId}" e "${current.sceneId}" se sobrepõem entre os frames ${current.startFrame} e ${previous.endFrame}`,
      });
    }
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, scenes };
}

export function formatScenePlanIssues(issues: ScenePlanValidationIssue[]): string {
  return issues.map((i) => (i.path ? `${i.path}: ${i.message}` : i.message)).join('\n');
}
