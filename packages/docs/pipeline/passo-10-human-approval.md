# Passo 10 — Aprovação humana

**Responde:** esta direção pode ser produzida.

**Não responde:** como produzir. Aprovar um plano não escolhe asset nem motor.

> **Estado: planejado.** Nenhuma implementação. O contrato do plano prevê
> `status: 'approved'`, mas nada além de um campo o distingue de `draft`.

## Lê e produz

| Lê | Produz |
|---|---|
| `AudiovisualDirectionPlan` em `draft` ou `review` | o mesmo plano em `approved`, ou uma correção |

## Por que este passo é um portão, não uma formalidade

É a única coisa entre a proposta de um modelo e o consumo de tempo, dinheiro e
crédito de provider. O critério de fechamento do caminho 5 → 9 termina em:

> nenhum motor é chamado antes da aprovação humana do plano

Sem este passo implementado, essa frase é prosa.

## O que falta construir

1. **A barreira de criação.** Hoje `validateDirectionPlan` aceita
   `status: 'approved'` vindo de qualquer fronteira — modelo, disco ou IPC.
   Faltam **duas** barreiras distintas:

   | Momento | Aceita | Recusa |
   |---|---|---|
   | criação (saída do passo 8) | `draft`, `review` | `approved`, `superseded` |
   | leitura (do disco) | todos | — |

   Hoje as duas usam o mesmo validador, e é por isso que a regra "nunca
   aprovado por inferência" não é executável.

2. **Registro de quem aprovou e quando.** `BrandProfileApproval` já tem
   `reviewedBy` e `reviewedAt`; o plano não tem equivalente. Aprovação sem
   autor não é aprovação, é um campo mudado.

3. **Conformidade em modo `strict`.** `validateMotionNeedAgainstProfile` já
   distingue `lenient` de `strict`:

   > `strict` transforma cobertura insuficiente em erro. É o modo do portão de
   > aprovação: antes de um plano virar `review`, "não deu para conferir" não
   > pode valer como "está conforme".

   O modo existe; o portão que o usa, não.

4. **Aviso de entrada envelhecida.** `comparePlanInputs` já detecta que o
   brief subiu de versão, que uma fonte mudou ou que o perfil foi recompilado.
   A interface de aprovação precisa mostrar isso **antes** do "aprovar" — não
   depois do render.

5. **O caminho da recusa.** Rejeitar não pode ser só "não aprovou". A correção
   humana é a matéria-prima de `CreativePreference`, e perdê-la é perder o
   aprendizado do sistema — ver [passo 12](passo-12-review-delivery-and-creative-memory.md).

## Critérios de aceitação

- plano não pode nascer `approved`, qualquer que seja a fronteira de origem;
- aprovação registra autor e momento;
- a conformidade de motion roda em `strict` antes de `review`;
- entradas envelhecidas aparecem na tela de aprovação;
- recusa produz uma correção estruturada, não só um estado.

## Conecta com

- **Passo 9** — [`AudiovisualDirectionPlan`](passo-9-audiovisual-direction-plan.md):
  entrega o plano `draft` ou `review`.
- **Passo 11** — [seleção e roteamento](passo-11-asset-selection-and-execution-routing.md):
  só começa depois daqui. É esta a fronteira que impede motor antes de decisão.
- **Passo 12** — [revisão e memória](passo-12-review-delivery-and-creative-memory.md):
  a correção que nasce de uma recusa vira preferência aprovada.
