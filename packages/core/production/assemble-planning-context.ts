// Montagem do PlanningContext — a metade determinística do passo 8.
//
// O passo 8 tem duas metades. A proposta de direção é probabilística e cabe a
// um modelo. Escolher QUAIS entradas o modelo enxerga não é: filtrar
// preferência por escopo, desempatar conflito e recusar entrada incoerente são
// decisões que a mesma entrada deve produzir sempre igual.
//
// O que este arquivo pega, e que nenhum validador isolado pegaria:
//
//   - brief de uma marca com perfil de outra;
//   - análise de outra produção;
//   - perfil ainda em rascunho servindo de autoridade;
//   - preferência de outra marca vazando para o escopo;
//   - análise cuja evidência envelheceu em relação ao material atual.
//
// Cada um desses passa em `validateCreativeBrief`, em
// `validateContentAnalysis` e em `validateBrandRuntimeProfile` — porque cada
// artefato está bem formado. O defeito só existe na relação entre eles.

import type { BrandRuntimeProfile } from '../../contracts/brand/brand-runtime-profile';
import type { CreativeBrief } from '../../contracts/production/creative-brief';
import type { ContentAnalysis } from '../../contracts/production/content-analysis';
import type {
  CreativePreference,
  PreferenceDimension,
} from '../../contracts/production/creative-preference';
import type {
  PlanningContext,
  ResolvedPreference,
  InapplicablePreference,
  ContextStaleness,
} from '../../contracts/production/planning-context';
import { resolvePreferenceConflict } from './validate-creative-preference';

export interface AssemblyIssue {
  path: string;
  code: string;
  message: string;
}

export type AssemblyResult =
  | { assembled: true; context: PlanningContext }
  | { assembled: false; issues: AssemblyIssue[] };

export interface AssemblyInput {
  brief: CreativeBrief;
  brandProfile: BrandRuntimeProfile;
  contentAnalysis?: ContentAnalysis;
  analysisAbsenceReason?: string;
  /** Todas as preferências conhecidas da marca. A filtragem acontece aqui. */
  preferences?: readonly CreativePreference[];
  /** Momento da montagem. Injetado para o resultado ser reproduzível em teste. */
  assembledAt: string;
}

/**
 * A preferência vale para esta produção?
 *
 * Escopo mais estreito exige correspondência exata; mais amplo exige que o
 * brief case com o valor declarado. Preferência de outra marca nunca entra,
 * qualquer que seja o escopo.
 */
function applicability(
  preference: CreativePreference,
  brief: CreativeBrief,
): { applies: true } | { applies: false; reason: string } {
  const scope = preference.scope;

  if (scope.brandId !== brief.brandId) {
    return { applies: false, reason: `preferência é da marca "${scope.brandId}"` };
  }

  if (preference.status !== 'active') {
    return { applies: false, reason: `preferência está "${preference.status}"` };
  }

  switch (scope.kind) {
    case 'brand':
      return { applies: true };

    case 'production':
      return scope.productionId === brief.productionId
        ? { applies: true }
        : { applies: false, reason: `preferência é da produção "${scope.productionId}"` };

    case 'format': {
      const format = (brief as { delivery?: { aspectRatio?: string } }).delivery?.aspectRatio;
      return scope.value === format
        ? { applies: true }
        : { applies: false, reason: `preferência é do formato "${scope.value}"` };
    }

    case 'channel': {
      const channel = (brief as { delivery?: { channel?: string } }).delivery?.channel;
      return scope.value === channel
        ? { applies: true }
        : { applies: false, reason: `preferência é do canal "${scope.value}"` };
    }

    case 'campaign':
      // Campanha ainda não é campo do brief. Aplicar sem poder conferir seria
      // pior que declarar a limitação: a preferência entraria em produção
      // errada e ninguém saberia.
      return { applies: false, reason: 'escopo de campanha ainda não é verificável pelo brief' };

    default:
      return { applies: false, reason: 'escopo desconhecido' };
  }
}

/** Preferência expirada não vale, mesmo marcada como ativa. */
function isExpired(preference: CreativePreference, now: string): boolean {
  if (!preference.expiresAt) return false;
  const expiry = Date.parse(preference.expiresAt);
  const reference = Date.parse(now);
  return Number.isFinite(expiry) && Number.isFinite(reference) && expiry < reference;
}

export function assemblePlanningContext(input: AssemblyInput): AssemblyResult {
  const issues: AssemblyIssue[] = [];
  const { brief, brandProfile, contentAnalysis, assembledAt } = input;

  // --- coerência entre artefatos: onde os defeitos reais moram

  if (brief.brandId !== brandProfile.brandId) {
    issues.push({
      path: 'brandProfile.brandId',
      code: 'BRAND_MISMATCH',
      message: `o brief é da marca "${brief.brandId}" e o perfil é da marca "${brandProfile.brandId}"`,
    });
  }

  if (contentAnalysis && contentAnalysis.productionId !== brief.productionId) {
    issues.push({
      path: 'contentAnalysis.productionId',
      code: 'PRODUCTION_MISMATCH',
      message: `a análise é da produção "${contentAnalysis.productionId}" e o brief é da "${brief.productionId}"`,
    });
  }

  if (!contentAnalysis && !input.analysisAbsenceReason) {
    issues.push({
      path: 'analysisAbsenceReason',
      code: 'ANALYSIS_ABSENCE_UNDECLARED',
      message: 'produção sem análise é legítima; perder a análise no caminho não é — declare a ausência',
    });
  }

  // --- envelhecimento: o planner precisa saber antes de decidir

  const staleness: ContextStaleness[] = [];

  if (brandProfile.approval.status !== 'approved') {
    // Rascunho de marca não pode governar direção. É erro, não aviso: o passo 7
    // existe exatamente para fixar um perfil APROVADO.
    issues.push({
      path: 'brandProfile.approval.status',
      code: 'BRAND_PROFILE_NOT_APPROVED',
      message: `perfil está "${brandProfile.approval.status}"; o passo 8 exige marca aprovada no passo 7`,
    });
  }

  if (contentAnalysis?.status === 'failed') {
    issues.push({
      path: 'contentAnalysis.status',
      code: 'ANALYSIS_FAILED',
      message: 'análise falhou; não é evidência',
    });
  }

  if (contentAnalysis?.status === 'partial') {
    staleness.push({
      kind: 'analysis-outdated',
      detail: `análise parcial com ${contentAnalysis.unknowns.length} pergunta(s) em aberto`,
    });
  }

  if (brief.status === 'superseded') {
    staleness.push({
      kind: 'brief-superseded',
      detail: `brief versão ${brief.version} foi substituído`,
    });
  }

  // --- preferências: filtrar por escopo, depois desempatar por dimensão

  const inapplicablePreferences: InapplicablePreference[] = [];
  const applicable: CreativePreference[] = [];

  for (const preference of input.preferences ?? []) {
    if (isExpired(preference, assembledAt)) {
      inapplicablePreferences.push({
        preference,
        reason: `expirou em ${String(preference.expiresAt)}`,
      });
      continue;
    }
    const verdict = applicability(preference, brief);
    if (verdict.applies) applicable.push(preference);
    else inapplicablePreferences.push({ preference, reason: verdict.reason });
  }

  const byDimension = new Map<PreferenceDimension, CreativePreference[]>();
  for (const preference of applicable) {
    const list = byDimension.get(preference.dimension) ?? [];
    list.push(preference);
    byDimension.set(preference.dimension, list);
  }

  const preferences: ResolvedPreference[] = [];
  // Ordena as dimensões para a montagem ser estável: a mesma entrada precisa
  // produzir o mesmo contexto, byte a byte.
  for (const dimension of [...byDimension.keys()].sort()) {
    const candidates = byDimension.get(dimension) ?? [];
    const winner = resolvePreferenceConflict(candidates);
    if (!winner) continue;
    preferences.push({
      dimension,
      winner,
      losers: candidates.filter((c) => c.preferenceId !== winner.preferenceId),
    });
  }

  if (issues.length > 0) return { assembled: false, issues };

  return {
    assembled: true,
    context: {
      schemaVersion: '1.0',
      brief,
      contentAnalysis,
      analysisAbsenceReason: input.analysisAbsenceReason,
      brandProfile,
      preferences,
      inapplicablePreferences,
      staleness,
      assembledAt,
    },
  };
}

export function formatAssemblyIssues(issues: AssemblyIssue[]): string {
  return issues.map((i) => `${i.code} ${i.path}: ${i.message}`).join('\n');
}
