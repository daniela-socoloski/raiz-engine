# Gramática de prompt — imagens (Nano Banana)

Fonte da verdade pra escrever os prompts de hero e de variação. Leia antes de escrever o primeiro prompt.

---

## 1. As TAGS BASE — sempre presentes

Todo prompt de imagem deste pipeline carrega este bloco, **verbatim**, salvo a exceção lá embaixo:

```
cinematic, IMAX film still, cinematic lighting, unusual camera angle, subtle 35mm film grain, photorealistic
```

Por que cada uma:

| Tag | O que compra |
|---|---|
| `cinematic` | composição intencional, não catálogo |
| `IMAX film still` | escala, nitidez edge-to-edge, sensação de frame de filme |
| `cinematic lighting` | luz motivada e direcional, não softbox chapado |
| `unusual camera angle` | o que separa um ad de uma foto de e-commerce |
| `subtle 35mm film grain` | textura orgânica; mata o "cheiro de render" |
| `photorealistic` | trava o registro em foto, não ilustração |

**Única exceção:** se o usuário pedir explicitamente ilustração, desenho, 3D estilizado, anime, flat art ou qualquer estética não-fotográfica, **não use as tags base** — elas brigam com o pedido. Nesse caso monte um LOOK SPINE próprio pro estilo pedido e siga o resto do fluxo igual.

> `unusual camera angle` vale pra **câmera**, nunca pro produto. Ângulo pode ser ousado; o produto tem que continuar fiel e legível.

## 1b. O bloco PREMIUM — o produto como objeto de desejo

Isto é propaganda, não documentação. O produto tem que parecer caro, novo e real. Cole este bloco em **todo** prompt de imagem, junto das tags base:

```
Premium product advertising photography. The product is flawless and brand-new: pristine
surfaces, no scratches, no dust, no fingerprints, no smudges, no dents, no scuffs, no wear.
Materials read as real and expensive — accurate specular highlights, true-to-life reflections,
correct roughness and micro-texture for each material. Crisp, clean edges. Physically
plausible light and shadow. Real photograph, not a 3D render, not CGI, not an illustration.
```

Por que cada trecho:

- **"flawless / no scratches…"** — sem isso, o modelo herda o desgaste real da foto de celular. Você quer o produto de vitrine, não o da gaveta.
- **"materials read as real and expensive"** — puxa a resposta especular correta: metal reflete, fosco difunde, vidro refrata. É o que separa premium de plástico.
- **"not a 3D render, not CGI"** — o contrapeso mais importante. Modelos derivam pra render limpo demais, e render limpo demais cheira a fake. Um ad premium parece **fotografado**.

Se o usuário pedir explicitamente um look 3D/render, remova a última linha — o resto continua valendo.

## 2. O LOOK SPINE — a assinatura desta campanha

Depois das tags base, você define um **LOOK SPINE**: 4–6 linhas específicas desta campanha, decididas na Etapa 2 a partir da direção que o usuário escolheu. Ele vai **verbatim em todos os 5 prompts**. É o que faz os 5 frames parecerem do mesmo filme.

Componentes:

1. **Paleta** — 2 ou 3 cores dominantes, nomeadas ("deep petrol blue, warm amber, off-white")
2. **Motivação de luz** — de onde vem e por quê ("single hard key from camera-left, low, like late afternoon through a window; deep falloff to near-black on the right")
3. **Cenário/superfície** — onde o produto está ("brushed concrete slab, matte black seamless backdrop")
4. **Film stock / grade** — ("Kodak Vision3 500T look, slightly lifted blacks, low saturation except the product")
5. **Textura de ar** — ("faint haze catching the key light")

Escreva o spine uma vez em `output/prompts/look-spine.txt` e cole igual em todos.

## 3. Esqueleto do prompt da HERO

```
[TAGS BASE]

[BLOCO PREMIUM]

Product: [descrição literal e minuciosa do produto na foto original — forma, material,
acabamento, cor exata, tipografia e posição do rótulo/logo, proporções].
Reproduce the product EXACTLY as in the attached reference photo: same shape, same label,
same logo placement, same colors, same proportions. Do not redesign, restyle, or invent
any part of the product. The product is pristine — no scratches, dust, fingerprints,
scuffs, dents or wear of any kind.

[LOOK SPINE]

Composition: [enquadramento da hero — o frame mais forte da campanha]. The product is the
dominant element in frame and the sharpest thing in the image. Vertical 9:16 framing with
headroom for the product to move.

Rendering: shallow depth of field, crisp product edges, [material] rendered with accurate
specular response. No text overlays, no watermarks, no logos other than the product's own,
no people.
```

## 3b. Produtos de marca: a TRAVA DE RÓTULO é obrigatória

Se o produto tem rótulo, logo ou texto impresso, escreva o conteúdo **literalmente**, palavra por palavra, em **todos** os prompts — hero e variações. Sem isso o modelo reescreve a tipografia, troca o volume e inventa palavras.

Já aconteceu, num caso real: comprimir o prompt para caber num limite de caracteres fez o volume de um produto de 330 ml virar "250 ml" e "350 ml", e "CERVECERIA" virar "CERVEZERIA". Os frames onde o texto estava por extenso saíram perfeitos; os comprimidos, não.

Formato da trava:

```
The label must read exactly and legibly: [transcreva TUDO — marca, tipografia,
emblemas, volume, teor, razão social, cada linha de texto miúdo]. Do not alter,
translate, misspell or invent any of this text. The volume is [X], never any other number.
```

> **Se um limite de caracteres conflitar com a trava de rótulo, a trava ganha.** Guias de prompt cinematográfico costumam pedir "zero texto na imagem" e impor tetos curtos — foram escritos para imagem autoral, não para ad de marca. Estoure o teto.

**Limite físico:** quando o enquadramento exige o produto pequeno (plano aberto de escala), o modelo não sustenta a tipografia miúda por mais trava que tenha. Nesses planos, aceite e avise o usuário — ou reenquadre.

## 4. Esqueleto do prompt de VARIAÇÃO

Aqui a hero entra como `--image`. O trabalho do prompt é **impedir** o modelo de reinventar:

```
Use the attached image as the exact reference for scene, lighting, color palette, grade,
background, surface and texture. Keep ALL of it identical.

Change ONLY the camera: [novo ângulo/enquadramento específico deste shot].

The product must remain byte-for-byte faithful to the reference: same shape, same label,
same logo, same colors, same proportions, same pristine condition. Same light direction,
same key/fill ratio, same background, same grade, same grain.

[TAGS BASE]

[BLOCO PREMIUM]
```

Repare: nada de novo cenário, nova cor, novo objeto. **Só a câmera muda.**

### 4b. A armadilha da âncora: instrução branda = frame repetido

Ancorar na hero via `--image` tem um efeito colateral forte: **o modelo reproduz o enquadramento da hero** quando a instrução de câmera é vaga. "Plano médio-aberto", "ângulo baixo ao longo do parapeito" e afins são simplesmente ignorados — sai uma cópia da hero com outro flare.

Já aconteceu: numa campanha, `01-hook`, `02-reveal` e `04-action` saíram os **três** praticamente idênticos à hero. Na montagem vira um corte estranho, quatro planos iguais seguidos.

Duas regras:

**1. Abra o prompt negando explicitamente o enquadramento da referência:**

```
Use the attached image ONLY as the reference for lighting, color palette, grade,
background environment, surface and texture. The FRAMING MUST BE RADICALLY DIFFERENT
from the reference - do not reproduce the reference composition or camera position.
New camera: [...]
```

**2. Descreva a câmera com posição física, não com adjetivo:**

| Fraco (vira cópia) | Forte (funciona) |
|---|---|
| "plano médio-aberto" | "afaste até o produto ocupar só o terço inferior, vazio extremo acima" |
| "ângulo baixo" | "lente a centímetros da base, olhando direto para cima ao longo do produto, forte escorço" |
| "outro ângulo" | "de cima, a prumo, vista aérea olhando direto para baixo" |
| "com energia" | "por trás do produto, silhueta em contraluz na borda esquerda do quadro" |

**Antes de animar, ponha os 5 frames lado a lado.** Se dois pudessem passar pelo mesmo plano, regere um: imagem custa ~2 créditos, take custa ~45.

> Ao corrigir uma colisão com a hero, regere a **`04-action`, não a `05-hero`**. A hero foi aprovada pelo usuário e é a âncora de todos os outros frames — trocá-la desfaz a campanha inteira.

## 5. Checklist antes de aprovar um frame

Rode a olho em cada imagem gerada:

- [ ] O produto é reconhecível como o **mesmo** da foto original?
- [ ] Logo/rótulo legível e na posição certa, sem letra inventada?
- [ ] Zero desgaste — sem arranhão, poeira, digital, amassado?
- [ ] O produto é o elemento mais nítido do frame?
- [ ] A luz vem da mesma direção que na hero?
- [ ] A paleta bate com a hero?
- [ ] Nenhuma mão, pessoa ou texto apareceu sem ser pedido?
- [ ] Parece **fotografado**, não renderizado? (plástico liso demais = falhou)
- [ ] O produto parece caro e novo — zero desgaste herdado da foto original?

Um "não" em qualquer linha = regere aquele frame antes de animar. Animar um frame errado custa o dobro.

## 6. Armadilhas conhecidas

- **Texto inventado.** Modelos de imagem alucinam tipografia. Descreva o rótulo literalmente e confira letra por letra no frame gerado.
- **Produto "melhorado".** Se o prompt não travar a forma, o modelo embeleza e você perde a fidelidade. As frases de "reproduce EXACTLY / do not redesign" não são opcionais.
- **Drift de luz nas variações.** Se uma variação vier com a luz de outro lado, o corte vai denunciar. Regere.
- **Ângulo ousado demais.** `unusual camera angle` pode virar um shot em que o produto some. Se ele não é o rei do frame, o ângulo falhou.
