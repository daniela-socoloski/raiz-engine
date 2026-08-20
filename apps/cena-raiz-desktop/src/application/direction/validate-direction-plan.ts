// Validacao do AudiovisualDirectionPlan.
//
// Fronteira de confianca: nada que venha de modelo, disco ou IPC entra no
// sistema sem passar por aqui. Um plano invalido nunca chega ao agente nem ao
// renderer.
//
// Sem dependencia externa. O criterio de aceitacao da primeira integracao diz
// "nenhum novo provider ou dependencia e necessario".
//
// Fonte: ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md secao 14.

import {
  PLAN_SCHEMA_VERSION,
  type AudiovisualDirectionPlan,
  type SceneDirection,
} from '../../domain/direction/audiovisual-direction-plan';

export interface ValidationIssue {
  /** Caminho ate o campo, ex.: `scenes[2].purpose`. */
  path: string;
  message: string;
}

export type ValidationResult =
  | { valid: true; plan: AudiovisualDirectionPlan }
  | { valid: false; issues: ValidationIssue[] };

const STATUS = ['draft', 'review', 'approved', 'superseded'] as const;
const FORMATS = ['9:16', '16:9', '1:1'] as const;
const PACE = ['slow', 'moderate', 'fast', 'variable'] as const;
const ENERGY = ['restrained', 'balanced', 'expressive'] as const;
const DENSITY = ['minimal', 'moderate', 'dense'] as const;
const PURPOSE = [
  'hook', 'clarify', 'emphasize', 'compare', 'transition', 'identify', 'call-to-action',
] as const;
const MEDIA_KIND = ['none', 'text', 'image', 'video', 'graphic'] as const;
const INTENSITY = ['low', 'medium', 'high'] as const;
const AUDIO_ROLE = ['silence', 'voice', 'music', 'effect', 'mixed'] as const;
const ENGINE = ['ffmpeg', 'remotion', 'after-effects', 'premiere', 'image-provider'] as const;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

const isFiniteInteger = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && Number.isFinite(v);

function checkEnum<T extends readonly string[]>(
  value: unknown, allowed: T, path: string, issues: ValidationIssue[],
): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    issues.push({ path, message: `deve ser um de: ${allowed.join(', ')}` });
  }
}

function checkStringArray(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!Array.isArray(value)) {
    issues.push({ path, message: 'deve ser um array de strings' });
    return;
  }
  value.forEach((item, i) => {
    if (typeof item !== 'string') {
      issues.push({ path: `${path}[${i}]`, message: 'deve ser string' });
    }
  });
}

function validateScene(scene: unknown, index: number, issues: ValidationIssue[]): void {
  const at = `scenes[${index}]`;
  if (!isObject(scene)) {
    issues.push({ path: at, message: 'deve ser um objeto' });
    return;
  }

  if (!isNonEmptyString(scene.sceneId)) {
    issues.push({ path: `${at}.sceneId`, message: 'obrigatorio, string nao vazia' });
  }
  if (!isFiniteInteger(scene.startFrame) || (scene.startFrame as number) < 0) {
    issues.push({ path: `${at}.startFrame`, message: 'inteiro >= 0' });
  }
  if (!isFiniteInteger(scene.endFrame) || (scene.endFrame as number) < 0) {
    issues.push({ path: `${at}.endFrame`, message: 'inteiro >= 0' });
  }
  // Uma cena que termina antes de comecar renderiza como nada, em silencio.
  if (isFiniteInteger(scene.startFrame) && isFiniteInteger(scene.endFrame)
      && (scene.endFrame as number) <= (scene.startFrame as number)) {
    issues.push({ path: `${at}.endFrame`, message: 'deve ser maior que startFrame' });
  }

  checkEnum(scene.purpose, PURPOSE, `${at}.purpose`, issues);
  if (!isNonEmptyString(scene.narrativeBeat)) {
    issues.push({ path: `${at}.narrativeBeat`, message: 'obrigatorio: toda cena declara sua funcao' });
  }

  if (scene.mediaNeed !== undefined) {
    if (!isObject(scene.mediaNeed)) {
      issues.push({ path: `${at}.mediaNeed`, message: 'deve ser objeto' });
    } else {
      checkEnum(scene.mediaNeed.kind, MEDIA_KIND, `${at}.mediaNeed.kind`, issues);
    }
  }
  if (scene.motionNeed !== undefined) {
    if (!isObject(scene.motionNeed)) {
      issues.push({ path: `${at}.motionNeed`, message: 'deve ser objeto' });
    } else {
      if (!isNonEmptyString(scene.motionNeed.function)) {
        issues.push({ path: `${at}.motionNeed.function`, message: 'declare a funcao do movimento' });
      }
      checkEnum(scene.motionNeed.intensity, INTENSITY, `${at}.motionNeed.intensity`, issues);
    }
  }
  if (scene.audioNeed !== undefined) {
    if (!isObject(scene.audioNeed)) {
      issues.push({ path: `${at}.audioNeed`, message: 'deve ser objeto' });
    } else {
      checkEnum(scene.audioNeed.role, AUDIO_ROLE, `${at}.audioNeed.role`, issues);
    }
  }
  if (scene.engineRecommendation !== undefined) {
    checkEnum(scene.engineRecommendation, ENGINE, `${at}.engineRecommendation`, issues);
  }
}

/**
 * Valida um plano vindo de qualquer fronteira: modelo, disco ou IPC.
 *
 * Nao lanca excecao. Devolve todos os problemas de uma vez, para que a correcao
 * possa ser feita num passo em vez de um erro por vez.
 */
export function validateDirectionPlan(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isObject(input)) {
    return { valid: false, issues: [{ path: '', message: 'plano deve ser um objeto' }] };
  }

  if (input.schemaVersion !== PLAN_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      message: `esta build produz e aceita "${PLAN_SCHEMA_VERSION}"; recebido ${JSON.stringify(input.schemaVersion)}`,
    });
  }
  if (!isNonEmptyString(input.planId)) {
    issues.push({ path: 'planId', message: 'obrigatorio' });
  }
  if (!isNonEmptyString(input.projectId)) {
    issues.push({ path: 'projectId', message: 'obrigatorio' });
  }
  if (!isFiniteInteger(input.version) || (input.version as number) < 1) {
    issues.push({ path: 'version', message: 'inteiro >= 1' });
  }
  checkEnum(input.status, STATUS, 'status', issues);

  if (!isObject(input.inputs)) {
    issues.push({ path: 'inputs', message: 'obrigatorio, mesmo que vazio' });
  }

  if (!isObject(input.intent)) {
    issues.push({ path: 'intent', message: 'obrigatorio' });
  } else {
    if (!isNonEmptyString(input.intent.objective)) {
      issues.push({ path: 'intent.objective', message: 'obrigatorio: um plano sem objetivo nao pode ser avaliado' });
    }
    checkEnum(input.intent.format, FORMATS, 'intent.format', issues);
    const dur = input.intent.targetDurationSeconds;
    if (dur !== undefined && (typeof dur !== 'number' || !Number.isFinite(dur) || dur <= 0)) {
      issues.push({ path: 'intent.targetDurationSeconds', message: 'numero > 0' });
    }
  }

  if (!isObject(input.direction)) {
    issues.push({ path: 'direction', message: 'obrigatorio' });
  } else {
    checkEnum(input.direction.pace, PACE, 'direction.pace', issues);
    checkEnum(input.direction.energy, ENERGY, 'direction.energy', issues);
    checkEnum(input.direction.density, DENSITY, 'direction.density', issues);
    checkStringArray(input.direction.visualHierarchy, 'direction.visualHierarchy', issues);
    checkStringArray(input.direction.soundPrinciples, 'direction.soundPrinciples', issues);
    checkStringArray(input.direction.prohibitedPatterns, 'direction.prohibitedPatterns', issues);
  }

  if (!Array.isArray(input.scenes)) {
    issues.push({ path: 'scenes', message: 'deve ser um array' });
  } else {
    input.scenes.forEach((scene, i) => validateScene(scene, i, issues));

    // IDs duplicados fazem duas cenas disputarem o mesmo slot no compilador.
    const ids = input.scenes
      .filter(isObject)
      .map((s) => s.sceneId)
      .filter(isNonEmptyString);
    const seen = new Set<string>();
    ids.forEach((id) => {
      if (seen.has(id)) issues.push({ path: 'scenes', message: `sceneId duplicado: ${id}` });
      seen.add(id);
    });
  }

  if (!isObject(input.provenance)) {
    issues.push({ path: 'provenance', message: 'obrigatorio: sem proveniencia o plano nao e auditavel' });
  } else {
    checkEnum(input.provenance.origin, ['user', 'planner', 'migration'], 'provenance.origin', issues);
    if (!isNonEmptyString(input.provenance.createdAt)) {
      issues.push({ path: 'provenance.createdAt', message: 'obrigatorio, ISO 8601' });
    } else if (Number.isNaN(Date.parse(input.provenance.createdAt as string))) {
      issues.push({ path: 'provenance.createdAt', message: 'data invalida' });
    }
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, plan: input as unknown as AudiovisualDirectionPlan };
}

/** Mensagem legivel para log e para a interface. */
export function formatValidationIssues(issues: ValidationIssue[]): string {
  return issues
    .map((i) => (i.path ? `  ${i.path}: ${i.message}` : `  ${i.message}`))
    .join('\n');
}

export type { SceneDirection };
