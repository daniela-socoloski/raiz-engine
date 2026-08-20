---
name: ads-produto
description: Transforma uma foto amadora de celular de um produto num anúncio vertical 9:16 de 15 segundos, pronto pra rodar. O fluxo é hero-first — o agente analisa o produto (material, categoria, estética, potencial de campanha), propõe 3 caminhos criativos, gera UMA imagem hero com Nano Banana, você aprova, e só então ele deriva 4 variações ancoradas nessa hero (mesma cena, luz e paleta, ângulos diferentes). Os 5 frames viram 5 takes animados em paralelo no Seedance 2.0 e são montados em ffmpeg num MP4 de 15 segundos exatos. Use SEMPRE que o usuário pedir "anúncio do meu produto", "ad de 15 segundos", "vídeo vertical pra TikTok/Reels/Shorts", "transformar foto de produto em vídeo", "campanha em vídeo", "product ad", "vertical ad", ou colar/apontar uma foto de produto e pedir um anúncio ou vídeo. Use também quando ele só disser "tenho uma foto feia do meu produto, quero um anúncio top" ou "transforma isso num ad".
---

# Ads Produto — foto de celular → ad vertical de 15s

O usuário joga uma foto amadora de um produto numa pasta. Você devolve um MP4 vertical de 15 segundos que vende o produto: cinematográfico, dinâmico, com ângulos diferentes e **consistência total do produto**.

## A ideia central: a hero é a âncora

Gerar 5 imagens soltas de uma vez dá 5 universos diferentes. Aqui não:

1. Você gera **1 hero** a partir da foto original → o usuário aprova.
2. As **4 variações** nascem da **própria hero como imagem de referência** (`--image hero.png`). Herdam cena, luz, paleta, grade e textura — só a **câmera** muda.

Consistência travada de verdade, não na esperança.

## Motores

| Etapa | Modelo | Por quê |
|---|---|---|
| Hero + 4 variações | **Nano Banana 2** (`nano_banana_flash`) | fidelidade de produto e de rótulo |
| Animação dos 5 takes | **Seedance 2.0** (`seedance_2_0`) | 5s por take, 1080p, 9:16, sem áudio |
| Montagem | **ffmpeg** | corta cada take pra 3s e fecha **15s exatos** |

O ad sai **mudo** (`--generate_audio false`). Trilha, se houver, entra depois — 5 áudios independentes colados soam como cinco cortes.

**Duração é contrato.** O ad vai rodar em plataformas de anúncio, então o final tem **15,000s exatos**, não "por volta de 15". O Seedance gera takes de 5s; o `stitch.sh` corta cada um pra 3,0s e concatena. Os 2s descartados por take são margem: modelos de vídeo derrapam nas pontas, e você fica com o miolo bom.

---

## Antes de tudo: leia [references/operacao.md](references/operacao.md)

Armadilhas de execução que **já** custaram tempo e crédito: teto de 10 minutos do shell que mata downloads pagos, `jobs -p` que não espera nada em shell não-interativo, wrapper que reporta "completed" com o trabalho ainda rodando, e quando não vale recuperar job órfão. Leia antes de disparar qualquer lote.

## Modo multi-campanha (várias direções de uma vez)

Se o usuário quiser **mais de um ad** do mesmo produto, não rode o fluxo N vezes em série:

```
output/
├── 01-direcoes.md
├── ads/
│   ├── _comum/{produto.txt, tags.txt}   ← blocos reusados por todas as campanhas
│   ├── 01-<slug>/{prompts,02-hero,03-sequencia,04-takes,05-final}
│   └── 02-<slug>/...
└── FINAL/<slug>.mp4                      ← a entrega, um MP4 por campanha
```

**Paralelize dentro de cada etapa, mas mantenha os checkpoints em lote:** N heros de uma vez → mostre as N juntas → aprovação única → 4N variações em paralelo → mostre → 5N takes em paralelo → monte todos. O usuário não perde controle criativo e ganha a velocidade.

Some o custo antes (`higgsfield generate cost`) e diga o total. Se couber folgado no saldo, siga sem perguntar.

## Etapa 0 — Preflight

Nunca gere sem isso. Ele checa CLI logada, ffmpeg/jq, e a foto em `input/`:

```bash
bash ~/.claude/skills/ads-produto/scripts/preflight.sh .
```

Se o Higgsfield não estiver logado, peça pro usuário rodar `higgsfield auth login`. Se houver mais de uma foto em `input/`, pergunte qual usar. Se `input/` estiver vazio, peça a foto e **pare**.

## Estrutura de pastas

```
./
├── input/                        ← a foto do produto
└── output/
    ├── 01-direcoes.md            ← as 3 direções criativas
    ├── prompts/
    │   ├── look-spine.txt        ← a assinatura visual da campanha
    │   ├── hero.txt
    │   ├── variacoes.txt         ← 4 linhas
    │   └── movimento.txt         ← 5 linhas
    ├── 02-hero/hero.png
    ├── 03-sequencia/             ← 01-hook 02-reveal 03-detail 04-action 05-hero
    ├── 04-takes/                 ← 5 MP4 de 3s
    └── 05-final/ad-15s.mp4       ← a entrega
```

---

## O fluxo — 6 etapas, 3 checkpoints

### Etapa 1 — Análise + 3 direções  ·  **Checkpoint 1**

Leia a foto com a tool Read (você enxerga imagens). Analise **em silêncio**: tipo de produto, material e acabamento, categoria, formato e proporções, paleta, contexto de uso, persona de marca provável, potencial de campanha. Não despeje a análise no chat — é insumo pros prompts, não conteúdo pro usuário.

Escreva 3 direções em `output/01-direcoes.md`. Cada uma com:

- **Nome** curto e evocativo (1–3 palavras)
- **Mood** em 1 frase — o que o espectador sente
- **Paleta + atmosfera** — luz, cores dominantes, textura
- **Cenário** — onde/contra o quê o produto está
- **Por que combina** com este produto, em 1 frase

As 3 têm que ser **realmente distintas** — não 3 variações do mesmo studio shot. Eixos pra diversificar: ambiente (studio fechado / locação real / surreal), paleta (mono escuro / saturado vibrante / natural quente), energia (contemplativa / dinâmica / ritualística), estilo (editorial fashion / tech-minimal / artesanal documental).

Mostre as 3 de forma concisa no chat e **pare**. Pergunte qual ele quer, ou se quer ajustar. **Não decida sozinho** — o controle criativo é dele.

### Etapa 2 — Gerar a HERO  ·  **Checkpoint 2**

A hero é a imagem principal da campanha e a âncora de tudo. Capriche.

1. Leia **[references/prompt_grammar.md](references/prompt_grammar.md)** — tags base, bloco PREMIUM, LOOK SPINE, esqueletos e armadilhas. Leia antes de escrever o primeiro prompt.
2. Defina o **LOOK SPINE** da campanha a partir da direção escolhida e salve em `output/prompts/look-spine.txt`. Esse bloco vai **verbatim** nos 5 prompts.
3. Escreva `output/prompts/hero.txt` seguindo o esqueleto da hero.
4. Gere:

```bash
bash ~/.claude/skills/ads-produto/scripts/gen_hero.sh \
  input/<foto> output/prompts/hero.txt output/02-hero/hero.png
```

Mostre a hero no chat (Read) e **pare**. Rode o checklist da referência antes de mostrar — se o produto não estiver fiel, regere você mesmo antes de gastar o tempo do usuário. Só siga com hero aprovada: tudo herda dela, inclusive os defeitos.

### Etapa 3 — Derivar as 4 variações  ·  **Checkpoint 3**

A hero fecha a sequência, então ela vira o frame 05:

```bash
mkdir -p output/03-sequencia && cp output/02-hero/hero.png output/03-sequencia/05-hero.png
```

Escreva 4 prompts em `output/prompts/variacoes.txt` (ordem: hook, reveal, detail, action — 1 linha por prompt, `#` é comentário), cada um seguindo o **esqueleto de variação**. Os papéis de cada shot estão em **[references/sequencia_e_movimento.md](references/sequencia_e_movimento.md)**.

```bash
bash ~/.claude/skills/ads-produto/scripts/gen_variations.sh \
  output/02-hero/hero.png output/prompts/variacoes.txt output/03-sequencia
```

Roda as 4 em paralelo. **Abra os 5 e compare entre si antes de mostrar** — a falha mais comum deste fluxo é o modelo reproduzir o enquadramento da hero quando a instrução de câmera é branda, e você acabar com 3 ou 4 planos iguais. Está tratado em "A armadilha da âncora" na referência de prompt: negue o enquadramento da referência explicitamente e descreva a câmera por posição física, nunca por adjetivo.

Depois mostre os 5 no chat **na ordem da timeline** e **pare**.

> **Regeração:** frame isolado errado → regere só ele (`names_csv` com um nome só). Colidiu com a hero → regere a `04-action`, nunca a `05-hero`. Look todo errado → volte pra Etapa 2; mudar a hero muda a âncora de todos.

### Etapa 4 — Animar os 5 takes (Seedance 2.0)

Escreva `output/prompts/movimento.txt` — 5 linhas, ordem `01-hook … 05-hero`. Cada linha descreve **só o movimento**; a cena já está no frame. Direções por take, o **bloco de trava anti-deformação** (obrigatório nos 5) e as regras de consistência de animação estão em [references/sequencia_e_movimento.md](references/sequencia_e_movimento.md).

Escreva pensando nos **3s que vão sobrar** de cada take, não nos 5 gerados.

```bash
bash ~/.claude/skills/ads-produto/scripts/gen_takes.sh \
  output/03-sequencia output/prompts/movimento.txt output/04-takes
```

5 takes em paralelo, 5s cada, 1080p, 9:16, mudo. O script reporta a duração real de cada take ao baixar.

### Etapa 5 — Montar o ad (15s exatos)

```bash
ANCHOR_OVERRIDES="01-hook:start" bash ~/.claude/skills/ads-produto/scripts/stitch.sh \
  output/04-takes output/05-final/ad-15s.mp4
```

Corta cada take de 5s pra 3,0s e concatena na ordem da timeline. O `ANCHOR` decide qual pedaço sobrevive: default `end` (onde o movimento resolve), com o hook em `start` (o gancho precisa do arranque). O script imprime take a take o que cortou e confere a duração final.

Se um take ficou bom só num trecho específico, ajuste o anchor dele em vez de regerar — é grátis e instantâneo.

### Etapa 6 — Entrega

Reporte curto:

- Caminho do `ad-15s.mp4`
- Duração, resolução, codec, tamanho (o script já roda `ffprobe`)

Não escreva um resumo do processo — o usuário acabou de vivê-lo.

---

## Princípios que não se quebram

1. **O produto é o rei.** Em todos os frames ele é fiel ao original (forma, logo, cor, rótulo, proporção), impecável — sem arranhão, poeira, digital ou desgaste — e o elemento mais nítido e dominante. É propaganda: tem que estar lindão. Ângulos podem ser ousados; o produto, nunca.
2. **Premium é parecer fotografado.** O produto tem que parecer caro, novo e **real**. O inimigo não é a foto feia de origem — é o render limpo demais, que cheira a CGI. O bloco PREMIUM da referência existe pra isso e vai em todo prompt de imagem.
3. **O produto não deforma na animação.** Modelos de vídeo derretem geometria e reescrevem rótulo. O bloco de trava anti-deformação vai nos 5 prompts de movimento, sem exceção.
4. **15,000s exatos.** É ad, a duração é contrato. Confira o número que o `stitch.sh` imprime no fim.
5. **Trava de rótulo literal.** Produto de marca: transcreva o rótulo palavra por palavra em todo prompt. Se um limite de caracteres conflitar com isso, o limite cede.
6. **A hero é a âncora.** Se ela não está excelente, não avance. E ela nunca é a que você regere para resolver colisão.
7. **Consistência > novidade, mas repetição > nada.** Os 5 frames são um filme só (mesmo LOOK SPINE verbatim), porém **planos parecidos são um defeito**: no corte viram uma emenda esquisita. Compare os 5 entre si antes de animar.
8. **Pense como vídeo desde o still.** Cada frame nasce como o primeiro frame de um take: deixe respiro pro movimento e mantenha o produto legível o tempo todo.
9. **Take 1 ganha ou perde o ad.** Se o hook não para o scroll, o resto não importa.
10. **9:16 desde a origem.** Nunca gere em outro formato pra cortar depois.
11. **Paralelize geração, serialize aprovação.** Variações e takes rodam em paralelo; os checkpoints são sequenciais e do usuário.
12. **Nunca gaste crédito num frame duvidoso.** Um take custa ~22x uma imagem.
13. **Diga o que você não conferiu.** Se não abriu todos os frames, liste quais ficaram de fora. Silêncio aqui vira surpresa ruim na entrega.

## Quando NÃO usar

- Vídeo horizontal ou quadrado, mais longo que 15s, ou com locução — outro fluxo.
- Só editar uma foto, sem virar vídeo.
- Ad que exige uma pessoa real e específica — o modelo aluciná pessoas.

## Recursos

- [scripts/preflight.sh](scripts/preflight.sh) — checa tudo antes de gastar crédito
- [scripts/gen_hero.sh](scripts/gen_hero.sh) — a hero, a partir da foto original
- [scripts/gen_variations.sh](scripts/gen_variations.sh) — as 4 variações ancoradas na hero (paralelo)
- [scripts/gen_takes.sh](scripts/gen_takes.sh) — os 5 takes no Seedance 2.0 (paralelo)
- [scripts/stitch.sh](scripts/stitch.sh) — corta os takes e monta o ad em 15s exatos
- [scripts/lib.sh](scripts/lib.sh) — funções compartilhadas (não execute direto)
- [references/prompt_grammar.md](references/prompt_grammar.md) — **fonte da verdade** dos prompts de imagem: tags base, LOOK SPINE, esqueletos, checklist, armadilhas
- [references/sequencia_e_movimento.md](references/sequencia_e_movimento.md) — papéis dos 5 shots, ordem da timeline, direção de movimento por take
- [references/operacao.md](references/operacao.md) — **leia antes de qualquer lote**: paralelismo em bash, teto de 10 min, jobs órfãos, custos, e por que o corte é por frame
