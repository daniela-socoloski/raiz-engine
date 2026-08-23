// Validador do ExecutionConstraint.
//
// Defende duas coisas que a forma não garante, e que são a razão de o contrato
// existir:
//
//   1. `mechanism` obrigatório. Regra sem mecanismo vira superstição: ninguém
//      sabe quando ela deixou de valer, e o sistema carrega dogma para sempre.
//   2. `evidence` obrigatória. "Alguém disse" não é fato técnico. Medição,
//      incidente pago ou documentação do upstream — uma das três.
//
// Um constraint com `effect: 'breaks-render'` e sem `check` é aceito, mas o
// validador avisa: sem verificação automática ele é aviso, não portão.

import type { ExecutionConstraint } from '../../contracts/production/execution-constraint';

export interface ExecutionConstraintValidationIssue {
  path: string;
  message: string;
  /** `warning` não invalida; sinaliza fraqueza que vale corrigir. */
  severity: 'error' | 'warning';
}

export type ExecutionConstraintValidationResult =
  | { valid: true; constraint: ExecutionConstraint; warnings: ExecutionConstraintValidationIssue[] }
  | { valid: false; issues: ExecutionConstraintValidationIssue[] };

const ENGINES = ['ffmpeg', 'remotion', 'after-effects', 'premiere', 'whisperx', 'any'] as const;
const DOMAINS = [
  'timing', 'motion', 'typography', 'color', 'audio',
  'container', 'render', 'determinism', 'readability',
] as const;
const EFFECTS = ['breaks-render', 'breaks-output', 'degrades'] as const;
const EVIDENCE_KINDS = ['measured', 'incident', 'upstream-documented'] as const;

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
  issues: ExecutionConstraintValidationIssue[],
): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    issues.push({ path, message: `valor aceito: ${allowed.join(' | ')}`, severity: 'error' });
  }
}

export function validateExecutionConstraint(value: unknown): ExecutionConstraintValidationResult {
  const issues: ExecutionConstraintValidationIssue[] = [];
  const warnings: ExecutionConstraintValidationIssue[] = [];

  if (!isObject(value)) {
    return {
      valid: false,
      issues: [{ path: '', message: 'constraint deve ser um objeto', severity: 'error' }],
    };
  }

  if (value.schemaVersion !== '1.0') {
    issues.push({ path: 'schemaVersion', message: 'valor aceito: 1.0', severity: 'error' });
  }
  if (!nonEmptyString(value.constraintId)) {
    issues.push({ path: 'constraintId', message: 'obrigatório', severity: 'error' });
  }

  enumValue(value.engine, ENGINES, 'engine', issues);
  enumValue(value.domain, DOMAINS, 'domain', issues);
  enumValue(value.effect, EFFECTS, 'effect', issues);

  if (!nonEmptyString(value.rule)) {
    issues.push({ path: 'rule', message: 'obrigatório', severity: 'error' });
  }

  // O campo que separa conhecimento de superstição.
  if (!nonEmptyString(value.mechanism)) {
    issues.push({
      path: 'mechanism',
      message: 'obrigatório; regra sem mecanismo vira dogma que ninguém sabe quando aposentar',
      severity: 'error',
    });
  }

  if (!isObject(value.evidence)) {
    issues.push({
      path: 'evidence',
      message: 'obrigatório; "alguém disse" não é fato técnico',
      severity: 'error',
    });
  } else {
    const evidence = value.evidence;
    enumValue(evidence.kind, EVIDENCE_KINDS, 'evidence.kind', issues);
    if (!nonEmptyString(evidence.statement)) {
      issues.push({ path: 'evidence.statement', message: 'obrigatório', severity: 'error' });
    }
    // Incidente sem produção não é auditável: ninguém consegue revisitar o caso.
    if (evidence.kind === 'incident' && !nonEmptyString(evidence.productionId)) {
      issues.push({
        path: 'evidence.productionId',
        message: 'obrigatório quando kind é "incident"',
        severity: 'error',
      });
    }
    // Medicao sem contexto vira dogma: numero de uma producao aplicado a todas.
    if (evidence.kind === 'measured') {
      const m = evidence.measurement;
      if (!isObject(m) || (!nonEmptyString((m as Record<string, unknown>).tool) &&
          !nonEmptyString((m as Record<string, unknown>).unit))) {
        issues.push({
          path: 'evidence.measurement',
          message: 'obrigatório quando kind é "measured"; declare ao menos unidade e ferramenta',
          severity: 'error',
        });
      }
    }

    // Fato de ferramenta sem versão não se sabe quando expira.
    if (evidence.kind === 'upstream-documented' && !nonEmptyString(evidence.toolVersion)) {
      warnings.push({
        path: 'evidence.toolVersion',
        message: 'sem versão da ferramenta não há como saber se o fato ainda vale',
        severity: 'warning',
      });
    }
  }

  if (value.check !== undefined) {
    if (!isObject(value.check)) {
      issues.push({ path: 'check', message: 'deve ser objeto', severity: 'error' });
    } else {
      const VALIDATOR_IDS = [
        'ffprobe-stream-property', 'ffprobe-format-property', 'loudness-ebur128',
        'frame-dimensions', 'transcript-alignment-delta',
      ];
      if (!VALIDATOR_IDS.includes(String(value.check.validatorId))) {
        issues.push({
          path: 'check.validatorId',
          message: `valor aceito: ${VALIDATOR_IDS.join(' | ')}; comando livre nao e aceito`,
          severity: 'error',
        });
      }
      if (!nonEmptyString(value.check.failureSignal)) {
        issues.push({ path: 'check.failureSignal', message: 'obrigatório', severity: 'error' });
      }
    }
  } else if (value.effect === 'breaks-render' || value.effect === 'breaks-output') {
    warnings.push({
      path: 'check',
      message: `efeito "${String(value.effect)}" sem verificação automática: é aviso, não portão`,
      severity: 'warning',
    });
  }

  if (!isObject(value.provenance)) {
    issues.push({ path: 'provenance', message: 'obrigatório', severity: 'error' });
  } else if (!validDate(value.provenance.recordedAt)) {
    issues.push({
      path: 'provenance.recordedAt',
      message: 'deve ser data ISO-8601',
      severity: 'error',
    });
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, constraint: value as unknown as ExecutionConstraint, warnings };
}

/**
 * Constraints aplicáveis a um job. O router do passo 11 consulta por motor:
 * `any` sempre entra, porque vale para qualquer execução.
 */
export function constraintsForEngine(
  constraints: readonly ExecutionConstraint[],
  engine: ExecutionConstraint['engine'],
): ExecutionConstraint[] {
  return constraints.filter((c) => c.engine === engine || c.engine === 'any');
}

/**
 * Constraints que impedem a execução de seguir sem verificação humana.
 * `degrades` não entra: piorar não é quebrar.
 */
export function blockingConstraints(
  constraints: readonly ExecutionConstraint[],
): ExecutionConstraint[] {
  return constraints.filter((c) => c.effect === 'breaks-render' || c.effect === 'breaks-output');
}

export function formatExecutionConstraintIssues(
  issues: ExecutionConstraintValidationIssue[],
): string {
  return issues
    .map((i) => `${i.severity === 'warning' ? 'aviso' : 'erro'} ${i.path}: ${i.message}`)
    .join('\n');
}
