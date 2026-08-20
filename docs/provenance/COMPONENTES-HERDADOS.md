# Componentes Herdados

> **Documento de proveniência.** Registra origem, licença, responsabilidade e tratamento
> dos componentes herdados. Afirmações superadas estão marcadas como históricas.
>
> Duas decisões posteriores prevalecem sobre o texto original:
>
> - a migração de identidade foi executada como `CLEAN CUT — ACCEPTED`, sem aliases nem
>   fallbacks — fonte: `PLANO-MIGRACAO-IDENTIDADE.md` § 5;
> - `marca-raiz-prisma/projetos/` é `KEEP — canonical brand-case corpus` e **permanece no
>   baseline** — fonte: `docs/provenance/INVENTARIO-REPOSITORIO.md` § 15.7.

Etapa: 1 — inventário somente de leitura  
Data do snapshot: 2026-08-20  
Objetivo: registrar origem, natureza, licença, responsabilidade e destino de
cada componente antes do baseline do Raiz Engine.

Estado de validade: o conteúdo abaixo descreve o snapshot inicial da Etapa 1.
Durante a validação, outro processo criou `.gitignore`, instalou `node_modules`,
gerou cache Python e regravou quatro arquivos do desktop. Nenhuma dessas mudanças
foi revertida. Antes de usar este registro para a Etapa 2, é obrigatório congelar
a concorrência e reconciliar o delta documentado em
[Inventário do Repositório](INVENTARIO-REPOSITORIO.md#0-aviso-de-validade--alteração-concorrente-detectada).

Este registro não transfere autoria e não autoriza incorporar referências
externas. Renomear um produto, pacote, função ou arquivo também não altera a
proveniência do código.

## 0. Decisão da proprietária sobre a base existente

O conteúdo atual não é uma coleção aleatória. Ele foi reunido intencionalmente
como base do antigo Edvid/Cena Raiz e como matéria-prima para construir o Raiz
Engine. Portanto, a decisão padrão é **preservar e avaliar**, não descartar.

Daniela declara ter adquirido do vendedor a base formada por `fillrochaa/edvid`
e `fillrochaa/edvid-desktop` com autorização ampla para modificar, renomear,
evoluir, distribuir e comercializar sob a família Raiz. O contrato ou termo
comercial dessa aquisição não está presente e não foi inspecionado neste
inventário; essa autorização é registrada como declaração da proprietária, não
como transcrição contratual.

Daniela também informa que o produto vendido foi construído pelo próprio
vendedor a partir de adaptações e incorporações anteriores. Consequentemente,
`Edvid` é a fonte comercial imediata da entrega, não uma presunção de autoria
exclusiva sobre todos os componentes. O inventário deve registrar, quando
identificável, a cadeia `fonte anterior → entrega Edvid → adaptação Cena Raiz →
criação própria`.

Essa cadeia não obriga a manter a marca Edvid, arquivos antigos ou cópias da
implementação no produto ativo. Avisos de licença e copyright serão avaliados e
preservados somente onde forem aplicáveis ao componente correspondente, em
arquivos concentrados de licença, notice e proveniência.

Essa decisão não transforma automaticamente código externo em código próprio.
Ela separa duas perguntas:

1. **Valor para a construção:** o arquivo pode conter comportamento, método,
   referência, asset, exemplo ou aprendizado relevante e deve ser preservado
   até a avaliação.
2. **Proveniência e destino:** depois da avaliação, ele poderá ser código ativo
   adaptado, referência externa, asset registrado, fixture, documentação,
   artefato gerado ou item de compatibilidade.

Renomear virá depois dessa leitura. Nomes visíveis podem mudar diretamente;
identificadores, protocolos, storage, variáveis de ambiente, pacotes e
instaladores exigem migração compatível e validação. Licenças, titulares e URLs
de origem permanecem como evidência histórica quando aplicáveis.

## 1. Classificação usada

| Classe | Significado |
|---|---|
| `inherited` | base recebida de um upstream identificado |
| `adapted-inherited` | base herdada com modificação local observável |
| `project-owned` | material declarado como parte própria do projeto |
| `project-owned-unverified` | material tratado como próprio, mas ainda sem histórico Git que comprove sua formação |
| `external-reference` | base intencional de terceiro, preservada para avaliação sem ser código próprio ativo |
| `generated-or-deliverable` | material-base cujo local de preservação e inclusão no Git dependem de decisão explícita |
| `tooling-artifact` | pacote usado por agentes ou bootstrap, sem ser runtime do produto final |

O estado `project-owned-unverified` não acusa origem externa; ele evita uma
afirmação de autoria que o snapshot sem commits ainda não consegue provar.
Nenhuma dessas classes significa “arquivo aleatório” ou autorização de remoção.

### 1.1 Matriz de tratamento

| Tratamento | Aplica-se a | Regra |
|---|---|---|
| `PRESERVE_AND_ADAPT` | skill e desktop herdados | criar baseline, recuperar testes e evoluir sem reescrita paralela |
| `PRESERVE_AS_PROVENANCE` | licenças, avisos, URLs e nomes de origem | manter como evidência mesmo após o rebranding |
| `PRESERVE_AND_ASSESS` | clones, exemplos, assets, templates e resultados | avaliar licença, função, duplicação e consumidor antes de decidir destino |
| `RENAME_DIRECT` | packages, env vars, protocolos, storage e APIs | renomear diretamente. `CLEAN CUT — ACCEPTED`: sem alias nem fallback, por ausência de consumidor real. Fonte: `PLANO-MIGRACAO-IDENTIDADE.md` § 5. Antes chamava-se `RENAME_WITH_COMPATIBILITY` e prescrevia testes, nunca por substituição global |
| `RENAME_VISIBLE` | textos, títulos e identidade visual próprios | alterar depois do baseline técnico, preservando avisos legais |
| `GENERATED` | `node_modules`, caches, builds e renders reproduzíveis | não usar como fonte; regenerar a partir de manifests |

## 2. Origem dos dois componentes de vídeo

As evidências locais registram dois repositórios de origem separados, mas com
responsabilidades complementares dentro da mesma base adquirida:

| Componente local atual | Local anterior | Origem declarada | Função original | Classe atual |
|---|---|---|---|---|
| `skills/cena-raiz/` | `cena-raiz/cenaraiz/cena-raiz/` | `fillrochaa/edvid` | método de edição para agentes, helpers e templates | `adapted-inherited` |
| `apps/cena-raiz-desktop/` | `cena-raiz/cenaraiz/cena-raiz-desktop/` | `fillrochaa/edvid-desktop` | aplicativo Electron e host local de execução | `adapted-inherited` |

As cópias locais não preservam o `.git` próprio desses upstreams. A revisão
exata de origem e o delta local ainda são desconhecidos. Uma consulta pública
somente de leitura, solicitada pela proprietária em 2026-08-20, encontrou os
seguintes estados atuais dos upstreams:

| Upstream público consultado | HEAD observado | Uso desta evidência |
|---|---|---|
| `fillrochaa/edvid` | `d8e6389db02e8de0b46ee680105c09d4250d4703` | referência atual da skill; não prova ser a revisão comprada ou copiada localmente |
| `fillrochaa/edvid-desktop` | `21c3d8c2fdf4d8f92a9eef96df9999dab7e54a34` | referência atual do desktop; não prova ser a revisão comprada ou copiada localmente |

O upstream público continua em movimento. Portanto, `main` atual não deve ser
adotado automaticamente como baseline. A Etapa 2 deve identificar a revisão mais
próxima da cópia adquirida e produzir o delta local antes de qualquer decisão de
sincronização.

No mesmo snapshot público, o scan de identidade encontrou texto relacionado a
`Edvid`, `Creator Factory` ou `fillrochaa` em 22 arquivos da skill e 55 arquivos
do desktop, sem contar locks e dependências geradas. As superfícies incluem
manifest de skill, instalador, pacote Electron, bridge IPC, protocolos, storage,
assets, workflows, runtime packs, autenticação, assinatura e atualização. Isso
confirma que a reescrita precisa abranger os dois componentes inteiros, ainda que
seja executada em lotes verificáveis.

Os dois arquivos `LICENSE` locais são MIT e declaram Copyright (c) 2026 Creator
Factory. Eles são idênticos e devem ser preservados até a revisão formal de
proveniência. A raiz agora possui `LICENSE`, `NOTICE.md` e `PROVENANCE.md`.

## 3. Skill de edição herdada

- caminho atual e fronteira estrutural: `skills/cena-raiz/`;
- caminho anterior preservado apenas como proveniência:
  `cena-raiz/cenaraiz/cena-raiz/`;
- volume: 99 arquivos, 2.444.138 bytes;
- manifest: `pyproject.toml` (`cenaraiz` 0.1.0, Python `>=3.10,<3.14`);
- lock: `uv.lock`;
- teste declarado: `tests/test_installer.py`;
- licença: MIT local;
- classe: `adapted-inherited`.

### 3.1 Responsabilidade observada

A skill contém:

- instruções de condução da edição por agente;
- fases de corte, estilo, motion e acabamento;
- helpers determinísticos de transcrição, análise, render, áudio e mídia;
- templates Remotion de short-form e long-form;
- workflows de build/smoke no Windows;
- instalador destinado a Codex, Claude Code e outros hosts de skill.

Ela deve continuar sendo a camada de método e orquestração do agente. Não deve
se tornar a interface desktop nem o futuro núcleo de contratos do Raiz Engine.

### 3.2 Achados históricos e correções posteriores

No snapshot inicial, as evidências eram:

- `README.md` e `SKILL.md` já usam a identidade ativa `Cena Raiz`;
- `install.md` ainda usa o marcador histórico `<EDVID>`;
- README, `install.md` e `cenaraiz_install.py` apontavam para
  `fillrochaa/cena-raiz`, remoto que não foi confirmado como fonte publicável;
- README e `install.md` citavam `cena-raiz_install.py`, mas o arquivo existente e
  o entry point usam o identificador Python válido `cenaraiz_install.py`;
- o manifest já usa o projeto `cenaraiz` e a CLI `cenaraiz-install`;
- `cenaraiz_install.py` passou em compilação sintática isolada em 2026-08-20;
- `tests/test_installer.py` importava `CENA_RAIZ_install`, módulo que não existia
  com esse nome; naquele momento o conjunto ainda não possuía baseline de teste
  válido.

As correções técnicas e de identidade foram executadas antes do primeiro commit,
conforme `PROVENANCE.md`. Na consolidação estrutural, as referências operacionais
ao instalador foram normalizadas para `cenaraiz_install.py`; os nomes antigos
permanecem somente neste registro histórico.

## 4. Aplicativo desktop herdado

- caminho atual e fronteira estrutural: `apps/cena-raiz-desktop/`;
- caminho anterior preservado apenas como proveniência:
  `cena-raiz/cenaraiz/cena-raiz-desktop/`;
- volume: 115 arquivos, 2.754.256 bytes;
- pacote: `@cena-raiz/desktop`, versão 0.13.8;
- stack: Electron, React, TypeScript, Vite e Electron Forge;
- licença: MIT local;
- classe: `adapted-inherited`.

### 4.1 Responsabilidade observada

O desktop concentra:

- experiência do usuário, projetos, chat e aprovações;
- preview, timeline não destrutiva e correções;
- integração com Codex App Server e outros provedores;
- IPC, persistência local e media protocol;
- preparação de Node, `uv`, FFmpeg, Python/WhisperX e outros runtimes;
- template Remotion embarcado;
- empacotamento, assinatura, atualização e distribuição.

Ele deve continuar sendo host de interface e execução local. No desenho futuro,
consome contratos do Raiz Engine; não deve ser o único lugar onde as decisões
criativas e os schemas existem.

### 4.2 Adaptação incompleta e baseline quebrado no snapshot

O pacote e a identidade visível já usam `cena-raiz`, mas permanecem nomes
`edvid`, caminho local antigo e repositório anterior no código e em `agent.md`.
A substituição mecânica também produziu identificadores inválidos:

- `process.env.cena-raiz_*` em `forge.config.ts`;
- `cena-raizIcon` e `cena-raizLogo` em `src/App.tsx`;
- `window.cena-raizDesktop` no renderer;
- nomes com hífen em workflows e exemplos de ambiente.

No snapshot, sem `node_modules` e sem `tsc` global, o typecheck completo não foi
executado. Esses achados bastavam para classificar o desktop daquele snapshot
como não compilável. Depois disso, outro processo instalou dependências e
regravou `App.tsx`, `renderer.tsx`, `forge.config.ts` e `test-jcut.mjs`. O estado
resultante não foi validado por esta etapa e não deve ser confundido com a
recuperação técnica controlada da Etapa 8.

### 4.3 Pasta vazia removida

`cena-raiz/cenaraiz/cena-raiz-desktop-clone/` tinha zero arquivos e não era uma
terceira implementação. Foi removida na Etapa 6 depois de nova confirmação e da
autorização explícita da proprietária.

## 5. Sobreposição entre skill e desktop

A comparação SHA-256 encontrou 20 hashes compartilhados, correspondendo a 27
arquivos da skill, 21 do desktop e 29 pares de caminhos.

### 5.1 Duplicações exatas relevantes

| Domínio | Skill | Desktop | Estado |
|---|---|---|---|
| tracking facial | `helpers/face_track.py` | `resources/helpers/face_track.py` | idêntico |
| template Remotion | `assets/shortform/src/Root.tsx` | `resources/remotion-template/src/Root.tsx` | idêntico |
| template Remotion | `assets/shortform/src/PencilOutline.tsx` | `resources/remotion-template/src/PencilOutline.tsx` | idêntico |
| entrada Remotion | `assets/*/src/index.ts` | `resources/remotion-template/src/index.ts` | idêntico |
| dados placeholder | JSONs em `assets/shortform/public/` | JSONs em `resources/remotion-template/public/` | idênticos |
| áudio | efeitos em `assets/*/public/sfx/` | `resources/remotion-template/public/sfx/` | idênticos |
| licença | `LICENSE` | `LICENSE` | idêntica e possivelmente obrigatória nos dois pacotes |

Arquivos homônimos que já divergiram:

- `caption_style.py`;
- `captions_for_remotion.py`;
- `windows-build.yml`;
- `windows-smoke.yml`.

### 5.2 Decisão arquitetural futura

A duplicação foi funcional quando skill e desktop eram repositórios separados.
No monorepositório, templates e helpers precisam de proprietário canônico e
consumidores explícitos. Essa consolidação não pertence à Etapa 6, porque mover
e reescrever no mesmo commit destruiria o baseline comparável.

O `LICENSE` é uma exceção possível à fonte única: avisos legais podem precisar
acompanhar cada pacote distribuído.

## 6. Referências externas

Caminho atual: `cena-raiz/gh repos clones/`  
Volume: 580 arquivos, 34.511.968 bytes, sem contar os `.git` internos  
Classe: `external-reference`, com valor confirmado como base intencional de
pesquisa e avaliação.

| Item | Git local | Origem localmente comprovada | Licença encontrada |
|---|---|---|---|
| `AI-Youtube-Shorts-Generator` | sim | `SamurAIGPT/AI-Youtube-Shorts-Generator` | não |
| `vox-ai-motion-graphics-generator` | sim | `Anil-matcha/vox-ai-motion-graphics-generator` | não |
| `PropMotion-main` | não | não comprovada | sim |
| `ar-vr-graphics-hardware-tuning-agent-skill-main` | não | não comprovada | sim |
| `higgsfield-ai-prompt-skill-main` | não | não comprovada | sim |
| `ui-clone-skills-main` | não | não comprovada | sim |
| `vr-motion-sickness-config-agent-skill-main` | não | não comprovada | sim |
| `_jutsu` | não | não comprovada | não |
| `cast` | não | não comprovada | não |
| `paint` | não | não comprovada | não |
| `SKILL.md` | não | não comprovada | não |

Regras:

- não entram automaticamente no baseline do código ativo;
- devem ser preservadas no backup e transferidas para uma biblioteca externa
  catalogada somente depois do backup;
- não podem ser copiadas para código próprio sem licença, origem, seleção e
  registro explícitos;
- cada `.git` interno deve ser preservado com sua própria identidade;
- ausência de arquivo de licença deve ser tratada como bloqueio para incorporação,
  não como permissão e não como motivo para apagar a referência preservada.

## 7. Fronteira Git intermediária

`cena-raiz/.git/` não é um componente do produto. É um artefato de histórico com
66.465.066 bytes e 336 objetos. Não há commit alcançável na branch, mas `git
fsck` encontrou commit e árvores pendentes e uma referência de checkpoint
inválida no Windows.

Classe: artefato de recuperação.  
Destino: armazenamento externo aprovado.  
Momento: cópia na Etapa 2; retirada da árvore somente na Etapa 3.

## 8. Sistemas do ecossistema Raiz

| Área | Classe preliminar | Papel futuro | Decisão pendente |
|---|---|---|---|
| `marca-raiz-prisma/` | `project-owned-unverified` | Brand Intelligence | separar método, projetos, dados e outputs |
| `ASSETS/` | material-fonte não classificado | Asset Registry | catalogar licença, origem, cliente e uso |
| `slide-raiz/` | `project-owned-unverified` | Narrative Intelligence | identificar contratos reutilizáveis |
| `raiz-Images/` | `project-owned-unverified` | Image Direction e adapters | separar config local e código portátil |
| `recipes/ads-produto/` | `project-owned-unverified` | primeira Creative Recipe | fronteira estrutural consolidada |
| documentos-mestre | `project-owned` | governança do Raiz Engine | manter atualizados com o estado verificado |

Essas áreas não derivam automaticamente dos dois upstreams de vídeo, mas a
ausência de histórico na raiz impede afirmar sua formação apenas pelo snapshot.
O baseline deve preservar essa distinção.

Os diretórios `marca-raiz-prisma/projetos/*/resultado/` são classificados como
`generated-or-deliverable` até decisão da Etapa 4. O nome do diretório não basta
para decidir exclusão; tamanho, confidencialidade, regeneração e valor como
fixture precisam ser avaliados.

## 9. Pacote `architect-ai-systems.skill`

- caminho atual: `skills/architect-ai-systems.skill`;
- formato: arquivo ZIP de skill instalável;
- tamanho: 31.757 bytes;
- SHA-256: `b2d5b78152deb5a0fe275769cdbdeaa8dad5fc38cf824182e9b7ee706a1bf525`;
- conteúdo: `SKILL.md`, manifesto de agente, ícone e referências de arquitetura;
- verificação: o `SKILL.md` interno é idêntico ao instalado nesta máquina;
- classe: `tooling-artifact`.

Esse arquivo explicou por que `SKILLS/` não poderia ser simplesmente removido
após mover `ads-produto/`. Na Etapa 6, a pasta passou por renomeação
intermediária case-safe até `skills/`, preservando o pacote.

Decisão futura para a Etapa 10: definir uma fonte canônica editável e um comando
reproduzível que gere/instale o `.skill`. O pacote e a instalação local não podem
virar duas fontes mantidas manualmente.

## 10. Fronteiras futuras de responsabilidade

| Destino | Deve possuir | Não deve possuir |
|---|---|---|
| `skills/cena-raiz/` | método de edição, instruções do agente e adapters finos | contratos centrais duplicados, UI desktop |
| `apps/cena-raiz-desktop/` | UX, timeline, IPC, preview, execução local e distribuição | regra criativa exclusiva sem contrato compartilhado |
| `packages/contracts/` | schemas portáteis como `AudiovisualDirectionPlan` | integração específica de Electron |
| `packages/core/` | direção, decisão, memória e orquestração próprias do Raiz Engine | cópia de ferramentas externas |
| `recipes/ads-produto/` | recipe de produção e critérios próprios | runtime desktop duplicado |
| armazenamento externo | clones de referência, backup e materiais não versionáveis | código ativo exigido para build |

O primeiro contrato próprio continua sendo `AudiovisualDirectionPlan`, mas sua
implementação só começa na Etapa 11, depois da recuperação estrutural e técnica.

## 11. Regras de consolidação

1. preservar o comportamento herdado antes de redesenhar;
2. manter os avisos de licença aplicáveis;
3. registrar delta local e revisão upstream quando puderem ser identificados;
4. mover e reescrever em commits separados;
5. não manter pastas antigas como cópias depois de uma movimentação validada;
6. usar Git e backup como histórico, não sufixos como `old`, `copy`, `backup` ou
   `desktop-clone` dentro do código ativo;
7. uma capacidade funcional deve ter um proprietário canônico;
8. referências externas não se tornam código próprio por renomeação;
9. segredos nunca entram em documentos, logs, fixtures ou exemplos preenchidos;
10. a Etapa 1 termina em diagnóstico; nenhuma consolidação física foi autorizada;
11. alteração concorrente interrompe o gate e exige reconciliação antes da etapa seguinte;
12. retirar algo da árvore ativa significa reposicionar com recuperação e
    proveniência, não apagar uma base antes de sua avaliação.

## 12. Lacunas de proveniência que permanecem abertas

- revisão exata de `fillrochaa/edvid` usada na cópia local;
- revisão exata de `fillrochaa/edvid-desktop` usada na cópia local;
- delta completo entre upstream e adaptação local;
- origem/licença individual dos itens externos sem `.git`;
- autoria verificável das áreas tratadas como `project-owned-unverified`;
- política para dados de cliente, PDFs de resultado e mídia grande;
- fonte canônica e build reproduzível de `architect-ai-systems.skill`.

Essas lacunas não impedem concluir o inventário. Elas impedem afirmar
proveniência completa ou criar o baseline sem as Etapas 2 a 4.

## 13. Registro vivo de defeitos encontrados na construção da Fase 0

Esta seção prevalece sobre afirmações históricas anteriores a respeito de
instalação e distribuição. Ela existe para que uma falha da base não seja
silenciosamente atribuída ao Raiz Engine e para que outro agente não a
reintroduza.

| ID | Classe | Evidência e comportamento observado | Comportamento esperado | Tratamento e condição de encerramento |
|---|---|---|---|---|
| `DIST-001` | `INHERITED-DISTRIBUTION-ASSUMPTION` | O Maker Squirrel produz `CenaRaizSetup.exe` com cerca de 0,5 MB e um `.nupkg` próximo de 1 GB. O EXE isolado não contém o produto; depende de `RELEASES` e do pacote adjacente ou de um canal remoto. | Uma pessoa deve receber uma unidade instalável inequívoca, íntegra e recuperável. | **ADAPTADO:** a unidade canônica passou a ser `out/creator/win32-x64/`, com Setup, `RELEASES`, `.nupkg`, hashes, relatório e instruções. Encerra após instalar, repetir e reparar esse diretório numa VM limpa. |
| `BOOT-001` | `ADAPTED-INSTALLER-DEFECT` | O payload do instalador exigia `agents/`, diretório inexistente no componente real; testes sintéticos passavam enquanto a instalação real falhava. A URL raw anônima também não funciona com o monorepositório privado. | O mesmo payload real versionado deve ser o exercitado pelo bootstrap e pelos testes. | **CORRIGIDO LOCALMENTE:** `agents/` saiu do payload; `--source` aceita a raiz do monorepositório ou da skill; existe teste contra o diretório real; o bootstrap autenticado chama esse modo. Encerra após a mesma prova em CI/Windows limpo e um futuro asset independente assinado. |
| `SEC-001` | `INHERITED-SECURITY-DEBT` | O refresh token era JSON legível em `userData/member-auth.json`. O comportamento funcionava, mas expunha sessão a processos do mesmo usuário. | Credencial rotativa deve usar armazenamento protegido do sistema e falhar fechado. | **CORRIGIDO EM CÓDIGO:** `safeStorage`/DPAPI, migração do legado, exclusão e falha fechada têm testes. Encerra após validação empacotada em Windows limpo. |
| `DIST-002` | `INHERITED-INFRASTRUCTURE-DEPENDENCY` | O aplicativo e os publicadores possuíam endpoints R2 do fornecedor; checksum de runtime podia ser ignorado e o download continuar por HTTPS. Isso funcionava apenas enquanto a infraestrutura anterior permanecesse disponível. | Nenhum consumidor ativo deve baixar ou atualizar por infraestrutura não controlada; todo runtime remoto exige SHA-256 válido. | **CONSUMIDOR CORRIGIDO:** URLs vêm de `distribution-manifest.json`, hoje vazias; creator incorpora runtimes; checksum remoto é obrigatório. Os scripts R2 permanecem bloqueados até o adapter próprio existir e então devem ser removidos. |
| `CI-001` | `ADAPTED-MONOREPO-DEFECT` | Quatro cópias de workflows estavam dentro de `apps/` e `skills/`, onde o GitHub não as executa. Mantê-las sugeria CI existente sem haver entrada ativa. | Uma responsabilidade, um workflow executável na raiz do repositório. | **CORRIGIDO LOCALMENTE:** somente `/.github/workflows/windows-creator.yml` permanece ativo; as cópias internas foram removidas e o histórico está no Git. Encerra quando o workflow passar no remoto sob autorização de push. |
| `BOOT-002` | `ADAPTED-MANIFEST-CONTRADICTION` | A skill exige FFmpeg, mas o perfil developer o tratava como opcional. O bootstrap podia concluir sem uma dependência necessária para corte e teste real. | Manifest, bootstrap e doctor devem concordar sobre dependências obrigatórias. | **CORRIGIDO LOCALMENTE:** FFmpeg integra `developer.requires`; doctor verde exige sua presença. Encerra após prova em Windows limpo. |
| `BOOT-003` | `ADAPTED-WINDOWS-BOOTSTRAP-DEFECT` | O `winget` instalava uma ferramenta, mas o processo já aberto mantinha o PATH antigo e mandava fechar o terminal. Nesta estação, FFmpeg 9.0 estava persistido e ainda assim o doctor não o via. | A instalação deve continuar na mesma execução e a repetição deve observar o estado persistido. | **CORRIGIDO LOCALMENTE:** launcher, bootstrap e doctor recompõem o PATH do processo a partir dos escopos Machine/User; o bootstrap valida imediatamente cada instalação. Encerra após instalação única em Windows limpo. |
| `BOOT-004` | `ADAPTED-DETECTION-DEFECT` | O bootstrap procurava a frase inglesa `Logged in to` na saída localizada do `gh`, enquanto o doctor usava o exit code. Também verificava `python` genérico, confundindo o 3.14 padrão com o 3.12 compatível já instalado. | Verificações devem ser determinísticas e iguais entre bootstrap e doctor. | **CORRIGIDO LOCALMENTE:** autenticação usa o exit code de `gh auth status`; Python usa `py -3.12 --version` e a instalação da skill chama `uv run --python 3.12`. Encerra após CI/VM. |
| `BUILD-001` | `ADAPTED-WINDOWS-BUILD-DEFECT` | A verificação GPG de FFmpeg e yt-dlp assumia `C:\\msys64\\usr\\bin\\gpg.exe`. Isso funciona no runner antigo, mas falha numa estação Windows com Git for Windows e sem MSYS2. | O staging local e o CI devem escolher a mesma família GPG compatível com caminhos `/c/...`, com override explícito e erro acionável. | **CORRIGIDO LOCALMENTE:** `gpg-host.mjs` é a única resolução para ambos os scripts, prioriza override, MSYS2 e Git for Windows e possui teste dedicado. Encerra após build no workflow raiz e em VM. |
| `SEC-002` | `CONCURRENT-REGRESSION-PREVENTED` | Durante a Fase 0, uma edição de trabalho removeu o `MemberGate` e deixou `.gate-removido.bak`; o smoke passaria abrindo o estúdio sem controle de acesso. | QA não pode enfraquecer autenticação para produzir resultado verde. | **REJEITADO:** gate restaurado, backup paralelo removido e smoke aceita `member-gate` ou `studio-shell` somente quando uma superfície React real está montada. Encerra após testes e build final. |

Esses registros não dizem que a base “não funciona”. Distinguem comportamento que
funcionava no ambiente e na infraestrutura anteriores de comportamento que não é
portátil, seguro ou próprio o bastante para o Raiz Engine distribuível.
