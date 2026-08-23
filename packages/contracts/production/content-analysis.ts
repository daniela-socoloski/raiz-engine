// ContentAnalysis — contrato canônico do passo 6 do pipeline de produção.
//
// Responde "o que existe no material recebido?". NÃO decide o que a produção
// deve ser: narrativa nasce no passo 8, direção no 9, asset e motor no 11.
//
// Fronteira dura (LOGICA-PIPELINE-CRIATIVO.md § 3.2): evidência, nunca direção.
// Fato observado e hipótese criativa não podem se misturar aqui — por isso
// `facts` carrega origem verificável e `unknowns` é explícito em vez de
// silencioso. Ausência de evidência é informação, não licença para inventar.
//
// Cache por fingerprint: fonte inalterada reutiliza o resultado; fonte alterada
// invalida somente a análise afetada.

import type { ProductionId } from './creative-brief';

/** SHA-256 do conteúdo da fonte. Identidade de cache e prova de integridade. */
export type SourceFingerprint = string;

/** Natureza da fonte analisada. Governa quais evidências fazem sentido. */
export type SourceKind = 'video' | 'audio' | 'image' | 'text' | 'document';

export interface AnalyzedSource {
  /** Estável dentro desta análise; referenciado por fatos e segmentos. */
  sourceId: string;
  /** Caminho relativo à pasta do projeto. Nunca caminho pessoal absoluto. */
  path: string;
  kind: SourceKind;
  fingerprint: SourceFingerprint;
  /** Bytes no momento da leitura; detecta troca de arquivo com mesmo nome. */
  sizeBytes?: number;
  /** Só para fontes temporais. */
  durationSeconds?: number;
  /** Dimensões de imagem ou vídeo, quando o analisador conseguiu ler. */
  width?: number;
  height?: number;
}

/**
 * Intervalo dentro de uma fonte temporal. Em segundos, não em frames: frame
 * depende do FPS de destino, que só é decidido na execução (passo 11).
 */
export interface TimeRange {
  startSeconds: number;
  endSeconds: number;
}

/**
 * O que sustenta um fato. `observed` vem de leitura direta do arquivo;
 * `derived` vem de cálculo sobre observações; `model` vem de inferência
 * probabilística e por isso exige `confidence`.
 */
export type EvidenceBasis = 'observed' | 'derived' | 'model';

export type FactKind =
  | 'topic'
  | 'object'
  | 'person'
  | 'speech'
  | 'text-on-screen'
  | 'scene-change'
  | 'silence'
  | 'strong-moment'
  | 'quality-issue';

/**
 * Um fato sobre o material. Nunca uma recomendação: "há 12s de silêncio no
 * início" é fato; "cortar o início" é direção e não pertence a este contrato.
 */
export interface ContentFact {
  factId: string;
  kind: FactKind;
  /** Descrição factual, sem juízo criativo. */
  statement: string;
  sourceId: string;
  /** Onde na fonte, quando ela for temporal. */
  range?: TimeRange;
  basis: EvidenceBasis;
  /** Obrigatório quando `basis` é `model`. Entre 0 e 1. */
  confidence?: number;
}

/** Segmento de fala alinhado. Alimenta corte e legenda sem reprocessar áudio. */
export interface TranscriptSegment {
  sourceId: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  /** BCP-47 detectado pelo analisador. */
  language?: string;
  speaker?: string;
  confidence?: number;
}

export interface TranscriptEvidence {
  /** Ferramenta e versão que produziram o alinhamento. */
  analyzer: string;
  analyzerVersion?: string;
  segments: TranscriptSegment[];
  /** Idioma predominante detectado no conjunto. */
  dominantLanguage?: string;
}

export type GapKind =
  | 'missing-coverage'
  | 'unusable-audio'
  | 'unusable-video'
  | 'insufficient-duration'
  | 'missing-source';

/**
 * O que o material NÃO oferece. Existe para o planner do passo 8 saber onde
 * precisará gerar ou pedir material, em vez de descobrir na execução.
 */
export interface ContentGap {
  kind: GapKind;
  statement: string;
  sourceId?: string;
  range?: TimeRange;
}

export type RiskKind =
  | 'third-party-content'
  | 'identifiable-person'
  | 'trademark-visible'
  | 'audio-rights'
  | 'sensitive-content';

/** Risco observado no material. Sinaliza; não decide se pode ou não usar. */
export interface ContentRisk {
  kind: RiskKind;
  statement: string;
  sourceId?: string;
  range?: TimeRange;
}

/**
 * Pergunta que a evidência não respondeu. Explícito por design: `unknowns`
 * vazio significa "nada ficou em aberto", nunca "não olhei".
 */
export interface ContentUnknown {
  question: string;
  reason: string;
  sourceId?: string;
}

export type AnalysisStatus = 'partial' | 'complete' | 'failed';

export interface ContentAnalysis {
  schemaVersion: '1.0';
  productionId: ProductionId;
  /** Incrementa quando qualquer fonte muda e a análise é refeita. */
  version: number;
  status: AnalysisStatus;

  sources: AnalyzedSource[];
  facts: ContentFact[];
  transcript?: TranscriptEvidence;
  gaps: ContentGap[];
  risks: ContentRisk[];
  unknowns: ContentUnknown[];

  /**
   * O que esta análise não cobriu — falta de ferramenta, formato não suportado,
   * arquivo ilegível. Diferente de `unknowns`: aqui a limitação é do analisador,
   * lá a evidência é que não conclui.
   */
  limitations?: string[];

  provenance: {
    analyzedAt: string;
    /** Identifica o analisador para invalidar cache quando ele evolui. */
    analyzerVersion: string;
    /**
     * Fingerprint do conjunto: derivado dos fingerprints das fontes em ordem
     * estável. É a chave de cache da análise inteira.
     */
    combinedFingerprint: SourceFingerprint;
    /** Ferramentas que participaram, com versão. */
    tools?: Array<{ name: string; version: string }>;
  };
}

export const CONTENT_ANALYSIS_SCHEMA_VERSION = '1.0' as const;
/** Caminho canônico da análise dentro da produção, par de `creative-brief.json`. */
export const CONTENT_ANALYSIS_RELATIVE_PATH = 'edit/analysis/content-analysis.json';
