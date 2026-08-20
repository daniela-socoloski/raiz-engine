// Constroi um AudiovisualDirectionPlan a partir do ProjectStyleState existente.
//
// Este e o primeiro seam seguro (ARQUITETURA secao 14). Hoje o fluxo e:
//
//   ProjectStyleState -> prompt em texto livre -> agente -> edit-data.json
//
// A primeira evolucao introduz o contrato SEM mudar o render:
//
//   ProjectStyleState -> AudiovisualDirectionPlan v1 -> artefato persistido
//   -> compilador de compatibilidade -> o mesmo edit-data.json -> o mesmo render
//
// Criterio de aceitacao: "o mesmo briefing atual continua produzindo o mesmo
// render". Este modulo nao altera o briefing; ele o acompanha.
//
// Nao importa de App.tsx nem de main.ts. Nada existente e modificado.

import type { ProjectStyleState } from '../../shared';
import type { BrandRuntimeProfile } from '../../domain/brand/brand-runtime-profile';
import {
  PLAN_SCHEMA_VERSION,
  type AudiovisualDirectionPlan,
  type SceneDirection,
  type VideoFormat,
} from '../../domain/direction/audiovisual-direction-plan';
import { normalizeDirectionPlan } from './serialize-direction-plan';

export interface BuildPlanInput {
  projectId: string;
  style: ProjectStyleState;
  /** Quando ausente, o plano registra que a marca ainda nao foi compilada. */
  brand?: BrandRuntimeProfile;
  format?: VideoFormat;
  /** Cenas ja conhecidas da timeline. Vazio e valido: o plano nasce sem cenas. */
  scenes?: SceneDirection[];
  targetDurationSeconds?: number;
  /** Injetavel para tornar o resultado deterministico em teste. */
  now?: () => Date;
  planId?: string;
}

/**
 * O estilo escolhido na interface carrega decisoes editoriais implicitas.
 * Torna-las explicitas e o proposito do contrato: o que era convencao virou
 * campo declarado, verificavel e versionado.
 */
function readEditorialIntent(style: ProjectStyleState): {
  pace: AudiovisualDirectionPlan['direction']['pace'];
  energy: AudiovisualDirectionPlan['direction']['energy'];
  density: AudiovisualDirectionPlan['direction']['density'];
} {
  // Corte limpo mantem o ritmo da fala; split acelera e adensa.
  const pace = style.edit === 'limpa' ? 'moderate' : 'fast';

  // Elementos ativos aumentam a energia percebida.
  const ativos = [
    style.elements.tracking,
    style.elements.zoomAuto,
    style.elements.zoomCuts,
    style.elements.flashCut,
  ].filter(Boolean).length;
  const energy = ativos === 0 ? 'restrained' : ativos >= 3 ? 'expressive' : 'balanced';

  // Headline e legenda simultaneas adensam a tela.
  const temHeadline = style.headline !== 'none';
  const temCaptions = style.captions !== 'none';
  const density = temHeadline && temCaptions ? 'dense' : temHeadline || temCaptions ? 'moderate' : 'minimal';

  return { pace, energy, density };
}

/** Hierarquia visual derivada do que o usuario ligou, na ordem de leitura. */
function readVisualHierarchy(style: ProjectStyleState): string[] {
  const h: string[] = [];
  if (style.headline !== 'none') h.push(`headline:${style.headline}`);
  if (style.captions !== 'none') h.push(`captions:${style.captions}`);
  if (style.elements.tracking) h.push('tracking-subject');
  if (style.edit !== 'limpa') h.push(`split:${style.edit}`);
  return h;
}

function readSoundPrinciples(style: ProjectStyleState): string[] {
  const p: string[] = ['fala conduz o corte'];
  if (style.elements.musicAI) p.push('trilha gerada acompanha, nunca disputa com a fala');
  else p.push('sem trilha: silencio entre frases e deliberado');
  return p;
}

/**
 * O que este plano nao deve fazer.
 *
 * Recusa explicita vale mais que omissao: sem esta lista, o agente preenche a
 * lacuna com convencao propria, e a marca some.
 */
function readProhibitedPatterns(style: ProjectStyleState, brand?: BrandRuntimeProfile): string[] {
  const p: string[] = [];
  if (style.headline === 'none') p.push('nao inserir headline');
  if (style.captions === 'none') p.push('nao inserir legendas');
  if (!style.elements.zoomAuto && !style.elements.zoomCuts) p.push('nao aplicar zoom automatico');
  if (!style.elements.flashCut) p.push('nao usar flash cut');
  if (!style.elements.musicAI) p.push('nao adicionar trilha musical');
  if (brand?.visual.prohibitedPatterns) p.push(...brand.visual.prohibitedPatterns);
  if (brand?.motion.prohibitedPatterns) p.push(...brand.motion.prohibitedPatterns);
  return p;
}

/**
 * Identificador estavel e legivel. Sem dependencia externa: `randomUUID` do
 * WebCrypto ja existe no runtime do Electron e no Node 19+.
 */
function newPlanId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const rand = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `plan-${stamp}-${rand}`;
}

/**
 * Monta o plano na versao 1, status `draft`.
 *
 * Nunca lanca. O resultado deve ser validado por validateDirectionPlan antes de
 * ser persistido ou enviado ao agente.
 */
export function buildPlanFromStyle(input: BuildPlanInput): AudiovisualDirectionPlan {
  const now = (input.now ?? (() => new Date()))();
  const { pace, energy, density } = readEditorialIntent(input.style);

  return normalizeDirectionPlan({
    schemaVersion: PLAN_SCHEMA_VERSION,
    planId: input.planId ?? newPlanId(now),
    projectId: input.projectId,
    version: 1,
    status: 'draft',

    inputs: {
      brandProfileVersion: input.brand ? String(input.brand.version) : undefined,
    },

    intent: {
      // A nota do usuario e o objetivo declarado. Quando vazia, o plano diz
      // isso em vez de inventar um objetivo plausivel.
      objective: input.style.note.trim() || 'objetivo nao declarado pelo usuario',
      format: input.format ?? '9:16',
      targetDurationSeconds: input.targetDurationSeconds,
      audience: input.brand?.audience?.description,
    },

    direction: {
      pace,
      energy,
      density,
      visualHierarchy: readVisualHierarchy(input.style),
      soundPrinciples: readSoundPrinciples(input.style),
      prohibitedPatterns: readProhibitedPatterns(input.style, input.brand),
      narrativeSummary: input.style.note.trim() || undefined,
    },

    scenes: input.scenes ?? [],

    provenance: {
      // `migration` e honesto: o plano nasce de uma selecao de interface, nao
      // de um planner que raciocinou sobre o conteudo. Vira `planner` na Fase 3.
      origin: 'migration',
      createdAt: now.toISOString(),
    },
  });
}
