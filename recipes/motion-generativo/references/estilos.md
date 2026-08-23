# Estilos — do perfil da marca ao vocabulário do prompt

**Leia antes de escrever qualquer prompt — o da imagem e o do motion.**

## A adaptação que importa

No protótipo, o estilo era **pergunta**: *"e o estilo? 2D flat, colagem, 3D…"*.
Fazia sentido lá, porque não havia marca compilada — sem perguntar, todo projeto
saía com a mesma cara.

Aqui o estilo é **derivado**. `BrandRuntimeProfile` já responde como a marca se
parece e se move, e perguntar de novo a cada produção é deixar cada peça
contradizer a marca.

| Campo do perfil | O que ele determina |
|---|---|
| `visual.colorStrategy`, `accentColor` | paleta e qual cor domina |
| `motion.intensity` | quão enérgico é o easing |
| `motion.allowedPatterns` | quais verbos de movimento são permitidos |
| `motion.prohibitedPatterns` | o que nunca pode aparecer |
| `motion.dynamics.overshootMaximumPercent` | quanto overshoot cabe |
| `editorial.pace`, `energy`, `density` | ritmo e quantidade de elementos |
| `sound.principles`, `musicPolicy` | caráter do bloco `SOUND` |
| `constraints.prohibitedClaims` | o que o texto não pode afirmar |

**Quando o perfil não determina o estilo visual** — porque o compilador não achou
evidência dessa dimensão no corpus — a família abaixo é escolhida no passo 8 e
gravada em `ScenePlan`, não improvisada aqui. A recipe lê; não decide.

## Dois eixos independentes

```text
        ESTILO       ×      ESTRUTURA
        ──────              ─────────
        Como a peça         Como ela se move
        se parece           (derivada de ScenePlan)
        (vem do perfil)
```

| | Camadas | Cartelas | Imagem + texto | Câmera |
|---|:---:|:---:|:---:|:---:|
| 2D flat / vetor | ✓ | ✓ | ✓ | — |
| Colagem / paper-cutout | ✓ | ✓ | ✓ | — |
| 3D render / CGI | ✓ | ✓ | ✓ | ✓ |
| Realista / fotográfico | — | ✓ | ✓ | ✓ |
| Mixed media | ✓ | ✓ | ✓ | ~ |
| Ilustração / desenho | ✓ | ✓ | ✓ | — |

`✓` combina · `~` dá, com cuidado · `—` evite

---

## As seis famílias

Cada uma entrega quatro blocos que o prompt consome: **imagem**, **câmera**,
**efeitos** e **som** — mais a **trava**, que é o que impede o modelo de
derreter o estilo.

### 1. 2D flat / vetor

Cores chapadas, formas geométricas, zero profundidade. Corporativo moderno,
explicativo, tech.

- **`[IMAGE]`** — `flat 2D vector illustration, solid color fills, geometric shapes, clean edges, no gradients or subtle two-stop gradients only, generous negative space`
- **`[CAMERA]`** — `static camera`. Movimento de câmera em arte chapada parece erro de render.
- **`[MOTION VERBS]`** — `slide`, `pop`, `scale`, `wipe`. Easing snappy com overshoot leve.
- **`[SOUND]`** — `crisp digital clicks, short swish, dry rhythmic bed`
- **`[TRAVA]`** — `no realistic shadows, no 3D render, no photographic texture, flat lighting`
- **Padrões da gramática** — `slide-settle`, `caption-cut`, `stroke-draw`

### 2. Colagem / paper-cutout

Recorte de papel, textura de impressão, stop-motion. Artesanal, editorial,
caloroso.

- **`[IMAGE]`** — `flat 2D paper-cutout collage, visible paper grain, slightly serrated cut edges, subtle off-register printing, hard drop shadow of cut paper`
- **`[CAMERA]`** — `static camera`. A graça é o elemento se mover, não a câmera.
- **`[MOTION VERBS]`** — `slide with bounce`, `slight rotation on entry`, `line-work drawing itself on`
- **`[SOUND]`** — `paper foley — cutting swish, paper-on-paper tap, pen ticks`
- **`[TRAVA]`** — `no realistic shadows, no 3D render, no photographic texture`
- **Padrões da gramática** — `slide-settle`, `stroke-draw`, `strike-through`

### 3. 3D render / CGI

Volume, material, luz global. Produto, tech, premium, abstrato.

- **`[IMAGE]`** — `3D render, physically based materials, soft global illumination, [matte/glossy/metallic/translucent] surfaces, shallow depth of field, studio lighting from [direção]`
- **`[CAMERA]`** — **livre.** `slow orbit`, `turntable`, `push-in`, `lateral dolly`. Câmera parada aqui joga o estilo fora.
- **`[MOTION VERBS]`** — `continuous rotation`, `elements floating`, `materials catching light`, `parts assembling in space`
- **`[SOUND]`** — `soft lows, whoosh with body, one sustained impact on the close`
- **`[TRAVA]`** — `consistent materials and lighting across the whole piece, the object never changes shape or proportion`
- **Padrões da gramática** — `orbit-drift`, `depth-drift`, `mask-reveal`

### 4. Realista / fotográfico

Foto tratada, live-action, cena real. Campanha, lifestyle, produto em contexto.

- **`[IMAGE]`** — `photographic, [50mm/85mm/wide] lens, [natural/studio/golden hour] light, realistic materials and skin, shallow depth of field, film grain`
- **`[CAMERA]`** — movimento **discreto**: `very slow push-in`, `light parallax`, `drift`. Nunca corte dentro da mesma cena.
- **`[MOTION VERBS]`** — a cena praticamente não se move; o que se move é a tipografia e os grafismos por cima.
- **`[SOUND]`** — `scene ambience, restrained musical bed, no cartoon foley`
- **`[TRAVA CRÍTICA]`** — `the photographic image must remain untouched: no relighting, no depth effects, no generated motion inside the photo, no face or product redraw`
- **Padrões da gramática** — `caption-cut`, `stroke-draw`, `stagger-rise`

### 5. Mixed media

Foto recortada com grafismo, traço e tipografia por cima. Streetwear, cultural,
editorial ousado.

- **`[IMAGE]`** — `mixed media composition: cut-out photographic elements over [flat color blocks / paper texture / halftone], hand-drawn line work on top, visible collage seams, halftone dots`
- **`[CAMERA]`** — `static camera`, ou push-in bem lento.
- **`[MOTION VERBS]`** — `photo enters whole`, `graphics draw themselves on top`, `typography with displacement`
- **`[SOUND]`** — híbrido: `paper foley on the graphics, more present rhythmic bed`
- **`[TRAVA]`** — `the photographic cut-outs are never redrawn or relit, only moved`
- **Padrões da gramática** — `stroke-draw`, `slide-settle`, `strike-through`

### 6. Ilustração / desenho

Traço autoral: aquarela, nanquim, anime, editorial, risografia. Narrativo,
humano, expressivo.

- **`[IMAGE]`** — `[watercolor / ink line / anime cel / risograph / editorial] illustration, [visible brush texture / clean linework / limited palette], hand-made feel`
- **`[CAMERA]`** — `static camera`. Para dar vida, use parallax de camadas, não movimento de câmera.
- **`[MOTION VERBS]`** — `elements draw themselves in`, `strokes growing`, `textured fade`
- **`[SOUND]`** — `soft foley, light melodic bed`
- **`[TRAVA]`** — `never redraw the artwork, keep the exact line quality and palette of the attached image`
- **Padrões da gramática** — `stroke-draw`, `depth-drift`, `slide-settle`

---

## O estilo tem de aparecer igual nos dois prompts

É a incoerência mais cara deste caminho. Imagem 3D com prompt de animação
escrito para colagem faz o modelo **redesenhar tudo** tentando conciliar.

A mesma `[TRAVA]` que fecha o prompt da imagem fecha o prompt do motion.

## Família fora da lista

Pixel art, claymation, retrô 80s, blueprint técnico — não force para dentro das
seis. Escreva os cinco blocos (`[IMAGE]`, `[CAMERA]`, `[MOTION VERBS]`,
`[SOUND]`, `[TRAVA]`) seguindo a mesma lógica, e decida se a câmera pode se
mover.

O que **não** é opcional: a trava. Estilo sem trava é estilo que o modelo
reinterpreta.

## Coerência com a marca

Antes de usar qualquer `[MOTION VERBS]` acima, confira contra o perfil:

```text
patternFamily ∈ motion.allowedPatterns
patternFamily ∉ motion.prohibitedPatterns
overshootPercent ≤ motion.dynamics.overshootMaximumPercent
```

É o que `validateMotionNeedAgainstProfile` já faz no passo 8. Se a família de
estilo pede um verbo que a marca proíbe, **a marca vence** — e a contradição é
sinal de que a família escolhida não serve a esta marca.
