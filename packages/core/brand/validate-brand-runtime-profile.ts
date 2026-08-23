import type { BrandRuntimeProfile } from '../../contracts/brand/brand-runtime-profile';

export interface BrandRuntimeProfileValidationIssue {
  path: string;
  message: string;
}

export type BrandRuntimeProfileValidationResult =
  | { valid: true; profile: BrandRuntimeProfile }
  | { valid: false; issues: BrandRuntimeProfileValidationIssue[] };

const HEX_COLOR = /^#[0-9A-F]{6}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function stringArray(value: unknown, allowEmpty = true): value is string[] {
  return Array.isArray(value)
    && (allowEmpty || value.length > 0)
    && value.every(nonEmptyString);
}

function optionalStringArray(
  owner: Record<string, unknown>,
  key: string,
  path: string,
  issues: BrandRuntimeProfileValidationIssue[],
): void {
  if (owner[key] !== undefined && !stringArray(owner[key])) {
    issues.push({ path, message: 'deve ser uma lista de strings não vazias' });
  }
}

function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
  issues: BrandRuntimeProfileValidationIssue[],
): value is T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    issues.push({ path, message: `valor aceito: ${allowed.join(' | ')}` });
    return false;
  }
  return true;
}

export function validateBrandRuntimeProfile(
  value: unknown,
): BrandRuntimeProfileValidationResult {
  const issues: BrandRuntimeProfileValidationIssue[] = [];
  if (!isObject(value)) {
    return { valid: false, issues: [{ path: '$', message: 'perfil deve ser objeto' }] };
  }

  if (value.schemaVersion !== '1.0') {
    issues.push({ path: 'schemaVersion', message: 'versão suportada: 1.0' });
  }
  if (!nonEmptyString(value.brandId)) issues.push({ path: 'brandId', message: 'obrigatório' });
  if (!nonEmptyString(value.brandName)) issues.push({ path: 'brandName', message: 'obrigatório' });
  if (!Number.isInteger(value.version) || (value.version as number) < 1) {
    issues.push({ path: 'version', message: 'deve ser inteiro positivo' });
  }

  if (!isObject(value.verbal)) {
    issues.push({ path: 'verbal', message: 'objeto obrigatório' });
  } else {
    if (!stringArray(value.verbal.toneRules, false)) {
      issues.push({ path: 'verbal.toneRules', message: 'ao menos uma regra de voz é obrigatória' });
    }
    optionalStringArray(value.verbal, 'preferredVocabulary', 'verbal.preferredVocabulary', issues);
    optionalStringArray(value.verbal, 'prohibitedVocabulary', 'verbal.prohibitedVocabulary', issues);
    optionalStringArray(value.verbal, 'prohibitedPatterns', 'verbal.prohibitedPatterns', issues);
  }

  if (!isObject(value.visual)) {
    issues.push({ path: 'visual', message: 'objeto obrigatório' });
  } else {
    if (typeof value.visual.accentColor !== 'string' || !HEX_COLOR.test(value.visual.accentColor)) {
      issues.push({ path: 'visual.accentColor', message: 'cor deve usar #RRGGBB em maiúsculas' });
    }
    if (value.visual.colorStrategy !== undefined) {
      enumValue(
        value.visual.colorStrategy,
        ['fixed', 'campaign-variable', 'edition-variable', 'neutral-core'] as const,
        'visual.colorStrategy',
        issues,
      );
    }
    optionalStringArray(value.visual, 'supportingColors', 'visual.supportingColors', issues);
    if (
      Array.isArray(value.visual.supportingColors)
      && value.visual.supportingColors.some((color) => typeof color !== 'string' || !HEX_COLOR.test(color))
    ) {
      issues.push({ path: 'visual.supportingColors', message: 'todas as cores devem usar #RRGGBB' });
    }
    optionalStringArray(value.visual, 'colorRules', 'visual.colorRules', issues);
    optionalStringArray(value.visual, 'compositionRules', 'visual.compositionRules', issues);
    optionalStringArray(value.visual, 'prohibitedPatterns', 'visual.prohibitedPatterns', issues);
    if (!stringArray(value.visual.compositionRules, false)) {
      issues.push({ path: 'visual.compositionRules', message: 'ao menos uma regra é obrigatória' });
    }
  }

  if (!isObject(value.motion)) {
    issues.push({ path: 'motion', message: 'objeto obrigatório' });
  } else {
    enumValue(value.motion.intensity, ['low', 'medium', 'high'] as const, 'motion.intensity', issues);
    optionalStringArray(value.motion, 'allowedFunctions', 'motion.allowedFunctions', issues);
    optionalStringArray(value.motion, 'prohibitedPatterns', 'motion.prohibitedPatterns', issues);
    if (!stringArray(value.motion.allowedFunctions, false)) {
      issues.push({ path: 'motion.allowedFunctions', message: 'ao menos uma regra é obrigatória' });
    }
  }

  if (!isObject(value.sound)) {
    issues.push({ path: 'sound', message: 'objeto obrigatório' });
  } else {
    if (!stringArray(value.sound.principles)) {
      issues.push({ path: 'sound.principles', message: 'deve ser lista de strings' });
    }
    if (value.sound.musicPolicy !== undefined) {
      enumValue(
        value.sound.musicPolicy,
        ['none', 'ambient', 'rhythmic', 'variable'] as const,
        'sound.musicPolicy',
        issues,
      );
    }
  }

  if (!isObject(value.editorial)) {
    issues.push({ path: 'editorial', message: 'objeto obrigatório' });
  } else {
    enumValue(value.editorial.pace, ['slow', 'moderate', 'fast', 'variable'] as const, 'editorial.pace', issues);
    enumValue(value.editorial.energy, ['restrained', 'balanced', 'expressive'] as const, 'editorial.energy', issues);
    enumValue(value.editorial.density, ['minimal', 'moderate', 'dense'] as const, 'editorial.density', issues);
    optionalStringArray(value.editorial, 'narrativePatterns', 'editorial.narrativePatterns', issues);
  }

  if (value.audience !== undefined) {
    if (!isObject(value.audience)) {
      issues.push({ path: 'audience', message: 'deve ser objeto' });
    } else {
      if (!nonEmptyString(value.audience.description)) {
        issues.push({ path: 'audience.description', message: 'obrigatória' });
      }
      optionalStringArray(value.audience, 'channels', 'audience.channels', issues);
    }
  }

  if (!isObject(value.approval)) {
    issues.push({ path: 'approval', message: 'objeto obrigatório' });
  } else {
    enumValue(value.approval.status, ['draft', 'approved', 'rejected'] as const, 'approval.status', issues);
    if (value.approval.reviewedAt !== undefined && !Number.isFinite(Date.parse(String(value.approval.reviewedAt)))) {
      issues.push({ path: 'approval.reviewedAt', message: 'data ISO inválida' });
    }
  }

  if (!isObject(value.provenance)) {
    issues.push({ path: 'provenance', message: 'objeto obrigatório' });
  } else {
    enumValue(
      value.provenance.origin,
      ['marca-raiz-prisma', 'manual', 'migration'] as const,
      'provenance.origin',
      issues,
    );
    if (!nonEmptyString(value.provenance.compiledAt) || !Number.isFinite(Date.parse(value.provenance.compiledAt))) {
      issues.push({ path: 'provenance.compiledAt', message: 'data ISO válida obrigatória' });
    }
    if (!stringArray(value.provenance.sourceDocuments, false)) {
      issues.push({ path: 'provenance.sourceDocuments', message: 'ao menos uma fonte é obrigatória' });
    }
    if (!Array.isArray(value.provenance.sourceEvidence) || value.provenance.sourceEvidence.length < 2) {
      issues.push({ path: 'provenance.sourceEvidence', message: 'metadados e documento editorial são obrigatórios' });
    } else {
      const sourceEvidence = value.provenance.sourceEvidence as unknown[];
      for (let index = 0; index < sourceEvidence.length; index += 1) {
        const source: unknown = sourceEvidence[index];
        if (!isObject(source)) {
          issues.push({ path: `provenance.sourceEvidence[${index}]`, message: 'deve ser objeto' });
          continue;
        }
        if (!nonEmptyString(source.path) || /^[A-Za-z]:[\\/]|^\//.test(String(source.path))) {
          issues.push({ path: `provenance.sourceEvidence[${index}].path`, message: 'caminho relativo obrigatório' });
        }
        enumValue(
          source.role,
          ['metadata', 'brand-document', 'method'] as const,
          `provenance.sourceEvidence[${index}].role`,
          issues,
        );
        if (typeof source.contentSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(source.contentSha256)) {
          issues.push({ path: `provenance.sourceEvidence[${index}].contentSha256`, message: 'SHA-256 inválido' });
        }
      }
    }
    if (typeof value.provenance.sourceFingerprint !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(value.provenance.sourceFingerprint)) {
      issues.push({ path: 'provenance.sourceFingerprint', message: 'fingerprint inválido' });
    }
    if (!nonEmptyString(value.provenance.compilerVersion)) {
      issues.push({ path: 'provenance.compilerVersion', message: 'obrigatória' });
    }
    if (!nonEmptyString(value.provenance.mappingVersion)) {
      issues.push({ path: 'provenance.mappingVersion', message: 'obrigatória' });
    }
  }

  return issues.length > 0
    ? { valid: false, issues }
    : { valid: true, profile: value as unknown as BrandRuntimeProfile };
}

export function formatBrandRuntimeProfileIssues(
  issues: BrandRuntimeProfileValidationIssue[],
): string {
  return issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
}
