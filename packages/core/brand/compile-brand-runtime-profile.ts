import type {
  BrandCompilationWarning,
  BrandProfileApproval,
  BrandRuntimeProfile,
  BrandSourceEvidence,
  ColorStrategy,
  Density,
  Energy,
  Pace,
} from '../../contracts/brand/brand-runtime-profile';
import {
  BRAND_RUNTIME_PROFILE_MAPPING,
  BRAND_RUNTIME_PROFILE_MAPPING_VERSION,
  type BrandRuntimeSectionKey,
  type BrandSectionSelector,
} from './brand-runtime-profile-mapping';

export {
  BRAND_DOCUMENT_FILE_CANDIDATES,
  BRAND_RUNTIME_METHOD_SOURCE_PATHS,
  BRAND_RUNTIME_PROFILE_MAPPING_VERSION,
} from './brand-runtime-profile-mapping';

export const BRAND_RUNTIME_PROFILE_COMPILER_VERSION = '0.1.0';

export interface BrandProjectMetadata {
  brand_name: string;
  brand_slug: string;
  created_at: string;
  document_colors?: string[];
  active_accent_color?: string;
}

export interface CompileBrandRuntimeProfileInput {
  metadata: BrandProjectMetadata;
  brandDocumentPath: string;
  brandDocumentMarkdown: string;
  sourceEvidence: BrandSourceEvidence[];
  sourceFingerprint: string;
  compiledAt: string;
  profileVersion?: number;
  approval?: BrandProfileApproval;
}

export interface BrandCompilationIssue {
  path: string;
  message: string;
}

export class BrandCompilationError extends Error {
  readonly issues: BrandCompilationIssue[];

  constructor(issues: BrandCompilationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
    this.name = 'BrandCompilationError';
    this.issues = issues;
  }
}

interface MarkdownSection {
  level: number;
  title: string;
  normalizedTitle: string;
  content: string;
}

type ResolvedSections = Record<BrandRuntimeSectionKey, MarkdownSection>;

const HEX_COLOR = /^#[0-9A-F]{6}$/;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHeading(value: string): string {
  return normalizeText(value)
    .replace(/^\d+(?:\.\d+)*\s*[—:.-]?\s*/, '')
    .replace(/[.!?]+$/g, '')
    .trim();
}

function parseMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const headings: Array<{ line: number; level: number; title: string }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s{0,3}(#{1,6})\s+(.+?)\s*$/);
    if (match) {
      headings.push({ line: index, level: match[1].length, title: match[2] });
    }
  }

  return headings.map((heading, index) => {
    let end = lines.length;
    for (let cursor = index + 1; cursor < headings.length; cursor += 1) {
      if (headings[cursor].level <= heading.level) {
        end = headings[cursor].line;
        break;
      }
    }
    return {
      level: heading.level,
      title: heading.title,
      normalizedTitle: normalizeHeading(heading.title),
      content: lines.slice(heading.line + 1, end).join('\n').trim(),
    };
  });
}

function findSection(
  sections: MarkdownSection[],
  selector: BrandSectionSelector,
): MarkdownSection | undefined {
  for (const alias of selector.titleAliases) {
    const normalizedAlias = normalizeHeading(alias);
    const found = sections.find((section) => section.normalizedTitle === normalizedAlias);
    if (found) return found;
  }
  return undefined;
}

function resolveSections(markdown: string, sourcePath: string): ResolvedSections {
  const sections = parseMarkdownSections(markdown);
  const issues: BrandCompilationIssue[] = [];
  const resolved = {} as Partial<ResolvedSections>;

  for (const [key, selector] of Object.entries(
    BRAND_RUNTIME_PROFILE_MAPPING.brandDocument.sections,
  ) as Array<[BrandRuntimeSectionKey, BrandSectionSelector]>) {
    const section = findSection(sections, selector);
    if (!section && selector.required) {
      issues.push({
        path: `${sourcePath}#${key}`,
        message: `seção obrigatória ausente; aliases aceitos: ${selector.titleAliases.join(', ')}`,
      });
      continue;
    }
    if (section) resolved[key] = section;
  }

  if (issues.length > 0) throw new BrandCompilationError(issues);
  return resolved as ResolvedSections;
}

function cleanInline(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values: Iterable<string>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const raw of values) {
    const value = cleanInline(raw).replace(/^[—:;,.\s]+|[;,.\s]+$/g, '').trim();
    if (!value) continue;
    const key = normalizeText(value);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }
  return output;
}

function paragraphsFrom(markdown: string): string[] {
  const blocks = markdown.replace(/\r\n?/g, '\n').split(/\n\s*\n/);
  return unique(
    blocks
      .filter((block) => {
        const trimmed = block.trim();
        return trimmed
          && !trimmed.startsWith('|')
          && !/^[-*_]{3,}$/.test(trimmed)
          && !/^#{1,6}\s/.test(trimmed)
          && !/^\s*(?:[-+*]|\d+[.)])\s+/.test(trimmed);
      })
      .map((block) => block.replace(/\n+/g, ' ')),
  );
}

function listItemsFrom(markdown: string): string[] {
  return unique(
    markdown
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.match(/^\s*(?:[-+*]|\d+[.)])\s+(.+)$/)?.[1] ?? ''),
  );
}

function labeledStatementsFrom(markdown: string): string[] {
  return unique(
    markdown
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => {
        const match = line.trim().match(/^\*\*([^*]+)\*\*\s*[:.—-]?\s*(.+)$/);
        return match ? `${cleanInline(match[1])}: ${cleanInline(match[2])}` : '';
      }),
  );
}

function parseTableRows(markdown: string): string[][] {
  const rows: string[][] = [];
  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    const cells = trimmed.slice(1, -1).split('|').map(cleanInline);
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    rows.push(cells);
  }
  return rows;
}

function rulesFrom(markdown: string): string[] {
  return unique([...listItemsFrom(markdown), ...labeledStatementsFrom(markdown)]);
}

function markedBlock(markdown: string, titlePatterns: RegExp[]): string {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let start = -1;
  let startLevel = 7;

  for (let index = 0; index < lines.length; index += 1) {
    const line = cleanInline(lines[index]);
    if (!titlePatterns.some((pattern) => pattern.test(normalizeText(line)))) continue;
    start = index;
    const heading = lines[index].match(/^\s*(#{1,6})\s+/);
    startLevel = heading?.[1].length ?? 7;
    break;
  }
  if (start < 0) return '';

  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const heading = lines[index].match(/^\s*(#{1,6})\s+/);
    if (heading && heading[1].length <= startLevel) {
      end = index;
      break;
    }
    if (
      startLevel === 7
      && /^\s*\*\*\d+(?:\.\d+)+\s+[^*]+\*\*/.test(lines[index])
    ) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

function extractVocabulary(section: MarkdownSection): {
  preferred: string[];
  prohibited: string[];
} {
  const raw = section.content;
  const negativeMarker = /\*\*(?:palavras\s+que\s+(?:a\s+marca\s+)?evita(?:mos)?|evita)\b[^*]*\*\*/i;
  const negativeMatch = negativeMarker.exec(raw);
  const preferredChunk = negativeMatch ? raw.slice(0, negativeMatch.index) : raw;
  const prohibitedChunk = negativeMatch ? raw.slice(negativeMatch.index) : '';

  const terms = (value: string): string[] => {
    const captures: string[] = [];
    for (const match of value.matchAll(/`([^`]+)`|(?<!\*)\*([^*\n]+)\*(?!\*)/g)) {
      captures.push(match[1] ?? match[2] ?? '');
    }
    return unique(captures.filter((item) => item.length <= 80));
  };

  return {
    preferred: terms(preferredChunk),
    prohibited: terms(prohibitedChunk),
  };
}

function positiveVoiceTraits(section: MarkdownSection): string[] {
  const rows = parseTableRows(section.content);
  return unique(
    rows
      .slice(1)
      .filter((row) => row.length >= 2)
      .map((row) => row[0]),
  );
}

function sectionRules(section: MarkdownSection): string[] {
  const rules = rulesFrom(section.content);
  return rules.length > 0 ? rules : paragraphsFrom(section.content);
}

function colorStrategy(palette: string): ColorStrategy {
  const normalized = normalizeText(palette);
  if (/cor de campanha|campanha rotativa|cada colecao adota/.test(normalized)) {
    return 'campaign-variable';
  }
  if (/cor de edicao|muda a cada ano|variavel por edicao/.test(normalized)) {
    return 'edition-variable';
  }
  if (/nucleo neutro|base neutra/.test(normalized) && !/primary|cor primaria/.test(normalized)) {
    return 'neutral-core';
  }
  return 'fixed';
}

function allHexColors(value: string): string[] {
  return unique(
    Array.from(value.matchAll(/#[0-9A-Fa-f]{6}\b/g), (match) => match[0].toUpperCase()),
  );
}

function chooseAccentColor(
  metadata: BrandProjectMetadata,
  palette: MarkdownSection,
): { accentColor: string; strategy: ColorStrategy } {
  const strategy = colorStrategy(palette.content);
  const active = metadata.active_accent_color?.toUpperCase();
  if (active && HEX_COLOR.test(active)) return { accentColor: active, strategy };

  const rows = parseTableRows(palette.content);
  const primary = rows.find((row) => {
    const first = normalizeText(row[0] ?? '');
    return first === 'primary' || first.includes('cor primaria');
  });
  const primaryColor = primary?.find((cell) => HEX_COLOR.test(cell.toUpperCase()));
  if (primaryColor) return { accentColor: primaryColor.toUpperCase(), strategy };

  const year = metadata.created_at.match(/\b(20\d{2})\b/)?.[1];
  if (year) {
    const currentCycle = rows.find((row) => row.some((cell) => cell.includes(year)));
    const currentColor = currentCycle?.find((cell) => HEX_COLOR.test(cell.toUpperCase()));
    if (currentColor) return { accentColor: currentColor.toUpperCase(), strategy };
  }

  const metadataColor = metadata.document_colors
    ?.map((color) => color.toUpperCase())
    .find((color) => HEX_COLOR.test(color));
  if (metadataColor) return { accentColor: metadataColor, strategy };

  const first = allHexColors(palette.content)[0];
  if (first) return { accentColor: first, strategy };

  throw new BrandCompilationError([{
    path: 'visual.accentColor',
    message: 'nenhuma cor hexadecimal válida foi encontrada na paleta ou nos metadados',
  }]);
}

function paletteWithoutSemanticColors(markdown: string): string {
  const marker = /^#{4,6}\s+.*cores sem[aâ]nticas.*$/im;
  const match = marker.exec(markdown);
  return match ? markdown.slice(0, match.index) : markdown;
}

function paceFromEvidence(value: string): Pace {
  const normalized = normalizeText(value);
  if (/ritmo de edicao\s*:?\s*rapido|cortes? rapidos?|corte no tempo da batida/.test(normalized)) {
    return 'fast';
  }
  if (/corte e lento|corte lento|movimento lento|ritmo contemplativo/.test(normalized)) {
    return 'slow';
  }
  if (/ritmo de edicao\s*:?\s*medio|nem contemplativo nem frenetico/.test(normalized)) {
    return 'moderate';
  }
  return 'variable';
}

function energyFromPace(pace: Pace): Energy {
  if (pace === 'fast') return 'expressive';
  if (pace === 'slow') return 'restrained';
  return 'balanced';
}

function motionIntensityFromPace(pace: Pace): 'low' | 'medium' | 'high' {
  if (pace === 'fast') return 'high';
  if (pace === 'slow') return 'low';
  return 'medium';
}

function densityFromEvidence(editorial: string, audiovisual: string): Density {
  const normalized = normalizeText(`${editorial}\n${audiovisual}`);
  if (/silencio visual leria como desist|densidade\s*:?\s*(muito )?alta|informacao densa/.test(normalized)) {
    return 'dense';
  }
  if (/legenda.*minima|muito espaco negativo|densidade\s*:?\s*(muito )?baixa/.test(normalized)) {
    return 'minimal';
  }
  return 'moderate';
}

function musicPolicyFromEvidence(value: string): BrandRuntimeProfile['sound']['musicPolicy'] {
  const normalized = normalizeText(value);
  if (!/trilha|musica|som ambiente|som do evento/.test(normalized)) return undefined;
  if (/sem trilha|sem musica/.test(normalized) && !/som ambiente|som do evento/.test(normalized)) {
    return 'none';
  }
  if (/tempo da musica|som do proprio show|som do evento|batida/.test(normalized)) {
    return 'rhythmic';
  }
  if (/som ambiente/.test(normalized) && !/pop|soul|musica/.test(normalized)) return 'ambient';
  return 'variable';
}

function soundPrinciplesFrom(value: string): string[] {
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  return unique(
    lines
      .filter((line) => /trilha|música|musica|som ambiente|som do evento|locução|locucao|narração|narracao|silêncio|silencio/i.test(line))
      .map((line) => line.replace(/^\s*(?:[-+*]|\d+[.)])\s+/, '')),
  );
}

function prohibitedMotionFrom(audiovisual: string, antiPatterns: string): string[] {
  const explicit = audiovisual
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => /proibid|nunca|sem escala|sem giro|sem esmaecimento/i.test(line))
    .map((line) => line.replace(/^\s*(?:[-+*]|\d+[.)])\s+/, ''));
  return unique([...explicit, ...listItemsFrom(antiPatterns), ...labeledStatementsFrom(antiPatterns)]);
}

function narrativePatternsFrom(section: MarkdownSection): string[] {
  const rows = parseTableRows(section.content)
    .slice(1)
    .filter((row) => row.length >= 2)
    .map((row) => `${row[0]}: ${row[row.length - 1]}`);
  return unique([...sectionRules(section), ...rows]);
}

function audienceDescriptionFrom(section: MarkdownSection): string {
  const paragraphs = paragraphsFrom(section.content).filter((paragraph) => paragraph.length >= 40);
  if (paragraphs.length > 0) return paragraphs[0];
  const rules = sectionRules(section);
  return rules[0] ?? '';
}

function channelsFrom(section: MarkdownSection): string[] {
  const rows = parseTableRows(section.content);
  const tableChannels = rows
    .slice(1)
    .map((row) => row[0])
    .filter((cell) => cell && !/^momento|tipo de saida|fase$/i.test(normalizeText(cell)));

  const channelLine = section.content.match(/\*\*Canais:\*\*\s*([^\n]+)/i)?.[1] ?? '';
  const inlineChannels = channelLine
    .split(/,|\se\s|\scomo\s/i)
    .map((item) => item.trim());
  return unique([...tableChannels, ...inlineChannels]);
}

function requiredFormatsFrom(markdown: string): Array<'9:16' | '16:9' | '1:1'> {
  const formats: Array<'9:16' | '16:9' | '1:1'> = [];
  for (const format of ['9:16', '16:9', '1:1'] as const) {
    if (markdown.includes(format)) formats.push(format);
  }
  return formats;
}

function verifyMetadata(input: CompileBrandRuntimeProfileInput, identity: MarkdownSection): void {
  const issues: BrandCompilationIssue[] = [];
  const { metadata } = input;
  if (!metadata.brand_name?.trim()) {
    issues.push({ path: '.brand.json#brand_name', message: 'nome obrigatório ausente' });
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.brand_slug ?? '')) {
    issues.push({ path: '.brand.json#brand_slug', message: 'slug deve usar kebab-case estável' });
  }
  if (!Number.isFinite(Date.parse(metadata.created_at ?? ''))) {
    issues.push({ path: '.brand.json#created_at', message: 'data ISO inválida' });
  }
  if (!Number.isFinite(Date.parse(input.compiledAt ?? ''))) {
    issues.push({ path: 'compiledAt', message: 'data ISO inválida' });
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(input.sourceFingerprint)) {
    issues.push({ path: 'sourceFingerprint', message: 'fingerprint deve ser sha256:<64 hex>' });
  }
  if (!Number.isInteger(input.profileVersion ?? 1) || (input.profileVersion ?? 1) < 1) {
    issues.push({ path: 'profileVersion', message: 'versão compilada deve ser inteiro positivo' });
  }

  const identityName = parseTableRows(identity.content)
    .find((row) => normalizeText(row[0] ?? '') === 'nome')?.[1];
  if (
    identityName
    && !normalizeText(identityName).includes(normalizeText(metadata.brand_name))
    && !normalizeText(metadata.brand_name).includes(normalizeText(identityName))
  ) {
    issues.push({
      path: `${input.brandDocumentPath}#Identidade`,
      message: `nome "${identityName}" diverge de .brand.json ("${metadata.brand_name}")`,
    });
  }

  const paths = new Set(input.sourceEvidence.map((source) => source.path));
  if (![...paths].some((path) => path.endsWith('/.brand.json'))) {
    issues.push({ path: 'sourceEvidence', message: 'metadados .brand.json não registrados' });
  }
  if (!paths.has(input.brandDocumentPath)) {
    issues.push({
      path: 'sourceEvidence',
      message: `documento editorial não registrado: ${input.brandDocumentPath}`,
    });
  }
  for (const source of input.sourceEvidence) {
    if (/^[A-Za-z]:[\\/]|^\//.test(source.path) || source.path.includes('\\')) {
      issues.push({ path: 'sourceEvidence.path', message: `caminho não portável: ${source.path}` });
    }
    if (!/^[0-9a-f]{64}$/.test(source.contentSha256)) {
      issues.push({ path: 'sourceEvidence.contentSha256', message: `SHA-256 inválido: ${source.path}` });
    }
  }

  if (issues.length > 0) throw new BrandCompilationError(issues);
}

export function compileBrandRuntimeProfile(
  input: CompileBrandRuntimeProfileInput,
): BrandRuntimeProfile {
  const sections = resolveSections(input.brandDocumentMarkdown, input.brandDocumentPath);
  verifyMetadata(input, sections.identity);

  const { accentColor, strategy } = chooseAccentColor(input.metadata, sections.palette);
  const semanticFreePalette = paletteWithoutSemanticColors(sections.palette.content);
  const supportingColors = unique([
    ...allHexColors(semanticFreePalette),
    ...(input.metadata.document_colors ?? []).map((color) => color.toUpperCase()),
  ]).filter((color) => HEX_COLOR.test(color) && color !== accentColor);

  const vocabulary = extractVocabulary(sections.vocabulary);
  const audiovisual = sections.audiovisualDirection.content;
  const videoBlock = markedBlock(audiovisual, [
    /direcao de video e motion/,
    /video e motion/,
  ]) || audiovisual;
  const motionBlock = markedBlock(audiovisual, [
    /principios de motion/,
    /principios de movimento/,
  ]);
  const combinedMotion = [videoBlock, motionBlock].filter(Boolean).join('\n\n');
  const antiBlock = markedBlock(sections.audiovisualAntiPatterns.content, [
    /anti-fotografia e anti-video/,
    /anti-fotografia/,
  ]) || sections.audiovisualAntiPatterns.content;
  const pace = paceFromEvidence(combinedMotion);
  const soundPrinciples = soundPrinciplesFrom(videoBlock);
  const warnings: BrandCompilationWarning[] = [];

  if (soundPrinciples.length === 0) {
    warnings.push({
      code: 'MISSING_SOUND_EVIDENCE',
      message: 'O DNA não declara política sonora suficiente; o planner deve pedir decisão de som.',
      sourceDocument: input.brandDocumentPath,
    });
  }
  if (/proposta|sujeita a validacao|nao a partir de analise de linha do tempo|nao pode ser lida/.test(normalizeText(combinedMotion))) {
    warnings.push({
      code: 'UNVERIFIED_MOTION_EVIDENCE',
      message: 'A própria fonte classifica a direção de motion como proposta ou não validada por timeline.',
      sourceDocument: input.brandDocumentPath,
    });
  }
  if (strategy === 'campaign-variable' || strategy === 'edition-variable') {
    warnings.push({
      code: 'VARIABLE_ACCENT_REQUIRES_CONTEXT',
      message: 'A cor compilada representa o ciclo da fonte; uma nova campanha ou edição exige recompilação ou override aprovado.',
      sourceDocument: input.brandDocumentPath,
    });
  }

  const formats = requiredFormatsFrom(input.brandDocumentMarkdown);
  const profile: BrandRuntimeProfile = {
    schemaVersion: '1.0',
    brandId: input.metadata.brand_slug,
    brandName: input.metadata.brand_name,
    version: input.profileVersion ?? 1,
    verbal: {
      toneRules: unique([
        ...paragraphsFrom(sections.editorialPrinciple.content),
        ...paragraphsFrom(sections.verbalPrinciple.content),
        ...positiveVoiceTraits(sections.voiceIdentity),
      ]),
      preferredVocabulary: vocabulary.preferred,
      prohibitedVocabulary: vocabulary.prohibited,
      prohibitedPatterns: sectionRules(sections.prohibitedConstructions),
    },
    visual: {
      accentColor,
      colorStrategy: strategy,
      supportingColors,
      colorRules: sectionRules(sections.palette).filter((rule) => /use|nunca|nao use|proibid|aprova|cor de|camada/i.test(rule)),
      compositionRules: sectionRules(sections.composition),
      prohibitedPatterns: unique([
        ...sectionRules(sections.visualAntiPatterns),
        ...listItemsFrom(antiBlock),
      ]),
    },
    motion: {
      intensity: motionIntensityFromPace(pace),
      allowedFunctions: sectionRules({ ...sections.audiovisualDirection, content: combinedMotion })
        .filter((rule) => !/proibid|nunca|sem escala|sem giro/i.test(rule)),
      prohibitedPatterns: prohibitedMotionFrom(combinedMotion, antiBlock),
    },
    sound: {
      principles: soundPrinciples,
      musicPolicy: musicPolicyFromEvidence(videoBlock),
    },
    editorial: {
      pace,
      energy: energyFromPace(pace),
      density: densityFromEvidence(sections.editorialDensity.content, audiovisual),
      narrativePatterns: unique([
        ...paragraphsFrom(sections.editorialPrinciple.content),
        ...narrativePatternsFrom(sections.narrativePatterns),
      ]),
    },
    audience: {
      description: audienceDescriptionFrom(sections.audience),
      channels: channelsFrom(sections.channels),
    },
    constraints: formats.length > 0 ? { requiredFormats: formats } : undefined,
    approval: input.approval ?? { status: 'draft' },
    provenance: {
      origin: 'marca-raiz-prisma',
      compiledAt: input.compiledAt,
      sourceDocuments: input.sourceEvidence.map((source) => source.path),
      sourceEvidence: input.sourceEvidence,
      sourceFingerprint: input.sourceFingerprint,
      compilerVersion: BRAND_RUNTIME_PROFILE_COMPILER_VERSION,
      mappingVersion: BRAND_RUNTIME_PROFILE_MAPPING_VERSION,
      warnings,
    },
  };

  const requiredOutputIssues: BrandCompilationIssue[] = [];
  if (profile.verbal.toneRules.length === 0) {
    requiredOutputIssues.push({ path: 'verbal.toneRules', message: 'mapeamento não produziu regras de voz' });
  }
  if ((profile.visual.compositionRules?.length ?? 0) === 0) {
    requiredOutputIssues.push({ path: 'visual.compositionRules', message: 'mapeamento não produziu regras de composição' });
  }
  if ((profile.motion.allowedFunctions?.length ?? 0) === 0) {
    requiredOutputIssues.push({ path: 'motion.allowedFunctions', message: 'mapeamento não produziu regras de motion' });
  }
  if (!profile.audience?.description) {
    requiredOutputIssues.push({ path: 'audience.description', message: 'mapeamento não produziu descrição de audiência' });
  }
  if (requiredOutputIssues.length > 0) throw new BrandCompilationError(requiredOutputIssues);

  return profile;
}
