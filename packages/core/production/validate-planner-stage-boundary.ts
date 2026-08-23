// Barreira de estágio do planner (passo 8).
//
// O `ScenePlan` atravessa dois passos: nasce no 8, com a decisão semântica, e
// ganha asset e motor no 11. Os campos `selectedAssetId` e
// `engineRecommendation` existem no contrato porque o 11 precisa deles — mas a
// existência do campo permite que o planner do 8 os emita, violando a regra de
// saída do próprio passo:
//
//   "Nenhum asset e nenhum motor são escolhidos aqui."
//   — packages/docs/pipeline/passo-8-video-and-motion-planner.md
//
// Sem esta barreira, a proibição é prosa. Com ela, é recusa.
//
// A alternativa — remover os campos do contrato — quebraria o passo 11, que
// precisa persistir a escolha na mesma cena. Separar por estágio preserva um
// único estado canônico de cena, que é o que o § 3.3 exige.

import type { ScenePlan } from '../../contracts/production/scene-plan';

/** Em que ponto do pipeline o plano está sendo validado. */
export type PipelineStage = 'planner' | 'asset-selection' | 'execution';

export interface StageBoundaryIssue {
  path: string;
  code: string;
  message: string;
}

export type StageBoundaryResult =
  | { withinBoundary: true }
  | { withinBoundary: false; issues: StageBoundaryIssue[] };

/**
 * Campos que só o passo 11 pode preencher. Declarados aqui e não inline para
 * que acrescentar um campo de execução ao `ScenePlan` obrigue a decidir de
 * qual estágio ele é.
 */
const EXECUTION_OWNED_FIELDS = ['selectedAssetId', 'engineRecommendation'] as const;

export function validatePlannerStageBoundary(
  scenes: readonly ScenePlan[],
  stage: PipelineStage,
): StageBoundaryResult {
  const issues: StageBoundaryIssue[] = [];

  if (stage === 'planner') {
    scenes.forEach((scene, index) => {
      for (const field of EXECUTION_OWNED_FIELDS) {
        if (scene[field] !== undefined) {
          issues.push({
            path: `scenes[${index}].${field}`,
            code: 'PLANNER_STAGE_BOUNDARY_VIOLATION',
            message: `o passo 8 não escolhe asset nem motor; "${field}" pertence ao passo 11`,
          });
        }
      }
    });
  }

  if (stage === 'execution') {
    // No caminho inverso: chegar na execução sem motor escolhido significa que
    // o passo 11 não rodou, e alguém está prestes a improvisar.
    scenes.forEach((scene, index) => {
      if (!scene.engineRecommendation) {
        issues.push({
          path: `scenes[${index}].engineRecommendation`,
          code: 'EXECUTION_WITHOUT_ENGINE',
          message: 'cena chegou à execução sem motor roteado no passo 11',
        });
      }
    });
  }

  if (issues.length > 0) return { withinBoundary: false, issues };
  return { withinBoundary: true };
}

/**
 * Remove o que pertence à execução, devolvendo a cena como o passo 8 deveria
 * tê-la produzido. Serve para migrar plano herdado sem perder a decisão
 * semântica — e para o planner sanear a própria proposta antes de submetê-la.
 */
export function stripExecutionDecisions(scene: ScenePlan): ScenePlan {
  const { selectedAssetId, engineRecommendation, ...semantic } = scene;
  void selectedAssetId;
  void engineRecommendation;
  return semantic;
}
