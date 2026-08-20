# Estrutura — Build-up em camadas (Seedance)

**Quando usar:** quando a cena tem vários elementos que podem entrar um a um. Ótimo para processo, jornada, "como funciona", passo a passo.

**Funciona em qualquer estilo** — 2D flat, colagem, 3D, mixed media, ilustração. Só evite em realista puro: foto não se desmonta em camadas sem o modelo redesenhar rosto e produto.

> **Leia `00-estilos.md` antes de preencher.** Os campos `[STYLE]`, `[CAMERA]`, `[MOTION VERBS]` e `[SOUND]` vêm de lá. Este arquivo é a **estrutura**; o estilo entra por cima.

---

## Prompt

Substitua o que está entre colchetes, apague as linhas `[IF ...]` que não usar.

```
Animate a [15]-second layered motion-graphics piece from the attached
image(s). [CAMERA: static camera / slow push-in], [STYLE: vocabulário do
estilo escolhido]. Never redraw, change or reinterpret the elements — only
reveal, move and remove them in stages. Snappy easing with slight overshoot
on every entrance.

SCENE 1 (0:00 – 0:07.5) — Build-up from image 1:
- Start on the empty background only, hold briefly.
- The large background shapes/panels/surfaces [MOTION VERBS] into place one
  by one.
- The figures/objects enter one at a time from the edges, [MOTION VERBS]
  into their final positions, each landing with a small bounce.
- The detail layer arrives last: [grafismos do estilo — dashed arrows
  tracing their paths, numbered markers, particles, linework drawing
  itself on].
- Hold the completed frame, matching image 1 exactly.

TRANSITION (at 0:07.5):
- The composition breaks apart into its separate layers: elements slide,
  scatter and fly off in different directions, and as they clear the
  screen the elements of scene 2 fly in through them, so one scene
  disassembles while the next assembles — a continuous, fluid handoff.

SCENE 2 (0:07.5 – 0:13) — Build-up of the second composition:
- [DESCREVA A SEGUNDA TELA: mesma cena reorganizada / close num elemento /
  novo arranjo dos mesmos objetos]
- Same logic: background first, then figures one by one, then the detail
  layer.
- [IF TEXT] The text "[SUA FRASE AQUI]" animates in, appearing word by
  word with a quick slide + settle, integrated into the composition in
  the same style.
- Hold the completed frame.

OUTRO (0:13 – 0:15):
- All elements exit the screen quickly in scattered directions (reverse of
  how they entered), leaving only the clean background.
- The brand logo from the attached logo image pops in at the center with a
  small overshoot and holds until the end.
  [IF CTA] Below it, the line "[CTA / SITE]" fades in.

SOUND (always on):
- [SOUND: caráter sonoro do estilo — foley de papel / clicks digitais /
  whoosh com corpo e graves] on every entrance, [tap/click/thud] as each
  element lands.
- A [light and playful / restrained / weighty] rhythmic bed underneath, low
  in the mix, following the tempo of the build-up.
- One clean whoosh sweep across the transition at [0:07.5].
- A single soft impact on the logo pop, then let it ring out.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. [No camera movement,] no added
elements, energetic but clean rhythm throughout.
[TRAVA DO ESTILO — copie de 00-estilos.md]
```

---

## As travas que não se mexe

- `Never redraw, change or reinterpret the elements` — sem isso o modelo redesenha os elementos a cada frame e a arte derrete. **Vale em todo estilo.**
- `only reveal, move and remove them in stages` — define o vocabulário: entrada, deslocamento, saída. Nada de morphing.
- `matching image 1 exactly` — obriga a cena 1 a pousar exatamente na imagem aprovada.
- `Total duration exactly N seconds` — sem isso o corte vem torto.
- `no added elements` — impede que o modelo invente objeto que não estava na arte.
- `No voiceover, no dialogue, no lyrics, no stock-music swell` — o áudio é sempre ligado neste projeto, e sem essa linha o modelo enfia locução genérica ou trilha cantada. Som aqui é foley e ritmo, não narração.
- **A trava do estilo**, copiada de `00-estilos.md`. É ela que impede a peça 2D de ganhar sombra realista, ou a peça 3D de virar desenho.

## A câmera depende do estilo

| Estilo | Câmera |
|---|---|
| 2D flat, colagem, ilustração | **Parada.** Mantenha `No camera movement`. |
| Mixed media | Parada, ou push-in bem lento. |
| 3D | Pode ter um push-in ou drift lento durante o build-up. Remova `No camera movement` se usar. |

Em arte chapada, câmera que se move parece erro de render. Em 3D, câmera parada joga o estilo fora.

## Ritmo padrão para 15s

| Bloco | Tempo | Proporção |
|---|---|---|
| Cena 1 (build-up) | 0:00 – 0:07.5 | 50% |
| Transição | em 0:07.5 | instantânea |
| Cena 2 | 0:07.5 – 0:13 | 37% |
| Outro + logo | 0:13 – 0:15 | 13% |

Para outra duração, mantenha as proporções e recalcule. O outro nunca abaixo de 1,5s — o logo precisa respirar.

## Variações de ritmo

- **Mais energia:** troque `energetic but clean rhythm` por `fast, punchy rhythm with tight timing between entrances`.
- **Mais calma:** `calm, deliberate rhythm with generous holds between stages`.
- **Sem segunda tela:** apague TRANSITION e SCENE 2, estenda a cena 1 até 0:12.5 e mantenha o outro.
