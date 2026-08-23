# O que mudou do protótipo, e por quê

Registro da adaptação de `VideoAndMotionPlanner/` para esta recipe. Serve para
quem conhecia o protótipo e precisa entender onde cada coisa foi parar — e para
que a absorção não precise ser refeita.

Origem: 13 arquivos `.md` do protótipo, lidos um a um.

## O mapa

| Protótipo | Aqui | Por quê |
|---|---|---|
| Pergunta o estilo à pessoa toda vez | `BrandRuntimeProfile.visual` + `editorial` | sem marca compilada, perguntar era a única defesa contra todo projeto sair igual. Com perfil, perguntar é deixar cada peça contradizer a marca |
| "A estrutura você decide", pelo fluxograma | derivada de `ScenePlan[]` | `purpose` e `narrativeBeat` já dizem se os elementos convivem ou se substituem |
| Um checkpoint: aprovar a imagem | portão no passo 10, sobre o **plano** | aprovar a imagem é tarde: a direção já foi tomada. A imagem vira checkpoint de execução, estreito e barato |
| Prompts são "o cérebro do projeto" | insumo versionado (`promptVersion`) | prompt muda sem aviso; contrato não. O contrato é `ScenePlan` |
| Timecodes escritos no prompt | `startFrame`/`endFrame` ÷ `fps` | o plano já tem as janelas; reescrevê-las no prompt cria uma segunda verdade |
| Duração padrão 15s | `delivery.targetDurationSeconds` | duração é decisão de entrega, do brief |
| `output/{slug}/` | `<projeto>/edit/execution/motion-generativo/` | a produção **é** a pasta; o plano aprovado já vive nela |
| `brief.md` em Markdown | `CreativeBrief` validado | brief em prosa não é verificável |
| Travas ("never redraw") como texto do template | continuam no template, e a categoria vira `ExecutionConstraint` | são fato técnico que vale para qualquer marca — não preferência |
| `--genre` escolhido pelo estilo | roteamento do passo 11 | motor e parâmetro de motor são decisão de execução |
| "MCP só faz imagem" | detecção pergunta o que cada caminho faz | o MCP da Freepik/Magnific também gera vídeo |
| Higgsfield/Seedance embutidos no fluxo | providers substituíveis | provider indisponível não pode invalidar plano aprovado |
| "Regra zero — não use nada de fora" | recipe entre outras, no passo 11 | o protótipo era autocontido por necessidade; aqui ele é uma opção de execução |

## O que foi preservado inteiro

Nem tudo era acoplamento. Isto sobreviveu sem mudança, porque é conhecimento
medido:

- **O logo nunca entra na imagem estática.** Modelo de imagem redesenha logo, e
  logo redesenhado é logo errado. Ele sobe como arquivo separado e entra sozinho
  no fecho.
- **As três travas universais** — `Never redraw`, `Total duration exactly N
  seconds`, e a trava do estilo.
- **A ordem de anexo** frames → produto → logo, que é o que amarra o prompt aos
  arquivos (`image 1`, `image 2`, `the attached logo image`).
- **Som sempre ligado, com direção explícita** e a trava
  `No voiceover, no dialogue, no lyrics, no stock-music swell` — sem ela o
  modelo enfia locução genérica.
- **O estilo tem de ser o mesmo nos dois prompts.** É a incoerência mais cara do
  caminho: imagem 3D com animação escrita para colagem faz o modelo redesenhar
  tudo tentando conciliar.
- **Aprovar a imagem antes de gastar crédito de vídeo.** Vídeo custa mais que
  imagem.
- **Ajuste gera arquivo novo**, nunca sobrescreve.
- **Câmera depende do estilo** — parada em arte chapada, livre em 3D.
- **As quatro estruturas** e suas travas próprias.
- **A biblioteca de estilos**, agora ligada ao perfil da marca.

## O conflito que precisou ser resolvido

O protótipo tem **um** ponto de aprovação: a imagem. Depois dela, o vídeo sai no
automático.

O Raiz Engine tem o portão **antes**: nenhum motor é chamado antes da aprovação
humana do plano.

Os dois não podem coexistir como estão — aprovar a imagem já é ter decidido a
direção. A resolução:

```text
passo 10   aprovação do PLANO      portão de direção, obrigatório
passo 11   aprovação da IMAGEM     checkpoint de execução, estreito
```

A pergunta do checkpoint deixa de ser *"você gosta disto?"* e passa a ser *"esta
imagem representa a cena que já foi aprovada?"*. Se a resposta exigir mudar a
direção, o caminho é voltar ao passo 8 — não corrigir no prompt.

O checkpoint continua valendo pelo motivo econômico original: imagem é barata,
vídeo não.

## Os dois scripts Python

`gerar_frame.py` e `gerar_motion.py` foram absorvidos separando **decisão** de
**efeito colateral** — a mesma fronteira do Motion Asset Registry: "recebe
manifestos já lidos e decide".

### Virou código puro em `packages/`

| No script | Aqui |
|---|---|
| `ASPECT_RATIOS`, `RESOLUTIONS`, `DURATION_MIN/MAX` como constantes | [`ProviderCapability`](../../packages/contracts/production/provider-capability.ts) — capacidade é dado, não `if` |
| `check_cli()` → `ok` / `login_required` / `missing` | `ProviderAvailability`, com `login-required` recuperável |
| a tabela "como decidir" da prosa do `CLAUDE.md` | [`selectProvider`](../../packages/core/production/capability-registry.ts) |
| `validate()` dos seis parâmetros | `validateGenerationJob`, contra a capacidade declarada |
| heurística de logo (`"logo" in nome ou pasta`) | `looksLikeLogo`, agora **recusa** em vez de avisar no stderr |
| `collect_images()` frames → produto → logo | `ATTACHMENT_ORDER` + `validateAttachmentOrder` |
| `--frame` obrigatório | `VIDEO_WITHOUT_FRAME` |
| aviso "sem logo, termina sem assinatura" | warning `NO_LOGO` |
| retry sem `--sound` quando o build recusa | `soundFallback` → `omitSoundParameter` + `soundOutcome: 'model-default'` |
| bloco `metadata` escrito em `_logs/` | `GenerationJob.provenance` e `JobResult` |

Teste: [`test-generation-job.mjs`](../../apps/cena-raiz-desktop/scripts/test-generation-job.mjs).

### Três correções feitas na absorção

1. **Capacidade deixou de ser hardcoded.** As faixas descreviam um provider só;
   trocar de gerador exigia editar código. Agora provider novo é um objeto.
2. **A heurística de logo virou recusa.** O script pulava a referência com um
   aviso no stderr — e aviso em stderr some no meio do log de upload.
3. **"Sem o parâmetro de som" deixou de ser confundido com `off`.** Um pede
   silêncio; o outro deixa a decisão com o modelo, e isso precisa ser registrado
   em `soundOutcome`.

E uma ligação que o protótipo não tinha: `GenerationJob.sceneIds`. Job que não
aponta cena é arquivo órfão — ninguém consegue dizer qual decisão aprovada ele
cumpre.

### O que ficou de fora, de propósito

O **efeito colateral**: `subprocess`, upload, polling, download, escrita de
arquivo e as regex sobre `stdout`. Isso é adapter de infraestrutura, e mantê-lo
fora de `packages/core` é o que torna a decisão testável sem instalar provider
nenhum.

A **estimativa de custo** continua vindo do provider. Inventar uma fórmula local
seria adivinhar preço de terceiro e errar caro; o que virou regra é *quando* ela
é obrigatória — antes de disparar vídeo.

Enquanto o adapter não existir, o protótipo permanece como referência local, fora
do versionamento, e não deve ser importado por código do Raiz Engine.

Ver [`ADR-GENERATIVE-MOTION-RECIPE.md`](../../docs/architecture/ADR-GENERATIVE-MOTION-RECIPE.md).
