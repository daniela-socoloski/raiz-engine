// Brand Runtime Profile — primeiro no de Target system flow.
//
// Versao compacta e executavel da identidade de marca. NAO e a inteligencia
// completa: marca-raiz-prisma compila dezenas de documentos de descoberta neste
// perfil, para que o planner nunca precise reler o corpus a cada cena.
//
// Este arquivo declara apenas o contrato. A compilacao a partir do corpus e
// responsabilidade de compile-brand-runtime-profile, ainda nao implementado.
//
// Fonte: ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md secoes 6.1 e 8.

/** Identificador estavel de marca. Nao muda quando o perfil e recompilado. */
export type BrandId = string;

/** Ritmo, energia e densidade compartilham vocabulario com o plano de direcao. */
export type Pace = 'slow' | 'moderate' | 'fast' | 'variable';
export type Energy = 'restrained' | 'balanced' | 'expressive';
export type Density = 'minimal' | 'moderate' | 'dense';

export interface VerbalProfile {
  /** Como a marca fala. Frases curtas e concretas, nao adjetivos soltos. */
  toneRules: string[];
  /** Palavras e construcoes que a marca usa deliberadamente. */
  preferredVocabulary?: string[];
  /** Padroes proibidos. Mais util que os preferidos na hora de recusar. */
  prohibitedVocabulary?: string[];
}

export interface VisualProfile {
  /** Cor de acento, formato `#rrggbb`. Validada, nunca inventada pelo modelo. */
  accentColor: string;
  /** Paleta de apoio, na ordem de preferencia. */
  supportingColors?: string[];
  /** Principios de composicao e hierarquia visual. */
  compositionRules?: string[];
  /** O que a marca nunca faz visualmente. */
  prohibitedPatterns?: string[];
}

export interface MotionProfile {
  /** Movimento existe para cumprir funcao editorial, nao para decorar. */
  intensity: 'low' | 'medium' | 'high';
  /** Funcoes de movimento aceitas: revelar, enfatizar, transicionar. */
  allowedFunctions?: string[];
  prohibitedPatterns?: string[];
}

export interface SoundProfile {
  /** Silencio e decisao editorial, por isso e um principio declarado. */
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

/** Limites duros. O planner nao pode propor plano que os viole. */
export interface BrandConstraints {
  maxDurationSeconds?: number;
  requiredFormats?: Array<'9:16' | '16:9' | '1:1'>;
  legalNotices?: string[];
  prohibitedClaims?: string[];
}

export interface BrandRuntimeProfile {
  schemaVersion: '1.0';
  brandId: BrandId;
  brandName: string;
  /** Incrementa a cada recompilacao. O plano registra qual versao usou. */
  version: number;

  verbal: VerbalProfile;
  visual: VisualProfile;
  motion: MotionProfile;
  sound: SoundProfile;
  editorial: EditorialProfile;
  audience?: AudienceProfile;
  constraints?: BrandConstraints;

  provenance: {
    /** De onde a inteligencia foi compilada. */
    origin: 'marca-raiz-prisma' | 'manual' | 'migration';
    compiledAt: string;
    /** Documentos-fonte, para auditoria e recompilacao. */
    sourceDocuments?: string[];
    compilerVersion?: string;
  };
}

/**
 * Perfil minimo utilizavel quando ainda nao existe marca compilada.
 *
 * Nao e placeholder decorativo: o primeiro seam precisa de um perfil valido
 * para produzir plano valido, e a Fase 2 do roadmap substitui isto pelo perfil
 * real vindo do marca-raiz-prisma. A origem `migration` deixa isso rastreavel.
 */
export function createFallbackBrandProfile(accentColor: string): BrandRuntimeProfile {
  return {
    schemaVersion: '1.0',
    brandId: 'unresolved',
    brandName: 'Marca nao compilada',
    version: 0,
    verbal: { toneRules: [] },
    visual: { accentColor },
    motion: { intensity: 'medium' },
    sound: { principles: [] },
    editorial: { pace: 'moderate', energy: 'balanced', density: 'moderate' },
    provenance: {
      origin: 'migration',
      compiledAt: new Date().toISOString(),
    },
  };
}
