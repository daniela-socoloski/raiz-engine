# Guia de Organização do Repositório

Status: passo a passo operacional  
Repositório principal: `daniela-socoloski/raiz-engine`  
Origin: `https://github.com/daniela-socoloski/raiz-engine.git`  
Autenticação: **resolvida**. O `gh` está autenticado e prefere Git sobre SSH; o `origin`
permanece em HTTPS, atendido por um credential helper de GitHub App externo ao
repositório. As duas vias coexistem e funcionam. A estratégia canônica do bootstrap
ainda será decidida — ver `docs/integrations/INFRAESTRUTURA-PROPRIA.md`.  
Data do diagnóstico original: 2026-08-19  
Reconciliado em: 2026-08-20  

## 1. Objetivo

Este guia organiza o código existente antes da migração de identidade e da construção do `Raiz Engine`.

O resultado esperado é um monorepositório com uma única fronteira Git, no qual o aplicativo desktop, a skill de vídeo e o futuro motor compartilhado sejam componentes diferentes e compreensíveis.

> Primeiro preservar e organizar. Depois recuperar o baseline. Só então renomear e construir o motor.

Este guia deve ser executado em etapas. Nenhuma pasta `.git`, clone, código herdado ou arquivo de usuário deve ser removido sem backup, inventário e autorização explícita.

Depois do baseline, toda alteração também deve obedecer à [Política de Fonte Única Funcional](POLITICA-FONTE-UNICA-FUNCIONAL.md): versões anteriores ficam no Git, não como cópias dentro do código ativo.

### O objetivo maior

Organizar o repositório não é o objetivo final. Esta organização prepara a construção progressiva do **Raiz Engine**, que é o núcleo próprio do Sistema Marca Raiz.

Depois que a fundação estiver segura, o trabalho continua seguindo a arquitetura geral:

```text
preservar o que funciona
→ estabelecer contratos próprios
→ construir direção e inteligência
→ conectar os motores existentes por adapters
→ validar uma capacidade real
→ incorporar a próxima ideia dentro da mesma arquitetura
```

O plano geral funciona como espinha dorsal do sistema. Novas ideias de branding, vídeo, imagem, slides, motion, assets, Adobe, memória ou automação não devem virar projetos soltos: cada uma será classificada, arquitetada e incorporada ao Raiz Engine ou a um de seus consumidores.

## 2. O que foi descoberto

Na origem, o produto era dividido em dois repositórios. As duas linhas abaixo
são as partes complementares da base adquirida, não duas
implementações duplicadas nem referências opcionais:

| Origem da base adquirida | Cópia local atual | Responsabilidade |
|---|---|---|
| [`fillrochaa/edvid`](https://github.com/fillrochaa/edvid) | `cena-raiz/cenaraiz/cena-raiz/` | skill, workflows, helpers Python e instalador para agentes |
| [`fillrochaa/edvid-desktop`](https://github.com/fillrochaa/edvid-desktop) | `cena-raiz/cenaraiz/cena-raiz-desktop/` | aplicativo Electron, chat, timeline, preview, runtimes e render |

Os READMEs originais declaram que a skill e o aplicativo eram desenvolvidos separadamente. As cópias locais, porém, não conservam os diretórios `.git` nem os históricos desses dois repositórios.

O estado local verificado é:

```text
raiz-engine/
├── .git/                              # repositório principal, remoto da Daniela
├── cena-raiz/
│   ├── .git/                          # repositório intermediário vazio, sem remoto
│   ├── cenaraiz/
│   │   ├── cena-raiz/                 # cópia da skill
│   │   ├── cena-raiz-desktop/         # cópia do aplicativo
│   │   ├── cena-raiz-desktop-clone/   # pasta vazia
│   │   └── PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md
│   └── gh repos clones/               # referências externas; algumas têm Git próprio
├── marca-raiz-prisma/
├── raiz-Images/
├── slide-raiz/
├── SKILLS/
└── ASSETS/
```

Conclusões:

- existiam dois repositórios de origem, mas hoje existem duas cópias de código dentro de um repositório intermediário vazio;
- a raiz local já foi renomeada para `raiz-engine/` sem manter uma segunda cópia ativa;
- o `.git` válido para o produto é o da raiz `raiz-engine/`;
- `cena-raiz/.git` não contém commits nem remoto, mas deve ser preservado fora do projeto antes de ser retirado;
- `gh repos clones/` contém referências externas e não faz parte automaticamente do produto;
- `cena-raiz-desktop-clone/` está vazia e não é uma terceira implementação;
- o `Raiz Engine` ainda não existe como módulo independente.

## 3. Responsabilidade de cada componente

### Skill Cena Raiz

A skill descreve como Codex, Claude Code ou outro agente conduz a edição e chama helpers determinísticos.

Ela contém principalmente:

- instruções operacionais;
- workflows de edição;
- transcrição e análise;
- helpers Python;
- templates e referências;
- instalador da skill.

Ela não deve ser tratada como toda a aplicação nem como todo o futuro motor proprietário.

### Cena Raiz Desktop

O aplicativo desktop é a experiência do usuário e o host local de execução.

Ele contém principalmente:

- Electron e React;
- chat e integração com o agente;
- seleção de projetos;
- preview e timeline;
- aprovação e correções;
- empacotamento de Node, Python, FFmpeg, WhisperX e Codex;
- render e distribuição.

### Raiz Engine

O `Raiz Engine` será construído como núcleo compartilhado. Ele deve possuir os contratos e decisões que diferenciam o Sistema Marca Raiz:

- `BrandRuntimeProfile`;
- `VideoBrief`;
- `NarrativePlan`;
- `AudiovisualDirectionPlan`;
- `CanonicalTimeline`;
- `AssetRegistry`;
- `CreativeMemory`;
- `ExecutionRouter`.

O desktop e a skill serão consumidores ou adapters do motor. Nenhum deles deve virar sozinho a fonte de verdade de todo o sistema.

> **Duas ordens, duas responsabilidades.** As `Etapas 0–11` deste guia governam
> uma transformação única e segura do repositório. As `Fases 0–7` da
> [arquitetura do motor](ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md#15-roadmap-canônico-do-produto)
> governam a construção e o funcionamento do produto. A Etapa 10 implementa a
> Fase 0 (instalação); a Etapa 11 abre a Fase 1 (Brand Intelligence).

## 4. Estrutura-alvo inicial

A primeira organização não precisa mover todos os sistemas do ecossistema. Ela deve corrigir somente as fronteiras que estão confusas e abrir um lugar claro para o código próprio.

```text
raiz-engine/
├── apps/
│   └── cena-raiz-desktop/
├── skills/
│   └── cena-raiz/
├── recipes/
│   └── ads-produto/
├── packages/
│   ├── contracts/
│   │   ├── brand/
│   │   ├── audiovisual/
│   │   ├── assets/
│   │   ├── execution/
│   │   └── memory/
│   ├── core/
│   │   ├── brand/
│   │   ├── planning/
│   │   ├── assets/
│   │   ├── execution/
│   │   ├── memory/
│   │   └── evals/
│   └── adapters/
│       ├── ffmpeg/
│       ├── remotion/
│       └── adobe/
├── operations/
│   ├── bootstrap/
│   └── distribution/
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── integrations/
│   └── provenance/
├── marca-raiz-prisma/
├── raiz-Images/
├── slide-raiz/
├── ASSETS/
├── README.md
├── LICENSE
├── NOTICE.md
└── PROVENANCE.md
```

No primeiro ciclo, `packages/core/`, `packages/contracts/` e
`packages/adapters/` podem conter somente READMEs, schemas iniciais, fixtures e
módulos extraídos de um consumidor real. Não é necessário decidir agora se
virarão pacotes npm, Python ou um serviço. O repositório inteiro já é o
`Raiz Engine`; `core/` é seu núcleo interno.

Os diretórios não recebem prefixos `00-`, `01-` ou `02-`: eles representam
responsabilidades estáveis. A sequência numerada fica no roadmap canônico. O
`doctor` permanece dentro de `operations/bootstrap/`, junto da única fonte de
instalação e versões.

## 4.1 Estado real de cada etapa

Este guia é a **única fonte da ordem operacional**. A tabela registra onde a execução
está, sem reordenar nem promover etapas.

| Etapa | Estado |
|---|---|
| 0 — Congelar mudanças concorrentes | concluída |
| 1 — Inventário somente de leitura | concluída; ver `docs/provenance/INVENTARIO-REPOSITORIO.md` |
| 2 — Recuperação fora do repositório | **concluída e verificada**: backup completo relido (2.366 entradas) e backup separado do Git intermediário (525 objetos) |
| 3 — Fronteira Git única | **concluída** com aprovação humana explícita |
| 4 — Política de versionamento | **concluída** — `.gitignore` revisado item a item; varredura de credenciais sem ocorrências |
| 5 — Baseline | **executada, aguardando aceitação após reconciliação documental.** Commit `231e746`, designação canônica `reconciled Raiz Engine baseline`. O remoto privado já contém o baseline; novos pushes exigem autorização separada |
| 6 — Reorganização estrutural | pendente |
| 7 — Validar a consolidação | pendente |
| 8 — Recuperar o baseline técnico | **executada antecipadamente** sob autorização: typecheck limpo, oito suítes executáveis |
| 9 — Migrar identidade | **executada antecipadamente** como `CLEAN CUT — ACCEPTED` |
| 10 — Bootstrap reproduzível | pendente; requisito central |
| 11 — Começar o Raiz Engine | pendente |

## 5. Ordem segura de execução

### Etapa 0 — Congelar mudanças concorrentes

Antes do inventário:

1. não continuar substituições de nomes no código;
2. não executar Codex e Claude Code sobre os mesmos arquivos;
3. fechar processos de build ou render que possam escrever dentro do repositório;
4. não rodar instaladores ou atualizadores herdados;
5. não apagar `.git`, clones, caches ou pastas aparentemente duplicadas.

Saída esperada: o conteúdo fica estável enquanto o inventário é produzido.

### Etapa 1 — Fazer inventário somente de leitura

O primeiro trabalho de Codex ou Claude Code deve ser somente diagnóstico.

Inventariar:

- todas as fronteiras `.git`, seus remotos, branches e commits;
- arquivos e diretórios de cada sistema;
- manifests como `package.json`, `pyproject.toml` e locks;
- arquivos grandes, binários, modelos, caches e outputs;
- arquivos de configuração e possíveis segredos;
- licenças e avisos de copyright;
- referências a repositórios de origem;
- duplicações entre a skill e o desktop;
- estado dos testes sem instalar ou atualizar dependências.

Criar como saída:

```text
docs/provenance/INVENTARIO-REPOSITORIO.md
docs/provenance/COMPONENTES-HERDADOS.md
```

Condição de parada: entregar o inventário e o plano de movimentação; não mover nada ainda.

### Etapa 2 — Criar recuperação fora do repositório

Como ainda não existe um commit-base, a recuperação precisa existir antes de mexer nas fronteiras Git.

1. criar uma cópia ou arquivo compactado do estado atual fora de `raiz-engine/`;
2. preservar separadamente `raiz-engine/cena-raiz/.git`;
3. registrar tamanho, data e hash do backup;
4. registrar as URLs dos dois upstreams;
5. identificar, quando possível, de qual revisão cada cópia local partiu;
6. comparar a cópia local com o upstream sem sobrescrever arquivos locais.

Saída esperada: existe um caminho de recuperação independente do Git atual.

Condição de parada: confirmar que o backup pode ser localizado e lido.

### Etapa 3 — Adotar o nome local e uma única fronteira Git

Decisão arquitetural de destino:

```text
<raiz do repositorio>/.git
```

será a única fronteira Git do produto.

Depois do backup e mediante autorização explícita:

1. confirmar que a raiz local canônica é `raiz-engine` e que não existe uma segunda cópia ativa com o nome anterior;
2. confirmar o `origin` autenticado;
3. retirar `cena-raiz/.git` da árvore do produto, preservando sua cópia externa;
4. manter repositórios de referência fora da árvore versionada;
5. não transformar `gh repos clones/` em código do monorepositório;
6. tratar `.git` de referências externas individualmente;
7. confirmar que `git rev-parse --show-toplevel` aponta para `raiz-engine` a partir de qualquer componente próprio.

Este é um ponto de aprovação humana. A ação que retira o `.git` interno não deve ser executada automaticamente durante o inventário.

### Etapa 4 — Criar política de versionamento

Antes do primeiro commit:

1. criar ou revisar o `.gitignore` da raiz;
2. ignorar dependências, ambientes virtuais, caches, renders e runtimes gerados;
3. ignorar arquivos de assinatura, secrets e configurações locais;
4. manter assets-fonte aprovados separados de outputs gerados;
5. decidir limites para mídia e arquivos grandes;
6. fazer scan de credenciais antes do staging;
7. revisar tudo que será incluído com `git status` e `git diff --cached`.

Categorias que normalmente não devem entrar:

```text
node_modules/
.venv/
dist/
out/
build/
coverage/
resources/runtimes/
model caches
render outputs
signing.env
.env*
gh repos clones/
```

Exceções precisam ser deliberadas; por exemplo, `.env.example`, manifests de runtime e assets-fonte com licença registrada podem ser versionados.

### Etapa 5 — Baseline

> **Executada localmente em 2026-08-20. Aguarda aceitação humana.**
>
> Commit `231e746`, designação canônica **`reconciled Raiz Engine baseline`**. 854 arquivos.
>
> A intenção original desta etapa — preservar o estado herdado antes de qualquer
> adaptação — **não foi cumprida e não é mais cumprível**: as Etapas 8 e 9 rodaram
> antes, sob autorização, e nenhum snapshot local corresponde ao estado como
> recebido. O commit é o primeiro estado completo e recuperável do Raiz Engine,
> não a fotografia do que foi adquirido.
>
> A proveniência anterior depende dos upstreams públicos, dos backups datados fora
> do repositório e dos inventários em `docs/provenance/`. Ver `PROVENANCE.md`.
>
> O commit foi reescrito duas vezes antes de qualquer push — por amend, para
> corrigir o assunto, e pela migração para Git LFS. As duas reescritas ocorreram com
> o remoto vazio, sem afetar clone ou fork. **Não reescrever de novo sem autorização.**
> O primeiro push ocorreu depois dessas reescritas. `origin/main` alcança
> `5fcccf3`, incluindo o baseline; qualquer novo push exige autorização separada.

O texto abaixo é a prescrição original da etapa, mantida como registro.

Antes de reorganizar pastas ou mudar nomes:

1. adicionar apenas os arquivos aprovados;
2. conferir que clones externos, segredos e outputs ficaram fora;
3. registrar em `PROVENANCE.md` que a skill e o desktop vieram de upstreams diferentes;
4. manter as licenças MIT aplicáveis;
5. criar um commit que preserve o estado herdado atual.

Mensagem sugerida:

```text
chore: preserve inherited baseline before monorepo consolidation
```

Esse commit não afirma autoria sobre o código herdado. Ele cria o ponto de comparação para todas as adaptações futuras.

### Etapa 6 — Reorganizar em um commit separado

Somente depois do baseline, mover:

| Origem atual | Destino |
|---|---|
| `cena-raiz/cenaraiz/cena-raiz/` | `skills/cena-raiz/` |
| `cena-raiz/cenaraiz/cena-raiz-desktop/` | `apps/cena-raiz-desktop/` |
| `cena-raiz/cenaraiz/PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md` | `docs/architecture/cena-raiz-audiovisual-evolution.md` |
| `SKILLS/ads-produto/` | `recipes/ads-produto/` |

No Windows, `SKILLS/` e `skills/` representam o mesmo nome para o sistema de arquivos. Portanto, mover primeiro `SKILLS/ads-produto/` para `recipes/ads-produto/`, confirmar que a pasta antiga ficou vazia e somente depois criar `skills/cena-raiz/`.

Regras:

- usar movimentações rastreáveis pelo Git;
- não reescrever código no mesmo commit;
- não misturar rebranding com movimentação;
- não incorporar `gh repos clones/`;
- manter `cena-raiz-desktop-clone/` fora do destino e removê-la somente depois de confirmar que está vazia e dispensável;
- atualizar apenas caminhos quebrados pela movimentação.

Depois de validada a movimentação, não manter as pastas antigas como cópias. O commit anterior e a proveniência serão os meios de recuperação e consulta.

Mensagem sugerida:

```text
chore: consolidate inherited components into monorepo boundaries
```

### Etapa 7 — Validar a consolidação

Verificar:

- existe somente um `.git` para código próprio;
- os READMEs e links locais abrem;
- `package.json`, `package-lock.json`, `pyproject.toml` e `uv.lock` continuam juntos de seus componentes;
- nenhum arquivo desapareceu na movimentação;
- hashes ou contagens do inventário correspondem ao destino;
- nenhum clone externo entrou no staging;
- nenhum segredo entrou no staging;
- o diff estrutural contém movimentos, não reescritas inesperadas.

Registrar os comandos de validação e seus resultados em `docs/provenance/INVENTARIO-REPOSITORIO.md`.

### Etapa 8 — Recuperar o baseline técnico

Agora executar a Fase 1A do [Plano de Migração de Identidade](PLANO-MIGRACAO-IDENTIDADE.md):

1. corrigir identificadores TypeScript inválidos;
2. recuperar `npm run typecheck`;
3. rodar os testes existentes;
4. abrir o aplicativo em desenvolvimento;
5. separar falhas herdadas de regressões introduzidas;
6. não mudar protocolos, storage, autenticação, update ou bundle ID.

### Etapa 9 — Migrar identidade

Depois do baseline técnico:

> **Executada antecipadamente em 2026-08-20 como `CLEAN CUT — ACCEPTED`.**
> A prescrição de aliases e fallbacks foi dispensada por evidência. A estratégia e as
> evidências estão em `PLANO-MIGRACAO-IDENTIDADE.md` § 5, a fonte responsável.

1. identidade visível;
2. types e APIs internos renomeados diretamente, sem alias;
3. variáveis de ambiente renomeadas, sem fallback;
4. protocolos e armazenamento com registro único;
5. infraestrutura de autenticação e distribuição em projeto próprio — **ainda pendente**,
   e essa pendência é de infraestrutura, não de identidade;
6. legado de identidade já removido; legado de **infraestrutura** permanece até existir
   substituto próprio validado.

### Etapa 10 — Construir o bootstrap reproduzível

Antes de o motor ganhar novas dependências, transformar instalação em capacidade
versionada do produto:

1. inventariar o que `cenaraiz_install.py` realmente instala, preserva e valida;
2. definir Windows 11 x64 como primeira plataforma comprovada;
3. criar um único manifest para ferramentas, versões, checksums e perfis;
4. criar o perfil `developer` para Git, `gh`, SSH, Node, `uv`/Python, FFmpeg,
   checkout, dependências e skills;
5. separar o futuro perfil `creator`, destinado a executar o aplicativo sem o
   ambiente completo de desenvolvimento;
6. manter autenticação do GitHub interativa pelo `gh`, sem tokens em arquivos;
7. criar verificação somente de leitura (`doctor`), instalação idempotente e
   reparo retomável;
8. testar numa máquina virtual limpa, repetir a instalação e simular falha parcial;
9. publicar o comando oficial somente quando o payload estiver no remoto próprio.

Os launchers mínimos de Windows e macOS/Linux podem coexistir porque resolvem
plataformas diferentes, mas devem chamar a mesma lógica. Não criar um segundo
instalador com regras e versões próprias.

### Etapa 11 — Começar o Raiz Engine

Depois de a Fase 0 ser comprovada, o primeiro núcleo próprio deve começar pela
Fase 1 do produto: compilar a inteligência existente para um contrato de runtime
que todos os consumidores consigam usar.

O primeiro código consolidado do motor deve ser pequeno:

```text
packages/
├── contracts/
│   └── brand/
│       └── brand-runtime-profile/
└── core/
    └── brand/
        └── compile-brand-runtime-profile/
```

Primeiro marco:

```text
marca-raiz-prisma/inteligencias
+ marca-raiz-prisma/projetos
→ compileBrandRuntimeProfile
→ BrandRuntimeProfile validado
→ revisão humana
→ fixture dos três casos canônicos
```

O esqueleto de `AudiovisualDirectionPlan` que já foi iniciado no desktop não deve
ser duplicado. Depois da compilação da marca, ele será ligado ao
`BrandRuntimeProfile`, ao `VideoBrief` e à `ContentAnalysis` nas Fases 2 e 3.

Não começar por Adobe, múltiplos agentes, banco vetorial ou uma reescrita da timeline.

## 6. Como dividir o trabalho entre as ferramentas

### Codex

- manter os documentos-mestre;
- fazer inventário repo-wide;
- executar movimentações controladas;
- revisar diffs e proveniência;
- rodar validações.

### VS Code

- visualizar a árvore e os diffs;
- conferir arquivos antes do commit;
- executar e observar o aplicativo;
- validar comportamento e aparência.

### Claude Code

- investigar um componente por vez;
- executar tarefas delimitadas depois que a estrutura estiver fixada;
- implementar módulos isolados com arquivos permitidos explícitos;
- não trabalhar nos mesmos arquivos que o Codex simultaneamente.

Modelo obrigatório de tarefa:

```text
Objetivo:
Etapa:
Arquivos permitidos:
Arquivos proibidos:
Compatibilidade que deve ser preservada:
Testes obrigatórios:
Condição de parada:
```

## 7. Primeiro pedido para executar agora

O primeiro pedido deve produzir inventário, não movimentação:

```text
Leia GUIA-ORGANIZACAO-REPOSITORIO.md,
POLITICA-FONTE-UNICA-FUNCIONAL.md,
ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md e
PLANO-MIGRACAO-IDENTIDADE.md.

Execute somente a Etapa 1 do guia de organização.

Faça um inventário de leitura do repositório raiz-engine: fronteiras Git,
remotos, manifests, locks, licenças, arquivos grandes, outputs, caches, possíveis
segredos, referências externas e duplicações entre a skill Cena Raiz e o Cena
Raiz Desktop.

Crie docs/provenance/INVENTARIO-REPOSITORIO.md e
docs/provenance/COMPONENTES-HERDADOS.md. Não mova, renomeie, exclua, instale,
publique ou execute atualizadores. Entregue também um plano exato de movimentação
e pare para aprovação.
```

## 8. Definição de pronto da organização

A organização inicial estará pronta quando:

- o diretório local canônico se chamar `raiz-engine/`;
- `raiz-engine/.git` for a única fronteira Git do código próprio;
- houver backup recuperável do estado anterior;
- existir o `reconciled Raiz Engine baseline` aceito;
- skill e desktop estiverem em diretórios com responsabilidades explícitas;
- upstream, licença e divergências estiverem registrados;
- clones e referências externas estiverem fora do produto versionado;
- manifests e locks permanecerem associados ao componente correto;
- o repositório estiver pronto para recuperar o typecheck sem nova reorganização;
- houver um lugar claro para `packages/core` e `packages/contracts`;
- existir um manifest canônico de toolchain e um bootstrap mínimo validado em uma máquina limpa;
- não existirem cópias antigas dos componentes já consolidados dentro da árvore ativa.
