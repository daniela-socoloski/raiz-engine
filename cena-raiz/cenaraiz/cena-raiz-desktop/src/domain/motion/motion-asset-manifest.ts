// MotionAssetManifest — contrato do Motion Asset Registry.
//
// O registry e o principal mecanismo de reducao de tokens e de consistencia: o
// modelo seleciona um asset por identificador e fornece parametros, em vez de
// redescrever a implementacao a cada cena.
//
// Sem ele, a regra "reutilizar antes de gerar" nao tem como ser cumprida: o
// sistema nao sabe o que ja tem.
//
// Fonte: PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md secao 6.4.

export type MotionEngine = 'remotion' | 'after-effects' | 'mogrt' | 'lottie' | 'media';

export type AspectRatio = '9:16' | '16:9' | '1:1';

/**
 * Parametro declarado do asset.
 *
 * O planner preenche estes campos. Qualquer campo fora desta lista e invencao
 * do modelo e deve ser recusado antes da execucao.
 */
export type MotionAssetParameter =
  | { type: 'string'; required?: boolean; maxLength?: number }
  | { type: 'number'; required?: boolean; min?: number; max?: number }
  | { type: 'boolean'; required?: boolean }
  | { type: 'color'; required?: boolean }
  | { type: 'enum'; required?: boolean; values: string[] }
  | { type: 'image' | 'video' | 'audio'; required?: boolean };

export interface MotionAssetManifest {
  schemaVersion: '1.0';
  /** Identificador estavel. O plano cita este ID, nunca o caminho do arquivo. */
  assetId: string;
  version: string;
  name: string;
  engine: MotionEngine;

  /**
   * Onde o asset vive. Preenchido conforme o motor:
   * remotion usa `component`; after-effects usa `project` e `composition`;
   * mogrt, lottie e media usam `file`.
   */
  source: {
    project?: string;
    composition?: string;
    component?: string;
    file?: string;
  };

  /** O que o asset faz, em vocabulario de funcao editorial. */
  capabilities: string[];
  /** Marcas ou perfis com que combina. Vazio significa neutro. */
  brandTags: string[];
  aspectRatios: AspectRatio[];

  duration: {
    mode: 'fixed' | 'stretchable' | 'loopable';
    defaultFrames: number;
    minFrames?: number;
    maxFrames?: number;
  };

  parameters: Record<string, MotionAssetParameter>;

  preview: {
    thumbnail: string;
    video?: string;
  };

  compatibility: {
    minAppVersion?: string;
    maxAppVersion?: string;
    requiredFonts?: string[];
    requiredPlugins?: string[];
  };

  /** Muda quando o asset muda. Permite detectar drift sem reler o arquivo. */
  fingerprint: string;
}

export const MOTION_ASSET_SCHEMA_VERSION = '1.0' as const;

/** Diretorio canonico dos manifestos, relativo aos resources do aplicativo. */
export const MOTION_ASSET_MANIFEST_DIR = 'motion-assets/manifests';

/** Registro do que o projeto usou, para tornar um render reproduzivel. */
export const REGISTRY_LOCK_RELATIVE_PATH = 'edit/motion/registry-lock.json';
