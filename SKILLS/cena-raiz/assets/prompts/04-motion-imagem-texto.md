# Estrutura — Imagem + texto (Seedance)

**Quando usar:** quando existe uma imagem forte — produto, cena, foto, render — e a tipografia entra por cima. Campanha, frase de impacto, oferta, anúncio.

**Funciona em qualquer estilo**, e é a **melhor estrutura para realista/fotográfico**: a cena fica intacta e só a tipografia se move, que é exatamente o que protege uma foto de ser redesenhada.

> **Leia `00-estilos.md` antes de preencher.** Os campos `[STYLE]`, `[CAMERA]` e `[SOUND]` vêm de lá.

**A imagem base** é a cena limpa, **sem texto e sem logo**. O texto entra na animação. Se o texto precisar de tratamento gráfico muito específico (recorte, máscara, textura), aí sim ele entra já composto na imagem — e nesse caso o prompt anima o texto que já existe, em vez de criar.

**O que sobe junto no Seedance:**
1. `output/{slug}/01-frame/frame-XX.png` — a imagem principal aprovada
2. `assets/logo/logo.png` — o logo, **arquivo separado**

---

## Prompt

```
Animate a [15]-second motion-graphics piece from the attached image(s).
[CAMERA: static camera / very slow push-in], [STYLE: vocabulário do estilo
escolhido]. Never redraw, change or reinterpret the image — the scene stays
exactly as attached. Only the typography and graphic elements move. Snappy
easing with slight overshoot on every entrance.

SCENE 1 (0:00 – 0:06) — Image and headline:
- Start on the attached image, already composed, holding still.
- [IF REVEAL] A soft wipe reveals the image from [direction] over the first
  0.4 seconds.
- The headline "[HEADLINE]" animates in over the image, word by word with a
  quick slide + settle, positioned at [posição: top / bottom / left third].
- [IF UNDERLINE] A thin line draws itself under the headline.
- Hold the completed frame.

TRANSITION (at 0:06):
- The headline exits in the direction it came from as the image shifts to
  the second composition described below — a continuous handoff, no cut to
  black, no fade to white.

SCENE 2 (0:06 – 0:12.5) — Second composition:
- [DESCREVA A SEGUNDA TELA: mesmo enquadramento com o produto isolado /
  crop fechado num detalhe / a mesma cena com blocos de cor entrando]
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
- [SOUND: caráter do estilo] — a soft airy whoosh as each line of type
  slides in, a fine tick as it settles.
- A restrained music or ambient bed that matches the mood of the image, low
  in the mix, never competing with the typography.
- One clean transition sweep at [0:06].
- A single soft impact on the logo pop, then a short tail into silence.
- No voiceover, no dialogue, no lyrics, no stock-music swell.

Total duration exactly [15] seconds. [No camera movement,] no added
elements, no re-rendering of the scene, energetic but clean rhythm.
[TRAVA DO ESTILO — copie de 00-estilos.md]
```

---

## As travas que não se mexe

- `the scene stays exactly as attached` + `Only the typography and graphic elements move` — este é o par mais importante deste template. Sem ele o Seedance começa a animar a própria imagem (mexe o produto, muda a luz, redesenha o rosto).
- `no re-rendering of the scene` — reforço da mesma trava no fecho do prompt.
- `no cut to black, no fade to white` — o modelo tende a resolver transição com fade quando não é proibido.
- `No voiceover, no dialogue, no lyrics, no stock-music swell` — o áudio é sempre ligado, e sem essa linha o modelo tende a narrar a peça como se fosse comercial de TV.
- `Total duration exactly N seconds` — igual às outras estruturas.
- **A trava do estilo**, copiada de `00-estilos.md`.

**Câmera:** parada é o padrão. Em realista e 3D, um push-in muito lento dá vida sem quebrar nada — nesse caso remova `No camera movement` e mantenha `no re-rendering of the scene`.

## Regra da tipografia

- **Headline: no máximo 8 palavras.** Frase que não cabe em uma linha e meia na vertical não funciona.
- Diga a **posição** no prompt (`top third`, `bottom left`, `centered over the lower band`). Sem posição, o texto pousa em cima do assunto da imagem.
- Não peça fonte por nome — o Seedance não tem a fonte. Peça o **caráter**: `bold condensed sans`, `clean geometric sans`, `editorial serif`.
- Texto que precisa ser exato (nome de produto, preço, marca) tem risco de sair com erro de letra. Quando for crítico, componha o texto **na imagem estática** e anime só a revelação.

## Se a imagem for foto realista

Este é o único template que aceita base fotográfica. Nesse caso reforce no prompt:

```
The photographic image must remain untouched: no relighting, no depth
effects, no parallax, no generated motion inside the photo.
```
