# Áudio e verificação

Números e procedimentos. Cada valor aqui veio de medição, não de convenção.

Este documento é **conhecimento, não motor**. Ele descreve o que precisa ser
verdade no resultado e como provar — não qual ferramenta chamar.

## Onde isto entra nos contratos

| Conceito daqui | Onde vive |
|---|---|
| Papel do som na cena | `ScenePlan.audioNeed.role` |
| Princípios sonoros da marca | `SoundProfile.principles`, `musicPolicy` |
| Fato técnico que quebra o render | [`ExecutionConstraint`](../../../packages/contracts/production/execution-constraint.ts) |
| Silêncios e palavras medidos | `ContentAnalysis.transcript`, fatos `silence` e `speech` |
| Os nove testes | passo 12 — readback e revisão |

A ligação com a [gramática de motion](motion-grammar.md) é direta: lá a regra
raiz é *o motion serve à fala*. Aqui está a fala — e os testes que provam que
ela está mesmo na mixagem.

---

## 1. Cadeia da voz

Aplicada antes de qualquer mixagem:

```
passa-alta 80 Hz          tira ruído de sala e sopro
corte -2,5 dB em 200 Hz   remove o "abafado" da região média-grave
compressor 3:1, -20 dB    aproxima os picos dos vales
presença +2,5 dB em 3,2k  inteligibilidade das consoantes
ar +3 dB em 9k            brilho, sem sibilância
de-esser                  controla o "s"
limitador 0,95            teto de segurança
```

Uma voz crua ao lado de um anúncio profissional soa amadora — não por falta de
volume, mas de tratamento.

---

## 2. Níveis de entrega

| Medida | Alvo | Por quê |
|---|---|---|
| Loudness integrado | **−14 LUFS** | padrão das plataformas; fora disso elas reequalizam e o vídeo "abaixa" no feed |
| True peak | **≤ −1 dBTP** | a recompressão da plataforma gera picos; sem folga, distorce |

**Sempre loudnorm de dois passos.** O de passe único não converge: mede e aplica
ao mesmo tempo, e erra o alvo em vários dB. Medido: passe único deixou **−11,9**
quando o alvo era −14.

Este é um fato técnico, não uma preferência — vale para qualquer marca. O lugar
canônico dele é `ExecutionConstraint`, não `CreativePreference`.

---

## 3. Música sob locução

A trilha precisa existir sem competir. Duas medidas:

- **~20 dB abaixo da voz** durante a fala;
- **subindo nas pausas**, para a peça respirar.

O recuo é desenhado sobre os **silêncios medidos** na transcrição, nunca por
compressor automático — assim cada subida cai exatamente num silêncio real, e
nunca por cima de uma palavra.

É a mesma regra raiz da gramática de motion, aplicada ao som: o tempo vem da
transcrição, não do olho. Os fatos `silence` da
[`ContentAnalysis`](../../../packages/contracts/production/content-analysis.ts)
são a fonte desse desenho.

**Trilha dinâmica exige mapa próprio.** Uma cama estática aceita volume único.
Uma faixa com clímax (LRA alto) precisa de recuo mais fundo justamente onde ela
sobe — que costuma ser onde a fala está mais importante.

---

## 4. Os nove testes

`scripts/verify.mjs`

| Teste | Reprova quando | O que fazer |
|---|---|---|
| Dimensão | fora de 1080×1920 / 1080×1080 / 1920×1080 | conferir a composição |
| Taxa de quadros | fora de 24–60 | conferir o `fps` do Root |
| Espaço de cor | ≠ bt709 | rodar `master.mjs` |
| Faixa de cor | ≠ tv | rodar `master.mjs` |
| Loudness | fora de −14 ±1,5 | rodar `master.mjs` |
| True peak | > −1 dBTP | rodar `master.mjs` |
| Voz na mixagem | fala < 10 dB acima das pausas | ver § 5 |
| Buraco de imagem | preto no meio da peça | conferir a linha do tempo |
| Legendas cabem | fala termina depois do vídeo | conferir duração |

Estes testes são o readback do passo 12: o resultado é medido contra o que foi
prometido, e a medição é que autoriza a entrega.

---

## 5. O teste de voz, em detalhe

É o mais valioso e o menos óbvio.

**O que mede:** a energia nos instantes em que a transcrição diz que há palavra,
contra a energia nas pausas.

**Por que não filtro de frequência:** a primeira versão isolava 300–3400 Hz —
a banda da voz — e **passava um vídeo só com música**, porque música ocupa a
mesma faixa. O sinal confiável é **temporal**, não espectral.

**Valores medidos na mesma peça:**

| Situação | Delta |
|---|---|
| Mixagem correta | **15,9 dB** |
| Só trilha, sem locução | **6,4 dB** |
| Captions de outra edição | **1,2 dB** |

Limiar em 10 dB, com folga dos dois lados.

**O terceiro caso importa:** delta próximo de zero quase nunca é mixagem muda —
é `captions.json` de **outra edição**, com tempos que não batem. O verificador
distingue os dois e diz a causa certa.

> Um teste que aponta a causa errada é pior que teste nenhum.

Esse é o mesmo princípio dos validadores do pipeline: recusar dizendo **qual**
campo e **por quê**, em vez de reprovar em bloco.

---

## Relacionado

- [Gramática de motion](motion-grammar.md) — a fala à qual todo o movimento se
  ancora.
- [Passo 6 — ContentAnalysis](../../../packages/docs/pipeline/passo-6-content-analysis.md)
  — de onde vêm as palavras e os silêncios medidos.
- [Passo 12](../../../packages/docs/pipeline/passo-12-review-delivery-and-creative-memory.md)
  — onde estes nove testes viram portão de entrega.
