// Brand Runtime Profile — contrato canônico do Raiz Engine.
//
// É a versão compacta e executável da identidade de marca. O corpus editorial
// permanece em marca-raiz-prisma; consumidores recebem este contrato compilado
// e nunca precisam reinterpretar o DNA completo a cada produção.

/** Identificador estável de marca. Não muda quando o perfil é recompilado. */
export type BrandId = string;

/** Ritmo, energia e densidade compartilham vocabulário com o plano de direção. */
export type Pace = 'slow' | 'moderate' | 'fast' | 'variable';
export type Energy = 'restrained' | 'balanced' | 'expressive';
export type Density = 'minimal' | 'moderate' | 'dense';

export interface VerbalProfile {
  /** Como a marca fala. Frases concretas, preservadas da fonte editorial. */
  toneRules: string[];
  /** Palavras e construções que a marca usa deliberadamente. */
  preferredVocabulary?: string[];
  /** Vocabulário explicitamente recusado pela marca. */
  prohibitedVocabulary?: string[];
  /** Construções recusadas, separadas de palavras isoladas. */
  prohibitedPatterns?: string[];
}

export type ColorStrategy =
  | 'fixed'
  | 'campaign-variable'
  | 'edition-variable'
  | 'neutral-core';

export interface VisualProfile {
  /** Cor resolvida para o perfil atual, sempre em formato `#RRGGBB`. */
  accentColor: string;
  /** Explica se o acento é permanente ou precisa variar por campanha/edição. */
  colorStrategy?: ColorStrategy;
  /** Paleta de apoio, sem duplicar a cor de acento. */
  supportingColors?: string[];
  /** Regras que governam a escolha e a aplicação das cores. */
  colorRules?: string[];
  /** Princípios de composição e hierarquia visual. */
  compositionRules?: string[];
  /** O que a marca nunca faz visualmente. */
  prohibitedPatterns?: string[];
}

/**
 * Faixa de tempo aceita para uma classe de movimento, EM MILISSEGUNDOS.
 *
 * Não em quadros: o perfil da marca é durável e atravessa produções com FPS
 * diferentes. "14 quadros" são 467 ms a 30fps, 584 ms a 24fps e 233 ms a
 * 60fps — três movimentos distintos com o mesmo número. Guardar quadro aqui
 * faria a personalidade da marca mudar conforme o formato de entrega.
 *
 * O `MotionNeed` trabalha em quadros porque já pertence a uma timeline com FPS
 * decidido; a validação cruzada converte antes de comparar.
 */
export interface DurationEnvelope {
  preferredMs: number;
  minimumMs: number;
  maximumMs: number;
  /**
   * FPS em que a evidência foi medida. Não restringe a entrega — serve para
   * rastrear a origem do número e reconverter se a medição for revisada.
   */
  evidenceReferenceFps?: number;
}

/**
 * Caráter cinético da marca. Não é velocidade — é como o movimento se comporta
 * ao chegar: `precise` assenta seco, `fluid` desacelera longo, `energetic`
 * aceita overshoot visível.
 */
export type MotionCharacter = 'precise' | 'fluid' | 'energetic' | 'restrained';

export interface MotionProfile {
  /** Movimento existe para cumprir função editorial, não para decorar. */
  intensity: 'low' | 'medium' | 'high';
  /** Funções e princípios de movimento aceitos, derivados do DNA. */
  allowedFunctions?: string[];
  prohibitedPatterns?: string[];

  /**
   * Vocabulário de padrões que esta marca aceita — `slide-settle`,
   * `mask-reveal`. Hoje é texto livre; quando o dicionário em
   * `references/*.md` existir, cada nome passa a ter definição e faixas
   * medidas, e a validação deixa de conferir só ortografia.
   */
  allowedPatterns?: string[];

  /** Envelopes de tempo por classe de movimento, em milissegundos. */
  timing?: {
    entrance?: DurationEnvelope;
    transition?: DurationEnvelope;
    exit?: DurationEnvelope;
  };

  dynamics?: {
    preferredCharacter?: MotionCharacter;
    /**
     * Teto de overshoot, em porcentagem do deslocamento. Marca contida usa
     * 0–3; acima de 6 lê como desenho animado.
     */
    overshootMaximumPercent?: number;
    /**
     * Quantos elementos podem se mover ao mesmo tempo. Acima disso a
     * hierarquia deixa de existir — dois movimentos dominantes se anulam.
     */
    simultaneousMovingElementsMaximum?: number;
    motionBlur?: 'none' | 'subtle' | 'pronounced';
  };

  continuity?: {
    /** Um elemento que saiu pela direita volta pela direita. */
    preserveScreenDirection?: boolean;
    /** Preferir que algo atravesse o corte, em vez de recomeçar do zero. */
    preferVisualCarryBetweenScenes?: boolean;
  };
}

export interface SoundProfile {
  /** Regras sonoras explícitas. Lista vazia exige aviso de compilação. */
  principles: string[];
  musicPolicy?: 'none' | 'ambient' | 'rhythmic' | 'variable';
}

export interface EditorialProfile {
  pace: Pace;
  energy: Energy;
  density: Density;
  /** Estruturas narrativas que a marca usa bem. */
  narrativePatterns?: string[];
}

export interface AudienceProfile {
  description: string;
  channels?: string[];
}

/** Limites duros. O planner não pode propor plano que os viole. */
export interface BrandConstraints {
  maxDurationSeconds?: number;
  requiredFormats?: Array<'9:16' | '16:9' | '1:1'>;
  legalNotices?: string[];
  prohibitedClaims?: string[];
}

export type BrandSourceRole = 'metadata' | 'brand-document' | 'method';

export interface BrandSourceEvidence {
  /** Caminho relativo à raiz do repositório; nunca caminho pessoal absoluto. */
  path: string;
  role: BrandSourceRole;
  /** SHA-256 do conteúdo lido pelo adapter de filesystem. */
  contentSha256: string;
}

export type BrandCompilationWarningCode =
  | 'MISSING_SOUND_EVIDENCE'
  | 'UNVERIFIED_MOTION_EVIDENCE'
  | 'VARIABLE_ACCENT_REQUIRES_CONTEXT';

export interface BrandCompilationWarning {
  code: BrandCompilationWarningCode;
  message: string;
  sourceDocument?: string;
}

export interface BrandProfileApproval {
  status: 'draft' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface BrandRuntimeProfile {
  schemaVersion: '1.0';
  brandId: BrandId;
  brandName: string;
  /** Incrementa quando a evidência, o mapeamento ou uma correção muda. */
  version: number;

  verbal: VerbalProfile;
  visual: VisualProfile;
  motion: MotionProfile;
  sound: SoundProfile;
  editorial: EditorialProfile;
  audience?: AudienceProfile;
  constraints?: BrandConstraints;
  approval: BrandProfileApproval;

  provenance: {
    origin: 'marca-raiz-prisma' | 'manual' | 'migration';
    compiledAt: string;
    sourceDocuments?: string[];
    sourceEvidence?: BrandSourceEvidence[];
    sourceFingerprint?: string;
    compilerVersion?: string;
    mappingVersion?: string;
    warnings?: BrandCompilationWarning[];
  };
}

/**
 * Perfil mínimo para a migração da UI herdada.
 *
 * Não substitui o compilador. A origem `migration`, a versão zero e o estado
 * draft impedem que este fallback seja confundido com Brand Intelligence real.
 */
export function createFallbackBrandProfile(accentColor: string): BrandRuntimeProfile {
  return {
    schemaVersion: '1.0',
    brandId: 'unresolved',
    brandName: 'Marca não compilada',
    version: 0,
    verbal: { toneRules: [] },
    visual: { accentColor, colorStrategy: 'fixed' },
    motion: { intensity: 'medium' },
    sound: { principles: [] },
    editorial: { pace: 'moderate', energy: 'balanced', density: 'moderate' },
    approval: { status: 'draft' },
    provenance: {
      origin: 'migration',
      compiledAt: new Date().toISOString(),
    },
  };
}
