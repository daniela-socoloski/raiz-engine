# Gentle Monster — projeto de estudo

`resultado/DNA.md` é a fonte da verdade. `resultado/DNA.pdf` é a versão apresentável.

**Leia o DNA inteiro antes de criar, auditar ou editar qualquer peça neste projeto.** Ele não é resumo:
carrega paleta medida, tipografia identificada por download de arquivo, estrutura de legenda extraída de
60 posts e a lógica por trás de cada decisão.

## O que é esta marca

Gentle Monster é uma marca sul-coreana de óculos, fundada em 2011, com 2,4 milhões de seguidores no
Instagram. Este projeto é **estudo de marca real** — não é uma marca do aluno. A finalidade é entender e
replicar o método.

**A equação central:** fotografia fria, clínica e sem drama abrigando um objeto deliberadamente bizarro.
A técnica é impecável justamente para que a premissa possa ser absurda.

- **Visual:** núcleo neutro permanente (cinza-claro frio `#F3F4F6`, branco, preto `#0A0A0A`) mais uma cor
  de campanha que domina um ciclo e depois desaparece por completo
- **Tipografia:** GentleMonster Serif no display, ABC Favorit Book no texto. Serifa de alto contraste no
  nome, sans-serif neutra no resto
- **Voz:** uma frase poética, um bloco técnico de design, um bloco logístico com data e endereço. Sem
  venda, sem segunda pessoa, sem explicação da própria estética
- **Cadência:** rajada de 4 a 8 posts na semana de lançamento, silêncio entre ciclos

## Pedidos que fazem sentido aqui

- "Gera uma campanha no método Gentle Monster para [outro produto]"
- "Escreve uma legenda no padrão de três blocos"
- "Audita essa peça contra o DNA"
- "Qual é a diferença entre o modo clínico e o modo cinematográfico?"
- "Como replicar o sistema de cor rotativa em uma marca de [categoria]?"
- "Monta um prompt de imagem com as âncoras visuais da seção 3.8.12"

## Regras ao produzir neste projeto

1. **Uma cor de campanha por vez.** Duas cores fortes na mesma peça quebram o sistema
2. **Nunca explique a imagem no texto.** Se a legenda justifica a foto, a foto está fraca
3. **Nunca use segunda pessoa** dirigida ao público. A marca não conversa, apresenta
4. **Nunca sorria no casting.** Expressão neutra é regra, não estilo
5. **O bloco logístico é inegociável.** Data por país e endereço completo entram mesmo que fiquem longos

## Sobre limites

O DNA declara o que foi observado, o que foi medido e o que é hipótese. As páginas internas do site
estavam bloqueadas por proteção anti-bot na coleta; a tipografia foi confirmada por download direto dos
arquivos, não por declaração da marca. Mantenha essa honestidade em qualquer material derivado.

## Evolução

Feedback aprovado atualiza `resultado/DNA.md` e, quando muda a operação, este arquivo também. Depois de
qualquer mudança relevante, gere de novo o PDF:

```bash
python3 "scripts/render-dna-pdf.py" "projetos/gentle-monster"
```
