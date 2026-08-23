# Passo 8 — VideoAndMotionPlanner

**Responde:** dado o brief, a evidência, a marca e as preferências, qual
direção esta produção deve ter.

**Não responde:** qual arquivo usar, qual motor chamar, qual keyframe animar.
Nenhum asset e nenhum motor são escolhidos aqui.

> **Estado: parcialmente implementado.** A metade determinística existe —
> `PlanningContext`, o assembler e a cadeia de validadores. A metade
> probabilística — a proposta de direção — e a montagem final do plano não
> existem.

## Lê e produz

| Lê | Produz |
|---|---|
| brief + análise + snapshot do perfil + preferências aplicáveis | `PlanningContext` validado, `ScenePlan[]` e `PlanInputs` |

Regra de saída: nenhum asset ou motor é escolhido aqui.

## As duas metades do passo 8

A distinção governa tudo o que segue:

| Metade | O que faz | Propriedade |
|---|---|---|
| **Determinística** | filtra preferência por escopo, desempata conflito, recusa entrada incoerente, confere a proposta | a mesma entrada produz sempre o mesmo resultado |
| **Probabilística** | propõe a direção e as cenas | a mesma entrada pode produzir propostas diferentes |

Escolher **quais** entradas o modelo enxerga não é trabalho de modelo. Por isso
a montagem do contexto é código, e o modelo recebe um contexto já fechado.

## A cadeia completa

```text
PlanningContext validado
→ proposta do modelo (saída estruturada)
→ ScenePlan[]
→ validateScenePlanList
→ validateMotionNeedAgainstProfile
→ validatePlannerStageBoundary
→ PlanInputs
→ AudiovisualDirectionPlan draft | review
```

Nenhum elo é opcional. Uma proposta que não atravessa a cadeia inteira não é
persistida e não chega ao passo 10.

## O que já existe

| Peça | Onde | O que resolve |
|---|---|---|
| Contexto do planner | [`planning-context.ts`](../../contracts/production/planning-context.ts) | o que o planner lê, com conflitos já resolvidos |
| Montagem do contexto | [`assemble-planning-context.ts`](../../core/production/assemble-planning-context.ts) | filtra escopo, desempata, detecta incoerência entre artefatos |
| Barreira de estágio | [`validate-planner-stage-boundary.ts`](../../core/production/validate-planner-stage-boundary.ts) | recusa asset e motor na saída do passo 8 |
| Cena e conjunto de cenas | [`validate-scene-plan.ts`](../../core/production/validate-scene-plan.ts) | beat obrigatório, `sceneId` único, janelas sem sobreposição, keyframe barrado |
| Movimento contra a marca | [`validate-motion-need-against-profile.ts`](../../core/production/validate-motion-need-against-profile.ts) | vocabulário, envelope, overshoot, ancoragem na palavra |
| Preferências e conflito | [`validate-creative-preference.ts`](../../core/production/validate-creative-preference.ts) | valida a regra e resolve conflito por especificidade e prioridade |
| Registro do que foi usado | [`plan-inputs.ts`](../../contracts/production/plan-inputs.ts) | proveniência e invalidação |
| Gramática do vocabulário | [`motion-grammar.md`](../../../skills/cena-raiz/references/motion-grammar.md) | define o que cada `patternFamily` significa |

Testes: `test-planning-context.mjs`, `test-planner-stage-boundary.mjs`,
`test-scene-plan.mjs`, `test-motion-conformance.mjs`, `test-plan-inputs.mjs`.

### `PlanningContext` e `PlanInputs` são coisas diferentes

```text
PlanningContext   o que ENTRA no planner, montado e validado ANTES
PlanInputs        o que o planner USOU, registrado DEPOIS
```

O primeiro existe para o planner não reler o corpus inteiro nem receber prosa
solta. O segundo existe para a decisão poder ser reaberta e contestada. Um é
entrada, o outro é proveniência — e confundi-los faz o plano guardar o corpus
em vez de guardar o rastro.

### O que o assembler pega e nenhum validador isolado pegaria

- brief de uma marca com perfil de outra;
- análise de outra produção;
- perfil ainda em rascunho servindo de autoridade;
- preferência de outra marca vazando para o escopo;
- análise cuja evidência envelheceu em relação ao material atual.

Cada um desses passa em `validateCreativeBrief`, `validateContentAnalysis` e
`validateBrandRuntimeProfile`, porque cada artefato está bem formado. **O
defeito só existe na relação entre eles.**

`ContextStaleness` carrega o resultado: o planner precisa saber que a evidência
envelheceu **antes** de decidir, não depois.

## O papel exato do modelo

O modelo recebe um `PlanningContext` fechado e devolve **saída estruturada** —
nunca prosa que alguém depois interpreta. A proposta atravessa a mesma
validação de qualquer fronteira: modelo, disco ou IPC.

### O modelo pode se abster; não pode contradizer

Quando a evidência não sustenta uma decisão, a resposta correta é **abster-se**,
não preencher. `ContentAnalysis.unknowns` e `gaps` existem justamente para o
planner saber onde não há lastro.

Isso já é regra em código: `validateMotionNeedAgainstProfile` aceita o campo
ausente e recusa o valor que contradiz a marca. Abster-se é permitido;
contradizer em silêncio não.

### O que o modelo nunca decide

| Decisão | De quem é |
|---|---|
| qual arquivo usar | passo 11 |
| qual motor chamar | passo 11 |
| qual keyframe animar | passo 11 |
| se o plano está aprovado | passo 10, humano |
| qual preferência vence | assembler, determinístico |

`validatePlannerStageBoundary` transforma as duas primeiras em recusa:
`selectedAssetId` e `engineRecommendation` preenchidos na saída do passo 8 são
violação de estágio, não sugestão. `stripExecutionDecisions` permite ao próprio
planner sanear a proposta antes de submetê-la.

### Versionamento de modelo e prompt

`PlanInputs.planner` grava `name`, `version`, `model` e `promptVersion`. Sem
isso, um plano ruim não pode ser atribuído a uma versão e corrigir vira
adivinhação.

Trocar o modelo ou o prompt **sobe a versão do planner**. Dois planos
produzidos por prompts diferentes não são comparáveis, e tratá-los como iguais
esconde a causa de uma regressão.

## O que falta construir

1. **A proposta de direção.** O modelo, seu prompt versionado, o esquema de
   saída estruturada e o tratamento de abstenção.
2. **A montagem do `AudiovisualDirectionPlan`.** Juntar direção geral,
   `ScenePlan[]` e `PlanInputs` num plano `draft` ou `review`.
3. **A barreira de criação de status.** Hoje nada impede um plano nascer
   `approved` — ver [passo 9](passo-9-audiovisual-direction-plan.md).
4. **Testes de diferença real.** Marcas e intenções diferentes precisam
   produzir planos demonstravelmente diferentes. Um planner que devolve a mesma
   coisa para qualquer entrada passa em todos os testes de forma e falha no
   único que importa.

## Critérios de aceitação

- o planner recebe `PlanningContext` válido e não relê o corpus inteiro;
- preferências aplicáveis têm escopo e proveniência, e as derrotadas ficam
  registradas;
- cada cena existe uma vez em `ScenePlan`, com beat e evidência;
- `patternFamily` proposto existe na [gramática de motion](../../../skills/cena-raiz/references/motion-grammar.md)
  e no `allowedPatterns` da marca;
- nenhum asset e nenhum motor aparecem na saída;
- toda cena com âncora `transcript-word` declara a palavra;
- o plano nasce `draft` ou `review`;
- duas marcas com o mesmo brief produzem planos diferentes, e a diferença é
  atribuível ao perfil.

## Conecta com

- **Passos 5, 6 e 7** — as três entradas independentes. Nenhuma é opcional por
  descuido: análise ausente precisa ser declarada, perfil precisa estar
  aprovado, brief precisa estar `ready`.
- **Passo 9** — [`AudiovisualDirectionPlan`](passo-9-audiovisual-direction-plan.md):
  a proposta só vira plano depois da cadeia. Proposta inválida não é persistida.
- **Passo 10** — [aprovação humana](passo-10-human-approval.md): o plano nasce
  `draft` ou `review`, nunca aprovado por inferência.
- **Passo 11** — [seleção e roteamento](passo-11-asset-selection-and-execution-routing.md):
  `motionNeed` é projetado por código determinístico para um pedido de asset ou
  job. Essa projeção é recalculável e não disputa a fonte da verdade com
  `ScenePlan`.
