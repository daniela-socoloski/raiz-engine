# MODO ESTILIZADO — QUANDO O PEDIDO NAO E FOTOGRAFICO

> Leia este arquivo **so quando** o roteamento de [imageprompts.md](imageprompts.md) mandar para
> ca. Se o pedido for realista/fotografico, ignore este arquivo por completo.

---

## 1. POR QUE ESTE MODO EXISTE

A inteligencia principal desta pasta e de **direcao de fotografia**: camera IMAX ou Alexa, lente,
T-stop, Kelvin, stock de filme, grao, `MAKEUP SURFACE PHYSICS`. Isso e o que faz uma foto parecer
filmada de verdade.

Quando a pessoa quer uma **ilustracao 2D, um render 3D estilizado, um cartoon, um vetor, uma
aquarela** — esses mesmos atributos **atrapalham**. Pedir "Kodak Vision3 5219 com grao visivel e
poros na pele" numa ilustracao flat empurra o modelo de volta para o fotorrealismo e suja o
resultado.

Entao aqui a regra se inverte: **desligue o aparato fotografico e escreva um prompt bom com
experiencia direta**, do jeito que um diretor de arte descreveria a peca.

---

## 2. GATILHOS — QUANDO ENTRAR NESTE MODO

Entre no modo estilizado se o pedido citar (em portugues ou ingles) qualquer coisa do tipo:

| Familia | Gatilhos |
|---|---|
| Ilustracao | ilustracao, illustration, desenho, drawing, arte 2D, line art, storybook, editorial illustration |
| 3D / CGI | render 3D, ilustracao 3D, 3D illustration, Pixar, Blender, Octane, low poly, isometrico, clay, claymation, toy, blob |
| Cartoon / anime | cartoon, anime, manga, mangá, quadrinhos, HQ, comic, chibi, rubber hose, cel shading |
| Vetor / flat | vetor, vector, flat design, icone, icon, sticker, pictograma, mascote, logo mark |
| Meio tradicional | aquarela, watercolor, oleo, oil painting, guache, nanquim, tinta, ink, carvao, charcoal, pastel, gravura, linocut, xilogravura, colagem, collage |
| Grafico / digital | pixel art, voxel, glitch, vaporwave, risograph, riso, serigrafia, screenprint, blueprint, desenho tecnico, diagrama, infografico |
| Negacao explicita | "nao realista", "sem ser foto", "nada de foto", "estilizado", "nao fotografico", "mais artistico" |

### Casos limite

- **Tratamento estetico sobre foto continua REALISTA.** "Cinematografico com grading teal-orange",
  "foto com cara de filme dos anos 70", "retrato dramatico" -> **modo realista**, sem excecao.
  O que muda o modo e o **meio**, nao o humor.
- **Hibrido** (ex.: produto fotografico sobre fundo ilustrado): fique no **modo realista** para o
  sujeito e descreva o fundo como elemento grafico dentro do proprio prompt. Nao misture os dois
  formatos de prompt na mesma imagem.
- **Duvida real** -> assuma **realista**. E o nucleo da pasta. Se a pessoa usou qualquer gatilho da
  tabela, va para estilizado **sem perguntar**.

---

## 3. O QUE VOCE DESLIGA AQUI

Nada disso entra no prompt estilizado:

- Trava de camera (IMAX MK IV 65mm / ARRI Alexa 35) e a lista de lentes
- ISO, T-stop, Kelvin, IRE, distancia focal
- `POST BEHAVIOR` com stock de filme (5219, 5207, 2383, Double-X, Eterna)
- Grao de filme obrigatorio, halation, curva tonal
- `MAKEUP SURFACE PHYSICS`, poros, suor, oleosidade
- `WARDROBE TONAL BEHAVIOR`
- O formato de paragrafos em CAPS (`CAMERA:`, `LENS:`, `LIGHT:`...)
- A obrigacao de angulo de camera inusitado como regra fotografica
- O teto rigido de 1.500 caracteres

Se algum desses aparecer num prompt estilizado, esta errado. Corte.

---

## 4. O QUE CONTINUA VALENDO SEMPRE

Estas regras nao dependem do meio:

- Prompt final **em ingles**.
- **Descreva coisas concretas**, nao superlativos. Continua proibido: `beautiful`, `stunning`,
  `masterpiece`, `award-winning`, `best quality`, `8k`, `ultra detailed`, `trending on artstation`.
- **Zero texto na imagem** — sem letras, numeros, logos, marca d'agua — salvo se o usuario pedir
  texto explicitamente (ai use aspas duplas e no maximo 1–10 palavras).
- **Nunca cite artista, estudio ou obra viva/registrada** ("estilo Studio Ghibli", "por Mucha",
  "estilo Disney"). Descreva a **tecnica** que produz aquele resultado, nao o nome de quem faz.
- Confirme **aspect ratio** e **resolucao** antes de renderizar, como sempre.
- Saida em `human-output/image/{project_slug}/`, com `prompt.txt`, `brief.txt` e `metadata.json`.
- Render pelo provider resolvido em [providers.md](providers.md) — o modo estilizado **nao muda o
  provider nem o modelo**.
- Iteracao disciplinada: **uma variavel por vez**.
- Com imagem de referencia: leia paleta, tecnica, peso de linha e nivel de acabamento; mantenha
  coerencia. Em fluxo com referencia no Higgsfield, use `@img1` ao mencionar o sujeito.

---

## 5. COMO ESCREVER O PROMPT ESTILIZADO

**Prosa corrida em ingles, sem headers, sem markdown, sem bullets.** Um a tres paragrafos.
Alvo de tamanho: **400 a 1.200 caracteres**. Sem teto rigido — pare quando cada palavra ja estiver
fazendo trabalho.

Nao existe template obrigatorio. Existe uma **espinha** para nao esquecer o que decide a imagem —
percorra mentalmente, escreva como prosa:

1. **Meio e tecnica** — a decisao mais importante da imagem. "flat vector illustration",
   "hand-painted watercolor on cold-press paper", "stylized 3D render with soft clay materials",
   "cel-shaded 2D animation frame", "1-bit pixel art on a 64x64 grid".
2. **Sujeito e acao** — o que e, o que esta acontecendo.
3. **Composicao e perspectiva** — enquadramento, ponto de vista, escala, se e isometrico, frontal,
   plano, com ou sem profundidade.
4. **Paleta** — cores por nome e relacao ("limited palette of warm ochre, deep teal and bone
   white"), nao por HEX. Diga quantas cores.
5. **Logica de luz do meio** — como aquele meio trata luz: sombra chapada em bloco, cel shading em
   dois tons, ambient occlusion suave, sem sombra nenhuma, gradiente de risograph.
6. **Linha, textura e acabamento** — peso e qualidade da linha (ou ausencia dela), grao do papel,
   marca de pincel, borda dura ou sangrada, ruido, halftone, superficie fosca ou plastica.
7. **Fundo** — cor chapada, cena, negativo, padrao. Diga explicitamente.
8. **Formato** — respiro nas bordas, sujeito centralizado ou nao, se precisa funcionar pequeno.

Duas regras de qualidade que valem mais que a lista:

- **Especifique o nivel de acabamento.** "rough pencil sketch with visible construction lines" e
  "clean production-ready vector with uniform 3px strokes" sao mundos diferentes. Escolha um.
- **Especifique a coerencia da paleta.** Ilustracao ruim quase sempre e ilustracao com cor demais.
  Prefira paleta limitada e diga o numero.

---

## 6. EXEMPLOS DE REFERENCIA

Modelos de escrita — troque o assunto, mantenha o nivel de especificidade.

### 6.1. Ilustracao vetorial flat

```
Flat vector illustration of a woman carrying a stack of books up a narrow staircase, seen
straight-on with no perspective depth. Built from simple geometric shapes with uniform stroke
weight, no gradients, no outlines on the color fields. Limited palette of four colors: warm
terracotta, muted sage, cream and near-black for accents. Light is implied by flat two-tone
shadow blocks offset to the lower right, never by shading or blur. Clean hard edges throughout,
subtle paper-grain noise laid over the whole image. Solid cream background with generous negative
space around the figure so the shape reads at small sizes.
```

### 6.2. Render 3D estilizado

```
Stylized 3D render of a small delivery robot standing on a rounded platform, three-quarter view,
slightly above eye level. Soft matte clay materials with rounded bevels on every edge and no
sharp corners, subtle subsurface glow on the lighter panels. Studio setup with one large soft key
from the upper left, gentle ambient occlusion pooling where the robot meets the platform, and a
faint contact shadow. Palette limited to pale mint, warm cream and a single saturated coral
accent on the antenna. Depth of field almost absent, everything readable. Plain gradient
background from off-white to pale grey, nothing else in frame.
```

### 6.3. Aquarela tradicional

```
Hand-painted watercolor of a coastal village at low tide on cold-press paper, wide horizontal
view from the waterline. Pigment pools and blooms at the edges of each wash, paper texture
showing through the lighter passages, a few hard edges where washes dried against each other.
Loose graphite construction lines left visible under the paint. Palette of indigo, raw sienna and
a single warm ochre for the roofs, colors mixed on the paper rather than flat. Large areas of
untouched white paper standing in for the sky and the wet sand. No ink outlines, no digital
smoothing, brush marks intact.
```

### 6.4. Cel shading / anime

```
Cel-shaded 2D animation frame of a teenager running through a rain-soaked alley at night, low
angle looking up along the wall. Clean confident linework with varying weight, thicker on the
silhouette and thinner inside the form. Two-tone shading only: base color plus one darker shadow
tone with hard-edged boundaries, no gradients on the character. Cool palette of deep blue-violet
and slate, cut by warm amber from a single sign off-frame that rims the figure. Rain drawn as
sparse white diagonal strokes over everything. Background painted more loosely than the
character, softer edges, less detail, so the figure reads first.
```

---

## 7. CHECKLIST DO MODO ESTILIZADO

- [ ] O pedido realmente bateu um gatilho da secao 2 — nao entrei aqui por engano
- [ ] Zero camera, lente, ISO, T-stop, Kelvin, IRE
- [ ] Zero stock de filme, grao de filme, halation, `POST BEHAVIOR`
- [ ] Zero `MAKEUP SURFACE PHYSICS` / poros / suor
- [ ] Zero headers em CAPS — e prosa corrida
- [ ] Meio e tecnica declarados na primeira frase
- [ ] Paleta limitada e nomeada, sem HEX
- [ ] Logica de luz coerente com o meio (chapada, cel, AO, ausente)
- [ ] Nivel de acabamento explicito (rascunho vs. finalizado)
- [ ] Fundo declarado
- [ ] Nenhum artista/estudio/obra citado por nome
- [ ] Zero buzzword (`beautiful`, `masterpiece`, `8k`, `ultra detailed`...)
- [ ] Zero texto na imagem, salvo pedido explicito
- [ ] Aspect ratio e resolucao confirmados; render pelo provider de [providers.md](providers.md)
