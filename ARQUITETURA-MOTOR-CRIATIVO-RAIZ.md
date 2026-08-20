# Arquitetura do Raiz Engine

Status: arquitetura-base para evolução incremental  
Repositório: `daniela-socoloski/raiz-engine`  
Data do levantamento inicial: 2026-08-19  
Escopo inicial de produto: direção audiovisual de marca e execução de vídeo  

## 1. Propósito deste documento

Este documento organiza a evolução do `raiz-engine` a partir dos sistemas que já existem. Ele não propõe apagar o Cena Raiz, reescrever todos os módulos ou criar uma plataforma paralela.

O objetivo é construir uma camada própria capaz de transformar estratégia de marca em decisões criativas estruturadas e, depois, compilar essas decisões para os motores de produção existentes.

Em termos simples:

> O sistema atual já sabe produzir. O Motor Criativo Raiz deve aprender a dirigir antes de mandar produzir.

### Intenção central do projeto

O objetivo principal é construir progressivamente o **Raiz Engine**. Organizar repositórios, preservar proveniência, recuperar o Cena Raiz e migrar nomes são fundações necessárias, mas não representam a chegada.

O plano geral deste documento será a espinha dorsal contínua da construção. Depois da fundação, cada nova ideia será aprimorada e arquitetada dentro do mesmo sistema, em vez de originar mais uma pasta isolada, um prompt sem contrato ou uma ferramenta paralela.

Isso inclui as ideias atuais e futuras de:

- inteligência de marca;
- narrativa e direção audiovisual;
- imagem e fotografia;
- motion e som;
- carrosséis e sistemas editoriais;
- assets reutilizáveis;
- memória criativa;
- recipes especializadas;
- Remotion, FFmpeg, After Effects e Premiere;
- novos modelos, ferramentas e interfaces.

O `Raiz Engine` não será apenas um novo nome para a skill ou para o desktop. Ele será o núcleo próprio que define contratos, preserva inteligência, formula decisões criativas e coordena componentes substituíveis.

O nome do repositório técnico também é `raiz-engine`. `Sistema Marca Raiz` permanece como nome do ecossistema e da família de produtos; `Raiz Engine` identifica o monorepositório e o motor que sustenta essa família.

Este documento é a referência arquitetural inicial. Contratos e decisões confirmados durante a implementação devem ser versionados aqui ou em ADRs, em vez de permanecer apenas em conversas e prompts.

### Documentos relacionados

- [Guia de organização do repositório](GUIA-ORGANIZACAO-REPOSITORIO.md) — primeira leitura operacional. Define como preservar as duas bases herdadas, consolidar o monorepositório e criar o baseline antes de mudar código.
- [Plano de migração de identidade](PLANO-MIGRACAO-IDENTIDADE.md) — nomenclatura, compatibilidade e retirada gradual do legado depois da consolidação estrutural.
- [Política de fonte única funcional](POLITICA-FONTE-UNICA-FUNCIONAL.md) — regra obrigatória para atualizar a implementação canônica e remover arquivos, nomes e duplicatas obsoletos depois da migração validada.
- [Plano de integração Adobe](cena-raiz/cenaraiz/README-ADOBE-INTEGRATION-PLAN.md) — plano especializado de execução com After Effects e Premiere. Deve ser retomado na Fase 7 deste roadmap, depois da validação da direção e dos contratos centrais.
- [Cena Raiz Desktop](cena-raiz/cenaraiz/cena-raiz-desktop/README.md) — estado operacional do aplicativo.
- [Cena Raiz skill](cena-raiz/cenaraiz/cena-raiz/README.md) — origem do fluxo de edição por agente e dos helpers.
- [Marca Raiz Prisma](marca-raiz-prisma/start-here.md) — entrada atual da inteligência de marca.
- [Raiz Images](raiz-Images/COMECE-AQUI.md) — direção e execução de imagens.
- [Slide Raiz](slide-raiz/00-README.md) — inteligência editorial e narrativa de carrosséis.

## 2. Situação atual verificada

> **HISTORICAL SNAPSHOT — NOT CURRENT OPERATIONAL STATE**
>
> Esta seção registra o levantamento de 2026-08-19. Depois dele, as Etapas 1, 2, 3, 8 e 9
> foram executadas. Para o estado operacional atual, ver
> `docs/provenance/INVENTARIO-REPOSITORIO.md` § 15 e `GUIA-ORGANIZACAO-REPOSITORIO.md` § 4.1.
> Este documento descreve o **destino arquitetural**; configuração temporária desta
> máquina não pertence a ele.

O checkout local já reúne vários sistemas com capacidades valiosas:

| Área | Capacidade atual | Papel futuro |
|---|---|---|
| `marca-raiz-prisma/` | Descoberta, estratégia, voz, audiência, sistema visual, fotografia, anti-patterns e geração do Marca-Raiz | Fonte da `Brand Intelligence` |
| `cena-raiz/cenaraiz/cena-raiz/` | Skill de edição, transcrição, corte, helpers, templates e instalador multiplataforma | Base operacional herdada e referência de execução |
| `cena-raiz/cenaraiz/cena-raiz-desktop/` | Aplicativo Electron, timeline não destrutiva, chat, aprovação, estilos, FFmpeg, WhisperX, Remotion e render | Produto principal e `Production Engine` inicial |
| `raiz-Images/` | Direção fotográfica, direção estilizada, prompts e adapters de geração | `Image Direction` e adapter de geração de imagem |
| `slide-raiz/` | Pesquisa editorial, headlines, narrativa, design system e render de carrosséis | Fonte para `Narrative Intelligence` e composição editorial |
| `SKILLS/ads-produto/` | Receita hero-first, consistência visual, geração de takes e montagem de anúncio | Primeiro `Creative Recipe` especializado |
| `ASSETS/` | Arquivos visuais ainda não catalogados | Entrada inicial do `Asset Registry` |

O Cena Raiz Desktop já possui uma base operacional avançada:

- ingestão e seleção de mídia;
- transcrição e alinhamento de fala;
- corte limpo;
- EDL;
- J-Cut determinístico;
- `TimelineModel` não destrutivo;
- correções, aprovação, undo e redo;
- headlines, legendas, inserts, tela dividida e tracking;
- renderização com FFmpeg e Remotion;
- integração com provedores de IA;
- empacotamento de runtimes locais.

Essa base deve ser preservada. O novo motor entra antes da execução e se conecta por contratos versionados.

### Estado do repositório

No levantamento inicial:

- o repositório remoto foi renomeado de `daniela-socoloski/sistema-marca-raiz` para `daniela-socoloski/raiz-engine` antes do primeiro commit-base;
- o `origin` do checkout local ainda aponta para `https://github.com/daniela-socoloski/raiz-engine.git`;
- o GitHub CLI está instalado e autenticado, com preferência por Git sobre SSH; o `origin`
  permanece em HTTPS, atendido por credential helper de GitHub App externo ao repositório.
  As duas vias coexistem e funcionam; a estratégia canônica do bootstrap segue em aberto e
  é registrada em `docs/integrations/INFRAESTRUTURA-PROPRIA.md`, não aqui;
- o diretório local canônico já usa o nome próprio, sem segunda cópia ativa;
- o checkout local da raiz também ainda não possuía commit-base;
- existia outro diretório `.git` dentro de `cena-raiz/`, igualmente sem commits;
- a skill e o desktop eram dois repositórios independentes na origem: `fillrochaa/edvid` e `fillrochaa/edvid-desktop`;
- as pastas locais `cena-raiz/cenaraiz/cena-raiz/` e `cena-raiz/cenaraiz/cena-raiz-desktop/` são cópias de código sem os históricos Git originais;
- `cena-raiz/cenaraiz/cena-raiz-desktop-clone/` estava vazia e não constituía uma terceira implementação;
- existiam clones de terceiros dentro de `cena-raiz/gh repos clones/`.

Antes de mudanças de identidade ou de produto, é necessário criar inventário e backup, definir a raiz como única fronteira Git, excluir caches, runtimes, outputs e clones de terceiros do versionamento e criar um snapshot-base recuperável. Nenhuma pasta `.git` interna deve ser removida sem backup e decisão explícita.

O passo a passo e os pontos de aprovação estão em [GUIA-ORGANIZACAO-REPOSITORIO.md](GUIA-ORGANIZACAO-REPOSITORIO.md).

## 3. Origem, adaptação, identidade e propriedade

O código local deriva de dois projetos: a skill pública `fillrochaa/edvid` e o aplicativo público `fillrochaa/edvid-desktop`. Daniela declara que adquiriu essa base do vendedor com autorização ampla para modificar, renomear, evoluir, distribuir e comercializar sob a família de marcas Raiz. Os dois repositórios são partes complementares do produto adquirido — método/skill de um lado e aplicação/execução desktop do outro —, não alternativas entre as quais o projeto precise escolher.

Daniela também informa que o vendedor chegou ao produto por adaptações e incorporações de bases anteriores. Assim, `Edvid` identifica a fonte comercial imediata da cópia recebida, mas não deve ser tratado automaticamente como origem exclusiva de cada componente. O instrumento comercial da aquisição não foi incluído nem inspecionado neste levantamento; a autorização é registrada como declaração da proprietária. O trabalho pode remover a identidade Edvid do produto ativo, enquanto licenças, copyright e proveniência eventualmente aplicáveis são avaliados por componente e concentrados nos registros próprios.

O arquivo local `cena-raiz/cenaraiz/cena-raiz/cenaraiz_install.py` já foi parcialmente adaptado e aponta para `fillrochaa/cena-raiz`, enquanto o README ainda registra `fillrochaa/edvid`. Essa divergência deve ser tratada como evidência de adaptação incompleta, não como nova origem confirmada. Os arquivos locais consultados usam licença MIT.

Mudar a identidade do produto e adaptar seus nomes faz parte desta evolução. A interface, os módulos, os contratos, os identificadores e a distribuição podem assumir a arquitetura e a nomenclatura do Sistema Marca Raiz. Preservar a origem não significa conservar para sempre o nome antigo dentro do produto.

Existem duas responsabilidades diferentes:

1. **Migração de identidade:** substituir gradualmente nomes herdados por nomes coerentes com `Sistema Marca Raiz`, `Raiz Engine` e `Cena Raiz`.
2. **Proveniência legal e técnica:** registrar a cadeia conhecida — bases anteriores, entrega comercial Edvid, adaptação Cena Raiz e código próprio — e manter somente os avisos de copyright e licença que forem aplicáveis a cada componente.

A adaptação deve seguir estas regras:

- preservar os avisos de copyright e licença aplicáveis;
- distinguir código herdado, código adaptado e código originalmente criado neste repositório;
- mudar nomes de produto e identificadores com compatibilidade e migração, não por substituição global;
- não incorporar automaticamente os projetos guardados em `gh repos clones/`;
- avaliar individualmente a licença de cada referência externa antes de copiar código;
- registrar divergências do upstream quando uma parte herdada for modificada;
- não confundir renomear código com adquirir autoria sobre o código original.

O diferencial próprio deve aparecer tanto na identidade quanto na substância: contratos, inteligências, critérios criativos, memória, assets aprovados e orquestração.

O plano detalhado de nomenclatura, compatibilidade e ordem de migração está em [PLANO-MIGRACAO-IDENTIDADE.md](PLANO-MIGRACAO-IDENTIDADE.md).

## 4. Tese do produto

O produto-alvo é um sistema operacional criativo de marca com um compilador audiovisual.

Ele deve:

1. compreender a marca de forma persistente;
2. compreender o objetivo e o conteúdo de uma produção específica;
3. formular uma direção criativa verificável;
4. selecionar recursos compatíveis;
5. escolher o motor de execução adequado;
6. transformar o plano aprovado em operações determinísticas;
7. registrar correções e resultados para não recomeçar do zero.
8. reconstruir um ambiente funcional em outra máquina por um bootstrap versionado e verificável.

O produto não é apenas um agente que escreve prompts e também não é apenas um editor de vídeo. O modelo interpreta e recomenda. Software determinístico valida, executa, lê o resultado e preserva o estado.

### Regra para arquitetar todo o restante

Toda ideia nova deve passar por esta sequência antes de virar implementação:

```text
Ideia
→ capacidade que ela cria
→ camada a que pertence
→ entradas e saídas
→ contrato e fonte de verdade
→ decisão BUILD / INTEGRATE / ADAPT / DEFER / REMOVE
→ componente e pasta responsáveis
→ consumidor real
→ critério de validação
→ fase do roadmap
```

Perguntas obrigatórias:

1. Que decisão ou resultado esta ideia torna possível?
2. Ela pertence à inteligência permanente, ao pipeline de uma produção, a um motor de execução ou à revisão e memória?
3. O Sistema Marca Raiz precisa possuir essa capacidade ou integrar uma solução madura?
4. Qual artefato estruturado atravessa sua fronteira?
5. Quem será a fonte de verdade?
6. Qual componente existente a consome primeiro?
7. Como saberemos que funciona sem depender apenas de opinião ou conversa?

Se essas respostas ainda não existirem, a ideia permanece como hipótese documentada. Ela não deve gerar uma pasta ou integração prematura.

## 5. Macroarquitetura

```mermaid
flowchart TD
    BD[Brand Discovery] --> BI[Brand Intelligence]
    BI --> BRP[Brand Runtime Profile]

    VB[Video or Creative Brief] --> CD[Creative Direction Layer]
    CA[Content Analysis] --> CD
    BRP --> CD
    AM[Creative Memory] --> CD
    AR[Asset Intelligence] --> CD

    CD --> DP[Direction Plan]
    DP --> HR[Human Review]
    HR -->|approved| EP[Validated Execution Plan]
    HR -->|revision| CD

    EP --> ER[Execution Router]
    ER --> FF[FFmpeg]
    ER --> RM[Remotion]
    ER --> IM[Image Engines]
    ER --> AE[After Effects Adapter]
    ER --> PR[Premiere Adapter]

    FF --> RB[Readback and Quality Control]
    RM --> RB
    IM --> RB
    AE --> RB
    PR --> RB

    RB --> CT[Canonical Project State]
    CT --> FR[Final Review]
    FR --> AM
```

## 6. As quatro camadas do sistema

### 6.1 Inteligência permanente

É criada uma vez, versionada e reutilizada.

Inclui:

- `BrandRuntimeProfile`;
- `VerbalProfile`;
- `VisualProfile`;
- `EditorialProfile`;
- `MotionProfile`;
- `SoundProfile`;
- `AudienceProfile`;
- `BrandConstraints`;
- `AssetRegistry`;
- `CreativeMemory`.

O sistema não deve reler dezenas de documentos de inteligência em cada cena. O `marca-raiz-prisma` deve compilar o conhecimento relevante em artefatos compactos, rastreáveis e próprios para execução.

### 6.2 Pipeline de cada produção

É executado novamente para cada vídeo, campanha, imagem ou carrossel.

```text
CreativeBrief
→ ContentAnalysis
→ VideoStrategy
→ NarrativePlan
→ AudiovisualDirectionPlan
→ AssetSelection
→ ExecutionPlan
→ Preview
→ HumanReview
→ Delivery
→ CreativeMemory
```

### 6.3 Motores e adapters

São recursos substituíveis que executam decisões:

- FFmpeg;
- WhisperX e análise de mídia;
- Remotion;
- geradores de imagem e vídeo;
- After Effects;
- Premiere;
- armazenamento, conectores e MCPs.

Esses motores não são a fonte de verdade do produto. Cada um deve ser acessado por um adapter com entrada, saída, erros e capacidades normalizados.

### 6.4 Revisão, operação e aprendizado

Inclui:

- aprovação humana;
- undo e recuperação;
- versionamento;
- readback dos motores;
- controle de custos;
- observabilidade;
- avaliações criativas;
- registro estruturado de correções;
- fallback quando um motor não está disponível.

## 7. A nova camada central

O componente novo mais importante é o `Creative Direction Layer`.

Ele reúne cinco capacidades diferentes:

### `VideoIntelligence`

Decide que vídeo deve ser criado considerando objetivo, público, canal, formato, duração, disponibilidade de mídia e chamada para ação.

### `NarrativeIntelligence`

Organiza hook, promessa, tensão, progressão, hierarquia, beats, transições de raciocínio e encerramento.

Parte da experiência de headlines e arquitetura narrativa existente em `slide-raiz/` pode ser adaptada para essa capacidade.

### `AudiovisualDirection`

Transforma estratégia e narrativa em ritmo, densidade, enquadramento, silêncio, som, texto, imagem, vídeo, gráficos e movimento.

`MotionIntelligence` é uma parte dessa direção. Não deve controlar a narrativa inteira nem criar keyframes diretamente.

### `AssetIntelligence`

Conhece o que já existe e seleciona recursos por função, marca, formato, duração, compatibilidade, direitos, custo e qualidade.

### `CreativeMemory`

Registra aprovações, rejeições, substituições, ajustes, resultados e contexto. Memória não é um transcript de chat; é um conjunto de fatos e preferências estruturadas com proveniência.

## 8. Contratos canônicos

Os artefatos abaixo formam a linguagem interna do motor.

| Contrato | Responsabilidade | Persistência |
|---|---|---|
| `BrandRuntimeProfile` | versão compacta e executável da identidade | por marca e versão |
| `CreativeBrief` | objetivo, público, canal, formato e restrições | por produção |
| `ContentAnalysis` | evidências extraídas do conteúdo e da mídia | cache por fingerprint |
| `NarrativePlan` | beats, progressão e intenção narrativa | por versão do plano |
| `AudiovisualDirectionPlan` | direção de cena, mídia, motion, som e ritmo | por versão do plano |
| `AssetManifest` | capacidade e controles de um asset | por asset e versão |
| `AssetSelection` | asset escolhido, motivo e parâmetros | por cena |
| `ExecutionPlan` | operações validadas para os motores | por job |
| `CanonicalTimeline` | estado editorial não destrutivo | por versão da timeline |
| `ReviewDecision` | aprovação, rejeição ou correção | por checkpoint |
| `CreativeMemoryEntry` | aprendizado estruturado e reutilizável | por marca e escopo |

### Regra de fronteira

O modelo pode propor um `AudiovisualDirectionPlan`, mas não deve chamar diretamente FFmpeg, Remotion, After Effects ou Premiere a partir desse plano.

O fluxo obrigatório é:

```text
model proposal
→ schema validation
→ compatibility validation
→ human gate when required
→ deterministic compilation
→ engine adapter
→ readback
→ result validation
```

## 9. Primeiro contrato: `AudiovisualDirectionPlan`

O primeiro contrato não precisa representar todas as ideias futuras. Ele deve criar uma passagem estável entre intenção e execução.

Estrutura inicial recomendada:

```ts
export interface AudiovisualDirectionPlan {
  schemaVersion: '1.0';
  planId: string;
  projectId: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'superseded';
  inputs: {
    brandProfileVersion?: string;
    timelineFingerprint?: string;
    transcriptFingerprint?: string;
    assetRegistryVersion?: string;
  };
  intent: {
    objective: string;
    audience?: string;
    channel?: string;
    format: '9:16' | '16:9' | '1:1';
    targetDurationSeconds?: number;
    desiredResponse?: string;
  };
  direction: {
    narrativeSummary?: string;
    pace: 'slow' | 'moderate' | 'fast' | 'variable';
    energy: 'restrained' | 'balanced' | 'expressive';
    density: 'minimal' | 'moderate' | 'dense';
    visualHierarchy: string[];
    soundPrinciples: string[];
    prohibitedPatterns: string[];
  };
  scenes: SceneDirection[];
  provenance: {
    origin: 'user' | 'planner' | 'migration';
    createdAt: string;
    model?: string;
    promptVersion?: string;
  };
}
```

`SceneDirection` deve indicar intenção e necessidade, não código de render:

```ts
export interface SceneDirection {
  sceneId: string;
  startFrame: number;
  endFrame: number;
  purpose: 'hook' | 'clarify' | 'emphasize' | 'compare' | 'transition' | 'identify' | 'call-to-action';
  narrativeBeat: string;
  mediaNeed?: {
    kind: 'none' | 'text' | 'image' | 'video' | 'graphic';
    description?: string;
  };
  motionNeed?: {
    function: string;
    intensity: 'low' | 'medium' | 'high';
  };
  audioNeed?: {
    role: 'silence' | 'voice' | 'music' | 'effect' | 'mixed';
    description?: string;
  };
  selectedAssetId?: string;
  engineRecommendation?: 'ffmpeg' | 'remotion' | 'after-effects' | 'premiere' | 'image-provider';
}
```

O `ExecutionRouter` pode rejeitar a recomendação do planner se o motor estiver indisponível, incompatível ou mais complexo do que o necessário.

## 10. Como os sistemas atuais entram no motor

### `marca-raiz-prisma` → `Brand Intelligence Compiler`

Preservar os documentos completos como evidência e fonte editorial. Adicionar uma compilação para `BrandRuntimeProfile`, contendo apenas decisões necessárias para o trabalho atual.

O compilador deve registrar quais módulos e versões produziram cada campo.

### `slide-raiz` → `Narrative Intelligence`

Extrair e adaptar:

- engine de headlines;
- arquitetura narrativa;
- manual editorial;
- hierarquia de informação;
- design system;
- critérios de qualidade.

Não copiar prompts gigantes para o contexto de vídeo. Transformar conhecimento reutilizável em regras, rubricas e contratos menores.

### `raiz-Images` → `Image Direction Adapter`

Separar:

- inteligência de direção de imagem;
- contrato de pedido de imagem;
- escolha de provider;
- execução e armazenamento.

O vídeo deve solicitar uma imagem por `ImageRequest`; o adapter decide como gerar e devolve um `GeneratedAsset` registrado. O planner não deve conhecer detalhes do Higgsfield ou Magnific.

### `ads-produto` → `Creative Recipe`

Transformar o fluxo hero-first em uma receita especializada declarativa:

```text
product-ad-vertical-15s
├── eligibility rules
├── required inputs
├── creative checkpoints
├── shot roles
├── asset constraints
├── duration contract
└── execution strategy
```

Essa receita prova que formatos diferentes precisam de gramáticas diferentes sem exigir motores separados.

### `cena-raiz` → `Video Production Engine`

Preservar:

- timeline;
- EDL;
- ingestão;
- transcrição;
- corte;
- J-Cut;
- Remotion;
- FFmpeg;
- preview;
- aprovação;
- correções;
- empacotamento.

Adicionar planos e adapters ao redor dessas capacidades. Não criar uma segunda timeline.

## 11. Decisões de propriedade

| Capacidade | Decisão | Razão |
|---|---|---|
| Brand Intelligence e compilação runtime | `BUILD` | diferenciação central |
| Creative Direction Layer | `BUILD` | cérebro do produto |
| Narrative e audiovisual planning | `BUILD` | traduz marca em decisões |
| Contratos canônicos | `BUILD` | independência de engines e modelos |
| Asset Registry | `BUILD` | consistência, reuso e redução de tokens |
| Creative Memory e evals | `BUILD` | aprendizado controlado |
| Bootstrap, `doctor` e manifest de toolchain | `BUILD` | o produto não pode depender da configuração desta máquina |
| Instalador multiplataforma herdado | `ADAPT` | já prova detecção de plataforma, payload seletivo, atualização e verificação |
| GitHub CLI, gerenciadores de pacote e instaladores oficiais | `INTEGRATE` | autenticação e provisionamento não são diferenciação do produto |
| Cena Raiz Desktop e TimelineModel | `ADAPT` | base operacional já funcional |
| Remotion templates existentes | `ADAPT` | execução visual comprovada |
| raiz-Images | `ADAPT` | direção forte, provider deve ficar isolado |
| slide-raiz | `ADAPT` | inteligência editorial reaproveitável |
| ads-produto | `ADAPT` como recipe | fluxo especializado já validado conceitualmente |
| FFmpeg e WhisperX | `INTEGRATE` | infraestrutura madura |
| Remotion | `INTEGRATE` por adapter | renderer substituível |
| After Effects e Premiere | `INTEGRATE` depois do core | ampliam execução, não criam direção |
| Geração livre de código de motion | `REMOVE` do caminho padrão | imprevisível e cara em contexto |
| Prompts livres como único contrato | `REMOVE` gradualmente | não são estado executável confiável |
| Sincronização Adobe irrestrita | `DEFER` | alto risco e baixo valor antes do core |
| Microserviços e multiagentes | `DEFER` | monólito modular atende ao MVP |

## 12. Arquitetura de código proposta

A organização inicial deve corrigir as fronteiras reais: aplicativo, skill, motor compartilhado, recipes e documentação. Ela não autoriza reorganizar todos os sistemas apenas para deixar a árvore visualmente uniforme.

Estrutura inicial sugerida na raiz, depois do baseline herdado:

```text
raiz-engine/
├── apps/
│   └── cena-raiz-desktop/
├── skills/
│   └── cena-raiz/
├── packages/
│   ├── contracts/
│   │   ├── brand/
│   │   ├── creative/
│   │   ├── assets/
│   │   └── execution/
│   └── core/
│       ├── domain/
│       ├── application/
│       ├── adapters/
│       ├── registry/
│       ├── memory/
│       └── evals/
├── recipes/
│   └── ads-produto/
├── operations/
│   ├── bootstrap/
│   ├── doctor/
│   └── release/
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── integrations/
│   └── provenance/
├── marca-raiz-prisma/
├── raiz-Images/
├── slide-raiz/
└── ASSETS/
```

No início, `packages/contracts/` e `packages/core/` podem conter apenas documentação, schemas e fixtures. Eles não precisam virar serviços ou pacotes publicados. O repositório inteiro já representa o `Raiz Engine`; por isso o núcleo interno se chama `core`, sem repetir `raiz-engine/raiz-engine`.

Mapeamento estrutural inicial:

| Origem atual | Destino depois do baseline |
|---|---|
| `cena-raiz/cenaraiz/cena-raiz/` | `skills/cena-raiz/` |
| `cena-raiz/cenaraiz/cena-raiz-desktop/` | `apps/cena-raiz-desktop/` |
| `cena-raiz/cenaraiz/README-ADOBE-INTEGRATION-PLAN.md` | `docs/integrations/adobe.md` |
| `SKILLS/ads-produto/` | `recipes/ads-produto/` |

Movimentação estrutural e rebranding devem ocorrer em commits diferentes.

## 13. Instalação reproduzível e bootstrap do zero

Portabilidade é requisito do produto, não uma conveniência de desenvolvimento.
Clonar o repositório não equivale a instalar o sistema, e a configuração deste
computador não pode ser a única descrição do ambiente necessário.

A experiência-alvo é:

```text
máquina nova
→ comando inicial nativo do sistema operacional
→ diagnóstico de plataforma e hardware
→ instalação ou validação da toolchain
→ autenticações oficiais que exigem o usuário
→ instalação dos componentes selecionados
→ sincronização das dependências fixadas
→ testes de saúde
→ relatório final reproduzível
```

O instalador herdado `cenaraiz_install.py` é uma base valiosa porque já demonstra
um comando multiplataforma, detecção de agentes, download sem clone, payload em
allowlist, atualização idempotente, preservação de `.env` e `.venv` e verificação
de `uv`, FFmpeg e Node. Ele instala apenas a skill audiovisual e ainda aponta
para infraestrutura herdada; portanto será **adaptado como referência**, não
tratado como instalador definitivo do Raiz Engine.

### Dois perfis, uma só lógica de instalação

O bootstrap canônico deve oferecer pelo menos dois perfis:

| Perfil | Destino | Conteúdo |
|---|---|---|
| `developer` | máquina usada com VS Code, Codex e Claude Code | Git, GitHub CLI, SSH, checkout, Node, `uv`/Python, FFmpeg, dependências, skills, comandos de build e testes |
| `creator` | máquina que executa os produtos | aplicativo empacotado, runtimes necessários, assets distribuíveis e adapters habilitados, sem exigir o repositório de desenvolvimento |

Capacidades grandes ou licenciadas entram como módulos detectáveis, por exemplo
`video`, `image`, `slides` e `adobe`. Adobe, modelos pagos, plugins proprietários
e credenciais nunca devem ser redistribuídos como se pertencessem ao projeto. O
bootstrap detecta, valida e orienta a ativação dessas capacidades.

### Fonte de verdade da instalação

A arquitetura-alvo reserva `operations/bootstrap/` para:

```text
operations/bootstrap/
├── install.ps1              # entrada mínima para Windows
├── install.sh               # entrada mínima para macOS/Linux
├── raiz_bootstrap.py        # orquestração compartilhada
└── manifests/
    └── toolchain.json       # componentes, versões, checksums e perfis
```

Os launchers por sistema operacional são exceções funcionais legítimas, não
implementações duplicadas: eles devem apenas preparar o mínimo necessário e
chamar a mesma lógica compartilhada. Versões e dependências pertencem ao
manifest e aos locks do repositório, nunca a instruções divergentes espalhadas
por READMEs.

### Regras obrigatórias

- ser idempotente: repetir o comando repara ou atualiza sem duplicar instalações;
- ser retomável: uma falha no meio não obriga recomeçar tudo;
- detectar antes de instalar e explicar cada mudança de máquina;
- nunca armazenar token, senha ou chave privada no repositório;
- usar o fluxo oficial `gh auth login` para autenticação do GitHub;
- tratar `daniela-socoloski/raiz-engine` como slug canônico de source,
  bootstrap, workflows e releases pertencentes ao produto;
- nunca ativar uma URL `raw` ou de release antes de o arquivo e seu checksum
  existirem no remoto;
- manter downloads de terceiros em fontes oficiais, com versão, checksum,
  licença e origem no manifest, mesmo quando houver espelho próprio;
- centralizar roots e templates de endpoints próprios no manifest de
  distribuição, sem hardcodes divergentes entre app, scripts e documentação;
- não sobrescrever clones com mudanças, arquivos pessoais ou configuração local;
- usar versões fixadas, checksums e fontes oficiais sempre que aplicável;
- separar código-fonte, payload instalado, caches, modelos e outputs;
- oferecer `doctor`, `repair` e atualização pela mesma fonte de verdade;
- validar o bootstrap em máquina virtual limpa antes de declarar uma plataforma suportada;
- começar por Windows 11 x64 e preservar desenho multiplataforma; macOS e Linux só serão anunciados depois de testes reais.

No Windows, chamadas de GNU `tar` não podem receber um arquivo absoluto como
`C:\\...\\arquivo.tar.gz` depois de `-f` sem `--force-local`. Como o Windows
também fornece `bsdtar`, que pode não aceitar essa opção, o adapter canônico deve
preferir `cwd` no diretório do arquivo e passar um nome relativo. A flag
`--force-local` fica reservada aos fluxos em que GNU `tar` e o caminho absoluto
forem detectados. Esse comportamento deve ser coberto pelo bootstrap e pelos
smokes de Windows.

### Critério de aceitação do bootstrap

Uma máquina limpa deve chegar ao mesmo estado funcional com uma única entrada,
intervenção humana apenas para permissões e logins, e um relatório final que
mostre versões, capacidades disponíveis, pendências e testes executados. Nenhum
caminho absoluto como `C:\\Users\\RAIZ` pode ser necessário para o produto funcionar.

## 14. Primeiro ponto de integração real

No Cena Raiz Desktop, o método `applyStyleSelection()` em `src/App.tsx` transforma `ProjectStyleState` em texto livre, envia esse briefing ao agente, e o agente escreve `edit-data.json`.

Esse é o primeiro seam seguro.

Fluxo atual:

```text
ProjectStyleState
→ free-text prompt
→ agent interpretation
→ edit-data.json
→ Remotion
```

Primeira evolução:

```text
ProjectStyleState
→ AudiovisualDirectionPlan v1
→ persisted planning artifact
→ compatibility prompt/compiler
→ existing edit-data.json
→ existing Remotion render
```

Nenhum comportamento visual precisa mudar nessa fase. O objetivo é introduzir o contrato sem quebrar o motor.

### Arquivos iniciais no Cena Raiz Desktop

```text
src/
├── direction/
│   ├── audiovisual-direction-plan.ts
│   ├── validate-direction-plan.ts
│   └── build-plan-from-style.ts
├── shared.ts
├── main.ts
├── preload.ts
└── App.tsx

scripts/
└── test-direction-plan.mjs
```

Persistência no projeto de vídeo:

```text
edit/
└── planning/
    └── audiovisual-direction-plan.json
```

### Critérios de aceitação da primeira integração

- o mesmo briefing atual continua produzindo o mesmo render;
- o plano é validado antes de ser salvo;
- o plano é gravado atomicamente;
- reabrir o projeto recupera a versão ativa;
- um plano inválido nunca chega ao agente ou renderer;
- `TimelineModel`, EDL, J-Cut e Remotion não mudam de responsabilidade;
- nenhum novo provider ou dependência é necessário;
- existe teste de criação, validação, persistência e migração.

## 15. Roadmap de evolução

### Fase 0 — Baseline e governança

Objetivo: tornar o estado atual recuperável e compreensível.

- executar inventário somente de leitura;
- criar backup recuperável fora do repositório;
- registrar os dois upstreams e as divergências locais;
- definir `raiz-engine/.git` como a única fronteira Git do produto;
- criar `.gitignore` para outputs, runtimes, caches, segredos e clones de referência;
- registrar proveniência e licenças;
- criar um commit-base herdado antes de movimentar pastas;
- consolidar skill, desktop, recipes e documentação em diretórios explícitos;
- criar um segundo commit somente estrutural;
- decidir o que será publicado no remoto;
- mapear testes e capacidades reais.

Não alterar comportamento, identidade interna ou contratos do produto nesta fase. O procedimento detalhado está em [GUIA-ORGANIZACAO-REPOSITORIO.md](GUIA-ORGANIZACAO-REPOSITORIO.md).

### Fase 0.5 — Recuperação do baseline técnico

Objetivo: tornar o Cena Raiz Desktop novamente verificável antes de introduzir contratos novos.

- corrigir identificadores TypeScript inválidos criados por substituição mecânica;
- recuperar `npm run typecheck`;
- rodar os testes existentes de timeline, mídia, helpers e J-Cut;
- abrir o aplicativo em desenvolvimento;
- registrar falhas herdadas separadamente de regressões;
- preservar protocolos, storage, autenticação, update e bundle ID.

### Fase 0.75 — Bootstrap mínimo do Raiz Engine

Objetivo: permitir que a construção continue em outra máquina sem depender de
memória manual ou da configuração atual.

- inventariar e testar o comportamento real do instalador herdado;
- definir a matriz inicial como Windows 11 x64;
- criar o manifest canônico da toolchain e o perfil `developer`;
- adaptar as garantias úteis do instalador herdado para o namespace próprio;
- instalar e verificar Git, `gh`, SSH, Node, `uv`/Python e FFmpeg;
- instalar dependências a partir dos locks existentes;
- oferecer um comando `doctor` que não altere a máquina;
- validar instalação, repetição, reparo e falha parcial numa máquina virtual limpa;
- publicar URL estável somente depois que o payload próprio estiver no remoto.

### Fase 1 — Contrato de direção

Objetivo: inserir `AudiovisualDirectionPlan` sem introduzir nova decisão de IA.

- criar schema e validator;
- converter `ProjectStyleState` para o plano;
- persistir e carregar o plano;
- compilar o plano para o fluxo atual;
- manter resultado visual compatível.

### Fase 2 — Brand Runtime Profile

Objetivo: ligar `marca-raiz-prisma` ao produto sem despejar o kernel inteiro no contexto.

- definir `BrandRuntimeProfile`;
- compilar voz, visual, motion, som, audiência e restrições;
- versionar e registrar proveniência;
- permitir revisão humana do perfil;
- associar o perfil ao projeto de vídeo.

### Fase 3 — Direction MVP

Objetivo: provar direção audiovisual diferenciada usando apenas o motor atual.

- escolher um vídeo vertical talking-head;
- produzir `NarrativePlan` e `SceneDirection[]`;
- sugerir texto, imagem, silêncio, ritmo e motion por função;
- revisar o plano antes da execução;
- compilar para Remotion e FFmpeg existentes.

### Fase 4 — Asset Registry

Objetivo: reutilizar antes de gerar.

- registrar 5–10 componentes Remotion existentes;
- registrar imagens, overlays, sons e recipes relevantes;
- gerar thumbnail e preview;
- filtrar por marca, função, formato e duração;
- devolver poucos candidatos ao planner;
- bloquear incompatibilidades.

### Fase 5 — Creative Memory e avaliações

Objetivo: aprender sem transformar chat em banco de dados.

- registrar aprovações e rejeições;
- registrar parâmetros corrigidos;
- distinguir preferência da marca, do usuário e do projeto;
- criar dataset de comparação entre plano e resultado;
- medir consistência, retrabalho, reuso, custo e tempo.

### Fase 6 — Execution Router

Objetivo: escolher engines de forma determinística.

- FFmpeg para mídia e áudio determinísticos;
- Remotion para layouts e motion registrado;
- `raiz-Images` para assets ausentes;
- fallback explícito;
- capability probe e custo antes da execução.

### Fase 7 — Adobe controlado

Objetivo: ampliar acabamento depois de a direção funcionar.

- adapter de After Effects para assets registrados;
- adapter de Premiere para handoff e finishing;
- duplicação obrigatória de projetos, sequências e composições;
- idempotência, readback, validação e recuperação;
- sincronização de volta apenas depois de one-way handoff confiável.

## 16. MVP estratégico

O primeiro MVP não é controlar o After Effects.

É responder a esta pergunta:

> Duas marcas diferentes, aplicadas a conteúdos semelhantes, produzem decisões narrativas, editoriais, visuais e sonoras perceptivelmente diferentes, coerentes e repetíveis?

### Recorte

- uma marca real com `BrandRuntimeProfile` revisado;
- um vídeo vertical de uma pessoa falando;
- uma transcrição e timeline já suportadas pelo Cena Raiz;
- um `AudiovisualDirectionPlan` revisável;
- cinco assets Remotion registrados;
- execução com FFmpeg e Remotion;
- correções persistidas como memória estruturada.

### Sucesso

- o plano passa no schema sem correção manual técnica;
- toda sugestão de cena declara sua função;
- assets são escolhidos por ID e parâmetros;
- nenhuma instrução exige inventar um campo de execução;
- o usuário percebe coerência com a marca;
- uma revisão não exige reanalisar mídia inalterada;
- o resultado pode ser reproduzido com as mesmas versões de entrada;
- o motor atual continua funcional sem a nova direção.

## 17. Creative Memory

Uma entrada de memória deve representar uma decisão reutilizável:

```ts
export interface CreativeMemoryEntry {
  schemaVersion: '1.0';
  memoryId: string;
  brandId: string;
  scope: 'brand' | 'format' | 'project' | 'asset';
  subject: string;
  decision: 'approved' | 'rejected' | 'adjusted' | 'measured';
  context: Record<string, string | number | boolean>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  evidence?: string[];
  createdAt: string;
}
```

Regras:

- não transformar uma preferência isolada em regra universal;
- permitir expiração ou substituição;
- registrar quem decidiu;
- separar resultado criativo de saúde técnica;
- nunca armazenar segredos ou prompts completos sem necessidade.

## 18. Asset Registry

Cada asset executável precisa de:

- identificador estável;
- versão e fingerprint;
- engine;
- função criativa;
- formatos e durações compatíveis;
- parâmetros permitidos;
- restrições de texto, mídia, fontes e plugins;
- tags de marca e traits;
- preview e thumbnail;
- proveniência e direitos de uso;
- fallback;
- adapter ou script responsável pela execução.

O modelo deve pesquisar o catálogo e receber poucos candidatos. Ele não deve ler todos os componentes, projetos `.aep`, templates ou códigos para escolher um asset.

## 19. Segurança e confiabilidade

- arquivos originais de mídia permanecem imutáveis;
- projetos Adobe originais permanecem imutáveis;
- caminhos são resolvidos e validados antes da execução;
- operações externas usam allowlists;
- jobs possuem ID e são idempotentes;
- estados intermediários são persistidos;
- falhas não sobrescrevem o último resultado aprovado;
- cada motor possui timeout, cancelamento e classificação de erro;
- o sistema faz readback quando a execução ocorre fora do seu processo;
- prompts e modelos são versionados como dependências;
- adapters removem semântica específica de providers do domínio;
- ações destrutivas ou de custo relevante continuam sob aprovação explícita.
- o bootstrap nunca inclui segredos no manifest, em logs ou em arquivos versionados;
- downloads de toolchain e runtimes são verificados antes da execução;
- autenticações interativas são feitas pelos clientes oficiais, não simuladas pelo instalador.

## 20. Decisões já fixadas

- preservar o Cena Raiz como base operacional;
- manter um único repositório Git principal para o código próprio;
- tratar a skill e o desktop como componentes diferentes do monorepositório;
- construir o `Raiz Engine` como núcleo compartilhado, não como simples renomeação de um dos componentes herdados;
- manter uma única implementação funcional por responsabilidade; o Git preserva versões antigas e o repositório ativo não mantém cópias de backup;
- manter uma única timeline canônica;
- criar direção antes de aprofundar Adobe;
- usar contratos estruturados entre IA e execução;
- reutilizar assets antes de gerar novos;
- manter engines substituíveis;
- começar como monólito modular local;
- validar o core com vídeo vertical antes de generalizar;
- preservar revisão humana e edição não destrutiva.
- tratar instalação reproduzível em máquina nova como capacidade obrigatória do produto;
- manter um manifest canônico e uma lógica compartilhada de bootstrap, sem instaladores concorrentes;
- separar instalação de desenvolvimento da distribuição do aplicativo, mesmo quando ambas começam pelo mesmo bootstrap.

## 21. Hipóteses ainda abertas

- linguagem de implementação do `core` do Raiz Engine fora do Cena Raiz Desktop;
- formato definitivo do `BrandRuntimeProfile`;
- quando um plano se torna aprovado automaticamente;
- como reconciliar mudanças humanas feitas fora do Cena Raiz;
- banco de dados futuro do Asset Registry;
- políticas de aprendizado a partir de desempenho real;
- limites de distribuição de assets e plugins de terceiros;
- nível de compatibilidade com OpenTimelineIO;
- capacidades reais e estabilidade dos MCPs Adobe instalados.
- matriz futura de sistemas operacionais, arquiteturas, GPUs e aceleração local;
- quais modelos e assets grandes serão baixados sob demanda em vez de acompanharem o pacote;
- formato final de distribuição do perfil `creator` e política de assinatura de builds.

Essas escolhas não bloqueiam a Fase 1, mas a Fase 0 e a recuperação do baseline técnico precisam terminar primeiro.

## 22. Próxima ação recomendada

A sequência segura é:

1. executar somente o inventário descrito na Etapa 1 do guia de organização;
2. criar backup e consolidar a fronteira Git depois de aprovação;
3. criar o baseline herdado e o commit exclusivamente estrutural;
4. recuperar o typecheck e os testes do Cena Raiz Desktop;
5. definir o manifest da toolchain e validar o perfil `developer` numa máquina limpa;
6. implementar somente o `AudiovisualDirectionPlan v1`;
7. persistir o plano sem mudar o render atual;
8. validar o round-trip num projeto real;
9. só então conectar o `BrandRuntimeProfile` e o planner.

O primeiro lote de trabalho é somente inventário. Ele não deve mover arquivos, remover `.git`, renomear código, instalar dependências ou incluir Adobe, Asset Registry, memória ou interface nova.

## 23. Definição de pronto do Motor Criativo Raiz

O motor estará consolidado quando:

- conhecimento de marca for compilado em perfis versionados;
- intenção virar planos narrativos e audiovisuais estruturados;
- assets forem pesquisados e selecionados por manifesto;
- execução for compilada para motores substituíveis;
- a timeline e o estado canônico permanecerem recuperáveis;
- o usuário puder revisar, aprovar, rejeitar, corrigir e desfazer;
- correções relevantes virarem memória estruturada;
- qualidade criativa e saúde técnica forem avaliadas separadamente;
- o mesmo núcleo puder alimentar vídeo, imagem, carrossel e recipes especializadas;
- a identidade da marca produzir diferenças perceptíveis e consistentes nas decisões criativas;
- uma máquina suportada puder instalar, verificar, reparar e atualizar o sistema sem depender da configuração desta estação.

---

Este documento descreve o destino e a ordem de evolução. Cada fase deve começar por evidência do sistema real e terminar com uma capacidade observável, testada e reversível.
