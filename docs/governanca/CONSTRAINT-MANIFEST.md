# Constraint Manifest — formato, esquema e validação

Este documento define **como** um Constraint Manifest é escrito e verificado.
O **porquê** e a semântica dos doze blocos estão em
`DOUTRINA-ENGENHARIA-TRANSVERSAL.md` § 19; não são repetidos aqui.

## Arquivos

| Arquivo | Papel |
|---|---|
| `constraint-manifest.schema.json` | Fonte única da estrutura: campos obrigatórios, tipos e enums |
| `validar-constraint-manifest.py` | Validador determinístico, sem dependência externa |
| `constraint-manifest.template.json` | Esqueleto de partida para um sistema novo, nível `minimo` |
| `constraint-manifest.raiz-engine.json` | Manifesto do próprio repositório |

O validador lê os enums e os campos obrigatórios do esquema. Alterar uma classe
ou um mecanismo se faz **no esquema**, nunca nos dois lugares.

## Campos de uma restrição

| Campo | Obrigatório | Conteúdo |
|---|---|---|
| `id` | sim | Identificador estável e único no manifesto |
| `class` | sim | Um dos doze blocos da doutrina § 19.1 |
| `statement` | sim | O limite em uma frase, no imperativo ou na negativa |
| `moment` | sim | Onde vale: `design`, `build`, `runtime`, `post` |
| `enforcement` | sim | `mechanism` e, conforme o caso, `reference` ou `responsible` |
| `status` | sim | `ACCEPTED`, `PROPOSAL` ou `DEFERRED` |
| `authority` | não | Classe de autoridade da doutrina § 6, quando a restrição governa uma ação |
| `source` | condicional | Evidência que sustenta a restrição. **Obrigatória** em `ACCEPTED` |
| `removal_condition` | não | O que precisa acontecer para o limite deixar de valer |

`status` é o que separa regra de proposta. `ACCEPTED` significa que a restrição
vale agora e tem fonte. `PROPOSAL` significa que ela aguarda decisão humana e
**não pode ser invocada como regra** enquanto estiver nesse estado.

## Regras que o esquema não expressa

O validador aplica, além da estrutura:

- `id` único no manifesto;
- `ACCEPTED` exige `source`;
- mecanismo `manual` exige `responsible` nomeado — sem dono, não há aplicação;
- mecanismos `type`, `schema`, `test`, `permission`, `policy` e `monitor` exigem
  `reference` — sem apontar onde vive, a aplicação não é verificável;
- nível `completo` exige os doze blocos;
- nível `minimo` exige `approval_boundary`, `stop_condition`,
  `reversibility_requirement` e ao menos um entre `forbidden_outcome` e
  `forbidden_method`;
- `PROPOSAL` gera aviso, não erro: o manifesto continua válido, mas o pendente
  fica visível a cada execução.

## Uso

```sh
python3 docs/governanca/validar-constraint-manifest.py docs/governanca/constraint-manifest.raiz-engine.json
python3 docs/governanca/validar-constraint-manifest.py --formato json CAMINHO
```

Código de saída `0` quando válido, `1` quando inválido — próprio para porta de
verificação em script ou CI.

Para um sistema novo: copiar o template, preencher, validar, e só então escolher
arquitetura. A ordem importa — doutrina § 20, momento `design`.

## Estado de verificação

O validador foi exercitado contra dez manifestos deliberadamente quebrados —
restrição sem aplicação, classe inexistente, `id` duplicado, `ACCEPTED` sem
fonte, mecanismo manual sem responsável, mecanismo automático sem referência,
nível `completo` com bloco faltando, nível `minimo` insuficiente, campo
desconhecido e JSON malformado — e rejeitou todos. O manifesto do repositório e
o template passam.

## Manifesto do raiz-engine

`constraint-manifest.raiz-engine.json` tem 22 restrições, nível `completo`.
Vinte estão `ACCEPTED` e citam o documento autoritativo que já as sustentava —
o manifesto **formaliza** o que estava disperso, não inventa limite novo.

Duas estão `PROPOSAL` e dependem de decisão da proprietária:

| `id` | O que falta decidir |
|---|---|
| `RE-BU-001` | Teto de gasto por execução de modelo e por período, e o que acontece ao atingir o limite |
| `RE-OX-002` | O piso de qualidade de marca abaixo do qual reduzir custo de modelo deixa de ser aceitável |

Enquanto estiverem `PROPOSAL`, o sistema não tem limite de custo declarado. Isso
é uma lacuna conhecida, não um limite implícito.
