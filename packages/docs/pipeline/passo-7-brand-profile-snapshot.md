# Passo 7 — Snapshot do BrandRuntimeProfile

**Responde:** qual versão aprovada da marca governa *esta* produção.

**Não responde:** o que a marca é. Isso é o ciclo de inteligência permanente
(passos 1–4), que roda quando a marca ou o método muda — não a cada vídeo.

## Lê e produz

| Lê | Produz |
|---|---|
| perfil aprovado da marca | snapshot fixado do `BrandRuntimeProfile` |

Regra de saída: a produção registra a versão que realmente usou.

## Por que existe um snapshot

O perfil vivo da marca continua evoluindo. Uma produção aprovada em agosto não
pode mudar de direção porque o perfil foi recompilado em outubro.

O snapshot é a cópia fixada **dentro da produção**. Ele não é uma segunda
implementação do perfil e não é editável: é a prova de quais decisões de marca
foram usadas, guardada onde a produção possa ser reaberta.

## Contrato e código

| O quê | Onde |
|---|---|
| Contrato do perfil | [`packages/contracts/brand/brand-runtime-profile.ts`](../../contracts/brand/brand-runtime-profile.ts) |
| Compilador | [`packages/core/brand/compile-brand-runtime-profile.ts`](../../core/brand/compile-brand-runtime-profile.ts) |
| Mapeamento | [`packages/core/brand/brand-runtime-profile-mapping.ts`](../../core/brand/brand-runtime-profile-mapping.ts) |
| Validador | [`packages/core/brand/validate-brand-runtime-profile.ts`](../../core/brand/validate-brand-runtime-profile.ts) |
| Teste | [`apps/cena-raiz-desktop/scripts/test-brand-runtime-compiler.mjs`](../../../apps/cena-raiz-desktop/scripts/test-brand-runtime-compiler.mjs) |
| Caminho do snapshot | `edit/brand/runtime-profile.json` (`BRAND_PROFILE_SNAPSHOT_RELATIVE_PATH`) |

O perfil nasce `draft`. Somente uma versão revisada e `approved` pode ser
fixada numa produção.

## Como entra no `inputs` do passo 9

```
brandProfile: { brandId, version, approval: 'approved', snapshotPath,
                sourceFingerprint?, compilerVersion?, mappingVersion? }
```

Três recusas implementadas em [`validate-plan-inputs.ts`](../../core/production/validate-plan-inputs.ts),
todas mirando o mesmo risco — uma produção governada por uma marca que ninguém
aprovou:

| Recusa | Por quê |
|---|---|
| `approval !== 'approved'` | perfil em revisão não dirige produção |
| `brandId === 'unresolved'` | é o perfil de fallback da UI herdada |
| `version < 1` | `createFallbackBrandProfile` nasce `version: 0` |

O fallback existe em [`brand-runtime-profile.ts`](../../contracts/brand/brand-runtime-profile.ts)
para a migração da interface herdada, e nasce com `brandId: 'unresolved'`,
`version: 0` e `origin: 'migration'` **de propósito** — para não conseguir
passar por aqui. As duas últimas recusas transformam essa intenção em regra
verificável.

`compilerVersion` e `mappingVersion` entram porque um compilador novo pode ler
o mesmo documento de marca e chegar a outro perfil. Sem eles, "versão 4" não
identifica nada com precisão.

## Estado atual

**Existe:** contrato do perfil, compilador, mapeamento, validador e teste. Os
três perfis de referência compilam.

**Falta:**

1. **O snapshot em si.** Nada escreve `edit/brand/runtime-profile.json`. Esta
   é a lacuna central do passo 7: o contrato do perfil está pronto, a fixação
   dentro da produção não existe.
2. **Aprovação humana dos perfis.** Os perfis de referência estão em `draft`.
   Enquanto nenhum for `approved`, nenhum plano válido pode ser produzido — a
   regra acima recusa todos, corretamente.
3. **Correção de versão.** Os perfis de referência ainda precisam da revisão
   que atribui versão real.

## Critério de fechamento

- existe ao menos um perfil `approved` com versão real;
- a produção grava o snapshot no caminho canônico antes do passo 8;
- o snapshot é imutável dentro da produção, e recompilar a marca gera versão
  nova em vez de reescrever a antiga;
- reabrir uma produção antiga mostra exatamente qual perfil a governou.

## Conecta com

- **Passos 1–4** — inteligência permanente da marca: produzem o perfil que este
  passo fixa. Rodam quando a marca muda, não a cada produção.
- **Passo 8** — [`VideoAndMotionPlanner`](passo-8-video-and-motion-planner.md):
  o planner lê o snapshot, não o perfil vivo.
  [`validate-motion-need-against-profile.ts`](../../core/production/validate-motion-need-against-profile.ts)
  já implementa a validação cruzada entre o movimento proposto e o
  `MotionProfile` da marca.
- **Passo 9** — [`AudiovisualDirectionPlan`](passo-9-audiovisual-direction-plan.md):
  `direction.pace`, `energy` e `density` vêm do `EditorialProfile` do snapshot,
  e `ScenePlan.evidence` pode apontar `source: 'brand-profile'`.
