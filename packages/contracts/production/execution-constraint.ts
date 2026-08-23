// ExecutionConstraint — conhecimento de execução que não pode ser reaprendido.
//
// Existe porque hoje esse conhecimento morre no fim de cada produção. Duas
// fontes reais provaram a lacuna:
//
//   - "As 10 regras, pelo mecanismo" do README ancestral do Cena Raiz Vídeo:
//     cada regra com o mecanismo físico ou técnico por trás, não com estética.
//   - "Armadilhas já pagas" do DIRECAO-BLIV.md: oito itens, cada um custando
//     ao menos um render.
//
// Nenhum dos dois cabia em contrato existente. Não é `CreativePreference` —
// preferência é escolha humana, revogável, com escopo de marca. Isto é FATO
// TÉCNICO: vale para qualquer marca, e violá-lo quebra o render, não o gosto.
//
// Fronteira: descreve o que a execução NÃO pode fazer e por quê. Não escolhe
// motor, não descreve cena, não substitui a direção. É consultado no passo 11,
// quando o router compila jobs, e serve de guarda no passo 12.

/** Onde a restrição se aplica. Um constraint de FFmpeg não governa Remotion. */
export type ConstraintEngine =
  | 'ffmpeg'
  | 'remotion'
  | 'after-effects'
  | 'premiere'
  | 'whisperx'
  | 'any';

/**
 * A que domínio o fato pertence. Governa quem consulta: um compilador de
 * legenda não precisa carregar restrições de cor.
 */
export type ConstraintDomain =
  | 'timing'
  | 'motion'
  | 'typography'
  | 'color'
  | 'audio'
  | 'container'
  | 'render'
  | 'determinism'
  | 'readability';

/**
 * O que acontece se for violado. Governa se o passo 11 pode seguir com aviso
 * ou precisa parar.
 *
 * `breaks-render`  o job falha ou produz arquivo inválido
 * `breaks-output`  renderiza, mas o resultado está errado — cor deslocada,
 *                  áudio fora do padrão, texto ilegível
 * `degrades`       funciona e piora o resultado sem quebrá-lo
 */
export type ViolationEffect = 'breaks-render' | 'breaks-output' | 'degrades';

/**
 * Como sabemos que é verdade. `measured` e o padrão-ouro: alguém mediu.
 * `incident` significa que quebrou em produção e o custo foi pago.
 * `upstream-documented` vem da documentação da ferramenta.
 */
export type ConstraintEvidenceKind = 'measured' | 'incident' | 'upstream-documented';

/**
 * Contexto de uma medição. Sem isto, um número de UMA produção vira dogma
 * global — que é exatamente o erro que este contrato existe para evitar.
 */
export interface MeasurementContext {
  /** Unidade do valor observado: `dB`, `LUFS`, `MB`, `quadros`. */
  unit?: string;
  /** Quantas amostras sustentam o número. Uma medição não é uma lei. */
  sampleSize?: number;
  /** Ferramenta e versão exatas. */
  tool?: string;
  toolVersion?: string;
  /** Container, codec e comando conceitual — o pipeline onde valeu. */
  pipeline?: string;
  /** Sistema operacional e arquitetura, quando relevantes. */
  environment?: string;
}

export interface ConstraintEvidence {
  kind: ConstraintEvidenceKind;
  /** O que foi observado, com número quando houver. */
  statement: string;
  /** Produção onde o incidente ocorreu, quando `kind` for `incident`. */
  productionId?: string;
  /** Versão da ferramenta em que o fato foi verificado. */
  toolVersion?: string;
  /**
   * Contexto da medição. Obrigatório quando `kind` é `measured`: número sem
   * unidade, amostra e ferramenta não é medição, é lembrança.
   */
  measurement?: MeasurementContext;
  /** Documento ou linha que registra o fato. Caminho relativo ao repositório. */
  reference?: string;
}

/**
 * Verificação automática do constraint, quando ela existir. Sem isto o
 * constraint é aviso; com isto vira portão.
 */
/**
 * Verificadores conhecidos. Lista fechada de propósito.
 *
 * O contrato NÃO carrega comando de shell. Um manifesto de dados que vira
 * superfície de execução é vetor de injeção: quem editar o constraint passa a
 * executar código na máquina de quem valida. O runtime resolve o `validatorId`
 * para uma implementação conhecida, e parâmetro é dado tipado, nunca texto
 * interpretado.
 */
export type ConstraintValidatorId =
  | 'ffprobe-stream-property'
  | 'ffprobe-format-property'
  | 'loudness-ebur128'
  | 'frame-dimensions'
  | 'transcript-alignment-delta';

export interface ConstraintCheck {
  validatorId: ConstraintValidatorId;
  /**
   * Parâmetros do verificador. Valores tipados, resolvidos pela implementação
   * — nunca concatenados numa linha de comando.
   */
  parameters?: Record<string, string | number | boolean>;
  /** O que caracteriza falha, em texto que o operador entenda. */
  failureSignal: string;
}

export interface ExecutionConstraint {
  schemaVersion: '1.0';
  constraintId: string;

  engine: ConstraintEngine;
  domain: ConstraintDomain;

  /**
   * A regra, na forma imperativa e verificável. "Config.setColorSpace('bt709')
   * é obrigatório", não "cuidar da cor".
   */
  rule: string;

  /**
   * POR QUE, em termos de mecanismo. É o campo que impede a regra de virar
   * superstição: quem entende o mecanismo sabe quando a regra deixou de valer.
   */
  mechanism: string;

  effect: ViolationEffect;
  evidence: ConstraintEvidence;
  check?: ConstraintCheck;

  /**
   * Condição em que a restrição deixa de valer — versão da ferramenta que
   * corrigiu, plataforma diferente. Sem isto, um fato temporário vira dogma
   * permanente.
   */
  supersededWhen?: string;

  provenance: {
    recordedAt: string;
    recordedBy?: string;
  };
}
