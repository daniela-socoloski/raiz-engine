// Validador do ContentAnalysis (passo 6).
//
// Além da forma, ele defende a fronteira do § 3.2 do LOGICA-PIPELINE-CRIATIVO:
// evidência não pode virar direção. Um fato com base `model` sem `confidence`,
// um `sourceId` que não existe ou um intervalo invertido são erros de contrato,
// não detalhes de estilo — passam despercebidos e contaminam o planner.

import type {
  ContentAnalysis,
  ContentFact,
  TimeRange,
} from '../../contracts/production/content-analysis';

export interface ContentAnalysisValidationIssue {
  path: string;
  message: string;
}

export type ContentAnalysisValidationResult =
  | { valid: true; analysis: ContentAnalysis }
  | { valid: false; issues: ContentAnalysisValidationIssue[] };

const SOURCE_KINDS = ['video', 'audio', 'image', 'text', 'document'] as const;
const EVIDENCE_BASES = ['observed', 'derived', 'model'] as const;
const FACT_KINDS = [
  'topic', 'object', 'person', 'speech', 'text-on-screen',
  'scene-change', 'silence', 'strong-moment', 'quality-issue',
] as const;
const GAP_KINDS = [
  'missing-coverage', 'unusable-audio', 'unusable-video',
  'insufficient-duration', 'missing-source',
] as const;
const RISK_KINDS = [
  'third-party-content', 'identifiable-person', 'trademark-visible',
  'audio-rights', 'sensitive-content',
] as const;
const STATUSES = ['partial', 'complete', 'failed'] as const;

/** SHA-256 em hexadecimal minúsculo. */
const FINGERPRINT = /^[0-9a-f]{64}$/u;

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
  issues: ContentAnalysisValidationIssue[],
): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    issues.push({ path, message: `valor aceito: ${allowed.join(' | ')}` });
  }
}

function validDate(value: unknown): boolean {
  return nonEmptyString(value) && Number.isFinite(Date.parse(value));
}

/**
 * Caminho de projeto, nunca caminho pessoal absoluto. AGENTS.md proíbe gravar
 * o diretório de uma máquina como requisito do projeto.
 */
function relativePath(value: unknown): boolean {
  if (!nonEmptyString(value)) return false;
  if (/^[A-Za-z]:[\\/]/u.test(value)) return false;
  if (value.startsWith('/') || value.startsWith('\\')) return false;
  return !value.split(/[\\/]/u).includes('..');
}

function checkRange(
  range: unknown,
  path: string,
  issues: ContentAnalysisValidationIssue[],
): void {
  if (range === undefined) return;
  if (!isObject(range)) {
    issues.push({ path, message: 'deve ser objeto TimeRange' });
    return;
  }
  const { startSeconds, endSeconds } = range as Partial<TimeRange>;
  const okStart = typeof startSeconds === 'number' && Number.isFinite(startSeconds) && startSeconds >= 0;
  const okEnd = typeof endSeconds === 'number' && Number.isFinite(endSeconds) && endSeconds >= 0;
  if (!okStart) issues.push({ path: `${path}.startSeconds`, message: 'deve ser número >= 0' });
  if (!okEnd) issues.push({ path: `${path}.endSeconds`, message: 'deve ser número >= 0' });
  if (okStart && okEnd && endSeconds <= startSeconds) {
    issues.push({ path, message: 'endSeconds deve ser maior que startSeconds' });
  }
}

function checkSourceRef(
  sourceId: unknown,
  known: Set<string>,
  path: string,
  issues: ContentAnalysisValidationIssue[],
  required: boolean,
): void {
  if (sourceId === undefined) {
    if (required) issues.push({ path, message: 'obrigatório' });
    return;
  }
  if (!nonEmptyString(sourceId)) {
    issues.push({ path, message: 'deve ser texto não vazio' });
    return;
  }
  if (!known.has(sourceId)) {
    issues.push({ path, message: `sourceId "${sourceId}" não está em sources` });
  }
}

export function validateContentAnalysis(value: unknown): ContentAnalysisValidationResult {
  const issues: ContentAnalysisValidationIssue[] = [];

  if (!isObject(value)) {
    return { valid: false, issues: [{ path: '', message: 'análise deve ser um objeto' }] };
  }

  if (value.schemaVersion !== '1.0') {
    issues.push({ path: 'schemaVersion', message: 'valor aceito: 1.0' });
  }
  if (!nonEmptyString(value.productionId)) {
    issues.push({ path: 'productionId', message: 'obrigatório' });
  }
  if (typeof value.version !== 'number' || !Number.isInteger(value.version) || value.version < 0) {
    issues.push({ path: 'version', message: 'deve ser inteiro >= 0' });
  }
  enumValue(value.status, STATUSES, 'status', issues);

  // --- sources: base de tudo; sem elas nenhuma referência pode ser conferida
  const known = new Set<string>();
  if (!Array.isArray(value.sources) || value.sources.length === 0) {
    issues.push({ path: 'sources', message: 'deve conter ao menos uma fonte' });
  } else {
    value.sources.forEach((source, index) => {
      const path = `sources[${index}]`;
      if (!isObject(source)) {
        issues.push({ path, message: 'deve ser objeto' });
        return;
      }
      if (!nonEmptyString(source.sourceId)) {
        issues.push({ path: `${path}.sourceId`, message: 'obrigatório' });
      } else if (known.has(source.sourceId)) {
        issues.push({ path: `${path}.sourceId`, message: 'duplicado' });
      } else {
        known.add(source.sourceId);
      }
      if (!relativePath(source.path)) {
        issues.push({ path: `${path}.path`, message: 'deve ser caminho relativo ao projeto' });
      }
      enumValue(source.kind, SOURCE_KINDS, `${path}.kind`, issues);
      if (typeof source.fingerprint !== 'string' || !FINGERPRINT.test(source.fingerprint)) {
        issues.push({ path: `${path}.fingerprint`, message: 'deve ser SHA-256 hexadecimal' });
      }
    });
  }

  // --- facts: o coração da fronteira evidência/direção
  if (!Array.isArray(value.facts)) {
    issues.push({ path: 'facts', message: 'deve ser lista (pode ser vazia)' });
  } else {
    const seen = new Set<string>();
    value.facts.forEach((raw, index) => {
      const path = `facts[${index}]`;
      if (!isObject(raw)) {
        issues.push({ path, message: 'deve ser objeto' });
        return;
      }
      const fact = raw as Partial<ContentFact>;
      if (!nonEmptyString(fact.factId)) {
        issues.push({ path: `${path}.factId`, message: 'obrigatório' });
      } else if (seen.has(fact.factId)) {
        issues.push({ path: `${path}.factId`, message: 'duplicado' });
      } else {
        seen.add(fact.factId);
      }
      enumValue(fact.kind, FACT_KINDS, `${path}.kind`, issues);
      if (!nonEmptyString(fact.statement)) {
        issues.push({ path: `${path}.statement`, message: 'obrigatório' });
      }
      checkSourceRef(fact.sourceId, known, `${path}.sourceId`, issues, true);
      enumValue(fact.basis, EVIDENCE_BASES, `${path}.basis`, issues);
      checkRange(fact.range, `${path}.range`, issues);

      // Inferência sem confiança declarada vira fato aparente no planner.
      if (fact.basis === 'model' && typeof fact.confidence !== 'number') {
        issues.push({
          path: `${path}.confidence`,
          message: 'obrigatório quando basis é "model"',
        });
      }
      if (fact.confidence !== undefined) {
        const c = fact.confidence;
        if (typeof c !== 'number' || !Number.isFinite(c) || c < 0 || c > 1) {
          issues.push({ path: `${path}.confidence`, message: 'deve estar entre 0 e 1' });
        }
      }
    });
  }

  // --- transcript (opcional, mas coerente quando existir)
  if (value.transcript !== undefined) {
    const t = value.transcript;
    if (!isObject(t)) {
      issues.push({ path: 'transcript', message: 'deve ser objeto' });
    } else {
      if (!nonEmptyString(t.analyzer)) {
        issues.push({ path: 'transcript.analyzer', message: 'obrigatório' });
      }
      if (!Array.isArray(t.segments)) {
        issues.push({ path: 'transcript.segments', message: 'deve ser lista' });
      } else {
        t.segments.forEach((segment, index) => {
          const path = `transcript.segments[${index}]`;
          if (!isObject(segment)) {
            issues.push({ path, message: 'deve ser objeto' });
            return;
          }
          checkSourceRef(segment.sourceId, known, `${path}.sourceId`, issues, true);
          if (!nonEmptyString(segment.text)) {
            issues.push({ path: `${path}.text`, message: 'obrigatório' });
          }
          checkRange(
            { startSeconds: segment.startSeconds, endSeconds: segment.endSeconds },
            path,
            issues,
          );
        });
      }
    }
  }

  // --- gaps, risks e unknowns
  for (const [key, kinds] of [['gaps', GAP_KINDS], ['risks', RISK_KINDS]] as const) {
    const list = value[key];
    if (!Array.isArray(list)) {
      issues.push({ path: key, message: 'deve ser lista (pode ser vazia)' });
      continue;
    }
    list.forEach((item, index) => {
      const path = `${key}[${index}]`;
      if (!isObject(item)) {
        issues.push({ path, message: 'deve ser objeto' });
        return;
      }
      enumValue(item.kind, kinds, `${path}.kind`, issues);
      if (!nonEmptyString(item.statement)) {
        issues.push({ path: `${path}.statement`, message: 'obrigatório' });
      }
      checkSourceRef(item.sourceId, known, `${path}.sourceId`, issues, false);
      checkRange(item.range, `${path}.range`, issues);
    });
  }

  if (!Array.isArray(value.unknowns)) {
    issues.push({ path: 'unknowns', message: 'deve ser lista (pode ser vazia)' });
  } else {
    value.unknowns.forEach((item, index) => {
      const path = `unknowns[${index}]`;
      if (!isObject(item)) {
        issues.push({ path, message: 'deve ser objeto' });
        return;
      }
      if (!nonEmptyString(item.question)) {
        issues.push({ path: `${path}.question`, message: 'obrigatório' });
      }
      // Sem motivo, "não sei" não é auditável.
      if (!nonEmptyString(item.reason)) {
        issues.push({ path: `${path}.reason`, message: 'obrigatório' });
      }
      checkSourceRef(item.sourceId, known, `${path}.sourceId`, issues, false);
    });
  }

  // --- provenance: identidade de cache
  if (!isObject(value.provenance)) {
    issues.push({ path: 'provenance', message: 'obrigatório' });
  } else {
    const p = value.provenance;
    if (!validDate(p.analyzedAt)) {
      issues.push({ path: 'provenance.analyzedAt', message: 'deve ser data ISO-8601' });
    }
    if (!nonEmptyString(p.analyzerVersion)) {
      issues.push({ path: 'provenance.analyzerVersion', message: 'obrigatório' });
    }
    if (typeof p.combinedFingerprint !== 'string' || !FINGERPRINT.test(p.combinedFingerprint)) {
      issues.push({
        path: 'provenance.combinedFingerprint',
        message: 'deve ser SHA-256 hexadecimal',
      });
    }
  }

  // Status "complete" com lacuna desconhecida é contradição: ou a análise
  // fechou, ou ainda há pergunta aberta e ela é "partial".
  if (value.status === 'complete' && Array.isArray(value.unknowns) && value.unknowns.length > 0) {
    issues.push({
      path: 'status',
      message: 'não pode ser "complete" com unknowns pendentes; use "partial"',
    });
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, analysis: value as unknown as ContentAnalysis };
}

export function formatContentAnalysisIssues(issues: ContentAnalysisValidationIssue[]): string {
  return issues.map((issue) => (issue.path ? `${issue.path}: ${issue.message}` : issue.message)).join('\n');
}
