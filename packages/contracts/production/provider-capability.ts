// ProviderCapability — o que um gerador consegue fazer, declarado e sondado.
//
// É o Capability Registry do passo 11 em forma de contrato. Ele responde
// "consigo?", nunca "devo?" — a resposta "devo" já veio do plano aprovado no
// passo 10. Ter FFmpeg instalado não autoriza usá-lo; ter crédito de vídeo não
// decide a direção.
//
// A lacuna que este contrato fecha: no protótipo, as faixas aceitas viviam
// dentro do script como constantes —
//
//     ASPECT_RATIOS = {"auto", "1:1", ..., "21:9"}
//     RESOLUTIONS   = {"480p", "720p", "1080p"}
//     DURATION_MIN, DURATION_MAX = 4, 15
//
// — e por isso descreviam UM provider. Trocar de gerador exigia editar código.
// Aqui a capacidade é dado: um provider novo é um objeto, não um `if`.
//
// Nada aqui é presumido. `availability` e as faixas vêm de sondagem, e
// `probedAt` diz quando. Sessão que expira no meio de uma produção muda a
// disponibilidade sem mudar o plano.
//
// Fonte: packages/docs/pipeline/passo-11-asset-selection-and-execution-routing.md

export type GenerationKind = 'image' | 'video';

/**
 * Estado da sondagem. `login-required` é distinto de `missing` porque a ação
 * humana é outra: uma pede login e **retoma de onde parou**, a outra pede
 * instalação ou o outro caminho.
 */
export type ProviderAvailability = 'ok' | 'login-required' | 'missing';

/**
 * Como o provider trata áudio.
 *
 * `parameter` significa que ele aceita ligar e desligar. `never` significa que
 * não expõe o parâmetro — e aí o áudio fica por conta do modelo, o que precisa
 * ser registrado em vez de silenciado. `always` significa que sai com som e o
 * parâmetro é ignorado.
 */
export type SoundSupport = 'always' | 'parameter' | 'never';

export interface ImageCapability {
  /** Identificadores aceitos pelo provider, ex.: `gpt_image_2`. */
  models: string[];
  aspectRatios: string[];
  resolutions: string[];
  qualities?: string[];
  /** Se aceita imagem de referência para guiar estilo e composição. */
  acceptsReferences: boolean;
  maxReferences?: number;
}

export interface VideoCapability {
  models: string[];
  aspectRatios: string[];
  resolutions: string[];
  /** Faixa suportada. Fora dela o provider recusa ou trunca em silêncio. */
  durationSecondsMin: number;
  durationSecondsMax: number;
  /** `std` final, `fast` preview — nomes do provider, não nossos. */
  modes: string[];
  genres?: string[];
  sound: SoundSupport;
  /** Se aceita imagens de entrada — frames, produto, logo. */
  acceptsImages: boolean;
  maxImages?: number;
}

export interface ProviderCapability {
  schemaVersion: '1.0';
  /** Estável, ex.: `higgsfield-cli`, `freepik-magnific-mcp`. */
  providerId: string;
  displayName: string;

  availability: ProviderAvailability;
  /**
   * Quando a capacidade foi sondada, ISO 8601. Capacidade sem data é suposição:
   * uma sessão pode ter expirado desde a última vez.
   */
  probedAt: string;
  /** Por que está indisponível. Aparece para a pessoa, então diz o que fazer. */
  unavailableReason?: string;

  /** Ausente significa "este provider não gera imagem". */
  image?: ImageCapability;
  /** Ausente significa "este provider não gera vídeo". */
  video?: VideoCapability;
}

export const PROVIDER_CAPABILITY_SCHEMA_VERSION = '1.0' as const;

/**
 * Custo é estimado pelo provider, não calculado aqui. Inventar uma fórmula
 * local seria adivinhar preço de terceiro e errar caro.
 */
export interface CostEstimate {
  /** Na unidade do provider — crédito, token, dólar. */
  value: number;
  unit: string;
  estimatedAt: string;
  providerId: string;
}
