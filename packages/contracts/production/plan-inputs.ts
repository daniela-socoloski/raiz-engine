// PlanInputs — a espinha que liga os passos 5, 6, 7 e 8 à saída do passo 9.
//
// O plano de direção não é auditável por si só. "Cortar o início" é uma decisão
// razoável ou uma invenção dependendo de qual brief, qual análise, qual perfil
// de marca e quais preferências estavam sobre a mesa quando o planner decidiu.
// `PlanInputs` fixa essas quatro entradas por identidade e versão para que a
// produção possa ser reaberta no futuro e a decisão possa ser recalculada,
// contestada ou invalidada.
//
// Três coisas que este contrato torna possíveis e que hoje não existem:
//
//   1. Reabrir uma produção antiga e provar qual perfil de marca a governou.
//   2. Saber que uma fonte mudou e que o plano que dependia dela envelheceu,
//      sem reprocessar tudo.
//   3. Mostrar qual preferência venceu um conflito — e qual perdeu.
//
// Fronteira: `PlanInputs` registra o que ENTROU. Não guarda o conteúdo das
// entradas, não decide nada e não substitui os contratos originais. É ponteiro
// versionado e prova de integridade, nunca uma segunda cópia da verdade.
//
// Fonte: LOGICA-PIPELINE-CRIATIVO.md § 4, linha do passo 7 e do passo 9.

import type { BrandId } from '../brand/brand-runtime-profile';
import type { ProductionId } from './creative-brief';
import type { SourceFingerprint } from './content-analysis';
import type {
  PreferenceDimension,
  PreferencePolarity,
  PreferenceScopeKind,
} from './creative-preference';

/**
 * O passo 7 fixa uma cópia do perfil aprovado dentro da produção. O perfil vivo
 * da marca continua evoluindo; este snapshot é o que a produção realmente usou.
 */
export const BRAND_PROFILE_SNAPSHOT_RELATIVE_PATH = 'edit/brand/runtime-profile.json';

export const PLAN_INPUTS_SCHEMA_VERSION = '1.0' as const;

/**
 * Passo 5. Somente brief `ready` alimenta o planner: `draft` ainda está sendo
 * escrito e `superseded` já foi substituído por outra versão.
 */
export interface BriefInput {
  productionId: ProductionId;
  /** Versão exata lida. Brief revisado depois disto envelhece o plano. */
  version: number;
  status: 'ready';
  /** Caminho relativo ao projeto, com barras normais. Nunca caminho pessoal. */
  path: string;
}

/** Uma fonte e seu fingerprint, para invalidação por fonte e não por lote. */
export interface AnalysisSourceRef {
  sourceId: string;
  fingerprint: SourceFingerprint;
}

/**
 * Passo 6. `failed` não entra: plano construído sobre análise que falhou é
 * plano construído sobre nada. `partial` entra, porque lacuna declarada é
 * informação útil para o planner — desde que `gaps` diga onde ela está.
 */
export interface ContentAnalysisInput {
  version: number;
  status: 'partial' | 'complete';
  /** Chave de cache do conjunto. Muda quando qualquer fonte muda. */
  combinedFingerprint: SourceFingerprint;
  /** Participa da identidade: analisador novo pode ver o que o antigo não via. */
  analyzerVersion: string;
  /**
   * Por fonte, não só o combinado. Permite descobrir que apenas uma fonte
   * mudou e invalidar somente as cenas cuja evidência apontava para ela.
   */
  sources: AnalysisSourceRef[];
  path: string;
}

/**
 * Passo 7. Somente perfil aprovado pode ser fixado numa produção. O perfil de
 * fallback da UI herdada nasce `brandId: 'unresolved'` e `version: 0`
 * justamente para não conseguir passar por aqui.
 */
export interface BrandProfileSnapshotInput {
  brandId: BrandId;
  version: number;
  approval: 'approved';
  /** Aponta para o snapshot da produção, não para o perfil vivo da marca. */
  snapshotPath: string;
  sourceFingerprint?: string;
  compilerVersion?: string;
  mappingVersion?: string;
}

/**
 * Passo 8. Registra também a preferência que foi considerada e perdeu: sem a
 * derrota registrada, o conflito resolvido é indistinguível do conflito que
 * ninguém viu.
 */
export interface AppliedPreferenceInput {
  preferenceId: string;
  version: number;
  scopeKind: PreferenceScopeKind;
  dimension: PreferenceDimension;
  polarity: PreferencePolarity;
  applied: boolean;
  /** Obrigatório quando `applied` é false. Por que a regra não valeu aqui. */
  notAppliedReason?: string;
  /** Preferência que venceu o conflito, quando houve conflito. */
  losesTo?: string;
}

/**
 * Quem produziu o plano. Sem isto, um plano ruim não pode ser atribuído a uma
 * versão de planner e a correção vira adivinhação.
 */
export interface PlannerIdentity {
  /** Identificador estável, ex.: `video-and-motion-planner`. */
  name: string;
  version: string;
  model?: string;
  promptVersion?: string;
}

export interface PlanInputs {
  schemaVersion: '1.0';

  brief: BriefInput;

  contentAnalysis?: ContentAnalysisInput;
  /**
   * Obrigatório quando `contentAnalysis` está ausente. Produção sem material de
   * origem é legítima; produção que perdeu a análise no caminho não é. A
   * ausência precisa ser declarada, como `unknowns` na própria análise.
   */
  analysisAbsenceReason?: string;

  brandProfile: BrandProfileSnapshotInput;

  /** Vazio é legítimo e significativo: nenhuma preferência aplicável ao escopo. */
  preferences: AppliedPreferenceInput[];

  planner: PlannerIdentity;

  /** Momento em que as entradas foram fixadas, ISO 8601. */
  resolvedAt: string;
}
