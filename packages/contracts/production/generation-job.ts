// GenerationJob — um pedido de geração, ligado às cenas que ele realiza.
//
// É a projeção determinística do passo 11: `ScenePlan` decide o que a cena
// precisa ser; este contrato decide o que será pedido ao provider. A projeção é
// recalculável e não disputa a fonte da verdade com `ScenePlan`.
//
// O que o protótipo passava como flags soltas de linha de comando —
// `--frame`, `--produto`, `--logo`, `--duration`, `--sound` — aqui é estado
// verificável, porque três regras dependem disso e nenhuma delas cabe num
// argparse:
//
//   1. a ORDEM dos anexos amarra o prompt aos arquivos: o texto diz
//      "image 1", "image 2" e "the attached logo image", e trocar a ordem
//      troca o significado do prompt sem erro nenhum aparecer;
//   2. o logo NUNCA é referência de imagem — provider redesenha logo, e logo
//      redesenhado é logo errado;
//   3. vídeo custa mais que imagem, então a estimativa vem antes do disparo.
//
// Fonte: packages/docs/pipeline/passo-11-asset-selection-and-execution-routing.md
//        recipes/motion-generativo/references/providers.md

import type { CostEstimate, GenerationKind } from './provider-capability';

/**
 * O papel do arquivo dentro do pedido. Não é o tipo do arquivo — é o que ele
 * significa para o prompt.
 */
export type AttachmentRole = 'frame' | 'product' | 'logo';

/**
 * A ordem canônica de envio. O prompt se refere aos anexos por posição, então
 * esta constante é contrato, não conveniência.
 */
export const ATTACHMENT_ORDER: readonly AttachmentRole[] = ['frame', 'product', 'logo'];

export interface JobAttachment {
  role: AttachmentRole;
  /** Relativo à produção, com barras normais. Nunca caminho pessoal. */
  path: string;
  /** Identificador remoto depois do upload. Preenchido pelo adapter. */
  remoteId?: string;
}

export interface ImageJobParams {
  model: string;
  aspectRatio: string;
  resolution: string;
  quality?: string;
}

export type SoundSetting = 'on' | 'off';

export interface VideoJobParams {
  model: string;
  aspectRatio: string;
  resolution: string;
  durationSeconds: number;
  /** `std` final, `fast` preview. */
  mode: string;
  genre?: string;
  /**
   * Padrão do sistema é `on`. Não é pergunta: o prompt já traz a direção de
   * áudio e a trava contra locução. Sem direção explícita o modelo inventa.
   */
  sound: SoundSetting;
}

/** Como o áudio realmente saiu. Distinto do que foi pedido. */
export type SoundOutcome = 'as-requested' | 'model-default' | 'unsupported';

export type JobStatus = 'draft' | 'estimated' | 'dispatched' | 'succeeded' | 'failed';

export interface JobResult {
  outputPath: string;
  /** Do provider. Guardado para reproduzir ou depurar resultado estranho. */
  remoteUrl?: string;
  sizeBytes?: number;
  /**
   * Quando o provider não expõe o parâmetro de som, o áudio fica por conta do
   * modelo — e isso precisa ser registrado, não silenciado.
   */
  soundOutcome?: SoundOutcome;
  failureReason?: string;
}

export interface GenerationJob {
  schemaVersion: '1.0';
  jobId: string;
  kind: GenerationKind;
  status: JobStatus;

  /** Identificador do provider sondado, de `ProviderCapability.providerId`. */
  providerId: string;

  /**
   * Quais cenas do plano este job realiza. É o que liga a execução de volta à
   * decisão aprovada — sem isto, o arquivo gerado é órfão e ninguém consegue
   * dizer qual cena ele cumpre.
   */
  sceneIds: string[];

  /** Caminho do prompt dentro da produção. O texto não mora no job. */
  promptPath: string;
  /**
   * Versão do template que produziu o prompt. Dois resultados de templates
   * diferentes não são comparáveis.
   */
  promptVersion?: string;

  params: ImageJobParams | VideoJobParams;

  /** Na ordem canônica. Ver `ATTACHMENT_ORDER`. */
  attachments: JobAttachment[];

  /** Obrigatória antes de disparar vídeo. */
  estimate?: CostEstimate;

  /** Caminho de saída dentro da produção. */
  outputPath: string;

  result?: JobResult;

  provenance: {
    createdAt: string;
    /** Identificador do modelo tal como o provider o nomeia. */
    model: string;
    /** Do provider, depois do disparo. Chave para reabrir o job lá. */
    remoteJobId?: string;
  };
}

export const GENERATION_JOB_SCHEMA_VERSION = '1.0' as const;

/** Discriminante estreito para os parâmetros. */
export function isVideoParams(
  params: ImageJobParams | VideoJobParams,
): params is VideoJobParams {
  return (params as VideoJobParams).durationSeconds !== undefined;
}
