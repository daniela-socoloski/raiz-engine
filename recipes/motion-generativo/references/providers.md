# Providers — detecção de capacidade

Nunca assuma qual gerador existe. Detecte **uma vez**, no início da execução, e
siga com o que houver.

Isto é o Capability Registry do passo 11 aplicado a esta recipe: ele responde
*"consigo?"*, nunca *"devo?"*. A resposta "devo" já veio do plano aprovado.

A decisão está implementada e testada:

| O quê | Onde |
|---|---|
| Contrato da capacidade | [`provider-capability.ts`](../../../packages/contracts/production/provider-capability.ts) |
| Contrato do pedido | [`generation-job.ts`](../../../packages/contracts/production/generation-job.ts) |
| Escolha do provider | [`capability-registry.ts`](../../../packages/core/production/capability-registry.ts) |
| Validação do pedido | [`validate-generation-job.ts`](../../../packages/core/production/validate-generation-job.ts) |

O que **não** está implementado é o adapter: sondar a máquina, subir arquivo,
disparar, esperar e baixar. Até ele existir, esta recipe descreve o caminho e a
decisão é verificável, mas a execução é manual.

## Os dois caminhos

| | Freepik / Magnific MCP | Higgsfield CLI |
|---|---|---|
| Imagem | `images_generate` | `gpt_image_2` |
| Vídeo | `video_generate` | `seedance_2_0` |
| Upscale | `images_upscale`, `video_upscale` | — |
| Como chega | conector MCP | `npm i -g @higgsfield/cli` |
| Sessão | do conector | `higgsfield auth login` |

**Correção em relação ao protótipo:** ele assumia que o MCP faria só imagem e
que o vídeo teria de sair pelo CLI. O MCP da Freepik/Magnific **também gera
vídeo** — a detecção precisa perguntar o que cada caminho faz, não presumir.

## Como detectar

1. **MCP** — procure entre as ferramentas disponíveis um gerador. Se estiverem
   diferidas, use `ToolSearch` com termos como `magnific`, `image generation`,
   `video generation`. Anote **o que ele faz**: só imagem, ou imagem e vídeo.
2. **CLI** — verifique a disponibilidade e a sessão.

| Resultado | Significa |
|---|---|
| `ok` | disponível para imagem **e** vídeo |
| `login_required` | instalado, sessão expirada — peça o login |
| `missing` | não instalado |

## Como decidir

| Situação | O que fazer |
|---|---|
| Só um disponível | use, e diga em uma linha qual está usando. Não pergunte. |
| Os dois disponíveis | pergunte **uma vez**, curto. Registre e não pergunte de novo. |
| MCP só faz imagem | imagem pelo MCP, vídeo pelo CLI. Diga isso quando chegar no vídeo, sem drama. |
| Nenhum gerador de vídeo | escreva o [pacote manual](prompt-templates.md#4-pacote-manual). O plano continua válido. |
| Nenhum gerador | não gere nada. Escreva os prompts e deixe prontos. |
| Sessão expirada no meio | peça o login e **retome de onde parou**. Nunca recomece. |

## O que não muda entre os caminhos

- o prompt, em inglês, nos formatos de [prompt-templates.md](prompt-templates.md);
- os parâmetros: aspect ratio, resolução, duração;
- os caminhos dos arquivos dentro da produção;
- **o logo nunca entra na imagem** — sobe separado;
- a aprovação da imagem antes de gastar crédito de vídeo.

Provider é detalhe de execução. Trocar de provider **nunca** é motivo para
trocar a decisão semântica do plano.

## Parâmetros de vídeo

| Parâmetro | Faixa | Padrão |
|---|---|---|
| duração | 4 a 15 s | `targetDurationSeconds` do brief |
| resolução | 480p · 720p · 1080p | 1080p |
| aspect ratio | 9:16 · 1:1 · 16:9 | `delivery.aspectRatio` do brief |
| modo | `std` (final) · `fast` (preview) | `std` |
| som | on · off | **on — sempre** |

**O som é sempre ligado.** Não é pergunta: o prompt já traz a direção de áudio e
a trava contra locução. Se o build do modelo não aceitar o parâmetro, tente de
novo sem ele e registre no log — nesse caso avise que o áudio ficou por conta do
modelo.

## Custo

Vídeo custa mais que imagem, e por isso a ordem importa: a imagem é aprovada
**antes** de qualquer crédito de vídeo ser gasto.

Estime antes de disparar. Para ver o movimento sem pagar o preço cheio, rode em
`fast` e depois no `std`.

## Registro

Todo job grava em `_logs/`: job id, provider, modelo, parâmetros e os UUIDs das
imagens enviadas. Serve para reproduzir ou depurar um resultado estranho, e é o
insumo do `CreativeMemoryEntry` do passo 12.

Quando o caminho for MCP, registre qual MCP e qual modelo — o log do provider
não fica na produção.
