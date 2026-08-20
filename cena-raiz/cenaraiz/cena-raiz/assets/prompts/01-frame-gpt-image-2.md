# Template — Imagem estática (GPT Image 2)

Formato obrigatório do prompt da **etapa 1**. Leia junto com `00-estilos.md`.

## Antes de escrever: qual estilo?

**Não existe estilo padrão.** O estilo vem da pessoa — 2D flat, colagem, 3D, realista, mixed media, ilustração, ou qualquer outro. Pegue o vocabulário em `00-estilos.md` e escreva o prompt naquele universo. Se você escrever "flat 2D paper-cutout" por hábito, todo projeto sai igual.

## O que essa imagem precisa ser

**Uma tela só, com todos os elementos da cena.** É a matéria-prima que o Seedance recebe.

O que ela precisa entregar depende da **estrutura** do motion:

| Estrutura | O que a imagem precisa garantir |
|---|---|
| **Camadas** | Elementos separáveis: silhueta legível, fundo distinto dos objetos, sobreposição pequena. O Seedance vai recortar cada um para animar a entrada. |
| **Cartelas** | O sistema visual completo de uma cartela: fundo, blocos, hierarquia tipográfica. As próximas reusam o sistema. |
| **Imagem + texto** | A cena limpa, **sem texto e sem logo**. A tipografia entra na animação. |
| **Câmera** | Objeto ou cena coerente no espaço, com material e luz definidos. A câmera vai se mover em volta — o que estiver mal resolvido vai aparecer. |

## Proibições absolutas — em qualquer estilo

- **Sem logo, sem marca, sem nome de empresa, sem assinatura.** O logo entra depois, no Seedance, como camada separada.
- Sem marca d'água, sem UI de app, sem barra de menu.
- Sem texto, **exceto** quando o texto for parte da composição pedida — aí escreva a frase exata entre aspas.
- Sem moldura, borda ou passe-partout. Composição sangrando até a borda.

## Estrutura do prompt

Escreva em **inglês**, em prosa corrida, nesta ordem. Cada bloco vira uma ou duas frases — sem bullets no prompt final.

```
1. FORMATO E ESTILO
   Aspect ratio + o vocabulário do estilo escolhido, tirado de 00-estilos.md.
   Este é o bloco que muda tudo. Seja específico: não "3D", mas
   "3D render, soft global illumination, matte ceramic and brushed steel".

2. CENA / FUNDO
   A camada de trás: cor, ambiente, cenário, textura, estúdio.
   Em estrutura de camadas, descreva como camada — o motion começa com ela
   sozinha na tela.

3. ELEMENTOS DE BASE
   Painéis, blocos, superfícies, arquitetura, formas grandes que estruturam
   a composição. Posição de cada um.

4. SUJEITOS / PRODUTO
   Personagens, produto, objetos. Um por um, com posição, escala e pose.

5. DETALHES E GRAFISMOS
   Setas, marcadores, números, pontinhos, hachuras, partículas, reflexos.
   Em estilos gráficos é a camada que "se desenha" no motion.

6. LUZ
   De onde vem, que qualidade tem. Em 2D flat é "flat lighting"; em 3D e
   realista é decisão de direção de fotografia.

7. PALETA
   3 a 5 cores nomeadas. Diga qual domina.

8. ACABAMENTO
   Grão, textura, material, profundidade de campo, serrilhado, halftone.

9. TRAVAS
   A trava do estilo (em 00-estilos.md) + "no logo, no brand marks,
   no frame or border, full-bleed composition."
```

## Exemplos por estilo

**Colagem, estrutura de camadas:**

> Vertical 9:16 flat 2D paper-cutout collage with subtle print texture. Background is a warm off-white paper sheet with a faint light-blue grid, edge to edge. Three large cut-paper panels structure the frame: a deep-blue rounded rectangle upper third, a mustard circle behind center, a terracotta band across the bottom. Centered, a cut-out figure of a woman in a green coat, waist up, clean closed silhouette. To her left a cut-out cardboard box, to her right a flat front-view smartphone. Fine white line-work on top: a dashed arrow curving from box to phone, two thin circles marked "1" and "2", small white dots along the bottom band. Flat lighting. Palette: deep blue, mustard, terracotta, off-white, one green accent — blue dominates. Visible paper grain, serrated cut edges, slight off-register printing. No realistic shadows, no 3D render, no photographic texture, no logo, no brand marks, no frame or border, full-bleed composition.

**3D, estrutura de câmera:**

> Vertical 9:16 3D render with physically based materials and soft global illumination. A seamless deep-teal studio backdrop curves into the floor. Centered on a low matte-white cylindrical plinth, a ceramic skincare bottle in warm sand color with a brushed steel cap, standing upright, front-facing. Two smaller ceramic forms sit behind at different heights, slightly out of focus. Thin steel rings float around the plinth at staggered angles. Key light from upper left, large soft box, with a cool rim from behind right. Palette: deep teal, warm sand, brushed steel, off-white — teal dominates. Shallow depth of field, subtle surface imperfection on the ceramic, clean specular highlights. Consistent materials and lighting throughout, the object never changes shape or proportion. No logo, no brand marks, no frame or border, full-bleed composition.

**Realista, estrutura de imagem + texto:**

> Vertical 9:16 photographic image, 50mm lens, natural window light from the left, shallow depth of field, fine film grain. A woman in her thirties sits at a light-wood kitchen table in the morning, holding a ceramic mug with both hands, looking off-frame right, relaxed. Behind her, a softly out-of-focus kitchen with pale tiles and a single plant. Realistic skin texture and fabric. Palette: warm white, pale wood, soft green, muted terracotta — warm white dominates. The lower third stays visually calm and uncluttered. No text anywhere in the image. No logo, no brand marks, no frame or border, full-bleed composition.

## Parâmetros de render

| Parâmetro | Valor |
|---|---|
| Modelo | `gpt_image_2` |
| Aspect ratio | `9:16` Reels · `1:1` feed · `16:9` YouTube · `4:5` feed alto |
| Resolução | `2k` (padrão) · `4k` quando o cliente for exigente |
| Referências | `--reference` para estilo/produto. **Nunca o logo.** |

```bash
python3 scripts/gerar_frame.py render "output/{slug}/01-frame/prompt-frame.txt" \
  --aspect-ratio "9:16" --resolution 2k \
  --output-dir "output/{slug}/01-frame" --output-name "frame-01.png"
```

## Quando houver referência

Referência guia **estilo, composição, densidade e paleta**. Nunca copie o conteúdo, o texto, a marca ou o layout exato dela. Descreva no prompt o que você quer *daquele jeito*, não *aquela imagem*.

Se a referência da pessoa contradiz o estilo que ela pediu de boca, pergunte qual manda antes de gerar.
