---
name: motion-generativo
description: Recipe de execução do passo 11 — transforma cenas de um AudiovisualDirectionPlan aprovado em vídeo, pelo caminho "imagem estática aprovada → motion derivado dela". A imagem carrega todos os elementos da cena e é aprovada antes de qualquer crédito de vídeo ser gasto; o motion recebe essa imagem e a põe em movimento, fechando com o logo como camada separada. Providers substituíveis: Freepik/Magnific MCP ou Higgsfield CLI, detectados por capacidade. Use quando o plano aprovado pedir cena gerada que não existe no Asset Registry e o formato for peça curta de motion graphics. NÃO use para edição de material filmado, que é caminho de FFmpeg e Remotion.
---

# Motion generativo — imagem aprovada → motion

Recipe de **execução**, não de direção. Ela roda no passo 11, depois que o
plano já foi aprovado por uma pessoa no passo 10.

Origem: protótipo `VideoAndMotionPlanner/`, adaptado ao pipeline do Raiz Engine.
A decisão que separa os dois está em
[`ADR-GENERATIVE-MOTION-RECIPE.md`](../../docs/architecture/ADR-GENERATIVE-MOTION-RECIPE.md).

## A ideia central: a imagem é a âncora

Não se anima do nada. Primeiro nasce **uma tela** com todos os elementos da
cena; depois o modelo de vídeo usa essa tela como matéria-prima — separa os
elementos, faz cada um entrar, desmonta, remonta em outra composição e fecha com
a assinatura.

Duas consequências práticas:

1. **Vídeo custa mais que imagem.** A imagem é aprovada antes de qualquer
   crédito de vídeo ser gasto. É a mesma lógica de *reutilizar antes de gerar*
   do passo 11, aplicada dentro da geração.
2. **O que estiver mal resolvido na imagem aparece no motion.** Corrigir na
   imagem é barato; corrigir no vídeo é refazer.

## O que esta recipe NÃO decide

Isto é o que a adaptação mudou em relação ao protótipo. A recipe **executa** o
que já foi decidido:

| Decisão | Onde ela já foi tomada |
|---|---|
| O que a peça comunica | `CreativeBrief.intent` — passo 5 |
| Quais cenas existem, e por quê | `ScenePlan[]` — passo 8, com `purpose` e `narrativeBeat` |
| Como a marca se parece e se move | `BrandRuntimeProfile` — snapshot do passo 7 |
| Qual movimento cada cena precisa | `ScenePlan.motionNeed` |
| Se isto pode ser produzido | Aprovação humana — passo 10 |
| Duração da peça | `CreativeBrief.delivery.targetDurationSeconds` |

**A recipe nunca pergunta o estilo.** No protótipo o estilo era a pergunta mais
importante da conversa, porque não havia marca compilada. Aqui ele vem de
`BrandRuntimeProfile.visual` e `editorial` — perguntar de novo seria deixar cada
produção contradizer a marca, que é exatamente o que o perfil existe para
impedir.

Ver [references/estilos.md](references/estilos.md) para o mapeamento
perfil → vocabulário de prompt.

## De `ScenePlan` a prompt

```text
ScenePlan[] aprovado
→ escolher a estrutura (derivada de purpose/narrativeBeat, não perguntada)
→ prompt da imagem       ← BrandRuntimeProfile.visual + MediaNeed
→ gerar → aprovar
→ prompt do motion       ← MotionNeed + janelas de cena + AudioNeed
→ gerar → readback
```

A escolha da estrutura é **derivada**, não conversada:

| `ScenePlan[]` mostra | Estrutura | Arquivo |
|---|---|---|
| elementos que **convivem** na mesma tela, entrando aos poucos | camadas | [estruturas.md](references/estruturas.md#camadas) |
| cenas que **se substituem**, cada uma com uma frase curta | cartelas | [estruturas.md](references/estruturas.md#cartelas) |
| uma imagem forte com tipografia por cima | imagem + texto | [estruturas.md](references/estruturas.md#imagem--texto) |
| um objeto ou espaço visto de vários ângulos | câmera | [estruturas.md](references/estruturas.md#câmera) |

Na dúvida entre camadas e cartelas: se os elementos precisam **conviver**, é
camadas; se eles se **substituem**, é cartela. `ScenePlan` já responde isso —
cenas com janelas que se encadeiam sobre o mesmo cenário são camadas; cenas com
`purpose` distinto e cenário próprio são cartelas.

Os timecodes do prompt saem de `ScenePlan.startFrame` e `endFrame`, convertidos
por `MotionEnvelope.fps`. Não são inventados no prompt.

## O logo é uma camada separada

**O logo nunca entra na imagem estática.** Ele sobe como arquivo próprio e
aparece no fecho.

Por quê: o logo precisa ser camada independente para entrar sozinho no final, e
modelo de imagem **redesenha logo** — logo redesenhado é logo errado.

No plano, isso é uma cena de `purpose: 'identify'` no fim da timeline, com
`mediaNeed.kind: 'graphic'`. A recipe recusa o logo como referência de imagem.

## Som

Todo motion desta recipe sai **com áudio**, e o prompt dirige o som. Sem direção
explícita o modelo inventa — quase sempre locução genérica ou trilha cantada.

A trava obrigatória em todo prompt:
`No voiceover, no dialogue, no lyrics, no stock-music swell`.

O caráter vem de `SoundProfile` da marca e de `ScenePlan.audioNeed.role`. Se a
peça for entrar em campanha com trilha própria, gere assim mesmo e troque na
edição — o som do modelo dá referência de timing.

Níveis de entrega e os testes que provam a mixagem estão em
[áudio e verificação](../../skills/cena-raiz/references/audio-verification.md).

## Providers

Detectados por capacidade, nunca assumidos. Ver
[references/providers.md](references/providers.md).

| Caminho | Imagem | Vídeo |
|---|---|---|
| **Freepik / Magnific MCP** | `images_generate` | `video_generate` |
| **Higgsfield CLI** | `gpt_image_2` | `seedance_2_0` |

Nenhum é obrigatório e nenhum é canônico. Provider indisponível ou trocado **não
invalida o plano aprovado** — é por isso que `engineRecommendation` é
recomendação e não ordem.

Quando nenhum gerador de vídeo existe na máquina, a recipe entrega o **pacote
manual**: arquivos, parâmetros e prompt prontos para rodar à mão. O plano
continua válido; só a execução ficou pendente.

## O fluxo

### 1. Ler o plano aprovado

Confirme, antes de qualquer chamada de provider:

- `status` é `approved` — plano em `draft` ou `review` não executa;
- `validatePlannerStageBoundary(scenes, 'execution')` passa, ou seja, o
  roteamento do passo 11 já aconteceu;
- `PlanInputs` não acusa entrada envelhecida (`comparePlanInputs` vazio).

Plano cujo brief subiu de versão ou cuja fonte mudou volta para revisão. Gerar
sobre entrada envelhecida gasta crédito para produzir algo que será refeito.

### 2. Escrever o prompt da imagem

Formato em [references/prompt-templates.md](references/prompt-templates.md#imagem-estática).
O vocabulário de estilo vem do perfil da marca, não de escolha do agente.

Proibições absolutas, em qualquer estilo: sem logo, sem marca, sem assinatura,
sem marca d'água, sem UI, sem moldura. Composição sangrando até a borda.

Prompts são escritos em **inglês**; a conversa é em português.

### 3. Gerar e aprovar a imagem

Uma imagem por vez. Ajuste gera arquivo novo — `frame-02.png`,
`frame-03.png` —, nunca sobrescreve.

Este é um **checkpoint de execução**, não o portão de direção. O portão foi o
passo 10, sobre o plano. Aqui a pergunta é estreita: *esta imagem representa a
cena que já foi aprovada?* Se a resposta exigir mudar a direção, o caminho é
voltar ao passo 8 — não corrigir no prompt.

### 4. Montar o prompt do motion

Isto é trabalho de bastidor: a pessoa aprovou o plano e a imagem; o prompt é
responsabilidade da recipe.

O estilo do prompt de animação tem de ser **o mesmo** do prompt da imagem.
Imagem 3D com animação escrita para colagem faz o modelo redesenhar tudo
tentando conciliar — é o erro mais caro deste caminho.

### 5. Gerar o vídeo

Estime o custo antes. Pergunte apenas o que resta e não estava no plano:
resolução e preview/final. Duração, formato e estrutura já foram decididos.

### 6. Readback

Executar não é entregar. Confira contra o prometido:

- a cena 1 termina **igual** à imagem aprovada;
- nenhum elemento foi redesenhado ou mudou de forma;
- a câmera obedeceu ao estilo (parada onde deve ser parada);
- o logo entrou inteiro e legível no fecho;
- a duração bateu com `targetDurationSeconds`;
- o áudio veio, sem locução nem trilha cantada.

Falha aqui quase sempre se corrige reforçando a trava correspondente no prompt —
ver "as travas que não se mexem" em [estruturas.md](references/estruturas.md).

## Saídas

Dentro da produção, não numa pasta paralela:

```text
<projeto>/edit/
├── planning/audiovisual-direction-plan.json   o plano aprovado
└── execution/motion-generativo/
    ├── frame/prompt-frame.txt
    ├── frame/frame-01.png
    ├── motion/prompt-motion.txt
    ├── motion/motion-01.mp4
    └── _logs/                                  job id, modelo, UUIDs enviados
```

O protótipo escrevia em `output/{slug}/`. Aqui a produção **é** a pasta, e o
plano aprovado já vive nela. Manter os artefatos juntos é o que permite reabrir
a produção e provar o que gerou o quê.

`_logs/` guarda job id, modelo, parâmetros e os UUIDs enviados. Serve para
reproduzir ou depurar um resultado estranho — e é o insumo do
`CreativeMemoryEntry` do passo 12.

## Referências

| Arquivo | O quê |
|---|---|
| [estilos.md](references/estilos.md) | perfil da marca → vocabulário de prompt |
| [estruturas.md](references/estruturas.md) | as quatro estruturas e suas travas |
| [prompt-templates.md](references/prompt-templates.md) | os formatos, como insumo versionado |
| [providers.md](references/providers.md) | detecção de capacidade e mapeamento |
| [Gramática de motion](../../skills/cena-raiz/references/motion-grammar.md) | o vocabulário canônico de movimento |
| [Passo 11](../../packages/docs/pipeline/passo-11-asset-selection-and-execution-routing.md) | onde esta recipe se encaixa |
