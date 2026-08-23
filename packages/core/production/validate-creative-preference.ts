// Validador do CreativePreference.
//
// A regra central do § 3.4 que a forma não garante: uma correção feita numa
// produção não vira regra global sem aprovação. O validador exige que o escopo
// seja completo — `production` sem `productionId`, ou `channel` sem `value`,
// seria uma regra de alcance indefinido, e alcance indefinido tende ao global.
//
// Exige também aprovador e evidência: preferência sem quem aprovou e sem o que
// a originou é memória de chat com outro nome.

import type { CreativePreference } from '../../contracts/production/creative-preference';

export interface CreativePreferenceValidationIssue {
  path: string;
  message: string;
}

export type CreativePreferenceValidationResult =
  | { valid: true; preference: CreativePreference }
  | { valid: false; issues: CreativePreferenceValidationIssue[] };

const SCOPE_KINDS = ['brand', 'format', 'channel', 'campaign', 'production'] as const;
const POLARITIES = ['prefer', 'avoid', 'require'] as const;
const DIMENSIONS = [
  'pacing', 'typography', 'color', 'motion', 'audio',
  'framing', 'copy', 'asset-reuse', 'engine',
] as const;
const ORIGINS = ['approval', 'rejection', 'correction'] as const;
const STATUSES = ['active', 'superseded', 'expired', 'revoked'] as const;

/** Do mais estreito ao mais amplo. Usado para resolver conflito entre escopos. */
const SCOPE_SPECIFICITY: Record<string, number> = {
  production: 0, campaign: 1, channel: 2, format: 3, brand: 4,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validDate(value: unknown): boolean {
  return nonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function enumValue(
  value: unknown,
  allowed: readonly string[],
  path: string,
  issues: CreativePreferenceValidationIssue[],
): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    issues.push({ path, message: `valor aceito: ${allowed.join(' | ')}` });
  }
}

export function validateCreativePreference(value: unknown): CreativePreferenceValidationResult {
  const issues: CreativePreferenceValidationIssue[] = [];

  if (!isObject(value)) {
    return { valid: false, issues: [{ path: '', message: 'preferência deve ser um objeto' }] };
  }

  if (value.schemaVersion !== '1.0') {
    issues.push({ path: 'schemaVersion', message: 'valor aceito: 1.0' });
  }
  if (!nonEmptyString(value.preferenceId)) {
    issues.push({ path: 'preferenceId', message: 'obrigatório' });
  }
  if (typeof value.version !== 'number' || !Number.isInteger(value.version) || value.version < 1) {
    issues.push({ path: 'version', message: 'deve ser inteiro >= 1' });
  }
  enumValue(value.status, STATUSES, 'status', issues);
  enumValue(value.dimension, DIMENSIONS, 'dimension', issues);
  enumValue(value.polarity, POLARITIES, 'polarity', issues);
  enumValue(value.origin, ORIGINS, 'origin', issues);

  if (!nonEmptyString(value.rule)) {
    issues.push({ path: 'rule', message: 'obrigatório' });
  }

  if (typeof value.priority !== 'number' || !Number.isFinite(value.priority)) {
    issues.push({ path: 'priority', message: 'deve ser número' });
  }

  // --- escopo: onde a regra do §3.4 é defendida
  if (!isObject(value.scope)) {
    issues.push({ path: 'scope', message: 'obrigatório' });
  } else {
    const scope = value.scope;
    enumValue(scope.kind, SCOPE_KINDS, 'scope.kind', issues);
    if (!nonEmptyString(scope.brandId)) {
      issues.push({ path: 'scope.brandId', message: 'obrigatório; toda preferência pertence a uma marca' });
    }
    if (scope.kind === 'production' && !nonEmptyString(scope.productionId)) {
      issues.push({
        path: 'scope.productionId',
        message: 'obrigatório quando kind é "production"; sem ele o alcance fica indefinido',
      });
    }
    if (
      (scope.kind === 'format' || scope.kind === 'channel' || scope.kind === 'campaign') &&
      !nonEmptyString(scope.value)
    ) {
      issues.push({
        path: 'scope.value',
        message: `obrigatório quando kind é "${String(scope.kind)}"`,
      });
    }
    // Escopo amplo carregando productionId sugere correcao local promovida a
    // global sem passar por decisao. O §3.4 proibe exatamente isso.
    if (
      typeof scope.kind === 'string' &&
      SCOPE_SPECIFICITY[scope.kind] > SCOPE_SPECIFICITY.production &&
      nonEmptyString(scope.productionId)
    ) {
      issues.push({
        path: 'scope',
        message: `kind "${scope.kind}" não deve carregar productionId; use evidence.productionId para registrar a origem`,
      });
    }
  }

  // --- evidência: o que originou a regra
  if (!isObject(value.evidence)) {
    issues.push({ path: 'evidence', message: 'obrigatório; preferência sem origem é memória de chat' });
  } else {
    const evidence = value.evidence;
    if (!nonEmptyString(evidence.productionId)) {
      issues.push({ path: 'evidence.productionId', message: 'obrigatório' });
    }
    if (typeof evidence.version !== 'number' || !Number.isInteger(evidence.version)) {
      issues.push({ path: 'evidence.version', message: 'deve ser inteiro' });
    }
    if (!nonEmptyString(evidence.statement)) {
      issues.push({ path: 'evidence.statement', message: 'obrigatório' });
    }
  }

  if (value.expiresAt !== undefined && !validDate(value.expiresAt)) {
    issues.push({ path: 'expiresAt', message: 'deve ser data ISO-8601' });
  }

  // --- proveniência: quem aprovou
  if (!isObject(value.provenance)) {
    issues.push({ path: 'provenance', message: 'obrigatório' });
  } else {
    const p = value.provenance;
    if (!validDate(p.createdAt)) {
      issues.push({ path: 'provenance.createdAt', message: 'deve ser data ISO-8601' });
    }
    if (!nonEmptyString(p.approvedBy)) {
      issues.push({ path: 'provenance.approvedBy', message: 'obrigatório; regra sem aprovador não é correção aprovada' });
    }
    if (!validDate(p.approvedAt)) {
      issues.push({ path: 'provenance.approvedAt', message: 'deve ser data ISO-8601' });
    }
  }

  // Status `superseded` sem apontar a substituta deixa o historico quebrado.
  if (value.status === 'superseded' && !nonEmptyString(value.supersedes)) {
    // `supersedes` aponta para a ANTERIOR; uma preferencia substituida precisa
    // que alguem aponte para ela, o que este contrato sozinho nao prova. Aqui
    // exigimos apenas coerencia minima: substituida nao pode continuar ativa.
    issues.push({
      path: 'status',
      message: 'preferência "superseded" precisa declarar supersedes com a regra que a substituiu',
    });
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, preference: value as unknown as CreativePreference };
}

/**
 * Resolve conflito entre preferências aplicáveis: a mais específica vence; em
 * empate, a de maior prioridade; persistindo o empate, a mais recente.
 *
 * Determinística por desenho — o planner do passo 8 não deve improvisar
 * desempate, senão a mesma entrada produz direções diferentes.
 */
export function resolvePreferenceConflict(
  preferences: readonly CreativePreference[],
): CreativePreference | null {
  const active = preferences.filter((p) => p.status === 'active');
  if (active.length === 0) return null;

  return [...active].sort((a, b) => {
    const specificity = SCOPE_SPECIFICITY[a.scope.kind] - SCOPE_SPECIFICITY[b.scope.kind];
    if (specificity !== 0) return specificity;
    if (a.priority !== b.priority) return b.priority - a.priority;
    const timeA = Date.parse(a.provenance.approvedAt);
    const timeB = Date.parse(b.provenance.approvedAt);
    if (timeA !== timeB) return timeB - timeA;
    return a.preferenceId < b.preferenceId ? -1 : 1;
  })[0];
}

export function formatCreativePreferenceIssues(issues: CreativePreferenceValidationIssue[]): string {
  return issues.map((i) => (i.path ? `${i.path}: ${i.message}` : i.message)).join('\n');
}
