// ScenePlan — unidade canônica de cena dentro do AudiovisualDirectionPlan.
//
// Migração de `SceneDirection`, iniciado em apps/cena-raiz-desktop. Mesmo tipo,
// nome canônico e casa definitiva. `SceneMotionNeed`, desenhado no blueprint
// audiovisual, NÃO vira um segundo estado persistido: no passo 11 código
// determinístico projeta `motionNeed` para um pedido de asset ou job, e essa
// projeção é recalculável — não disputa a fonte de verdade com este contrato.
//
// Fronteira: decisão SEMÂNTICA da cena. Nunca keyframe, nunca chamada de motor,
// nunca asset resolvido por inferência do modelo.
//
// Fonte: LOGICA-PIPELINE-CRIATIVO.md § 3.3.

/** Função editorial da cena. Toda cena precisa declarar por que existe. */
export type ScenePurpose =
  | 'hook'
  | 'clarify'
  | 'emphasize'
  | 'compare'
  | 'explain-data'
  | 'transition'
  | 'identify'
  | 'call-to-action';

/**
 * Recomendação, não ordem. O router do passo 11 pode escolher outro motor —
 * por indisponibilidade, custo ou complexidade — sem invalidar o plano.
 */
export type EngineRecommendation =
  | 'ffmpeg'
  | 'remotion'
  | 'after-effects'
  | 'premiere'
  | 'image-provider';

export type MediaKind = 'none' | 'text' | 'image' | 'video' | 'graphic';
export type MotionIntensity = 'low' | 'medium' | 'high';
export type AudioRole = 'silence' | 'voice' | 'music' | 'effect' | 'mixed';

export interface MediaNeed {
  kind: MediaKind;
  /** O que a cena precisa mostrar, não qual arquivo usar. */
  description?: string;
}

/** O que o movimento cumpre editorialmente. Não é o efeito, é a intenção. */
export type MotionFunction =
  | 'introduce'
  | 'emphasize'
  | 'reveal'
  | 'compare'
  | 'transition'
  | 'conclude';

/** O que o elemento faz ao longo da cena, depois de chegar. */
export type MotionBehavior = 'enter-and-hold' | 'enter-and-exit' | 'sustain' | 'exit-only';

/**
 * A que o movimento se ancora no tempo. `transcript-word` é a regra raiz do
 * sistema: nada entra num tempo escolhido no olho, entra na palavra.
 */
export type MotionAnchor = 'transcript-word' | 'scene-start' | 'scene-end' | 'previous-element';

export interface MotionSynchronization {
  anchor: MotionAnchor;
  /** A palavra ou marca à qual ancorar, quando o âncora exigir. */
  cue?: string;
  /** Deslocamento em quadros a partir da âncora. Pode ser negativo. */
  offsetFrames?: number;
}

/**
 * Os valores escolhidos para ESTA cena, dentro do que a marca permite.
 *
 * Isto não é keyframe: são parâmetros dentro de faixa validada. A distinção
 * importa — keyframe é execução escrita livremente; parâmetro é escolha
 * verificável contra o `MotionProfile`. O `validateMotionNeedAgainstProfile`
 * é quem garante que a escolha cabe.
 */
export interface MotionEnvelope {
  /**
   * FPS da timeline a que estes quadros pertencem. Obrigatório quando há
   * duração: sem ele, comparar com o envelope da marca — que é em
   * milissegundos — é impossível, e 14 quadros viram um número sem significado.
   */
  fps?: number;
  preferredDurationFrames?: number;
  minimumDurationFrames?: number;
  maximumDurationFrames?: number;
  /** Deslocamento, em porcentagem da largura do quadro. */
  travelPercent?: number;
  /** Overshoot, em porcentagem do deslocamento. */
  overshootPercent?: number;
  /** Quadros de assentamento depois do pico. */
  settleFrames?: number;
}

export interface MotionNeed {
  /**
   * A FUNÇÃO do movimento — nunca o keyframe. Keyframe nasce no passo 11, a
   * partir daqui.
   */
  function: MotionFunction;
  intensity: MotionIntensity;

  /** O que se move: `headline`, `logo`, `gráfico de fases`. */
  subject?: string;

  /**
   * Família de padrão do vocabulário da marca — `slide-settle`, `mask-reveal`.
   * Texto livre até o dicionário em `references/*.md` existir; a validação
   * confere pertencimento ao `allowedPatterns` do perfil, não a semântica.
   */
  patternFamily?: string;

  behavior?: MotionBehavior;
  /** Direção do percurso: `left-to-center`, `bottom-up`. */
  direction?: string;

  synchronization?: MotionSynchronization;
  envelope?: MotionEnvelope;

  /** O que esta cena especificamente recusa, além do que a marca já proíbe. */
  avoid?: string[];
}

export interface AudioNeed {
  role: AudioRole;
  description?: string;
}

/**
 * O que esta cena especificamente não pode fazer. Distinto das proibições da
 * marca, que valem para todas: aqui é restrição local e justificável.
 */
export interface SceneProhibition {
  rule: string;
  reason: string;
}

/**
 * Por que a cena é assim. Cada decisão precisa apontar para o brief, para um
 * fato da análise ou para o perfil da marca — senão é invenção apresentada
 * como direção.
 */
export interface SceneEvidenceRef {
  source: 'brief' | 'content-analysis' | 'brand-profile' | 'creative-preference';
  /** `factId` da ContentAnalysis, campo do brief, regra da marca. */
  reference: string;
  /** O que essa evidência sustenta nesta cena. */
  supports: string;
}

export interface ScenePlan {
  sceneId: string;

  /**
   * Janela em frames, herdada do desktop e do TimelineModel canônico. A
   * ContentAnalysis fala em segundos porque o FPS de destino ainda não existe;
   * aqui o plano já pertence a uma timeline com FPS decidido.
   */
  startFrame: number;
  endFrame: number;

  /** Por que esta cena existe. Sem isto, a cena é decoração. */
  purpose: ScenePurpose;
  /** O beat narrativo que a cena cumpre. */
  narrativeBeat: string;

  mediaNeed?: MediaNeed;
  motionNeed?: MotionNeed;
  audioNeed?: AudioNeed;

  prohibitions?: SceneProhibition[];
  /** Vazio é permitido e significativo: declara cena sem lastro. */
  evidence?: SceneEvidenceRef[];

  /** Preenchido no passo 11 pelo Asset Intelligence: reutilizar antes de gerar. */
  selectedAssetId?: string;
  engineRecommendation?: EngineRecommendation;
}
