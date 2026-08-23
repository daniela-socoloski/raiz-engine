# Passo 5 — CreativeBrief

**Responde:** o que *esta* produção precisa alcançar.

**Não responde:** o que existe no material (passo 6), como a marca fala
(passo 7), qual será a narrativa (passo 8) ou quais cenas existirão (passo 9).

## Lê e produz

| Lê | Produz |
|---|---|
| intenção humana e requisitos de entrega | `CreativeBrief` confirmado |

Regra de saída: objetivo e restrições não podem ficar apenas no chat.

## Contrato e código

| O quê | Onde |
|---|---|
| Contrato | [`packages/contracts/production/creative-brief.ts`](../../contracts/production/creative-brief.ts) |
| Validador | [`packages/core/production/validate-creative-brief.ts`](../../core/production/validate-creative-brief.ts) |
| Teste | [`apps/cena-raiz-desktop/scripts/test-creative-brief.mjs`](../../../apps/cena-raiz-desktop/scripts/test-creative-brief.mjs) |
| Caminho canônico | `edit/planning/creative-brief.json` (`CREATIVE_BRIEF_RELATIVE_PATH`) |

O contrato é **multiformato por definição**. `productionKind` é o
discriminante da união: vídeo, imagem, carrossel e campanha selecionam campos
de entrega diferentes sem que imagem precise fingir que é vídeo. Não existe
`VideoBrief` concorrente, e criar um reabre a divergência que a decisão § 3.1
fechou.

O nome visível na interface pode ser "Brief do vídeo" quando
`productionKind = video`. O contrato continua sendo `CreativeBrief`.

## Como entra no `inputs` do passo 9

```
brief: { productionId, version, status: 'ready', path }
```

O passo 9 grava a **versão exata** do brief que o planner leu. Duas
consequências implementadas em [`validate-plan-inputs.ts`](../../core/production/validate-plan-inputs.ts):

- **Só `ready` passa.** `draft` ainda está sendo escrito; `superseded` já foi
  substituído. Plano nascido de intenção inacabada não é auditável.
- **Brief revisado envelhece o plano.** `comparePlanInputs` reporta
  `kind: 'brief'` quando a versão sobe, e a interface precisa avisar antes da
  aprovação humana — não depois do render.

## Estado atual

**Existe:** contrato, validador e teste, todos canônicos em `packages/`.

**Falta:**

1. **Persistência.** `CREATIVE_BRIEF_RELATIVE_PATH` está declarado, mas nenhum
   código lê ou grava esse arquivo. Hoje o brief não existe em disco.
2. **Transição `draft` → `ready`.** Não há nada que promova o brief nem que
   registre quem confirmou. Sem isso, a regra "só `ready` alimenta o planner"
   não tem como ser satisfeita na prática.
3. **Origem conversacional.** `BriefOrigin` prevê `conversation`, mas a
   conversa que hoje acontece no desktop não produz o contrato.

## Critério de fechamento

- existe um único brief canônico, sem contrato concorrente por formato;
- o brief da produção está em disco no caminho canônico;
- `draft` → `ready` é uma transição explícita com autor registrado;
- `verbatim` preserva o pedido original como evidência, nunca como instrução
  de motor.

## Conecta com

- **Passo 6** — [`ContentAnalysis`](passo-6-content-analysis.md): o brief pode
  apontar `sourceMaterial` com `mustUse` e `doNotUse`; a análise descreve
  esses arquivos sem decidir o que fazer com eles.
- **Passo 8** — [`VideoAndMotionPlanner`](passo-8-video-and-motion-planner.md):
  o brief é a intenção que o planner precisa cumprir, e o limite que ele não
  pode ultrapassar acrescentando entregável que ninguém pediu.
- **Passo 9** — [`AudiovisualDirectionPlan`](passo-9-audiovisual-direction-plan.md):
  `intent.objective` do plano deriva do brief, e a evidência de cena pode
  apontar `source: 'brief'`.
