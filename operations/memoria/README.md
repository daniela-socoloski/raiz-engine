# Memória base do Claude Code

`DOUTRINA-ENGENHARIA-TRANSVERSAL.md`, na raiz do repositório, é a memória base de
método, limites e autoridade. Ela vale para qualquer sistema da proprietária, não
só para o `raiz-engine`.

Existem dois pontos de carregamento, e nenhum deles copia o conteúdo:

| Alcance | Como carrega |
|---|---|
| Só este repositório | `CLAUDE.md` na raiz importa a doutrina. Nada a instalar. |
| Todo projeto aberto no Claude Code | Os scripts desta pasta inserem uma linha de import em `~/.claude/CLAUDE.md`. |

## Instalar

Windows:

```powershell
.\operations\memoria\instalar-doutrina.ps1
```

macOS e Linux:

```sh
./operations/memoria/instalar-doutrina.sh
```

Depois, abra uma nova sessão do Claude Code. Confirme com `/memory`: a doutrina
aparece como arquivo importado pela memória do usuário.

## Verificar e remover

```sh
./operations/memoria/instalar-doutrina.sh --verificar
./operations/memoria/instalar-doutrina.sh --remover
```

Em PowerShell, `-Verificar` e `-Remover`.

## Comportamento

- O import aponta para o caminho absoluto do clone nesta máquina. Se o
  repositório mudar de lugar, rode o instalador de novo.
- Só o bloco entre os marcadores `raiz-engine:doutrina:*` é escrito. O resto de
  `~/.claude/CLAUDE.md` é preservado, e reinstalar não acumula blocos.
- O caminho absoluto vive na máquina, nunca no repositório: `~/.claude/CLAUDE.md`
  não é versionado aqui.
- Editar a doutrina afeta todas as sessões. É mudança de governança, classe
  `APPROVAL` (§ 6 e § 17 da doutrina).

## Estado de verificação

| Script | Verificação |
|---|---|
| `instalar-doutrina.sh` | executado: instalar, reinstalar, verificar, remover, destino inexistente e preservação de conteúdo anterior |
| `instalar-doutrina.ps1` | **não executado** — não há PowerShell no ambiente onde foi escrito. Rodar `-Verificar` antes do primeiro uso real em Windows |
