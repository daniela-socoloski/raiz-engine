# Estrutura — Movimento de câmera (Seedance)

**Quando usar:** quando o assunto é **um objeto ou uma cena no espaço** e a graça está em ver ele de vários ângulos. Reveal de produto, turntable, órbita, push-in dramático, arquitetura.

**Estilos:** 3D render e realista/fotográfico. É a única estrutura em que a câmera manda. Não use em 2D flat, colagem ou ilustração — câmera orbitando arte chapada quebra o estilo.

> **Leia `00-estilos.md` antes de preencher.** Os campos `[STYLE]` e `[SOUND]` vêm de lá.

---

## Prompt

```
Animate a [15]-second product/scene reveal from the attached image(s).
[STYLE: vocabulário do estilo escolhido]. The subject, its materials, its
proportions and the lighting setup never change — only the camera and the
secondary elements move. Smooth, weighted camera motion with gentle
acceleration and deceleration, no jitter.

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
- [IF TEXT] The line "[SUA FRASE]" fades in at [posição], locked to the
  frame, not to the 3D space.
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
- [SOUND: caráter do estilo — low sustained bed with body / room ambience],
  rising subtly as the camera turns.
- A soft airy whoosh tied to the camera movement, never cartoonish.
- Fine material detail: [a light ceramic tick / a metallic shimmer / cloth
  rustle] as surfaces catch the light.
- A single resonant impact on the logo, with a long tail.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. No cuts between shots — one
continuous camera move. No added elements, no change to the subject.
[TRAVA DO ESTILO — copie de 00-estilos.md]
```

---

## As travas que não se mexe

- `The subject, its materials, its proportions and the lighting setup never change` — a substituta do `Never redraw` nesta estrutura. Sem ela o produto muda de forma no meio da órbita, que é o defeito clássico de reveal gerado por IA.
- `only the camera and the secondary elements move` — separa o que pode se mexer do que não pode.
- `No cuts between shots — one continuous camera move` — sem isso o modelo corta e o produto reaparece diferente a cada corte.
- `matching it exactly` nos pontos onde a câmera pousa numa imagem aprovada.
- `Smooth, weighted camera motion ... no jitter` — evita o tremido de câmera "cinematográfica" automática.
- `No voiceover, no dialogue, no lyrics, no stock-music swell`.
- **A trava do estilo**, copiada de `00-estilos.md`.

## Quantos graus de órbita

| Objetivo | Movimento |
|---|---|
| Mostrar o produto inteiro | Órbita de 180° a 360°, 6 a 10 segundos |
| Dar volume sem revelar tudo | Arco de 90° a 120° — mais elegante, menos "catálogo" |
| Peça emocional, não catálogo | Push-in lento, sem órbita |

Órbita completa em 15 segundos com build-up e outro fica corrida. Se a pessoa quiser 360° de verdade, proponha tirar a segunda imagem e dar o tempo todo para a volta.

## Duas imagens aprovadas

Aqui os dois frames viram **dois ângulos** da mesma cena. A câmera sai do ângulo de `image 1` e pousa no de `image 2`. É a combinação mais fiel que este projeto produz — vale sugerir sempre que o produto for crítico.

## Genre do Seedance

`auto` na maioria dos casos. `epic` para reveal premium, `drama` para peça emocional. Nunca `action` — dá corte rápido, que é exatamente o que esta estrutura proíbe.
