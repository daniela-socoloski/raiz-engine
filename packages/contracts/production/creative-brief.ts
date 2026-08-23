// CreativeBrief — contrato canônico do passo 5 do pipeline de produção.
//
// Responde "o que ESTA produção precisa alcançar". É multiformato por
// definição; vídeo é uma variante, não um contrato concorrente.

import type { BrandId } from '../brand/brand-runtime-profile';

export type ProductionId = string;
export type ProductionKind = 'video' | 'campaign' | 'image' | 'carousel';
export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export type DeliveryChannel =
  | 'instagram-feed'
  | 'reels'
  | 'stories'
  | 'tiktok'
  | 'shorts'
  | 'youtube'
  | 'linkedin'
  | 'site'
  | 'email'
  | 'presentation'
  | 'print'
  | 'other';

export type DesiredResponse =
  | 'recognize'
  | 'understand'
  | 'desire'
  | 'trust'
  | 'act';

export interface CallToAction {
  /** Texto exato aprovado; vazio somente quando a ausência é deliberada. */
  text: string;
  destination?: string;
  placement?: 'opening' | 'throughout' | 'end';
}

export interface BriefConstraints {
  prohibitedTerms?: string[];
  requiredNotices?: string[];
  /** Data-limite ISO-8601, quando existir. */
  dueDate?: string;
  /** Idioma BCP-47 quando diferente do padrão da marca. */
  language?: string;
}

export interface BriefSourceMaterial {
  /** Caminho relativo ao projeto; nunca caminho pessoal absoluto. */
  path: string;
  /** Descrição humana preservada sem interpretação do analisador. */
  note?: string;
  mustUse?: boolean;
  doNotUse?: boolean;
}

export interface VideoDelivery {
  channel: DeliveryChannel;
  aspectRatio: Extract<AspectRatio, '9:16' | '16:9' | '1:1'>;
  targetDurationSeconds?: number;
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
}

export interface ImageDelivery {
  channel: DeliveryChannel;
  aspectRatio: AspectRatio;
  width?: number;
  height?: number;
}

export interface CarouselDelivery {
  channel: Extract<DeliveryChannel, 'instagram-feed' | 'linkedin' | 'presentation' | 'other'>;
  aspectRatio: Extract<AspectRatio, '1:1' | '4:5' | '9:16'>;
  minCards?: number;
  maxCards?: number;
}

export interface CampaignDelivery {
  channels: DeliveryChannel[];
  /** Entregáveis pedidos; o planner não pode acrescentar outro silenciosamente. */
  deliverables: string[];
  startDate?: string;
  endDate?: string;
}

export type BriefStatus = 'draft' | 'ready' | 'superseded';
export type BriefOrigin = 'conversation' | 'style-selection' | 'form' | 'migration';

interface CreativeBriefBase {
  schemaVersion: '1.0';
  productionId: ProductionId;
  version: number;
  status: BriefStatus;
  brandId: BrandId;
  intent: {
    objective: string;
    audience?: string;
    desiredResponse?: DesiredResponse;
    keyMessage?: string;
    callToAction?: CallToAction;
  };
  sourceMaterial?: BriefSourceMaterial[];
  constraints?: BriefConstraints;
  /** Pedido original preservado como evidência, nunca como instrução de motor. */
  verbatim?: string;
  provenance: {
    origin: BriefOrigin;
    createdAt: string;
    updatedAt?: string;
    authoredBy?: string;
  };
}

/**
 * União discriminada única. `productionKind` seleciona os campos de entrega
 * sem obrigar imagem, campanha ou carrossel a fingirem que são vídeo.
 */
export type CreativeBrief = CreativeBriefBase & (
  | { productionKind: 'video'; delivery: VideoDelivery }
  | { productionKind: 'image'; delivery: ImageDelivery }
  | { productionKind: 'carousel'; delivery: CarouselDelivery }
  | { productionKind: 'campaign'; delivery: CampaignDelivery }
);

export const CREATIVE_BRIEF_SCHEMA_VERSION = '1.0' as const;
export const CREATIVE_BRIEF_RELATIVE_PATH = 'edit/planning/creative-brief.json';
