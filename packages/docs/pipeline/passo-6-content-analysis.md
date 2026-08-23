# Passo 6 — ContentAnalysis

**Responde:** o que existe no material recebido.

**Não responde:** o que o vídeo deve ser. Narrativa nasce no passo 8, direção
no 9, asset e motor no 11.

A fronteira dura: *"há 12s de silêncio no início"* é fato e pertence aqui;
*"cortar o início"* é direção e não pertence.

## Lê e produz

| Lê | Produz |
|---|---|
| fontes da produção | `ContentAnalysis` por fingerprint |

Regra de saída: fatos separados de hipóteses, e lacunas explícitas.

## Contrato e código

| O quê | Onde |
|---|---|
| Contrato | [`packages/contracts/production/content-analysis.ts`](../../contracts/production/content-analysis.ts) |
| Validador | [`packages/core/production/validate-content-analysis.ts`](../../core/production/validate-content-analysis.ts) |
| Cache e invalidação | [`packages/core/production/content-analysis-cache.ts`](../../core/production/content-analysis-cache.ts) |
| Teste | [`apps/cena-raiz-desktop/scripts/test-content-analysis.mjs`](../../../apps/cena-raiz-desktop/scripts/test-content-analysis.mjs) |
| Caminho canônico | `edit/analysis/content-analysis.json` (`CONTENT_ANALYSIS_RELATIVE_PATH`) |

Três decisões do contrato que sustentam tudo que vem depois:

- **`basis` separa observação de inferência.** `observed` vem de leitura direta
  do arquivo, `derived` de cálculo, `model` de inferência probabilística — e
  `model` exige `confidence`. Sem essa distinção, palpite e leitura viram a
  mesma coisa no passo 8.
- **`unknowns` é explícito.** Vazio significa "nada ficou em aberto", nunca
  "não olhei". `limitations` é diferente: ali a limitação é do analisador, em
  `unknowns` é a evidência que não conclui.
- **Tempo em segundos, não em frames.** Frame depende do FPS de destino, que só
  é decidido na execução. A análise não pode fingir conhecer uma timeline que
  ainda não existe.

## Como entra no `inputs` do passo 9

```
contentAnalysis: { version, status, combinedFingerprint, analyzerVersion, sources[], path }
```

O ponto que torna essa fase útil ao longo do tempo é `sources[]` — o
fingerprint **por fonte**, não só o combinado:

- `combinedFingerprint` responde "algo mudou?";
- `sources[]` responde "**o quê** mudou?", e `comparePlanInputs` devolve
  `kind: 'content-source'` com o `sourceId` exato.

É a diferença entre invalidar o plano inteiro e revisar só as cenas cuja
evidência apontava para aquela fonte. `pruneStaleEvidence` no cache existe
justamente para esse recorte.

`analyzerVersion` participa da identidade porque um analisador novo pode
extrair fato que o anterior não via — reaproveitar aí congelaria uma limitação.

**Duas recusas implementadas:**

- `status: 'failed'` não entra. Plano construído sobre análise que falhou é
  plano construído sobre nada. `partial` entra, porque lacuna declarada é
  informação útil — desde que `gaps` diga onde ela está.
- Análise ausente exige `analysisAbsenceReason`. Produção inteiramente gerada
  é legítima; produção que perdeu a análise no caminho não é.

## Estado atual

**Existe:** contrato, validador, cache por fingerprint com invalidação por
fonte, e teste.

**Falta:**

1. **O analisador não grava o contrato.** O desktop herdado já transcreve e
   analisa mídia, mas o resultado não vira `ContentAnalysis` em disco. Enquanto
   isso não acontecer, o cache não tem o que reaproveitar.
2. **`combinedFingerprint` não é calculado em produção.** `combineFingerprints`
   existe e é puro — recebe fingerprints já calculados. Falta quem calcule o
   SHA-256 das fontes e o chame.
3. **Ponte com a transcrição herdada.** `TranscriptEvidence` prevê
   `analyzer` e `analyzerVersion`; o WhisperX do desktop precisa reportar os
   dois para o cache saber quando invalidar.

## Critério de fechamento

- a mesma mídia gera a mesma análise enquanto o fingerprint não muda;
- fonte alterada invalida somente a análise afetada;
- toda afirmação aponta para evidência ou aparece como hipótese com confiança;
- nenhuma recomendação de corte, motor ou asset aparece no contrato.

## Conecta com

- **Passo 5** — [`CreativeBrief`](passo-5-creative-brief.md): `sourceMaterial`
  do brief define o que analisar; `doNotUse` não some da análise, porque o fato
  continua existindo — quem respeita a proibição é o planner.
- **Passo 8** — [`VideoAndMotionPlanner`](passo-8-video-and-motion-planner.md):
  `gaps` diz onde o planner precisará gerar ou pedir material, em vez de
  descobrir isso na execução.
- **Passo 9** — [`AudiovisualDirectionPlan`](passo-9-audiovisual-direction-plan.md):
  `ScenePlan.evidence` aponta para `factId` desta análise. É o que permite
  perguntar de uma cena "por que ela é assim" e receber uma resposta
  verificável.
