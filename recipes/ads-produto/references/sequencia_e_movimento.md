# Sequência e movimento — os 5 takes

Os 5 frames não são 5 fotos bonitas: são 5 **takes** de uma peça de 15s. Cada still já nasce pensado como o primeiro frame de um movimento.

---

## Os papéis dos 5 shots

Cada take é gerado com 5s e entra no corte final com 3s — veja "Duração" logo abaixo.

| # | Nome | Papel na timeline | Enquadramento | Movimento (Seedance) |
|---|---|---|---|---|
| 1 | `01-hook` | **Para o scroll.** Ganha ou perde o ad. | O mais estranho e magnético: macro extremo, contra-plongée agressivo, produto entrando no quadro, silhueta contra a luz | Movimento rápido e assertivo — push-in veloz, whip que resolve no produto, algo que se revela no primeiro terço do take |
| 2 | `02-reveal` | Mostra o produto inteiro. Responde "o que é isso?" | Plano médio, produto completo, respiro em volta | Movimento amplo e fluido — dolly lateral lento, arco de câmera, órbita parcial |
| 3 | `03-detail` | Vende a qualidade. Textura, material, acabamento. | Macro numa parte específica: costura, rosca, textura, borda do rótulo | Movimento mínimo e preciso — deslize lento com rack focus, luz varrendo a superfície |
| 4 | `04-action` | Dá vida. Contexto de uso ou energia física. | Produto em uso, em queda, girando, com elemento do cenário em movimento | Movimento com energia real — rotação, elemento passando, partícula/vapor/líquido |
| 5 | `05-hero` | **Fecha.** A imagem que fica na cabeça. É a hero aprovada. | O frame da campanha | Movimento contido e nobre — push-in lento e sutil, ou câmera quase parada com só a luz respirando |

## Ordem de montagem

```
01-hook → 02-reveal → 03-detail → 04-action → 05-hero
```

É uma curva: choque → compreensão → desejo → energia → memória.

## Duração: gera 5s, entrega 3s

O Seedance gera cada take com **5 segundos**. O ad final tem **15 segundos exatos** — porque vai rodar em ads, onde a duração é contrato. A conta fecha no `stitch.sh`, que corta cada take pra 3.0s (15 ÷ 5) e concatena.

Isso **não é desperdício** — é margem de segurança, e muda como você escreve o prompt de movimento:

- Modelos de vídeo costumam ter o primeiro meio-segundo instável (o frame "acordando") e às vezes derrapam no fim. Com 5s gerados e 3s usados, você descarta as pontas ruins.
- O `ANCHOR` decide **qual** pedaço sobrevive:
  - `end` (default) — os últimos 3s, onde o movimento **resolve e assenta**. É o que funciona pra reveal, detail, action e hero.
  - `start` — os primeiros 3s. Use no **hook**: o gancho precisa da energia do arranque, não da acomodação.
  - `middle` — o miolo, descartando entrada e saída.

Recomendação padrão:

```bash
ANCHOR_OVERRIDES="01-hook:start" bash .../stitch.sh output/04-takes output/05-final/ad-15s.mp4
```

**Escreva o movimento pensando nos 3s que vão sobrar**, não nos 5 gerados. Um push-in que só resolve no segundo 4,5 vai ser cortado fora se o anchor for `start`. Se você quer um movimento que resolve tarde, deixe o anchor em `end`.

## Como escrever um prompt de movimento

A cena **já está no frame**. O prompt de movimento descreve só o que se move — e, principalmente, o que **não** se move.

Fórmula:

```
[movimento de câmera específico, com velocidade]. [o que acontece na cena, se algo].
The product stays perfectly still, sharp and fully in frame throughout, with no deformation,
no morphing, no change to its shape, label or colors. Lighting and background stay constant.
No text, no people, no camera cuts.
```

Exemplos (adapte ao produto real):

- **hook** — `Fast push-in toward the product, decelerating into a locked frame in the final second. The product stays perfectly still, sharp and fully in frame throughout, with no deformation or morphing. Lighting and background stay constant. No text, no people, no cuts.`
- **reveal** — `Slow lateral dolly from left to right, revealing the full product as the background parallaxes gently behind it. The product stays perfectly still and sharp...`
- **detail** — `Extremely slow slide across the surface with a subtle rack focus pulling sharpness onto the texture. The product stays perfectly still and sharp...`
- **action** — `The product rotates slowly on its vertical axis while a faint drift of haze crosses the key light. The product itself does not deform or change shape...`
- **hero** — `Almost imperceptible push-in, under 5% of frame width, with the key light breathing very slightly. The product stays perfectly still, sharp and centered...`

## Regras de movimento que não se quebram

1. **O produto não deforma.** Modelos de vídeo adoram derreter geometria. A frase anti-deformação vai em **todos** os 5 prompts.
2. **Movimento contínuo, sem corte.** Cada take é um plano só. Peça `no camera cuts` explicitamente — o corte é trabalho do ffmpeg, não do modelo.
3. **Nada de texto.** Overlay entra depois, se entrar. Modelo gerando texto = texto errado.
4. **Direção de luz constante.** Se a luz gira no meio do take, o corte pro próximo frame quebra.
5. **Um movimento por take.** Push-in *ou* órbita, não os dois. Movimento composto em 3s vira confusão.
6. **Energia alternada.** Rápido (hook) → amplo (reveal) → mínimo (detail) → enérgico (action) → contido (hero). Cinco takes na mesma velocidade dão sono.

## Consistência de animação entre os takes

Os 5 takes são cortes de um filme só. O que os une não é só o frame de origem — é a **gramática de movimento**. Mantenha constante em todos os 5 prompts:

- **A mesma linguagem de câmera.** Se a campanha é de câmera em trilho, todos os takes são em trilho. Não misture Steadicam nervoso com dolly nobre.
- **A mesma inércia.** Movimentos com aceleração suave (ease in/out) do começo ao fim. Um take com movimento linear e mecânico no meio de quatro orgânicos denuncia.
- **A mesma escala de deslocamento.** Nada de um take atravessando o cenário inteiro e o seguinte se mexendo 2%. A variação é de *tipo* de movimento, não de magnitude bruta.
- **A luz nunca gira.** Se a direção da key muda dentro de um take, o corte pro próximo quebra a ilusão de continuidade.

Cole em **todos** os 5 prompts de movimento, verbatim, este bloco de trava:

```
The product stays perfectly still, sharp, undistorted and fully in frame throughout: no
morphing, no warping, no melting, no change to its shape, label, logo, text or colors, no
flicker. Lighting direction, color palette and background remain constant for the entire
shot. Smooth eased camera motion, continuous single take, no cuts, no text overlays,
no people, no hands.
```
