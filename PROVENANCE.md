# Proveniência

Registro de origem, licença e cadeia de adaptação do código deste repositório.
Documento legal e técnico: não remover, não resumir, não substituir por branding.

Detalhamento por componente em
[docs/provenance/COMPONENTES-HERDADOS.md](docs/provenance/COMPONENTES-HERDADOS.md).

## Base adquirida

O produto deriva de dois repositórios públicos complementares, adquiridos do autor
com permissão declarada para rebranding, adaptação, evolução, distribuição e
comercialização:

| Upstream | Componente local | Papel |
|---|---|---|
| `fillrochaa/edvid` | `cena-raiz/cenaraiz/cena-raiz/` | skill audiovisual: método, helpers, templates, instalador |
| `fillrochaa/edvid-desktop` | `cena-raiz/cenaraiz/cena-raiz-desktop/` | aplicativo Electron: interface, timeline, runtimes, render |

Não são duplicatas nem projetos opcionais: são as duas metades do mesmo produto.

O contrato de aquisição não está armazenado neste repositório. A permissão fica
registrada como **declaração da proprietária**, não como documento verificado aqui.

## Licenças preservadas

Ambos os componentes carregam licença MIT, `Copyright (c) 2026 Creator Factory`.
Os arquivos `LICENSE` permanecem intactos nos dois componentes.

A mudança de identidade do produto **não** transfere autoria do código original.
Renomear não é adquirir autoria. Como o produto adquirido pode incorporar fontes
de terceiros, preservar apenas as licenças e avisos que se aplicam a esses
componentes — isso não exige manter branding `Edvid` no produto ativo.

## Estado das cópias locais

As cópias locais **não preservam o histórico Git dos upstreams**. Foram copiadas
como código, sem os diretórios `.git` de origem.

Divergências verificadas em 2026-08-20 entre a cópia local e o `main` público:

| Item | Upstream | Cópia local |
|---|---|---|
| `.gitignore` | existe nos dois | ausente nos dois |
| `agents/` (skill) | existe | ausente |
| `.claude/` (desktop) | existe | ausente |
| `.github/workflows/` (desktop) | existe | conteúdo presente como `workflows/`, fora de `.github/` |
| Instalador da skill | `edvid_install.py` | `cenaraiz_install.py` |

O padrão indica que a cópia perdeu arquivos e pastas iniciados por ponto. A
consequência operacional é que **os workflows não são executados pelo GitHub**:
ele só reconhece `.github/workflows/` na raiz do repositório.

Adaptação parcial anterior a este trabalho: o instalador já apontava para
`fillrochaa/cena-raiz` enquanto o README ainda apontava para `fillrochaa/edvid`.
Divergência registrada como adaptação incompleta, não como origem confirmada.

## Distribuição original

O produto original não publicava releases no GitHub. A distribuição ocorria por
artefatos do GitHub Actions e por bucket Cloudflare R2 do fornecedor:

```text
código → workflow manual → runtimes preparados → npm run make
→ instalador Squirrel → runtime pack → R2 → máquina do usuário
```

O Raiz Engine precisa substituir essa cadeia por infraestrutura própria. Enquanto
isso não existir, os endpoints do fornecedor permanecem como
`INHERITED-INFRASTRUCTURE-DEPENDENCY` — ver
[docs/integrations/INFRAESTRUTURA-PROPRIA.md](docs/integrations/INFRAESTRUTURA-PROPRIA.md).

## Sobre este commit-base

Este commit **não** preserva o estado herdado como recebido.

O guia previa criar o baseline antes de qualquer adaptação. Na prática, duas
etapas foram executadas antes, sob autorização humana explícita:

- **Etapa 8** — recuperação técnica: 29 erros de type-check corrigidos, oito
  suítes de teste tornadas executáveis;
- **Etapa 9** — migração de identidade como `CLEAN CUT — ACCEPTED`, sem aliases,
  por ausência comprovada de consumidor.

Nenhum snapshot local corresponde ao estado como recebido: o backup anterior à
renomeação já contém as correções de type-check, e o backup completo é posterior
à renomeação.

O estado herdado puro permanece disponível apenas nos upstreams públicos, e mesmo
eles divergem da cópia local conforme a tabela acima.

**Consequência:** este commit é o ponto de comparação para tudo que vier **depois
dele**, não a fotografia do que foi adquirido. Quem precisar do original deve ir
aos upstreams; quem precisar do estado intermediário, aos backups externos
datados.

## Classificação do código

| Classe | Significado |
|---|---|
| `upstream` | cópia de terceiro, sem modificação própria verificada |
| `adapted` | base de terceiro com modificação própria identificável |
| `owned` | criado neste repositório |
| `external-reference` | guardado para consulta, fora da fronteira do produto |

`cena-raiz/gh repos clones/` contém referências externas de terceiros. Não integram
o produto, não são versionadas, e cada licença exige avaliação individual antes de
qualquer reaproveitamento.

## Corpus de marcas

`marca-raiz-prisma/projetos/` é `KEEP — canonical brand-case corpus`: aplicação
prática do método, evidência arquitetural e base de avaliação do futuro
`BrandRuntimeProfile`. Preservado deliberadamente, não é material descartável.
