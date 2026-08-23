# Passo 11 — Seleção de assets e roteamento de execução

**Responde:** com o quê produzir esta direção aprovada.

**Não responde:** o que produzir. Isso já foi decidido e aprovado. Este passo
não reabre direção — se precisar reabrir, o plano volta ao passo 8.

> **Estado: parcial.** O Motion Asset Registry existe no app herdado e o
> `ExecutionConstraint` está contratado. Capability Registry, Recipe Registry,
> compilação de `MotionNeed` e roteamento não existem.

## Lê e produz

| Lê | Produz |
|---|---|
| plano aprovado + registries + capacidades detectadas | `ValidatedExecutionPlan` e jobs roteados por motor |

## A regra que governa o passo

**Reutilizar antes de gerar.** Geração é o último recurso, não o primeiro: ela
custa tempo, dinheiro e crédito de provider, e produz um asset que ninguém
revisou. Um asset já aprovado e conforme à marca é melhor por definição.

`ScenePlan.selectedAssetId` só pode ser preenchido aqui —
`validatePlannerStageBoundary` recusa esse campo na saída do passo 8.

## Os quatro registries

| Registry | Responde | Estado |
|---|---|---|
| **Motion Asset Registry** | quais templates de motion existem e quais servem a esta cena | **existe** — [`motion-asset-registry.ts`](../../../apps/cena-raiz-desktop/src/application/motion/motion-asset-registry.ts) |
| **Capability Registry** | o que esta máquina consegue executar agora | **existe** — [`capability-registry.ts`](../../core/production/capability-registry.ts) |
| **Asset Registry** | quais mídias da marca já existem e podem ser reutilizadas | **não existe** |
| **Recipe Registry** | quais fluxos completos estão disponíveis | **não existe** — `recipes/ads-produto` e `recipes/motion-generativo` são os casos |

O Motion Asset Registry já implementa os critérios que os outros devem seguir:

> - o registry carrega deterministicamente;
> - assets duplicados, inválidos ou incompatíveis **não** chegam ao planner;
> - todo asset selecionado cita ID, fonte, resultado de compatibilidade e
>   propósito de cena.

Ele é **puro**: não lê disco nem chama processo, recebe manifestos já lidos e
decide. O adapter de disco fica na infraestrutura. Os outros três registries
devem nascer com a mesma fronteira.

### Capacidade disponível não é autorização

Ter FFmpeg instalado não autoriza usá-lo, e não decide a direção. O Capability
Registry responde "consigo?", nunca "devo?". A resposta "devo" já veio do plano
aprovado.

[`ProviderCapability`](../../contracts/production/provider-capability.ts) torna
a capacidade **dado** em vez de código. No protótipo absorvido, as faixas
aceitas eram constantes dentro do script — `ASPECT_RATIOS`, `RESOLUTIONS`,
`DURATION_MIN/MAX` — e por isso descreviam um provider só; trocar de gerador
exigia editar código. Agora um provider novo é um objeto.

`selectProvider` implementa a tabela de decisão: um caminho usa sem perguntar,
dois perguntam **uma vez**, sessão expirada é `blocked` e recuperável — a ação é
pedir o login e **retomar de onde parou** —, nenhum caminho de vídeo aciona o
pacote manual sem invalidar o plano.

### O pedido de geração

[`GenerationJob`](../../contracts/production/generation-job.ts) é a projeção de
`ScenePlan` em pedido ao provider. Três regras que
[`validate-generation-job.ts`](../../core/production/validate-generation-job.ts)
transforma em recusa, e que já custaram render:

| Regra | Por quê |
|---|---|
| o logo nunca é referência de imagem | provider redesenha logo, e logo redesenhado é logo errado |
| a ordem de anexo é `frame → product → logo` | o prompt diz "image 1", "image 2", "the attached logo image"; trocar a ordem troca o significado sem erro aparecer |
| vídeo disparado exige estimativa | vídeo custa mais que imagem, e estimar depois de disparar não é estimar |

`sceneIds` é obrigatório: job que não aponta cena é arquivo órfão, e ninguém
consegue dizer qual decisão aprovada ele cumpre.

## Compilação do `MotionNeed`

É aqui que a decisão semântica vira parâmetro de execução:

```text
MotionNeed (função, padrão, envelope, âncora na palavra)
→ projeção determinística
→ keyframes, parâmetros de template ou argumentos de job
```

Três propriedades dessa projeção:

1. **É recalculável.** Não vira um segundo estado persistido. `SceneMotionNeed`
   foi explicitamente recusado como arquivo próprio — a fonte da verdade
   continua sendo `ScenePlan`.
2. **É determinística.** A mesma cena com as mesmas capacidades produz o mesmo
   job. Se variar, a causa é uma capacidade diferente, não uma escolha nova.
3. **Consulta a gramática.** O que `patternFamily: "slide-settle"` significa —
   três propriedades juntas, 20 quadros, expo-out — está na
   [gramática de motion](../../../skills/cena-raiz/references/motion-grammar.md),
   não no código do compilador.

`MotionEnvelope.fps` é obrigatório quando há duração porque é aqui que quadro
vira tempo real: 14 quadros são 467ms a 30fps e 233ms a 60fps.

## Roteamento entre motores

`ScenePlan.engineRecommendation` é **recomendação, não ordem**. O router pode
escolher outro motor por indisponibilidade, custo ou complexidade — sem
invalidar o plano.

| Motor | Quando |
|---|---|
| `ffmpeg` | corte, concatenação, mixagem, masterização |
| `remotion` | composição programática, legenda, gráfico que executa a frase |
| `after-effects` / `premiere` | quando o asset existe como projeto Adobe |
| `image-provider` | quando a cena precisa de imagem que não existe |

Mutações e sincronização Adobe permanecem adiadas para a fase controlada de
Adobe. Providers generativos entram **somente aqui** — nunca antes da aprovação.

### Fallback

Um motor indisponível não pode derrubar a produção nem alterar a direção. O
fallback escolhe outro caminho para o **mesmo** `MotionNeed`; se nenhum caminho
cumpre a necessidade, o job falha explicitamente em vez de entregar algo
diferente em silêncio.

Trocar o motor nunca é motivo para trocar a decisão semântica.

## Readback

Executar não é entregar. O passo 11 termina lendo de volta o que produziu e
comparando com o que prometeu — dimensão, taxa de quadros, espaço de cor,
duração. Os testes que formalizam isso estão em
[áudio e verificação](../../../skills/cena-raiz/references/audio-verification.md).

`validatePlannerStageBoundary(scenes, 'execution')` fecha o outro lado: cena que
chega à execução **sem** `engineRecommendation` significa que este passo não
rodou, e alguém está prestes a improvisar.

## Restrições técnicas

[`ExecutionConstraint`](../../contracts/production/execution-constraint.ts)
guarda o que não pode ser reaprendido a cada produção — fato técnico que vale
para qualquer marca e cuja violação quebra o render, não o gosto:

- vídeo com alpha não tem faixa de áudio;
- WebM/VP9 com alpha é descartado por muitos builds de ffmpeg;
- Remotion exporta BT.601 full range por padrão;
- loudnorm de uma passada não converge;
- 29,97 fps é `30000/1001`;
- fonte precisa de `delayRender`.

Isto **não** é `CreativePreference`: preferência é escolha humana revogável com
escopo de marca; isto é fato técnico.

## O que falta construir

1. Asset Registry e Recipe Registry, com a mesma fronteira pura do Motion Asset
   Registry e do Capability Registry.
2. `ValidatedExecutionPlan` — o contrato do que será executado.
3. O compilador de `MotionNeed` para job.
4. O router entre motores, com política de fallback explícita.
5. O readback e sua comparação com o prometido.
6. **O adapter de provider** — a camada impura que sonda a máquina, sobe
   arquivo, dispara o job, espera e baixa o resultado. A decisão já é pura e
   testável; falta quem execute.

## Critérios de aceitação

- nenhum motor é chamado antes da aprovação do passo 10;
- asset reutilizado é preferido a asset gerado, e a escolha é justificada;
- todo asset selecionado cita ID, fonte, compatibilidade e propósito de cena;
- a mesma cena com as mesmas capacidades produz o mesmo job;
- motor indisponível produz fallback ou falha explícita, nunca entrega diferente
  em silêncio;
- o readback compara o produzido com o prometido antes de entregar.

## Conecta com

- **Passo 10** — [aprovação humana](passo-10-human-approval.md): a fronteira que
  autoriza este passo a existir.
- **Passo 9** — [`ScenePlan`](passo-9-audiovisual-direction-plan.md): a decisão
  semântica que este passo projeta, e que ele não pode contradizer.
- **Passo 12** — [revisão e memória](passo-12-review-delivery-and-creative-memory.md):
  recebe o resultado e o readback.
- **[ADR da recipe generativa](../../../docs/architecture/ADR-GENERATIVE-MOTION-RECIPE.md)**
  — por que Higgsfield e Seedance são providers substituíveis, e não o pipeline.
