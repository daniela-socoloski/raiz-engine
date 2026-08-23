// Cache do ContentAnalysis por fingerprint (passo 6).
//
// Regra do LOGICA-PIPELINE-CRIATIVO § 3.2: "Fonte inalterada reutiliza o
// resultado; fonte alterada invalida somente a análise afetada."
//
// Transformação pura: recebe fingerprints já calculados e devolve a decisão.
// Ler arquivo e calcular SHA-256 é trabalho do adapter de filesystem, fora
// daqui — é o que mantém esta camada testável sem disco.

import type { ContentAnalysis, SourceFingerprint } from '../../contracts/production/content-analysis';

/** Fonte como o chamador a conhece hoje, antes de decidir se reanalisa. */
export interface SourceFingerprintInput {
  sourceId: string;
  fingerprint: SourceFingerprint;
}

export type CacheDecisionReason =
  | 'no-previous-analysis'
  | 'analyzer-changed'
  | 'sources-added'
  | 'sources-removed'
  | 'sources-changed'
  | 'previous-failed'
  | 'unchanged';

export type ContentAnalysisCacheDecision =
  | { reuse: true; reason: 'unchanged'; analysis: ContentAnalysis }
  | {
      reuse: false;
      reason: Exclude<CacheDecisionReason, 'unchanged'>;
      /**
       * Fontes que precisam ser reanalisadas. Vazio significa "reanalise tudo"
       * — o caso em que a mudança não é localizável numa fonte específica,
       * como troca de versão do analisador.
       */
      staleSourceIds: string[];
    };

/**
 * Fingerprint do conjunto. Ordena por `sourceId` antes de concatenar: a ordem
 * em que as fontes chegam não pode mudar a identidade do cache, senão a mesma
 * pasta invalidaria a análise a cada leitura de diretório.
 */
export function combineFingerprints(
  sources: readonly SourceFingerprintInput[],
  hashHex: (input: string) => string,
): SourceFingerprint {
  const stable = [...sources]
    .sort((a, b) => (a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0))
    .map((source) => `${source.sourceId}:${source.fingerprint}`)
    .join('\n');
  return hashHex(stable);
}

/**
 * Decide entre reaproveitar a análise anterior e refazê-la.
 *
 * `analyzerVersion` participa da decisão porque analisador novo pode extrair
 * fato que o anterior não via — reaproveitar aí seria congelar uma limitação
 * já corrigida.
 */
export function decideContentAnalysisCache(
  previous: ContentAnalysis | null,
  currentSources: readonly SourceFingerprintInput[],
  analyzerVersion: string,
): ContentAnalysisCacheDecision {
  if (!previous) {
    return { reuse: false, reason: 'no-previous-analysis', staleSourceIds: [] };
  }

  // Análise que falhou não é cache: é ausência de resultado.
  if (previous.status === 'failed') {
    return { reuse: false, reason: 'previous-failed', staleSourceIds: [] };
  }

  if (previous.provenance.analyzerVersion !== analyzerVersion) {
    return { reuse: false, reason: 'analyzer-changed', staleSourceIds: [] };
  }

  const before = new Map(previous.sources.map((source) => [source.sourceId, source.fingerprint]));
  const now = new Map(currentSources.map((source) => [source.sourceId, source.fingerprint]));

  const added = [...now.keys()].filter((id) => !before.has(id));
  if (added.length > 0) {
    return { reuse: false, reason: 'sources-added', staleSourceIds: added };
  }

  const removed = [...before.keys()].filter((id) => !now.has(id));
  if (removed.length > 0) {
    // Nada a reanalisar: o trabalho é descartar o que sobrou da fonte removida.
    return { reuse: false, reason: 'sources-removed', staleSourceIds: [] };
  }

  const changed = [...now.entries()]
    .filter(([id, fingerprint]) => before.get(id) !== fingerprint)
    .map(([id]) => id);
  if (changed.length > 0) {
    return { reuse: false, reason: 'sources-changed', staleSourceIds: changed };
  }

  return { reuse: true, reason: 'unchanged', analysis: previous };
}

/**
 * Remove da análise anterior tudo que dependia das fontes invalidadas,
 * preservando o que continua verdadeiro. É o "invalida somente a análise
 * afetada" do documento.
 *
 * O resultado volta como `partial`: falta reanalisar as fontes marcadas, e
 * declarar `complete` aqui seria afirmar cobertura que não existe.
 */
export function pruneStaleEvidence(
  previous: ContentAnalysis,
  staleSourceIds: readonly string[],
): ContentAnalysis {
  const stale = new Set(staleSourceIds);
  const keep = <T extends { sourceId?: string }>(item: T): boolean =>
    item.sourceId === undefined || !stale.has(item.sourceId);

  return {
    ...previous,
    status: 'partial',
    sources: previous.sources.filter((source) => !stale.has(source.sourceId)),
    facts: previous.facts.filter(keep),
    transcript: previous.transcript
      ? {
          ...previous.transcript,
          segments: previous.transcript.segments.filter((segment) => !stale.has(segment.sourceId)),
        }
      : undefined,
    gaps: previous.gaps.filter(keep),
    risks: previous.risks.filter(keep),
    unknowns: previous.unknowns.filter(keep),
  };
}
