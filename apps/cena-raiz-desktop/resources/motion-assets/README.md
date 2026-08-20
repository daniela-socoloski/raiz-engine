# Motion Asset Registry

Catálogo dos elementos visuais e sonoros que o motor pode usar em uma cena.

Existe porque, sem ele, o planejador só tem duas saídas ruins: inventar um
componente que não existe, ou usar sempre o mesmo. O registro dá a terceira:
escolher entre o que está de fato instalado, e recusar quando nada serve.

## O que existe hoje

9 assets, todos apontando para arquivos reais em `resources/remotion-template/`:

| Asset | Motor | Capacidades | Origem |
|---|---|---|---|
| `caption-stacked` | remotion | caption, emphasis | `src/StackedCaptions.tsx` |
| `caption-scatter` | remotion | caption, energy | `src/ScatterCaptions.tsx` |
| `caption-simple` | remotion | caption | `src/SimpleCaptions.tsx` |
| `headline-pencil-outline` | remotion | headline, emphasis | `src/PencilOutline.tsx` |
| `graphics-custom` | remotion | graphic, clarify, compare | `src/CustomGraphics.tsx` |
| `sfx-whoosh` | media | transition | `public/sfx/whoosh.mp3` |
| `sfx-pop` | media | emphasis, accent | `public/sfx/pop.mp3` |
| `sfx-cut-click` | media | transition, cut | `public/sfx/cut-click.mp3` |
| `sfx-tictac` | media | tension, accent | `public/sfx/tictac.mp3` |

Nenhum asset After Effects, MOGRT ou Lottie está registrado — porque nenhum
existe no repositório. O registro descreve o que há, não o que se pretende ter.

## Como o registro é usado

```
manifestos em disco
      │
      ▼
buildMotionAssetRegistry()   valida cada um; duplicado ou inválido vai para
      │                      `rejected[]`, com ref e motivo — nunca em silêncio
      ▼
selectMotionAssets(query)    filtra por capacidade, formato, marca, duração
      │                      e fontes disponíveis
      ▼
matches[]                    cada um cita assetId, motor, fonte e a lista de
                             razões de compatibilidade
```

O código é puro: não lê disco, não chama rede. Quem lê os arquivos é a camada
que o chama. Isso é o que permite testá-lo inteiro sem montar um projeto.

Duas regras que valem a pena saber:

- **Abstenção é resposta válida.** Se nada é compatível, `matches` vem vazio e
  `rejections` explica o que foi descartado e por quê. Forçar uma escolha ruim
  é pior do que não escolher.
- **Parâmetro não declarado é recusado.** `validateAssetParameters` rejeita
  campo que o manifesto não prevê. Um valor inventado pelo modelo não chega
  ao motor de render.

## Como adicionar um asset

1. Coloque o arquivo em `resources/remotion-template/` (componente `.tsx` ou
   mídia em `public/`).
2. Crie `manifests/<assetId>.json` seguindo o contrato em
   [`src/domain/motion/motion-asset-manifest.ts`](../../src/domain/motion/motion-asset-manifest.ts).
   Copie o manifesto mais parecido e ajuste.
3. Preencha `fingerprint` com qualquer valor e rode:

   ```
   npm run motion:fingerprints -- --write
   ```

4. Rode `npm run test:motion-registry`. Se o manifesto estiver errado, o teste
   diz qual campo e por quê.

## Sobre o `fingerprint`

É o sha256 do arquivo de origem, truncado. Serve para detectar que o
componente mudou depois que o manifesto foi escrito — o caso em que o
manifesto passa a descrever um comportamento que o asset já não tem.

`npm run motion:fingerprints` verifica e falha se houver divergência.
O teste faz a mesma verificação, então isso não passa despercebido.

Quando o verificador acusar divergência, **leia o que mudou no componente
antes de regravar**. Se o comportamento mudou (duração, parâmetros aceitos,
formatos suportados), o manifesto precisa mudar junto; regravar só o
fingerprint esconde o problema em vez de resolver.
