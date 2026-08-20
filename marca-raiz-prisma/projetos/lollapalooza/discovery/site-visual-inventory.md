# Inventário visual — site oficial e redes

## Fontes varridas

| Fonte | Status | O que rendeu |
|---|---|---|
| `lollapaloozabr.com` (home, ao vivo) | Analisado | Site em entressafra: só grade de 20+ logos de patrocinador e logo principal. Sem fotografia. |
| `lollapaloozabr.com/information` | Analisado | Página de regras, ingressos, horários, política de meia-entrada e cancelamento. Fonte primária de microcopy institucional. |
| CSS do site (359 KB) | Analisado | Sistema tipográfico e paleta declarados em código. |
| Snapshots do site na edição 2026 (arquivo) | Analisado | 98 arquivos recuperados: cartaz de line-up, grades de horário, elementos gráficos, key visuals, logos. |
| Instagram `@lollapaloozabr` | Analisado (texto/métrica) | 60 posts com legenda e métrica. Mídia não baixada — ver limite abaixo. |
| X `@LollapaloozaBr` | Analisado | 384,6 mil seguidores. Amostra de posts + key visual 2027 do banner. |
| Threads `@lollapaloozabr` | Analisado (parcial) | 239 mil seguidores, 4 posts visíveis sem login. |
| TikTok `@lollapaloozabr` | **Bloqueado** | Verificação anti-bot travou a página. Não foi possível ler. |

## Limite de acesso registrado

As fotos publicadas no Instagram não puderam ser baixadas: este ambiente bloqueia
tráfego binário e URLs assinadas de CDN vindas do navegador. Isso afeta a
fotografia de show e de público — justamente o repertório mais forte da marca.
As legendas, métricas e formatos foram capturados por inteiro.

## Tipografia encontrada no site

Ordem por peso de uso no CSS:

1. **Anton** — 203 ocorrências. Display dominante. Grotesca condensada, muito pesada, caixa alta. É a voz gráfica dos títulos e do cartaz.
2. **Golos Text** — 96 ocorrências. Texto corrido e interface.
3. **Barlow** — 58 ocorrências. Apoio, grades e tabelas.
4. **Inter** — 55 ocorrências. Herança de sistema/Webflow.
5. **Ovink** (The Northern Block) — 21 ocorrências. Uso pontual, tom mais expressivo.
6. **Comicraft CCShake** — 5 ocorrências. Uso decorativo e raro, de humor.

O logotipo Lollapalooza é lettering proprietário, não é nenhuma dessas fontes:
letras desenhadas, bojos fechados, contorno grosso, com sombra dura deslocada.

## Cores extraídas do CSS

| Hex | Papel observado | Frequência no CSS |
|---|---|---|
| `#FFFFFF` | Texto sobre fundo escuro, contorno de tipografia | 110 |
| `#000000` | Tipografia principal do cartaz, fundos de bloco | 74 |
| `#D9B0DF` | Lilás — acento recorrente | 27 |
| `#17120F` / `#171714` / `#16120F` | Família de pretos quentes, fundo editorial | 26 somadas |
| `#FB4A40` / `#FF493C` / `#DD695C` / `#F86242` | Família vermelho-coral — cor de chamada e CTA | 21 somadas |
| `#ECB4E5` / `#ECB4E4` | Rosa claro, par do lilás | 10 |
| `#32C3E2` | Ciano — cor de fundo dominante nas peças de 2026 | 6 |
| `#00AE9A` / `#01AE9A` | Verde-água — cor de fundo dominante no key visual de 2027 | 9 |
| `#0A1946` | Azul-marinho profundo | 7 |
| `#DF0026` | Vermelho saturado do logo em badge | 4 |

Leitura: a marca não tem uma cor fixa. Tem um **sistema de troca anual**. O ciano
de 2026 virou verde-água em 2027; o que se mantém é a estrutura — fundo saturado,
tipografia preta pesada por cima, vermelho-coral como cor de tensão, e a dupla
lilás/rosa como respiro.

## Sistema visual observado nas peças

**Cartaz de line-up 2026** (`SITE_LOLLA_LINE-UP_POR_DIA_13.10_PH_V5_CARTAZ.webp`) —
a peça mais completa do acervo. Fundo em campos irregulares de ciano e verde-água
com borda rasgada, como papel colado. Nomes das atrações em grotesca condensada
preta, hierarquia em três degraus por dia (headliner gigante, meio, base). Raios
amarelos como separador entre headliners. Faixas de dia em cápsula branca com
listras laterais. Nas bordas: recortes fotográficos em preto e branco com retícula
grossa (mão em chifrinho, público de braços erguidos), linhas onduladas
desenhadas à mão, formas orgânicas em lilás e rosa. Rodapé escuro com a fileira
de patrocinadores.

**Grades de horário por dia** (`feed-sex.webp`, `feed-sab.webp`) — mesma família,
outro registro. Fundo verde-água com textura de tinta lavada e borda irregular.
Tabela de quatro palcos em cartões brancos com sombra dura. Faixa amarela de
"abertura dos portões". Coluna de horas em cápsulas escuras. Prova que o sistema
aguenta informação densa sem perder identidade.

**Key visual 2027** (banner do X) — verde-água chapado, campo vermelho preenchido
com o número 15 repetido em padronagem, recorte fotográfico em preto e branco de
uma pessoa saltando e de uma mão em chifrinho, flor rosa ilustrada em estilo
botânico antigo, linhas de contorno brancas tracejadas. Logo em caixa branca com
sombra, data em condensada pesada.

**Elementos gráficos isolados** (`elementos-esquerda.png`, `elementos-direita.png`,
`detalhes-lineup.png`, `divisor-banner.png`) — o kit de peças soltas do sistema:
squiggles, raios, listras, cápsulas e recortes. Confirma que a marca opera por
biblioteca de elementos combináveis, não por template fechado.

## O que ainda falta

Fotografia real de show e de público em alta resolução. É o material que sustenta
a página de galeria e o estudo de luz do PDF, e é o que está preso atrás do
Instagram. Ver `discovery/pendencias-visuais.md`.
