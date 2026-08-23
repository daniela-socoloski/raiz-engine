/**
 * Mapeamento executável entre o corpus Marca Raiz e BrandRuntimeProfile.
 *
 * A ordem dos aliases é deliberada: o compilador tenta primeiro a seção mais
 * específica e só então o contêiner compatível usado por um caso anterior.
 * Acrescentar um alias exige um caso real no corpus e teste de regressão.
 */

export interface BrandSectionSelector {
  titleAliases: readonly string[];
  required: boolean;
  targetFields: readonly string[];
}

export const BRAND_RUNTIME_PROFILE_MAPPING_VERSION = '1.0.0';

export const BRAND_RUNTIME_METHOD_SOURCE_PATHS = [
  'marca-raiz-prisma/inteligencias/00-README.md',
  'marca-raiz-prisma/inteligencias/06-Audience-marca-raiz.md',
  'marca-raiz-prisma/inteligencias/07-Voice-and-Tone.md',
  'marca-raiz-prisma/inteligencias/08-Design-System.md',
  'marca-raiz-prisma/inteligencias/09-Photography-Direction.md',
  'marca-raiz-prisma/inteligencias/11-Brand-Behavior.md',
  'marca-raiz-prisma/inteligencias/12-Anti-Patterns.md',
] as const;

/**
 * Nome preferido primeiro. `DNA.md` existe nos três casos de referência atuais,
 * mas não define o formato obrigatório de projetos novos.
 */
export const BRAND_DOCUMENT_FILE_CANDIDATES = [
  'Marca-Raiz.md',
  'marca-raiz.md',
  'DNA.md',
] as const;

export const BRAND_RUNTIME_PROFILE_MAPPING = {
  metadata: {
    source: '.brand.json',
    fields: {
      brand_name: 'brandName',
      brand_slug: 'brandId',
      created_at: 'source version and provenance',
      document_colors: 'visual.supportingColors fallback only',
    },
  },
  brandDocument: {
    source: 'resultado/Marca-Raiz.md; resultado/DNA.md é compatibilidade dos casos de referência',
    sections: {
      identity: {
        titleAliases: ['Identidade'],
        required: true,
        targetFields: ['brandName verification'],
      },
      editorialPrinciple: {
        titleAliases: ['Princípio editorial central'],
        required: true,
        targetFields: ['verbal.toneRules', 'editorial.narrativePatterns'],
      },
      palette: {
        titleAliases: ['Paleta de cores'],
        required: true,
        targetFields: [
          'visual.accentColor',
          'visual.colorStrategy',
          'visual.supportingColors',
          'visual.colorRules',
        ],
      },
      composition: {
        titleAliases: [
          'Composição e enquadramento',
          'Grid e espaçamento',
          'Sistema de grid e espaçamento',
          'Grid, espaçamento e formatos',
          'Direção fotográfica',
          'Direção fotográfica e audiovisual',
        ],
        required: true,
        targetFields: ['visual.compositionRules'],
      },
      visualAntiPatterns: {
        titleAliases: ['Anti-referências visuais'],
        required: true,
        targetFields: ['visual.prohibitedPatterns'],
      },
      audiovisualDirection: {
        titleAliases: ['Direção fotográfica e audiovisual', 'Direção fotográfica'],
        required: true,
        targetFields: [
          'motion.intensity',
          'motion.allowedFunctions',
          'sound.principles',
          'sound.musicPolicy',
          'editorial.pace',
          'editorial.energy',
        ],
      },
      audiovisualAntiPatterns: {
        titleAliases: [
          'Anti-fotografia e anti-vídeo',
          'Anti-fotografia',
          // Gentle Monster registra 3.8.9 como marcador em negrito dentro da
          // seção 3.8, e não como heading Markdown.
          'Direção fotográfica',
        ],
        required: true,
        targetFields: ['motion.prohibitedPatterns', 'visual.prohibitedPatterns'],
      },
      verbalPrinciple: {
        titleAliases: ['Princípio editorial'],
        required: true,
        targetFields: ['verbal.toneRules'],
      },
      voiceIdentity: {
        titleAliases: ['A voz é e a voz não é', 'É e não é'],
        required: true,
        targetFields: ['verbal.toneRules'],
      },
      vocabulary: {
        titleAliases: ['Vocabulário'],
        required: true,
        targetFields: ['verbal.preferredVocabulary', 'verbal.prohibitedVocabulary'],
      },
      prohibitedConstructions: {
        titleAliases: ['Construções proibidas'],
        required: true,
        targetFields: ['verbal.prohibitedPatterns'],
      },
      editorialDensity: {
        titleAliases: ['Comprimento e densidade por formato', 'Comprimento e densidade'],
        required: true,
        targetFields: ['editorial.density'],
      },
      narrativePatterns: {
        titleAliases: [
          'Roteiros de vídeo',
          'Estrutura de campanha',
          'Formatos canônicos',
        ],
        required: true,
        targetFields: ['editorial.narrativePatterns'],
      },
      audience: {
        titleAliases: ['Persona principal', 'Audiência'],
        required: true,
        targetFields: ['audience.description'],
      },
      channels: {
        titleAliases: ['Mapa de canais', 'Comportamento de marca'],
        required: true,
        targetFields: ['audience.channels'],
      },
    } satisfies Record<string, BrandSectionSelector>,
  },
} as const;

export type BrandRuntimeSectionKey =
  keyof typeof BRAND_RUNTIME_PROFILE_MAPPING.brandDocument.sections;
