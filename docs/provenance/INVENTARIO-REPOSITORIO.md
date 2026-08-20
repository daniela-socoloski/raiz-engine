# Inventário do Repositório

Etapa: 1 — inventário somente de leitura  
Data do snapshot: 2026-08-20  
Raiz inspecionada: `raiz-engine/`  
Estado: snapshot histórico reconciliado; estado atual na seção 15

> **Este documento contém dois momentos:**
>
> - **seções 1–14** — snapshot histórico coletado antes da reconciliação;
> - **seção 15** — estado reconciliado e operacional atual.
>
> Para decisões sobre o estado presente, **a seção 15 prevalece**. As seções
> anteriores preservam a evidência histórica e não devem ser interpretadas como
> instruções operacionais atuais.

Este documento registra o estado observado antes da consolidação do repositório.
Ele é evidência para as etapas do
[Guia de Organização do Repositório](../../GUIA-ORGANIZACAO-REPOSITORIO.md),
não uma autorização para mover, excluir, instalar, publicar ou versionar arquivos.

## Etapas concluídas desde o snapshot

As seções 1–14 dizem que ainda não é permitido avançar para a Etapa 2. **Isso ficou
desatualizado.** Estado verificado:

| Fato | Estado |
|---|---|
| Backup completo externo | existe e foi **relido**: 2.366 entradas verificadas |
| Backup separado do Git intermediário | existe: **525 objetos** preservados |
| Fronteira Git própria | **uma só**, na raiz do repositório |
| Commit-base | **ainda não criado** |

Etapas 1, 2 e 3 concluídas com aprovação humana explícita. A etapa corrente é a 4,
em revisão.

## 0. Aviso de validade — alteração concorrente detectada

O primeiro snapshot estável foi medido por este trabalho às 00:59, com 1.427
arquivos e 447.853.305 bytes fora de `.git`. Durante a validação, outro processo
alterou a mesma árvore sem pertencer ao escopo autorizado desta etapa:

- criou `.gitignore` na raiz às 01:07:18;
- instalou `cena-raiz/cenaraiz/cena-raiz-desktop/node_modules/`, com 14.771
  arquivos e 572.819.555 bytes na medição subsequente;
- gerou `resources/helpers/__pycache__/_transcript.cpython-314.pyc`;
- regravou `src/App.tsx`, `src/renderer.tsx`, `forge.config.ts` e
  `scripts/test-jcut.mjs` entre 01:10 e 01:13.

Esta execução não criou, autorizou, removeu nem reverteu esses itens. O
`node_modules` está coberto pelo novo `.gitignore`, mas isso não torna a
instalação compatível com a Etapa 1. Os quatro arquivos-fonte alterados pertencem
ao usuário ou ao outro agente e foram preservados.

Consequência: as medições abaixo descrevem o snapshot anterior à concorrência e
continuam úteis como evidência, mas **não autorizam avançar para a Etapa 2**. É
necessário primeiro parar o outro agente/processo, decidir o que fazer com as
mudanças concorrentes e executar um inventário diferencial. Essa é a aplicação
direta da Etapa 0 do guia.

## 0.1 Regra de interpretação confirmada pela proprietária

Todo o conteúdo que já estava na base foi reunido intencionalmente como ponto de
partida do antigo Edvid/Cena Raiz e de sua evolução. Nada deve ser chamado de
“aleatório”, “sobrando” ou “descartável” antes de ser avaliado.

As classificações deste inventário descrevem **papel e proveniência**, não valor:

- `inherited` significa base funcional herdada que será adaptada;
- `external-reference` significa referência intencional ainda não incorporada
  ao código próprio;
- `generated-or-deliverable` significa material que precisa de política de
  versionamento, não material sem utilidade;
- `duplicate` significa responsabilidade que precisa de uma fonte canônica, não
  autorização para apagar uma das cópias antes do baseline e dos testes.

Regra de preservação: primeiro fazer backup e baseline, depois avaliar cada
arquivo ou capacidade, então renomear, adaptar, mover, consolidar ou manter como
referência. Se algo sair da árvore ativa, continuará preservado no backup, no
histórico Git ou na biblioteca externa aprovada.

Essa regra se aplica ao conteúdo original da base. Dependências e caches criados
posteriormente por ferramentas, como `node_modules` e `__pycache__`, continuam
sendo artefatos gerados e não viram fonte do produto.

## 1. Resumo executivo

O código existente está presente, mas ainda não existe um baseline recuperável do
produto na raiz:

- o repositório raiz está na branch `main`, aponta para
  `https://github.com/daniela-socoloski/raiz-engine.git` e não possui commits;
- `README.md` já está no índice (`AM`) e todo o restante continua sem rastreamento;
- há quatro fronteiras Git, incluindo uma fronteira intermediária com objetos
  recuperáveis e dois repositórios externos;
- skill e desktop são duas bases herdadas diferentes, parcialmente renomeadas e
  atualmente sem baseline técnico executável;
- bases funcionais herdadas, referências intencionais, resultados e assets-fonte
  ainda estão na mesma árvore e precisam ter seus papéis separados sem perda;
- no snapshot inicial não havia `.gitignore`; um foi criado concorrentemente
  depois dele, antes da Etapa 4;
- no snapshot inicial não havia `node_modules`; uma instalação concorrente foi
  criada depois dele;
- no snapshot inicial, a renomeação mecânica já havia introduzido
  identificadores inválidos em Python e TypeScript; arquivos afetados foram
  regravados por outro processo e ainda precisam de validação reconciliada;
- nada deve ser reorganizado antes do backup externo da Etapa 2.

Veredito: o diagnóstico inicial foi produzido, mas a Etapa 1 não pode ser
declarada estável enquanto a alteração concorrente não for reconciliada. O
repositório **não está pronto para staging em massa, commit-base ou rebranding**.

## 2. Método e limites

Foram usados apenas comandos de leitura para:

- enumerar arquivos, diretórios, tamanhos, extensões e pontos de reparse;
- consultar metadados Git, remotos, branches, commits e objetos;
- localizar manifests, locks, licenças, caches, outputs e nomes de arquivos que
  possam conter configuração sensível;
- comparar hashes entre skill e desktop;
- validar sintaxe Python, MJS e JSON sem instalar dependências e sem gerar cache;
- consultar versões das ferramentas já disponíveis nesta máquina.

Limites deliberados:

- nenhum arquivo candidato a segredo foi aberto;
- nenhuma varredura de valores de credenciais foi executada; ela pertence à
  Etapa 4, com ferramenta própria e política de não exibição;
- nenhum upstream foi baixado ou comparado pela rede;
- nenhum teste que dependesse de instalação foi executado;
- esta execução não moveu, renomeou, removeu, instalou, adicionou ao staging ou
  publicou arquivos; o aviso da seção 0 registra mudanças feitas por outro
  processo durante a mesma janela.

## 3. Estado Git da raiz

| Propriedade | Estado observado |
|---|---|
| Raiz Git | `raiz-engine/` |
| Branch | `main` |
| Commits | 0 (`HEAD` ainda não existe) |
| Origin | `https://github.com/daniela-socoloski/raiz-engine.git` |
| Arquivo no índice | `README.md` (`AM`) |
| Demais áreas | não rastreadas |

O `origin` está configurado por HTTPS. O guia ainda contém texto histórico sobre
SSH e configuração pendente; o comportamento local verificado deve prevalecer.
Autenticação de rede não foi revalidada nesta etapa.

Não executar `git add .`. A seleção do baseline só ocorre depois das Etapas 2,
3 e 4.

## 4. Fronteiras Git

Quatro fronteiras foram encontradas:

| Caminho | Branch | Commits | Origin | Metadados Git | Tratamento proposto |
|---|---:|---:|---|---:|---|
| `.` | `main` | 0 | `daniela-socoloski/raiz-engine` | 27.797 B | única fronteira futura do produto |
| `cena-raiz/` | `main` | 0 alcançáveis | nenhum | 66.465.066 B; 336 objetos | preservar externamente na Etapa 2; retirar somente na Etapa 3 |
| `cena-raiz/gh repos clones/AI-Youtube-Shorts-Generator/` | `main` | 21 | `SamurAIGPT/AI-Youtube-Shorts-Generator` | 1.377.119 B | base de referência intencional; preservar e avaliar fora da árvore ativa |
| `cena-raiz/gh repos clones/vox-ai-motion-graphics-generator/` | `main` | 22 | `Anil-matcha/vox-ai-motion-graphics-generator` | 14.665.186 B | base de referência intencional; preservar e avaliar fora da árvore ativa |

### 4.1 A fronteira `cena-raiz/.git` não está vazia

Embora não haja branch com commit alcançável, `git fsck` encontrou um commit e
árvores pendentes. Também há uma referência interna de checkpoint do Codex com
caminho inválido no Windows. Isso é compatível com operações locais que criaram
objetos sem formar um histórico normal.

Consequência: `cena-raiz/.git` é material recuperável. Deve receber uma cópia
externa própria, com hash, antes de qualquer retirada da árvore. Não é cache e
não pode ser apagado como se estivesse vazio.

## 5. Mapa de sistemas e volume

As contagens abaixo excluem todo conteúdo dentro de `.git` e, na linha total,
excluem também os dois documentos criados por esta etapa.

| Área | Arquivos | Bytes | Papel observado | Classe preliminar |
|---|---:|---:|---|---|
| `marca-raiz-prisma/` | 575 | 395.418.750 | inteligência de marca e projetos | próprio alegado; proveniência a confirmar |
| `cena-raiz/` | 795 | 39.744.912 | herdados, plano de evolução audiovisual e referências externas | misto |
| `ASSETS/` | 12 | 12.146.000 | mídia e referências visuais | material-fonte a classificar |
| `slide-raiz/` | 19 | 249.531 | sistema editorial e narrativa | próprio alegado; proveniência a confirmar |
| `raiz-Images/` | 9 | 103.115 | direção e geração de imagem | próprio alegado; proveniência a confirmar |
| `SKILLS/` | 11 | 83.761 | recipe e pacote de skill do arquiteto | misto |
| documentos da raiz | 6 | 107.236 | governança e arquitetura | próprio |
| **Total antes das saídas da Etapa 1** | **1.427** | **447.853.305** | — | — |

Não foram encontrados links simbólicos ou outros pontos de reparse.

### 5.1 Estrutura interna relevante

| Caminho | Arquivos | Bytes | Observação |
|---|---:|---:|---|
| `cena-raiz/cenaraiz/cena-raiz/` | 99 | 2.444.138 | skill herdada, helpers, workflows e templates |
| `cena-raiz/cenaraiz/cena-raiz-desktop/` | 115 | 2.754.256 | aplicativo Electron herdado |
| `cena-raiz/cenaraiz/cena-raiz-desktop-clone/` | 0 | 0 | pasta vazia; não é uma terceira implementação |
| `cena-raiz/cenaraiz/PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md` | 1 | 34.550 | plano de evolução audiovisual; nome canônico atual |
| `cena-raiz/gh repos clones/` | 580 | 34.511.968 | biblioteca-base intencional; ainda não é código próprio ativo |
| `marca-raiz-prisma/inteligencias/` | 25 | 658.785 | modelos de inteligência |
| `marca-raiz-prisma/projetos/` | 545 | 394.607.148 | três projetos e seus materiais |
| `SKILLS/ads-produto/` | 10 | 52.004 | recipe criativa |
| `SKILLS/architect-ai-systems.skill` | 1 | 31.757 | pacote ZIP instalável da skill de arquitetura |

O pacote `architect-ai-systems.skill` contém a skill completa e seu `SKILL.md`
é idêntico por SHA-256 ao `SKILL.md` atualmente instalado no Codex desta máquina.
Ele é funcional, mas sua fonte canônica e seu processo de rebuild ainda não
estão documentados. Isso precisa ser resolvido no bootstrap, sem manter cópias
manuais divergentes.

## 6. Arquivos grandes, binários, caches e outputs

### 6.1 Arquivos com pelo menos 10 MB

| Bytes | Caminho |
|---:|---|
| 48.888.433 | `marca-raiz-prisma/projetos/pleasing/resultado/DNA.pdf` |
| 43.185.361 | `marca-raiz-prisma/projetos/gentle-monster/resultado/DNA.pdf` |
| 42.299.784 | `marca-raiz-prisma/projetos/lollapalooza/resultado/DNA.pdf` |
| 20.530.777 | imagem JPG de referência do projeto `pleasing` |
| 14.313.149 | imagem JPG de referência do projeto `pleasing` |

Os três PDFs somam 134.373.578 bytes. O nome `resultado/` sugere entregável
gerado, mas esta etapa não determina se são registros de projeto, fixtures,
referências de qualidade ou outputs reproduzíveis. Todos permanecem preservados
até a avaliação. A Etapa 4 deve decidir explicitamente:

- o que entra no Git;
- o que exige Git LFS ou armazenamento externo;
- o que é dado de cliente e requer controle de acesso;
- o que é regenerável e deve ficar fora do baseline.

### 6.2 Diretórios candidatos a output

| Caminho | Arquivos | Bytes |
|---|---:|---:|
| `cena-raiz/cenaraiz/cena-raiz/assets/output/` | 1 | 1.754 |
| `marca-raiz-prisma/inteligencias/_template/resultado/` | 1 | 2.582 |
| `marca-raiz-prisma/projetos/gentle-monster/resultado/` | 3 | 43.231.438 |
| `marca-raiz-prisma/projetos/lollapalooza/resultado/` | 6 | 54.991.726 |
| `marca-raiz-prisma/projetos/pleasing/resultado/` | 4 | 48.992.152 |
| referência externa `higgsfield.../workspace/output/` | 2 | 444 |

Nenhum desses diretórios foi removido ou reclassificado automaticamente.

### 6.3 Dependências e caches no snapshot inicial

- `node_modules`: ausente;
- `.venv` e `venv`: ausentes;
- `dist`, `build` e `coverage` próprios: ausentes;
- `raiz-Images/scripts/__pycache__/`: presente;
- três `__pycache__` adicionais: dentro de referência externa;
- runtimes empacotados do desktop: ausentes.

Depois do snapshot, a instalação concorrente criou o `node_modules` e o novo
`__pycache__` descritos na seção 0. Eles não foram incorporados às contagens do
snapshot e não devem ser tratados como autorização retroativa para executar
testes nesta etapa.

## 7. Manifests, locks e configurações

| Componente | Manifests e locks próprios |
|---|---|
| skill herdada | `pyproject.toml`, `uv.lock` |
| templates da skill | `assets/longform/package.json`, `assets/shortform/package.json` e respectivos `tsconfig.json` |
| desktop herdado | `package.json`, `package-lock.json`, `tsconfig.json` |
| runtime WhisperX do desktop | `python/whisperx/pyproject.toml`, `python/whisperx/uv.lock` |
| template Remotion do desktop | `resources/remotion-template/package.json`, `tsconfig.json` |

Não há manifest de workspace ou package manager na raiz. Manifests dentro de
`gh repos clones/` pertencem a terceiros.

Configurações sensíveis por nome, inspecionadas apenas como metadados:

- `cena-raiz/cenaraiz/cena-raiz-desktop/signing.env.example`;
- `cena-raiz/gh repos clones/AI-Youtube-Shorts-Generator/.env.example`;
- `raiz-Images/.mcp.json`.

No snapshot inicial não havia `.gitignore` na raiz. Um `.gitignore` foi criado
concorrentemente às 01:07:18, antecipando a Etapa 4. Ele deve ser preservado como
mudança externa e revisado somente depois que sua autoria e seu escopo forem
confirmados. Os `.gitignore` aninhados, isoladamente, não protegiam o futuro
monorepositório inteiro.

### 7.1 Estado atual de possíveis segredos

No snapshot atual, a busca por nomes de arquivos sensíveis não encontrou chave
privada real na árvore raiz. Um arquivo `.pem` não rastreado havia sido observado
antes deste snapshot e já não está presente; esta etapa não verificou sua
destinação e não registra nome, conteúdo ou localização externa.

Antes do primeiro staging, a Etapa 4 deve:

1. criar a política de ignore;
2. confirmar a recuperação externa autorizada de qualquer credencial necessária;
3. executar scanner de credenciais sem imprimir valores;
4. rotacionar a credencial caso sua custódia não possa ser comprovada.

## 8. Licenças e proveniência

| Caminho | Declaração local |
|---|---|
| `cena-raiz/cenaraiz/cena-raiz/LICENSE` | MIT; Copyright (c) 2026 Creator Factory |
| `cena-raiz/cenaraiz/cena-raiz-desktop/LICENSE` | MIT; Copyright (c) 2026 Creator Factory |

Os dois arquivos são idênticos. A raiz ainda não possui `LICENSE`, `NOTICE.md`
ou `PROVENANCE.md`.

Cinco referências externas possuem licença própria; as demais não apresentam
um arquivo de licença no snapshot. Presença de licença não autoriza incorporação
automática. Cada referência precisa de avaliação individual antes de copiar
código ou assets.

O histórico Git dos dois upstreams herdados não está preservado junto às cópias
locais. A revisão exata de origem continua desconhecida e deve ser investigada
por comparação somente de leitura na Etapa 2.

## 9. Origem, nomes antigos e adaptação incompleta

Evidências locais:

- o guia registra `fillrochaa/edvid` como origem da skill;
- o guia registra `fillrochaa/edvid-desktop` como origem do aplicativo;
- o README da skill ainda se apresenta como `edvid` e aponta para ambos;
- `cenaraiz_install.py` aponta para `fillrochaa/cena-raiz`;
- `agent.md` do desktop ainda aponta para o repositório e o caminho local com o
  nome antigo `sistema-marca-raiz`;
- o desktop e a skill contêm identificadores internos `edvid` e substituições
  parciais por `cena-raiz`.

Interpretação: são duas bases herdadas com adaptação de identidade incompleta.
Uma troca de texto não estabelece propriedade nem compatibilidade. A
classificação detalhada está em
[Componentes Herdados](COMPONENTES-HERDADOS.md).

### 9.1 Endpoints online e distribuição encontrados

Consulta somente de leitura em 2026-08-20:

- remoto local: `https://github.com/daniela-socoloski/raiz-engine.git`;
- repositório GitHub: público, tamanho zero e permissão administrativa para
  Daniela;
- branch materializada: nenhuma;
- releases: nenhuma;
- workflows publicados: nenhum.

Assim, `daniela-socoloski/raiz-engine` já é o destino canônico, mas ainda não
serve nenhum instalador ou artefato. Trocar os consumidores agora criaria URLs
404.

Endpoints próprios antigos ou incorretos localizados no código ativo:

| Superfície | Referência atual | Arquivos consumidores |
|---|---|---|
| instalador da skill | `fillrochaa/cena-raiz` e `raw.githubusercontent.com/fillrochaa/...` | `cenaraiz_install.py`, `README.md`, `install.md` |
| runtime packs | bucket `pub-89ee05cdaf26477c8984a36be2b373fa.r2.dev` | `src/main.ts` e dois `windows-smoke.yml` |
| update desktop | `pub-89ee05cdaf26477c8984a36be2b373fa.r2.dev/feed.json` | `src/main.ts` |
| autenticação | projeto Supabase anterior | `src/main.ts` |
| repositório em documentação operacional | `daniela-socoloski/sistema-marca-raiz` | `cena-raiz-desktop/agent.md` |
| identidade de distribuição | `com.creatorfactory.cena-raiz` | `forge.config.ts` |

Esses pontos são backlog de migração, não autorização para substituição textual
durante a Etapa 1. O destino, a ordem de publicação e a distinção entre artefato
próprio e fornecedor externo estão no
[Plano de Migração de Identidade](../../PLANO-MIGRACAO-IDENTIDADE.md#endereços-online-próprios).

### 9.2 Risco de `tar` com caminhos Windows

O desktop invoca o executável `tar` em pelo menos oito superfícies de runtime,
stage, pack e smoke. Várias passam caminhos absolutos criados com `path.join`,
que no Windows contêm `C:`. GNU `tar` pode interpretar esse nome de archive como
remoto quando ele é usado com `-f`; `--force-local` corrige o caso GNU.

Nesta máquina, `tar --version` retornou `bsdtar 3.8.4`, e `tar --help` não listou
`--force-local`. A correção portátil não pode adicionar a flag indistintamente:
deve passar o arquivo relativo a um `cwd` controlado e usar `--force-local`
somente no ramo GNU que ainda precise de caminho absoluto.

## 10. Duplicação entre skill e desktop

A comparação SHA-256 encontrou:

- 20 grupos de conteúdo compartilhado;
- 27 arquivos da skill que coincidem com algum arquivo do desktop;
- 21 arquivos do desktop que coincidem com algum arquivo da skill;
- 29 pares de caminhos equivalentes, porque pequenos placeholders repetidos
  geram combinações múltiplas.

A sobreposição está concentrada no template Remotion e em efeitos sonoros.
Também são idênticos `helpers/face_track.py` e os dois arquivos `LICENSE`.

Arquivos de mesmo nome, mas divergentes:

- `caption_style.py`;
- `captions_for_remotion.py`;
- `windows-build.yml`;
- `windows-smoke.yml`.

Não consolidar agora. A Etapa 6 apenas move código; a escolha da fonte canônica
do template e dos helpers ocorre depois que o baseline técnico estiver
recuperado. Licenças podem permanecer duplicadas quando a obrigação legal exigir.

## 11. Estado técnico sem instalação

### 11.1 Ferramentas disponíveis nesta máquina

| Ferramenta | Estado |
|---|---|
| Git | 2.55.0.windows.4 |
| GitHub CLI | 2.97.0 |
| Node.js | v24.19.0 |
| npm | 11.17.0 |
| Python | 3.12.10 |
| uv | 0.12.5 |
| FFmpeg | ausente no `PATH` |
| TypeScript global | ausente |

Essas versões descrevem somente a máquina atual; não substituem o futuro
manifest reproduzível da Etapa 10.

### 11.2 Validações realizadas antes da alteração concorrente

| Validação | Universo | Resultado |
|---|---:|---|
| compilação de sintaxe Python, sem import e sem bytecode | 38 arquivos próprios | 2 erros |
| `node --check` | 20 scripts MJS do desktop | 0 erros de sintaxe |
| `JSON.parse` | 28 JSON próprios | 0 erros |

Erros Python confirmados:

- `cenaraiz_install.py`: funções com hífen no identificador, começando em
  `_validate_cena-raiz_payload`;
- `tests/test_installer.py`: `import cena-raiz_install` e outros identificadores
  com hífen.

O TypeScript não pôde ser executado porque não há `node_modules` nem `tsc`
global. A inspeção textual confirma, no mínimo:

- imports inválidos `cena-raizIcon` e `cena-raizLogo` em `src/App.tsx`;
- acessos inválidos `process.env.cena-raiz_*` em `forge.config.ts`;
- usos `window.cena-raizDesktop` em `src/App.tsx` e `src/renderer.tsx`;
- nomes de secrets e variáveis com hífen em workflows e exemplo de assinatura.

Isso era baseline herdado quebrado no snapshot, não regressão desta etapa. Como
os arquivos afetados foram regravados por outro processo, o estado atual ainda
não foi validado nem atribuído a uma etapa. A correção planejada pertence à
Etapa 8; a instalação concorrente não muda essa ordem.

## 12. Riscos priorizados

| Nível | Risco | Controle exigido |
|---|---|---|
| crítico | outro agente/processo escreveu durante o inventário | reativar Etapa 0 e reconciliar o delta |
| crítico | nenhum commit-base na raiz | backup externo e baseline seletivo |
| crítico | `cena-raiz/.git` contém objetos pendentes | cópia externa separada antes da retirada |
| crítico | rebranding mecânico quebrou Python e TypeScript | congelar nomes até a Etapa 8 |
| alto | referências intencionais ainda sem fronteira própria | preservar, catalogar e mover para biblioteca externa após backup |
| alto | raiz sem `.gitignore` | criar somente na Etapa 4, antes do staging |
| alto | 134 MB de PDFs e possíveis dados de cliente | política de mídia, privacidade e LFS/armazenamento |
| alto | skill e desktop duplicam lógica e templates | definir proprietário canônico depois do baseline |
| médio | documentação contém caminhos e repositório antigos | corrigir na etapa apropriada, sem apagar proveniência |
| médio | pacote do arquiteto não tem fonte/rebuild canônico no repo | integrar ao bootstrap e evitar cópia manual divergente |

## 13. Plano exato de movimentação — proposta, não executada

### 13.1 Etapa 2 — recuperação

1. criar um backup completo fora de `raiz-engine/`;
2. criar uma cópia externa separada de `cena-raiz/.git/`;
3. registrar caminho resolvido, data, tamanho e SHA-256 de cada arquivo de backup;
4. testar leitura/listagem do backup;
5. comparar as duas bases herdadas com os upstreams sem alterar arquivos locais.

O diretório externo ainda precisa ser escolhido e validado antes da execução.
Nenhum caminho dentro do próprio repositório serve como backup.

### 13.2 Etapa 3 — fronteira Git única

Depois da recuperação aprovada:

| Origem | Destino |
|---|---|
| `cena-raiz/.git/` | armazenamento externo de proveniência aprovado |
| `cena-raiz/gh repos clones/` | biblioteca externa de referências aprovada, preservada e catalogada |

Em seguida, confirmar que todos os componentes próprios resolvem a raiz Git em
`raiz-engine/`. A retirada de `.git` exige aprovação humana específica.

### 13.3 Etapa 4 — seleção do que será versionado

Criar `.gitignore`; classificar `resultado/`, caches, mídia grande, dados de
cliente, configurações locais e artefatos de distribuição sem apagá-los;
decidir Git LFS, histórico Git ou armazenamento externo preservado; executar
scan de credenciais; revisar staging arquivo a arquivo.

### 13.4 Etapa 5 — baseline herdado

Criar `PROVENANCE.md`, `NOTICE.md` e a licença raiz aplicável; preservar as
licenças dos componentes; incluir apenas arquivos aprovados; manter referências
externas e materiais não versionáveis na biblioteca/recuperação aprovada;
excluir do staging segredos e caches; então criar o commit-base herdado sem
afirmar autoria sobre o upstream.

### 13.5 Etapa 6 — reorganização estrutural

Ordem necessária no Windows:

1. `SKILLS/ads-produto/` → `recipes/ads-produto/`;
2. renomear `SKILLS/` → `skills.__casefix__/` → `skills/`, preservando
   `architect-ai-systems.skill` dentro dela;
3. `cena-raiz/cenaraiz/cena-raiz/` → `skills/cena-raiz/`;
4. `cena-raiz/cenaraiz/cena-raiz-desktop/` → `apps/cena-raiz-desktop/`;
5. `cena-raiz/cenaraiz/PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md` →
   `docs/architecture/cena-raiz-audiovisual-evolution.md`;
6. confirmar novamente que `cena-raiz-desktop-clone/` está vazia e obter
   aprovação para removê-la;
7. remover somente os contêineres antigos que ficarem vazios;
8. validar contagens e hashes antes do commit estrutural.

Essa ordem corrige a colisão entre `SKILLS` e `skills` sem perder o pacote da
skill de arquitetura. A reorganização não deve conter rebranding nem reescrita.
Depois de validada, os caminhos antigos deixam de existir; o Git e o backup são
o histórico, não cópias paralelas no código ativo.

## 14. Condição de parada

O diagnóstico solicitado foi entregue, mas o gate da Etapa 1 está suspenso pela
concorrência registrada na seção 0. Foram produzidos:

- inventário de Git, arquivos, manifests, licenças, volume, outputs,
  configurações, duplicações e estado técnico;
- classificação detalhada em `COMPONENTES-HERDADOS.md`;
- plano exato de movimentação, ainda não executado.

Próximo portão imediato: confirmar que Codex, Claude Code, VS Code e qualquer
instalador deixaram de escrever na árvore; depois executar o inventário
diferencial e decidir se as mudanças concorrentes serão mantidas. Somente então
pedir aprovação para a **Etapa 2 — criar recuperação fora do repositório**.

---

# 15. Inventário diferencial — alterações após o snapshot da Etapa 1

Produzido em: 2026-08-20
Escopo: somente diagnóstico. Nada revertido, movido, renomeado ou publicado.
Marco: estado registrado nas seções 1 a 14 deste documento.

As seções acima descrevem o repositório **antes** das alterações abaixo. Onde
divergirem, esta seção é a atual.

## 15.1 Origem das alterações

Duas frentes trabalharam em paralelo após o snapshot:

| Frente | Arquivos | Natureza |
|---|---|---|
| Documentos-mestre | `AGENTS.md`, `ARQUITETURA-*`, `GUIA-*`, `PLANO-*` e as seções 1–14 deste inventário | reescrita e expansão documental |
| Código e infraestrutura | `.gitignore`, 68 arquivos em `cena-raiz/`, `docs/integrations/` | recuperação técnica e migração de identidade |

Total: **79 arquivos** do repositório alterados, fora conteúdo gerado.

## 15.2 Classificação

### `KEEP` — manter, verificado e alinhado ao plano

| Mudança | Evidência |
|---|---|
| Chave privada `.pem` retirada da raiz do repositório | nenhum `.pem` na árvore; cópia canônica fora |
| `.gitignore` criado na raiz | 10 categorias do guia cobertas, 6 exceções deliberadas |
| Correção de identificadores TypeScript inválidos | `typecheck` de 29 erros para 0 |
| `test-jcut.mjs`: chamada do esbuild compatível com Windows | 4 suítes do desktop passando |
| `cenaraiz_install.py` e teste alinhados ao nome real do módulo | 4 testes da skill passando; antes era `SyntaxError` |
| Migração de identidade completa | zero ocorrências de `edvid` em código; APIs padrão da Web preservadas |
| `uv.lock` da skill alinhado ao `pyproject.toml` | estavam dessincronizados desde antes |
| Remoção de `cena-raiz/.git` (Etapa 3) | `toplevel` correto a partir de 7 diretórios; 525 objetos preservados fora |
| Paleta de marca substituída | luminância equivalente; cores semânticas de erro preservadas |
| `appBundleId` para domínio próprio | trocado antes de qualquer distribuição |

### `RECONCILE` — exige decisão ou correção documental

| Item | Situação |
|---|---|
| **`AGENTS.md` — gate de execução** | declara `Etapa 1` como próximo limite; Etapas 2 e 3 foram concluídas com aprovação explícita |
| **Seções 1–14 deste inventário** | descrevem `cena-raiz/.git` como existente; foi removido na Etapa 3 |
| **Seções 1–14 — nomes herdados** | contam ocorrências de `edvid` que não existem mais em código |
| **Corpus aplicado de marcas** | `marca-raiz-prisma/projetos/` — 394.607.148 bytes em `pleasing`, `gentle-monster` e `lollapalooza`. **Reclassificado para `KEEP — canonical brand-case corpus`**: é base de evidência necessária à Brand Intelligence, não material descartável. Permanece no baseline. |
| **Etapa 9 executada fora de ordem** | migração de identidade ocorreu antes do baseline, por autorização explícita, sem camada de compatibilidade — justificada por evidência de que nenhuma build foi distribuída |
| **Documentos-mestre e código divergem** | `PLANO-MIGRACAO-IDENTIDADE.md` prevê alias e fallback; a execução usou corte limpo |

### `GENERATED` — não versionar, reconstruível

| Item | Tamanho | Como reconstruir |
|---|---|---|
| `node_modules/` do desktop | 546 MB | `npm install` |
| Binário do Electron | 215 MB | postinstall do Electron |
| `__pycache__/` | — | execução do Python |
| `.env` local do desktop | — | copiar de `.env.example` |

Todos cobertos pelo `.gitignore`. Nenhum aparece em `git status`.

### `DEFER` — adiado deliberadamente

| Item | Motivo |
|---|---|
| Consolidação do template Remotion duplicado | 20 arquivos idênticos entre skill e desktop; exige decidir o proprietário canônico. Posterior à Etapa 6 |
| Mover `workflows/` para `.github/workflows/` | hoje o GitHub não os executa; movimentação é Etapa 6 |
| Ícone do app | ainda contém a cor do produto original; é imagem, não código |
| Hospedagem de runtimes e feed de update | só relevante ao empacotar; em desenvolvimento o código não os aciona |
| Assinatura de código | só relevante ao distribuir |
| `agents/`, `.claude/` e `.gitignore` originais | perdidos na cópia dos upstreams; recuperáveis apenas do upstream |

## 15.3 Alterações externas ao repositório

Registradas aqui porque afetam o comportamento do produto, embora não sejam arquivos.

| Sistema | Alteração | Classificação |
|---|---|---|
| Supabase | projeto próprio; tabela `enrollments`, RLS forçada, política de leitura própria, usuário e matrícula ativa | `KEEP` — testado de ponta a ponta |
| DNS | registro `cdn` apontando para o VPS próprio | `KEEP` — MX, SPF, DMARC e ALIAS intactos |
| Windows | variável de ambiente com token da API de hospedagem | `KEEP` — fora do repositório |

Credenciais expostas durante a configuração permanecem **pendentes de revogação**;
ver `docs/integrations/INFRAESTRUTURA-PROPRIA.md`.

## 15.4 Estado verificado agora

| Indicador | Valor |
|---|---|
| Fronteiras Git no código próprio | 1 |
| Fronteiras de terceiros em `gh repos clones/` | 2, excluídas pelo `.gitignore` |
| Commits | 0 |
| Arquivos no baseline funcional | 851 |
| Peso do baseline funcional | **413.405.494 bytes** (413 MB) |
| Dos quais, corpus aplicado de marcas | 394.607.148 bytes, preservados deliberadamente |
| `typecheck` do desktop | 0 erros |
| Suítes de teste | 4 do desktop + 4 da skill, todas passando |
| Segredos no que entraria | nenhum |

## 15.5 Decisões pendentes de aprovação

1. **Corpus aplicado de marcas — decidido.** `marca-raiz-prisma/projetos/` **permanece no baseline**, classificado `KEEP — canonical brand-case corpus`. Não entra no `.gitignore`, não é excluído por tamanho, não é moveed nem reestruturado nesta etapa. Trabalho futuro genuinamente confidencial de cliente terá política própria de privacidade e armazenamento, sem autorizar exclusão do corpus existente.
2. **Reconciliação documental** — corrigir nas seções 1–14 os pontos marcados `RECONCILE`, ou mantê-las como registro histórico do snapshot com esta seção prevalecendo.
3. **Divergência plano × execução** — registrar no `PLANO-MIGRACAO-IDENTIDADE.md` que a estratégia de alias foi dispensada por evidência, para que não seja reintroduzida.

## 15.7 Corpus aplicado de marcas — `KEEP`

`marca-raiz-prisma/projetos/` foi inicialmente classificado como material privado de
cliente, candidato a exclusão do versionamento. **A classificação estava errada** e foi
corrigida por decisão da proprietária.

Não é conjunto descartável de saídas. É a metade aplicada do Marca Raiz Prisma:

| Parte | Papel |
|---|---|
| `inteligencias/` | kernel e método |
| `projetos/` | aplicação do método |
| `projetos/<marca>/discovery/` | evidências e processo de descoberta |
| `projetos/<marca>/referencias/` | material usado para interpretar a marca |
| `projetos/<marca>/resultado/` | artefatos produzidos |
| `projetos/<marca>/.brand.json` e `CLAUDE.md` | conectam cada marca ao funcionamento do sistema |

Estrutura verificada nos três projetos: `pleasing`, `gentle-monster` e `lollapalooza`
têm os cinco elementos.

Finalidade no Raiz Engine: corpus aplicado, exemplos canônicos, evidência
arquitetural, base de avaliação e referência para construir `BrandRuntimeProfile` e
direção criativa.

**Decisão registrada:** permanece no baseline, `KEEP — canonical brand-case corpus`.
394.607.148 bytes preservados. Não excluir por tamanho, não mover nem reestruturar
nesta etapa.

**Regra para o futuro:** projetos de cliente genuinamente confidenciais receberão
política própria de privacidade e armazenamento. Isso não autoriza excluir os
projetos existentes sem avaliação individual.

### Composição real do baseline

| Área | Bytes |
|---|---|
| `marca-raiz-prisma/` | 395.418.750 |
| `ASSETS/` | 12.146.000 |
| `cena-raiz/` | 5.236.861 |
| `slide-raiz/` | 249.531 |
| `SKILLS/` | 83.761 |
| `raiz-Images/` | 80.651 |
| `docs/` | 66.113 |
| **Total** | **413.405.494** em 851 arquivos |

Nenhum número menor deve ser apresentado como baseline desejado. O baseline
funcional inclui o corpus.

## 15.8 Primeiro commit — `reconciled Raiz Engine baseline`

Criado em 2026-08-20: `231e746`, 854 arquivos rastreados, 104.155 linhas, árvore limpa.

Conteúdo excluído, verificado no índice antes do commit: clones externos de
terceiros, `node_modules`, runtimes baixados e arquivos de credencial — zero
ocorrências em cada categoria. Incluído deliberadamente: 545 arquivos do corpus
`marca-raiz-prisma/projetos/`.

## Designação canônica do primeiro commit

O commit `231e746` chama-se **`reconciled Raiz Engine baseline`**.

Não deve ser chamado de "estado herdado" nem de "inherited baseline" em nenhum
documento, mensagem ou conversa. O assunto do commit foi corrigido para essa
designação **antes de qualquer push**. O commit provisório `9c5b9d8` foi
substituído por amend e depois reescrito pela migração para Git LFS, ambas com o
remoto vazio. Ver `PROVENANCE.md`.

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
5. **A Etapa 5 foi executada localmente e aguarda aceitação humana.** O commit
   existe; a etapa não está formalmente aceita.
6. **O primeiro push ocorreu somente depois das reescritas descritas acima.** O
   remoto privado contém `231e746` e trabalho posterior. O tip corrente deve ser
   consultado em `origin/main`, pois continua avançando; novo push exige
   autorização separada.

## 15.9 Git LFS — dependência obrigatória

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

## 15.6 Condição de parada

Inventário diferencial entregue. Nenhuma mudança revertida, movida, renomeada,
publicada ou executada em sistema externo durante esta tarefa.
