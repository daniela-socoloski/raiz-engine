// Validador do PlanInputs.
//
// Defende as regras que a forma sozinha não garante:
//
//   - brief `ready`, nunca `draft`: plano não nasce de intenção inacabada;
//   - perfil de marca `approved` e com versão real: o fallback da UI herdada
//     (`brandId: 'unresolved'`, `version: 0`) não pode governar uma produção;
//   - análise ausente exige motivo declarado, como `unknowns` na própria
//     análise — silêncio não é ausência de material, é perda de rastro;
//   - preferência não aplicada exige razão: conflito resolvido sem registro é
//     indistinguível de conflito que ninguém viu;
//   - caminho relativo e portátil, nunca caminho pessoal absoluto.
//
// `comparePlanInputs` fecha o outro lado: descobre que uma entrada mudou e o
// plano envelheceu. Sem ele, `PlanInputs` seria só um carimbo bonito.
//
// Fonte: LOGICA-PIPELINE-CRIATIVO.md § 4 e § 6.

import {
  PLAN_INPUTS_SCHEMA_VERSION,
  type PlanInputs,
} from '../../contracts/production/plan-inputs';

export interface PlanInputsValidationIssue {
  path: string;
  message: string;
}

export type PlanInputsValidationResult =
  | { valid: true; inputs: PlanInputs }
  | { valid: false; issues: PlanInputsValidationIssue[] };

const FINGERPRINT = /^[0-9a-f]{64}$/u;

const SCOPE_KINDS = ['brand', 'format', 'channel', 'campaign', 'production'] as const;
const DIMENSIONS = [
  'pacing', 'typography', 'color', 'motion', 'audio',
  'framing', 'copy', 'asset-reuse', 'engine',
] as const;
const POLARITIES = ['prefer', 'avoid', 'require'] as const;
const ANALYSIS_STATUS = ['partial', 'complete'] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

function enumValue(
  value: unknown,
  allowed: readonly string[],
  path: string,
  issues: PlanInputsValidationIssue[],
): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    issues.push({ path, message: `deve ser um de: ${allowed.join(', ')}` });
  }
}

/**
 * Caminho gravado no plano precisa sobreviver a outra máquina e a outro
 * sistema operacional. Absoluto vaza a pasta pessoal de quem editou; `..`
 * aponta para fora da produção; barra invertida quebra fora do Windows.
 */
function relativePath(
  value: unknown,
  path: string,
  issues: PlanInputsValidationIssue[],
): void {
  if (!nonEmptyString(value)) {
    issues.push({ path, message: 'obrigatório, string não vazia' });
    return;
  }
  if (/^([a-z]:|\/|\\)/iu.test(value)) {
    issues.push({ path, message: 'deve ser relativo ao projeto, nunca caminho absoluto' });
  }
  if (value.includes('\\')) {
    issues.push({ path, message: 'use barras normais para o caminho ser portátil' });
  }
  if (value.split('/').includes('..')) {
    issues.push({ path, message: 'não pode apontar para fora da produção' });
  }
}

function fingerprint(
  value: unknown,
  path: string,
  issues: PlanInputsValidationIssue[],
): void {
  if (typeof value !== 'string' || !FINGERPRINT.test(value)) {
    issues.push({ path, message: 'deve ser SHA-256 hexadecimal' });
  }
}

function validateBrief(value: unknown, issues: PlanInputsValidationIssue[]): void {
  if (!isObject(value)) {
    issues.push({ path: 'brief', message: 'obrigatório: plano sem brief não pode ser avaliado' });
    return;
  }
  if (!nonEmptyString(value.productionId)) {
    issues.push({ path: 'brief.productionId', message: 'obrigatório' });
  }
  if (!positiveInteger(value.version)) {
    issues.push({ path: 'brief.version', message: 'inteiro >= 1: a versão exata lida' });
  }
  if (value.status !== 'ready') {
    issues.push({
      path: 'brief.status',
      message: 'somente brief "ready" alimenta o planner; recebido '
        + JSON.stringify(value.status),
    });
  }
  relativePath(value.path, 'brief.path', issues);
}

function validateAnalysis(value: unknown, issues: PlanInputsValidationIssue[]): void {
  if (!isObject(value)) {
    issues.push({ path: 'contentAnalysis', message: 'deve ser objeto quando presente' });
    return;
  }
  if (!positiveInteger(value.version)) {
    issues.push({ path: 'contentAnalysis.version', message: 'inteiro >= 1' });
  }
  if (value.status === 'failed') {
    issues.push({
      path: 'contentAnalysis.status',
      message: 'análise que falhou não sustenta plano: trate como ausência declarada',
    });
  } else {
    enumValue(value.status, ANALYSIS_STATUS, 'contentAnalysis.status', issues);
  }
  fingerprint(value.combinedFingerprint, 'contentAnalysis.combinedFingerprint', issues);
  if (!nonEmptyString(value.analyzerVersion)) {
    issues.push({
      path: 'contentAnalysis.analyzerVersion',
      message: 'obrigatório: analisador participa da identidade do cache',
    });
  }
  relativePath(value.path, 'contentAnalysis.path', issues);

  if (!Array.isArray(value.sources) || value.sources.length === 0) {
    issues.push({
      path: 'contentAnalysis.sources',
      message: 'ao menos uma fonte: sem fingerprint por fonte não há invalidação parcial',
    });
    return;
  }
  const seen = new Set<string>();
  value.sources.forEach((source, index) => {
    const at = `contentAnalysis.sources[${index}]`;
    if (!isObject(source)) {
      issues.push({ path: at, message: 'deve ser objeto' });
      return;
    }
    if (!nonEmptyString(source.sourceId)) {
      issues.push({ path: `${at}.sourceId`, message: 'obrigatório' });
    } else if (seen.has(source.sourceId)) {
      issues.push({ path: at, message: `sourceId duplicado: ${source.sourceId}` });
    } else {
      seen.add(source.sourceId);
    }
    fingerprint(source.fingerprint, `${at}.fingerprint`, issues);
  });
}

function validateBrandProfile(value: unknown, issues: PlanInputsValidationIssue[]): void {
  if (!isObject(value)) {
    issues.push({
      path: 'brandProfile',
      message: 'obrigatório: a produção registra a versão de marca que realmente usou',
    });
    return;
  }
  if (!nonEmptyString(value.brandId)) {
    issues.push({ path: 'brandProfile.brandId', message: 'obrigatório' });
  } else if (value.brandId === 'unresolved') {
    issues.push({
      path: 'brandProfile.brandId',
      message: 'perfil de fallback não governa produção: compile a marca antes',
    });
  }
  if (!positiveInteger(value.version)) {
    issues.push({
      path: 'brandProfile.version',
      message: 'inteiro >= 1: versão 0 é o fallback não compilado',
    });
  }
  if (value.approval !== 'approved') {
    issues.push({
      path: 'brandProfile.approval',
      message: 'somente perfil aprovado pode ser fixado numa produção; recebido '
        + JSON.stringify(value.approval),
    });
  }
  relativePath(value.snapshotPath, 'brandProfile.snapshotPath', issues);
  if (value.sourceFingerprint !== undefined) {
    fingerprint(value.sourceFingerprint, 'brandProfile.sourceFingerprint', issues);
  }
}

function validatePreferences(value: unknown, issues: PlanInputsValidationIssue[]): void {
  if (!Array.isArray(value)) {
    issues.push({
      path: 'preferences',
      message: 'obrigatório, mesmo vazio: vazio declara "nenhuma preferência aplicável"',
    });
    return;
  }
  const seen = new Set<string>();
  value.forEach((preference, index) => {
    const at = `preferences[${index}]`;
    if (!isObject(preference)) {
      issues.push({ path: at, message: 'deve ser objeto' });
      return;
    }
    if (!nonEmptyString(preference.preferenceId)) {
      issues.push({ path: `${at}.preferenceId`, message: 'obrigatório' });
    } else if (seen.has(preference.preferenceId)) {
      issues.push({ path: at, message: `preferenceId duplicado: ${preference.preferenceId}` });
    } else {
      seen.add(preference.preferenceId);
    }
    if (!positiveInteger(preference.version)) {
      issues.push({ path: `${at}.version`, message: 'inteiro >= 1' });
    }
    enumValue(preference.scopeKind, SCOPE_KINDS, `${at}.scopeKind`, issues);
    enumValue(preference.dimension, DIMENSIONS, `${at}.dimension`, issues);
    enumValue(preference.polarity, POLARITIES, `${at}.polarity`, issues);

    if (typeof preference.applied !== 'boolean') {
      issues.push({ path: `${at}.applied`, message: 'booleano obrigatório' });
      return;
    }
    // Preferência considerada e derrotada precisa dizer por quê. Sem isso, o
    // conflito resolvido fica indistinguível do conflito ignorado.
    if (preference.applied === false
        && !nonEmptyString(preference.notAppliedReason)
        && !nonEmptyString(preference.losesTo)) {
      issues.push({
        path: `${at}.notAppliedReason`,
        message: 'preferência não aplicada exige razão ou a regra que venceu',
      });
    }
  });
}

/**
 * Valida entradas vindas de qualquer fronteira: planner, disco ou IPC.
 *
 * Não lança. Devolve todos os problemas de uma vez para que a correção caiba
 * num passo em vez de um erro por vez.
 */
export function validatePlanInputs(input: unknown): PlanInputsValidationResult {
  const issues: PlanInputsValidationIssue[] = [];

  if (!isObject(input)) {
    return { valid: false, issues: [{ path: '', message: 'entradas devem ser um objeto' }] };
  }

  if (input.schemaVersion !== PLAN_INPUTS_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      message: `esta build produz e aceita "${PLAN_INPUTS_SCHEMA_VERSION}"; recebido `
        + JSON.stringify(input.schemaVersion),
    });
  }

  validateBrief(input.brief, issues);

  const hasAnalysis = input.contentAnalysis !== undefined;
  const hasReason = nonEmptyString(input.analysisAbsenceReason);
  if (hasAnalysis) {
    validateAnalysis(input.contentAnalysis, issues);
    if (hasReason) {
      issues.push({
        path: 'analysisAbsenceReason',
        message: 'não pode coexistir com contentAnalysis: ou houve análise, ou não houve',
      });
    }
  } else if (!hasReason) {
    issues.push({
      path: 'analysisAbsenceReason',
      message: 'obrigatório quando não há análise: ausência precisa ser declarada',
    });
  }

  validateBrandProfile(input.brandProfile, issues);
  validatePreferences(input.preferences, issues);

  if (!isObject(input.planner)) {
    issues.push({
      path: 'planner',
      message: 'obrigatório: plano sem planner identificado não pode ser corrigido',
    });
  } else {
    if (!nonEmptyString(input.planner.name)) {
      issues.push({ path: 'planner.name', message: 'obrigatório' });
    }
    if (!nonEmptyString(input.planner.version)) {
      issues.push({ path: 'planner.version', message: 'obrigatório' });
    }
  }

  if (!nonEmptyString(input.resolvedAt)) {
    issues.push({ path: 'resolvedAt', message: 'obrigatório, ISO 8601' });
  } else if (Number.isNaN(Date.parse(input.resolvedAt))) {
    issues.push({ path: 'resolvedAt', message: 'data inválida' });
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, inputs: input as unknown as PlanInputs };
}

/** O que mudou entre as entradas fixadas e as entradas atuais. */
export type PlanInputChange =
  | { kind: 'brief'; detail: string }
  | { kind: 'content-analysis'; detail: string }
  | { kind: 'content-source'; sourceId: string; detail: string }
  | { kind: 'brand-profile'; detail: string }
  | { kind: 'preferences'; detail: string };

/**
 * Compara as entradas gravadas no plano com as entradas atuais da produção.
 *
 * É isto que torna `PlanInputs` útil em vez de decorativo: um plano cujo brief
 * subiu de versão, cuja fonte foi trocada ou cujo perfil de marca foi
 * recompilado envelheceu, e a interface precisa dizer isso antes da aprovação
 * humana — não depois do render.
 *
 * Devolve lista vazia quando o plano continua correspondendo às entradas.
 * `content-source` aponta a fonte específica para que só as cenas que
 * dependiam dela precisem ser revistas.
 */
export function comparePlanInputs(
  fixed: PlanInputs,
  current: PlanInputs,
): PlanInputChange[] {
  const changes: PlanInputChange[] = [];

  if (fixed.brief.productionId !== current.brief.productionId) {
    changes.push({ kind: 'brief', detail: 'produção diferente' });
  } else if (fixed.brief.version !== current.brief.version) {
    changes.push({
      kind: 'brief',
      detail: `versão ${fixed.brief.version} → ${current.brief.version}`,
    });
  }

  const before = fixed.contentAnalysis;
  const now = current.contentAnalysis;
  if (before && !now) {
    changes.push({ kind: 'content-analysis', detail: 'análise deixou de existir' });
  } else if (!before && now) {
    changes.push({ kind: 'content-analysis', detail: 'análise passou a existir' });
  } else if (before && now) {
    if (before.analyzerVersion !== now.analyzerVersion) {
      changes.push({
        kind: 'content-analysis',
        detail: `analisador ${before.analyzerVersion} → ${now.analyzerVersion}`,
      });
    }
    if (before.combinedFingerprint !== now.combinedFingerprint) {
      changes.push({ kind: 'content-analysis', detail: 'conjunto de fontes mudou' });
    }
    const beforeSources = new Map(before.sources.map((s) => [s.sourceId, s.fingerprint]));
    const nowSources = new Map(now.sources.map((s) => [s.sourceId, s.fingerprint]));
    for (const [sourceId, print] of beforeSources) {
      if (!nowSources.has(sourceId)) {
        changes.push({ kind: 'content-source', sourceId, detail: 'fonte removida' });
      } else if (nowSources.get(sourceId) !== print) {
        changes.push({ kind: 'content-source', sourceId, detail: 'conteúdo da fonte mudou' });
      }
    }
    for (const sourceId of nowSources.keys()) {
      if (!beforeSources.has(sourceId)) {
        changes.push({ kind: 'content-source', sourceId, detail: 'fonte acrescentada' });
      }
    }
  }

  if (fixed.brandProfile.brandId !== current.brandProfile.brandId) {
    changes.push({ kind: 'brand-profile', detail: 'marca diferente' });
  } else if (fixed.brandProfile.version !== current.brandProfile.version) {
    changes.push({
      kind: 'brand-profile',
      detail: `versão ${fixed.brandProfile.version} → ${current.brandProfile.version}`,
    });
  }

  const key = (p: { preferenceId: string; version: number }) => `${p.preferenceId}@${p.version}`;
  const fixedApplied = new Set(fixed.preferences.filter((p) => p.applied).map(key));
  const currentApplied = new Set(current.preferences.filter((p) => p.applied).map(key));
  for (const id of currentApplied) {
    if (!fixedApplied.has(id)) {
      changes.push({ kind: 'preferences', detail: `preferência nova aplicável: ${id}` });
    }
  }
  for (const id of fixedApplied) {
    if (!currentApplied.has(id)) {
      changes.push({ kind: 'preferences', detail: `preferência deixou de valer: ${id}` });
    }
  }

  return changes;
}
