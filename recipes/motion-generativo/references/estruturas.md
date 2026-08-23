# Estruturas — os quatro prompts de motion

A estrutura é **derivada de `ScenePlan[]`**, não perguntada. Os quatro formatos
abaixo são o esqueleto do prompt; o estilo entra por cima, vindo de
[estilos.md](estilos.md).

Substitua o que está entre colchetes e apague as linhas `[IF …]` que não usar.
Timecodes saem de `ScenePlan.startFrame` / `endFrame` convertidos por
`MotionEnvelope.fps` — nunca são inventados aqui.

## As três travas universais

Aparecem em toda estrutura. É isto que separa um motion controlado de um vídeo
de IA que derrete:

1. **`Never redraw, change or reinterpret the elements`** — ou a variante da
   estrutura de câmera. Sem isso o modelo refaz a arte a cada frame.
2. **`Total duration exactly N seconds`** — sem isso o corte vem torto.
3. **A trava do estilo**, copiada de [estilos.md](estilos.md).

A câmera **não** é trava universal: parada em 2D, colagem, cartelas e
ilustração; livre em 3D e realista.

E todas fecham igual: **o logo entra no outro**, vindo do arquivo separado.

---

## Camadas

**Quando:** as cenas do plano mostram elementos que **convivem** na mesma tela,
entrando aos poucos. Processo, jornada, "como funciona", passo a passo.

**Evite em realista puro:** foto não se desmonta em camadas sem o modelo
redesenhar rosto e produto.

```text
Animate a [15]-second layered motion-graphics piece from the attached
image(s). [CAMERA], [STYLE]. Never redraw, change or reinterpret the
elements — only reveal, move and remove them in stages. Snappy easing with
slight overshoot on every entrance.

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
- [SEGUNDA TELA: mesma cena reorganizada / close num elemento / novo
  arranjo dos mesmos objetos]
- Same logic: background first, then figures one by one, then the detail
  layer.
- [IF TEXT] The text "[FRASE]" animates in, appearing word by word with a
  quick slide + settle, integrated into the composition in the same style.
- Hold the completed frame.

OUTRO (0:13 – 0:15):
- All elements exit the screen quickly in scattered directions (reverse of
  how they entered), leaving only the clean background.
- The brand logo from the attached logo image pops in at the center with a
  small overshoot and holds until the end.
  [IF CTA] Below it, the line "[CTA / SITE]" fades in.

SOUND (always on):
- [SOUND] on every entrance, [tap/click/thud] as each element lands.
- A [light and playful / restrained / weighty] rhythmic bed underneath, low
  in the mix, following the tempo of the build-up.
- One clean whoosh sweep across the transition at [0:07.5].
- A single soft impact on the logo pop, then let it ring out.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. [No camera movement,] no added
elements, energetic but clean rhythm throughout.
[TRAVA DO ESTILO]
```

**Travas próprias:**

- `only reveal, move and remove them in stages` — define o vocabulário: entrada,
  deslocamento, saída. Nada de morphing.
- `matching image 1 exactly` — obriga a cena 1 a pousar na imagem aprovada.
- `no added elements` — impede o modelo de inventar objeto fora da arte.

**Ritmo padrão para 15s** — para outra duração, mantenha as proporções:

| Bloco | Tempo | Proporção |
|---|---|---|
| Cena 1 (build-up) | 0:00 – 0:07.5 | 50% |
| Transição | em 0:07.5 | instantânea |
| Cena 2 | 0:07.5 – 0:13 | 37% |
| Outro + logo | 0:13 – 0:15 | 13% |

O outro nunca abaixo de 1,5s — o logo precisa respirar.

**Variações:** mais energia → `fast, punchy rhythm with tight timing between
entrances`. Mais calma → `calm, deliberate rhythm with generous holds between
stages`. Sem segunda tela → apague `TRANSITION` e `SCENE 2`, estenda a cena 1
até 0:12.5.

---

## Cartelas

**Quando:** as cenas do plano **se substituem**, cada uma com uma frase curta.
Manifesto, lançamento, "3 motivos para", antes/depois.

A imagem base traz o sistema visual completo de **uma** cartela: fundo, blocos,
hierarquia tipográfica. As seguintes reusam o sistema com outro texto.

```text
Animate a [15]-second card-sequence motion-graphics piece from the attached
image(s). [CAMERA: static camera], [STYLE]. Never redraw, change or
reinterpret the design system — keep the exact colors, shapes, type style
and proportions of the attached image. Snappy easing with slight overshoot
on every entrance.

CARD 1 (0:00 – 0:04):
- Start on the empty background only, hold briefly.
- The colored blocks and graphic shapes slide into place one by one.
- The text "[FRASE 1]" animates in word by word with a quick slide +
  settle, in the exact type style of the attached image.
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
  [IF ELEMENTO] [produto / ícone / número] slides in and settles beside
  the text.
- Hold.

OUTRO (0:12.5 – 0:15):
- Everything exits in one clean sweep, leaving only the background.
- The brand logo from the attached logo image pops in at the center with a
  small overshoot and holds until the end.
  [IF CTA] Below it, the line "[CTA / SITE]" fades in.

SOUND (always on):
- [SOUND] as the blocks slide in, a soft tap as each one lands.
- A steady rhythmic bed underneath, low in the mix.
- One clean sweep on each card transition.
- A single soft impact on the logo pop, then let it ring out.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. No camera movement, no added
elements, no change to the design system.
[TRAVA DO ESTILO]
```

**Trava própria:** `keep the exact colors, shapes, type style and proportions` —
é o que faz as três cartelas parecerem o mesmo sistema, e não três peças.

---

## Imagem + texto

**Quando:** existe uma imagem forte e a tipografia entra por cima. Campanha,
frase de impacto, oferta.

**É a melhor estrutura para realista/fotográfico:** a cena fica intacta e só a
tipografia se move — que é exatamente o que protege uma foto de ser redesenhada.

A imagem base é a cena limpa, **sem texto e sem logo**.

```text
Animate a [15]-second motion-graphics piece from the attached image(s).
[CAMERA: static camera / very slow push-in], [STYLE]. Never redraw, change
or reinterpret the image — the scene stays exactly as attached. Only the
typography and graphic elements move. Snappy easing with slight overshoot
on every entrance.

SCENE 1 (0:00 – 0:06) — Image and headline:
- Start on the attached image, already composed, holding still.
- [IF REVEAL] A soft wipe reveals the image from [direction] over the first
  0.4 seconds.
- The headline "[HEADLINE]" animates in over the image, word by word with a
  quick slide + settle, positioned at [top / bottom / left third].
- [IF UNDERLINE] A thin line draws itself under the headline.
- Hold the completed frame.

TRANSITION (at 0:06):
- The headline exits in the direction it came from as the image shifts to
  the second composition described below — a continuous handoff, no cut to
  black, no fade to white.

SCENE 2 (0:06 – 0:12.5) — Second composition:
- [SEGUNDA TELA: mesmo enquadramento com o produto isolado / crop fechado
  num detalhe / a mesma cena com blocos de cor entrando]
- [IF TEXT] The line "[FRASE 2]" animates in the same way as the headline.
- [IF ELEMENTO] [produto / selo / preço / ícone] slides in and settles at
  [posição], landing with a small bounce.
- Hold the completed frame.

OUTRO (0:12.5 – 0:15):
- All typography and graphic elements exit quickly; the image itself
  scales down and clears the frame.
- The brand logo from the attached logo image pops in at the center with a
  small overshoot and holds until the end.
  [IF CTA] Below it, the line "[CTA / SITE]" fades in.

SOUND (always on):
- [SOUND] under the scene, held low and continuous.
- A short swish as each line of typography enters, a soft tap as it settles.
- One clean sweep across the transition at [0:06].
- A single soft impact on the logo pop, then let it ring out.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. No added elements, no change to the
photographic content.
[TRAVA DO ESTILO]
```

**Trava própria:** `Only the typography and graphic elements move`. Em peça
realista, some com ela e o modelo começa a animar dentro da foto — relight,
paralaxe falsa, rosto redesenhado.

---

## Câmera

**Quando:** o assunto é **um objeto ou uma cena no espaço** e a graça está em vê-lo
de vários ângulos. Reveal de produto, turntable, órbita, arquitetura.

**Só em 3D render e realista.** Câmera orbitando arte chapada quebra o estilo.

```text
Animate a [15]-second product/scene reveal from the attached image(s).
[STYLE]. The subject, its materials, its proportions and the lighting setup
never change — only the camera and the secondary elements move. Smooth,
weighted camera motion with gentle acceleration and deceleration, no jitter.

SHOT 1 (0:00 – 0:05) — Arrival:
- Open on [close detail of the subject / the empty set / a tight crop],
  [slow push-in / slow drift].
- The camera settles on the composition of image 1, matching it exactly.
- [IF ELEMENTOS] [rings / panels / particles / secondary objects] settle
  into their positions around the subject.

SHOT 2 (0:05 – 0:11) — The turn:
- The camera [orbits slowly around the subject, left to right, roughly
  [120] degrees / cranes up and over / arcs from front to three-quarter],
  keeping the subject centered and in focus.
- Light travels across the surfaces as the angle changes, revealing
  [material: texture, specular highlights, translucency].
- [IF TEXT] The line "[FRASE]" fades in at [posição], locked to the frame,
  not to the 3D space.
- [IF SEGUNDO ÂNGULO] The camera settles on the composition of image 2,
  matching it exactly.

SHOT 3 (0:11 – 0:13) — Hero hold:
- The camera comes to rest on the strongest angle and holds, perfectly
  still.

OUTRO (0:13 – 0:15):
- The subject and secondary elements [fade / recede / drift out of frame],
  leaving the clean background.
- The brand logo from the attached logo image appears at the center with a
  soft scale-in and holds until the end.
  [IF CTA] Below it, the line "[CTA / SITE]" fades in.

SOUND (always on):
- [SOUND — low sustained bed with body / room ambience], rising subtly as
  the camera turns.
- A soft airy whoosh tied to the camera movement, never cartoonish.
- Fine material detail: [a light ceramic tick / a metallic shimmer / cloth
  rustle] as surfaces catch the light.
- A single resonant impact on the logo, with a long tail.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. No cuts between shots — one
continuous camera move. No added elements, no change to the subject.
[TRAVA DO ESTILO]
```

**Travas próprias:**

- `The subject, its materials, its proportions and the lighting setup never
  change` — a substituta do `Never redraw` nesta estrutura. Sem ela o produto
  muda de forma no meio da órbita, que é o defeito clássico de reveal gerado
  por IA.
- `only the camera and the secondary elements move` — separa o que pode se mexer
  do que não pode.
- `No cuts between shots — one continuous camera move` — sem isso o modelo corta
  e o produto reaparece diferente a cada corte.
- `Smooth, weighted camera motion … no jitter` — evita o tremido de câmera
  "cinematográfica" automática.

**Quantos graus de órbita:**

| Objetivo | Movimento |
|---|---|
| Mostrar o produto inteiro | órbita de 180° a 360°, 6 a 10 segundos |
| Dar volume sem revelar tudo | arco de 90° a 120° — mais elegante, menos catálogo |
| Peça emocional, não catálogo | push-in lento, sem órbita |

Órbita completa em 15s com build-up e outro fica corrida. Para 360° de verdade,
proponha tirar a segunda imagem e dar o tempo todo para a volta.

**Dois frames aprovados** viram **dois ângulos** da mesma cena: a câmera sai do
ângulo de `image 1` e pousa no de `image 2`. É a combinação mais fiel deste
caminho — vale sempre que o produto for crítico.

---

## Como as imagens chegam ao modelo

A ordem é **frames → produto → logo**, e é ela que amarra o prompt aos arquivos:
por isso os templates falam em `image 1`, `image 2` e `the attached logo image`.

| Situação | O que vai anexado |
|---|---|
| Um frame (padrão) | `frame-01.png` + logo |
| Dois frames aprovados | `frame-01.png`, `frame-02.png` + logo |
| Produto que precisa sair fiel | os frames + a foto do produto + logo |

Com dois frames, ajuste a cena 2 para `matching image 2 exactly` e diga na
abertura que a cena 1 vem de `image 1` e a cena 2 de `image 2`. Com um frame só,
a cena 2 é derivada.

O logo é **sempre o último** e nunca aparece nas cenas 1 e 2 — só no outro.

## Criando uma estrutura nova

Se aparecer um tipo recorrente que não cabe nas quatro, copie a mais próxima e
mantenha:

- os blocos com timecode derivados de `ScenePlan`;
- os slots `[STYLE]`, `[CAMERA]`, `[MOTION VERBS]`, `[SOUND]` — nunca crave um
  estilo no arquivo;
- o bloco `OUTRO` com o logo vindo da imagem anexa;
- o bloco `SOUND (always on)` com a trava contra locução;
- uma seção **"travas próprias"** explicando por que cada linha está lá.
