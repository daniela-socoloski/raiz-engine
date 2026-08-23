// CreativePreference — correção humana aprovada, reutilizável.
//
// NÃO é memória de chat. É uma escolha aprendida em revisão, com escopo,
// evidência e validade. Entra no passo 8 como política adicional: não altera o
// BrandRuntimeProfile em silêncio, não substitui o brief e não substitui a
// evidência da ContentAnalysis.
//
// A regra que justifica o contrato existir: uma correção feita numa produção
// não vira regra global sem aprovação explícita. Por isso `scope` é obrigatório
// e `production` é o escopo mais estreito, não o padrão implícito.
//
// Fonte: LOGICA-PIPELINE-CRIATIVO.md § 3.4.

import type { BrandId } from '../brand/brand-runtime-profile';
import type { ProductionId } from './creative-brief';

/**
 * Até onde a regra vale. Ordem de especificidade: `production` é a mais
 * estreita, `brand` a mais ampla. Conflito se resolve pela mais estreita.
 */
export type PreferenceScopeKind = 'brand' | 'format' | 'channel' | 'campaign' | 'production';

export interface PreferenceScope {
  kind: PreferenceScopeKind;
  /** Sempre presente: toda preferência pertence a uma marca. */
  brandId: BrandId;
  /** Obrigatório quando `kind` é `production`. */
  productionId?: ProductionId;
  /** Obrigatório quando `kind` é `format`, `channel` ou `campaign`. */
  value?: string;
}

/**
 * O que a regra faz com o comportamento. `require` é mais forte que `prefer`:
 * o planner pode ignorar uma preferência, nunca uma exigência.
 */
export type PreferencePolarity = 'prefer' | 'avoid' | 'require';

/** Sobre o que a regra fala. Governa quem no passo 8 a consome. */
export type PreferenceDimension =
  | 'pacing'
  | 'typography'
  | 'color'
  | 'motion'
  | 'audio'
  | 'framing'
  | 'copy'
  | 'asset-reuse'
  | 'engine';

/** De onde a regra nasceu. Preferência sem origem humana não é aprendizado. */
export type PreferenceOrigin = 'approval' | 'rejection' | 'correction';

export interface PreferenceEvidence {
  /** Produção onde a correção aconteceu. */
  productionId: ProductionId;
  /** Versão do plano ou do resultado que motivou a regra. */
  version: number;
  /** O que a pessoa disse ou corrigiu, preservado sem interpretação. */
  statement: string;
  /** Cena específica, quando a correção foi local. */
  sceneId?: string;
}

export type PreferenceStatus = 'active' | 'superseded' | 'expired' | 'revoked';

export interface CreativePreference {
  schemaVersion: '1.0';
  preferenceId: string;
  version: number;
  status: PreferenceStatus;

  scope: PreferenceScope;
  dimension: PreferenceDimension;
  polarity: PreferencePolarity;

  /**
   * A regra, estruturada o suficiente para o planner aplicar sem reinterpretar
   * prosa. "legenda karaokê em vertical", não "melhorar as legendas".
   */
  rule: string;

  origin: PreferenceOrigin;
  evidence: PreferenceEvidence;

  /**
   * Maior vence quando duas regras do MESMO escopo se contradizem. Entre
   * escopos diferentes, a especificidade decide antes da prioridade.
   */
  priority: number;

  /** Preferência que esta substitui. Fecha o histórico sem apagá-lo. */
  supersedes?: string;

  /** Quando deixa de valer. Ausente significa "até ser substituída". */
  expiresAt?: string;

  /**
   * Condição que invalida a regra — mudança de campanha, de formato, de linha
   * de produto. Existe para a preferência não virar dogma silencioso.
   */
  replacementCondition?: string;

  provenance: {
    createdAt: string;
    /** Quem aprovou. Regra sem aprovador não é correção aprovada. */
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  };
}
