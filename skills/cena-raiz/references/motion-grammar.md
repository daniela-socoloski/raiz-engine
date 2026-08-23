# Gramática de motion

As regras que fazem o movimento parecer intencional em vez de decorativo, com
os números que funcionam na prática. Tudo aqui foi medido em peças reais.

Este documento é **conhecimento, não motor**. Ele não anima nada e não escolhe
ferramenta: define o vocabulário que o planner do passo 8 pode usar e o
significado de cada nome. Quem executa é o passo 11.

## Por que este documento existe

O contrato [`MotionProfile`](../../../packages/contracts/brand/brand-runtime-profile.ts)
diz, sobre `allowedPatterns`:

> Hoje é texto livre; quando o dicionário em `references/*.md` existir, cada
> nome passa a ter definição e faixas medidas, e a validação deixa de conferir
> só ortografia.

Este é o dicionário. Sem ele, `patternFamily: "slide-settle"` é uma string que
passa por `validateMotionNeedAgainstProfile` porque está numa lista — não
porque alguém saiba o que ela significa, quanto tempo dura ou o que quebra
quando é usada errado.

## Onde isto entra nos contratos

| Conceito daqui | Campo | Quem confere |
|---|---|---|
| Nome do padrão | `MotionNeed.patternFamily` | `allowedPatterns` / `prohibitedPatterns` do perfil |
| Função editorial | `MotionNeed.function` | seleciona qual envelope da marca se aplica |
| Duração por massa visual | `MotionNeed.envelope.*DurationFrames` + `fps` | `MotionProfile.timing` em milissegundos |
| Overshoot | `MotionNeed.envelope.overshootPercent` | `dynamics.overshootMaximumPercent` |
| Ancoragem na fala | `MotionNeed.synchronization.anchor` | `anchor: 'transcript-word'` exige `cue` |
| Contenção | — | `dynamics.simultaneousMovingElementsMaximum` |
| Safe zone e o que nunca cruzar | `ScenePlan.prohibitions` | revisão do passo 12 |

Validador: [`validate-motion-need-against-profile.ts`](../../../packages/core/production/validate-motion-need-against-profile.ts).

---

## 1. A regra raiz: o motion serve à fala

**Nenhum elemento entra num tempo escolhido no olho: entra na palavra.**

O alinhamento forçado (WhisperX) devolve o início e o fim de **cada palavra**, e
é sobre essa grade que os beats são escritos. `tituloIn: 1.2` significa "no
instante em que ele diz a palavra", não "1,2 segundos".

É por isso que `MotionAnchor` tem `transcript-word` como primeiro valor e o
validador recusa a âncora sem `cue`:

> âncora "transcript-word" exige a palavra; sem ela o tempo volta a ser
> escolhido no olho

**Trocar o corte base invalida os tempos antigos.** Não é offset, é **deriva**:
uma montagem que aperta 3,2s de pausas distribuídas produz desvio crescente —
medido de +0,58s no início a +3,81s no fim. Remedir é obrigatório e é barato.

No contrato, isso aparece como envelhecimento de evidência: fonte trocada muda o
fingerprint, e `comparePlanInputs` devolve `content-source` apontando qual.

---

## 2. Vocabulário canônico de padrões

Vocabulário **fechado**. Nada fora desta lista entra numa peça, e cada nome aqui
é um valor válido de `allowedPatterns`.

| Padrão | Função editorial típica | Massa | Duração medida (30fps) |
|---|---|---|---|
| `slide-settle` | `introduce` | média | 20 quadros / ~667 ms |
| `mask-reveal` | `reveal` | média-alta | 20–26 quadros / ~667–867 ms |
| `stroke-draw` | `introduce`, `compare` | baixa-média | 20 quadros / ~667 ms |
| `node-pulse` | `transition` | baixa | 12 quadros / ~400 ms |
| `connection-draw` | `transition` | baixa-média | 20 quadros / ~667 ms |
| `orbit-drift` | `sustain` (fundo) | alta | 26 quadros para entrar |
| `depth-drift` | `sustain` (fundo) | muito alta | 40 quadros para entrar |
| `caption-cut` | `emphasize` | mínima | 0 quadros — corte seco |
| `strike-through` | `emphasize` (negação) | baixa | ~3 quadros de atraso |
| `stagger-rise` | `conclude` | média | 5 quadros entre filhos |
| `exit-lift` | qualquer saída | — | 9 quadros / ~300 ms |

### `slide-settle`

Entrada padrão. **Três propriedades juntas, nunca fade puro:**

```
opacidade      0 → 1
deslocamento   +14px → 0     (translateY, vem de baixo)
escala         0,975 → 1
```

Fade sozinho lê como "camada ligando". Os três juntos leem como objeto
chegando.

**Quando usar:** qualquer elemento que precisa aparecer e ficar.
**O que quebra:** usar fade isolado; usar a mesma duração para massas
diferentes (ver § 3).

### `mask-reveal`

Uma máscara se move e revela o que já estava lá. Não é entrada de elemento novo
— é exposição do que estava coberto.

**Quando usar:** quando a fala nomeia algo escondido. Se a fala diz *"a camada
por baixo"*, o gráfico deve fazer **literalmente** aquilo.
**O que quebra:** usar como decoração. Um gráfico que ilustra genericamente é
decoração; um que executa a frase é argumento.

### `stroke-draw`

O traço se desenha, equivalente ao Trim Paths do After Effects:

```ts
strokeDasharray: comprimento
strokeDashoffset: comprimento * (1 - progresso)
```

A opacidade acompanha em `min(1, p · 2.2)` — chega a 100% no primeiro terço.
Sem isso o traço nasce fantasma e o desenho não lê.

**Quando usar:** ícones, linhas, arcos.
**O que quebra:** misturar com fade. Um ícone que só aparece com fade **não
pertence à mesma linguagem** das linhas — se o sistema desenha, tudo desenha.

### `node-pulse` e `connection-draw`

**Toda transição nasce de um nó.** A sequência é sempre: o nó aparece → dispara
anéis concêntricos → uma linha se desenha dali até o destino → o elemento entra.

Pulso: três anéis, 0,17s de atraso entre eles, 1,5s de vida cada, raio máximo
~190px. A opacidade não é linear — sobe rápido e cai devagar
(`[0, 0.25, 1] → [0, 0.6, 0]`): o anel precisa estar mais visível quando ainda é
pequeno.

**Quando usar:** toda transição entre elementos.
**O que quebra:** elemento que aparece do nada. É o encadeamento nó → pulso →
linha que faz a peça parecer um sistema conectado em vez de camadas empilhadas.

### `orbit-drift`

Arcos **incompletos**, entre 30% e 62% da circunferência. O círculo completo é
estático mesmo girando; o arco tem direção.

- rotação de 1,1 a 3 graus por segundo — acima disso vira carrossel;
- camadas adjacentes **nunca** giram para o mesmo lado;
- órbitas de fundo mais lentas que as de primeiro plano;
- traço fino, 1,2 a 1,6px, opacidade 0,15 a 0,5;
- círculos grandes (raio 500–800) com centro **fora do quadro**.

**Nada gira o tempo todo.** O movimento serve à transição e depois para.
Rotação perpétua é o que separa motion design de protetor de tela.

### `depth-drift`

Discos desfocados (blur 55–70px), opacidade 0,26 a 0,38, com deriva lenta por
seno: `sin(t · 0,14 + cx) · amplitude`. O `cx` na fase é o truque — cada disco
entra na senoide num ponto diferente, então nunca se movem em bloco.

Amplitudes diferentes por plano (14 / 18 / 22px) produzem parallax sem câmera.

### `caption-cut`

1 a 3 palavras por vez, trocando **em corte seco** no tempo exato da fala, com
escala contínua de ~6% enquanto a frase está no ar (`1 → 1,062`).

**Corte e não fade:** o corte é o transiente que marca a troca. Fade de entrada
atrasa a leitura justo quando a palavra está sendo dita. Para suavizar, use um
*settle* de 3 quadros na escala (`0,955 → 1`) — **nunca** na opacidade.

Paginação por três critérios simultâneos: contagem máxima, pontuação, e pausa
real maior que 0,3s. Trava: duas palavras com ênfase seguidas **nunca** se
separam entre páginas.

### `strike-through`

Risco crescendo da esquerda, começando ~3 quadros **depois** da palavra ser
dita — o risco é a reação, não o anúncio.

**Use somente quando a fala nega:** *"não é falta de X"*. Fora desse contexto,
confunde.

### `stagger-rise`

Sobe da base com os filhos escalonados, 5 quadros de intervalo (logo → frase →
botão). Quando a imagem sai de cena, **recentra**.

### `exit-lift`

**A saída é sempre mais rápida que a entrada:** 9 quadros contra ~20, e sai
subindo (`-8px`), não descendo. Objeto que demora a sair rouba atenção do que
está chegando.

---

## 3. Massa visual determina duração

O gradiente não é arbitrário: **quanto maior a massa visual, mais lento o
assentamento.** Um ponto que leva 26 quadros parece travado; um disco de 380px
que aparece em 12 parece um susto.

| Elemento | Quadros (30fps) | Milissegundos |
|---|---|---|
| Nó / ponto | 12 | 400 |
| Microtexto | 16 | 533 |
| Linha de conexão | 20 | 667 |
| Bloco de texto | 20 | 667 |
| Arco / órbita | 26 | 867 |
| Disco de profundidade | 40 | 1333 |
| **Qualquer saída** | **9** | **300** |

Estes são os valores que alimentam `MotionProfile.timing.entrance`,
`.transition` e `.exit` quando a marca é compilada.

**Quadro sem FPS não é duração.** 14 quadros são 467ms a 30fps e 233ms a 60fps
— por isso `MotionEnvelope.fps` é obrigatório sempre que há duração declarada, e
o validador recusa sem ele.

---

## 4. Curvas, molas e overshoot

Nunca linear. Quatro curvas cobrem tudo:

```ts
out:   bezier(0.16, 1, 0.3, 1)     // expo-out — TODA entrada
in:    bezier(0.7, 0, 0.84, 0)     // expo-in  — TODA saída
inOut: bezier(0.65, 0, 0.35, 1)    // percursos, câmera, push
soft:  bezier(0.33, 1, 0.68, 1)    // escala contínua, deriva
```

A expo-out dá a sensação de "peso que desacelera": chega perto do destino muito
cedo e passa o resto do tempo assentando — que é como um objeto físico se
comporta.

Molas, quando usadas em vez de curva:

| Mola | Parâmetros | Overshoot |
|---|---|---|
| `smooth` | damping 200, stiffness 90, mass 0,9 | nenhum — `overshootPercent: 0` |
| `snappy` | damping 26, stiffness 190, mass 0,7 | curto — 1 a 3% |
| `bouncy` | damping 14, stiffness 160, mass 0,8 | visível — acima de 6% |

**`bouncy` para no máximo um elemento por peça.** Duas coisas quicando ao mesmo
tempo viram desenho animado.

Isso casa com o teto do perfil: marca contida usa 0–3; acima de 6 lê como
desenho animado. O validador recusa `overshootPercent` acima de
`dynamics.overshootMaximumPercent`.

---

## 5. Contenção: poucos objetos, muitos estados

O erro que mais degrada uma peça é **inventar um gráfico novo a cada frase**.
Dez gráficos avulsos leem como template genérico.

A regra: **dois ou três objetos que evoluem** ao longo da peça inteira. O mesmo
objeto volta mais tarde num estado diferente e o espectador reconhece — é isso
que produz sensação de sistema, e não de coleção.

Estrutura que funciona: uma linha de progresso que preenche, **quebra** no ponto
do argumento, sai, e **volta** dois blocos depois ainda quebrada, mostrando que
a lacuna nunca foi coberta. Um objeto, três estados, quinze segundos de
narrativa.

No perfil isso é `dynamics.simultaneousMovingElementsMaximum`: acima do limite a
hierarquia deixa de existir, porque dois movimentos dominantes se anulam.
`exceedsSimultaneousLimit` confere cenas que se sobrepõem no tempo.

---

## 6. Cor: um acento por frame

**Nunca dois.** Hierarquia em três níveis:

- **primária** — o texto que carrega a informação (branco / ivory)
- **secundária** — apoio, rótulos, dados (tom dessaturado da primária)
- **acento** — exatamente um elemento, que muda de dono ao longo da peça

Proporção de referência: **70 / 25 / 5**. O acento em 5% da área é o que o faz
funcionar como acento; em 20% vira cor de fundo.

É a regra da contenção aplicada à cor: o destaque só existe porque o resto se
recusa a competir.

---

## 7. Tipografia cinética

Duas famílias: corpo em romana sem-serifa; a palavra que carrega o argumento em
**itálica serifada colorida**, na mesma frase.

A itálica entra **~8% maior** que a sem-serifa ao lado — as duas têm altura-x
diferente e, no mesmo corpo, a serifada parece menor.

**Limite prático: 3 a 8 palavras destacadas numa peça de 30s.** Acima disso vira
ruído e nada se destaca.

---

## 8. Geometria e o que nunca tocar

**Safe zone vertical: 240 a 1680** em 1080×1920 (75% central). Fora disso a
interface do Instagram cobre. Isto derrubou uma composição inteira que colocava
módulos em `y = 1812`.

**Nunca cruzar:** rosto, olhos, boca, mãos e microfone de lapela. Se o traço
passa pelo microfone, ou o bloco sobe, ou fica opaco.

**A pessoa é sempre primeira na hierarquia.** O motion existe em volta, atrás e
abaixo dela — nunca por cima.

**Legenda:** centralizada, 20% abaixo do meio do quadro. Em 1080×1920 isso é
`y = 1344`. A legenda migra de posição quando um painel gráfico está no ar —
duas coisas nunca disputam a mesma faixa.

**Centralização:** títulos no eixo. `flex` **ignora** o `textAlign` do pai;
precisa de `justifyContent: "center"` explícito.

**Evitar cards retangulares convencionais.** Informação estruturada (data,
horário, local) funciona melhor como composição orbital: o dado principal vira
núcleo circular, os secundários viram satélites conectados por linhas.

---

## 9. Lista do que quebra

Erros já pagos. Cada linha custou pelo menos um render.

- **Vídeo com alpha não tem faixa de áudio** — declare a voz separadamente
- **WebM/VP9 com alpha é descartado** por muitos builds de ffmpeg; use **ProRes 4444**
- **Remotion exporta BT.601 full range** por padrão — force `bt709`, ou os players deslocam matiz
- **Loudnorm de uma passada não converge** — sempre duas (−14 LUFS, pico ≤ −1 dBTP)
- **fps 29,97 é `30000/1001`**, não 30 — a 36s a diferença já é um quadro
- **`.ffx` e `.aep` são RIFX binário** — dá para ler nomes de propriedade, não valores de keyframe
- **Fonte precisa de `delayRender`** — sem isso o primeiro quadro sai com fallback e o texto salta de largura
- **Não gere grão pelo ffmpeg** — ruído por pixel é incompressível: medido 609 MB para 20 segundos

Estes são fatos técnicos que valem para qualquer marca. O lugar canônico deles é
[`ExecutionConstraint`](../../../packages/contracts/production/execution-constraint.ts);
esta lista é a fonte editorial de onde eles saem.

---

## 10. Como avaliar antes de renderizar

Renderizar 1100 quadros para descobrir um erro de layout é desperdício. O ciclo
certo é **grade de frames estáticos**: 6 a 8 quadros nos momentos-chave, montados
lado a lado numa imagem só.

Isso revela em segundos o que a linha do tempo esconde: elemento fora da safe
zone, dois textos disputando faixa, acento duplicado no mesmo frame, órbita
cruzando o rosto.

Só depois que a grade está limpa é que vale renderizar.

---

## 11. Escrevendo um `MotionNeed`

Entrada de bloco de texto ancorada na palavra:

```jsonc
{
  "function": "introduce",
  "intensity": "medium",
  "subject": "headline",
  "patternFamily": "slide-settle",
  "behavior": "enter-and-hold",
  "direction": "bottom-up",
  "synchronization": { "anchor": "transcript-word", "cue": "sistema" },
  "envelope": {
    "fps": 30,
    "preferredDurationFrames": 20,
    "overshootPercent": 0,
    "settleFrames": 3
  }
}
```

Revelação que executa literalmente o que a fala nomeia:

```jsonc
{
  "function": "reveal",
  "intensity": "medium",
  "subject": "camada inferior do painel",
  "patternFamily": "mask-reveal",
  "behavior": "enter-and-hold",
  "synchronization": { "anchor": "transcript-word", "cue": "por baixo" },
  "envelope": { "fps": 30, "preferredDurationFrames": 26, "overshootPercent": 2 },
  "avoid": ["cruzar o microfone de lapela"]
}
```

Negação:

```jsonc
{
  "function": "emphasize",
  "intensity": "low",
  "subject": "a palavra negada",
  "patternFamily": "strike-through",
  "synchronization": { "anchor": "transcript-word", "cue": "falta", "offsetFrames": 3 },
  "envelope": { "fps": 30, "preferredDurationFrames": 12 }
}
```

**O que nunca aparece aqui:** `cubic-bezier`, `translateX`, `opacity:`,
`framer-motion`. As curvas do § 4 são conhecimento de execução, não conteúdo do
plano — `validateScenePlan` recusa `motionNeed.function` que descreva mecânica,
porque aí a decisão de execução vazou para o plano e o passo 11 perde a
liberdade de escolher motor.

---

## Relacionado

- [Áudio e verificação](audio-verification.md) — a outra metade: a fala à qual
  este motion serve, e os testes que provam que ela está lá.
- [Passo 8 — VideoAndMotionPlanner](../../../packages/docs/pipeline/passo-8-video-and-motion-planner.md)
  — quem usa este vocabulário.
- [Passo 11](../../../packages/docs/pipeline/passo-11-asset-selection-and-execution-routing.md)
  — quem transforma `MotionNeed` em keyframe.
