// Capability Registry — decide qual provider serve, a partir do que foi sondado.
//
// Puro: não sonda, não chama processo, não lê disco. Recebe capacidades já
// sondadas e decide. O adapter que roda `higgsfield account status` ou procura
// um MCP fica na infraestrutura — assim esta decisão é testável sem instalar
// nada, e trocar de mecanismo de sondagem não mexe na regra.
//
// É a mesma fronteira do Motion Asset Registry: "recebe manifestos já lidos e
// decide".
//
// A tabela de decisão vem do protótipo, onde vivia espalhada entre a prosa do
// CLAUDE.md e o `check_cli()` de dois scripts. Espalhada, ela divergia: um
// script avisava sobre sessão expirada, o outro não.
//
// Fonte: recipes/motion-generativo/references/providers.md

import type {
  GenerationKind,
  ProviderCapability,
} from '../../contracts/production/provider-capability';

/**
 * O que fazer com o que existe.
 *
 * `ask` é deliberado: quando há mais de um caminho servindo, a escolha é da
 * pessoa — mas UMA vez, e registrada. Perguntar de novo a cada job é ruído.
 */
export type ProviderDecision =
  | { outcome: 'use'; providerId: string; capability: ProviderCapability }
  | { outcome: 'ask'; candidates: ProviderCapability[] }
  | { outcome: 'blocked'; reason: string; recoverable: ProviderCapability[] }
  | { outcome: 'none'; reason: string };

function supports(capability: ProviderCapability, kind: GenerationKind): boolean {
  return kind === 'image' ? capability.image !== undefined : capability.video !== undefined;
}

/**
 * Escolhe o provider para um tipo de geração.
 *
 * `preferredProviderId` é a escolha já registrada da pessoa. Quando ela ainda
 * serve, vence sem nova pergunta; quando não serve mais — desinstalado, sessão
 * caída, deixou de suportar o tipo — a decisão volta a ser aberta em vez de
 * falhar apontando um provider que não existe.
 */
export function selectProvider(
  capabilities: readonly ProviderCapability[],
  kind: GenerationKind,
  preferredProviderId?: string,
): ProviderDecision {
  const capable = capabilities.filter((c) => supports(c, kind));

  if (capable.length === 0) {
    return {
      outcome: 'none',
      reason: `nenhum provider conhecido gera ${kind === 'image' ? 'imagem' : 'vídeo'}`,
    };
  }

  const ready = capable.filter((c) => c.availability === 'ok');

  if (ready.length === 0) {
    // Sessão expirada é recuperável e a ação humana é outra: pedir login e
    // retomar de onde parou, nunca recomeçar a produção.
    const recoverable = capable.filter((c) => c.availability === 'login-required');
    if (recoverable.length > 0) {
      return {
        outcome: 'blocked',
        reason: 'sessão expirada; peça o login e retome de onde parou',
        recoverable,
      };
    }
    return {
      outcome: 'none',
      reason: `nenhum provider disponível para ${kind === 'image' ? 'imagem' : 'vídeo'}`,
    };
  }

  if (preferredProviderId) {
    const preferred = ready.find((c) => c.providerId === preferredProviderId);
    if (preferred) {
      return { outcome: 'use', providerId: preferred.providerId, capability: preferred };
    }
  }

  if (ready.length === 1) {
    return { outcome: 'use', providerId: ready[0].providerId, capability: ready[0] };
  }

  return { outcome: 'ask', candidates: ready };
}

/**
 * O caminho inteiro da recipe: imagem e vídeo podem sair por providers
 * diferentes.
 *
 * O protótipo presumia que MCP fazia só imagem e que o vídeo teria de sair pelo
 * CLI. Presunção errada — há MCP que gera vídeo também. Por isso aqui cada
 * etapa é decidida pela capacidade declarada, nunca pela família do provider.
 */
export interface ExecutionPathPlan {
  image: ProviderDecision;
  video: ProviderDecision;
  /**
   * Sem gerador de vídeo, a produção não trava: entrega o pacote manual com
   * arquivos, parâmetros e prompt prontos. O plano aprovado continua válido —
   * só a execução ficou pendente.
   */
  needsManualPackage: boolean;
  /** Providers diferentes para imagem e vídeo. Vale dizer, sem drama. */
  splitPath: boolean;
}

export function planExecutionPaths(
  capabilities: readonly ProviderCapability[],
  preferred?: { image?: string; video?: string },
): ExecutionPathPlan {
  const image = selectProvider(capabilities, 'image', preferred?.image);
  const video = selectProvider(capabilities, 'video', preferred?.video);

  const chosen = (d: ProviderDecision) => (d.outcome === 'use' ? d.providerId : undefined);
  const imageId = chosen(image);
  const videoId = chosen(video);

  return {
    image,
    video,
    needsManualPackage: video.outcome === 'none' || video.outcome === 'blocked',
    splitPath: imageId !== undefined && videoId !== undefined && imageId !== videoId,
  };
}

/**
 * Frase curta para a pessoa. Decisão silenciosa é decisão que ninguém pode
 * contestar — e trocar de provider muda o resultado.
 */
export function describeDecision(decision: ProviderDecision, kind: GenerationKind): string {
  const noun = kind === 'image' ? 'imagem' : 'vídeo';
  switch (decision.outcome) {
    case 'use':
      return `${noun} por ${decision.capability.displayName}`;
    case 'ask':
      return `${noun}: mais de um caminho disponível — ${decision.candidates
        .map((c) => c.displayName)
        .join(' ou ')}`;
    case 'blocked':
      return `${noun} bloqueado: ${decision.reason}`;
    case 'none':
      return `${noun} indisponível: ${decision.reason}`;
  }
}
