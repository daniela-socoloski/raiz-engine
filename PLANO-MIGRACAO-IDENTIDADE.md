# Plano de Migração de Identidade e Propriedade Técnica

Status: plano operacional inicial  
Ecossistema: `Sistema Marca Raiz`  
Repositório e motor técnico: `raiz-engine`  
Produto audiovisual: `Cena Raiz`  
Motor compartilhado: `Raiz Engine`  
Data do inventário inicial: 2026-08-19  

Pré-requisito operacional: [GUIA-ORGANIZACAO-REPOSITORIO.md](GUIA-ORGANIZACAO-REPOSITORIO.md)  
Política obrigatória: [POLITICA-FONTE-UNICA-FUNCIONAL.md](POLITICA-FONTE-UNICA-FUNCIONAL.md)  

## 1. Decisão

O sistema será adaptado para uma identidade própria. Nomes herdados como `Edvid`, identificadores técnicos legados e referências à infraestrutura anterior serão substituídos gradualmente pela nomenclatura do Sistema Marca Raiz.

### 1.1 Enquadramento da base adquirida

Daniela declara ter adquirido do vendedor a base com autorização ampla para
modificar, renomear, evoluir, distribuir e comercializar o resultado. Essa base
foi publicada e entregue em duas partes complementares:

| Upstream | Parte do produto adquirido | Destino no Sistema Marca Raiz |
|---|---|---|
| `fillrochaa/edvid` | skill, método de edição, helpers, templates e instalador para agentes | **Cena Raiz**, em `skills/cena-raiz/` |
| `fillrochaa/edvid-desktop` | aplicativo Electron, interface, timeline, runtimes, render e distribuição | **Cena Raiz Desktop**, em `apps/cena-raiz-desktop/` |

Portanto, não são dois aplicativos concorrentes nem referências opcionais. São
duas fronteiras técnicas do mesmo produto-base comprado, e ambas devem ser
preservadas, recuperadas e migradas para a família Raiz.

Daniela também informa que o próprio produto vendido foi formado por adaptações
e incorporações anteriores. Portanto, `Edvid` é a origem comercial imediata da
base recebida, mas não deve ser presumido como origem autoral exclusiva de cada
arquivo, dependência ou técnica.

O instrumento comercial da aquisição não foi incluído nem inspecionado neste
levantamento; a autorização acima fica registrada como declaração da
proprietária, não como transcrição contratual. Isso não bloqueia o rebranding.
O nome `Edvid` deve sair integralmente da identidade ativa do produto e não será
mantido em arquivos antigos ou cópias de segurança. Ele aparecerá somente no
registro concentrado da cadeia de proveniência ou, temporariamente, em um
fallback de compatibilidade com consumidor comprovado.

Licenças e avisos de terceiros identificados na cadeia anterior serão avaliados
por componente. Preservar uma obrigação aplicável não significa preservar a
marca Edvid na interface, nos módulos, nos comandos, nos packages ou na
distribuição do Cena Raiz.

Essa migração não será um `search and replace` global.

Renomear uma frase visível é simples. Renomear uma variável de ambiente, protocolo, diretório de dados, bundle ID, chave de armazenamento ou API pública pode interromper builds, perder configurações e tornar projetos antigos inacessíveis.

Portanto:

> A identidade muda imediatamente no destino arquitetural, mas o código migra em etapas verificáveis e compatíveis.

Esta migração é uma fundação para a construção do **Raiz Engine**, não o objetivo final do projeto. O trabalho não termina quando `Edvid` virar `Cena Raiz`. Depois de organizar e estabilizar o código herdado, o sistema continuará evoluindo pelo plano arquitetural geral: contratos próprios, direção criativa, inteligência de marca, assets, memória, routing e adapters de execução.

Cada nova ideia deve entrar nessa arquitetura por uma decisão explícita de responsabilidade e propriedade. Renomear um recurso externo não o transforma em parte do motor; integrá-lo por um contrato coerente, com critérios próprios e validação, sim.

A migração também deve convergir para uma única implementação funcional. Aliases e fallbacks podem existir durante uma transição comprovadamente necessária, mas arquivos antigos, cópias do desktop e módulos duplicados não permanecem como arquivo de segurança. Depois da validação, o obsoleto é removido e o histórico anterior fica no Git.

## 2. Arquitetura de nomes

### Família de produtos

| Escopo | Nome oficial | Responsabilidade |
|---|---|---|
| Ecossistema | **Sistema Marca Raiz** | identidade e família de produtos criativos |
| Repositório e motor técnico | **Raiz Engine** | contratos, direção, assets, memória, routing e integrações |
| Inteligência de marca | **Marca Raiz Prisma** | descoberta e compilação da identidade |
| Produto audiovisual | **Cena Raiz** | planejamento, edição e produção de vídeo |
| Aplicativo | **Cena Raiz Desktop** | experiência Electron |
| Skill de vídeo | **Cena Raiz** | edição por agente e helpers |
| Sistema de imagem | **Raiz Images** | direção e geração de imagem |
| Sistema editorial | **Slide Raiz** | narrativa, headlines e carrosséis |
| Fluxos especializados | **Creative Recipes** | anúncios e formatos com gramática própria |

### Convenções técnicas

| Contexto | Forma | Exemplo |
|---|---|---|
| Interface e documentação | palavras com espaço | `Cena Raiz Desktop` |
| Pastas e pacotes | kebab-case | `cena-raiz-desktop` |
| Variáveis e funções TypeScript | camelCase | `cenaRaizDesktop` |
| Types e classes | PascalCase | `CenaRaizDesktopApi` |
| Constantes | SCREAMING_SNAKE_CASE | `CENA_RAIZ_INSTRUCTIONS` |
| Variáveis de ambiente | SCREAMING_SNAKE_CASE | `CENA_RAIZ_FFMPEG` |
| Protocolos e canais | kebab-case | `cena-raiz-media` |
| Schemas de domínio | PascalCase | `AudiovisualDirectionPlan` |
| IDs persistidos | lowercase estável | `cena-raiz` |

Hífen nunca deve aparecer dentro de um identificador JavaScript ou TypeScript. `cena-raizIcon`, `window.cena-raizDesktop` e `process.env.cena-raiz_*` são inválidos. As formas corretas são `cenaRaizIcon`, `window.cenaRaizDesktop` e `process.env.CENA_RAIZ_*`.

### Superfícies que compõem a reescrita

O upstream público atual confirma que a identidade `Edvid` está incorporada em
camadas diferentes. A migração deve tratar cada camada pelo seu risco:

| Camada | Exemplos herdados | Destino | Tratamento |
|---|---|---|---|
| Identidade visível | `Edvid`, textos, títulos, logos, ícones, alt text e cor de marca | `Cena Raiz` / `Cena Raiz Desktop` e assets aprovados | substituir no componente canônico depois do baseline |
| Skill e descoberta por agentes | `name: edvid`, `$edvid`, `skills/edvid` e `agents/openai.yaml` | `cena-raiz`, `$cena-raiz` e `skills/cena-raiz` | renomear manifest, instruções, caminhos e testes no mesmo lote |
| Pacote e instalador Python | projeto `edvid`, `edvid_install.py`, módulo `edvid_install` e CLI `edvid-install` | pacote e CLI Cena Raiz com identificadores Python válidos | renomear arquivo, módulo, entry point, imports, testes e URLs juntos |
| Desktop e bridge Electron | `@edvid/desktop`, `EdvidDesktopApi` e `window.edvidDesktop` | `@cena-raiz/desktop`, `CenaRaizDesktopApi` e `window.cenaRaizDesktop` | migrar tipos e consumidores; alias só enquanto existir consumidor comprovado |
| Ambiente e automação | `EDVID_*`, workflows, scripts de runtime, build, smoke e assinatura | `CENA_RAIZ_*` | escrever o nome novo e ler o antigo temporariamente quando necessário |
| Estado persistido | `edvid-media://`, chaves `edvid:*`, diretórios e nomes de runtime | `cena-raiz-media://`, `cena-raiz:*` e nomes canônicos | dual-read, migração validada e remoção posterior do fallback |
| Distribuição e infraestrutura | bundle ID, Supabase, R2, feed de update, assinatura, OAuth e URLs Creator Factory | infraestrutura pertencente ou explicitamente licenciada ao Sistema Marca Raiz | substituir somente com decisão de distribuição, credenciais próprias e teste de atualização |
| Proveniência | `LICENSE`, copyright, URLs e revisão de origem | registro histórico do upstream e do delta adaptado | preservar; não apresentar como marca ativa ao usuário |

Arquivos e contratos funcionais neutros, como `timeline.json`, `edit-data.json`,
EDL, estruturas de projeto e formatos de render, não devem ser renomeados apenas
por branding. Eles mudam somente quando existir uma razão de domínio e uma
migração própria.

## 3. Diagnóstico reconciliado

O problema de fronteira do repositório foi resolvido pela consolidação de
2026-08-20:

- o remoto foi renomeado para `daniela-socoloski/raiz-engine` e o `origin` local já foi atualizado;
- a raiz local canônica já se chama `raiz-engine/` e não existe uma segunda cópia ativa com o nome anterior;
- `skills/cena-raiz/` deriva da skill `fillrochaa/edvid`;
- `apps/cena-raiz-desktop/` deriva do aplicativo `fillrochaa/edvid-desktop`;
- o repositório intermediário e a pasta vazia `cena-raiz-desktop-clone/` foram removidos;
- `cena-raiz/gh repos clones/` contém referências externas que não devem entrar no produto automaticamente.

Os caminhos anteriores ficam preservados apenas no histórico e na proveniência;
não existem como implementações ativas.

O rebranding local já começou, mas está incompleto e ainda não foi aceito como
baseline técnico:

- uma substituição ampla já levou a maior parte da identidade ativa para
  `Cena Raiz` e retirou quase todas as ocorrências textuais de `Edvid`;
- `package.json` já usa `@cena-raiz/desktop` e `productName: cena-raiz`;
- a bridge do Electron observada já usa `CenaRaizDesktopApi` e
  `window.cenaRaizDesktop`;
- variáveis de ambiente observadas já usam `CENA_RAIZ_*`;
- a skill já usa `name: cena-raiz`, o projeto Python `cenaraiz`, o módulo
  `cenaraiz_install.py` e a CLI `cenaraiz-install`;
- `tests/test_installer.py`, porém, importa `CENA_RAIZ_install`, que não
  corresponde ao módulo existente;
- README, `install.md` e o instalador apontam para `fillrochaa/cena-raiz` e para
  variantes de arquivo que ainda não foram publicadas ou confirmadas;
- `install.md` ainda usa o marcador histórico `<EDVID>`;
- autenticação, assinatura e atualização ainda carregam referências reais à
  Creator Factory;
- o bundle ID atual é o híbrido `com.creatorfactory.cena-raiz`.

O scan inicial encontrou pelo menos 127 ocorrências de formas sintaticamente
inválidas no desktop. Um processo concorrente corrigiu as formas conhecidas em
`App.tsx`, `renderer.tsx` e `forge.config.ts`, mas essa intervenção ainda não foi
validada como lote controlado. Antes de novas features, skill e desktop precisam
recuperar typecheck e testes de forma reproduzível na Etapa 8.

## 4. O que pode ser renomeado diretamente

Depois do baseline, estes itens podem migrar sem compatibilidade longa, desde que imports e testes sejam atualizados no mesmo lote:

- nomes de variáveis e funções internas;
- nomes de types internos;
- comentários;
- textos visíveis que ainda dizem Edvid;
- nomes de constantes não persistidas;
- imports de assets;
- nomes de testes internos;
- documentação própria.

Exemplos:

| Atual | Destino |
|---|---|
| `EDVID_INSTRUCTIONS` | `CENA_RAIZ_INSTRUCTIONS` |
| `EdvidDesktopApi` | `CenaRaizDesktopApi` |
| `edvidDesktop` | `cenaRaizDesktop` |
| `edvid-gemini-runtime` | `cena-raiz-gemini-runtime` |
| `Edvid Desktop` | `Cena Raiz Desktop` |
| `motor do Edvid` | `motor do Cena Raiz` |

## 5. Compatibilidade — `CLEAN CUT — ACCEPTED`

> **Decisão de 2026-08-20, tomada por evidência.**
>
> A estratégia geral de aliases e fallbacks `Edvid` desta seção foi **dispensada**.
> A migração de identidade foi executada como corte limpo, sem camada de
> compatibilidade.

### Evidências que sustentam a dispensa

- nenhuma build anterior foi distribuída;
- não existem usuários externos dependentes dos identificadores antigos;
- não existe estado persistido que precise ser preservado — o token do protocolo
  de mídia é `randomUUID()` mantido em memória e nenhum arquivo de projeto guarda
  URLs `edvid-media://`;
- o diretório de dados do usuário deriva de `productName`, que já era próprio;
- não existem integrações externas comprovadas consumindo os contratos `Edvid`;
- o typecheck passa com os identificadores canônicos;
- as oito suítes de teste estão executáveis e passando.

### Regra permanente

**Não reintroduzir aliases ou fallbacks `Edvid` por precaução abstrata.** Se surgir
futuramente um consumidor real e legítimo, criar uma migração específica, testada,
temporária e com condição objetiva de remoção — nunca uma camada permanente por
segurança hipotética.

Não confundir alias de **identidade** com dependência temporária de
**infraestrutura**. Os pacotes de runtime e o feed de atualização do fornecedor
anterior continuam sendo fallback legítimo até existir substituto próprio validado;
isso é tratado na seção de endereços online, não aqui.

### Superfícies afetadas por esta decisão

| Superfície | Instrução anterior | Executado |
|---|---|---|
| Bridge Electron `window.edvidDesktop` | alias temporário | `window.cenaRaizDesktop`, sem alias |
| `EdvidDesktopApi` | rename interno | `CenaRaizDesktopApi` |
| `EDVID_*` | nome novo + fallback antigo | `CENA_RAIZ_*`, sem fallback |
| Protocolo `edvid-media` | registrar ambos temporariamente | `cena-raiz-media`, registro único |
| Storage e diretórios | aceitar ambos | nome novo apenas |
| Fases 1A, 3, 4 e 5 | previam camada de compatibilidade | executadas sem ela |
| Critérios de aceitação | exigiam alias funcional | substituídos por typecheck e suítes verdes |

O texto original desta seção permanece abaixo como registro do plano anterior. Ele
descreve o que **seria** feito se houvesse consumidor comprovado, e continua válido
como método caso um apareça.

### Plano anterior — registro histórico

> **HISTORICAL SNAPSHOT — NOT CURRENT OPERATIONAL STATE**
>
> Tudo abaixo, até o fim da seção 5, descreve a estratégia **anterior** de aliases e
> fallbacks. **Não é instrução atual.** Permanece como método aplicável apenas se um
> consumidor real e comprovado aparecer no futuro. A decisão vigente é
> `CLEAN CUT — ACCEPTED`, no início desta seção.


### Variáveis de ambiente

Novos builds, documentação e workflows usam somente `CENA_RAIZ_*`. Não
reintroduzir `EDVID_*` por precaução abstrata. Primeiro verificar se algum build,
secret de CI ou ambiente real ainda depende do nome antigo. Somente quando esse
consumidor for comprovado, a implementação canônica poderá aceitar o fallback
temporário:

```ts
const ffmpegPath =
  process.env.CENA_RAIZ_FFMPEG
  ?? process.env.EDVID_FFMPEG;
```

Esse fallback deve possuir teste, consumidor registrado e condição de remoção.
Ele não autoriza manter um segundo arquivo ou service legado.

### Bridge do Electron

Expor `cenaRaizDesktop` como nome canônico. Se uma janela, teste ou plugin real
ainda depender de `edvidDesktop`, manter um alias temporário que aponta para a
mesma API. Sem consumidor comprovado, não criar o alias.

Não manter duas implementações.

### Protocolos

Registrar `cena-raiz-media` como protocolo principal. Aceitar `edvid-media`
somente se projetos ou links antigos existentes realmente o exigirem, com teste
e evidência que permitam saber quando o alias pode ser removido.

### Armazenamento local e diretórios

Chaves `cena-raiz:*` já estão no destino correto. Se for comprovada a existência
de dados reais em uma chave `.edvid*` ou diretório legado:

1. ler o formato novo;
2. se ausente, ler o antigo;
3. migrar para o novo sem apagar o antigo imediatamente;
4. validar reabertura;
5. remover o fallback apenas numa versão futura.

### Jobs, caches e arquivos de projeto

Não renomear `edit/`, `timeline.json`, `edl.json` ou campos já usados por projetos reais somente por branding. Esses nomes são contratos funcionais e neutros.

## 6. O que não deve ser apenas renomeado

### Creator Factory

As referências à Creator Factory não são apenas textos de interface. Elas estão ligadas a:

- autenticação;
- matrículas e entitlement;
- projeto Supabase;
- assinatura de aplicativo;
- distribuição e atualização;
- buckets e secrets de CI.

Trocar o texto sem trocar a infraestrutura criaria uma identidade falsa e poderia interromper login e updates.

Antes da remoção, decidir:

- quem autentica os usuários do Cena Raiz;
- qual organização assina os aplicativos;
- qual domínio e reverse-DNS serão usados;
- onde ficam runtime packs e updates;
- quais produtos ou assinaturas liberam o acesso.

### Bundle ID

`com.creatorfactory.cena-raiz` não deve ser alterado até existir uma decisão de distribuição e assinatura. Mudar bundle ID cria outro aplicativo para macOS e Windows e pode romper atualização automática.

### Instalador e upstream

O instalador não deve apontar para `daniela-socoloski/raiz-engine` enquanto o código publicável da skill ainda não estiver nesse remoto.

O instalador herdado da skill e o bootstrap futuro do Raiz Engine não são a
mesma responsabilidade. O primeiro distribui uma skill; o segundo prepara uma
máquina e coordena perfis de desenvolvimento e execução. As garantias úteis do
instalador herdado serão adaptadas, mas haverá uma única lógica canônica de
bootstrap com namespace, manifest e infraestrutura próprios.

Sequência correta:

1. consolidar e testar a skill própria;
2. decidir sua localização publicável dentro do repositório;
3. publicar os arquivos necessários;
4. criar URL de instalação estável;
5. só então alterar `REPO`, README e comandos de update.
6. integrar a instalação da skill como componente do bootstrap, sem manter dois
   fluxos concorrentes para a mesma responsabilidade.

### Endereços online próprios

O slug online canônico de todo o sistema é:

```text
daniela-socoloski/raiz-engine
https://github.com/daniela-socoloski/raiz-engine
git@github.com:daniela-socoloski/raiz-engine.git
```

Na consulta de 2026-08-20, o repositório existe, é público e Daniela possui
permissão administrativa, mas ainda tem tamanho zero: não há commit, branch
materializada, workflow ou release. Consequentemente, nenhum instalador pode
usar `raw.githubusercontent.com/daniela-socoloski/raiz-engine/main/...` como URL
funcional até o baseline correspondente ser publicado.

Todo recurso **pertencente ao produto** que hoje depende de `fillrochaa`,
Creator Factory, do bucket R2 anterior ou do antigo repositório
`sistema-marca-raiz` deve ser republicado sob controle de Daniela antes da troca
do consumidor. O destino inicial recomendado é GitHub Releases do próprio
repositório:

| Responsabilidade | Endereço de destino | Condição para ativar |
|---|---|---|
| checkout de desenvolvimento | `gh repo clone daniela-socoloski/raiz-engine` | primeiro baseline publicado e `gh auth login` concluído |
| página de releases | `https://github.com/daniela-socoloski/raiz-engine/releases` | primeira release publicada |
| bootstrap estável | `https://github.com/daniela-socoloski/raiz-engine/releases/latest/download/raiz-bootstrap.ps1` | asset assinado ou acompanhado de checksum |
| payload da skill | `https://github.com/daniela-socoloski/raiz-engine/releases/download/<tag>/cena-raiz-skill-<version>.tar.gz` | teste do instalador contra o asset real |
| runtime pack | `https://github.com/daniela-socoloski/raiz-engine/releases/download/<tag>/runtimes-win32-x64-<key>.tar.gz` | pacote e `.sha256` publicados pelo mesmo workflow |
| desktop Windows | assets versionados em `releases/download/<tag>/` | build, assinatura, smoke e atualização validados |
| código-fonte navegável | `https://github.com/daniela-socoloski/raiz-engine/blob/<commit>/...` | usar commit ou tag imutável na proveniência |

`releases/latest/download/...` pode ser usado somente para o launcher pequeno e
estável. Artefatos, manifests e runtimes que precisam ser reproduzíveis devem
usar uma tag ou versão explícita e checksum, nunca depender silenciosamente do
conteúdo mutável de `main` ou `latest`.

Os roots e templates de URL devem possuir uma única fonte configurável no
manifest de distribuição do bootstrap. Não repetir strings de endpoint em
`main.ts`, workflows, README, instalador e scripts de publicação.

### Downloads externos que não mudam de proprietário

URLs oficiais de Node.js, `uv`, FFmpeg, Codex, yt-dlp, modelos e APIs de
terceiros não devem ser trocadas mecanicamente pelo endereço do Raiz Engine.
Elas continuam apontando para o fornecedor oficial, com versão, checksum,
licença e origem registrados no manifest. Se um artefato for espelhado numa
release do Raiz Engine para instalação reproduzível ou offline, o espelho deve
preservar esses metadados e nunca fingir que o binário foi produzido pelo Raiz
Engine.

### Regra de `tar` no Windows

GNU `tar` interpreta um nome de arquivo contendo `:` como arquivo remoto. Um
caminho absoluto como `C:\\...\\pacote.tar.gz` usado depois de `-f` precisa de
`--force-local`. Porém, o `tar.exe` nativo verificado nesta máquina é
`bsdtar 3.8.4` e não anuncia essa opção; acrescentá-la cegamente quebraria o
caminho que hoje depende do bsdtar do Windows.

A implementação multiplataforma deve seguir uma única regra:

1. executar `tar` com `cwd` no diretório do arquivo;
2. passar a `-f` apenas o nome relativo do arquivo, sem `C:`;
3. se um fluxo comprovadamente usar GNU `tar` com caminho absoluto no Windows,
   acrescentar `--force-local`;
4. manter a extração Python do instalador em `tarfile`, que não usa essa
   interpretação de arquivo remoto;
5. testar empacotamento e extração em Windows 11 com caminho absoluto, espaços,
   acentos e unidade diferente.

Os pontos ativos a corrigir incluem `src/main.ts`, `pack-runtimes.mjs`,
`stage-node.mjs`, `stage-uv.mjs`, `stage-codex-app-server.mjs`,
`stage-yt-dlp.mjs`, `fetch-ffmpeg-win.mjs`, `fetch-ffmpeg-source.mjs` e os dois
`windows-smoke.yml`. A correção deve entrar por um helper canônico de
archive/extraction quando a consolidação estrutural permitir, não por variações
locais da mesma regra.

### Licenças

Os avisos MIT herdados permanecem onde se aplicam. Novos arquivos podem declarar a política de copyright e licença escolhida para o trabalho novo, sem remover a atribuição exigida pelo código original.

Criar futuramente:

```text
LICENSE
NOTICE.md
PROVENANCE.md
```

`PROVENANCE.md` deve classificar componentes como `upstream`, `adapted`, `owned` ou `external-reference`.

## 7. Mapa inicial de migração

| Família atual | Destino | Estratégia |
|---|---|---|
| `Edvid` em UI | `Cena Raiz` | alterar após inventário |
| `EDVID_INSTRUCTIONS` | `CENA_RAIZ_INSTRUCTIONS` | rename interno no mesmo lote |
| `EdvidDesktopApi` | `CenaRaizDesktopApi` | rename interno + typecheck |
| `window.edvidDesktop` | `window.cenaRaizDesktop` | corte limpo — executado |
| `EDVID_*` | `CENA_RAIZ_*` | corte limpo — executado |
| `edvid-media` | `cena-raiz-media` | corte limpo — registro único |
| `.edvid_write_probe` | `.cena-raiz-write-probe` | aceitar e limpar ambos |
| `edvid-*` em temporários | `cena-raiz-*` | novo nome; não migrar temporários antigos |
| `@cena-raiz/desktop` | manter | já está correto |
| `productName: cena-raiz` | revisar só apresentação | ID técnico pode permanecer |
| `com.creatorfactory.cena-raiz` | decisão aberta | não alterar ainda |
| `fillrochaa/*` em execução/instalação | `daniela-socoloski/raiz-engine` e releases próprias | mudar somente depois do artefato de destino existir |
| `fillrochaa/*` em proveniência | manter como fonte comercial imediata | não usar como endpoint ativo |
| bucket R2 anterior | release do Raiz Engine ou storage pertencente a Daniela | publicar, verificar checksum e só então trocar |
| `sistema-marca-raiz` em URL ativa | `raiz-engine` | corrigir no mesmo lote de distribuição |
| `Creator Factory` auth/update | infraestrutura própria ou acordo explícito | projeto separado |

## 8. Ordem de execução

### Fase 0A — Inventário somente de leitura

- mapear todas as fronteiras Git, remotos e históricos;
- inventariar manifests, locks, licenças e upstreams;
- identificar arquivos grandes, caches, outputs, runtimes e possíveis segredos;
- comparar responsabilidades e duplicações entre skill e desktop;
- produzir `docs/provenance/INVENTARIO-REPOSITORIO.md`;
- parar para aprovação sem mover ou excluir nada.

### Fase 0B — Recuperação externa

- criar backup do estado atual fora do repositório;
- preservar separadamente o `.git` interno;
- registrar hash, data e localização do backup;
- registrar os upstreams e, quando possível, as revisões de origem;
- confirmar que a recuperação pode ser localizada e lida.

### Fase 0C — Fronteira única e política Git

- adotar `raiz-engine/.git` como único repositório principal;
- retirar o `.git` intermediário somente depois de backup e autorização;
- criar `.gitignore` seguro;
- excluir clones, caches, runtimes, outputs e segredos do escopo;
- retirar referências externas da árvore versionada;
- confirmar que nenhuma credencial entra no Git.

### Fase 0D — Baseline

> Executada como `reconciled Raiz Engine baseline` (commit `231e746`), não como estado herdado.
> Ver `PROVENANCE.md`.

- registrar skill e desktop como componentes herdados de upstreams diferentes;
- preservar as licenças MIT aplicáveis;
- revisar exatamente o que será versionado;
- criar o primeiro commit antes de mudar a estrutura;
- não misturar renomeação ou correção funcional nesse commit.

### Fase 0E — Consolidação do monorepositório

> **Executada no worktree em 2026-08-20.**

- `SKILLS/ads-produto/` foi movida primeiro para liberar o nome `skills/`;
- a skill foi movida para `skills/cena-raiz/`;
- o desktop foi movido para `apps/cena-raiz-desktop/`;
- o plano audiovisual foi movido para
  `docs/architecture/cena-raiz-audiovisual-evolution.md`;
- a recipe foi consolidada em `recipes/ads-produto/`;
- a pasta clone vazia e a árvore intermediária foram removidas;
- manifests, links, licenças e contagens são validados na Etapa 7;
- commit e push continuam ações separadas, não autorizadas pela movimentação.

### Fase 1A — Reparar a substituição mecânica

> **Executada como `CLEAN CUT — ACCEPTED`.** A prescrição abaixo foi reconciliada
> com a decisão da seção 5; não criar aliases de identidade sem consumidor real.

Objetivo cumprido: recuperar TypeScript válido e migrar os identificadores ativos
para a nomenclatura canônica.

Primeiros alvos:

```text
apps/cena-raiz-desktop/
├── src/App.tsx
├── src/renderer.tsx
├── forge.config.ts
└── referências diretas aos identificadores inválidos
```

Regras:

- `cena-raizIcon` → `cenaRaizIcon`;
- `cena-raizLogo` → `cenaRaizLogo`;
- `window.cena-raizDesktop` → `window.cenaRaizDesktop`, sem alias;
- `process.env.cena-raiz_*` → `process.env.CENA_RAIZ_*`, sem fallback de identidade;
- não renomear bundle ID, canais IPC, storage ou protocolos nesta fase;
- terminar com `npm run typecheck` verde.

### Fase 1B — Recuperar baseline funcional

- rodar testes de timeline, mídia, helpers e J-Cut;
- abrir o aplicativo em modo de desenvolvimento;
- validar login, abertura de projeto, preview e render;
- documentar falhas anteriores à migração;
- não misturar novas features.

### Fase 2 — Identidade visível

- substituir Edvid por Cena Raiz em interface própria;
- atualizar títulos, mensagens e alt text;
- atualizar README e documentação de uso;
- revisar logos e assets;
- preservar nomes técnicos legados onde ainda são necessários para compatibilidade.

### Fase 3 — Identificadores internos

- `EdvidDesktopApi` → `CenaRaizDesktopApi`;
- `EDVID_INSTRUCTIONS` → `CENA_RAIZ_INSTRUCTIONS`;
- `edvidDesktop` → `cenaRaizDesktop` com alias;
- services, temporários e runtime labels;
- tests e fixtures;
- remover aliases somente depois de verificar consumidores.

### Fase 4 — Configuração e distribuição

- introduzir `CENA_RAIZ_*` com fallback;
- migrar workflows e secrets;
- decidir bundle ID e assinatura;
- decidir autenticação e entitlement;
- decidir update feed e runtime storage;
- publicar instalador próprio.
- publicar bootstrap próprio para reconstruir o perfil `developer` em máquina limpa;
- manter perfis `developer` e `creator` sobre o mesmo manifest e a mesma lógica de verificação.

### Fase 5 — Remoção do legado

- medir quais aliases ainda são usados;
- emitir avisos de depreciação internos;
- testar projetos e configurações antigos;
- remover fallbacks numa versão explicitamente marcada;
- preservar menções históricas necessárias em `NOTICE.md` e `PROVENANCE.md`.

## 9. Critérios de aceitação

A migração de identidade estará segura quando:

- `raiz-engine/.git` for a única fronteira Git do código próprio;
- existir backup recuperável do estado anterior;
- skill e desktop estiverem identificados como componentes herdados diferentes;
- clones e referências externas não fizerem parte do produto versionado;
- existir apenas uma implementação canônica por responsabilidade;
- arquivos e assets substituídos tiverem sido removidos após a validação;
- não existirem cópias `old`, `backup`, `clone` ou versões paralelas sem função explícita;
- não existirem identificadores TypeScript com hífen;
- `npm run typecheck` passar;
- testes atuais passarem;
- o aplicativo abrir e carregar um projeto antigo;
- EDL, timeline, J-Cut e render continuarem funcionando;
- chaves e configurações antigas forem lidas durante a transição;
- o usuário vir apenas Cena Raiz na experiência própria;
- referências herdadas permanecerem somente em compatibilidade, histórico, licença ou proveniência;
- instalador, updates e autenticação apontarem para infraestrutura realmente controlada pelo projeto;
- nenhum clone de referência for publicado como código próprio.

## 10. Fluxo de trabalho com Codex, VS Code e Claude Code

As três ferramentas podem trabalhar no mesmo projeto, mas não devem editar o mesmo conjunto de arquivos simultaneamente.

### Codex

Usar para:

- inventário de impacto;
- arquitetura e contratos;
- mudanças repo-wide controladas;
- testes e validação;
- revisão de diff;
- manutenção dos documentos-mestre.

### VS Code

Usar para:

- acompanhar arquivos e diffs visualmente;
- executar e observar o Electron;
- validar aparência e comportamento;
- fazer ajustes pequenos e conscientes;
- revisar antes de commit.

### Claude Code

Usar para:

- tarefas delimitadas por fase e arquivos;
- investigação de fluxos específicos;
- implementação de módulos isolados;
- testes focados;
- trabalho guiado pelos mesmos documentos de arquitetura.

### Regra de coordenação

Antes de cada tarefa, registrar:

```text
Objetivo:
Fase:
Arquivos permitidos:
Arquivos proibidos:
Compatibilidade que deve ser preservada:
Testes obrigatórios:
Condição de parada:
```

Não iniciar outra ferramenta sobre os mesmos arquivos até a primeira terminar ou entregar o diff.

## 11. Primeiro pedido recomendado para execução

Usar este escopo no Codex ou Claude Code:

```text
Leia GUIA-ORGANIZACAO-REPOSITORIO.md,
POLITICA-FONTE-UNICA-FUNCIONAL.md,
ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md e PLANO-MIGRACAO-IDENTIDADE.md.

Execute somente a Etapa 1 do guia de organização e a Fase 0A deste plano.

Objetivo: inventariar o repositório atual sem alterar seu estado. Mapeie fronteiras
Git, remotos, manifests, locks, licenças, arquivos grandes, outputs, caches,
possíveis segredos, referências externas e duplicações entre a skill Cena Raiz e
o Cena Raiz Desktop.

Crie docs/provenance/INVENTARIO-REPOSITORIO.md e
docs/provenance/COMPONENTES-HERDADOS.md. Não mova, renomeie, exclua, instale,
publique, faça commit ou execute atualizadores.

Entregue o inventário, os riscos encontrados e um plano exato de movimentação.
Pare para aprovação antes de qualquer mudança estrutural.
```

## 12. Próxima decisão

A identidade visível e a API interna já foram migradas por corte limpo. O próximo
marco é concluir o pacote instalável e a distribuição próprios sem reintroduzir
infraestrutura do fornecedor anterior:

1. validar a consolidação estrutural;
2. concluir o perfil `developer` do bootstrap;
3. gerar o primeiro instalador `creator` local;
4. substituir feed e runtimes herdados somente depois de o destino próprio estar
   publicado, assinado e testado.
