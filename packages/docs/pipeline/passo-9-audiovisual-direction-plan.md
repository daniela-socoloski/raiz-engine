# Passo 9 — AudiovisualDirectionPlan

**Responde:** qual é a direção aprovável desta produção, cena a cena.

**Não responde:** com o quê executar. O plano descreve intenção e necessidade,
nunca código de render nem chamada de motor.

## Lê e produz

| Lê | Produz |
|---|---|
| proposta validada pelo schema | `AudiovisualDirectionPlan` com `ScenePlan[]` no vídeo |

Regra de saída: o plano nasce `draft` ou `review`, nunca aprovado por
inferência.

## Contrato e código

| O quê | Onde | Situação |
|---|---|---|
| Contrato do plano | [`apps/cena-raiz-desktop/src/domain/direction/audiovisual-direction-plan.ts`](../../../apps/cena-raiz-desktop/src/domain/direction/audiovisual-direction-plan.ts) | herdado do desktop, **congelado** |
| Validador do plano | [`apps/cena-raiz-desktop/src/application/direction/validate-direction-plan.ts`](../../../apps/cena-raiz-desktop/src/application/direction/validate-direction-plan.ts) | herdado, **congelado** |
| Unidade de cena canônica | [`packages/contracts/production/scene-plan.ts`](../../contracts/production/scene-plan.ts) | pronta |
| Validador de cena | [`packages/core/production/validate-scene-plan.ts`](../../core/production/validate-scene-plan.ts) | pronto |
| Entradas do plano | [`packages/contracts/production/plan-inputs.ts`](../../contracts/production/plan-inputs.ts) | pronta |
| Validador das entradas | [`packages/core/production/validate-plan-inputs.ts`](../../core/production/validate-plan-inputs.ts) | pronto |

O contrato do plano e seu validador estão congelados durante a fase de
autoria de contratos, conforme o `AGENTS.md`. O que segue descreve a migração
que precisa acontecer neles, não uma alteração já feita.

## O que precisa migrar

### 1. `inputs` — de rótulo a espinha

Hoje o campo é um resíduo do desktop: quatro strings opcionais que não
identificam nem o brief nem a análise.

```ts
// hoje
inputs: {
  brandProfileVersion?: string;
  timelineFingerprint?: string;
  transcriptFingerprint?: string;
  assetRegistryVersion?: string;
}
```

Nenhum dos passos 5 e 6 aparece ali. Um plano gravado hoje não sabe de qual
brief nasceu. É o buraco mais caro do caminho 5 → 9, porque todos os critérios
de reprodutibilidade e invalidação dependem dele.

| Campo atual | Vai para | Observação |
|---|---|---|
| `brandProfileVersion?: string` | `brandProfile: { brandId, version: number, approval, snapshotPath, … }` | vira obrigatório; versão passa a número; exige `approved` |
| `transcriptFingerprint?` | `contentAnalysis.combinedFingerprint` + `sources[]` | transcrição é evidência dentro da análise, não uma entrada paralela |
| `timelineFingerprint?` | — | timeline é estado de execução, não entrada de planejamento; se o desktop precisar dela, o lugar é o passo 11 |
| `assetRegistryVersion?` | — | asset é passo 11 por definição; não pode entrar no que decide a direção |
| *(não existia)* | `brief: { productionId, version, status: 'ready', path }` | o passo 5 finalmente aparece na saída do passo 9 |
| *(não existia)* | `preferences[]` com aplicadas **e** derrotadas | torna o conflito auditável |
| *(não existia)* | `planner: { name, version, model?, promptVersion? }` | hoje `model` e `promptVersion` vivem soltos em `provenance` |

A troca é incompatível: `inputs` deixa de ser um saco de strings opcionais e
passa a ter campos obrigatórios com tipos diferentes. **Recomendação:
`schemaVersion` do plano vai de `'1.0'` para `'2.0'`**, e planos `1.0`
existentes são migrados ou marcados `superseded` — não reinterpretados em
silêncio.

### 2. `SceneDirection` → `ScenePlan`

O contrato canônico já existe em `packages/`. O domínio do desktop ainda
declara `SceneDirection`, e os dois já divergiram:

- `ScenePlan.purpose` inclui `explain-data`; o `ScenePurpose` do domínio e a
  lista `PURPOSE` do validador herdado não incluem. **Migrar sem alinhar isso
  faz cena válida ser recusada.**
- `ScenePlan` tem `prohibitions` e `evidence`; o plano não carrega nenhum dos
  dois, e o validador herdado não os conhece.

`evidence` é o que sustenta o critério *"toda afirmação da análise aponta para
evidência"*. Sem ele no passo 9, o critério não é verificável — a cena existe,
mas ninguém consegue perguntar por que ela é assim.

`SceneMotionNeed` não vira um segundo estado persistido: no passo 11, código
determinístico projeta `motionNeed` para um pedido de asset ou job, e essa
projeção é recalculável.

### 3. Status na criação

O validador herdado aceita `status: 'approved'` vindo de qualquer fronteira —
modelo, disco ou IPC. A regra "nunca aprovado por inferência" é prosa, não
regra executável.

Falta uma barreira de **criação** que recuse `approved` e `superseded` na saída
do planner, distinta da barreira de **leitura**, que precisa aceitar planos já
aprovados vindos do disco. São dois momentos diferentes e hoje têm o mesmo
validador.

Isso importa porque o critério "nenhum motor é chamado antes da aprovação
humana" depende inteiramente da confiabilidade desse campo.

### 4. Sobreposição de janelas

O validador herdado checa `endFrame > startFrame` e `sceneId` duplicado, mas
não checa sobreposição entre cenas: duas cenas podem ocupar os mesmos frames e
passar. `validateScenePlanList` em `packages/` já resolve isso e é o que deve
substituir a checagem herdada.

## O que `inputs` passa a permitir

Com [`comparePlanInputs`](../../core/production/validate-plan-inputs.ts), o
plano deixa de ser uma opinião sem data:

| Mudança | O que a interface passa a poder dizer |
|---|---|
| brief sobe de versão | "o pedido mudou depois deste plano" |
| uma fonte é trocada | "só as cenas que usavam `src-2` envelheceram" |
| analisador é atualizado | "a análise pode ver o que antes não via" |
| perfil recompilado | "a marca mudou desde esta direção" |
| preferência nova aplicável | "existe uma correção aprovada que este plano não considerou" |

Tudo isso antes da aprovação humana — não depois do render.

## Critério de fechamento

- o plano inválido não é persistido nem chega à seleção de assets;
- cada cena existe uma vez, em `ScenePlan`;
- o plano registra qual brief, qual análise, qual perfil e quais preferências o
  produziram;
- nenhum motor é chamado antes da aprovação humana;
- testes demonstram criação, validação, persistência, invalidação por mudança
  de fonte e diferenças reais entre marcas e intenções.

## Conecta com

- **Passo 8** — [`VideoAndMotionPlanner`](passo-8-video-and-motion-planner.md):
  monta o `PlanInputs` porque é o único ponto que conhece as quatro entradas.
- **Passo 10** — aprovação humana: recebe um plano `draft` ou `review` e é a
  única coisa que pode torná-lo `approved`.
- **Passo 11** — seleção de assets e compilação de execução: lê o plano
  aprovado, projeta `motionNeed` para jobs e consulta
  [`ExecutionConstraint`](../../contracts/production/execution-constraint.ts).
- **Passo 12** — readback e Creative Memory: a correção humana que nascer daí
  vira [`CreativePreference`](../../contracts/production/creative-preference.ts),
  que reentra no passo 8 da próxima produção.
