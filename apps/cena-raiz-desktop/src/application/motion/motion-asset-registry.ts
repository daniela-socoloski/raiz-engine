// Motion Asset Registry — descoberta, validacao e selecao de assets.
//
// Criterios de aceitacao do WP3:
//   - o registry carrega deterministicamente;
//   - assets duplicados, invalidos ou incompativeis NAO chegam ao planner;
//   - todo asset selecionado cita ID, fonte, resultado de compatibilidade e
//     proposito de cena.
//
// Puro: nao le disco nem chama processo. Recebe manifestos ja lidos e decide.
// Assim o registry e testavel sem fixture de sistema de arquivos, e o adapter
// de disco fica na camada de infraestrutura.
//
// Source: docs/architecture/cena-raiz-audiovisual-evolution.md sections 6.4 and 19 (WP3).

import {
  MOTION_ASSET_SCHEMA_VERSION,
  type AspectRatio,
  type MotionAssetManifest,
  type MotionAssetParameter,
  type MotionEngine,
} from '../../domain/motion/motion-asset-manifest';

// ---------------------------------------------------------------- validacao

export interface ManifestIssue {
  path: string;
  message: string;
}

export type ManifestValidation =
  | { valid: true; manifest: MotionAssetManifest }
  | { valid: false; issues: ManifestIssue[] };

const ENGINES: MotionEngine[] = ['remotion', 'after-effects', 'mogrt', 'lottie', 'media'];
const RATIOS: AspectRatio[] = ['9:16', '16:9', '1:1'];
const DURATION_MODES = ['fixed', 'stretchable', 'loopable'] as const;
const PARAM_TYPES = ['string', 'number', 'boolean', 'color', 'enum', 'image', 'video', 'audio'] as const;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/** Cada motor exige um campo de origem diferente. Sem ele, o asset nao resolve. */
function requiredSourceField(engine: MotionEngine): keyof MotionAssetManifest['source'] {
  switch (engine) {
    case 'remotion': return 'component';
    case 'after-effects': return 'composition';
    default: return 'file';
  }
}

function validateParameter(p: unknown, name: string, issues: ManifestIssue[]): void {
  const at = `parameters.${name}`;
  if (!isObject(p)) { issues.push({ path: at, message: 'deve ser objeto' }); return; }
  if (typeof p.type !== 'string' || !(PARAM_TYPES as readonly string[]).includes(p.type)) {
    issues.push({ path: `${at}.type`, message: `deve ser um de: ${PARAM_TYPES.join(', ')}` });
    return;
  }
  if (p.type === 'enum') {
    if (!Array.isArray(p.values) || p.values.length === 0) {
      issues.push({ path: `${at}.values`, message: 'enum exige lista nao vazia' });
    } else if (!p.values.every(isText)) {
      issues.push({ path: `${at}.values`, message: 'todos os valores devem ser strings' });
    }
  }
  if (p.type === 'number') {
    const { min, max } = p as { min?: unknown; max?: unknown };
    if (typeof min === 'number' && typeof max === 'number' && min > max) {
      issues.push({ path: at, message: 'min nao pode ser maior que max' });
    }
  }
}

/**
 * Valida um manifesto vindo do disco.
 *
 * Devolve todos os problemas de uma vez: corrigir um manifesto quebrado um erro
 * por vez e trabalho desnecessario.
 */
export function validateMotionAssetManifest(input: unknown): ManifestValidation {
  const issues: ManifestIssue[] = [];
  if (!isObject(input)) {
    return { valid: false, issues: [{ path: '', message: 'manifesto deve ser objeto' }] };
  }

  if (input.schemaVersion !== MOTION_ASSET_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      message: `esta build aceita "${MOTION_ASSET_SCHEMA_VERSION}"; recebido ${JSON.stringify(input.schemaVersion)}`,
    });
  }
  if (!isText(input.assetId)) issues.push({ path: 'assetId', message: 'obrigatorio' });
  if (!isText(input.version)) issues.push({ path: 'version', message: 'obrigatorio' });
  if (!isText(input.name)) issues.push({ path: 'name', message: 'obrigatorio' });
  if (!isText(input.fingerprint)) {
    issues.push({ path: 'fingerprint', message: 'obrigatorio: sem ele nao ha como detectar drift' });
  }

  const engine = input.engine as MotionEngine;
  if (typeof engine !== 'string' || !ENGINES.includes(engine)) {
    issues.push({ path: 'engine', message: `deve ser um de: ${ENGINES.join(', ')}` });
  } else {
    if (!isObject(input.source)) {
      issues.push({ path: 'source', message: 'obrigatorio' });
    } else {
      const campo = requiredSourceField(engine);
      if (!isText(input.source[campo])) {
        issues.push({ path: `source.${campo}`, message: `obrigatorio para engine "${engine}"` });
      }
    }
  }

  if (!Array.isArray(input.capabilities) || !input.capabilities.every(isText)) {
    issues.push({ path: 'capabilities', message: 'array de strings, nao vazio' });
  } else if (input.capabilities.length === 0) {
    issues.push({ path: 'capabilities', message: 'um asset sem capacidade declarada nao pode ser escolhido' });
  }
  if (!Array.isArray(input.brandTags) || !input.brandTags.every(isText)) {
    issues.push({ path: 'brandTags', message: 'array de strings (vazio significa neutro)' });
  }
  if (!Array.isArray(input.aspectRatios) || input.aspectRatios.length === 0
      || !input.aspectRatios.every((r) => RATIOS.includes(r as AspectRatio))) {
    issues.push({ path: 'aspectRatios', message: `pelo menos um de: ${RATIOS.join(', ')}` });
  }

  if (!isObject(input.duration)) {
    issues.push({ path: 'duration', message: 'obrigatorio' });
  } else {
    const d = input.duration;
    if (typeof d.mode !== 'string' || !(DURATION_MODES as readonly string[]).includes(d.mode)) {
      issues.push({ path: 'duration.mode', message: `deve ser um de: ${DURATION_MODES.join(', ')}` });
    }
    if (!isInt(d.defaultFrames) || (d.defaultFrames as number) <= 0) {
      issues.push({ path: 'duration.defaultFrames', message: 'inteiro > 0' });
    }
    const { minFrames: mn, maxFrames: mx } = d as { minFrames?: unknown; maxFrames?: unknown };
    if (isInt(mn) && isInt(mx) && (mn as number) > (mx as number)) {
      issues.push({ path: 'duration', message: 'minFrames nao pode ser maior que maxFrames' });
    }
    // Um asset fixo com faixa declarada mente sobre o proprio comportamento.
    if (d.mode === 'fixed' && (mn !== undefined || mx !== undefined)) {
      issues.push({ path: 'duration', message: 'modo fixed nao aceita minFrames/maxFrames' });
    }
  }

  if (!isObject(input.parameters)) {
    issues.push({ path: 'parameters', message: 'obrigatorio (objeto vazio e valido)' });
  } else {
    for (const [nome, p] of Object.entries(input.parameters)) validateParameter(p, nome, issues);
  }

  if (!isObject(input.preview) || !isText((input.preview as Record<string, unknown>).thumbnail)) {
    issues.push({ path: 'preview.thumbnail', message: 'obrigatorio: o usuario escolhe vendo, nao lendo' });
  }
  if (!isObject(input.compatibility)) {
    issues.push({ path: 'compatibility', message: 'obrigatorio (objeto vazio e valido)' });
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, manifest: input as unknown as MotionAssetManifest };
}

// ---------------------------------------------------------------- registry

export interface RejectedAsset {
  /** Identificador quando legivel; caminho quando o manifesto nem parseia. */
  ref: string;
  reason: 'invalid' | 'duplicate';
  issues?: ManifestIssue[];
}

export interface MotionAssetRegistry {
  /** Ordenado por assetId: a mesma entrada produz sempre a mesma saida. */
  assets: MotionAssetManifest[];
  /** O que ficou de fora e por que. Rejeicao silenciosa esconde asset quebrado. */
  rejected: RejectedAsset[];
}

/**
 * Constroi o registry a partir de manifestos brutos.
 *
 * Determinismo: a ordem de entrada nao altera o resultado. IDs duplicados sao
 * resolvidos pela primeira ocorrencia em ordem alfabetica de referencia, e a
 * segunda e rejeitada explicitamente.
 */
export function buildMotionAssetRegistry(
  entries: Array<{ ref: string; raw: unknown }>,
): MotionAssetRegistry {
  const assets: MotionAssetManifest[] = [];
  const rejected: RejectedAsset[] = [];
  const vistos = new Map<string, string>();

  const ordenado = [...entries].sort((a, b) => a.ref.localeCompare(b.ref));

  for (const { ref, raw } of ordenado) {
    const r = validateMotionAssetManifest(raw);
    if (!r.valid) {
      rejected.push({ ref, reason: 'invalid', issues: r.issues });
      continue;
    }
    const id = r.manifest.assetId;
    if (vistos.has(id)) {
      rejected.push({
        ref,
        reason: 'duplicate',
        issues: [{ path: 'assetId', message: `ja registrado por ${vistos.get(id)}` }],
      });
      continue;
    }
    vistos.set(id, ref);
    assets.push(r.manifest);
  }

  assets.sort((a, b) => a.assetId.localeCompare(b.assetId));
  return { assets, rejected };
}

// ---------------------------------------------------------------- selecao

export interface AssetQuery {
  /** Capacidade exigida pela cena, ex.: `caption`, `headline`, `transition`. */
  capability: string;
  aspectRatio: AspectRatio;
  /** Duracao necessaria em frames. Assets que nao cabem sao descartados. */
  frames?: number;
  /** Marca alvo. Assets neutros continuam elegiveis. */
  brandTag?: string;
  requiredFonts?: string[];
  availablePlugins?: string[];
}

export interface AssetMatch {
  assetId: string;
  name: string;
  engine: MotionEngine;
  source: MotionAssetManifest['source'];
  /** Por que este asset e compativel. Toda selecao precisa citar o motivo. */
  compatibility: string[];
  score: number;
}

export interface AssetRejection {
  assetId: string;
  reason: string;
}

export interface AssetSelection {
  matches: AssetMatch[];
  rejections: AssetRejection[];
}

function fitsDuration(a: MotionAssetManifest, frames?: number): { ok: boolean; why: string } {
  if (frames === undefined) return { ok: true, why: 'duracao nao restrita' };
  const { mode, defaultFrames, minFrames, maxFrames } = a.duration;
  if (mode === 'fixed') {
    return defaultFrames === frames
      ? { ok: true, why: `duracao fixa bate (${frames}f)` }
      : { ok: false, why: `duracao fixa de ${defaultFrames}f nao atende ${frames}f` };
  }
  if (minFrames !== undefined && frames < minFrames) {
    return { ok: false, why: `abaixo do minimo de ${minFrames}f` };
  }
  if (maxFrames !== undefined && frames > maxFrames) {
    return { ok: false, why: `acima do maximo de ${maxFrames}f` };
  }
  return { ok: true, why: mode === 'loopable' ? 'repetivel' : 'elastico' };
}

/**
 * Seleciona assets compativeis, ranqueados.
 *
 * Abstem-se quando nada e compativel: devolver `matches` vazio e resposta
 * legitima. Forcar uma escolha ruim e pior que nao escolher — o plano de
 * evolucao exige que o sistema se abstenha quando nao ha asset compativel.
 */
export function selectMotionAssets(
  registry: MotionAssetRegistry,
  query: AssetQuery,
): AssetSelection {
  const matches: AssetMatch[] = [];
  const rejections: AssetRejection[] = [];

  for (const a of registry.assets) {
    const porques: string[] = [];

    if (!a.capabilities.includes(query.capability)) {
      rejections.push({ assetId: a.assetId, reason: `nao declara a capacidade "${query.capability}"` });
      continue;
    }
    porques.push(`declara "${query.capability}"`);

    if (!a.aspectRatios.includes(query.aspectRatio)) {
      rejections.push({ assetId: a.assetId, reason: `nao suporta ${query.aspectRatio}` });
      continue;
    }
    porques.push(`suporta ${query.aspectRatio}`);

    const dur = fitsDuration(a, query.frames);
    if (!dur.ok) { rejections.push({ assetId: a.assetId, reason: dur.why }); continue; }
    porques.push(dur.why);

    // Fonte ausente quebra o render depois, no meio da fila. Barrar aqui.
    const fontesFaltando = (a.compatibility.requiredFonts ?? [])
      .filter((f) => query.requiredFonts !== undefined && !query.requiredFonts.includes(f));
    if (fontesFaltando.length > 0) {
      rejections.push({ assetId: a.assetId, reason: `fontes ausentes: ${fontesFaltando.join(', ')}` });
      continue;
    }

    const pluginsFaltando = (a.compatibility.requiredPlugins ?? [])
      .filter((p) => query.availablePlugins !== undefined && !query.availablePlugins.includes(p));
    if (pluginsFaltando.length > 0) {
      rejections.push({ assetId: a.assetId, reason: `plugins ausentes: ${pluginsFaltando.join(', ')}` });
      continue;
    }

    // Marca especifica ganha do neutro; neutro continua elegivel.
    let score = 1;
    if (query.brandTag !== undefined) {
      if (a.brandTags.includes(query.brandTag)) {
        score += 2;
        porques.push(`marcado para "${query.brandTag}"`);
      } else if (a.brandTags.length === 0) {
        porques.push('neutro de marca');
      } else {
        rejections.push({ assetId: a.assetId, reason: `pertence a outra marca: ${a.brandTags.join(', ')}` });
        continue;
      }
    }

    if (a.duration.mode === 'stretchable') score += 1;

    matches.push({
      assetId: a.assetId,
      name: a.name,
      engine: a.engine,
      source: a.source,
      compatibility: porques,
      score,
    });
  }

  matches.sort((x, y) => (y.score - x.score) || x.assetId.localeCompare(y.assetId));
  return { matches, rejections };
}

/**
 * Recusa parametros que o asset nao declara.
 *
 * Campo inventado pelo modelo nunca chega ao motor: e o principio
 * "REMOVE arbitrary model-authored fields" aplicado na fronteira.
 */
export function validateAssetParameters(
  asset: MotionAssetManifest,
  provided: Record<string, unknown>,
): ManifestIssue[] {
  const issues: ManifestIssue[] = [];

  for (const chave of Object.keys(provided)) {
    if (!(chave in asset.parameters)) {
      issues.push({ path: chave, message: `parametro nao declarado pelo asset ${asset.assetId}` });
    }
  }

  for (const [nome, spec] of Object.entries(asset.parameters)) {
    const v = provided[nome];
    if (v === undefined) {
      if (spec.required) issues.push({ path: nome, message: 'obrigatorio' });
      continue;
    }
    const t = (spec as MotionAssetParameter).type;
    if (t === 'string' && typeof v !== 'string') issues.push({ path: nome, message: 'deve ser string' });
    if (t === 'number' && typeof v !== 'number') issues.push({ path: nome, message: 'deve ser numero' });
    if (t === 'boolean' && typeof v !== 'boolean') issues.push({ path: nome, message: 'deve ser booleano' });
    if (t === 'color') {
      if (typeof v !== 'string' || !/^#[0-9a-f]{6}$/i.test(v)) {
        issues.push({ path: nome, message: 'cor deve ser #rrggbb' });
      }
    }
    if (t === 'enum') {
      const vals = (spec as { values: string[] }).values;
      if (typeof v !== 'string' || !vals.includes(v)) {
        issues.push({ path: nome, message: `deve ser um de: ${vals.join(', ')}` });
      }
    }
    if (t === 'number' && typeof v === 'number') {
      const s = spec as { min?: number; max?: number };
      if (s.min !== undefined && v < s.min) issues.push({ path: nome, message: `minimo ${s.min}` });
      if (s.max !== undefined && v > s.max) issues.push({ path: nome, message: `maximo ${s.max}` });
    }
    if (t === 'string' && typeof v === 'string') {
      const s = spec as { maxLength?: number };
      if (s.maxLength !== undefined && v.length > s.maxLength) {
        issues.push({ path: nome, message: `maximo de ${s.maxLength} caracteres` });
      }
    }
  }

  return issues;
}
