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

## Designação canônica do primeiro commit

O commit `231e746` chama-se **`reconciled Raiz Engine baseline`**.

Não deve ser chamado de "estado herdado" nem de "inherited baseline" em nenhum
documento, mensagem ou conversa. O assunto do commit foi corrigido para essa
designação **antes de qualquer push**.

### Commits provisórios substituídos

O primeiro commit local recebeu `9c5b9d8` e assunto `baseline of the reconciled
inherited state`. Foi substituído por amend, e em seguida reescrito pela migração
para Git LFS. Nenhuma dessas revisões chegou a remoto algum: o repositório remoto
esteve vazio o tempo todo, e por isso a reescrita não afeta clone, fork ou
histórico de terceiros.

O commit-base válido é `231e746`. O `HEAD` avançou depois dele; referências a
`9c5b9d8` em qualquer registro anterior descrevem um commit provisório que não
existe mais.

Seis fatos que definem esse commit:

1. **Não existe snapshot completo do estado como recebido.** Nenhum backup local
   corresponde ao que foi adquirido: o anterior à renomeação já contém as
   correções de type-check, e o completo é posterior à renomeação.
2. **As Etapas 8 e 9 ocorreram antes do primeiro commit**, sob autorização humana
   explícita — recuperação técnica e migração de identidade como
   `CLEAN CUT — ACCEPTED`.
3. **Este é o primeiro estado completo e recuperável do Raiz Engine.** Antes dele
   não havia histórico: apenas arquivos compactados datados.
4. **A proveniência anterior depende de três fontes externas a este histórico:**
   os upstreams públicos, os backups datados fora do repositório e os inventários
   em `docs/provenance/`.
5. **A Etapa 5 foi executada e aguarda aceitação após a reconciliação
   documental.** O commit existe; a etapa não está formalmente aceita.
6. **O primeiro push ocorreu somente depois das reescritas descritas acima.** O
   remoto privado contém `231e746` e o commit documental `5fcccf3`. No snapshot
   de 2026-08-20, o `HEAD` local `cce7889` está um commit à frente; novo push
   continua exigindo autorização separada.

## Sobre este commit

Ele **não** preserva o estado como recebido.

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

## Git LFS — dependência obrigatória

O corpus **continua integralmente versionado**. Não foi excluído, reduzido nem
movido para fora do repositório: passou a ser armazenado por Git LFS.

| | |
|---|---|
| Caminhos migrados | 505 |
| Objetos LFS únicos | 501 |
| Conteúdo em LFS | 397.879.806 bytes |
| Verificação | `git lfs fsck` OK |
| Padrões | `.gitattributes` na raiz |

Abrangem apenas binários do corpus e dos assets: `pdf`, `jpg`, `jpeg`, `png`,
`webp`, `mp4`, `woff`, `woff2`, `otf`, `ttf` sob `marca-raiz-prisma/projetos/` e
`ASSETS/`. Texto, código, JSON e contratos permanecem no Git normal.

### Consequências que não podem ser esquecidas

**Git LFS é dependência obrigatória** do bootstrap e de qualquer instalação em
outra máquina. Sem ele, o repositório é clonado mas o corpus não.

**Um clone sem baixar os objetos LFS contém apenas ponteiros, não os assets
reais.** Cada arquivo migrado vira um texto de poucas linhas apontando para o
conteúdo. Ferramenta que abrir esse ponteiro esperando uma imagem falha — e falha
de forma confusa, porque o arquivo existe e tem o nome certo.

O bootstrap deve instalar e verificar `git-lfs` antes do clone, e decidir
explicitamente quando baixar o corpus: um perfil de desenvolvimento que apenas
compila o aplicativo não precisa de 398 MB de casos de marca.

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
