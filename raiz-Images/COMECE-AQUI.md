# COMECE AQUI — Human Image

Esta pasta transforma uma ideia curta (ou uma imagem de referencia) em **prompt visual completo +
imagem renderizada**. Ela e feita para ser **compartilhada**: varias pessoas usam a mesma
inteligencia, cada uma com o seu motor de render.

---

## 1. O QUE VOCE PRECISA INSTALAR

Voce precisa de **um** dos dois. Se tiver os dois, o Higgsfield e o padrao.

### Opcao A — Higgsfield CLI (padrao da casa)

```bash
npm install -g @higgsfield/cli
```

```bash
higgsfield auth login
```

Modelo usado: **Nano Banana 2** (`nano_banana_2`).

### Opcao B — Magnific MCP

Se voce abrir o Claude Code **dentro desta pasta**, o [.mcp.json](.mcp.json) daqui ja declara o
servidor — e so aprovar quando o Claude Code perguntar e fazer o login do Magnific.

Para usar em **qualquer outra pasta**, rode uma vez:

```bash
claude mcp add --transport http --scope user magnific https://mcp.magnific.com/mcp
```

### Conferir o que esta pronto

```bash
python3 scripts/render_image.py check-providers
```

No Windows, troque `python3` por `python` e use `\` nos caminhos.

### Forcar um provider

Se voce tem os dois instalados e quer travar em um:

```bash
export HUMAN_IMAGE_PROVIDER=magnific
```

Windows (PowerShell):

```bash
$env:HUMAN_IMAGE_PROVIDER = "magnific"
```

Ou simplesmente peca em linguagem natural: *"gera pelo Magnific"*.

---

## 2. COMO USAR

**Abra o Claude Code nesta pasta e diga "vamos começar".** O sistema se apresenta e conduz
a partir dai.

Se voce ja sabe o que quer, pode pedir direto:

- *"foto de um homem atravessando a rua na chuva, 4:5"*
- *"product shot da garrafa em fundo escuro, 1:1, 4 imagens"*
- *"uma ilustracao 2D flat de uma cozinha, 16:9"*

O sistema **decide sozinho** camera, lente, luz, composicao e textura. Voce nao precisa saber nada
de fotografia. O que ele confirma com voce e so: **nome do projeto, quantidade, aspect ratio,
iluminacao e resolucao**.

**Pediu varias imagens? Elas saem em paralelo.** Pedir 4 nao demora 4 vezes mais que pedir 1 —
o sistema dispara todas juntas. Se uma falhar, as outras continuam e ele refaz so a que faltou.

### Onde os arquivos aparecem

Sempre na **pasta onde voce abriu o Claude Code**:

```text
human-output/image/{nome-do-projeto}/
├── prompt.txt      o prompt usado
├── brief.txt       o resumo do pedido e dos parametros
├── image-01.png
├── image-02.png
├── metadata.json
└── _logs/
```

Se voce abriu o Claude Code aqui dentro, a pasta `human-output/` nasce aqui mesmo. Cada
projeto ganha a sua propria subpasta — nada fica solto.

---

## 3. OS DOIS MODOS

O sistema roteia sozinho, mas vale entender:

| Modo | Quando | O que faz |
|---|---|---|
| **Realista** (padrao) | foto, retrato, still, product shot, anuncio, cena narrativa | Usa toda a inteligencia de direcao de fotografia: camera, lente, T-stop, Kelvin, stock de filme, grao, textura de pele. |
| **Estilizado** | ilustracao, desenho 2D, render 3D, cartoon, anime, vetor, flat, aquarela, pixel art, colagem, icone | **Desliga** o aparato fotografico e escreve um prompt de direcao de arte — meio, tecnica, paleta, linha, acabamento. |

Por que isso importa: pedir "grao de filme Kodak 5219 e poros na pele" numa ilustracao flat empurra
o modelo de volta para o fotorrealismo e estraga o resultado. Se voce quer algo **nao realista**,
diga isso — "ilustracao", "estilizado", "sem ser foto" — e o sistema muda de rota sozinho.

Se voce so quer um **humor** diferente ("cinematografico", "look anos 70", "dramatico"), continua
sendo modo realista. O que troca o modo e o **meio**, nao o clima.

---

## 4. MAPA DOS ARQUIVOS

| Arquivo | Para que serve |
|---|---|
| [CLAUDE.md](CLAUDE.md) | As instrucoes que o sistema segue (voce nao precisa ler) |
| [imageprompts.md](imageprompts.md) | Inteligencia principal: roteamento, direcao de fotografia, formato do prompt, 7 setups de iluminacao |
| [stylized.md](stylized.md) | Playbook do modo nao-realista (ilustracao, 3D, cartoon, vetor, aquarela...) |
| [providers.md](providers.md) | Camada de render: Higgsfield CLI ou Magnific MCP, setup e contrato comum |
| [scripts/render_image.py](scripts/render_image.py) | Executor: `check-providers`, `render`, `save-external` |
| [.mcp.json](.mcp.json) | Declara o servidor Magnific para quem abrir o Claude Code nesta pasta |

---

## 5. PROBLEMAS COMUNS

**"Higgsfield CLI nao encontrado"** — rode `npm install -g @higgsfield/cli`.

**"precisa de login"** — rode `higgsfield auth login`. Abre o navegador.

**As ferramentas do Magnific nao aparecem** — confirme que o servidor foi adicionado
(`claude mcp add ...`), reabra a sessao e autorize o login do Magnific quando ele pedir.

**Nenhum dos dois instalado** — o sistema ainda escreve e salva o `prompt.txt` e o `brief.txt`.
Ele nao inventa render nem promete arquivo que nao existe.

**Pedi ilustracao e veio foto** — diga explicitamente "ilustracao 2D" ou "nao realista". Os
gatilhos completos estao na secao 2 de [stylized.md](stylized.md).

**Resolucao maxima** — o render aceita `1k`, `2k` e `4k`. Nao existe `8k`. O padrao recomendado e
`2k`; `4k` custa mais e, dependendo do modelo, deixa a imagem mais plastica.
