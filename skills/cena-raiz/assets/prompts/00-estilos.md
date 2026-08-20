# Biblioteca de estilos

**Leia antes de escrever qualquer prompt — o da imagem e o da animação.**

Este projeto tem **dois eixos independentes**:

```
        ESTILO  ×  ESTRUTURA
        ───────    ─────────
        Como a     Como ela
        peça se    se move
        parece
```

O estilo é **escolha da pessoa**. Não existe estilo padrão. Colagem 2D é *um* dos seis, não o default — se você cair nele por hábito, todo projeto sai igual.

A estrutura vem da ideia (ver `README.md`). Quase toda combinação funciona:

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

## 1. 2D flat / vetor

Cores chapadas, formas geométricas, zero profundidade. Corporativo moderno, explicativo, tech.

- **Imagem:** `flat 2D vector illustration, solid color fills, geometric shapes, clean edges, no gradients or subtle two-stop gradients only, generous negative space`
- **Câmera no motion:** parada. Movimento de câmera em arte chapada parece erro de render.
- **Animação:** slide, pop, scale, wipe. Easing snappy com overshoot leve.
- **Som:** clicks digitais limpos, swish curto, base rítmica seca.
- **Genre do Seedance:** `auto`
- **Trava:** `no realistic shadows, no 3D render, no photographic texture, flat lighting`

## 2. Colagem / paper-cutout

Recorte de papel, textura de impressão, stop-motion. Artesanal, editorial, caloroso.

- **Imagem:** `flat 2D paper-cutout collage, visible paper grain, slightly serrated cut edges, subtle off-register printing, hard drop shadow of cut paper`
- **Câmera no motion:** parada. A graça é o elemento se mover, não a câmera.
- **Animação:** slide com bounce, rotação leve na entrada, line-work que se desenha.
- **Som:** foley de papel — swish de recorte, tap de papel sobre papel, ticks de caneta.
- **Genre do Seedance:** `auto`
- **Trava:** `no realistic shadows, no 3D render, no photographic texture`

## 3. 3D render / CGI

Volume, material, luz global. Produto, tech, premium, abstrato.

- **Imagem:** `3D render, physically based materials, soft global illumination, [matte/glossy/metallic/translucent] surfaces, shallow depth of field, studio lighting from [direção]`
- **Câmera no motion:** **livre.** Órbita, turntable, push-in, dolly lateral. É onde o 3D brilha — usar câmera parada aqui joga fora o estilo.
- **Animação:** rotação contínua, elementos flutuando, materiais reagindo à luz, montagem de peças no espaço.
- **Som:** graves suaves, whoosh com corpo, um impacto com sustain no fecho. Menos foley, mais textura.
- **Genre do Seedance:** `auto`, ou `epic` quando for reveal de produto premium.
- **Trava:** `consistent materials and lighting across the whole piece, the object never changes shape or proportion`

## 4. Realista / fotográfico

Foto tratada, live-action, cena real. Campanha, lifestyle, produto em contexto.

- **Imagem:** `photographic, [50mm/85mm/wide] lens, [natural/studio/golden hour] light, realistic materials and skin, shallow depth of field, film grain`
- **Câmera no motion:** movimento **discreto** — push-in lento, parallax leve, drift. Nunca corte dentro da mesma cena.
- **Animação:** a cena praticamente não se move; o que se move é a tipografia e os grafismos por cima.
- **Som:** ambiente da cena, base musical contida, sem foley cartunesco.
- **Genre do Seedance:** `drama` para emocional, `epic` para grandioso, `auto` na dúvida.
- **Trava crítica:** `the photographic image must remain untouched: no relighting, no depth effects, no generated motion inside the photo, no face or product redraw`

## 5. Mixed media

Foto recortada com grafismo, traço e tipografia por cima. Streetwear, cultural, editorial ousado.

- **Imagem:** `mixed media composition: cut-out photographic elements over [flat color blocks / paper texture / halftone], hand-drawn line work on top, visible collage seams, halftone dots`
- **Câmera no motion:** parada, ou push-in bem lento.
- **Animação:** foto entra inteira, grafismo se desenha por cima, tipografia com deslocamento.
- **Som:** híbrido — foley de papel nos grafismos, base rítmica mais presente.
- **Genre do Seedance:** `auto`
- **Trava:** `the photographic cut-outs are never redrawn or relit, only moved`

## 6. Ilustração / desenho

Traço autoral: aquarela, nanquim, anime, editorial, risografia. Narrativo, humano, expressivo.

- **Imagem:** `[watercolor / ink line / anime cel / risograph / editorial] illustration, [visible brush texture / clean linework / limited palette], hand-made feel`
- **Câmera no motion:** parada. Se quiser vida, use parallax de camadas, não movimento de câmera.
- **Animação:** elementos entram desenhando-se, traço que cresce, fade com textura.
- **Som:** foley suave, base melódica leve.
- **Genre do Seedance:** `auto`
- **Trava:** `never redraw the artwork, keep the exact line quality and palette of the attached image`

---

## Como usar

1. **Na conversa**, pergunte o estilo se a ideia não deixar óbvio (ver `../CLAUDE.md`, Passo 2).
2. **No prompt da imagem**, use o vocabulário do bloco *Imagem* e a *Trava* do estilo escolhido.
3. **No prompt da animação**, use o bloco *Câmera*, *Animação* e *Som*, e leve a mesma *Trava*.
4. **No gerador de vídeo**, use o `--genre` indicado.

O estilo tem que aparecer **igual** nos dois prompts. Imagem 3D com prompt de animação escrito para colagem é o erro mais caro deste projeto: o modelo redesenha tudo tentando conciliar.

## Estilo fora da lista

A pessoa pode pedir qualquer coisa — pixel art, claymation, retrô 80s, blueprint técnico. Não force para dentro dos seis. Escreva os quatro blocos (imagem, câmera, animação, som) para o estilo pedido, seguindo a mesma lógica, e decida se a câmera pode se mover.
