# Estrutura — Cartelas (Seedance)

**Quando usar:** quando a mensagem é uma sequência de frases curtas. Manifesto, lançamento, contagem de benefícios, "3 motivos para", antes/depois.

**Funciona em qualquer estilo.** A cartela pode ser 2D flat, colagem, 3D com tipografia no espaço, foto com texto por cima ou ilustração — o que muda é o vocabulário, não a estrutura.

> **Leia `00-estilos.md` antes de preencher.** Os campos `[STYLE]`, `[CAMERA]` e `[SOUND]` vêm de lá.

**A imagem base** deve conter o sistema visual completo de uma cartela: fundo, blocos, elementos gráficos e — se houver — a primeira frase já composta. As cartelas seguintes reusam esse sistema com outro texto.

**O que sobe junto no Seedance:**
1. `output/{slug}/01-frame/frame-XX.png` — a cartela base aprovada
2. `assets/logo/logo.png` — o logo, **arquivo separado**

---

## Prompt

```
Animate a [15]-second card-sequence motion-graphics piece from the attached
image(s). [CAMERA: static camera], [STYLE: vocabulário do estilo escolhido].
Never redraw, change or reinterpret the design system — keep the exact
colors, shapes, type style and proportions of the attached image. Snappy
easing with slight overshoot on every entrance.

CARD 1 (0:00 – 0:04):
- Start on the empty background only, hold briefly.
- The colored blocks and graphic shapes slide into place one by one.
- The text "[FRASE 1]" animates in word by word with a quick slide + settle,
  in the exact type style of the attached image.
- Hold the completed card, matching image 1 exactly.

TRANSITION (at 0:04):
- The text exits first, then the blocks slide out in a single direction,
  wiping the frame clean as the next card's blocks slide in behind them.

CARD 2 (0:04 – 0:08):
- Same design system, same block choreography.
- The text "[FRASE 2]" animates in the same way.
- Hold.

TRANSITION (at 0:08): same wipe, opposite direction.

CARD 3 (0:08 – 0:12.5):
- Same design system.
- The text "[FRASE 3]" animates in the same way.
  [IF ELEMENTO] [descreva o elemento que entra: produto, ícone, número]
  slides in and settles beside the text.
- Hold.

OUTRO (0:12.5 – 0:15):
- Everything exits in one clean sweep, leaving only the background.
- The brand logo from the attached logo image pops in at the center with a
  small overshoot and holds until the end.
  [IF CTA] Below it, the line "[CTA / SITE]" fades in.

SOUND (always on):
- [SOUND: caráter do estilo] — a short swish on each block slide, a soft
  [click/tap/thud] as each word settles into place.
- A steady rhythmic bed with a clear pulse — the card changes land on the beat.
- A tight whoosh on every card transition, same character each time.
- A single confident impact on the logo pop, then a short tail.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. [No camera movement,] no added
elements, consistent rhythm across all cards.
[TRAVA DO ESTILO — copie de 00-estilos.md]
```

---

## As travas que não se mexe

- `Never redraw, change or reinterpret the design system` — garante que as cartelas 2 e 3 sejam a mesma arte com outro texto, não outra arte.
- `in the exact type style of the attached image` — sem isso a tipografia muda a cada cartela.
- `same block choreography` — a repetição é o que faz virar sistema. Cartela que anima diferente a cada tela parece erro.
- `No voiceover, no dialogue, no lyrics, no stock-music swell` — o áudio é sempre ligado, e sem essa linha o modelo enfia locução ou trilha cantada por cima das cartelas.
- `Total duration exactly N seconds` — igual às outras estruturas.
- **A trava do estilo**, copiada de `00-estilos.md`.

**Câmera:** parada em praticamente todo estilo — cartela existe para ser lida, e câmera se movendo atrapalha a leitura. A exceção é cartela 3D, onde um drift lento entre as telas dá volume. Se usar, remova `No camera movement`.

## Ritmo por número de cartelas

| Cartelas | Tempo por cartela (em 15s) | Outro |
|---|---|---|
| 2 | 6,0s | 3,0s |
| 3 | 4,2s | 2,4s |
| 4 | 3,2s | 2,2s |
| 5 | 2,5s | 2,5s |

Acima de 5 cartelas em 15s a leitura quebra. Se a pessoa tiver mais mensagens, corte o texto ou aumente a duração.

## Regra do texto

Frase de cartela: **no máximo 6 palavras**. Se a frase que a pessoa deu for maior, proponha a versão curta — não encurte por conta própria sem mostrar.
