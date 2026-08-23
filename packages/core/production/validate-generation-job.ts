// Validador do GenerationJob, contra a capacidade declarada do provider.
//
// Puro: não sonda, não sobe arquivo, não dispara nada. Recebe o job e a
// capacidade já sondada e decide se aquele pedido pode ser feito àquele
// provider.
//
// Quatro regras aqui não são forma — são erros que já custaram render:
//
//   1. O logo nunca é referência de imagem. Provider redesenha logo, e logo
//      redesenhado é logo errado. O protótipo pulava a referência com um aviso
//      no stderr; aqui é recusa, porque aviso em stderr some.
//   2. A ordem dos anexos amarra o prompt aos arquivos. O texto diz "image 1",
//      "image 2" e "the attached logo image": trocar a ordem troca o
//      significado do prompt sem nenhum erro aparecer.
//   3. Vídeo custa mais que imagem, então a estimativa vem antes do disparo.
//   4. Vídeo sem frame não tem o que animar.
//
// Fonte: recipes/motion-generativo/references/providers.md

import {
  ATTACHMENT_ORDER,
  GENERATION_JOB_SCHEMA_VERSION,
  isVideoParams,
  type AttachmentRole,
  type GenerationJob,
  type ImageJobParams,
  type VideoJobParams,
} from '../../contracts/production/generation-job';
import type { ProviderCapability } from '../../contracts/production/provider-capability';

export interface JobIssue {
  path: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export type JobValidationResult =
  | { valid: true; job: GenerationJob; warnings: JobIssue[] }
  | { valid: false; issues: JobIssue[] };

/**
 * Heurística do protótipo, preservada: nome do arquivo ou da pasta contendo
 * "logo". É deliberadamente frouxa — errar para o lado de recusar custa uma
 * pergunta; errar para o lado de aceitar custa um logo redesenhado no meio da
 * peça.
 */
export function looksLikeLogo(path: string): boolean {
  const parts = path.split('/').filter(Boolean);
  const file = parts[parts.length - 1] ?? '';
  const parent = parts[parts.length - 2] ?? '';
  const stem = file.replace(/\.[^.]+$/u, '');
  return /logo/iu.test(stem) || /logo/iu.test(parent);
}

function isPortableRelativePath(value: string): boolean {
  if (/^([a-z]:|\/|\\)/iu.test(value)) return false;
  if (value.includes('\\')) return false;
  return !value.split('/').includes('..');
}

function inList(
  value: string,
  allowed: readonly string[],
  path: string,
  label: string,
  issues: JobIssue[],
): void {
  if (!allowed.includes(value)) {
    issues.push({
      path,
      code: 'OUTSIDE_PROVIDER_CAPABILITY',
      message: `${label} "${value}" não está na capacidade declarada: ${allowed.join(' | ')}`,
      severity: 'error',
    });
  }
}

/**
 * Os anexos precisam vir agrupados na ordem canônica: todos os frames, depois
 * o produto, depois o logo. Grupo repetido depois de ter sido fechado quebra a
 * correspondência com "image 1" / "image 2" do prompt.
 */
function validateAttachmentOrder(job: GenerationJob, issues: JobIssue[]): void {
  const seen: AttachmentRole[] = [];
  let cursor = 0;

  job.attachments.forEach((attachment, index) => {
    const rank = ATTACHMENT_ORDER.indexOf(attachment.role);
    if (rank < 0) {
      issues.push({
        path: `attachments[${index}].role`,
        code: 'UNKNOWN_ATTACHMENT_ROLE',
        message: `papel desconhecido: ${attachment.role}`,
        severity: 'error',
      });
      return;
    }
    if (rank < cursor) {
      issues.push({
        path: `attachments[${index}]`,
        code: 'ATTACHMENT_ORDER_VIOLATION',
        message: `"${attachment.role}" depois de "${seen[seen.length - 1]}"; a ordem é `
          + `${ATTACHMENT_ORDER.join(' → ')} e o prompt depende dela`,
        severity: 'error',
      });
      return;
    }
    cursor = rank;
    seen.push(attachment.role);
  });

  const paths = new Set<string>();
  job.attachments.forEach((attachment, index) => {
    if (paths.has(attachment.path)) {
      issues.push({
        path: `attachments[${index}].path`,
        code: 'DUPLICATE_ATTACHMENT',
        message: `o mesmo arquivo foi anexado duas vezes: ${attachment.path}`,
        severity: 'error',
      });
    }
    paths.add(attachment.path);

    if (!isPortableRelativePath(attachment.path)) {
      issues.push({
        path: `attachments[${index}].path`,
        code: 'NON_PORTABLE_PATH',
        message: 'caminho deve ser relativo à produção, com barras normais',
        severity: 'error',
      });
    }
  });
}

function validateImageJob(
  job: GenerationJob,
  capability: ProviderCapability,
  issues: JobIssue[],
  warnings: JobIssue[],
): void {
  const image = capability.image;
  if (!image) {
    issues.push({
      path: 'providerId',
      code: 'PROVIDER_CANNOT_IMAGE',
      message: `${capability.displayName} não gera imagem`,
      severity: 'error',
    });
    return;
  }

  const params = job.params as ImageJobParams;
  inList(params.model, image.models, 'params.model', 'modelo', issues);
  inList(params.aspectRatio, image.aspectRatios, 'params.aspectRatio', 'aspect ratio', issues);
  inList(params.resolution, image.resolutions, 'params.resolution', 'resolução', issues);
  if (params.quality !== undefined && image.qualities) {
    inList(params.quality, image.qualities, 'params.quality', 'qualidade', issues);
  }

  // A regra central: o logo entra sozinho no fecho do motion, e por isso não
  // pode estar na imagem estática nem guiá-la.
  job.attachments.forEach((attachment, index) => {
    if (attachment.role === 'logo') {
      issues.push({
        path: `attachments[${index}]`,
        code: 'LOGO_AS_IMAGE_REFERENCE',
        message: 'o logo não entra na imagem estática: ele sobe separado e entra no fecho',
        severity: 'error',
      });
      return;
    }
    if (looksLikeLogo(attachment.path)) {
      issues.push({
        path: `attachments[${index}].path`,
        code: 'LOGO_LOOKALIKE_REFERENCE',
        message: `"${attachment.path}" parece ser um logo; provider redesenha logo, `
          + 'e logo redesenhado é logo errado',
        severity: 'error',
      });
    }
  });

  if (job.attachments.length > 0 && !image.acceptsReferences) {
    issues.push({
      path: 'attachments',
      code: 'REFERENCES_UNSUPPORTED',
      message: `${capability.displayName} não aceita imagem de referência`,
      severity: 'error',
    });
  }
  if (image.maxReferences !== undefined && job.attachments.length > image.maxReferences) {
    warnings.push({
      path: 'attachments',
      code: 'REFERENCES_ABOVE_LIMIT',
      message: `${job.attachments.length} referências acima do limite de ${image.maxReferences}`,
      severity: 'warning',
    });
  }
}

function validateVideoJob(
  job: GenerationJob,
  capability: ProviderCapability,
  issues: JobIssue[],
  warnings: JobIssue[],
): void {
  const video = capability.video;
  if (!video) {
    issues.push({
      path: 'providerId',
      code: 'PROVIDER_CANNOT_VIDEO',
      message: `${capability.displayName} não gera vídeo`,
      severity: 'error',
    });
    return;
  }

  const params = job.params as VideoJobParams;
  inList(params.model, video.models, 'params.model', 'modelo', issues);
  inList(params.aspectRatio, video.aspectRatios, 'params.aspectRatio', 'aspect ratio', issues);
  inList(params.resolution, video.resolutions, 'params.resolution', 'resolução', issues);
  inList(params.mode, video.modes, 'params.mode', 'modo', issues);
  if (params.genre !== undefined && video.genres) {
    inList(params.genre, video.genres, 'params.genre', 'genre', issues);
  }

  if (!Number.isFinite(params.durationSeconds)
      || params.durationSeconds < video.durationSecondsMin
      || params.durationSeconds > video.durationSecondsMax) {
    issues.push({
      path: 'params.durationSeconds',
      code: 'DURATION_OUTSIDE_CAPABILITY',
      message: `${params.durationSeconds}s fora da faixa do provider `
        + `(${video.durationSecondsMin}–${video.durationSecondsMax}s)`,
      severity: 'error',
    });
  }

  const frames = job.attachments.filter((a) => a.role === 'frame');
  if (frames.length === 0) {
    issues.push({
      path: 'attachments',
      code: 'VIDEO_WITHOUT_FRAME',
      message: 'vídeo sem frame aprovado não tem o que animar',
      severity: 'error',
    });
  }

  // Ausência de logo não impede gerar — mas a peça termina sem assinatura, e
  // descobrir isso no resultado é tarde.
  if (!job.attachments.some((a) => a.role === 'logo')) {
    warnings.push({
      path: 'attachments',
      code: 'NO_LOGO',
      message: 'sem logo anexado: o motion vai terminar sem assinatura de marca',
      severity: 'warning',
    });
  }

  if (video.maxImages !== undefined && job.attachments.length > video.maxImages) {
    issues.push({
      path: 'attachments',
      code: 'IMAGES_ABOVE_LIMIT',
      message: `${job.attachments.length} imagens acima do limite de ${video.maxImages}`,
      severity: 'error',
    });
  }

  if (video.sound === 'never' && params.sound === 'on') {
    warnings.push({
      path: 'params.sound',
      code: 'SOUND_PARAMETER_UNSUPPORTED',
      message: `${capability.displayName} não expõe o parâmetro de som; `
        + 'o áudio ficará por conta do modelo',
      severity: 'warning',
    });
  }
  if (video.sound === 'always' && params.sound === 'off') {
    warnings.push({
      path: 'params.sound',
      code: 'SOUND_ALWAYS_ON',
      message: `${capability.displayName} sempre gera com som; "off" será ignorado`,
      severity: 'warning',
    });
  }

  // Vídeo custa mais que imagem. Estimar depois de disparar não é estimar.
  if (job.status === 'dispatched' && !job.estimate) {
    issues.push({
      path: 'estimate',
      code: 'DISPATCH_WITHOUT_ESTIMATE',
      message: 'vídeo disparado sem estimativa de custo',
      severity: 'error',
    });
  }
}

export function validateGenerationJob(
  job: GenerationJob,
  capability: ProviderCapability,
): JobValidationResult {
  const issues: JobIssue[] = [];
  const warnings: JobIssue[] = [];

  if (job.schemaVersion !== GENERATION_JOB_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      code: 'UNKNOWN_SCHEMA',
      message: `esta build aceita "${GENERATION_JOB_SCHEMA_VERSION}"`,
      severity: 'error',
    });
  }

  if (job.providerId !== capability.providerId) {
    issues.push({
      path: 'providerId',
      code: 'CAPABILITY_MISMATCH',
      message: `o job aponta "${job.providerId}" e a capacidade é de "${capability.providerId}"`,
      severity: 'error',
    });
  }

  if (capability.availability !== 'ok') {
    issues.push({
      path: 'providerId',
      code: 'PROVIDER_UNAVAILABLE',
      message: capability.unavailableReason
        ?? `${capability.displayName} está "${capability.availability}"`,
      severity: 'error',
    });
  }

  // Job que não aponta cena é arquivo órfão: ninguém consegue dizer qual
  // decisão aprovada ele cumpre.
  if (!Array.isArray(job.sceneIds) || job.sceneIds.length === 0) {
    issues.push({
      path: 'sceneIds',
      code: 'JOB_WITHOUT_SCENE',
      message: 'todo job realiza ao menos uma cena do plano aprovado',
      severity: 'error',
    });
  }

  for (const [value, path] of [
    [job.promptPath, 'promptPath'],
    [job.outputPath, 'outputPath'],
  ] as const) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      issues.push({ path, code: 'REQUIRED', message: 'obrigatório', severity: 'error' });
    } else if (!isPortableRelativePath(value)) {
      issues.push({
        path,
        code: 'NON_PORTABLE_PATH',
        message: 'caminho deve ser relativo à produção, com barras normais',
        severity: 'error',
      });
    }
  }

  if (!Array.isArray(job.attachments)) {
    issues.push({
      path: 'attachments',
      code: 'REQUIRED',
      message: 'obrigatório, mesmo vazio',
      severity: 'error',
    });
    return { valid: false, issues };
  }

  validateAttachmentOrder(job, issues);

  const declaredVideo = isVideoParams(job.params);
  if (declaredVideo !== (job.kind === 'video')) {
    issues.push({
      path: 'params',
      code: 'KIND_PARAMS_MISMATCH',
      message: `kind "${job.kind}" não combina com os parâmetros recebidos`,
      severity: 'error',
    });
    return { valid: false, issues };
  }

  if (job.kind === 'image') {
    validateImageJob(job, capability, issues, warnings);
  } else {
    validateVideoJob(job, capability, issues, warnings);
  }

  if (issues.length > 0) return { valid: false, issues };
  return { valid: true, job, warnings };
}

/**
 * Degradação do som, preservada do protótipo: quando a chamada com o parâmetro
 * de som é recusada, tenta uma vez **sem ele** — o áudio pode vir do modelo
 * mesmo assim — e registra que foi isso que aconteceu.
 *
 * "Sem o parâmetro" não é `sound: 'off'`: um pede silêncio, o outro deixa a
 * decisão com o modelo. Por isso a instrução é `omitSoundParameter`, e não uma
 * mutação de `params`.
 *
 * Devolve `null` quando não há retry a fazer, para o chamador não confundir
 * "tentei de outro jeito" com "desisti".
 */
export interface SoundFallback {
  /** O adapter deve repetir a chamada sem enviar o parâmetro de som. */
  omitSoundParameter: true;
  /** O que gravar em `JobResult.soundOutcome` se o retry funcionar. */
  outcome: 'model-default';
  reason: string;
}

export function soundFallback(
  job: GenerationJob,
  capability: ProviderCapability,
): SoundFallback | null {
  if (job.kind !== 'video') return null;
  // Provider que declara não expor o parâmetro já nasceu sem ele: não há
  // segunda tentativa a fazer, o áudio sempre foi do modelo.
  if (capability.video?.sound === 'never') return null;

  const params = job.params as VideoJobParams;
  if (params.sound !== 'on') return null;

  return {
    omitSoundParameter: true,
    outcome: 'model-default',
    reason: `${capability.displayName} recusou o parâmetro de som; `
      + 'repetindo sem ele — o áudio ficará por conta do modelo',
  };
}

export function formatJobIssues(issues: readonly JobIssue[]): string {
  return issues
    .map((i) => `${i.severity === 'warning' ? 'aviso' : 'erro'} ${i.path}: ${i.message}`)
    .join('\n');
}
