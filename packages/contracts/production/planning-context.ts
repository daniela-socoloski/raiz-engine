// PlanningContext — o que o planner do passo 8 LÊ.
//
// Par do `PlanInputs`, e a distinção importa:
//
//   PlanningContext  o que entra no planner, montado e validado ANTES
//   PlanInputs       o que o planner usou, registrado DEPOIS
//
// O primeiro existe para o planner não reler o corpus inteiro nem receber prosa
// solta; o segundo para a decisão poder ser reaberta e contestada. Um é
// entrada, o outro é proveniência.
//
// Regra de fronteira do passo 8: nenhum asset e nenhum motor entram aqui. Este
// contexto carrega intenção, evidência, marca e política — nada de execução.
//
// Fonte: packages/docs/pipeline/passo-8-video-and-motion-planner.md,
// "O que falta construir", item 1.

import type { BrandRuntimeProfile } from '../brand/brand-runtime-profile';
import type { CreativeBrief } from './creative-brief';
import type { ContentAnalysis } from './content-analysis';
import type { CreativePreference, PreferenceDimension } from './creative-preference';

/**
 * Uma preferência que sobreviveu à filtragem por escopo e ao desempate.
 *
 * `losers` não é decoração: a preferência derrotada precisa ser distinguível da
 * que ninguém consultou, e é isso que alimenta `AppliedPreferenceInput.losesTo`
 * no `PlanInputs`.
 */
export interface ResolvedPreference {
  dimension: PreferenceDimension;
  /** A que venceu o conflito nesta dimensão. */
  winner: CreativePreference;
  /** As que se aplicavam ao escopo e perderam, com a razão implícita na ordem. */
  losers: CreativePreference[];
}

/**
 * Preferência que NÃO se aplica a esta produção. Registrada em vez de
 * descartada em silêncio: "não valia aqui" e "ninguém olhou" são estados
 * diferentes, e só o primeiro é auditável.
 */
export interface InapplicablePreference {
  preference: CreativePreference;
  reason: string;
}

/**
 * Sinal de que a evidência envelheceu. O planner precisa saber disto antes de
 * decidir, não depois: um plano construído sobre análise obsoleta é inválido
 * mesmo que cada campo esteja bem formado.
 */
export interface ContextStaleness {
  kind: 'analysis-outdated' | 'profile-draft' | 'brief-superseded';
  detail: string;
}

export interface PlanningContext {
  schemaVersion: '1.0';

  /** Intenção humana. Passo 5. */
  brief: CreativeBrief;

  /**
   * Evidência do material. Passo 6. Ausente é legítimo — produção sem material
   * de origem existe — mas a ausência precisa ser declarada, nunca silenciosa.
   */
  contentAnalysis?: ContentAnalysis;
  analysisAbsenceReason?: string;

  /**
   * Snapshot da marca aprovada. Passo 7. É cópia fixada, não referência viva:
   * recompilar a marca no meio de uma produção não pode mudar a direção já
   * proposta.
   */
  brandProfile: BrandRuntimeProfile;

  /** Política aplicável, já filtrada por escopo e com conflitos resolvidos. */
  preferences: ResolvedPreference[];
  /** O que foi descartado, e por quê. */
  inapplicablePreferences: InapplicablePreference[];

  /** Motivos para o planner desconfiar da própria entrada. */
  staleness: ContextStaleness[];

  assembledAt: string;
}

export const PLANNING_CONTEXT_SCHEMA_VERSION = '1.0' as const;
