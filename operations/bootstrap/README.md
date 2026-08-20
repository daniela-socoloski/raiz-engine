# Bootstrap do Raiz Engine

Implementação inicial da **Fase 0 — Install & Runtime Foundation**. A entrada
`install.ps1` prepara o seed mínimo de uma máquina Windows, autentica pelo GitHub
CLI, obtém o repositório privado e transfere o controle para o bootstrap canônico
do checkout.

Esta pasta é a única fonte funcional da instalação de desenvolvimento e do
`doctor`. O roadmap e os critérios de conclusão da Fase 0 ficam em
[`ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md`](../../ARQUITETURA-MOTOR-CRIATIVO-RAIZ.md#fase-0--install--runtime-foundation).

## Os dois perfis

| Perfil | Para quem | Como |
|---|---|---|
| `developer` | quem constrói e evolui o Raiz Engine | `install.ps1` → `raiz-bootstrap.ps1` |
| `creator` | quem apenas usa o aplicativo | `CenaRaizSetup.exe` — **ainda não construído** |

O perfil `creator` está **registrado, não implementado**. O bootstrap reconhece o
parâmetro e explica que a máquina do usuário final não passa por aqui: ela recebe
um instalador que não exige Git, VS Code nem Node.

## Uso

```powershell
# primeira entrada no Windows 11, executada a partir de uma cópia local do launcher
powershell.exe -NoProfile -ExecutionPolicy Bypass -File install.ps1 -Path C:\work

# simular a entrada completa sem alterar a máquina
powershell.exe -NoProfile -ExecutionPolicy Bypass -File install.ps1 -Path C:\work -DryRun

# dentro de um checkout já existente, preparar a máquina inteira
pwsh -File operations/bootstrap/raiz-bootstrap.ps1

# ver o que faria, sem instalar nem clonar
pwsh -File operations/bootstrap/raiz-bootstrap.ps1 -DryRun

# sem baixar os 398 MB do corpus de marcas
pwsh -File operations/bootstrap/raiz-bootstrap.ps1 -SkipCorpus

# só verificar, nunca alterar
pwsh -File operations/bootstrap/raiz-doctor.ps1
```

## O que o bootstrap faz

```text
Windows limpo
→ install.ps1 instala o seed: Git, Git LFS, gh e PowerShell 7
→ gh auth login
→ clone de daniela-socoloski/raiz-engine
→ raiz-bootstrap.ps1 lê toolchain.json
→ winget instala ou valida Node, uv, Python 3.12 e demais ferramentas
→ git lfs pull            (o corpus, se não for -SkipCorpus)
→ npm install             (desktop)
→ uv sync                 (skill)
→ raiz doctor
```

**Idempotente:** rodar de novo não quebra nada, apenas completa o que falta.

**Retomável:** se parar no meio, rode outra vez.

**Nada em silêncio:** cada passo declara o que vai fazer antes de fazer.

## O `doctor`

`raiz-doctor.ps1` é **somente leitura**. Não instala, não altera, não baixa.

| Saída | Significado |
|---|---|
| `0` | ambiente pronto |
| `1` | falta ferramenta obrigatória ou versão abaixo do mínimo |
| `2` | manifesto ausente ou ilegível |

Cada verificação roda isolada com limite de 10 segundos: ferramenta ausente ou
atalho da Microsoft Store não pode pendurar o diagnóstico.

## O manifesto

`toolchain.json` é a **fonte única de versões**. O bootstrap e o doctor leem dali;
nenhum dos dois carrega versão de toolchain embutida no código.

O launcher possui apenas uma allowlist de seed — os IDs de Git, Git LFS e GitHub
CLI — porque ainda não consegue ler o manifest privado antes de autenticar e
clonar. Ele não decide versões nem dependências do produto. Essa exceção deve
desaparecer somente se existir um launcher próprio, assinado e publicamente
verificável.

Alterar uma versão suportada significa editar o manifesto, não os scripts.

## Três armadilhas que o doctor detecta

**Git LFS ausente.** O corpus de marcas é versionado por LFS. Sem ele o clone traz
arquivos de poucas linhas com o nome certo — não as imagens. Ferramenta que abrir
esse ponteiro esperando um JPEG falha de forma confusa.

**Python novo demais.** A skill exige `>=3.10, <3.14`. Python 3.14 no PATH faz o
`uv sync` procurar outro interpretador ou falhar. O doctor avisa antes.

**Atalho da Microsoft Store.** No Windows, `python` pode resolver para um stub que
abre a loja e bloqueia. O doctor identifica e diz como desativar.

## Limites conhecidos

Os caminhos canônicos dos componentes são `apps/cena-raiz-desktop/` e
`skills/cena-raiz/`. O bootstrap e o `doctor` leem os dois exclusivamente de
`toolchain.json`.

O bootstrap ainda não cobre: instalação das skills no Codex e Claude Code,
preparação dos runtimes empacotados, build do instalador `creator`, reparo
automático completo, nem validação em VM limpa. Estão na sequência da Fase 0,
depois da consolidação estrutural.

O repositório é privado. Portanto, uma URL `raw.githubusercontent.com` anônima
não é uma entrada funcional para máquina limpa. O `install.ps1` existe e pode ser
testado localmente, mas seu canal oficial de entrega ainda precisa ser publicado
com checksum ou assinatura. Não anunciar um comando remoto antes disso.

### Evidência local de 2026-08-20

- scripts e manifest passam no parser;
- `raiz-bootstrap.ps1 -DryRun` reutiliza o checkout atual, sem criar
  `raiz-engine/raiz-engine`;
- `raiz-doctor.ps1` detecta as ferramentas desta estação;
- dependências ausentes de qualquer componente do perfil agora tornam o veredito
  incompleto, em vez de produzir falso “Ambiente pronto”.

## Adobe e MCPs locais

After Effects, Premiere Pro e seus MCPs são capacidades opcionais da máquina de
desenvolvimento; não podem bloquear a instalação básica do Raiz Engine.

O snapshot verificado desta máquina, os repositórios de origem, as revisões e o
contrato de caminhos portáteis ficam exclusivamente em
[`cena-raiz-audiovisual-evolution.md`](../../docs/architecture/cena-raiz-audiovisual-evolution.md)
§ 8.2. Este README não repete os endereços para não criar uma segunda fonte.

O bootstrap atual ainda não instala nem registra esses MCPs. Quando essa capacidade
for implementada, deverá resolver os caminhos da máquina, preservar instalações
existentes, gerar configurações locais para Codex e Claude Code e validar primeiro
operações somente de leitura.
