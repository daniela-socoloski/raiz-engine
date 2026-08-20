# COMECE AQUI — Human Carrossel

Esta pasta cria **carrosséis de Instagram**. Duas frentes:

```
   AVULSO                              ROTINA DIÁRIA
   ┌──────────────────┐                ┌──────────────────┐
   │  Você dá o tema  │                │  O sistema varre │
   │  ou cola o texto │                │  notícias sozinho│
   └────────┬─────────┘                └────────┬─────────┘
            │                                   │
            └───────────────┬───────────────────┘
                            ▼
                 9 slides prontos pra postar
```

O sistema faz o trabalho pesado: pesquisa o assunto, escolhe o ângulo editorial, escreve a
headline, monta a arquitetura narrativa dos 9 slides, gera a legenda e renderiza as imagens.

---

## Como começar

**Abra o Claude Code nesta pasta e diga "vamos começar".**

Na primeira vez o sistema faz algumas perguntas curtas sobre a marca — nome, @, cor, nicho,
audiência, voz. Uma pergunta de cada vez. Isso é o que deixa o carrossel com a sua cara em vez
de genérico.

Depois disso você pode pedir direto:

- *"faz um carrossel sobre bicicletas elétricas em São Paulo"*
- *"transforma esse texto aqui em carrossel"* (e cola o texto)
- *"quero falar sobre o novo modelo de trabalho híbrido"*

Você **não precisa** saber estruturar carrossel. Entrada simples é sinal de que o sistema tem
que fazer o trabalho pesado — não de que você deu um briefing fraco.

---

## Antes do primeiro uso

Para o carrossel avulso, uma coisa só:

```bash
npm install -g @higgsfield/cli
```

```bash
higgsfield auth login
```

O modelo usado nos slides é o **GPT Image 2** (`gpt_image_2`) — não é o mesmo das outras
pastas Human, e é de propósito: os slides têm texto e lettering renderizados junto da imagem,
e esse modelo é o que acerta tipografia.

**Para a rotina diária automatizada** (o sistema montando o carrossel do dia sozinho) você
também vai precisar de Notion e Google Drive conectados no Claude Desktop. Mas isso é opcional
e só entra quando você pedir — não precisa configurar nada disso para fazer o primeiro
carrossel.

---

## O que sai no final

```
human-output/carrossel/{nome-do-projeto}/
├── brief.md              O tema, o ângulo escolhido e a estrutura
├── legenda.txt           A legenda do post
├── slides/
│   ├── slide-01.png      ← a capa
│   ├── slide-02.png
│   └── ...  até slide-09.png
├── prompts/              Os prompts usados em cada slide
└── _logs/
```

A capa é gerada primeiro. Os outros 8 slides usam a capa como referência — é isso que faz o
carrossel inteiro parecer uma peça só, e não 9 imagens soltas.

---

## A pasta por dentro

Você não precisa abrir nenhum destes arquivos. O sistema lê o que precisa, na hora que precisa.

| Arquivo | O que é |
|---|---|
| `COMECE-AQUI.md` | ← você está aqui |
| `CLAUDE.md` | As instruções que o sistema segue |
| `00-README.md` | A arquitetura completa do sistema |
| `01`–`11` | O cérebro editorial e visual: identidade, fontes, manual editorial, engine de headlines, arquitetura narrativa, design system, referências |
| `12`, `13` | As duas rotinas automatizadas (News Scout e Carousel Creator) |
| `14-Input-Proprio.md` | O modo avulso — carrossel a partir de tema ou texto seu |
| `15-Como-usar.md` | Os cenários do dia-a-dia |
| `16-Troubleshooting.md` | Quando algo dá errado |

---

## Travou?

Diga `ajuda` no Claude Code. Se deu erro em alguma geração, diga o que aconteceu — o sistema
consulta o troubleshooting sozinho e te dá o próximo passo.

---

**Pronto. Abre o Claude Code aqui e diz "vamos começar".**
