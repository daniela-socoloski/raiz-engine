# ADR — O protótipo `VideoAndMotionPlanner/` e a recipe generativa

**Status:** aceito
**Data:** 2026-08-20
**Contexto:** existe na raiz do repositório uma pasta `VideoAndMotionPlanner/`,
anterior ao Raiz Engine, cujo nome coincide com o planner canônico do passo 8.

## Decisão

O protótipo **não é** o `VideoAndMotionPlanner` canônico. O nome coincide; a
natureza não.

| | Protótipo `VideoAndMotionPlanner/` | Planner canônico do passo 8 |
|---|---|---|
| O que é | fluxo guiado por prompts em Markdown | código determinístico + proposta estruturada |
| Entrada | conversa e arquivos em `assets/` | [`PlanningContext`](../../packages/contracts/production/planning-context.ts) validado |
| Saída | MP4 pronto | `ScenePlan[]` e `PlanInputs`, sem asset e sem motor |
| Aprovação | uma, sobre a imagem estática | passo 10, sobre o plano |
| Motores | GPT Image 2 → Seedance 2.0, embutidos | escolhidos no passo 11, substituíveis |

O protótipo decide execução na primeira linha. O planner canônico é proibido de
tocar em execução. São coisas diferentes com o mesmo nome.

## O que acontece com cada parte

### 1. A gramática visual: absorvida

O conhecimento de estilo e composição dos prompts (`00-estilos.md`,
`02-motion-camadas.md`, `03-motion-cartelas.md`, `05-motion-camera.md`) é
material editorial válido. Ele é adaptado para a
[gramática de motion](../../skills/cena-raiz/references/motion-grammar.md),
onde vira vocabulário nomeado com faixas medidas — não prompt.

### 2. O fluxo GPT Image → Seedance: vira recipe opcional

O caminho "imagem estática aprovada → vídeo derivado dela" é uma **recipe**
legítima: um jeito de executar certas produções, ao lado de outros. Não é o
pipeline, e não é obrigatório.

Feito: [`recipes/motion-generativo/`](../../recipes/motion-generativo/SKILL.md),
com a biblioteca de estilos, as quatro estruturas, a montagem do prompt e a
detecção de provider. O mapa do que mudou está em
[`ADAPTACAO.md`](../../recipes/motion-generativo/ADAPTACAO.md).

### 3. Higgsfield e Seedance: providers substituíveis

Permanecem `RENT` na classificação de capacidade do `AGENTS.md`. Um provider
indisponível ou trocado não pode invalidar um plano aprovado — é exatamente por
isso que `engineRecommendation` é recomendação e não ordem, e que o roteamento
acontece no passo 11.

### 4. Prompts não são contratos

Os arquivos de `prompts/` descrevem como conversar com um modelo específico numa
versão específica. Contratos canônicos são tipos em `packages/contracts/`, com
validador e teste.

Um prompt pode mudar sem aviso e sem versionamento; um contrato não. Tratar
prompt como contrato foi o que fez o conhecimento morrer no fim de cada
produção — a mesma lacuna que `ExecutionConstraint` existe para fechar.

O prompt do planner canônico é versionado em `PlanInputs.planner.promptVersion`
justamente para que a distinção seja verificável: o prompt é **insumo
versionado** da proposta, não a definição do que o plano é.

## Consequências

- **Adobe, Remotion e IA generativa entram somente no passo 11.** Antes da
  aprovação humana, são capacidade disponível — não direção.
- **A pasta permanece como referência até a absorção terminar.** Ela está fora
  do versionamento (`?? VideoAndMotionPlanner/`) e não deve ser importada por
  código do Raiz Engine.
- **O nome fica reservado ao planner canônico.** Enquanto as duas coisas
  compartilharem o nome, toda conversa sobre "o VideoAndMotionPlanner" precisa
  dizer qual — e é isso que este ADR encerra.

## Não decidido aqui

- Se a recipe generativa será promovida a `recipes/` e quando.
- Se a pasta será arquivada, movida ou removida — isso exige backup e
  autorização explícita, conforme o `GUIA-ORGANIZACAO-REPOSITORIO.md`.

## Referências

- [Passo 8 — VideoAndMotionPlanner](../../packages/docs/pipeline/passo-8-video-and-motion-planner.md)
- [Passo 11 — Seleção de assets e roteamento](../../packages/docs/pipeline/passo-11-asset-selection-and-execution-routing.md)
- [Gramática de motion](../../skills/cena-raiz/references/motion-grammar.md)
