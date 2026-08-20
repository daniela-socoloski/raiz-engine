// AudiovisualDirectionPlan — o primeiro contrato canonico do Raiz Engine.
//
// Descreve INTENCAO e NECESSIDADE. Nunca codigo de render, nunca chamada de
// motor. O ExecutionRouter le este plano e decide como executar; pode recusar a
// recomendacao do planner se o motor estiver indisponivel ou for complexo demais.
//
// Regra de fronteira (ARQUITETURA secao 8):
//   model proposal -> schema validation -> compatibility validation
//   -> human gate -> deterministic compilation -> engine adapter
//   -> readback -> result validation
//
// O modelo propoe este plano. Ele nao chama FFmpeg, Remotion ou Adobe a partir
// daqui.
//
// Fonte: ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md secao 9.

import type { Pace, Energy, Density } from '../brand/brand-runtime-profile';

export type PlanStatus = 'draft' | 'review' | 'approved' | 'superseded';
export type VideoFormat = '9:16' | '16:9' | '1:1';

/** Funcao editorial da cena. Toda cena precisa declarar por que existe. */
export type ScenePurpose =
  | 'hook'
  | 'clarify'
  | 'emphasize'
  | 'compare'
  | 'transition'
  | 'identify'
  | 'call-to-action';

/**
 * Recomendacao, nao ordem. O router pode escolher outro motor.
 */
export type EngineRecommendation =
  | 'ffmpeg'
  | 'remotion'
  | 'after-effects'
  | 'premiere'
  | 'image-provider';

export interface SceneDirection {
  sceneId: string;
  startFrame: number;
  endFrame: number;
  /** Por que esta cena existe. Sem isto, a cena e decoracao. */
  purpose: ScenePurpose;
  /** O beat narrativo que a cena cumpre. */
  narrativeBeat: string;

  mediaNeed?: {
    kind: 'none' | 'text' | 'image' | 'video' | 'graphic';
    description?: string;
  };
  motionNeed?: {
    /** A funcao do movimento, nao o keyframe. */
    function: string;
    intensity: 'low' | 'medium' | 'high';
  };
  audioNeed?: {
    role: 'silence' | 'voice' | 'music' | 'effect' | 'mixed';
    description?: string;
  };

  /** Preenchido pelo AssetIntelligence: reutilizar antes de gerar. */
  selectedAssetId?: string;
  engineRecommendation?: EngineRecommendation;
}

export interface AudiovisualDirectionPlan {
  schemaVersion: '1.0';
  planId: string;
  projectId: string;
  /** Incrementa a cada revisao. Planos anteriores viram `superseded`. */
  version: number;
  status: PlanStatus;

  /**
   * Fingerprints das entradas. Permitem saber se uma analise cara pode ser
   * reaproveitada: midia inalterada nao precisa ser reanalisada.
   */
  inputs: {
    brandProfileVersion?: string;
    timelineFingerprint?: string;
    transcriptFingerprint?: string;
    assetRegistryVersion?: string;
  };

  intent: {
    objective: string;
    audience?: string;
    channel?: string;
    format: VideoFormat;
    targetDurationSeconds?: number;
    desiredResponse?: string;
  };

  direction: {
    narrativeSummary?: string;
    pace: Pace;
    energy: Energy;
    density: Density;
    visualHierarchy: string[];
    soundPrinciples: string[];
    /** O que este plano nao deve fazer. Recusa explicita vale mais que omissao. */
    prohibitedPatterns: string[];
  };

  scenes: SceneDirection[];

  provenance: {
    origin: 'user' | 'planner' | 'migration';
    createdAt: string;
    model?: string;
    promptVersion?: string;
  };
}

/** Caminho canonico do plano dentro do projeto de video. */
export const PLAN_RELATIVE_PATH = 'edit/planning/audiovisual-direction-plan.json';

/** Versao de schema que esta build produz e aceita. */
export const PLAN_SCHEMA_VERSION = '1.0' as const;
