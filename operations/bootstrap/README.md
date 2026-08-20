# Bootstrap do Raiz Engine

Entrada única e oficial que transforma uma máquina Windows limpa em ambiente Raiz
funcional.

## Os dois perfis

| Perfil | Para quem | Como |
|---|---|---|
| `developer` | quem constrói e evolui o Raiz Engine | `raiz-bootstrap.ps1` |
| `creator` | quem apenas usa o aplicativo | `CenaRaizSetup.exe` — **ainda não construído** |

O perfil `creator` está **registrado, não implementado**. O bootstrap reconhece o
parâmetro e explica que a máquina do usuário final não passa por aqui: ela recebe
um instalador que não exige Git, VS Code nem Node.

## Uso

```powershell
# preparar a máquina inteira
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
→ winget instala Git, Git LFS, gh, Node, uv, Python 3.12
→ gh auth login
→ clone de daniela-socoloski/raiz-engine
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
nenhum dos dois carrega versão embutida no código.

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

Os caminhos dos componentes em `toolchain.json` apontam para a estrutura herdada
(`cena-raiz/cenaraiz/...`). Mudam na Etapa 6, quando virarem `apps/` e `skills/`.

O bootstrap ainda não cobre: instalação das skills nos agentes, preparação dos
runtimes empacotados, nem a build do instalador. Estão na sequência, depois da
consolidação estrutural.

## Adobe e MCPs locais

After Effects, Premiere Pro e seus MCPs são capacidades opcionais da máquina de
desenvolvimento; não podem bloquear a instalação básica do Raiz Engine.

O snapshot verificado desta máquina, os repositórios de origem, as revisões e o
contrato de caminhos portáteis ficam exclusivamente em
[`PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md`](../../cena-raiz/cenaraiz/PLANO-EVOLUCAO-AUDIOVISUAL-CENA-RAIZ.md)
§ 8.2. Este README não repete os endereços para não criar uma segunda fonte.

O bootstrap atual ainda não instala nem registra esses MCPs. Quando essa capacidade
for implementada, deverá resolver os caminhos da máquina, preservar instalações
existentes, gerar configurações locais para Codex e Claude Code e validar primeiro
operações somente de leitura.
