# Montagem do prompt

Onde cada pedaço do prompt vem de qual campo do contrato. Nada aqui é escolha do
agente na hora: **todo slot tem uma origem**, e slot sem origem é decisão
vazando para a execução.

Prompts são escritos em **inglês**; a conversa é em português.

> Prompt **não é contrato**. Ele é insumo versionado da execução, registrado em
> `PlanInputs.planner.promptVersion`. Mudou o template? Sobe a versão — dois
> resultados produzidos por templates diferentes não são comparáveis.

---

## 1. A tabela de origem

Cada slot dos templates de [estruturas.md](estruturas.md), e de onde ele sai:

| Slot | Origem | Campo exato |
|---|---|---|
| `[STYLE]` | família de estilo | bloco `[IMAGE]` de [estilos.md](estilos.md) |
| `[CAMERA]` | família de estilo | bloco `[CAMERA]` de [estilos.md](estilos.md) |
| `[MOTION VERBS]` | família + marca | bloco `[MOTION VERBS]`, filtrado por `motion.allowedPatterns` |
| `[SOUND]` | marca | `SoundProfile.principles`, `musicPolicy` |
| `[TRAVA DO ESTILO]` | família de estilo | bloco `[TRAVA]` de [estilos.md](estilos.md) |
| `[15]` segundos | brief | `CreativeBrief.delivery.targetDurationSeconds` |
| aspect ratio | brief | `CreativeBrief.delivery.aspectRatio` |
| timecodes das cenas | plano | `ScenePlan.startFrame` / `endFrame` ÷ `envelope.fps` |
| `[FRASE]`, `[HEADLINE]` | plano | `ScenePlan.mediaNeed.description` (texto exato) |
| `[SEGUNDA TELA]` | plano | `narrativeBeat` da cena seguinte |
| `[CTA / SITE]` | brief | `CreativeBrief.intent.callToAction.text` |
| direção do movimento | plano | `MotionNeed.direction` |
| o que se move | plano | `MotionNeed.subject` |
| overshoot | marca | `motion.dynamics.overshootMaximumPercent` |
| o que a cena recusa | plano | `ScenePlan.prohibitions`, `MotionNeed.avoid` |

**A regra:** se você precisa inventar um valor porque nenhum campo o fornece, o
plano está incompleto. O caminho é voltar ao passo 8, não preencher no prompt.

---

## 2. Template da imagem estática

Prosa corrida, em inglês, nesta ordem. Cada bloco vira uma ou duas frases — sem
bullets no prompt final.

```text
1. FORMATO E ESTILO
   Aspect ratio + o vocabulário `[IMAGE]` da família escolhida.
   É o bloco que muda tudo. Seja específico: não "3D", mas
   "3D render, soft global illumination, matte ceramic and brushed steel".

2. CENA / FUNDO
   A camada de trás: cor, ambiente, cenário, textura, estúdio.
   Em estrutura de camadas, descreva como camada — o motion começa com ela
   sozinha na tela.

3. ELEMENTOS DE BASE
   Painéis, blocos, superfícies, formas grandes que estruturam a
   composição. Posição de cada um.

4. SUJEITOS / PRODUTO
   Personagens, produto, objetos. Um por um, com posição, escala e pose.

5. DETALHES E GRAFISMOS
   Setas, marcadores, números, hachuras, partículas, reflexos.
   Em estilos gráficos, é a camada que "se desenha" no motion.

6. LUZ
   De onde vem, que qualidade tem. Em 2D flat é "flat lighting"; em 3D e
   realista é decisão de fotografia.

7. PALETA
   3 a 5 cores nomeadas, e qual domina. Vem de `visual.accentColor` e
   `colorStrategy`.

8. ACABAMENTO
   Grão, textura, material, profundidade de campo, serrilhado, halftone.

9. TRAVAS
   A trava do estilo + "no logo, no brand marks, no frame or border,
   full-bleed composition."
```

### O que a imagem precisa garantir, por estrutura

| Estrutura | A imagem precisa entregar |
|---|---|
| **Camadas** | elementos separáveis: silhueta legível, fundo distinto dos objetos, sobreposição pequena — o modelo vai recortar cada um |
| **Cartelas** | o sistema visual completo de uma cartela: fundo, blocos, hierarquia tipográfica |
| **Imagem + texto** | a cena limpa, **sem texto e sem logo** — a tipografia entra na animação |
| **Câmera** | objeto coerente no espaço, com material e luz definidos — o que estiver mal resolvido vai aparecer na volta |

### Proibições absolutas, em qualquer estilo

- **Sem logo, sem marca, sem nome de empresa, sem assinatura.**
- Sem marca d'água, sem UI de app, sem barra de menu.
- Sem texto, **exceto** quando o texto for parte da composição pedida — aí
  escreva a frase exata entre aspas.
- Sem moldura, borda ou passe-partout. Composição sangrando até a borda.

### Referências

Referência guia **estilo, composição, densidade e paleta**. Nunca copie o
conteúdo, o texto, a marca ou o layout exato dela — descreva no prompt o que
você quer *daquele jeito*, não *aquela imagem*.

Duas ou três referências boas ajudam mais que dez. Referências que brigam entre
si (uma minimalista e uma carregada) produzem resultado no meio do caminho.

**Nunca passe o logo como referência.** O provider redesenha logo, e logo
redesenhado é logo errado.

---

## 3. Montagem, de ponta a ponta

Um exemplo real do encadeamento. Partimos de duas cenas do plano aprovado:

```jsonc
// ScenePlan[0]
{
  "sceneId": "s1",
  "startFrame": 0, "endFrame": 225,
  "purpose": "hook",
  "narrativeBeat": "o produto chega e se apresenta inteiro",
  "mediaNeed": { "kind": "graphic", "description": "frasco cerâmico no pedestal" },
  "motionNeed": {
    "function": "introduce",
    "intensity": "medium",
    "subject": "frasco e formas secundárias",
    "patternFamily": "slide-settle",
    "behavior": "enter-and-hold",
    "direction": "bottom-up",
    "envelope": { "fps": 30, "preferredDurationFrames": 20, "overshootPercent": 2 }
  },
  "audioNeed": { "role": "effect" }
}

// ScenePlan[1]
{
  "sceneId": "s2",
  "startFrame": 225, "endFrame": 390,
  "purpose": "emphasize",
  "narrativeBeat": "o material aparece de perto",
  "motionNeed": {
    "function": "reveal", "intensity": "low",
    "patternFamily": "mask-reveal",
    "envelope": { "fps": 30, "preferredDurationFrames": 26, "overshootPercent": 0 }
  }
}
```

Mais o perfil da marca: `visual.accentColor` teal, `motion.intensity: medium`,
`dynamics.overshootMaximumPercent: 3`, `sound.musicPolicy: 'ambient'`. E o
brief: `aspectRatio: '9:16'`, `targetDurationSeconds: 15`.

**Passo A — derivar a estrutura.** As duas cenas mostram o mesmo objeto de
ângulos diferentes, com `mediaNeed` de objeto no espaço → **estrutura de
câmera**. Família de estilo: 3D render.

**Passo B — converter as janelas.**

```text
s1:   0 →  225 quadros ÷ 30fps  =  0:00 – 0:07.5
s2: 225 →  390 quadros ÷ 30fps  =  0:07.5 – 0:13
outro:                             0:13 – 0:15
```

**Passo C — o prompt da imagem**, com os nove blocos:

> Vertical 9:16 3D render with physically based materials and soft global
> illumination. A seamless deep-teal studio backdrop curves into the floor.
> Centered on a low matte-white cylindrical plinth, a ceramic skincare bottle in
> warm sand color with a brushed steel cap, standing upright, front-facing. Two
> smaller ceramic forms sit behind at different heights, slightly out of focus.
> Thin steel rings float around the plinth at staggered angles. Key light from
> upper left, large soft box, with a cool rim from behind right. Palette: deep
> teal, warm sand, brushed steel, off-white — teal dominates. Shallow depth of
> field, subtle surface imperfection on the ceramic, clean specular highlights.
> Consistent materials and lighting throughout, the object never changes shape
> or proportion. No logo, no brand marks, no frame or border, full-bleed
> composition.

Repare: a trava do 3D (`consistent materials …`) e a trava universal (`no logo
…`) fecham o prompt. O logo **não** está descrito — ele sobe separado.

**Passo D — o prompt do motion**, preenchendo o template de câmera:

- `[STYLE]` → `3D render, physically based materials, soft global illumination`
- `[CAMERA]` → livre, porque a família é 3D → `slow orbit`
- `[SOUND]` → `low sustained bed with body` (de `musicPolicy: ambient`)
- `[TRAVA]` → `consistent materials and lighting across the whole piece, the object never changes shape or proportion`
- graus de órbita → 120°, porque `motion.intensity` é `medium` e a peça tem
  segunda cena disputando o tempo

> Animate a 15-second product reveal from the attached image. 3D render,
> physically based materials, soft global illumination. The subject, its
> materials, its proportions and the lighting setup never change — only the
> camera and the secondary elements move. Smooth, weighted camera motion with
> gentle acceleration and deceleration, no jitter.
>
> **SHOT 1 (0:00 – 0:07.5) — Arrival:** Open on a tight crop of the ceramic
> surface, slow push-in. The camera settles on the composition of image 1,
> matching it exactly. The thin steel rings settle into their positions around
> the plinth, rising from below with a small overshoot.
>
> **SHOT 2 (0:07.5 – 0:13) — The turn:** The camera orbits slowly around the
> bottle, left to right, roughly 120 degrees, keeping it centered and in focus.
> Light travels across the surfaces as the angle changes, revealing the matte
> ceramic texture and the specular highlights on the steel cap.
>
> **OUTRO (0:13 – 0:15):** The subject and rings drift out of frame, leaving the
> clean teal background. The brand logo from the attached logo image appears at
> the center with a soft scale-in and holds until the end.
>
> **SOUND (always on):** Low sustained bed with body, rising subtly as the
> camera turns. A soft airy whoosh tied to the camera movement, never cartoonish.
> A light ceramic tick as surfaces catch the light. A single resonant impact on
> the logo, with a long tail. No voiceover, no dialogue, no lyrics, no
> stock-music swell.
>
> Total duration exactly 15 seconds. No cuts between shots — one continuous
> camera move. No added elements, no change to the subject. Consistent materials
> and lighting across the whole piece, the object never changes shape or
> proportion.

**Passo E — conferir a montagem** antes de disparar:

- [ ] a mesma `[TRAVA]` fecha os dois prompts;
- [ ] o overshoot usado (2%) cabe no teto da marca (3%);
- [ ] `patternFamily` de cada cena está em `motion.allowedPatterns`;
- [ ] os timecodes somam exatamente `targetDurationSeconds`;
- [ ] o logo não aparece no prompt da imagem;
- [ ] a linha `No voiceover, no dialogue, no lyrics, no stock-music swell` está
      presente;
- [ ] nenhum texto do prompt contradiz `constraints.prohibitedClaims`.

---

## 4. Pacote manual

Quando não há gerador de vídeo na máquina, ou a geração falhou duas vezes, a
recipe escreve `execution/motion-generativo/UPLOAD.md`:

```markdown
# {produção} — upload manual

> Este pacote foi gerado porque {não há gerador de vídeo nesta máquina /
> a geração automática falhou: <motivo>}.

## 1. Arquivos, nesta ordem
| # | Arquivo | O que é |
|---|---|---|
| 1 | `frame/frame-01.png` | imagem principal aprovada |
| 2 | `../../assets/produto/xxx.png` | produto, se houver |
| 3 | `../../assets/logo/logo.png` | **logo, arquivo separado** |

## 2. Parâmetros
duração · resolução · aspect ratio · som ligado

## 3. Prompt
{prompt completo, pronto para colar}

## 4. Conferir no resultado
- [ ] a cena 1 termina igual à imagem aprovada
- [ ] nenhum elemento foi redesenhado
- [ ] a câmera obedeceu ao estilo
- [ ] o logo entrou inteiro e legível
- [ ] a duração bateu
- [ ] o áudio veio, sem locução nem trilha cantada
```

Regras: caminhos **relativos**, para o arquivo funcionar se a pasta for movida;
o prompt vai **inteiro** dentro do arquivo, não como link; e a primeira linha
diz **por que** o pacote manual foi gerado — sem isso a pessoa acha que o
sistema quebrou.

Se o vídeo saiu, este arquivo não é criado. Ele só polui a pasta.
