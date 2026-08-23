# Contratos de produção (passos 5 → 12)

Estes arquivos são a fonte da verdade. A explicação de cada fase, o que já
existe e o que falta está em [`packages/docs/pipeline/`](../../docs/pipeline/README.md).

| Contrato | Passo | O que carrega | Documento |
|---|---|---|---|
| [`creative-brief.ts`](creative-brief.ts) | 5 | intenção da produção | [Passo 5](../../docs/pipeline/passo-5-creative-brief.md) |
| [`content-analysis.ts`](content-analysis.ts) | 6 | evidência do material | [Passo 6](../../docs/pipeline/passo-6-content-analysis.md) |
| [`planning-context.ts`](planning-context.ts) | 8 | **o que entra** no planner | [Passo 8](../../docs/pipeline/passo-8-video-and-motion-planner.md) |
| [`creative-preference.ts`](creative-preference.ts) | 8 | correção humana aprovada | [Passo 8](../../docs/pipeline/passo-8-video-and-motion-planner.md) |
| [`scene-plan.ts`](scene-plan.ts) | 9 | a decisão semântica da cena | [Passo 9](../../docs/pipeline/passo-9-audiovisual-direction-plan.md) |
| [`plan-inputs.ts`](plan-inputs.ts) | 9 | **o que foi usado** pelo planner | [Passo 9](../../docs/pipeline/passo-9-audiovisual-direction-plan.md) |
| [`execution-constraint.ts`](execution-constraint.ts) | 11 | fato técnico que quebra o render | [Passo 11](../../docs/pipeline/passo-11-asset-selection-and-execution-routing.md) |
| [`provider-capability.ts`](provider-capability.ts) | 11 | o que um gerador **consegue** fazer | [Passo 11](../../docs/pipeline/passo-11-asset-selection-and-execution-routing.md) |
| [`generation-job.ts`](generation-job.ts) | 11 | um pedido de geração, ligado às cenas | [Passo 11](../../docs/pipeline/passo-11-asset-selection-and-execution-routing.md) |

## `PlanningContext` e `PlanInputs` não são o mesmo contrato

A confusão entre os dois é fácil de cometer e cara de desfazer:

```text
PlanningContext   o que ENTRA no planner, montado e validado ANTES
PlanInputs        o que o planner USOU, registrado DEPOIS
```

| | `PlanningContext` | `PlanInputs` |
|---|---|---|
| Momento | antes da proposta | depois da proposta |
| Carrega | o **conteúdo** dos artefatos | **ponteiros** versionados |
| Existe para | o planner não reler o corpus nem receber prosa solta | a decisão poder ser reaberta e contestada |
| Vida útil | a montagem | a produção inteira |

Um é entrada, o outro é proveniência. Fazer o plano guardar o `PlanningContext`
significaria gravar o corpus dentro do plano; fazer o planner ler o `PlanInputs`
significaria dar-lhe ponteiros em vez de conteúdo.

## Validadores

Vivem em [`packages/core/production/`](../../core/production/):

| Arquivo | O que defende |
|---|---|
| `validate-creative-brief.ts` | forma e coerência do brief |
| `validate-content-analysis.ts` | evidência com origem, fingerprint SHA-256 |
| `content-analysis-cache.ts` | reaproveitamento e invalidação por fonte |
| `assemble-planning-context.ts` | a relação **entre** artefatos bem formados |
| `validate-creative-preference.ts` | regra, escopo e desempate de conflito |
| `validate-scene-plan.ts` | beat, janelas sem sobreposição, keyframe barrado |
| `validate-motion-need-against-profile.ts` | vocabulário, envelope, overshoot, ancoragem |
| `validate-planner-stage-boundary.ts` | asset e motor não vazam do passo 11 para o 8 |
| `validate-plan-inputs.ts` | estado aprovado, ausência declarada, derrota registrada |
| `validate-execution-constraint.ts` | fato técnico bem formado |
| `capability-registry.ts` | qual provider serve, e o que fazer quando nenhum serve |
| `validate-generation-job.ts` | job dentro da capacidade, ordem de anexo, logo fora da imagem |

## Dicionários que dão significado aos campos

Campo tipado não é campo entendido. `patternFamily: "slide-settle"` passa na
validação por estar numa lista; o que o nome **significa** está em:

- [Gramática de motion](../../../skills/cena-raiz/references/motion-grammar.md)
- [Áudio e verificação](../../../skills/cena-raiz/references/audio-verification.md)

Quando um documento e um `.ts` discordarem, o `.ts` está certo.
