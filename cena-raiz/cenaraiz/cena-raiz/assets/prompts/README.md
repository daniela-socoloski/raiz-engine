# Prompts — a biblioteca do projeto

Estes arquivos são o cérebro do Human Motion. Não são exemplos soltos: são os formatos que o sistema segue.

## Dois eixos, decididos separadamente

```
   ESTILO                    ×    ESTRUTURA
   ──────                         ─────────
   Como a peça se parece          Como ela se move
   (escolha da pessoa)            (vem da ideia)

   2D flat · colagem · 3D         camadas · cartelas
   realista · mixed media              imagem+texto · câmera
   ilustração · o que ela pedir
```

**Nenhum estilo é padrão.** Se todo projeto está saindo com a mesma cara, é porque o estilo não foi perguntado.

| Arquivo | O que é |
|---|---|
| `00-estilos.md` | **A biblioteca de estilos.** Vocabulário de imagem, câmera, animação e som de cada um. Leia antes de qualquer prompt. |
| `01-frame-gpt-image-2.md` | Formato do prompt da **imagem estática** (etapa 1). |
| `02-motion-camadas.md` | Estrutura: **build-up em camadas**. Elementos entram um a um. |
| `03-motion-cartelas.md` | Estrutura: **cartelas**. Telas com frases curtas se substituindo. |
| `04-motion-imagem-texto.md` | Estrutura: **imagem + texto**. Tipografia sobre uma imagem forte. |
| `05-motion-camera.md` | Estrutura: **movimento de câmera**. Órbita, turntable, reveal. |
| `06-upload-seedance.md` | **Plano B**: pacote de upload manual, quando o vídeo não pôde ser gerado. |

## Como escolher a estrutura

```
A ideia é um processo, uma jornada, um "como funciona",
várias peças que se relacionam?
        └── SIM ──> 02-motion-camadas

A ideia é uma sequência de mensagens curtas?
(manifesto, 3 motivos, benefícios, antes/depois)
        └── SIM ──> 03-motion-cartelas

A ideia é uma imagem forte com uma frase por cima?
(campanha, oferta, lançamento)
        └── SIM ──> 04-motion-imagem-texto

A ideia é mostrar um objeto ou espaço de vários ângulos?
(reveal de produto, turntable, arquitetura)
        └── SIM ──> 05-motion-camera
```

Na dúvida entre camadas e cartelas: se os elementos precisam **conviver na mesma tela**, é camadas. Se eles se **substituem**, é cartela.

## O que toda estrutura tem em comum

Três travas aparecem em todas, e é isso que separa um motion controlado de um vídeo de IA que derrete:

1. **Não redesenhar** — `Never redraw, change or reinterpret the elements`, ou a variante da estrutura de câmera (`the subject never changes`). Sem isso o modelo refaz a arte a cada frame.
2. **`Total duration exactly N seconds`** — sem isso o corte vem torto.
3. **A trava do estilo**, copiada de `00-estilos.md`. É ela que impede a peça 2D de ganhar sombra realista e a 3D de virar desenho.

A câmera **não** é trava universal: é parada em 2D, colagem, cartelas e ilustração, e livre em 3D e realista. Ver a tabela em `00-estilos.md`.

E todas fecham igual: **o logo entra no outro**, vindo do arquivo separado que sobe junto com a imagem.

## Som — sempre ligado

Todo motion deste projeto sai **com áudio**. O gerador roda com `--sound on` por padrão, e cada estrutura traz um bloco `SOUND (always on)` no prompt.

Isso não é detalhe: se o prompt não dirige o som, o modelo inventa — quase sempre locução genérica ou trilha de banco cantada. A direção padrão é **foley + ritmo**, com o caráter vindo do estilo:

| Camada | O que é |
|---|---|
| Foley de entrada | Swish/whoosh curto a cada elemento que entra |
| Foley de pouso | Tap, click ou thud quando o elemento assenta |
| Base rítmica | Trilha leve, baixa na mixagem, no tempo do build-up |
| Transição | Um sweep limpo na virada de cena |
| Fecho | Um impacto único no pop do logo, com cauda |

E a trava obrigatória em todas: `No voiceover, no dialogue, no lyrics, no stock-music swell`.

Se a peça for entrar em campanha com trilha própria, gere assim mesmo e troque o áudio na edição — o som do modelo dá referência de timing.

## Como as imagens chegam no Seedance

O sistema sobe tudo sozinho, **nesta ordem**: frames → produto → logo. É por isso que os prompts falam em `image 1`, `image 2` e `the attached logo image` — a ordem é o que amarra o prompt aos arquivos.

| Situação | O que vai anexado |
|---|---|
| Um frame só (padrão) | `frame-01.png` + logo |
| Dois frames aprovados | `frame-01.png`, `frame-02.png` + logo |
| Produto que precisa sair fiel | os frames + a foto do produto + logo |

**Com dois frames**, ajuste a cena 2 para `matching image 2 exactly` e diga na abertura que a cena 1 vem de `image 1` e a cena 2 de `image 2`. Com um frame só, a cena 2 é derivada.

O logo é **sempre o último** e nunca aparece nas cenas 1 e 2, só no outro.

## Criando uma estrutura nova

Se aparecer um tipo de motion recorrente que não cabe nas quatro, copie a mais próxima e mantenha:

- os blocos com timecode (`SCENE 1 (0:00 – 0:07.5)`)
- os slots `[STYLE]`, `[CAMERA]`, `[SOUND]` — nunca crave um estilo no arquivo
- o bloco `OUTRO` com o logo vindo da imagem anexa
- o bloco `SOUND (always on)`
- uma seção **"As travas que não se mexe"** explicando por que cada linha está lá
