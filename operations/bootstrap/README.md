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
| `creator` | quem apenas usa o aplicativo | diretório `out/creator/win32-x64/` com Setup, `RELEASES` e `.nupkg` |

O perfil `creator` está implementado e verificado localmente. O `Setup.exe` tem
aproximadamente 0,5 MB porque é somente o bootstrap do Squirrel: ele **não** é o
produto inteiro. A unidade distribuível é o diretório completo, cujo `.nupkg`
contém aplicativo e runtimes. A máquina do usuário final não exige Git, VS Code,
Node, Python nem FFmpeg no PATH.

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

# construir o creator completo, sem publicar
pwsh -File operations/bootstrap/build-creator.ps1

# repetir apenas a embalagem quando os runtimes já foram preparados
pwsh -File operations/bootstrap/build-creator.ps1 -Prepared

# verificar o diretório creator existente
pwsh -File operations/bootstrap/raiz-doctor.ps1 -Profile creator
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
→ npm ci                  (desktop, reproduzido pelo `package-lock.json`)
→ uv sync --frozen        (skill, reproduzida pelo `uv.lock`)
→ instala cena-raiz + Remotion em Codex e Claude Code a partir do checkout
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

**Python novo demais.** A skill exige `>=3.10, <3.14`. O manifest verifica
explicitamente `py -3.12`, então um Python 3.14 padrão pode coexistir sem virar
falso bloqueio; o ambiente da skill continua fixado pelo `uv.lock`.

**Atalho da Microsoft Store.** No Windows, `python` pode resolver para um stub que
abre a loja e bloqueia. O doctor identifica e diz como desativar.

## Limites conhecidos

Os caminhos canônicos dos componentes são `apps/cena-raiz-desktop/` e
`skills/cena-raiz/`. O bootstrap e o `doctor` leem os dois exclusivamente de
`toolchain.json`.

O bootstrap cobre dependências, corpus opcional, desktop, skill e instalação das
skills em Codex e Claude Code. O build creator prepara e incorpora os runtimes,
gera o diretório Squirrel, valida hashes e abre o aplicativo empacotado por um
hook de QA sem capturar conteúdo sensível.

Os comandos `make:signed`, `publish:update` e `publish:runtimes` usam o wrapper
Node `scripts/with-signing-env.mjs`; Bash deixou de ser dependência no Windows.
Isso não os autoriza: assinatura e publicação continuam bloqueadas até existirem
credenciais, destino próprio verificado e autorização humana específica.

Ainda não estão comprovados o instalador em Windows limpo, repetição, reparo,
falha parcial, assinatura, launcher oficial, canal próprio de update e rollback.
Esses são os gates restantes da Fase 0.

O repositório é privado. Portanto, uma URL `raw.githubusercontent.com` anônima
não é uma entrada funcional para máquina limpa. O `install.ps1` existe e pode ser
testado localmente, mas seu canal oficial de entrega ainda precisa ser publicado
com checksum ou assinatura. Não anunciar um comando remoto antes disso.

### Evidência local de 2026-08-20

- scripts, manifest e workflow raiz passam no parser;
- `raiz-bootstrap.ps1 -DryRun` reutiliza o checkout atual, sem criar
  `raiz-engine/raiz-engine`;
- `raiz-doctor.ps1 -Profile developer` termina com “Ambiente pronto” nesta estação;
- cena-raiz e `remotion-best-practices` estão instaladas para Codex e Claude Code;
- o creator autônomo contém oito entradas obrigatórias de runtime;
- o smoke confirma uma superfície React real (`member-gate` ou `studio-shell`),
  raiz montada e viewport válida; uma captura preta não conta como sucesso;
- `out/creator/win32-x64/` contém Setup, `RELEASES`, `.nupkg`, checksums,
  relatório de build, instruções e relatório de smoke;
- `.github/workflows/windows-creator.yml` reconstrói e anexa exatamente esse
  diretório, sem release e sem publicação externa.

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
