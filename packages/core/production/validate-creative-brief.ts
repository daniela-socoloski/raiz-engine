import type { CreativeBrief } from '../../contracts/production/creative-brief';

export interface CreativeBriefValidationIssue {
  path: string;
  message: string;
}

export type CreativeBriefValidationResult =
  | { valid: true; brief: CreativeBrief }
  | { valid: false; issues: CreativeBriefValidationIssue[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function enumValue(
  value: unknown,
  allowed: readonly string[],
  path: string,
  issues: CreativeBriefValidationIssue[],
): void {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    issues.push({ path, message: `valor aceito: ${allowed.join(' | ')}` });
  }
}

function positiveOptionalNumber(
  owner: Record<string, unknown>,
  key: string,
  path: string,
  issues: CreativeBriefValidationIssue[],
): void {
  const value = owner[key];
  if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) {
    issues.push({ path, message: 'deve ser número positivo' });
  }
}

function validDate(value: unknown): boolean {
  return nonEmptyString(value) && Number.isFinite(Date.parse(value));
}

export function validateCreativeBrief(value: unknown): CreativeBriefValidationResult {
  const issues: CreativeBriefValidationIssue[] = [];
  if (!isObject(value)) {
    return { valid: false, issues: [{ path: '$', message: 'brief deve ser objeto' }] };
  }

  if (value.schemaVersion !== '1.0') issues.push({ path: 'schemaVersion', message: 'versão suportada: 1.0' });
  if (!nonEmptyString(value.productionId)) issues.push({ path: 'productionId', message: 'obrigatório' });
  if (!Number.isInteger(value.version) || (value.version as number) < 1) {
    issues.push({ path: 'version', message: 'deve ser inteiro positivo' });
  }
  enumValue(value.status, ['draft', 'ready', 'superseded'], 'status', issues);
  enumValue(value.productionKind, ['video', 'campaign', 'image', 'carousel'], 'productionKind', issues);
  if (!nonEmptyString(value.brandId)) issues.push({ path: 'brandId', message: 'obrigatório' });

  if (!isObject(value.intent)) {
    issues.push({ path: 'intent', message: 'objeto obrigatório' });
  } else {
    if (!nonEmptyString(value.intent.objective)) issues.push({ path: 'intent.objective', message: 'obrigatório' });
    if (value.intent.desiredResponse !== undefined) {
      enumValue(
        value.intent.desiredResponse,
        ['recognize', 'understand', 'desire', 'trust', 'act'],
        'intent.desiredResponse',
        issues,
      );
    }
    if (value.intent.callToAction !== undefined) {
      if (!isObject(value.intent.callToAction)) {
        issues.push({ path: 'intent.callToAction', message: 'deve ser objeto' });
      } else if (!nonEmptyString(value.intent.callToAction.text)) {
        issues.push({ path: 'intent.callToAction.text', message: 'use texto explícito ou omita o CTA' });
      }
    }
  }

  if (!isObject(value.delivery)) {
    issues.push({ path: 'delivery', message: 'objeto obrigatório' });
  } else if (value.productionKind === 'video') {
    enumValue(value.delivery.channel, ['instagram-feed', 'reels', 'stories', 'tiktok', 'shorts', 'youtube', 'linkedin', 'site', 'email', 'presentation', 'print', 'other'], 'delivery.channel', issues);
    enumValue(value.delivery.aspectRatio, ['9:16', '16:9', '1:1'], 'delivery.aspectRatio', issues);
    positiveOptionalNumber(value.delivery, 'targetDurationSeconds', 'delivery.targetDurationSeconds', issues);
    positiveOptionalNumber(value.delivery, 'minDurationSeconds', 'delivery.minDurationSeconds', issues);
    positiveOptionalNumber(value.delivery, 'maxDurationSeconds', 'delivery.maxDurationSeconds', issues);
    const min = value.delivery.minDurationSeconds;
    const max = value.delivery.maxDurationSeconds;
    const target = value.delivery.targetDurationSeconds;
    if (typeof min === 'number' && typeof max === 'number' && min > max) {
      issues.push({ path: 'delivery', message: 'minDurationSeconds não pode exceder maxDurationSeconds' });
    }
    if (typeof target === 'number' && typeof min === 'number' && target < min) {
      issues.push({ path: 'delivery.targetDurationSeconds', message: 'abaixo do mínimo' });
    }
    if (typeof target === 'number' && typeof max === 'number' && target > max) {
      issues.push({ path: 'delivery.targetDurationSeconds', message: 'acima do máximo' });
    }
  } else if (value.productionKind === 'image') {
    enumValue(value.delivery.channel, ['instagram-feed', 'reels', 'stories', 'tiktok', 'shorts', 'youtube', 'linkedin', 'site', 'email', 'presentation', 'print', 'other'], 'delivery.channel', issues);
    enumValue(value.delivery.aspectRatio, ['9:16', '16:9', '1:1', '4:5'], 'delivery.aspectRatio', issues);
    positiveOptionalNumber(value.delivery, 'width', 'delivery.width', issues);
    positiveOptionalNumber(value.delivery, 'height', 'delivery.height', issues);
    if ((value.delivery.width === undefined) !== (value.delivery.height === undefined)) {
      issues.push({ path: 'delivery', message: 'width e height devem aparecer juntos' });
    }
  } else if (value.productionKind === 'carousel') {
    enumValue(value.delivery.channel, ['instagram-feed', 'linkedin', 'presentation', 'other'], 'delivery.channel', issues);
    enumValue(value.delivery.aspectRatio, ['1:1', '4:5', '9:16'], 'delivery.aspectRatio', issues);
    positiveOptionalNumber(value.delivery, 'minCards', 'delivery.minCards', issues);
    positiveOptionalNumber(value.delivery, 'maxCards', 'delivery.maxCards', issues);
    if (
      typeof value.delivery.minCards === 'number'
      && typeof value.delivery.maxCards === 'number'
      && value.delivery.minCards > value.delivery.maxCards
    ) {
      issues.push({ path: 'delivery', message: 'minCards não pode exceder maxCards' });
    }
  } else if (value.productionKind === 'campaign') {
    if (!Array.isArray(value.delivery.channels) || value.delivery.channels.length === 0) {
      issues.push({ path: 'delivery.channels', message: 'ao menos um canal é obrigatório' });
    }
    if (
      !Array.isArray(value.delivery.deliverables)
      || value.delivery.deliverables.length === 0
      || !value.delivery.deliverables.every(nonEmptyString)
    ) {
      issues.push({ path: 'delivery.deliverables', message: 'ao menos um entregável explícito é obrigatório' });
    }
    if (value.delivery.startDate !== undefined && !validDate(value.delivery.startDate)) {
      issues.push({ path: 'delivery.startDate', message: 'data ISO inválida' });
    }
    if (value.delivery.endDate !== undefined && !validDate(value.delivery.endDate)) {
      issues.push({ path: 'delivery.endDate', message: 'data ISO inválida' });
    }
    if (
      validDate(value.delivery.startDate)
      && validDate(value.delivery.endDate)
      && Date.parse(value.delivery.startDate as string) > Date.parse(value.delivery.endDate as string)
    ) {
      issues.push({ path: 'delivery', message: 'startDate não pode ser posterior a endDate' });
    }
  }

  if (value.sourceMaterial !== undefined) {
    if (!Array.isArray(value.sourceMaterial)) {
      issues.push({ path: 'sourceMaterial', message: 'deve ser lista' });
    } else {
      value.sourceMaterial.forEach((source, index) => {
        if (!isObject(source) || !nonEmptyString(source.path)) {
          issues.push({ path: `sourceMaterial[${index}].path`, message: 'caminho relativo obrigatório' });
          return;
        }
        if (/^[A-Za-z]:[\\/]|^\//.test(source.path) || source.path.includes('..')) {
          issues.push({ path: `sourceMaterial[${index}].path`, message: 'caminho absoluto ou traversal recusado' });
        }
        if (source.mustUse === true && source.doNotUse === true) {
          issues.push({ path: `sourceMaterial[${index}]`, message: 'material não pode ser obrigatório e proibido ao mesmo tempo' });
        }
      });
    }
  }

  if (!isObject(value.provenance)) {
    issues.push({ path: 'provenance', message: 'objeto obrigatório' });
  } else {
    enumValue(value.provenance.origin, ['conversation', 'style-selection', 'form', 'migration'], 'provenance.origin', issues);
    if (!validDate(value.provenance.createdAt)) issues.push({ path: 'provenance.createdAt', message: 'data ISO válida obrigatória' });
    if (value.provenance.updatedAt !== undefined && !validDate(value.provenance.updatedAt)) {
      issues.push({ path: 'provenance.updatedAt', message: 'data ISO inválida' });
    }
  }

  return issues.length > 0
    ? { valid: false, issues }
    : { valid: true, brief: value as unknown as CreativeBrief };
}

export function formatCreativeBriefIssues(issues: CreativeBriefValidationIssue[]): string {
  return issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
}
